#!/usr/bin/env node
//
//  assemble.mjs — the deployable site directory: `dsx build`'s output plus the compile
//  step's public artifacts (nav, search index, md siblings, llms.txt), one tree the
//  Workers assets upload (or any static host) serves whole.
//

import { cpSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { createHash } from "node:crypto";

import { extractSharedStylesheet } from "@despia-native/cli";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const pub = join(root, "public");

if (!existsSync(dist)) {
  console.error("[docs.assemble] no dist/ — run `dsx build` first");
  process.exit(1);
}

// The shared system stylesheet: SSR inlines the complete layer stack into every page (right
// for a single app shell), which on a 90+ route static site means the same ~290KB repeated on
// every document. extractSharedStylesheet (from @despia-native/cli, the same code the despia
// package registry site already runs) pulls it into ONE cached site.css and rewrites every
// page to a <link>, before the public/ artifacts and docs.js are folded in below.
const cssResult = extractSharedStylesheet(dist);
console.log(`[docs.assemble] site.css extracted: ${cssResult.cssBytes} byte(s), ` +
  `${cssResult.blocks} shared block(s), ${cssResult.pages} page(s) relinked`);

for (const name of readdirSync(pub)) {
  cpSync(join(pub, name), join(dist, name), { recursive: true });
}

// The docs enhancement layer (public/docs.js: anchor ids, scroll-spy, search keys,
// aria-current) rides every exported page as a deferred script. Injected here, at the
// deployable-tree seam, so the SSR pipeline stays generic.
// Also at this seam: the per-page <link rel="canonical"> (from public/canonical.json, which the
// compiler writes: every page canonical at docs.despia.com, the promoted /migrate/guide at its
// modern original) and the markdown alternate. The route table has no per-route head rows yet
// (a framework gap, recorded in evidence/web-launch/STATUS.md), so the stamp lands here, on the
// same deployable-tree pass as docs.js.
const canonicalFile = join(pub, "canonical.json");
const canonical = existsSync(canonicalFile) ? JSON.parse(readFileSync(canonicalFile, "utf8")) : {};
// structured data per page (public/jsonld.json, written by site/dsx-compile.mjs for the package pages): one
// <script type="application/ld+json"> in the head, its "<" escaped so the JSON can never close the element
const jsonLdFile = join(pub, "jsonld.json");
const jsonLd = existsSync(jsonLdFile) ? JSON.parse(readFileSync(jsonLdFile, "utf8")) : {};
// A strict Content-Security-Policy per page (PLAN-O O3): every inline <script> the SSR wrote is
// allowed by its own sha256, nothing else inline runs; scripts from this origin and the Support
// widget origin only; no plugins, no base or form hijack. frame-src admits the v3 pages' YouTube
// embeds. frame-ancestors cannot live in a meta tag: worker/index.ts sends it as a header.
const supportOrigin = (process.env.DOCS_SUPPORT_ORIGIN ?? "https://support.despia.com").replace(/\/+$/, "");
// the Coming soon form posts to the waitlist API (Components/NotifyForm.dsx)
const waitlistOrigin = new URL(process.env.DOCS_WAITLIST_URL ?? "https://api.despia.com/v1/waitlist").origin;
function cspFor(html) {
  const hashes = new Set();
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    if (m[1].trim() === "") continue;
    hashes.add(`'sha256-${createHash("sha256").update(m[1], "utf8").digest("base64")}'`);
  }
  return [
    "default-src 'self'",
    `script-src 'self' ${supportOrigin} ${[...hashes].join(" ")}`.trim(),
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https:",
    `connect-src 'self' ${supportOrigin} ${waitlistOrigin}`,
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}
const SECTION_NAMES = { dsx: "DSX", packages: "Packages", "web-apps": "Web apps", ship: "Build and ship", convert: "Convert", "app-review": "App Review", releases: "Releases" };
let enhanced = 0;
// the link preview every page shares (public/og.png, rendered by the framework's social-cards tool from a real capture of
// the docs home; spec evidence/docs-site/og/docs-og.json in the workspace)
const OG_IMAGE = "https://despia.com/docs/og.png";
// the framework's after-load start (server page-render.ts bootScript), and the idle start the docs use in its place
const BOOT_ON_LOAD = "const later=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(go,0)));";
const bootWhenIdle = (graph) => `const later=()=>{for(const h of ${JSON.stringify(graph).replace(/</g, "\\u003c")}){const l=document.createElement("link");l.rel="modulepreload";l.href=h;document.head.appendChild(l)}setTimeout(()=>(window.requestIdleCallback||setTimeout)(go,{timeout:2000}),3000)};`;
let idleBoot = 0;
let stamped = 0;
let secured = 0;
const injectDocsScript = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) { injectDocsScript(abs); continue; }
    if (entry.name !== "index.html") continue;
    let html = readFileSync(abs, "utf8");
    const route = "/" + relative(dist, dirname(abs)).split(sep).join("/");
    const key = route === "/" ? "/" : route.replace(/\/$/, "");
    if (canonical[key] !== undefined && !html.includes('rel="canonical"') && html.includes("</head>")) {
      const md = key === "/" ? "/index.md" : `${key}.md`;
      html = html.replace("</head>", `<link rel="canonical" href="${canonical[key]}">\n<link rel="alternate" type="text/markdown" href="${md}">\n</head>`);
      stamped += 1;
    }
    // the Markdown twin, for agents (the SSR head already carries the canonical link, so this is stamped on its own)
    if (canonical[key] !== undefined && !html.includes('type="text/markdown"') && html.includes("</head>")) {
      html = html.replace("</head>", `<link rel="alternate" type="text/markdown" href="${key === "/" ? "/index.md" : `${key}.md`}">\n</head>`);
    }
    // social cards: the SSR head writes og:title, og:description and og:url; the type, the site and the Twitter rows join here
    if (canonical[key] !== undefined && !html.includes('property="og:type"') && html.includes("</head>")) {
      const og = (name) => (html.match(new RegExp(`<meta property="og:${name}" content="([^"]*)"`)) ?? [])[1] ?? "";
      html = html.replace("</head>", [`<meta property="og:type" content="${key === "/" ? "website" : "article"}">`, `<meta property="og:site_name" content="Despia Docs">`,
        `<meta property="og:image" content="${OG_IMAGE}">`, `<meta property="og:image:width" content="1200">`, `<meta property="og:image:height" content="630">`,
        `<meta property="og:image:alt" content="Despia docs. Build and ship your app.">`, `<meta name="twitter:card" content="summary_large_image">`, `<meta name="twitter:image" content="${OG_IMAGE}">`, `<meta name="twitter:title" content="${og("title")}">`, `<meta name="twitter:description" content="${og("description")}">`, "</head>"].join("\n"));
    }
    // structured data: every page is a TechArticle in the docs WebSite with its breadcrumb trail (a package page keeps its own
    // richer TechArticle from public/jsonld.json)
    if (canonical[key] !== undefined && !html.includes('type="application/ld+json"') && html.includes("</head>")) {
      const og = (name) => (html.match(new RegExp(`<meta property="og:${name}" content="([^"]*)"`)) ?? [])[1] ?? "";
      const home = canonical["/"] ?? canonical[key].replace(/\/[^/]*$/, "");
      const seg = key.split("/").filter(Boolean);
      const crumbs = [{ name: "Docs", url: home }];
      if (seg.length > 1 && canonical[`/${seg[0]}`] !== undefined) crumbs.push({ name: SECTION_NAMES[seg[0]] ?? seg[0], url: canonical[`/${seg[0]}`] });
      if (key !== "/") crumbs.push({ name: og("title") || key, url: canonical[key] });
      const article = jsonLd[key] ?? { "@type": key === "/" ? "WebPage" : "TechArticle", headline: og("title"), description: og("description"), url: canonical[key], inLanguage: "en",
        isPartOf: { "@type": "WebSite", name: "Despia Docs", url: home }, publisher: { "@type": "Organization", name: "Despia", url: "https://despia.com" } };
      const { "@context": _, ...main } = article;
      const doc = { "@context": "https://schema.org", "@graph": [main, { "@type": "BreadcrumbList", itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })) }] };
      html = html.replace("</head>", `<script type="application/ld+json">${JSON.stringify(doc).replace(/</g, "\\u003c")}</script>\n</head>`);
    }
    // a docs page reads without its runtime. Its module graph is not preloaded by the head, so the page's own bytes (HTML,
    // CSS, the body font) have the connection to themselves until the page is drawn; once it has loaded the graph is
    // preloaded, and the runtime starts on the reader's first press or key (the framework's own early start) or once the
    // page has been idle a few seconds. The registry slice rows stay: they are how the boot reads this page's slice.
    const graph = [...html.matchAll(/<link rel="modulepreload" href="([^"]+)"[^>]*>/g)].map((m) => m[1]);
    html = html.replace(/<link rel="modulepreload"[^>]*>\n?/g, "");
    if (html.includes(BOOT_ON_LOAD)) { html = html.replace(BOOT_ON_LOAD, bootWhenIdle(graph)); idleBoot += 1; }
    if (!html.includes("/docs.js") && html.includes("</body>")) {
      html = html.replace("</body>", `<script defer src="/docs.js"></script>\n</body>`);
      enhanced += 1;
    }
    if (!html.includes('http-equiv="Content-Security-Policy"') && html.includes('<meta charset="utf-8">')) {
      html = html.replace('<meta charset="utf-8">', `<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="${cspFor(html)}">`);
      secured += 1;
    }
    writeFileSync(abs, html);
  }
};
injectDocsScript(dist);
if (idleBoot === 0) throw new Error("[docs.assemble] no page carries the framework's after-load start: the idle start was not applied (did page-render bootScript change?)");
console.log(`[docs.assemble] public/ artifacts folded into dist/ — one servable tree (${enhanced} page(s) carry docs.js, ${stamped} canonical + markdown alternate, ${secured} strict CSP)`);

