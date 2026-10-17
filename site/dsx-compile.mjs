#!/usr/bin/env node
//
//  dsx-compile.mjs - the Despia V4 docs as a DSX app, built from the SAME sources as the static preview:
//    site/ia.mjs (the IA), content-v2/**/*.md (the pages), data/packages.json (the catalog).
//
//  The look is the CONSOLE's (owner 2026-10-10: "the console's own custom design looks stunning"): its frame
//  (scaffold shell="automatic", SidebarList with the switcher pinned on top and the appearance row at the foot, the
//  sections; the tab bar on a phone), its page header (NavBar large with a description), its notices (Callout), its
//  cards (ItemCard in adaptive grids), its package explorer (searchbar, scopeBar, a ListGroup header per category),
//  its product page (ProductHeader, ListGroups), its search (CommandPalette, cmd+K) and its long form (<markdown>, the
//  way the console's Help reads an article). Nothing here restyles a stock component; Components/DocsShell.css holds
//  the reading column (its measure, its type and spacing scales, set through the framework's own tokens and knobs) and
//  the page outline.
//
//    node site/dsx-compile.mjs            # writes Components/v2/*.dsx and merges the routes into dsx.config.json
//    node site/dsx-compile.mjs --only a,b # only these routes (fast iteration builds); the rest of the config untouched
//
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontMatter, renderMarkdown, slugify } from "./md.mjs";
import { SECTIONS, sectionOf, allPages } from "./ia.mjs";
import { HOME_SAMPLE } from "./home.mjs";
import { attr, navBar, pageMenuVar } from "./frame.mjs";
import { loadPackages, groupOf, GROUP_ORDER } from "../scripts/packages-lib.mjs";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(repo, "Components", "v2");
const CONTENT = join(repo, "content-v2");
const onlyAt = process.argv.indexOf("--only");
const ONLY = onlyAt > 0 ? new Set(process.argv[onlyAt + 1].split(",")) : null;
const RELEASE = JSON.parse(readFileSync(join(repo, "data", "release.json"), "utf8"));
const ICONS = JSON.parse(readFileSync(join(repo, "data", "icons.json"), "utf8"));
const WAITLIST = "https://api.despia.com/v1/waitlist";
const SITE_CFG = JSON.parse(readFileSync(join(repo, "data", "site.json"), "utf8"));
const SITE = `${SITE_CFG.origin}${SITE_CFG.base}`;

// ── escaping ────────────────────────────────────────────────────────────────────────────────────────
// a value carried inside a code body (<variable>, <script>): JSON, with every character XML or the linter would read
// (< > & { } and the `dsx.` head) written as a \u escape, so the bytes are inert text in the document
const jsLiteral = (v) => JSON.stringify(v).replace(/"(?:[^"\\]|\\.)*"/g, (str) => str
  .replace(/[<>&{}]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`)
  .replace(/dsx\./g, "dsx\\u002e"));

// ── the docs' markdown subset -> DSX extended markdown (OpenSource/Documentation/guides/markdown.md) ─────────────
//   ::: note|tip|warning Title  -> :::note{title="Title"}       (a Callout)
//   ::: code-group              -> ::::tabs + :::tab{title=""}   (MarkdownTabs, one CodeBlock per tab)
//   ::: cards                   -> ::link-card{href title description}
//   ::: steps                   -> its ### headings numbered
//   ```dsx title="x" fragment   -> ```dsx title="x"              (a CodeBlock; the kernel's grammar colours it)
export function toDsxMarkdown(md) {
  const lines = md.split("\n");
  const out = [];
  let i = 0;
  const stack = [];
  let step = 0;
  while (i < lines.length) {
    const line = lines[i];
    const fence = /^(\s*)(```+)(\S*)(.*)$/.exec(line);
    if (fence) {
      const meta = fence[4].replace(/\bfragment\b/, "").trim();
      out.push(`${fence[1]}${fence[2]}${fence[3]}${meta ? " " + meta : ""}`);
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence[2])) { out.push(lines[i]); i++; }
      if (i < lines.length) { out.push(lines[i]); i++; }
      continue;
    }
    const open = /^:::\s*(\S+)\s*(.*)$/.exec(line);
    if (open && line.trim() !== ":::") {
      const [, kind, arg] = open;
      i++;
      if (kind === "code-group") {
        const tabs = [];
        while (i < lines.length && lines[i].trim() !== ":::") {
          const f = /^(```+)(\S*)(.*)$/.exec(lines[i]);
          if (f) {
            const title = /title="([^"]+)"/.exec(f[3])?.[1] ?? f[2];
            const body = [];
            i++;
            while (i < lines.length && !lines[i].startsWith(f[1])) { body.push(lines[i]); i++; }
            i++;
            tabs.push({ title, lang: f[2], body });
          } else i++;
        }
        i++;
        out.push("::::tabs");
        for (const t of tabs) out.push(`:::tab{title="${t.title}"}`, "```" + t.lang, ...t.body, "```", ":::");
        out.push("::::");
        continue;
      }
      if (kind === "cards") {
        while (i < lines.length && lines[i].trim() !== ":::") {
          const c = /^-\s*\[([^\]]+)\]\(([^)]+)\)\s*(?:\{[\w.]+\})?\s*(.*)$/.exec(lines[i].trim());
          if (c) out.push(`::link-card{href="${c[2]}" title="${c[1].replace(/`/g, "")}" description="${c[3].replace(/`/g, "").replace(/"/g, "'")}"}`, "");
          i++;
        }
        i++;
        continue;
      }
      if (kind === "steps") { stack.push("steps"); step = 0; continue; }
      const tone = ["note", "tip", "warning"].includes(kind) ? kind : "note";
      out.push(arg ? `:::${tone}{title="${arg.replace(/"/g, "'")}"}` : `:::${tone}`);
      stack.push("callout");
      continue;
    }
    if (line.trim() === ":::" && stack.length) {
      const top = stack.pop();
      if (top === "callout") out.push(":::");
      i++;
      continue;
    }
    if (stack.includes("steps") && /^###\s+/.test(line)) { step += 1; out.push(line.replace(/^###\s+/, `### ${step}. `)); i++; continue; }
    out.push(line);
    i++;
  }
  return out.join("\n");
}

// ── names ───────────────────────────────────────────────────────────────────────────────────────────
const compName = (route) => "V2" + (route === "/" ? "Home" : route.split("/").filter(Boolean)
  .map((s) => s.replace(/(^|[-_])(\w)/g, (_, __, c) => c.toUpperCase())).join("_"));

