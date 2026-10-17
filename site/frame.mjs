//
//  frame.mjs - the page header every docs page draws inside DocsShell, shared by both compilers (site/dsx-compile.mjs for
//  the V4 pages, scripts/compile.mjs for Legacy, Migration, Troubleshooting, Releases and App Review): the NavBar (title,
//  description, search, Copy page, the page menu) and the "..." menu's rows.
//
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_CFG = JSON.parse(readFileSync(join(repo, "data", "site.json"), "utf8"));
const SITE = `${SITE_CFG.origin}${SITE_CFG.base}`;

// an attribute value: XML-escaped, and no {{ }} hole by accident
export const attr = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\{\{/g, "{ {");

export function pageMenu(md, toc = []) {
  const ask = encodeURIComponent(`Read ${SITE}${md} so I can ask questions about it.`);
  const quote = (t) => t.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  const outline = toc.filter((t) => t.level === 2);
  const rows = outline.length >= 2
    ? `{ header: true, title: 'On this page' }, ${outline.map((t) => `{ title: '${attr(quote(t.title))}', href: '#${t.id}' }`).join(", ")}, { separator: true }, `
    : "";
  return `[${rows}{ header: true, title: 'This page' }, { title: 'View as Markdown', icon: 'doc.plaintext', href: '${md}' }, { separator: true }, { header: true, title: 'Ask about it in' }, { title: 'Claude', icon: 'text.bubble', href: 'https://claude.ai/new?q=${ask}' }, { title: 'ChatGPT', icon: 'bubble.left', href: 'https://chatgpt.com/?q=${ask}' }]`;
}

// the page menu's rows as a head variable: a heading's own punctuation (a question mark, a colon) is string data there,
// never read as expression syntax
export const pageMenuVar = (md, toc = []) => (md !== "" ? `    <variable as="pageMenu">return ${pageMenu(md, toc)}</variable>\n` : "");

// `title` and `description` are attribute text, or a ready {{ }} hole when the caller carries the text in a variable
export const navBar = ({ title, description = "", md = "", large = true, copy = false, toc = [] }) => {
  const text = (v) => (/^\{\{ .* \}\}$/.test(v) ? v : attr(v));
  const menu = md !== "" ? `    <menu slot="trailing" menu="{{ dsx.variable.pageMenu }}">
      <button icon="ellipsis.circle" aria-label="Page options"/>
    </menu>
` : "";
  return `  <NavBar title="${text(title)}"${large ? ` large="true"${description !== "" ? ` description="${text(description)}"` : ""}` : ""}>
    <button slot="trailing" icon="magnifyingglass" aria-label="Search the docs" shortcut="cmd+k" on:tap="dsx.action.search()"/>
${copy ? `    <CopyButton slot="trailing" value="{{ dsx.variable.pageText }}" label="Copy page"/>\n` : ""}${menu}  </NavBar>`;
};
