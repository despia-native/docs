---
title: dsx-web-view
description: The rich Web twin mounts the composed app web surface as the same policy-constrained iframe WebView rides, resolving path against this page's own origin (an explicit origin wins) with the shared lifecycle events and the named-surface controls the Dom facet targets.
order: 3
section: components
element: dsx-web-view
category: web
scope: library
platforms: web,ios,android
properties: [{"name":"name","type":"string","default":"web"},{"name":"on:commit","type":"action","default":null},{"name":"on:denied","type":"action","default":null},{"name":"on:fail","type":"action","default":null},{"name":"on:finish","type":"action","default":null},{"name":"on:message","type":"action","default":null},{"name":"on:start","type":"action","default":null},{"name":"origin","type":"string","default":null},{"name":"path","type":"string","default":"/"}]
actions: ["commit","denied","fail","finish","message","start"]
catalog: 0.1.0
commit: 468dc3f018c7ba11202d2d17f04f9e04ad2e336e
generator: ClosedSource/scripts/generate_component_docs.rb
---

# dsx-web-view

The rich Web twin mounts the composed app web surface as the same policy-constrained iframe WebView rides, resolving path against this page's own origin (an explicit origin wins) with the shared lifecycle events and the named-surface controls the Dom facet targets.

<RefMeta platforms="Web,iOS,Android">
Category: Web - Live specimens: the [System gallery](/system).
</RefMeta>

## Usage

```dsx
<dsx-web-view path="/"/>
```

`dsx-web-view` takes no children.

## Catalog specimen

The catalog has no specimen for `dsx-web-view` at the default rung yet, so there is nothing to copy here. It appears with no change to this page the moment the catalog carries one: the page is a projection of the catalog, not a screenshot of it.

## States

| Renderer | Audited | Dated | Evidence |
|---|---|---|---|
| web | n/a | 2026-08-18 | Non-interactive host embed (the policy-constrained app-surface iframe): no interaction-state axis on the host itself; load/ready lifecycle is value-driven events, and the embedded page owns its own interactive states (OpenSource/Engine/TypeScript/support/element-support.json DSXWebView row; packages/dom/src/elements.ts dsx-webview factory). |
| ios | review | 2026-08-18 | Lifecycle states are first-class: an origin-less mount renders the native DSXWebUnavailable screen WITHOUT instantiating WKWebView (body guard, ClosedSource/DSX/Modules/Core/Dom/Components/Views/DSXWebView/swift/DSXWebView.swift), and screen readiness gates the frame settle on domFinish/domFail (store.hostsWebSurface; Conformance/lifecycle/readiness.json rule 9, record lane); CI-asserted native fallback (ClosedSource/RuntimeUITests/RuntimeLaunchUITests.swift testOriginlessDSXWebViewSelectsNativeErrorBeforeCreatingWebView). Verified-by-review; the visual capture awaits the iOS capture lane. |
| android | review | 2026-08-18 | VERIFIED-BY-REVIEW: load-failure policy is DomFailurePolicy.kt (Dom module kotlin facet) + the native recoverable system error screen (Try again) asserted by instrumentation: DsxSystemScreenUiTest#compiledFrameworkFailureIsNativeResponsiveAndRecoverable + DomFailurePolicyTest (RuntimeAndroid androidTest); page-level states are the loaded web content's own. |
| desktop | unaudited | unaudited | none recorded |

Rest, hover on a fine pointer, pressed, focus visible and disabled, in both colour schemes, plus loading, error and empty where the component has them.

## Attributes

| Attribute | Type | Default | Notes |
|---|---|---|---|
| `name` | `string` | `web` |  |
| `on:commit` | `action` |  | Navigation committed - payload { url, surface }. |
| `on:denied` | `action` |  | The bridge gate refused a foreign frame - payload { origin, url, surface }. |
| `on:fail` | `action` |  | Navigation failed - payload { url, surface, error, code }. |
| `on:finish` | `action` |  | Navigation finished - payload { url, surface }. |
| `on:message` | `action` |  | The page called window.app.send - payload { data, surface }. |
| `on:start` | `action` |  | Navigation started - payload { url, surface }. |
| `origin` | `string` |  |  |
| `path` | `string` | `/` |  |

Every element also carries the [universal attributes](/components/attributes): accessibility, animation, `class`, `style` and the platform suffixes.

## Events