// ── the frame's data: sections, rows, the search palette ──────────────────────────────────────────────
// the server halves of a package (Modules/Backend, Modules/Http) keep their pages, out of the catalog, search and home
const allPkgs = loadPackages().packages.filter((p) => p.listed !== false);
const pkgs = allPkgs.filter((p) => !/\/Modules\/(Backend|Http)$/.test(p.path));
const parentOf = (p) => (/\/Modules\//.test(p.path) ? p.path.split("/Modules/").slice(-2)[0].split("/").pop() : null);
const titleOf = (p) => (parentOf(p) ? `${p.title} (${parentOf(p)})` : p.title);
const SECTION_ICON = { dsx: "chevron.left.forwardslash.chevron.right", convert: "globe", "web-apps": "safari", packages: "shippingbox", ship: "paperplane" };
const GROUP_ICON = (g) => ICONS.groups[g] ?? "shippingbox";
const PAGE_ICON = {
  "/dsx": "cube", "/dsx/quickstart": "bolt", "/dsx/project": "folder", "/dsx/documents": "doc.text", "/dsx/data": "curlybraces",
  "/dsx/styling": "paintbrush", "/dsx/attributes": "tag", "/dsx/native-ui": "square.grid.2x2", "/dsx/navigation": "arrow.triangle.turn.up.right.diamond",
  "/dsx/packages": "shippingbox", "/dsx/platforms": "iphone", "/dsx/cli": "terminal", "/dsx/console": "macwindow", "/dsx/agents": "cpu",
  "/dsx/agents/skills": "book", "/convert": "globe", "/convert/quickstart": "bolt", "/web-apps/native-features": "curlybraces",
  "/web-apps/frameworks": "chevron.left.forwardslash.chevron.right", "/web-apps/outside-despia": "safari", "/convert/from-v3": "arrow.up.circle",
  "/ship": "paperplane", "/ship/app-store-connect": "key", "/ship/google-play": "key", "/ship/builds": "hammer", "/ship/releases": "square.stack",
  "/app-review": "checkmark.shield",
  "/web-apps": "bolt", "/web-apps/native-features": "curlybraces", "/web-apps/frameworks": "chevron.left.forwardslash.chevron.right",
  "/web-apps/typescript": "textformat", "/web-apps/outside-despia": "globe", "/web-apps/hosted-and-bundled": "shippingbox",
  "/web-apps/preview": "iphone", "/web-apps/packages": "list.bullet",
};
// The global chrome keeps a few top-level destinations, as the console does: Home, DSX and Packages are tabs of their own,
// and the task guides (Convert, Web apps, Build and ship) are one Guides tab whose root page (/guides) lists them. A wide
// window shows the same grouping in the sidebar: the Docs section, then the Guides section with its three pages.
// A sidebar row is one line: a title longer than the row takes a shorter label there (the page keeps its title).
const NAV_LABEL = {
  "Core/Store": "Purchases and paywalls",
  "Core/Firebase": "Firebase Messaging",
};
const GUIDES = ["convert", "web-apps", "ship"];
const GUIDES_ROOT = "/guides";
const areaOf = (s) => ({ id: s.id, title: s.tab ?? s.label, icon: SECTION_ICON[s.id], path: s.href });
// The other spaces (Legacy, Migration, Troubleshooting, Releases, App Review) are areas of the same frame: scripts/compile.mjs
// builds their pages on DocsShell and writes their sidebars to public/nav.json, which runs before this script. The
// switcher lists them under More; a page of one shows its own sidebar groups.
const MORE_AREAS = [
  { id: "legacy", icon: "clock.arrow.circlepath" },
  { id: "migrate", icon: "arrow.up.circle" },
  { id: "troubleshooting", icon: "wrench.and.screwdriver" },
  { id: "releases", icon: "newspaper" },
  { id: "app-review", icon: "checkmark.shield" },
];
const spacesNav = (() => {
  const file = join(repo, "public", "nav.json");
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")).spaces ?? [] : [];
})();
const moreAreas = MORE_AREAS.map((a) => ({ ...a, space: spacesNav.find((s) => s.id === a.id) })).filter((a) => a.space !== undefined);
const flatTree = (nodes, icon) => nodes.flatMap((n) => (n.items !== undefined ? flatTree(n.items, n.icon ?? icon) : [{ ...n, icon: n.icon ?? icon }]));
const spaceGroups = (a) => a.space.sections.flatMap((sec) => {
  const loose = sec.tree.filter((n) => n.items === undefined);
  const nested = sec.tree.filter((n) => n.items !== undefined);
  return [...(loose.length ? [{ title: sec.name, icon: sec.icon, nodes: loose, folds: false }] : []),
    ...nested.map((n) => ({ title: n.group, icon: n.icon ?? sec.icon, nodes: n.items, folds: true }))];
}).map((g) => {
  const rows = flatTree(g.nodes, g.icon).map((n) => ({ id: n.route, title: n.label ?? n.title, icon: n.icon ?? "doc.text", path: n.route }));
  return { id: `${a.id}-${g.title}`, section: a.id, title: g.title, rows, routes: rows.map((r) => r.path), collapsible: g.folds };
});
const navData = {
  areas: [{ id: "home", title: "Home", icon: "house", path: "/" }].concat(SECTIONS.map(areaOf))
    .concat(moreAreas.map((a) => ({ id: a.id, title: a.space.label, icon: a.icon, path: a.space.home, more: true }))),
  tabs: [{ id: "home", title: "Home", icon: "house", path: "/" }].concat(SECTIONS.filter((s) => !GUIDES.includes(s.id)).map(areaOf)),
  guides: SECTIONS.filter((s) => GUIDES.includes(s.id)).map((s) => ({ ...areaOf(s), title: s.label })),
  groups: SECTIONS.flatMap((s) => s.id === "packages"
    ? GROUP_ORDER.map((g) => ({ id: `packages-${g}`, section: "packages", title: g,
      rows: pkgs.filter((p) => p.published && groupOf(p) === g).sort((a, b) => titleOf(a).localeCompare(titleOf(b)))
        .map((p) => ({ id: p.url, title: NAV_LABEL[p.path] ?? titleOf(p), icon: GROUP_ICON(g), path: p.url })) })).filter((g) => g.rows.length)
    // an area's root page is already its own row (Docs or Guides), so a group never repeats it: one destination, one
    // row, one selection
    : s.groups.map((g) => ({ id: `${s.id}-${g.title}`, section: s.id, title: g.title,
      rows: g.pages.filter(([route]) => route !== s.href).map(([route, title]) => ({ id: route, title: NAV_LABEL[route] ?? title, icon: PAGE_ICON[route] ?? "doc.text", path: route })) }))
      .filter((g) => g.rows.length > 0))
    .map((g) => ({ ...g, routes: g.rows.map((r) => r.path), collapsible: false }))
    .concat(moreAreas.flatMap(spaceGroups)),
  palette: allPages().map((p) => ({ id: p.route, title: p.title, subtitle: p.description, icon: PAGE_ICON[p.route] ?? "doc.text",
    group: SECTIONS.find((s) => s.id === p.section).label, keywords: [p.group], path: p.route }))
    .concat(pkgs.map((p) => ({ id: p.url, title: titleOf(p), subtitle: p.summary, icon: "shippingbox", group: "Packages", keywords: [p.command ?? p.slug], path: p.url })))
    .concat(moreAreas.flatMap((a) => spaceGroups(a).flatMap((g) => g.rows.map((r) => ({ id: r.path, title: r.title, subtitle: g.title, icon: r.icon, group: a.space.label, keywords: [], path: r.path })))))
    .filter((row, i, all) => all.findIndex((x) => x.id === row.id) === i),
};

function shell() {
  return `<!-- DocsShell: the docs' one frame, the console's own (despia-native/platform Components/Shell.dsx): ONE declaration,
     two forms. A regular window draws the stock SidebarList beside the page, the Despia switcher pinned at its top (the
     docs' areas, as the console's workspace switcher), the areas, the current area's groups, and Appearance pinned at its
     foot; a compact window (a phone) draws the tab bar from the Docs section's items and the Guides section's one tab
     (collapse="tabs"), each tab's root page listing its pages. Each page brings its own NavBar (title, description, bar actions) as the first child of the slot.
     cmd+K is the console's CommandPalette over every page and package.
     GENERATED by site/dsx-compile.mjs (the rows come from site/ia.mjs and data/packages.json): edit the generator.
     <DocsShell area="dsx" route="/dsx/quickstart"> <NavBar …/> …page… </DocsShell> -->
<scaffold shell="automatic" collapse="tabs" style="--dsx-sidebar-compact: tabs" sidebar-label="Despia docs" content-label="Page">
  <head>
    <attribute as="area" default="'home'"/>
    <attribute as="route" default="'/'"/>
    <attribute as="md" default="''"/>
    <attribute as="toc" default="'[]'"/>

    <!-- nav reads no attribute, so it is a plain variable (evaluated once): a computed variable is re-evaluated on every
         read, and a repeat reads it once per row (the build profile: 74% of a docs build was re-evaluated computed
         bodies). The rest depends on the page's attributes, which a plain variable's first value cannot see. -->
    <variable as="nav">return docsNav()</variable>
    <variable as="areaTitle" computed="true">
      const hit = dsx.variable.nav.areas.find(a => a.id == dsx.attribute.area)
      return hit ? hit.title : (dsx.attribute.area == 'guides' ? 'Guides' : 'Home')
    </variable>
    <variable as="areaMenu" computed="true">
      const row = a => ({ title: a.title, icon: a.id == dsx.attribute.area ? 'checkmark' : a.icon, action: 'route.reset', args: { path: a.path } })
      return [{ header: true, title: 'Despia V4 ${attr(RELEASE.version ?? "")}' }].concat(dsx.variable.nav.areas.filter(a => !a.more).map(row))
        .concat([{ separator: true }, { header: true, title: 'More' }]).concat(dsx.variable.nav.areas.filter(a => a.more).map(row))
    </variable>
    <variable as="tocRows" computed="true">
      const rows = JSON.parse(String(dsx.attribute.toc || '[]'))
      return rows.map(r => ({ id: r.id, title: r.title, level: r.level || 2, href: '#' + r.id }))
    </variable>
    <variable as="groups" computed="true">return dsx.variable.nav.groups.filter(g => g.section == dsx.attribute.area)</variable>
    <variable as="areaPath" computed="true">
      const hit = dsx.variable.nav.areas.find(a => a.id == dsx.attribute.area)
      return hit ? hit.path : '/'
    </variable>
    <variable as="appearanceMenu" computed="true">
      return [
        { header: true, title: 'Appearance' },
        { title: 'System', icon: 'circle.lefthalf.filled', action: 'appearance.set', args: { mode: 'system' } },
        { title: 'Light', icon: 'sun.max', action: 'appearance.set', args: { mode: 'light' } },
        { title: 'Dark', icon: 'moon', action: 'appearance.set', args: { mode: 'dark' } }
      ]
    </variable>

    <action as="open" input:path="dsx.this.value">dsx.module.route.select({ path: path })</action>

    <script>
      function docsNav() { return ${jsLiteral(navData)} }
    </script>
  </head>

  <SidebarList pane="sidebar" value="{{ dsx.attribute.route }}" aria-label="Documentation" on:change="dsx.action.open()">
    <menu slot="top" menu="{{ dsx.variable.areaMenu }}">
      <SettingsRow icon="despia.logo.mono" iconStyle="plain" title="Despia Docs" subtitle="{{ dsx.variable.areaTitle }}" valueIcon="chevron.up.chevron.down" tappable="true"/>
    </menu>

    <SidebarSection title="Docs" tab="items">
      <SidebarItem repeat="dsx.variable.nav.tabs" key="id" value="{{ dsx.this.path }}" icon="{{ dsx.this.icon }}" title="{{ dsx.this.title }}"/>
    </SidebarSection>
    <SidebarSection title="Guides" tab="Guides" tabIcon="book" root="${GUIDES_ROOT}">
      <SidebarItem repeat="dsx.variable.nav.guides" key="id" value="{{ dsx.this.path }}" icon="{{ dsx.this.icon }}" title="{{ dsx.this.title }}"/>
    </SidebarSection>
    <SidebarSection repeat="dsx.variable.groups" key="id" title="{{ dsx.this.title }}" root="{{ dsx.variable.areaPath }}"
                    collapsible="{{ dsx.this.collapsible }}" expanded="{{ !dsx.this.collapsible || dsx.this.routes.includes(dsx.attribute.route) }}">
      <SidebarItem repeat="dsx.this.rows" key="id" value="{{ dsx.this.path }}" icon="{{ dsx.this.icon }}" title="{{ dsx.this.title }}"/>
    </SidebarSection>

    <menu slot="bottom" menu="{{ dsx.variable.appearanceMenu }}">
      <SettingsRow icon="circle.lefthalf.filled" title="Appearance" valueIcon="chevron.up.chevron.down" tappable="true"/>
    </menu>
  </SidebarList>

  <scroll pane="content">
    <slot/>
  </scroll>

  <!-- ON THIS PAGE: the scaffold's inspector column on a wide window (a phone has the page menu's "On this page" rows).
       A navigation landmark over the page's ## and ### headings, plain links on a hairline track. Each link is an
       in-page link (href="#id"), so the runtime moves the page to its section and marks the link of the section being
       read aria-current="location"; DocsShell.css draws that as the accent ink and the track's accent segment. -->
  <scroll pane="inspector" visible-if="dsx.variable.tocRows.length &gt;= 2 &amp;&amp; dsx.screen.width &gt;= 768">
    <vstack class="doc-outline" role="navigation" aria-label="On this page">
      <text class="doc-outline-title" type="footnote" value="On this page" aria-hidden="true"/>
      <vstack class="doc-outline-list" role="list">
        <hstack repeat="dsx.variable.tocRows" key="id" class="doc-outline-item" class:doc-outline-sub="dsx.this.level == 3" role="listitem">
          <stack class="doc-outline-mark" aria-hidden="true"/>
          <pressable class="doc-outline-link" href="{{ dsx.this.href }}">
            <text type="callout" value="{{ dsx.this.title }}"/>
          </pressable>
        </hstack>
      </vstack>
    </vstack>
    <pressable class="doc-outline-aside" href="/dsx/agents" visible-if="dsx.attribute.md != ''">
      <image icon="terminal" aria-hidden="true"/>
      <text type="callout" value="Use with your agent"/>
    </pressable>
  </scroll>

  <CommandPalette present="dsx.global.docsSearch" commands="dsx.variable.nav.palette" label="Search the docs"/>
</scaffold>
`;
}

// ── a page ──────────────────────────────────────────────────────────────────────────────────────────
const notice = (topic, title, message, action) => `  <Callout class="page-notice" tone="info" title="${attr(title)}" message="${attr(message)}" action="${attr(action)}" on:action="dsx.variable.notify = true"/>
  <sheet detents="content" present="dsx.variable.notify" title="${attr(action)}" close="trailing" on:dismiss="dsx.variable.notify = false">
    <NotifyForm topic="${attr(topic)}"/>
  </sheet>`;

// "Copy page": the page's Markdown, joined from its section variables (each section is already in the document once).
// A stock CopyButton, not a page-menu row: a menu row's args are capped at 512 characters by the overlay plane.
const pageTextVar = (title, sections) => `    <variable as="pageText">return ${jsLiteral(`# ${title}\n\n`)} + [${sections.map((n) => `dsx.variable.${n}`).join(", ")}].join("\\n")</variable>\n`;

function page({ route, area, title, description, md, body, head = "", noticeFor = null, large = true, toc = [], sections = [] }) {
  return `<!-- GENERATED by site/dsx-compile.mjs from ${route === "/" ? "content-v2/index.md" : `content-v2${route}.md`}: edit the source, not this file. -->
<DocsShell area="${area}" route="${route}" md="${md}" toc="${attr(JSON.stringify(toc))}">
  <head>
${noticeFor ? `    <variable as="notify">return false</variable>\n` : ""}${pageMenuVar(md, toc)}${head}${sections.length ? pageTextVar(title, sections) : ""}    <action as="search">dsx.global.docsSearch = true</action>
  </head>
${navBar({ title, description, md, large, copy: sections.length > 0, toc })}
  <RedirectNotice/>
${noticeFor ? notice(...noticeFor) + "\n" : ""}${body}
</DocsShell>
`;
}

const article = (name) => `  <vstack class="doc-article">
    <markdown bind="dsx.variable.${name}" copyCode="true" externalLinks="true"/>
  </vstack>`;
const mdVar = (name, md) => `    <variable as="${name}">return ${jsLiteral(md)}</variable>\n`;

// A Markdown table's rows as list rows: cells split on | outside code, inline Markdown reduced to its text. The first column
// is the row's title; a second column of a few words is its trailing value (a type, a language), longer text its subtitle;
// further columns join the subtitle.
function tableRows(lines) {
  const cells = (line) => {
    const out = [""]; let code = false;
    for (const ch of line.trim().replace(/^\||\|$/g, "")) {
      if (ch === "`") code = !code;
      if (ch === "|" && !code) out.push(""); else out[out.length - 1] += ch;
    }
    return out.map((c) => c.trim().replace(/\\\|/g, "|").replace(/`([^`]*)`/g, "$1").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\*\*([^*]*)\*\*/g, "$1").replace(/<br\s*\/?>/gi, " ").replace(/\s+/g, " ").trim());
  };
  return lines.slice(2).map(cells).map((c, n) => {
    const short = c.length > 2 || (c[1] ?? "").length <= 24;
    const value = c.length > 1 && short ? c[1] : "";
    const rest = c.slice(c.length > 1 && short ? 2 : 1).filter((x) => x !== "" && x !== "-");
    return { id: `r${n}`, title: c[0] ?? "", value, subtitle: rest.join(" · ") };
  });
}

// a long page split at its ## and ### headings: each is its own <markdown> in a stack carrying the heading's id (a ###
// stack inside its ## stack), so "On this page" links to it (#id), the outline knows which one is being read, and the
// browser's own find and anchors work
function sectioned(md) {
  // a source comment (a generator's "GENERATED by" line) is for the file's editors, never page text
  md = md.replace(/^[ \t]*<!--[\s\S]*?-->[ \t]*\n?/gm, "");
  const parts = [{ id: "", title: "", level: 0, lines: [] }];
  let fence = null;
  for (const line of md.split("\n")) {
    if (fence === null && /^```/.test(line.trim())) fence = line.trim().match(/^`+/)[0];
    else if (fence !== null && line.trim().startsWith(fence)) fence = null;
    const h = fence === null ? /^(#{2,3})\s+(.+?)\s*$/.exec(line) : null;
    if (h) parts.push({ id: slugify(h[2]), title: h[2].replace(/`/g, ""), level: h[1].length, lines: [line] });
    else parts[parts.length - 1].lines.push(line);
  }
  const used = new Set();
  for (const p of parts) { let id = p.id, n = 2; while (id && used.has(id)) id = `${p.id}-${n++}`; p.id = id; used.add(id); }
  // a ### before any ## has no section to sit in: it reads as a section of its own
  let inSection = false;
  for (const p of parts) { if (p.level === 2) inSection = true; else if (p.level === 3 && !inSection) p.level = 2; }
  const live = parts.filter((p) => p.lines.join("").trim() !== "");
  // A section's body: its prose as <markdown>, and each Markdown table as the stock inset grouped list (one SettingsRow
  // per table row: the first column the title, a short second column the trailing value, the rest the row's subtitle), the
  // way a SwiftUI List shows labelled content. The section's whole text stays in md<i> for Copy page.
  const extraHead = [];
  const pieces = (i) => {
    const lines = live[i].lines;
    const runs = [];
    let text = [], fence = null;
    for (let k = 0; k < lines.length; k++) {
      const line = lines[k];
      if (fence === null && /^```/.test(line.trim())) fence = line.trim().match(/^`+/)[0];
      else if (fence !== null && line.trim().startsWith(fence)) fence = null;
      if (fence === null && line.startsWith("|") && /^\|\s*:?-/.test(lines[k + 1] ?? "")) {
        let end = k + 2;
        while (end < lines.length && lines[end].startsWith("|")) end++;
        if (text.join("").trim() !== "") runs.push({ md: text.join("\n") });
        text = [];
        runs.push({ table: lines.slice(k, end) });
        k = end - 1;
        continue;
      }
      text.push(line);
    }
    if (text.join("").trim() !== "") runs.push({ md: text.join("\n") });
    if (!runs.some((r) => r.table)) return [`<markdown bind="dsx.variable.md${i}" copyCode="true" externalLinks="true"/>`];
    return runs.map((r, k) => {
      const name = `md${i}_${k}`;
      if (r.md !== undefined) { extraHead.push(mdVar(name, r.md)); return `<markdown bind="dsx.variable.${name}" copyCode="true" externalLinks="true"/>`; }
      const rows = tableRows(r.table);
      extraHead.push(`    <variable as="${name}">return ${jsLiteral(rows)}</variable>\n`);
      return `<ListGroup class="doc-table"><SettingsRow repeat="dsx.variable.${name}" key="id" title="{{ dsx.this.title }}" value="{{ dsx.this.value }}" subtitle="{{ dsx.this.subtitle }}" lines="0"/></ListGroup>`;
    });
  };
  const md_ = (i) => pieces(i).join("\n");
  const out = [];
  let open = false;
  live.forEach((p, i) => {
    if (p.level === 2) {
      if (open) out.push(`    </vstack>`);
      out.push(`    <vstack id="${p.id}" class="doc-section">`, `      ${md_(i)}`);
      open = true;
    } else if (p.level === 3) {
      out.push(`      <vstack id="${p.id}" class="doc-subsection">`, `        ${md_(i)}`, `      </vstack>`);
    } else out.push(`    ${md_(i)}`);
  });
  if (open) out.push(`    </vstack>`);
  return {
    head: live.map((p, i) => mdVar(`md${i}`, p.lines.join("\n"))).join("") + extraHead.join(""),
    body: `  <vstack class="doc-article">\n${out.join("\n")}\n  </vstack>`,
    toc: live.filter((p) => p.id).map((p) => ({ id: p.id, title: p.title, level: p.level })),
    sections: live.map((_, i) => `md${i}`),
  };
}

