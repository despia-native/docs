//
//  worker/index.ts — the docs site's Cloudflare Worker: the SAME stack the documentation
//  documents (v0-live-plan W7 runs on W1+W2+W3 by construction). Three faces, one worker:
//    · the SITE — Workers Static Assets serve the built tree; dynamic routes fall through
//      to the platform-free page handler (SSR); createWorkersHandler chains them,
//    · the docs handlers (search, page fetch, sections) the site's own pages and the console's docs
//      panel call; the retrieval core is worker/search.ts (hybrid, cached, lexical fast path).
//      There is NO MCP server here (owner 2026-10-10): agents use the general Despia MCP at
//      https://mcp.despia.com/mcp, whose docs tools read this build's docs-index.json export;
//      /mcp on this host 301s there (redirects/v2-moves.json).
//  The docs are Despia V4 only (the V4 pages, App Review, Releases); an old docs path asked of this host 301s once to
//  its V4 page (redirects/docs-root.json).
//
//  The search index and the nav model are BUILD ARTIFACTS imported into the bundle (the
//  worker deploys after `npm run build`, so wrangler inlines the exact tree it serves);
//  page markdown is read through the assets binding at call time — same bytes the /md/
//  routes serve, never a second copy.
//

import { createWorkersHandler, type WorkersEnv, type WorkersExecutionContext } from "@despia-native/server/bootloader-workers";

import registry from "../dist/registry.json";
import searchIndex from "../public/search-index.json";
import nav from "../public/nav.json";
import knowledge from "../public/knowledge/version.json";
import appReview from "../public/app-review.json";
import integrations from "../public/integrations.json";
import versions from "../public/versions.json";
import rootRedirects from "../redirects/docs-root.json";
import siteCfg from "../data/site.json";

//  WHERE THE DOCS LIVE (owner 2026-10-10): https://despia.com/docs. This worker answers under BASE; the app inside it
//  is root-relative, so a request's BASE is taken off before the tables and the site handler see it, and put back on
//  every redirect it answers. The old host docs.despia.com 301s every path to the same page under BASE.
//  NOTHING IS DEPLOYED and despia.com is not touched until the owner says go (owner hard rule).
const BASE = siteCfg.base.replace(/\/+$/, "");
const SITE = `${siteCfg.origin}${BASE}`;
import { createTools, SPACES, type Cache, type IndexPage, type VectorHit } from "./search.ts";

interface AssetsBinding { fetch(request: Request): Promise<Response> }

//  The assets binding, captured per isolate at the first event: tool handlers run inside
//  the host (which is platform-free and passes only string env), so the one platform
//  object they need is held here at the boundary — the same posture every bootloader takes.
let assets: AssetsBinding | null = null;
let supportOrigin = "https://support.despia.com";
let siteOrigin = "https://despia.com";

type Space = (typeof SPACES)[number];
function spaceArg(args: Record<string, unknown>): Space | "all" {
  const raw = typeof args["space"] === "string" ? args["space"].toLowerCase() : "all";
  return (SPACES as readonly string[]).includes(raw) ? raw as Space : "all";
}

//  The edge cache (Cloudflare's per-colo HTTP cache), keyed by tool + normalised arguments +
//  the content version, so a publish never serves a stale answer and nothing needs purging.
const edgeCache: Cache = {
  async get(key) {
    const c = (globalThis as unknown as { caches?: { default?: { match(r: Request): Promise<Response | undefined> } } }).caches?.default;
    if (c === undefined) return undefined;
    const hit = await c.match(new Request(`https://docs-mcp.cache/${encodeURIComponent(key)}`));
    return hit === undefined ? undefined : await hit.json();
  },
  async put(key, value) {
    const c = (globalThis as unknown as { caches?: { default?: { put(r: Request, res: Response): Promise<void> } } }).caches?.default;
    if (c === undefined) return;
    await c.put(new Request(`https://docs-mcp.cache/${encodeURIComponent(key)}`),
      new Response(JSON.stringify(value), { headers: { "content-type": "application/json", "cache-control": "public, max-age=86400" } }));
  },
};

async function supportSearch(q: string, space: string, limit: number, extra: Record<string, string> = {}): Promise<VectorHit[]> {
  const params = new URLSearchParams({ q, limit: String(limit), ...(space !== "all" ? { space } : {}), ...extra });
  const res = await fetch(`${supportOrigin}/v1/search?${params}`, { signal: AbortSignal.timeout(1500) });
  if (!res.ok) return [];
  const body = await res.json() as { hits?: VectorHit[] };
  return body.hits ?? [];
}
let improvementsMemo: { at: number; rows: Array<Record<string, unknown>> } | null = null;

