#!/usr/bin/env node
//
//  legacy-export.mjs - snapshot the legacy documentation (setup.despia.com, the V3 Mintlify site) AS IT IS: every page of its
//  live sitemap read through its own markdown twin (<path>.md), read-only GETs, saved verbatim under legacy-archive/pages/.
//  legacy-archive.mjs builds the archive pages from this snapshot; re-run this only to refresh it.
//    node scripts/legacy-export.mjs
//

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = "https://setup.despia.com";
const out = join(root, "legacy-archive", "pages");
const UA = "despia-docs-legacy-archive/1 (read-only snapshot)";

const get = async (url) => {
  for (let i = 0; i < 4; i += 1) {
    const r = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
    if (r.ok) return await r.text();
    if (r.status !== 429 && r.status < 500) throw new Error(`${url}: ${r.status}`);
    await new Promise((s) => setTimeout(s, 1000 * 2 ** i));
  }
  throw new Error(`${url}: gave up`);
};

const sitemap = await get(`${SOURCE}/sitemap.xml`);
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname.replace(/\/+$/, "") || "/");
const pages = [];
for (let i = 0; i < paths.length; i += 6) {
  await Promise.all(paths.slice(i, i + 6).map(async (path) => {
    const md = await get(`${SOURCE}${path === "/" ? "/introduction" : path}.md`);
    const file = join(out, `${path === "/" ? "index" : path.slice(1)}.md`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, md);
    pages.push(path);
  }));
}
writeFileSync(join(root, "legacy-archive", "SOURCE.json"), JSON.stringify({
  source: SOURCE, exportedAt: new Date().toISOString(), how: "each sitemap page's markdown twin, verbatim", pages: pages.sort(),
}, null, 1) + "\n");
console.log(`[docs.legacy-export] ${pages.length} page(s) -> legacy-archive/pages`);