const DSX_NOTICE = ["dsx", "Research preview", "DSX is available for research purposes. The production and commercial release is coming soon.", "Register interest"];

// THE DOCS STYLESHEET (Components/DocsShell.css). Every value is a token below or a framework token or knob.
const DOCS_CSS = `/*
  DocsShell: the reading column of a docs page and its outline. Everything else on a docs page is the console's own
  components, unstyled. Every length below is a step of the two scales or a framework token, never a one-off number.
  GENERATED by site/dsx-compile.mjs: edit the generator.
*/

/* THE SCALES. Spacing is a 4px grid. The type scale keeps the framework's reading face and body (--dsx-type-reading-*)
   and widens the heading steps a long page needs (h2 1.5x the body, h3 1.1875x), all through the framework's own type
   tokens on the heading itself. The measure keeps prose at 60 to 80 characters per line. */
body:has([data-dsx-owner~="DocsShell"]) {
  --doc-space-1: 0.25rem;
  --doc-space-2: 0.5rem;
  --doc-space-3: 0.75rem;
  --doc-space-4: 1rem;
  --doc-space-5: 1.5rem;
  --doc-space-6: 2rem;
  --doc-space-7: 3rem;
  --doc-measure: 36rem;
  --doc-column: 46rem;
  --doc-h2-size: 1.5rem;
  --doc-h2-leading: 1.3333;
  --doc-h3-size: 1.1875rem;
  --doc-h3-leading: 1.3684;
  --dsx-page-header-padding-end: var(--doc-space-4);
  --dsx-markdown-list-gap: var(--doc-space-2);
}

/* CODE. Every code face reads literally: no ligature turns -- into a dash or => into an arrow. An inline chip that wraps
   draws each line's piece as its own rounded chip (box-decoration-break), never one box across both lines, and breaks a
   long token rather than leave the column. */
.doc-article .dsx-markdown code, .dsx-codeblock, .dsx-codeblock * {
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0, "calt" 0;
}
.doc-article .dsx-markdown :not(pre) > code {
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  white-space: normal;
  overflow-wrap: anywhere;
}

/* CALLOUTS written in Markdown (::: note Title): the stock callout with a block body. Its title is the headline (semibold)
   and the body the secondary label, as on the stock Callout with a message; the stock "a headline alone reads as text"
   rule takes the block body for a lone title. */
.doc-article .dsx-callout .dsx-callout-body-blocks > .dsx-callout-title { font-weight: 600; }
.doc-article .dsx-callout .dsx-callout-body-blocks > :not(.dsx-callout-title) { color: var(--dsx-secondary-label); }

/* TABLES are the stock inset grouped list (SettingsRow per table row); a row's text wraps, it never truncates */
.doc-article .doc-table { margin-block: var(--doc-space-4); }

/* THE TOOL LOGOS on the AI coding tool card: the vendors' own marks, one optical size, no tiles */
.doc-tool-logos { gap: var(--doc-space-3); align-items: center; }
.doc-tool-logos > * { width: 1.5rem; height: 1.5rem; font-size: 1.5rem; }

/* THE COLUMN. Code, tables and cards take the whole column (they line up with the page's cards and list groups);
   running text stops at the measure (36rem of the reading face: 72 to 78 characters a line). A <markdown> block is not on the page's content inset yet (the framework's prose
   layout), so the article stands on the inset the console's cards and list groups use. */
.doc-article {
  align-items: stretch;
  max-width: var(--doc-column);
  margin-inline: var(--dsx-grid-inset-inline, 20px);
  gap: 0;
}
.doc-article .dsx-markdown > :is(.dsx-text, .dsx-markdown-list) { max-width: var(--doc-measure); }
/* a compact window's cards, notices and headers stand on the list inset: the article lines up with them */
@media (max-width: 47.99rem) {
  .doc-article { margin-inline: var(--dsx-list-inset-inline, 16px); }
}

/* THE RHYTHM. Blocks sit one --doc-space-4 apart. A ## section opens --doc-space-7 below what came before and a ###
   subsection --doc-space-6 below it, so a heading always has more room above it than below it (--doc-space-3).
   Code, tables, callouts and a run of cards take --doc-space-2 more on each side. A section that is reached by a link
   lands --doc-space-5 under the bar. */
.doc-article .dsx-markdown { gap: var(--doc-space-4); }
.doc-section { gap: 0; margin-block-start: var(--doc-space-7); scroll-margin-top: var(--doc-space-5); }
.doc-article > .doc-section:first-child { margin-block-start: 0; }
.doc-subsection { gap: 0; margin-block-start: var(--doc-space-6); scroll-margin-top: var(--doc-space-5); }
/* a ### straight under its ## heading is a subtitle, not a new band */
.doc-section > .dsx-markdown:has(> [role="heading"]:only-child) + .doc-subsection { margin-block-start: var(--doc-space-4); }
.doc-article .dsx-markdown > [role="heading"] { margin-block-end: calc(var(--doc-space-3) - var(--doc-space-4)); }
.doc-article .dsx-markdown > [role="heading"]:not(:first-child) { margin-block-start: var(--doc-space-2); }
.doc-article .dsx-markdown > [role="heading"][aria-level="2"] {
  --dsx-type-title2-size: var(--doc-h2-size);
  --dsx-type-title2-leading: var(--doc-h2-leading);
}
.doc-article .dsx-markdown > [role="heading"][aria-level="3"] {
  --dsx-type-title3-size: var(--doc-h3-size);
  --dsx-type-title3-leading: var(--doc-h3-leading);
}
.doc-article .dsx-markdown > :is(.dsx-codeblock, .dsx-markdown-table, .dsx-callout, .dsx-image) { margin-block: var(--doc-space-2); }
/* Code and tables scroll sideways on a narrow window; the edge that continues fades over --doc-space-7 (the
   framework's horizontal-scroll mask, widened), so a cut line reads as "more this way". */
.doc-article :is(.dsx-codeblock-body, .dsx-markdown-table) {
  --dsx-rail-lead: min(var(--doc-space-7), var(--scroll-x-px, 0px));
  --dsx-rail-trail: min(var(--doc-space-7), var(--scroll-remaining-x-px, 0px));
}
/* two such blocks in a row are one --doc-space-5 apart, not two margins and a gap */
.doc-article .dsx-markdown > :is(.dsx-codeblock, .dsx-markdown-table, .dsx-callout, .dsx-image) + :is(.dsx-codeblock, .dsx-markdown-table, .dsx-callout, .dsx-image) { margin-block-start: 0; }
.doc-article .dsx-markdown > :not(.dsx-link-card) + .dsx-link-card { margin-block-start: var(--doc-space-2); }
.doc-article .dsx-markdown > :first-child { margin-block-start: 0; }
.doc-article .dsx-markdown > :last-child { margin-block-end: 0; }

/* THE PAGE HEADER LINE: a product page's header (icon, title, tagline) closes with the same divider, padding and
   spacing as every other page header (the NavBar's page header knobs, --dsx-page-header-*), the line on the platters'
   edges, and the content starts --dsx-page-header-spacing under the divider. */
.dsx-product-header {
  margin-inline: var(--dsx-list-inset-inline, 16px);
  padding-inline: 0;
  padding-block-end: var(--dsx-page-header-padding-end, 1rem);
  margin-block-end: var(--dsx-page-header-spacing, 1.5rem);
  border-bottom: var(--dsx-page-header-divider, var(--dsx-hairline, 1px) solid var(--dsx-separator));
}
/* The section grid under a product header (About, At a Glance) is not a System list group directly under a page header,
   so it keeps the list's whole leading section space. The divider is the section break: the grid keeps only what is
   left of the header gap once the section header's own top padding is counted. */
.dsx-product-header + .dsx-grid[data-dsx-adaptive] {
  padding-block-start: calc(var(--dsx-list-header-gap, 17.5px) - var(--dsx-list-header-pad-top, 10.33px));
}
.doc-spaced { margin-block: var(--dsx-page-header-spacing, 1.5rem); }

/* A docs card's symbol tile (a route, a guide, a link card) is the brand accent; a package's tile keeps the colour its
   manifest gives it, as the console draws it. */
.doc-cards .dsx-icon-tile-symbol { --dsx-icon-tile-background: var(--dsx-accent); }
/* A card grid inside the reading column already stands on the column's inset, so it takes no second one. On a page
   drawn on the plain ground (prose, no list group) its cards take the secondary ground, so the card stays a card. */
.doc-article .doc-cards { padding-inline: 0; }
.dsx-scaffold-pane:not([data-dsx-ground="grouped"]) .doc-cards { --dsx-item-card-background: var(--dsx-secondary-background); }

/* THE CONSOLE'S OWN PAGE RHYTHM (despia-native/platform Components/HelpSheet.css): a notice in the page's flow keeps the
   page's spacing token from what follows it; a list group brings its own section spacing. */
.page-notice:not(:has(+ .dsx-list-group)) { margin-block-end: var(--dsx-page-header-spacing, 1.5rem); }

/* CODE COLOURS: the CodeBlock's public knobs (--dsx-codeblock-*) set to the Despia editor themes
   (OpenSource/CodeEditor/src/theme.js, despia-light / despia-dark), so a .dsx sample reads as markup, CSS and
   JavaScript in one block. The tokens are the kernel's own highlight(); only the palette is the docs'. */
.dsx-codeblock, .dsx-codeblock-sheet {
  --dsx-codeblock-keyword: light-dark(#6d28d9, #a78bfa);
  --dsx-codeblock-tag: light-dark(#6d28d9, #a78bfa);
  --dsx-codeblock-string: light-dark(#047857, #34d399);
  --dsx-codeblock-regex: light-dark(#047857, #34d399);
  --dsx-codeblock-number: light-dark(#1d4ed8, #60a5fa);
  --dsx-codeblock-call: light-dark(#1d4ed8, #60a5fa);
  --dsx-codeblock-attribute: light-dark(#1d4ed8, #60a5fa);
  --dsx-codeblock-type: light-dark(#1d4ed8, #60a5fa);
  --dsx-codeblock-literal: light-dark(#4c1d95, #c4b5fd);
  --dsx-codeblock-meta: light-dark(#4c1d95, #c4b5fd);
  --dsx-codeblock-comment: light-dark(#737373, #8a8a8a);
}

/* ON THIS PAGE. Plain links on a hairline track down the outline's leading edge, no card. The link of the section
   being read (aria-current="location", set by the runtime) takes the accent ink, and its piece of the track turns
   accent: the outgoing piece drains toward the incoming one and the incoming one fills from the side it came from, so
   the indicator reads as one line sliding as the page scrolls. ### rows sit one step in. */
.doc-outline { gap: var(--doc-space-3); padding: var(--doc-space-6) var(--doc-space-5) var(--doc-space-5) var(--doc-space-2); }
.doc-outline-title { color: var(--dsx-label); --dsx-type-footnote-weight: 600; }
.doc-outline-list { gap: 0; border-left: var(--dsx-hairline, 1px) solid var(--dsx-separator); }
.doc-outline-item { align-items: stretch; gap: 0; }
.doc-outline-mark {
  width: 2px;
  margin-left: -1.5px;
  background: var(--dsx-accent);
  transform: scaleY(0);
  transform-origin: top;
  transition: transform var(--dsx-dur-base, 200ms) var(--dsx-ease, ease);
}
.doc-outline-item:has(~ .doc-outline-item > .doc-outline-link[aria-current="location"]) > .doc-outline-mark { transform-origin: bottom; }
.doc-outline-item:has(> .doc-outline-link[aria-current="location"]) > .doc-outline-mark { transform: scaleY(1); }
.doc-outline-link {
  flex: 1;
  background: none;
  padding: var(--doc-space-1) 0 var(--doc-space-1) var(--doc-space-3);
  color: var(--dsx-secondary-label);
  text-decoration: none;
  transition: color var(--dsx-dur-fast, 150ms) var(--dsx-ease, ease);
}
.doc-outline-sub > .doc-outline-link { padding-left: var(--doc-space-6); }
.doc-outline-link[aria-current="location"] { color: var(--dsx-accent); }
.doc-outline-aside {
  flex-direction: row;
  align-items: center;
  gap: var(--doc-space-2);
  margin: 0 var(--doc-space-5) 0 var(--doc-space-2);
  padding: var(--doc-space-4) 0 0 var(--doc-space-3);
  border-top: var(--dsx-hairline, 1px) solid var(--dsx-separator);
  color: var(--dsx-secondary-label);
  text-decoration: none;
}
/* a link keeps no pressed or focus tint once its move is done; the keyboard ring is the focus mark */
.doc-outline-link:is(:focus, :active):not(:focus-visible) { background: none; }
@media (hover: hover) {
  .doc-outline-link:hover, .doc-outline-aside:hover { color: var(--dsx-label); }
  .doc-outline-link[aria-current="location"]:hover { color: var(--dsx-accent); }
}
@media (prefers-reduced-motion: reduce) {
  .doc-outline-mark, .doc-outline-link { transition: none; }
}
`;

