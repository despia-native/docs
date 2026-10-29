#!/usr/bin/env node
//
//  check-migrate-map.mjs - the V3 to V4 feature map is true to the package catalog snapshot.
//  Every `dsx.module.<command>` in a row's api names a command in data/integrations.json (or a service listed below),
//  every Core/ or Mandatory/ package path names a module in that snapshot, and every `docs` link names a catalog page.
//  Exit 1 lists each row that names something the snapshot does not have.
//
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isHiddenLegacy } from "./hidden.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => JSON.parse(readFileSync(join(root, f), "utf8"));
const map = read("migrate/map.json");
const integrationsDoc = read("data/integrations.json");
const integrations = integrationsDoc.packages;
const catalog = read("data/packages.json").packages;
// open-source services reached as dsx.module.<command> that are not catalog modules
const SERVICES = new Set(["sync"]);
const commands = new Set([...integrations.map((p) => p.command), ...catalog.map((p) => p.command).filter(Boolean), ...SERVICES]);
const paths = new Set([...integrationsDoc.modulePaths, ...integrations.map((p) => p.package), ...catalog.map((p) => p.path)]);
const slugs = new Set(catalog.map((p) => p.slug));
const actionsOf = new Map();
for (const p of [...integrations.map((x) => [x.command, x.actions]), ...catalog.filter((x) => x.command).map((x) => [x.command, x.actions.map((a) => a.name)])]) {
  const set = actionsOf.get(p[0]) ?? new Set();
  for (const a of p[1]) { set.add(a); set.add(a.split(".")[0]); }
  actionsOf.set(p[0], set);
}
const problems = [];
for (const e of map.entries.filter((x) => !isHiddenLegacy(x.legacyPath))) {
  const v4 = e.v4 ?? {};
  for (const m of String(v4.api ?? "").matchAll(/dsx\.module\.(\w+)/g)) if (!commands.has(m[1])) problems.push(`${e.legacyPath}: api names dsx.module.${m[1]}, which is not in the catalog`);
  // dsx.module.<command>.<action>: when the catalog lists the command's actions, the action is one of them (a dotted action matches by its first word)
  for (const m of String(v4.api ?? "").matchAll(/dsx\.module\.(\w+)\.(\w+)/g)) {
    const known = actionsOf.get(m[1]);
    if (known !== undefined && known.size > 0 && !known.has(m[2])) problems.push(`${e.legacyPath}: api names dsx.module.${m[1]}.${m[2]}, which is not an action of ${m[1]}`);
  }
  for (const p of String(v4.package ?? "").split(/[\s,]+/).filter((x) => /^(Core|Mandatory)\//.test(x))) if (!paths.has(p)) problems.push(`${e.legacyPath}: package ${p} is not in the catalog`);
  const d = /^\/packages\/([\w-]+)/.exec(v4.docs ?? "");
  if (d !== null && !slugs.has(d[1])) problems.push(`${e.legacyPath}: docs ${v4.docs} is not a catalog page`);
}
if (problems.length > 0) { console.error(problems.join("\n")); console.error(`[docs.check-migrate-map] ${problems.length} problem(s)`); process.exit(1); }
console.log(`[docs.check-migrate-map] ${map.entries.length} rows are true to the catalog snapshot`);
