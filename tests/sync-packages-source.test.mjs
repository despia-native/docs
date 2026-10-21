import test from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

function runFixture(collision = false, onlyVisibility = false) {
  const tmp = mkdtempSync(join(tmpdir(), "despia-docs-sync-test-"));
  const repo = join(tmp, "framework");
  const docs = join(tmp, "docs");
  const put = (file, text) => { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, text); };
  const git = (...args) => execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  try {
    const src = join(repo, "OpenSource/Engine/TypeScript/packages/project/src");
    put(join(src, "package-docs-data.generated.ts"), 'export const PACKAGE_SOURCES = [{path:"Core/Owner/Modules/Vendor",manifest:{command:"vendor",actions:{inspect:{}}}}];');
    put(join(src, "package-docs.ts"), 'import { document } from "./nested/document.ts"; export const buildPackageDocs = (source) => ({...document, slug:source.manifest.command ?? source.manifest.name.toLowerCase(), url:"/packages/"+(source.manifest.command ?? source.manifest.name.toLowerCase()), command: source.path.endsWith("/Vendor") ? document.command : source.path.includes("/Modules/") ? "account." + source.manifest.command : source.manifest.command});');
    put(join(src, "nested/document.ts"), 'import { command } from "../identity.ts"; export const document = {command,slug:"vendor",url:"/packages/vendor",title:"Vendor",targets:[],actions:[],events:[],errors:[],config:[],permissions:[]};');
    put(join(src, "identity.ts"), 'export const command = "account.vendor";');
    put(join(repo, "ClosedSource/DSX/Modules/Core/Owner/Modules/Vendor/dsx.json"), JSON.stringify({ command: "vendor", published: true, listing: { title: "Vendor" } }));
    put(join(repo, "ClosedSource/DSX/Modules/Core/Owner/Modules/Other/dsx.json"), JSON.stringify({ command: "other", published: false, listing: { title: "Other" } }));
    put(join(repo, "ClosedSource/DSX/Modules/Core/Hidden/dsx.json"), JSON.stringify({ command: "hidden", listed: false, published: false, listing: { title: "Hidden" } }));
    put(join(repo, "ClosedSource/DSX/Modules/Mandatory/Framework/dsx.json"), JSON.stringify({ name: "Framework", listing: { title: "Framework" } }));
    put(join(repo, "ClosedSource/DSX/Modules/Core/Library/dsx.json"), JSON.stringify({ name: "Library", listing: { title: "Library" } }));
    put(join(repo, "ClosedSource/DSX/Modules/Core/NoListing/dsx.json"), JSON.stringify({ command: "unlisted" }));
    if (collision) put(join(repo, "ClosedSource/DSX/Modules/Core/Collision/dsx.json"), JSON.stringify({ command: "vendor", listing: { title: "Collision" } }));
    put(join(repo, "OpenSource/Documentation/reference/capabilities.json"), JSON.stringify({options:[{id:"library",primary:"Core/Library"},{id:"hidden",primary:"Core/Hidden"}]}));
    git("init", "--quiet"); git("add", "."); git("-c", "user.name=Docs Test", "-c", "user.email=docs-test@example.invalid", "commit", "--quiet", "-m", "fixture");
    const commit = git("rev-parse", "HEAD").trim();
    const script = join(docs, "scripts/sync-packages.mjs"); mkdirSync(dirname(script), { recursive: true }); mkdirSync(join(docs, "data"));
    copyFileSync(process.env.DESPIA_SYNC_PACKAGES_SCRIPT ?? fileURLToPath(new URL("../scripts/sync-packages.mjs", import.meta.url)), script);
    const env = { ...process.env, DESPIA_FRAMEWORK: repo, DESPIA_FRAMEWORK_REF: commit };
    if (collision) {
      assert.throws(() => execFileSync(process.execPath, [script], { env, stdio: "pipe" }), (error) => {
        assert.match(error.stderr.toString(), /slug vendor collides between Core\/Owner\/Modules\/Vendor and Core\/Collision/);
        return true;
      });
      return;
    }
    const result = spawnSync(process.execPath, [script], { env, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    const data = JSON.parse(readFileSync(join(docs, "data/packages.json"), "utf8"));
    assert.equal(data.source.commit, commit);
    if (onlyVisibility) {
      assert.equal(data.packages.some((p) => p.path === "Core/Hidden"), false);
      return;
    }
    assert.equal(data.packages.find((p) => p.path.endsWith("/Vendor")).command, "account.vendor");
    assert.equal(data.packages.find((p) => p.path === "Core/Owner/Modules/Other").published, false);
    assert.equal(data.packages.find((p) => p.path === "Core/Owner/Modules/Other").command, "account.other");
    assert.equal(data.packages.find((p) => p.path === "Core/Owner/Modules/Other").catalog, false);
    assert.equal(data.packages.some((p) => p.path === "Core/Hidden"), false);
    assert.equal(data.packages.some((p) => p.path === "Mandatory/Framework"), false);
    assert.equal(data.packages.find((p) => p.path === "Core/Library").catalog, true);
    assert.equal(data.packages.find((p) => p.path === "Core/Library").command, null);
    assert.match(result.stderr, /package Core\/NoListing has no listing: left out/);
    assert.doesNotMatch(result.stderr, /Core\/Hidden|taken slug/);
    execFileSync(process.execPath, [script, "--check"], { env, stdio: "pipe" });
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}

test("sync reads pinned complete sources, full commands, catalog libraries and public eligibility", () => runFixture());
test("sync fails explicitly on a cross-source public slug collision", () => runFixture(true));

test("catalog membership cannot publish a deliberately hidden package", () => runFixture(false, true));