// ── write ───────────────────────────────────────────────────────────────────────────────────────────
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const routes = [];
const want = (r) => ONLY === null || ONLY.has(r);
const emit = (route, src, meta) => {
  const name = compName(route);
  writeFileSync(join(OUT, `${name}.dsx`), src);
  routes.push({ path: route, component: `docs.${name}`, meta, tabRoot: ["/", ...navData.tabs.map((t) => t.path), GUIDES_ROOT].includes(route) || undefined });
};
writeFileSync(join(repo, "Components", "DocsShell.dsx"), shell());
// THE NOT FOUND PAGE (dsx.config.json `notFound`): the server renders it with HTTP 404 and the client router opens it
// for an unmatched path, inside the docs frame. The console's arrangement: one EmptyState, then two ways out, a primary
// and a stock secondary button.
writeFileSync(join(OUT, "V2NotFound.dsx"), `<!-- GENERATED by site/dsx-compile.mjs: edit the generator, not this file. -->
<DocsShell area="home" route="">
  <head>
    <action as="home">dsx.module.route.reset({ path: '/' })</action>
    <action as="search">dsx.global.docsSearch = true</action>
  </head>
  <NavBar title="Page not found" large="true"/>
  <EmptyState icon="questionmark.circle" title="Nothing at This Address" message="The page may have moved, or the link may be mistyped. Search the docs for what you were after."/>
  <hstack style="align-self: center; gap: 8px; flex-wrap: wrap; justify-content: center">
    <button variant="prominent" label="Go Home" on:tap="dsx.action.home()"/>
    <button variant="bordered" label="Search" on:tap="dsx.action.search()"/>
  </hstack>
</DocsShell>
`);

