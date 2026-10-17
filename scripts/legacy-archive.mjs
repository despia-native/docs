#!/usr/bin/env node
//
//  legacy-archive.mjs - the LEGACY ARCHIVE: the V3 documentation as it was on setup.despia.com (the snapshot in
//  legacy-archive/pages, see legacy-export.mjs), served under /legacy for apps still on a legacy deployment.
//    · every page is a DSX page in its own frame (Components/legacy/LegacyShell.dsx: its own minimal nav, no docs areas),
//      under a banner that says it is legacy and points new apps to the modern docs;
//    · nothing of it joins the modern site: no nav row, search entry, sitemap row, llms.txt line or MCP index entry
//      (those are built from scripts/compile.mjs's pages, which hold no /legacy page), and the docs Worker answers every
//      /legacy response with X-Robots-Tag noindex;
//    · links between legacy pages stay inside /legacy; the Mintlify components are lowered by compile.mjs's own lowering.
//  Writes Components/legacy/ (generated) and owns every /legacy row of dsx.config.json. Runs after site/dsx-compile.mjs.
//

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pagesDir = join(root, "legacy-archive", "pages");
const out = join(root, "Components", "legacy");
const BANNER = { title: "Legacy documentation for V3 deployments", message: "For new apps use the modern docs." };

// ── compile.mjs's Mintlify lowering, loaded from its own source so the archive lowers exactly like every docs page ──────
const compileSrc = readFileSync(join(root, "scripts", "compile.mjs"), "utf8");
const cut = (from, to) => {
  const a = compileSrc.indexOf(from);
  const b = compileSrc.indexOf(to, a);
  if (a < 0 || b < 0) throw new Error(`[docs.legacy-archive] compile.mjs no longer holds "${from}" .. "${to}": update the cut`);
  return compileSrc.slice(a, b);
};
const lowerSrc = [
  `import { relative, sep } from "node:path";`,
  `const root = ${JSON.stringify(root)};`,
  cut("function jseStringLiteral(", "\n}\n") + "\n}\n",
  cut("const CALLOUT_SUGAR = ", "/** The docs' one app mapping row"),
  cut("const MD_COMPONENTS = ", "\n") + "\n",
  `export { tagTree, emitDirectives, jseStringLiteral, MD_COMPONENTS };`,
].join("\n");
const tmp = join(root, "node_modules", ".cache", "legacy-lower.mjs");
mkdirSync(dirname(tmp), { recursive: true });
writeFileSync(tmp, lowerSrc);
const { tagTree, emitDirectives, jseStringLiteral, MD_COMPONENTS } = await import(pathToFileURL(tmp).href);

// ── the pages ─────────────────────────────────────────────────────────────────────────────────────────────────────────
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith(".md") ? [join(dir, e.name)] : []);
}
const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const titleCase = (s) => s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
const compName = (path) => "Legacy" + (path === "/legacy" ? "Index" : path.slice("/legacy".length).split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(""));

/** A legacy page's own markdown: the Mintlify index preamble gone, its links kept inside the archive, embeds as links. */
function body(md) {
  let text = md.replace(/^(?:>.*\n)+\n?/, "");
  const title = /^#\s+(.+)$/m.exec(text)?.[1].trim() ?? "";
  text = text.replace(/^#\s+.+\n+/m, "");
  const lead = /^>\s+(.+)\n+/.exec(text);
  const description = lead ? lead[1].trim() : "";
  if (lead) text = text.slice(lead[0].length);
  text = text.replace(/https:\/\/setup\.despia\.com(?=\/|\b)/g, "")
    .replace(/\]\((\/(?!legacy\/|\/)[^)\s]*)\)/g, (_m, p) => `](/legacy${p.replace(/\.md(?=#|$)/, "")})`)
    // a key placeholder in the old guides is written as words, so no page carries a PEM block (the build refuses one)
    .replace(/-----(BEGIN|END) ([A-Z ]*)PRIVATE KEY-----/g, (_m, edge, kind) => `[${edge === "BEGIN" ? "start" : "end"} of your ${kind.toLowerCase()}private key]`)
    .replace(/^\s*<iframe\b[^>]*\bsrc="([^"]+)"[^>]*\/?>\s*(?:<\/iframe>)?\s*$/gm, (_m, src) => `<Video src="${src}" title="${title}"/>`);
  return { title, description, text };
}

const files = walk(pagesDir).sort();
const pages = files.map((file) => {
  const rel = relative(pagesDir, file).split(sep).join("/").replace(/\.md$/, "");
  const path = rel === "index" ? "/legacy/introduction-home" : `/legacy/${rel}`;
  const { title, description, text } = body(readFileSync(file, "utf8"));
  const lowered = emitDirectives(tagTree({ file }, text.split("\n"), 1)).trim();
  return { path, rel, title: title || titleCase(rel.split("/").pop()), description, md: lowered, group: rel.includes("/") ? titleCase(rel.split("/")[0]) : "Get started" };
}).filter((p) => p.path !== "/legacy/introduction-home");

