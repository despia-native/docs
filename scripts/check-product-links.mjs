#!/usr/bin/env node
//
//  Every docs address the product emits (the CLI, the MCP, the API, the console, the runtime) must land on a real page of
//  this build once the docs are published: the address is followed through the same redirects the docs worker and the
//  setup.despia.com worker answer, and the page it lands on must be in the built route table, with its #fragment as an
//  id on that page.
//
//    node scripts/check-product-links.mjs                 check data/product-links.json against dist/
//    DESPIA_FRAMEWORK=<checkout> node scripts/check-product-links.mjs --sync [--ref origin/dev]
//                                                         re-read the addresses from the framework source, then check
//
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { target as setupTarget } from "../redirects/setup-worker/index.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIST = join(ROOT, "data/product-links.json");
const DIST = join(ROOT, "dist");
const site = JSON.parse(readFileSync(join(ROOT, "data/site.json"), "utf8"));
const BASE = site.base.replace(/\/+$/, "");
const SITE = `${site.origin}${BASE}`;
const rootRedirects = JSON.parse(readFileSync(join(ROOT, "redirects/docs-root.json"), "utf8"));

//  Addresses that are docs pages. Everything else the product names (the console, support, the MCP server) is not this
//  site's to answer.
const DOCS_URL = /https?:\/\/(?:setup\.despia\.com|docs\.despia\.com|(?:www\.)?despia\.com\/docs)(?:\/[A-Za-z0-9/_.#-]*)?/g;
//  Where a framework file is a record rather than something the product says to a person.
const NOT_PRODUCT = [/^evidence\//, /\/evidence\//, /\.md$/, /^ClosedSource\/Documentation\//, /^OpenSource\/Documentation\//,
  /\/test\//, /\/tests\//, /\.test\.[cm]?[jt]s$/, /_test\.rb$/, /\/fixtures?\//, /^lane-reports\//, /\/dist\//, /\.snap$/];

export function sync(framework, ref) {
  const out = execFileSync("git", ["-C", framework, "grep", "-I", "-o", "-E",
    "https?://(setup\\.despia\\.com|docs\\.despia\\.com|(www\\.)?despia\\.com/docs)(/[A-Za-z0-9/_.#-]*)?", ref, "--", ":!evidence", ":!lane-reports", ":!*.md", ":!ClosedSource/Documentation", ":!OpenSource/Documentation"],
    { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  const seen = new Map();
  for (const line of out.split("\n")) {
    const m = /^[^:]+:([^:]+):(.+)$/.exec(line);
    if (m === null) continue;
    const [, file, raw] = m;
    if (NOT_PRODUCT.some((re) => re.test(file))) continue;
    const url = raw.replace(/[.#]+$/, "").replace(/\/+$/, "");
    if (!seen.has(url)) seen.set(url, new Set());
    seen.get(url).add(file);
  }
  const rev = execFileSync("git", ["-C", framework, "rev-parse", "--short=10", ref], { encoding: "utf8" }).trim();
  const links = [...seen].sort(([a], [b]) => a.localeCompare(b)).map(([url, files]) => ({ url, from: [...files].sort() }));
  writeFileSync(LIST, `${JSON.stringify({ _: "Docs addresses the framework source emits, read by scripts/check-product-links.mjs --sync.", framework: rev, links }, null, 1)}\n`);
  return links;
}

//  One address, followed hop by hop the way the deployed workers answer it. Returns the docs path it lands on (BASE
//  stripped, fragment kept apart) or the external address it leaves for.
export function follow(url) {
  const hops = [url];
  let u = new URL(url);
  for (let i = 0; i < 8; i++) {
    if (u.hostname === "setup.despia.com") {
      u = new URL(setupTarget(u.href));
    } else if (u.hostname === "docs.despia.com") {
      const path = u.pathname.length > 1 ? u.pathname.replace(/\/+$/, "") : u.pathname;
      const moved = rootRedirects[path];
      u = new URL(moved === undefined ? `${SITE}${path === "/" ? "" : path}${u.search}${u.hash}`
        : /^https?:\/\//.test(moved) ? moved : `${SITE}${moved}${u.search}${u.hash}`);
    } else if (/^(www\.)?despia\.com$/.test(u.hostname) && (u.pathname === BASE || u.pathname.startsWith(`${BASE}/`))) {
      const inner = u.pathname.slice(BASE.length) || "/";
      const key = inner.length > 1 ? inner.replace(/\/+$/, "") : inner;
      const moved = rootRedirects[key];
      if (moved === undefined) return { hops, path: key, hash: u.hash.slice(1) };
      u = new URL(/^https?:\/\//.test(moved) ? moved : `${SITE}${moved}${u.hash}`);
    } else {
      return { hops, external: u.href };
    }
    if (u.hash === "" && hops.at(-1).includes("#")) u.hash = hops.at(-1).slice(hops.at(-1).indexOf("#"));
    hops.push(u.href);
  }
  return { hops, error: "redirect loop" };
}

function pageHtml(path) {
  for (const f of [join(DIST, path, "index.html"), join(DIST, `${path}.html`), join(DIST, path)]) {
    if (existsSync(f) && !f.endsWith("/")) { try { return readFileSync(f, "utf8"); } catch { /* a directory */ } }
  }
  return null;
}

//  The off-site places a docs address may hand over to on purpose (the MCP install page and the MCP server).
const EXTERNAL_OK = [/^https:\/\/mcp\.despia\.com\//, /^https:\/\/console\.despia\.com\/mcp$/];

export function check(links) {
  const canonical = new Set(Object.keys(JSON.parse(readFileSync(join(DIST, "canonical.json"), "utf8"))));
  const failures = [];
  for (const { url, from } of links) {
    const r = follow(url);
    if (r.error) { failures.push({ url, from, why: r.error, hops: r.hops }); continue; }
    if (r.external !== undefined) {
      if (!EXTERNAL_OK.some((re) => re.test(r.external))) failures.push({ url, from, why: `leaves the docs for ${r.external}`, hops: r.hops });
      continue;
    }
    const page = r.path === "/" ? "/" : r.path;
    const isFile = /\.(md|txt|xml|json)$/.test(page);
    if (isFile ? !existsSync(join(DIST, page)) : !canonical.has(page)) { failures.push({ url, from, why: `no page ${page}`, hops: r.hops }); continue; }
    if (r.hash !== "" && !isFile) {
      const html = pageHtml(page === "/" ? "" : page);
      if (html === null || !html.includes(`id="${r.hash}"`)) failures.push({ url, from, why: `no #${r.hash} on ${page}`, hops: r.hops });
    }
  }
  return failures;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let links;
  if (process.argv.includes("--sync")) {
    const fw = process.env.DESPIA_FRAMEWORK;
    if (!fw) { console.error("--sync needs DESPIA_FRAMEWORK=<framework checkout>"); process.exit(2); }
    const i = process.argv.indexOf("--ref");
    links = sync(fw, i > 0 ? process.argv[i + 1] : "HEAD");
  } else {
    links = JSON.parse(readFileSync(LIST, "utf8")).links;
  }
  if (!existsSync(join(DIST, "canonical.json"))) { console.error("dist/canonical.json is missing: run the build first"); process.exit(2); }
  const failures = check(links);
  for (const f of failures) console.log(`FAIL ${f.url}\n  ${f.why}\n  via ${f.hops.join(" -> ")}\n  from ${f.from.slice(0, 3).join(", ")}${f.from.length > 3 ? ` (+${f.from.length - 3})` : ""}`);
  console.log(`${links.length} product addresses, ${links.length - failures.length} land on a page, ${failures.length} do not`);
  process.exit(failures.length === 0 ? 0 : 1);
}
