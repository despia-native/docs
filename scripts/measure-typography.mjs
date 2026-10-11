//
//  measure-typography.mjs <origin> <out.json> [route ...]: measures the reading typography and the vertical rhythm of
//  served docs pages in Chromium, at 1440 and 390, light and dark: the reading column and its gaps to the sidebar and
//  the outline, the body type and its measure (characters per line), the heading scale and the space above and below
//  every heading level, paragraph, list, code block, table, callout, card and image spacing, inline code, and the
//  outline column. Prints one table per page and a summary; the JSON holds every raw measurement.
//
//  PLAYWRIGHT_REQUIRE=<a package.json path whose node_modules holds playwright-core> (default: the framework checkout
//  the docs build links in node_modules).
//
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const require = createRequire(process.env.PLAYWRIGHT_REQUIRE ?? resolve("node_modules/@despia-native/cli/package.json"));
const { chromium } = require("playwright-core");

const [origin = "http://127.0.0.1:4173", outPath = "typography.json", ...rest] = process.argv.slice(2);
const ROUTES = rest.length > 0 ? rest : ["/", "/dsx", "/dsx/data", "/packages/revenuecat", "/convert", "/web-apps/native-features", "/guides", "/web-apps/packages"];
const WIDTHS = [{ name: "desktop", width: 1440, height: 900 }, { name: "phone", width: 390, height: 844 }];
const SCHEMES = ["light", "dark"];