// content pages
for (const p of allPages()) {
  if (p.route === "/packages" || p.route === "/app-review" || !want(p.route)) continue;
  const f = [join(CONTENT, `${p.route.slice(1)}.md`), join(CONTENT, p.route.slice(1), "index.md")].find(existsSync);
  const { meta, body } = f ? parseFrontMatter(readFileSync(f, "utf8")) : { meta: {}, body: "" };
  const title = meta.title ?? p.title;
  const description = meta.description ?? p.description;
  const sec = sectioned(toDsxMarkdown(body));
  emit(p.route, page({ route: p.route, area: p.section, title, description, md: `${p.route}.md`, toc: sec.toc, sections: sec.sections,
    head: sec.head, body: sec.body, noticeFor: p.section === "dsx" ? DSX_NOTICE : null }), { title, description });
}

// home: the vision, the two routes as the console's cards, the sample, popular packages, build and ship
if (want("/")) {
  // the packages people come for, from one config (data/home-highlights.json); only published catalog packages
  const highlights = JSON.parse(readFileSync(join(repo, "data", "home-highlights.json"), "utf8")).packages;
  const tiles = highlights.map((path) => {
    const p = allPkgs.find((x) => x.path === path);
    if (p === undefined || !p.published || !p.catalog) throw new Error(`data/home-highlights.json: ${path} is not a published catalog package`);
    return p;
  });
  const card = (p) => ({ id: p.url, title: p.title ?? titleOf(p), summary: p.summary, brand: p.icon?.brand ?? "", icon: p.icon?.symbol ?? GROUP_ICON(groupOf(p)), tint: p.icon?.tint ?? "", path: p.url });
  const sample = "## One document, three languages\n\nA screen is one `.dsx` file: markup for the structure, a `<style>` sheet in standard CSS, and JavaScript in its actions and holes. The same document runs on iOS, Android and the web.\n\n```dsx title=\"Components/Counter.dsx\"\n" + HOME_SAMPLE + "\n```";
  const head = mdVar("sample", sample)
    + `    <variable as="routes">return ${jsLiteral([
      { id: "dsx", title: "Build a native app with DSX", summary: "Start from nothing and build the whole app in DSX: screens, navigation, data and native features, for every platform at once.", icon: "chevron.left.forwardslash.chevron.right", status: "Research preview", statusIcon: "flask", path: "/dsx" },
      { id: "convert", title: "Convert your web app", summary: "Put the web app you already have in a native iOS and Android app, and call native features from its JavaScript.", icon: "globe", status: "Available today", statusIcon: "checkmark.circle.fill", path: "/convert" },
    ])}</variable>\n`
    + `    <variable as="features">return ${jsLiteral(tiles.map(card))}</variable>\n`
    + `    <variable as="ship">return ${jsLiteral([
      { id: "asc", title: "App Store Connect Key", summary: "The API key Despia uses to sign and upload iOS builds.", brand: "appstore.logo", icon: "", path: "/ship/app-store-connect" },
      { id: "play", title: "Google Play Service Account", summary: "The Service Account Despia uses to upload Android builds.", brand: "google.play.logo", icon: "", path: "/ship/google-play" },
      { id: "cli", title: "Despia CLI", summary: "Create, run, lint, build and ship from the terminal.", brand: "despia.logo", icon: "", path: "/dsx/cli" },
      { id: "agents", title: "Build with your AI coding tool", summary: "Connect the Despia MCP and install the Despia skills in Claude Code, Codex, Cursor and more.", brand: "despia.logo", icon: "", tools: true, path: "/dsx/agents" },
    ])}</variable>\n`;
  // a card's sentence is its slot text in the card's summary style, so it wraps instead of ending in an ellipsis
  const body = `  <grid bind="dsx.variable.routes" key="id" columns="adaptive" minimum="300" scroll="false" class="doc-cards">
    <ItemCard title="{{ dsx.this.title }}" icon="{{ dsx.this.icon }}" status="{{ dsx.this.status }}" statusIcon="{{ dsx.this.statusIcon }}" href="{{ dsx.this.path }}">
      <text class="dsx-item-card-summary" value="{{ dsx.this.summary }}"/>
    </ItemCard>
  </grid>
  <vstack class="doc-article doc-spaced">
    <markdown bind="dsx.variable.sample" copyCode="true"/>
  </vstack>
  <!-- the packages people come for: one inset grouped list (the console's package rows), then the whole catalog -->
  <ListGroup header="Native features" footer="Every package has one example for a DSX app and one for a converted web app.">
    <SettingsRow repeat="dsx.variable.features" key="id" title="{{ dsx.this.title }}" subtitle="{{ dsx.this.summary }}" chevron="true" tappable="true" on:tap="dsx.module.route.select({ path: dsx.this.path })">
      <IconTile slot="leading" brand="{{ dsx.this.brand }}" icon="{{ dsx.this.icon }}" tint="{{ dsx.this.tint }}" name="{{ dsx.this.title }}"/>
    </SettingsRow>
    <SettingsRow icon="shippingbox" title="See all packages" chevron="true" tappable="true" on:tap="dsx.module.route.select({ path: '/packages' })"/>
  </ListGroup>
  <ListGroup header="Build and ship"/>
  <grid bind="dsx.variable.ship" key="id" columns="adaptive" minimum="300" scroll="false" class="doc-cards">
    <ItemCard title="{{ dsx.this.title }}" brand="{{ dsx.this.brand }}" icon="{{ dsx.this.icon }}" href="{{ dsx.this.path }}">
      <text class="dsx-item-card-summary" value="{{ dsx.this.summary }}"/>
      <hstack class="doc-tool-logos" visible-if="dsx.this.tools" aria-label="Claude Code, Codex and Cursor">
        <image icon="claude.logo" aria-hidden="true"/>
        <image icon="codex.logo" aria-hidden="true"/>
        <image icon="cursor.logo" aria-hidden="true"/>
      </hstack>
    </ItemCard>
  </grid>`;
  const title = "Despia V4";
  const description = "Build real native apps for iOS, Android and the web from one document, or convert the web app you already have. AI agents can read, change and check the whole app.";
  emit("/", page({ route: "/", area: "home", title, description, md: "/index.md", head, body }), { title: "Despia docs", description });
}

