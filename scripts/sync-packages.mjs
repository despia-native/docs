#!/usr/bin/env node
//
//  sync-packages.mjs - the package facts every package page is generated from.
//
//  The framework already turns each package's manifest (dsx.json) into ONE structured document,
//  `despia.package-docs` v1 (OpenSource/Engine/TypeScript/packages/project/src/package-docs.ts, a pure
//  function over package-docs-data.generated.ts, which CI keeps in step with ClosedSource/DSX/Modules).
//  This script runs that same function and keeps the part a docs page needs in data/packages.json, so a
//  fact is written once, in the manifest, and a page can never drift from it.
//
//  Read from git, never from a working tree (no checkout needed, nobody's uncommitted edits):
//    DESPIA_FRAMEWORK      a clone of the framework repository (despia-native/despia-framework)
//    DESPIA_FRAMEWORK_REF  the ref to read (default origin/dev)
//  `--check` exits 1 when data/packages.json differs from what the ref says (CI drift gate).
//

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repo = process.env.DESPIA_FRAMEWORK;
const ref = process.env.DESPIA_FRAMEWORK_REF ?? "origin/dev";
const check = process.argv.includes("--check");
if (repo === undefined || repo === "") {
  console.error("[docs.sync-packages] set DESPIA_FRAMEWORK to a clone of the framework repository");
  process.exit(1);
}
const git = (...args) => execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", maxBuffer: 256 << 20 });
const commit = git("rev-parse", ref).trim();
const SRC = "OpenSource/Engine/TypeScript/packages/project/src";