| Event | Handler |
|---|---|
| `commit` | `on:commit="..."` |
| `denied` | `on:denied="..."` |
| `fail` | `on:fail="..."` |
| `finish` | `on:finish="..."` |
| `message` | `on:message="..."` |
| `start` | `on:start="..."` |

A payload arrives FLAT in the handler scope, so a declared action names the key bare (`message="message"`), never through an `event` plane.

## Platform notes

| Renderer | Grammar | What that means |
|---|---|---|
| web | `partial` | a renderer exists and is narrower than the reference in the ways listed below |
| ios | `reference` | the reference renderer this element is specified against |
| android | `module-facet` | filled by the module facet when that module is registered |
| desktop | `uncaptured` | no desktop capture has measured it, which claims nothing in either direction |

The rich Web twin mounts the composed app web surface as the same policy-constrained iframe WebView rides, resolving path against this page's own origin (an explicit origin wins) with the shared lifecycle events and the named-surface controls the Dom facet targets.

**Known limits on the web**

- No BridgeKit bridge is faked: the embedded page gets the plain window.app.send channel and the bridge-gate on:denied event never fires on Web.
- The screen-readiness hostedSurface gate stays native-only: a web frame does not defer settled to the embedded page's first paint.
- Browser sandbox and storage behavior cannot duplicate the native composed-surface WKWebView process/data-store guarantees.

**Fallback.** Mounts the functional policy-constrained iframe at origin+path (defaulting to this page's own origin); bridge-dependent behavior is absent rather than imitated.

**Implementation notes.** The composed app web surface (bare construction + BridgeKit). Android twin: Core/Dom/android/DSXWebViewComponent.kt registers the same tag.

Declared platforms: `ios`, `android`, `web`.

**Adaptivity (web, 2026-08-18).** Pure fill-its-container embed host: the embedded page owns its presentation at every width; the host declares no phone/tablet/desktop variance of its own (OpenSource/Engine/TypeScript/support/element-support.json DSXWebView row).

## Theming

DSX has one styling vocabulary and it is CSS. Three doors reach this element, and they differ only in how often the look repeats: `style="..."` for a declaration list on one element, `class="..."` for a name declared in a `<style>` block, and the component's own sheet for everything a whole screen shares.

On the web this element's root carries `dsx-webview`, the stable class the contract application CSS targets. It is a rendering fact you can read, not a styling hook to depend on: style the element, not the class the renderer stamps.

Web runtime: `rich`.

## Accessibility

| Renderer | Audited | Dated | Evidence |
|---|---|---|---|
| web | no, and named | 2026-08-18 | W11 disposition (b), dated decision: the twin mounts a policy-constrained iframe without the BridgeKit bridge (OpenSource/Engine/TypeScript/support/element-support.json DSXWebView row keeps status partial, 'No BridgeKit bridge is faked'); the composed app-surface contract incl. its a11y tree is native-owned per OpenSource/Documentation/architecture/web-surface-policy.md, so the web host is not held to the library axe/keyboard bar. Red-by-record. |
| ios | review | 2026-08-18 | WKWebView exposes the loaded page's accessibility tree to assistive tech (WebKit-owned); the component adds no native chrome; page-side a11y is the web column's plane. ClosedSource/DSX/Modules/Core/Dom/Components/Views/DSXWebView/swift/DSXWebView.swift. Verified-by-review; the visual capture awaits the iOS capture lane. |
| android | review | 2026-08-18 | VERIFIED-BY-REVIEW: the platform android.webkit.WebView exposes the loaded page's own web accessibility tree; the failure screen is native Compose text + button (DsxSystemScreenUiTest asserts it is reachable and clickable). |
| desktop | unaudited | unaudited | none recorded |

Every element carries `aria-label`, `aria-description`, `aria-valuetext`, `role`, `aria-pressed` and `aria-hidden`. A control that draws an icon beside text is one group with one label, never two announcements; see the [universal attributes](/components/attributes).

This page is GENERATED by ClosedSource/scripts/generate_component_docs.rb. A hand edit here is overwritten on the next run by design: fix the ledger instead (the attribute and event contract in `OpenSource/Documentation/reference/stack-elements.json`, the platform support and the audit in `OpenSource/Conformance/library/matrix.json`, the description and the web limits in `OpenSource/Engine/TypeScript/support/element-support.json`, the specimen in `OpenSource/Catalog`).