// /guides: the Guides tab's root on a phone. The scaffold lists the Guides section's pages under its bar, as the
// console's Settings tab lists its pages; a wide window opens the section's first page instead.
if (want(GUIDES_ROOT)) {
  const title = "Guides";
  const description = "Convert a web app, run one inside Despia, and ship to the App Store and Google Play.";
  writeFileSync(join(OUT, `${compName(GUIDES_ROOT)}.dsx`), `<!-- GENERATED by site/dsx-compile.mjs: edit the generator, not this file. -->
<DocsShell area="guides" route="${GUIDES_ROOT}">
  <head>
    <action as="search">dsx.global.docsSearch = true</action>
  </head>
  <NavBar title="${title}" large="true">
    <button slot="trailing" icon="magnifyingglass" aria-label="Search the docs" shortcut="cmd+k" on:tap="dsx.action.search()"/>
  </NavBar>
</DocsShell>
`);
  routes.push({ path: GUIDES_ROOT, component: `docs.${compName(GUIDES_ROOT)}`, meta: { title, description, navigationTitle: title }, tabRoot: true });
}

// the package catalog: the console's own Package Explorer arrangement
if (want("/packages")) {
  // the console's catalog, the same rows its package explorer lists (data/packages.json `catalog`), so both say the
  // same number
  const items = pkgs.filter((p) => p.catalog).sort((a, b) => (GROUP_ORDER.indexOf(groupOf(a)) - GROUP_ORDER.indexOf(groupOf(b))) || (Number(b.published) - Number(a.published)) || titleOf(a).localeCompare(titleOf(b))).map((p) => ({ id: p.url, title: titleOf(p), summary: p.summary, category: groupOf(p), brand: p.icon?.brand ?? "", symbol: p.icon?.symbol ?? GROUP_ICON(groupOf(p)), tint: p.icon?.tint ?? "",
    status: p.published ? (p.maturity === "alpha" ? "Alpha" : "Available") : "Coming soon", statusIcon: p.published ? (p.maturity === "alpha" ? "flask" : "checkmark.circle.fill") : "clock",
    search: `${p.title} ${p.command} ${p.summary}`.toLowerCase(), path: p.url }));
  const cats = ["All"].concat(GROUP_ORDER.filter((g) => items.some((i) => i.category === g)));
  const head = `    <variable as="query">return ''</variable>
    <variable as="category">return 'All'</variable>
    <variable as="items">return ${jsLiteral(items)}</variable>
    <variable as="categories">return '${cats.join(",")}'</variable>
    <variable as="compact" computed="true">return dsx.screen.width &lt; 760</variable>
    <variable as="sections" computed="true">
      const q = String(dsx.variable.query || '').trim().toLowerCase()
      const rows = dsx.variable.items.filter(i => (dsx.variable.category == 'All' || i.category == dsx.variable.category) &amp;&amp; (q == '' || i.search.includes(q)))
      const names = rows.map(r => r.category).filter((x, i, all) => all.indexOf(x) == i)
      return names.map(n => ({ id: n, title: n, rows: rows.filter(r => r.category == n) }))
    </variable>
    <variable as="noMatch" computed="true">return dsx.variable.sections.length == 0</variable>
`;
  const body = `  <searchbar bind="dsx.variable.query" placeholder="Search ${items.length} packages"/>
  <scopeBar bind="dsx.variable.category" options="{{ dsx.variable.categories }}" visible-if="!dsx.variable.compact"/>
  <ListGroup visible-if="dsx.variable.compact">
    <SettingsRow icon="line.3.horizontal.decrease.circle" title="Category"><picker aria-label="Category" bind="dsx.variable.category" options="{{ dsx.variable.categories }}"/></SettingsRow>
  </ListGroup>
  <ListGroup visible-if="dsx.variable.noMatch">
    <SettingsRow icon="magnifyingglass" title="No package matches" subtitle="Try another word or category."/>
  </ListGroup>
  <stack repeat="dsx.variable.sections" key="id" visible-if="!dsx.variable.compact">
    <ListGroup header="{{ dsx.this.title }}"/>
    <grid bind="dsx.this.rows" key="id" columns="adaptive" minimum="300" scroll="false">
      <ItemCard title="{{ dsx.this.title }}" brand="{{ dsx.this.brand }}" icon="{{ dsx.this.symbol }}" tint="{{ dsx.this.tint }}"
                statusIcon="{{ dsx.this.statusIcon }}" status="{{ dsx.this.status }}" href="{{ dsx.this.path }}">
        <text class="dsx-item-card-summary" value="{{ dsx.this.summary }}"/>
      </ItemCard>
    </grid>
  </stack>
  <ListGroup repeat="dsx.variable.sections" key="id" header="{{ dsx.this.title }}" visible-if="dsx.variable.compact">
    <SettingsRow repeat="dsx.this.rows" key="id" title="{{ dsx.this.title }}" subtitle="{{ dsx.this.summary }}" chevron="true" tappable="true" on:tap="dsx.module.route.select({ path: dsx.this.path })">
      <IconTile slot="leading" brand="{{ dsx.this.brand }}" icon="{{ dsx.this.symbol }}" tint="{{ dsx.this.tint }}" name="{{ dsx.this.title }}"/>
    </SettingsRow>
  </ListGroup>`;
  const title = "Packages";
  const description = "Native features for your app, each with one API that works the same in a DSX app and in a converted web app.";
  emit("/packages", page({ route: "/packages", area: "packages", title, description, md: "/packages.md", head, body }), { title, description });
}