const tools = createTools({
  site: SITE,
  version: versions.latest,
  contentVersion: knowledge.contentVersion,
  pages: searchIndex.pages as IndexPage[],
  appReview: appReview as never,
  troubleshooting: { articles: [] },
  integrations: integrations as never,
  vector: (q, space, limit) => supportSearch(q, space, limit),
  resolutions: (q, filters, limit) => supportSearch(q, "resolutions", limit, filters),
  improvements: async () => {
    if (improvementsMemo !== null && Date.now() - improvementsMemo.at < 300_000) return improvementsMemo.rows;
    const res = await fetch(`${siteOrigin}/improvements.json`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) throw new Error(String(res.status));
    const body = await res.json() as { entries?: Array<Record<string, unknown>> };
    improvementsMemo = { at: Date.now(), rows: body.entries ?? [] };
    return improvementsMemo.rows;
  },
  cache: edgeCache,
});

async function fetchPage(args: Record<string, unknown>) {
  let route = typeof args["route"] === "string" ? args["route"] : "/";
  // a space-relative route (space: legacy, route: /introduction) resolves inside the space
  const space = spaceArg(args);
  const prefix = space === "all" || space === "modern" ? "" : `/${space}`;
  if (prefix !== "" && route !== prefix && !route.startsWith(`${prefix}/`)) route = route === "/" ? prefix : `${prefix}${route}`;
  route = route.replace(/^https:\/\/docs\.despia\.com/, "").replace(/\.md$/, "") || "/";
  const mdPath = route === "/" ? "/md/index.md" : `/md${route}.md`;
  if (assets === null) throw new Error("assets binding not captured yet");
  const res = await assets.fetch(new Request(`https://assets.local${mdPath}`));
  if (res.status !== 200) throw { reason: "not_found", message: `no page at ${route}` };
  return { route, url: `${SITE}${route}`, version: versions.latest, markdown: await res.text() };
}

const handler = createWorkersHandler(
  {
    routes: [],
    handlers: {
      docs: {
        docsSearch: (args) => tools.docs_search(args),
        docsFetch: (args) => fetchPage(args),
        resolutionsSearch: (args) => tools.resolutions_search(args),
        appReviewSearch: (args) => tools.app_review_search(args),
        integrationsList: (args) => tools.integrations_list(args),
        integrationGet: (args) => tools.integration_get(args),
        improvementsList: (args) => tools.improvements_list(args),
        improvementsGet: (args) => tools.improvements_get(args),
        search: (args) => tools.search(args),
        listSections: (args) => {
          const space = spaceArg(args);
          return space === "all" ? nav : { space, ...nav.spaces.find((s) => s.id === space) };
        },
        fetchPage: (args) => fetchPage(args),
      },
    },
    buildInfo: { site: "despia-docs" },
  },
  undefined,
  {
    siteRegistry: registry as never,
  },
);

//  The headers a meta tag cannot carry (the per-page CSP itself is stamped into each page by
//  scripts/assemble.mjs, with the sha256 of every inline script).
//  A preview deploy (env NOINDEX = "1", wrangler env `preview`) tells every crawler to stay out:
//  X-Robots-Tag on every response and a robots.txt that disallows everything.
function secure(res: Response, noindex: boolean): Response {
  const type = res.headers.get("content-type") ?? "";
  if (!type.includes("text/html") && !noindex) return res;
  const out = new Response(res.body, res);
  if (noindex) out.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  if (!type.includes("text/html")) return out;
  out.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
  out.headers.set("X-Content-Type-Options", "nosniff");
  out.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  out.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return out;
}

//  Declare once, render everywhere: the console's docs panel (and any other Despia surface) reads
//  the same nav model and markdown siblings this site renders. They are public, credential-free
//  documents, so they answer any origin; pages keep their own rules.
function readable(path: string, res: Response): Response {
  if (!(path === "/nav.json" || path.endsWith(".md"))) return res;
  const out = new Response(res.body, res);
  out.headers.set("Access-Control-Allow-Origin", "*");
  // an agent skill's file (/skills/<name>/SKILL.md, the skills pages' "Download SKILL.md") downloads as a file
  const skill = /^\/skills\/([a-z0-9-]+)\/SKILL\.md$/.exec(path);
  if (skill !== null && res.ok) out.headers.set("Content-Disposition", `attachment; filename="SKILL.md"`);
  return out;
}

