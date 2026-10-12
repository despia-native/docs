# Despia docs: ready, not published

The Despia V4 docs are complete and previewable. Nothing is deployed: no Worker route, no DNS, nothing on despia.com,
docs.despia.com or setup.despia.com. The site serves under https://despia.com/docs once the owner switches it on.

## Pages

Built from `site/ia.mjs` and `content-v2/` (V4 pages) plus the kept spaces (`content/`, ported V3 docs).

| Area | Pages |
| :-- | :-- |
| Home, Guides | `/`, `/guides` |
| DSX | `/dsx`, quickstart, project, documents, data, styling, attributes, native-ui, navigation, packages, platforms, auth, payments, providers, cli, console, agents, agents/skills, `/dsx-css/errors` |
| Convert | `/convert`, quickstart, from-v3, legacy-files |
| Web apps | `/web-apps`, native-features, frameworks, typescript, outside-despia, hosted-and-bundled, preview, packages |
| Packages | `/packages` (the console's catalog) and one page per package |
| Build and ship | `/ship`, app-store-connect, google-play, licences, builds, releases, store-rejections, api, `/app-review` and its guideline pages |
| Kept spaces | `/legacy/**` (V3), `/migrate`, `/troubleshooting`, `/releases` |
| Not found | any other address: the docs' Page not found page, served with HTTP 404 (`dsx.config.json` `notFound`) |

Every page has a Markdown twin (`<page>.md`), `llms.txt` lists them, and `docs-index.json` is the export the general
Despia MCP reads.

## Checks

| Check | Command |
| :-- | :-- |
| Full DSX build, lint of every page | `npm run build` |
| Samples call real packages, real attributes, awaited | `node site/check-samples.mjs --cli <framework cli>` |
| Writing standard, no em or en dash, no empty table | `node --test tests/prose.test.mjs` |
| Every docs address the product emits lands on a page | `node scripts/check-product-links.mjs` (re-read from the framework with `--sync`) |
| Every V3 page redirects in one 301 | `node scripts/redirects.mjs && node scripts/setup-parity.mjs` |
| The catalog matches the framework's manifests | `DESPIA_FRAMEWORK=<framework> node scripts/sync-packages.mjs --check` |
| No page teaches the retired style attribute dialect | framework `check_docs_dialect_free.rb` with `DSX_DOCS_DIALECT_SELFTEST=1 DSX_DOCS_DIALECT_ROOT=<docs>/content-v2` |
| The whole suite | `node --test tests/*.test.mjs` |

## Before go-live: one framework fix

The framework's server bootloaders (Workers and Node) strip a `/dsx` mount prefix from every request path
(`OpenSource/Engine/TypeScript/packages/server/src/bootloader-deno.ts` `MOUNT_PREFIXES`, applied in
`bootloader-workers.ts` and `bootloader-node.ts`). Served through the docs Worker, `/dsx` answers the home page and every
`/dsx/...` page answers 404, although `dist/dsx/**` holds them. The static build is correct; the strip has to stop taking
paths the site's own route table serves. Until that lands in the framework the docs must not go live: the whole DSX
section, and the `despia.com/docs/dsx/...` addresses the product emits, would be broken.

## Go-live steps (owner)

1. Deploy the docs Worker and route it:
   ```sh
   npm run build && npx wrangler deploy
   ```
   Then add the routes `despia.com/docs*` and `docs.despia.com/*` to the `despia-docs` Worker in the Cloudflare dashboard.
2. Redirect setup.despia.com: deploy `redirects/setup-worker` (`cd redirects/setup-worker && npx wrangler deploy`, route
   `setup.despia.com/*`), or import `redirects/setup.despia.com.csv` as a Bulk Redirect list.
3. Add `Sitemap: https://despia.com/docs/sitemap.xml` to https://despia.com/robots.txt.
4. In the framework, switch the product to the live site:
   - `ClosedSource/Cloud/mcp/src/links.ts`: `DOCS_SITE_LIVE = true`, and the MCP docs bundle's site to `https://despia.com/docs`.
   - `ClosedSource/Cloud/api/scripts/docs-links.json`: mark the despia.com/docs addresses `live`.
   - Point the remaining old addresses at the new site (they redirect correctly already, this removes the hop):
     `ClosedSource/Cloud/api/openapi/base.mjs` externalDocs to `https://despia.com/docs/ship/api`, the store rejection
     diagnoses to `https://despia.com/docs/ship/store-rejections`, and `OpenSource/Templates/templates.json` links.
5. Verify: `node scripts/check-product-links.mjs --sync` against the framework at the deployed commit, then open
   https://despia.com/docs, https://despia.com/docs/dsx/data (the page "Data and state", HTTP 200),
   https://despia.com/docs/no-such-page (HTTP 404), https://docs.despia.com/packages/haptic and
   https://setup.despia.com/introduction.

## Rollback

Remove the `despia.com/docs*`, `docs.despia.com/*` and `setup.despia.com/*` routes in the Cloudflare dashboard. The
Nordcraft site and the V3 docs answer again as before; set `DOCS_SITE_LIVE = false` again if it was switched.

## Screenshots

Every page (486) at 2x, desktop 1440x900 and phone 390x844, light and dark: 1,944 shots, one folder per form and scheme,
file name = the page address with `/` as `_` (`home.png` is `/`). `report.json` beside them lists, per page, page
errors, text cut by an ellipsis, a focus ring at rest, an alert above the page header and a missing title.
`visual-test.txt` is `tests/visual.test.mjs` against the same build (scheme, contrast, rhythm, broken words).

## Known framework items (not docs changes)

- The `/dsx` mount strip above: it blocks go-live.
- A large page title on a page with a parent sits 20px in from its own description (top bar lead).
- Sidebar rows fade in over a few seconds after load.
- A Markdown tab bar cuts its labels on a phone (the V3 local server reference).
- `despia lint` reports the `notFound` component as unreached, and a build's `jse_budget_exhausted` refusal names no
  component.