// one page per package: the console's product page arrangement (ProductHeader, About | At a Glance, then the reference)
const { packageMarkdownFor, needsBuild, linksOf: packageLinksOf } = await import("./packages.mjs");
const jsonLd = {};
for (const p of allPkgs) {
  if (!want(p.url) && !(ONLY && ONLY.has("/packages/*"))) continue;
  const glance = [
    { id: "status", icon: "checkmark.seal", title: "Status", value: p.published ? (p.maturity === "alpha" ? "Alpha" : "Available") : "Coming soon" },
    { id: "platforms", icon: "iphone", title: "Platforms", value: (p.targets ?? []).map((t) => ({ ios: "iOS", android: "Android", web: "Web", macos: "macOS" })[t] ?? t).join(", ") },
    ...(p.command ? [{ id: "call", icon: "curlybraces", title: "Call", value: `dsx.module.${p.command}` }] : []),
    { id: "group", icon: GROUP_ICON(groupOf(p)), title: "Category", value: groupOf(p) },
    { id: "build", icon: "hammer", title: "New app build", value: needsBuild(p) },
    { id: "setup", icon: "slider.horizontal.3", title: "Setup", value: p.config?.length ? `${p.config.length} setting${p.config.length === 1 ? "" : "s"}` : "Nothing to set" },
  ];
  const md = packageMarkdownFor(p);
  const sec = sectioned(toDsxMarkdown(p.description && md.startsWith(p.description) ? md.slice(p.description.length).trimStart() : md));
  const head = sec.head + `    <variable as="glance">return ${jsLiteral(glance)}</variable>\n`;
  const body = `  <ProductHeader title="${attr(titleOf(p))}" subtitle="${attr(p.summary)}" brand="${attr(p.icon?.brand ?? "")}" icon="${attr(p.icon?.symbol ?? GROUP_ICON(groupOf(p)))}" tint="${attr(p.icon?.tint ?? "")}"/>
  <grid columns="adaptive" minimum="420" scroll="false">
    <ListGroup header="About">
      <SettingsRow title="${attr(p.description ?? p.summary)}" lines="12"/>
    </ListGroup>
    <ListGroup header="At a Glance">
      <SettingsRow repeat="dsx.variable.glance" key="id" icon="{{ dsx.this.icon }}" title="{{ dsx.this.title }}" value="{{ dsx.this.value }}"/>
    </ListGroup>
  </grid>
${sec.body}`;
  // structured data for search engines: the page is a TechArticle about the package's code (SoftwareSourceCode), stamped into
  // the page head by scripts/assemble.mjs from public/jsonld.json (the same seam as the canonical link)
  jsonLd[p.url] = { "@context": "https://schema.org", "@type": "TechArticle", headline: `${titleOf(p)}: Despia package`, name: titleOf(p), description: p.summary,
    url: packageLinksOf(p).page, inLanguage: "en", articleSection: groupOf(p),
    isPartOf: { "@type": "WebSite", name: "Despia docs", url: SITE },
    publisher: { "@type": "Organization", name: "Despia", url: SITE_CFG.origin },
    about: { "@type": "SoftwareSourceCode", name: `dsx.module.${p.command ?? p.slug}`, programmingLanguage: "JavaScript", codeSampleType: "code snippet",
      runtimePlatform: (p.targets ?? []).map((t) => ({ ios: "iOS", android: "Android", web: "Web", macos: "macOS" })[t] ?? t) } };
  emit(p.url, page({ route: p.url, area: "packages", title: titleOf(p), description: p.summary, md: `${p.url}.md`, head, body, large: false, toc: sec.toc, sections: sec.sections,
    noticeFor: p.published ? null : [p.slug, "Coming soon", "This package is not available yet. Leave your email and we will tell you when it is.", "Get notified"] }), { title: titleOf(p), description: p.summary });
}

