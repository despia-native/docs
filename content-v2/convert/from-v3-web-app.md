---
title: V3 web app to V4
description: Move a Despia V3 web app to V4. Your site keeps running, your old despia() calls keep working through the Legacy package, and you move to dsx.module one page at a time.
---

A Despia V3 app is a native shell around your own website. In V4 the shell is the **Web App to Mobile App** template: a `dsx-web-view` that opens your web app. Your site, your hosting and your deploys stay as they are.

## What carries over

- **Your site.** The app loads your web address, so a deploy of your site still updates the app at once.
- **Your old page calls.** The `Legacy` package answers the V3 page API: `window.despia`, `despia://` URL schemes and the page globals and callbacks a V3 web app reads. The Web App to Mobile App template installs it, so an existing page keeps working without edits.
- **Your app's settings.** Names, bundle ids, icons and the settings of the features you enabled in V3 are read by Despia's converter, which maps each one to a V4 package setting. A setting the converter does not know is listed in its report as unmapped and is never dropped silently. The converter runs on Despia's side and is not part of the public command line.

## What changes

| In V3 | In V4 |
| :-- | :-- |
| `despia('scheme://...')` | `await dsx.module.<package>.<action>()` |
| Features switched on in the dashboard | Packages added to the app |
| Callbacks and window globals | Awaited results, typed errors and events |

Every V3 page in the old docs has a V4 destination in the [feature map](/convert/v3-feature-map). Rows are marked as mapped, partial, not applicable or unknown; an unknown row means V4 has no equivalent yet, so ask support before you move that feature.

## Move over, page by page

::: steps

### Keep the Legacy package while you move

Leave `legacy` in the app's package list. A call that V4 answers through Legacy runs the modern package underneath. If a call needs a package the build does not include, Legacy does not fail silently: the old page gets a failure reply and the error ledger shows `package_missing` with the package to add.

### Replace one call at a time

Pick a screen. Replace each `despia('scheme://...')` with the matching `dsx.module` call from the feature map, add that package to the app, and test the screen on a build. Calls behave the same in a converted web app and in a DSX app. See [Native features from JavaScript](/web-apps/native-features).

### Check what Legacy would do

While you migrate, `dsx.module.legacy.map({ uri })` tells you which modern call an old spelling becomes, without running it. `dsx.module.legacy.receive({ uri })` runs one old spelling exactly as a page would.

### Remove Legacy when no page calls it

When no page uses `window.despia` any more, remove `legacy` from the package list. A new web app that never called the V3 API can start without it.

:::

## What does not move

Store credentials, signing and App Review work are not part of the conversion. Connect your [App Store Connect Key](/ship/app-store-connect) and [Google Play Service Account](/ship/google-play) as for any new app.

## Next

::: cards
- [Quickstart](/convert/quickstart) {bolt} From your web app's address to a build on your phone.
- [Native features from JavaScript](/web-apps/native-features) {shippingbox} Calls, results, errors and events.
- [Package catalog](/packages) {square.grid.2x2} Every native feature you can add.
:::
