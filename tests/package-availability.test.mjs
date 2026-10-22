// Exercise the actual renderer shared by HTML, Markdown, docs-index and MCP.
// No site build, SDK, dependency install or generated output is needed.
import test from "node:test";
import assert from "node:assert/strict";
import { linksOf, needsBuild, packageMarkdownFor } from "../site/packages.mjs";

const feature = (overrides = {}) => ({
  path: "Core/PreviewFeature", title: "Preview Feature", command: "previewFeature",
  slug: "preview-feature", url: "/packages/preview-feature", summary: "Show a preview.",
  published: false, maturity: "unrated", config: [], actions: [],
  ...overrides,
});
const action = {
  name: "show", call: "dsx.module.previewFeature.show", reach: null,
  description: "Show a message.", examples: [{ args: { message: "Hello" } }],
  params: [{ name: "message", type: "string", description: "The message." }],
  result: [],
};

test("unpublished actionless pages explain availability without promising installation or a callable feature", () => {
  const p = feature();
  const before = structuredClone(p);
  const md = packageMarkdownFor(p);
  assert.match(md, /## Availability/);
  assert.match(md, /not currently offered for adding to apps/);
  assert.match(md, /not yet been rated for release/);
  assert.doesNotMatch(md, /Add it to your app|then build|your pages can call it|## Use it in your app/);
  assert.equal(linksOf(p).recipe, null);
  assert.equal(needsBuild(p), "Not available yet");
  assert.deepEqual(p, before, "rendering must not change publication or maturity metadata");
});

test("unpublished action/config contracts remain visible as reference without a released recipe or setup promise", () => {
  const p = feature({
    maturity: "alpha", actions: [action],
    config: [{ key: "message", label: "Message", description: "The default message.", type: "string", updates: "build" }],
  });
  const md = packageMarkdownFor(p);
  assert.match(md, /## Configuration reference/);
  assert.match(md, /\| Message \| The default message\. \| Text \|/);
  assert.match(md, /## API example \(reference only\)/);
  assert.match(md, /await dsx\.module\.previewFeature\.show\(\{ message: 'Hello' \}\);/);
  assert.match(md, /### `show`/);
  assert.match(md, /\| `message` \(required\) \| string \| The message\. \|/);
  assert.doesNotMatch(md, /## Add it to your app|## Use it in your app|The settings, also on|public recipe|not yet been rated/);
  assert.equal(linksOf(p).recipe, null);
});

test("only explicit publication enables installation instructions, including backend halves", () => {
  for (const published of [false, undefined, null]) {
    const p = feature({ path: "Core/Example/Modules/Backend", published, maturity: "verified" });
    assert.match(packageMarkdownFor(p), /## Availability/);
    assert.equal(needsBuild(p), "Not available yet");
    assert.equal(linksOf(p).recipe, null);
  }
  const backend = feature({ path: "Core/Example/Modules/Backend", published: true, maturity: "verified" });
  assert.match(packageMarkdownFor(backend), /runs on the backend, beside the app\. Add it on/);
  assert.equal(needsBuild(backend), "Not needed");
});

test("published pages retain their real installation wording, call example and public recipe", () => {
  for (const maturity of ["alpha", "verified"]) {
    const p = feature({ published: true, maturity, actions: [action] });
    const md = packageMarkdownFor(p);
    assert.match(md, /## Add it to your app/);
    assert.match(md, /Adding Preview Feature changes the native app, so it needs a new app build\. Add it on the package's page in the console \(Packages\), then build\./);
    assert.match(md, /There is nothing to set: once it is added and the app is built, your pages can call it\./);
    assert.match(md, /## Use it in your app/);
    assert.match(md, /await dsx\.module\.previewFeature\.show\(\{ message: 'Hello' \}\);/);
    assert.match(md, /\[public recipe\]\(https:\/\/api\.despia\.com\/v1\/package-docs\/previewFeature\?format=markdown\)/);
    assert.doesNotMatch(md, /## Availability|reference only|not currently offered/);
    assert.equal(needsBuild(p), "Needed to add it");
  }
});