// the routes: v2 rows replace the rows they own, every other row (legacy, migrate, troubleshooting, app-review) stays
const cfgPath = join(repo, "dsx.config.json");
const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
const owned = new Set(routes.map((r) => r.path));
const v2Moves = JSON.parse(readFileSync(join(repo, "redirects", "v2-moves.json"), "utf8"));
const moved = (path) => path in v2Moves.moves || Object.keys(v2Moves.prefixes ?? {}).some((prefix) => path.startsWith(prefix));
cfg.routes = routes.concat(cfg.routes.filter((r) => !owned.has(r.path) && !moved(r.path) && !r.component.startsWith("docs.V2")));
cfg.entry = "V2Home";
cfg.notFound = "docs.V2NotFound";
// the console's route motion (framework router): a push slides on a phone, a fade and small rise on a wide window, tabs cross-fade
cfg.router = { ...(cfg.router ?? {}), transition: "dsx" };
cfg.siteUrl = SITE;
writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + "\n");

// canonical links and sitemap rows for the V4 pages: scripts/compile.mjs writes public/canonical.json and
// public/sitemap.xml for the spaces it still builds, and assemble.mjs stamps <link rel="canonical"> from the former, so
// the V4 rows join both here (a row's lastmod is the last commit of its source, else the build's date)
{
  const lastCommit = new Map();
  try {
    let date = null;
    for (const line of execFileSync("git", ["log", "--format=@%cI", "--name-only", "--", "content-v2", "data/packages.json"], { cwd: repo, encoding: "utf8", maxBuffer: 64 << 20 }).split("\n")) {
      if (line.startsWith("@")) date = line.slice(1);
      else if (line !== "" && !lastCommit.has(line)) lastCommit.set(line, date);
    }
  } catch { /* not a git checkout: the build date stands */ }
  const now = new Date().toISOString();
  const sourceOf = (route) => {
    if (route.startsWith("/packages/")) return "data/packages.json";
    if (route === "/") return "content-v2/index.md";
    const f = [`content-v2${route}.md`, `content-v2${route}/index.md`].find((x) => existsSync(join(repo, x)));
    return f ?? null;
  };
  const canonicalFile = join(repo, "public", "canonical.json");
  const canonical = existsSync(canonicalFile) ? JSON.parse(readFileSync(canonicalFile, "utf8")) : {};
  for (const r of routes) canonical[r.path] = SITE + (r.path === "/" ? "" : r.path);
  writeFileSync(canonicalFile, JSON.stringify(canonical) + "\n");
  // each package page's structured data, dated by its source's last commit
  const ldFile = join(repo, "public", "jsonld.json");
  const ld = existsSync(ldFile) ? JSON.parse(readFileSync(ldFile, "utf8")) : {};
  for (const [route, doc] of Object.entries(jsonLd)) ld[route] = { ...doc, dateModified: lastCommit.get(sourceOf(route)) ?? now };
  writeFileSync(ldFile, JSON.stringify(ld) + "\n");
  const sitemapFile = join(repo, "public", "sitemap.xml");
  const prior = existsSync(sitemapFile) ? readFileSync(sitemapFile, "utf8") : "";
  const rows = (prior.match(/  <url>.*<\/url>/g) ?? []).filter((row) => !routes.some((r) => row.includes(`<loc>${SITE + (r.path === "/" ? "" : r.path)}</loc>`)));
  for (const r of routes) rows.push(`  <url><loc>${SITE + (r.path === "/" ? "" : r.path)}</loc><lastmod>${lastCommit.get(sourceOf(r.path)) ?? now}</lastmod></url>`);
  writeFileSync(sitemapFile, [`<?xml version="1.0" encoding="UTF-8"?>`, `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`, ...rows, `</urlset>`, ""].join("\n"));
}
writeFileSync(join(repo, "Components", "DocsShell.css"), DOCS_CSS);
// ── the renderer-independent outputs, from the same sources (site/build.mjs writes them; this copies them into public/,
//    which the build folds into dist): docs-index.json (the export the general Despia MCP reads), llms.txt, and the
//    Markdown twin of every v2 page at <route>.md and /md/<route>.md (the worker's page fetch reads the latter).
const v2out = join(repo, "dist-v2");
if (existsSync(join(v2out, "docs-index.json"))) {
  const pub = join(repo, "public");
  const index = JSON.parse(readFileSync(join(v2out, "docs-index.json"), "utf8"));
  writeFileSync(join(pub, "docs-index.json"), JSON.stringify(index));
  for (const pg of index.pages) {
    const twin = readFileSync(join(v2out, pg.url === "/" ? "index.md" : `${pg.url.slice(1)}.md`), "utf8");
    for (const f of [join(pub, pg.url === "/" ? "index.md" : `${pg.url.slice(1)}.md`), join(pub, "md", pg.url === "/" ? "index.md" : `${pg.url.slice(1)}.md`)]) {
      mkdirSync(dirname(f), { recursive: true });
      writeFileSync(f, twin);
    }
  }
  const spaces = ["", "## Other spaces", "",
    `- [Releases](${SITE}/releases/llms.txt): release notes`,
    `- [App Review](${SITE}/app-review/llms.txt): Apple and Google review guidelines`, ""];
  writeFileSync(join(pub, "llms.txt"), readFileSync(join(v2out, "llms.txt"), "utf8") + spaces.join("\n"));
  // the whole V4 docs as one Markdown file, page by page in the export's order (the same text as each page's .md twin)
  writeFileSync(join(pub, "llms-full.txt"), [`# Despia docs, full text`, "", `> Every page of ${SITE} as Markdown. Index: ${SITE}/llms.txt`, ""]
    .concat(index.pages.map((pg) => `---\n\n# ${pg.title}\n\nSource: ${SITE}${pg.url === "/" ? "" : pg.url}\n\n${pg.markdown.trim()}\n`)).join("\n"));
  console.log(`[docs.v2] export: public/docs-index.json (${index.pages.length} pages), llms.txt, Markdown twins`);
} else console.warn("[docs.v2] dist-v2/docs-index.json missing: run `node site/build.mjs` first for the export and the twins");
console.log(`[docs.v2] ${routes.length} page(s) -> Components/v2, routes merged into dsx.config.json (${cfg.routes.length} rows)`);