// the archive's own nav: the old site's top-level folders, in its order of first appearance
const groups = [];
for (const p of pages) {
  let g = groups.find((x) => x.title === p.group);
  if (!g) groups.push(g = { id: p.group.toLowerCase().replace(/\W+/g, "-"), title: p.group, rows: [] });
  g.rows.push({ id: p.path, path: p.path, title: p.title });
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "LegacyShell.dsx"), `<!-- LegacyShell: the legacy archive's one frame. GENERATED by scripts/legacy-archive.mjs: edit the generator.
     A regular window draws its own minimal nav (the old site's folders) beside the page; a phone reaches the pages from /legacy.
     Every page opens with the legacy banner under its header, and nothing here links into the modern docs' nav. -->
<scaffold shell="automatic" sidebar-label="Legacy documentation" content-label="Page">
  <head>
    <attribute as="route" default="'/legacy'"/>
    <variable as="nav">return legacyNav()</variable>
    <action as="open" input:path="dsx.this.value">dsx.module.route.select({ path: path })</action>
    <script>
      function legacyNav() { return ${JSON.stringify(groups)} }
    </script>
  </head>
  <SidebarList pane="sidebar" value="{{ dsx.attribute.route }}" aria-label="Legacy documentation" on:change="dsx.action.open()">
    <SidebarSection title="Legacy docs">
      <SidebarItem value="/legacy" icon="clock.arrow.circlepath" title="All pages"/>
      <SidebarItem value="/" icon="book" title="Modern docs"/>
    </SidebarSection>
    <SidebarSection repeat="dsx.variable.nav" key="id" title="{{ dsx.this.title }}" collapsible="true" expanded="{{ dsx.this.rows.some(r => r.path == dsx.attribute.route) }}">
      <SidebarItem repeat="dsx.this.rows" key="id" value="{{ dsx.this.path }}" title="{{ dsx.this.title }}"/>
    </SidebarSection>
  </SidebarList>
  <scroll pane="content">
    <slot/>
  </scroll>
</scaffold>
`);

const banner = `  <Callout class="page-notice" tone="warning" title="${attr(BANNER.title)}" message="${attr(BANNER.message)}" action="Modern docs" href="/"/>`;
const routes = [];
for (const p of pages) {
  const name = compName(p.path);
  const field = p.md.includes(":field[") ? ` components="${MD_COMPONENTS}"` : "";
  writeFileSync(join(out, `${name}.dsx`), `<!-- GENERATED by scripts/legacy-archive.mjs from legacy-archive/pages/${p.rel}.md: the page as it was on setup.despia.com. -->
<LegacyShell route="${p.path}">
  <head>
    <variable as="md">return ${jseStringLiteral(p.md)}</variable>
  </head>
  <NavBar title="${attr(p.title)}" large="true"${p.description ? ` description="${attr(p.description)}"` : ""}/>
${banner}
  <vstack class="doc-article">
    <markdown bind="dsx.variable.md" copyCode="true" externalLinks="true"${field}/>
  </vstack>
</LegacyShell>
`);
  routes.push({ path: p.path, component: `docs.${name}`, meta: { title: `${p.title} (legacy)`, description: p.description || BANNER.title } });
}
writeFileSync(join(out, "LegacyIndex.dsx"), `<!-- GENERATED by scripts/legacy-archive.mjs: every page of the legacy archive, by the old site's folders. -->
<LegacyShell route="/legacy">
  <head>
    <variable as="nav">return ${JSON.stringify(groups).replace(/</g, "\\u003c").replace(/&/g, "\\u0026")}</variable>
  </head>
  <NavBar title="Legacy documentation" large="true" description="The Despia V3 documentation as it was, for apps still on a legacy deployment."/>
${banner}
  <ListGroup repeat="dsx.variable.nav" key="id" header="{{ dsx.this.title }}">
    <SettingsRow repeat="dsx.this.rows" key="id" title="{{ dsx.this.title }}" chevron="true" href="{{ dsx.this.path }}"/>
  </ListGroup>
</LegacyShell>
`);
routes.unshift({ path: "/legacy", component: "docs.LegacyIndex", meta: { title: "Legacy documentation", description: "The Despia V3 documentation, for legacy deployments." } });

// dsx.config.json: this script owns every /legacy row
const cfgFile = join(root, "dsx.config.json");
const cfg = JSON.parse(readFileSync(cfgFile, "utf8"));
cfg.routes = cfg.routes.filter((r) => !(r.path === "/legacy" || r.path.startsWith("/legacy/"))).concat(routes);
writeFileSync(cfgFile, JSON.stringify(cfg, null, 2) + "\n");
console.log(`[docs.legacy-archive] ${pages.length} legacy page(s) + index -> Components/legacy, ${routes.length} /legacy route(s)`);
if (!existsSync(join(out, "LegacyIndex.dsx"))) process.exit(1);