/* Runs in the page. Every block is classified, and the distance between consecutive blocks is recorded by pair kind. */
function measure() {
  const px = (v) => Math.round(parseFloat(v) * 100) / 100;
  const rect = (el) => el?.getBoundingClientRect() ?? null;
  const out = { column: {}, body: null, headings: [], pairs: [], lists: [], code: [], inlineCode: null, outline: null, title: null };
  const pane = document.querySelector(".dsx-scaffold-content");
  const article = document.querySelector(".doc-article");
  const sidebar = document.querySelector(".dsx-scaffold-sidebar");
  const outline = document.querySelector(".doc-outline, .dsx-scaffold-inspector");
  const shown = (el) => el !== null && el.getClientRects().length > 0 && rect(el).width > 0 && getComputedStyle(el).visibility !== "hidden";
  if (article !== null) {
    const a = rect(article), p = rect(pane);
    out.column = {
      articleLeft: px(a.left), articleWidth: px(a.width),
      padStart: px(a.left - p.left), padEnd: px(p.right - a.right),
      sidebarGap: shown(sidebar) ? px(a.left - rect(sidebar).right) : null,
      outlineGap: shown(outline) ? px(rect(outline).left - a.right) : null,
      outlineWidth: shown(outline) ? px(rect(outline).width) : null,
    };
  }
  const kind = (el) => {
    const owner = el.getAttribute("data-dsx-owner") ?? "";
    if (el.getAttribute("role") === "heading") return `h${el.getAttribute("aria-level") ?? "?"}`;
    if (owner === "CodeBlock" || el.classList.contains("dsx-codeblock")) return "code";
    if (owner === "MarkdownTable") return "table";
    if (owner === "MarkdownList") return "list";
    if (owner === "Callout" || el.classList.contains("dsx-callout")) return "callout";
    if (owner === "LinkCard") return "card";
    if (owner === "MarkdownTabs") return "tabs";
    if (owner === "MarkdownSteps") return "steps";
    if (owner === "Figure" || el.tagName === "IMG" || el.classList.contains("dsx-image")) return "image";
    if (el.classList.contains("dsx-text")) return "p";
    if (el.classList.contains("dsx-markdown")) return null;
    return el.classList.contains("dsx-grid") ? "grid" : "other";
  };
  // the reading flow: the markdown blocks and the article's own non-markdown children, in document order
  const blocks = [];
  if (article !== null) {
    const walk = (el) => {
      for (const c of el.children) {
        if (!shown(c)) continue;
        if (c.classList.contains("dsx-markdown")) { for (const b of c.children) if (shown(b)) blocks.push(b); }
        else if (c.classList.contains("doc-section") || c.classList.contains("doc-subsection")) walk(c);
        else blocks.push(c);
      }
    };
    walk(article);
  }
  for (let i = 0; i < blocks.length; i += 1) {
    const el = blocks[i], k = kind(el);
    if (k === null) continue;
    if (i > 0) {
      const prev = blocks[i - 1];
      out.pairs.push({ from: kind(prev), to: k, gap: px(rect(el).top - rect(prev).bottom) });
    }
    if (k.startsWith("h")) {
      const cs = getComputedStyle(el);
      out.headings.push({ level: k, size: px(cs.fontSize), leading: px(cs.lineHeight), weight: cs.fontWeight, tracking: cs.letterSpacing,
        above: i > 0 ? px(rect(el).top - rect(blocks[i - 1]).bottom) : null,
        below: i + 1 < blocks.length ? px(rect(blocks[i + 1]).top - rect(el).bottom) : null });
    }
    if (k === "p" && out.body === null && (el.textContent ?? "").length > 120) {
      const cs = getComputedStyle(el);
      const ctx = document.createElement("canvas").getContext("2d");
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
      const avg = ctx.measureText(text).width / text.length;
      out.body = { size: px(cs.fontSize), leading: px(cs.lineHeight), ratio: px(parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)),
        tracking: cs.letterSpacing, color: cs.color, width: px(rect(el).width), cpl: Math.round(rect(el).width / avg), family: cs.fontFamily.split(",")[0] };
    }
    if (k === "list") {
      const items = [...el.children].filter(shown);
      const gaps = items.slice(1).map((it, j) => px(rect(it).top - rect(items[j]).bottom));
      const text = el.querySelector(".dsx-text");
      out.lists.push({ items: items.length, itemGap: gaps.length ? Math.min(...gaps) : null, indent: text ? px(rect(text).left - rect(el).left) : null });
    }
    if (k === "code") {
      const lines = el.querySelector(".dsx-codeblock-lines"), line = el.querySelector(".dsx-codeblock-line");
      const cs = lines ? getComputedStyle(lines) : null, lcs = line ? getComputedStyle(line) : null;
      const span = line?.querySelector("span");
      out.code.push({ padTop: cs ? px(cs.paddingTop) : null, padBottom: cs ? px(cs.paddingBottom) : null,
        padInline: line ? px(rect(line).left - rect(el).left) : null, size: span ? px(getComputedStyle(span).fontSize) : null,
        leading: line ? px(rect(line).height) : null, radius: getComputedStyle(el).borderTopLeftRadius });
    }
  }
  const chip = article?.querySelector(".dsx-markdown code");
  if (chip) {
    const cs = getComputedStyle(chip), host = getComputedStyle(chip.parentElement);
    out.inlineCode = { size: px(cs.fontSize), ratio: px(parseFloat(cs.fontSize) / parseFloat(host.fontSize)), padInline: px(cs.paddingLeft), radius: cs.borderTopLeftRadius, bg: cs.backgroundColor };
  }
  const titleEl = document.querySelector(".dsx-navbar-large .dsx-page-header-line [role=heading], .dsx-navbar-large h1, .dsx-product-header [role=heading]");
  if (titleEl) { const cs = getComputedStyle(titleEl); out.title = { size: px(cs.fontSize), leading: px(cs.lineHeight), weight: cs.fontWeight, tracking: cs.letterSpacing }; }
  const nav = document.querySelector("nav.doc-outline, .doc-outline");
  if (nav && shown(nav)) {
    const links = [...nav.querySelectorAll("a")].filter(shown);
    const l = links[0] ? getComputedStyle(links[0]) : null;
    out.outline = { links: links.length, size: l ? px(l.fontSize) : null, leading: l ? px(l.lineHeight) : null,
      rowGap: links.length > 1 ? px(rect(links[1]).top - rect(links[0]).bottom) : null, label: nav.getAttribute("aria-label") };
  }
  return out;
}