const tmp = mkdtempSync(join(tmpdir(), "despia-pkgdocs-"));
try {
  for (const f of ["package-docs.ts", "package-docs-data.generated.ts", "article.ts"]) writeFileSync(join(tmp, f), git("show", `${commit}:${SRC}/${f}`));
  const { PACKAGE_SOURCES } = await import(pathToFileURL(join(tmp, "package-docs-data.generated.ts")).href);
  const { buildPackageDocs } = await import(pathToFileURL(join(tmp, "package-docs.ts")).href);

  // The generated data drops `maturity` and `published` (catalog facts, not reference facts); read them from each dsx.json.
  const manifestOf = (path) => {
    try { return JSON.parse(git("show", `${commit}:ClosedSource/DSX/Modules/${path}/dsx.json`)); } catch { return {}; }
  };
  const keepParam = (p) => ({ name: p.name, type: p.type, optional: p.optional, description: p.description });
  // The catalog the console's package explorer lists: one row per capability option, named by its primary package
  // (capabilities.json, the same reading as the console's sync-catalog). A library option has no command, and is still a
  // package a customer adds.
  const capabilities = JSON.parse(git("show", `${commit}:OpenSource/Documentation/reference/capabilities.json`));
  const catalogPaths = new Set(capabilities.options.map((o) => o.primary ?? o.footprint?.modules?.[0] ?? o.id));
  // The console's package page (/explore/<id>) for each package: the first capability option whose primary package it is, the
  // same reading as the API's PACKAGE_LISTING_IDS (ClosedSource/Cloud/api/scripts/build-package-catalog.mjs).
  const listingIds = {};
  for (const o of capabilities.options ?? []) {
    const p = o.primary ?? o.footprint?.modules?.[0] ?? null;
    if (typeof p === "string" && typeof o.id === "string" && !(p in listingIds)) listingIds[p] = o.id;
  }
  // A setting's secret rule and update class, read the way project-core reads config.json (package.ts fieldsOfConfig): a
  // `secret` type or flag, a credential-like key name (project-core's own NAME_RULE, read from its source) unless the reviewed
  // overrides say otherwise; a secret, or a key that declares no class, changes only with a new build.
  const ruleSrc = /export const NAME_RULE = \/(.+)\/([a-z]*);/.exec(git("show", `${commit}:OpenSource/Engine/TypeScript/packages/project-core/src/package.ts`));
  if (ruleSrc === null) throw new Error("project-core NAME_RULE not found: the secret rule moved");
  const NAME_RULE = new RegExp(ruleSrc[1], ruleSrc[2]);
  const { _note: _overridesNote, ...secretOverrides } = JSON.parse(git("show", `${commit}:ClosedSource/Cloud/api/scripts/secret-overrides.json`));
  const configOf = (path) => {
    // a package without settings has no config.json: that is an empty schema, not an error worth a line
    try { return JSON.parse(execFileSync("git", ["-C", repo, "show", `${commit}:ClosedSource/DSX/Modules/${path}/config.json`], { encoding: "utf8", maxBuffer: 16 << 20, stdio: ["ignore", "pipe", "ignore"] })); } catch { return {}; }
  };
  const settingOf = (path, raw, c) => {
    const spec = raw[c.key] !== null && typeof raw[c.key] === "object" ? raw[c.key] : {};
    const type = typeof spec.type === "string" ? spec.type : c.type;
    const override = secretOverrides[`${path}:${c.key}`];
    let secret = type === "secret" || spec.secret === true || (NAME_RULE.test(c.key) && override !== false);
    if (override !== undefined) secret = override;
    const updates = secret || spec.updates === undefined ? "build" : spec.updates;
    return { key: c.key, label: c.label, description: c.description, type: c.type, secret, updates,
      ...(Array.isArray(spec.options) ? { options: spec.options.map((o) => (o !== null && typeof o === "object" ? o.value ?? o.label : o)) } : {}) };
  };
  const packages = [];
  for (const src of PACKAGE_SOURCES) {
    const command = typeof src.manifest.command === "string" && src.manifest.command !== "" ? src.manifest.command : null;
    if (command === null && !catalogPaths.has(src.path)) continue;
    const d = buildPackageDocs(src, { all: PACKAGE_SOURCES });
    const raw = manifestOf(src.path);
    const rawActions = src.manifest.actions ?? {};
    const implemented = d.targets.filter((t) => t.implemented).map((t) => t.target);
    const icon = raw.listing?.icon ?? {};
    packages.push({
      command,
      // the catalog address (package-docs.ts packageSlugs: the last word, unique across the catalog) and its page
      slug: d.slug,
      url: d.url,
      // in the catalog: the manifest carries a `listing` (what the console's package explorer shows)
      listed: raw.listing !== undefined && raw.listing !== null,
      catalog: catalogPaths.has(src.path),
      icon: { symbol: icon.symbol ?? null, tint: icon.tint ?? null, brand: icon.brand ?? null },
      path: src.path,
      title: d.title,
      summary: d.summary,
      description: d.description,
      category: d.category,
      maturity: typeof raw.maturity === "string" ? raw.maturity : "unrated",
      published: raw.published === true,
      targets: implemented,
      deviceClasses: d.deviceClasses,
      whenToUse: d.whenToUse,
      nativeValue: d.nativeValue,
      // `reach` (an action-level manifest key) names the surfaces an action is delivered to; an EMPTY list means the action
      // is app-internal (never reaches a page), a list without the page names other surfaces (watch, imessage).
      actions: d.actions.map((a) => {
        const decl = rawActions[a.name] ?? {};
        const reach = Array.isArray(decl.reach) ? decl.reach : null;
        return {
          name: a.name,
          call: a.call,
          description: a.description,
          whenToUse: a.whenToUse,
          whenNotToUse: a.whenNotToUse,
          since: a.since,
          platforms: Array.isArray(decl.platforms) ? decl.platforms : implemented,
          page: reach === null || reach.includes("page") || reach.includes("web"),
          reach,
          stream: decl.stream === true || decl.events !== undefined,
          params: a.params.map(keepParam),
          result: a.result.map(keepParam),
          errors: a.errors.map((e) => ({ code: e.code, message: e.message, description: e.description, whatToDo: e.whatToDo })),
          broadcasts: a.broadcasts,
          examples: a.examples.filter((x) => x.valid).map((x) => ({ title: x.title, args: x.args, result: x.result })),
        };
      }),
      events: d.events.map((e) => ({ name: e.name, description: e.description, payload: e.payload.map(keepParam) })),
      errors: d.errors.map((e) => ({ code: e.code, message: e.message, description: e.description, whatToDo: e.whatToDo })),
      listingId: listingIds[src.path] ?? null,
      config: ((raw) => d.config.filter((c) => c.editable).map((c) => settingOf(src.path, raw, c)))(configOf(src.path)),
      permissions: d.permissions,
    });
  }
  // A catalog package the reference generator leaves out (a commercial package) still has its store listing: its page is
  // that listing, with no reference.
  for (const path of [...catalogPaths].filter((x) => !packages.some((p) => p.path === x))) {
    const raw = manifestOf(path);
    const listing = raw.listing ?? null;
    const option = capabilities.options.find((o) => (o.primary ?? o.footprint?.modules?.[0] ?? o.id) === path);
    const slug = String(raw.command ?? path.split("/").pop()).toLowerCase();
    if (listing === null || packages.some((p) => p.slug === slug)) { console.warn(`[docs.sync-packages] catalog option ${path} has no listing or a taken slug: left out`); continue; }
    const icon = listing.icon ?? {};
    packages.push({
      command: typeof raw.command === "string" && raw.command !== "" ? raw.command : null,
      slug, url: `/packages/${slug}`, listed: true, catalog: true, listingId: listingIds[path] ?? null,
      icon: { symbol: icon.symbol ?? null, tint: icon.tint ?? null, brand: icon.brand ?? null },
      path, title: listing.title ?? option?.title ?? raw.name, summary: listing.summary ?? "", description: listing.description ?? raw.description ?? "",
      category: listing.category ?? null, maturity: typeof raw.maturity === "string" ? raw.maturity : "unrated", published: raw.published === true,
      targets: [], deviceClasses: [], whenToUse: raw.docs?.whenToUse ?? "", nativeValue: "", actions: [], events: [], errors: [], config: [], permissions: [],
    });
  }
  const key = (p) => p.command ?? p.slug;
  packages.sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : a.path < b.path ? -1 : 1));
  // one package per line: a diff names the package that changed
  const out = `{"_note": "GENERATED by scripts/sync-packages.mjs from the framework's despia.package-docs documents. Regenerate, never edit.",\n"source": ${JSON.stringify({ ref, commit })},\n"packages": [\n${packages.map((p) => JSON.stringify(p)).join(",\n")}\n]}\n`;
  const file = join(root, "data", "packages.json");
  if (check) {
    let current = "";
    try { current = readFileSync(file, "utf8"); } catch { /* missing */ }
    const strip = (s) => s.replace(/"source": \{[^}]*\}/, "");
    if (strip(current) !== strip(out)) { console.error(`[docs.sync-packages] data/packages.json is stale against ${ref} (${commit.slice(0, 10)}): run npm run packages`); process.exit(1); }
    console.log(`[docs.sync-packages] data/packages.json matches ${ref} (${commit.slice(0, 10)})`);
  } else {
    writeFileSync(file, out);
    console.log(`[docs.sync-packages] ${packages.length} package(s) from ${ref} ${commit.slice(0, 10)} -> data/packages.json`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
