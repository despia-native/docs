// Every docs address the product emits (data/product-links.json, read from the framework source) lands on a page of the
// built site with its #fragment, through the redirects the docs and setup.despia.com workers answer. Needs a full build.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { check, follow } from "../scripts/check-product-links.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const built = existsSync(join(root, "dist/canonical.json"));

test("a Modern API path on setup.despia.com goes to the V4 page, a V3 path to its legacy page", () => {
  assert.equal(follow("https://setup.despia.com/packages/haptic").path, "/packages/haptic");
  assert.equal(follow("https://setup.despia.com/store-rejections/introduction").path, "/legacy/store-rejections/introduction");
  assert.equal(follow("https://docs.despia.com/framework/guides/api/overview").path, "/ship/api");
});

test("every product docs address lands on a built page", { skip: !built && "no full build in dist/" }, () => {
  const { links } = JSON.parse(readFileSync(join(root, "data/product-links.json"), "utf8"));
  assert.deepEqual(check(links).map((f) => `${f.url}: ${f.why}`), []);
});