const median = (xs) => { const v = xs.filter((x) => typeof x === "number").sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : null; };
const range = (xs) => { const v = xs.filter((x) => typeof x === "number"); return v.length ? (Math.min(...v) === Math.max(...v) ? `${v[0]}` : `${Math.min(...v)}..${Math.max(...v)}`) : "-"; };

const browser = await chromium.launch();
const results = [];
try {
  for (const w of WIDTHS) for (const scheme of SCHEMES) {
    const ctx = await browser.newContext({ viewport: { width: w.width, height: w.height }, colorScheme: scheme });
    await ctx.route(/api\.despia\.com/, (r) => r.abort());
    const page = await ctx.newPage();
    for (const route of ROUTES) {
      await page.goto(origin + route, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);
      results.push({ route, viewport: w.name, scheme, ...(await page.evaluate(measure)) });
    }
    await ctx.close();
  }
} finally { await browser.close(); }
writeFileSync(outPath, JSON.stringify(results, null, 1));

// one summary row per page and viewport (light; dark is compared for drift)
const lines = ["| page | vw | col w | pad s/e | side gap | outline gap | body px/lh | CPL | h2 px | above h2 | below h2 | above h3 | below h3 | p→p | →code | code→ | →table | →card | list item gap | code pad | chip |", "|" + " --- |".repeat(21)];
for (const r of results.filter((x) => x.scheme === "light")) {
  const hs = (lvl, key) => range(r.headings.filter((h) => h.level === lvl).map((h) => h[key]));
  const pair = (f) => range(r.pairs.filter(f).map((p) => p.gap));
  const c = r.column;
  lines.push(`| ${r.route} | ${r.viewport} | ${c.articleWidth ?? "-"} | ${c.padStart ?? "-"}/${c.padEnd ?? "-"} | ${c.sidebarGap ?? "-"} | ${c.outlineGap ?? "-"} | ${r.body ? `${r.body.size}/${r.body.leading}` : "-"} | ${r.body?.cpl ?? "-"} | ${hs("h2", "size")} | ${hs("h2", "above")} | ${hs("h2", "below")} | ${hs("h3", "above")} | ${hs("h3", "below")} | ${pair((p) => p.from === "p" && p.to === "p")} | ${pair((p) => p.to === "code" && p.from === "p")} | ${pair((p) => p.from === "code" && p.to === "p")} | ${pair((p) => p.to === "table")} | ${pair((p) => p.to === "card")} | ${range(r.lists.map((l) => l.itemGap))} | ${r.code[0] ? `${r.code[0].padTop}/${r.code[0].padInline}` : "-"} | ${r.inlineCode ? `${r.inlineCode.size}px ${r.inlineCode.ratio}` : "-"} |`);
}
const drift = results.filter((x) => x.scheme === "dark").filter((d) => {
  const l = results.find((x) => x.scheme === "light" && x.route === d.route && x.viewport === d.viewport);
  return JSON.stringify({ ...l, scheme: 0, body: { ...l.body, color: 0 }, inlineCode: l.inlineCode && { ...l.inlineCode, bg: 0 } })
    !== JSON.stringify({ ...d, scheme: 0, body: { ...d.body, color: 0 }, inlineCode: d.inlineCode && { ...d.inlineCode, bg: 0 } });
}).map((d) => `${d.route} ${d.viewport}`);
console.log(lines.join("\n"));
console.log(`\nlight/dark geometry drift: ${drift.length === 0 ? "none" : drift.join(", ")}`);
console.log(`median body CPL desktop: ${median(results.filter((r) => r.viewport === "desktop").map((r) => r.body?.cpl))}`);