//  The docs are an online site: no service worker. The framework's offline worker was served with the site's non-HTML policy
//  (default-src 'none', server site-security.ts), and a worker runs under its own script's policy: every fetch it made was
//  refused, so scripts and styles failed (ERR_FAILED) and, once its caches could not answer, the page itself (iOS Safari:
//  "Not allowed by ContentSecurityPolicy"). This worker
//  replaces it at the same address: it drops every cache and unregisters itself. No fetch handler, so nothing is ever
//  intercepted, and it never navigates a page itself (iOS Safari answered a worker-driven reload with its own "Not allowed
//  by ContentSecurityPolicy" error page): the page a visitor has open keeps working and the next load is plain network.
//  RETIRE_SW = "0" serves the build's own worker file instead (a test deploy that installs the old worker first).
const SW_RETIRE = `self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.map((k) => caches.delete(k)));
  await self.registration.unregister();
})()));
`;

export default {
  fetch(incoming: Request, env: WorkersEnv, ctx: WorkersExecutionContext): Promise<Response> {
    const original = new URL(incoming.url);
    if (original.pathname.endsWith("/dsx-sw.js") && env["RETIRE_SW"] !== "0") {
      return Promise.resolve(new Response(SW_RETIRE, { headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "no-store" } }));
    }
    // the old host: every path to the same page under despia.com/docs (one hop: the root table is applied first)
    if (original.hostname === "docs.despia.com") {
      const path = original.pathname.length > 1 ? original.pathname.replace(/\/+$/, "") : original.pathname;
      const moved = (rootRedirects as Record<string, string>)[path];
      const target = moved === undefined ? `${SITE}${path === "/" ? "" : path}${original.search}` : (/^https?:\/\//.test(moved) ? moved : `${SITE}${moved}${original.search}`);
      return Promise.resolve(Response.redirect(target, incoming.method === "GET" || incoming.method === "HEAD" ? 301 : 308));
    }
    // under BASE: strip it for everything below (a preview host without BASE in the path works unchanged)
    const underBase = BASE !== "" && (original.pathname === BASE || original.pathname.startsWith(`${BASE}/`));
    const url = new URL(original.href);
    if (underBase) url.pathname = original.pathname.slice(BASE.length) || "/";
    const prefix = underBase ? BASE : "";
    const request = underBase ? new Request(url.href, incoming) : incoming;
    const noindex = env["NOINDEX"] === "1";
    if (noindex && url.pathname === "/robots.txt") {
      return Promise.resolve(new Response("User-agent: *\nDisallow: /\n", { headers: { "content-type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex, nofollow" } }));
    }
    const moved = (rootRedirects as Record<string, string>)[url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname];
    // an absolute target leaves the site (/mcp -> the general Despia MCP); 308 for a POST so an MCP client follows with its body
    if (moved !== undefined) {
      const target = /^https?:\/\//.test(moved) ? moved : `${url.origin}${prefix}${moved}${url.search}`;
      return Promise.resolve(Response.redirect(target, request.method === "GET" || request.method === "HEAD" ? 301 : 308));
    }
    if (typeof env["SUPPORT_ORIGIN"] === "string" && env["SUPPORT_ORIGIN"] !== "") supportOrigin = String(env["SUPPORT_ORIGIN"]).replace(/\/+$/, "");
    if (typeof env["SITE_ORIGIN"] === "string" && env["SITE_ORIGIN"] !== "") siteOrigin = String(env["SITE_ORIGIN"]).replace(/\/+$/, "");
    const binding = env["ASSETS"];
    if (assets === null && typeof binding === "object" && binding !== null) assets = binding as AssetsBinding;
    //  THE DSX SECTION'S OWN PAGES (/dsx, /dsx/styling, ...). The site handler takes /dsx off a path before it routes (the
    //  function mount prefix a DSX backend answers under), so every page of the DSX section answered 404 and /dsx the home
    //  page. Those pages are built files in the asset tree: a read of one is served from there as built, before the
    //  handler sees the path; a path under /dsx that is not a built file still goes to the handler.
    if (assets !== null && (request.method === "GET" || request.method === "HEAD") && (url.pathname === "/dsx" || url.pathname.startsWith("/dsx/"))) {
      const page = assets;
      return page.fetch(request).then((res) => res.status === 404
        ? handler.fetch(request, env, ctx).then((r) => readable(url.pathname, secure(r, noindex)))
        : readable(url.pathname, secure(res, noindex)));
    }
    return handler.fetch(request, env, ctx).then((res) => readable(url.pathname, secure(res, noindex)));
  },
  scheduled: handler.scheduled,
};
