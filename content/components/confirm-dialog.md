---
title: confirm-dialog
description: The overlay twin provides an adaptive confirm dialog with modal semantics, normalized actions, focus containment/restoration, and dismissal.
order: 3
section: components
element: confirm-dialog
category: overlay
scope: library
platforms: web,ios,android
properties: [{"name":"buttons","type":"expr","default":null},{"name":"message","type":"string","default":null},{"name":"on:dismiss","type":"action","default":null},{"name":"options","type":"string","default":"{}"},{"name":"present","type":"expr","default":null},{"name":"title","type":"string","default":null}]
actions: ["dismiss"]
catalog: 0.1.0
commit: 468dc3f018c7ba11202d2d17f04f9e04ad2e336e
generator: ClosedSource/scripts/generate_component_docs.rb
---

# confirm-dialog

The overlay twin provides an adaptive confirm dialog with modal semantics, normalized actions, focus containment/restoration, and dismissal.

<RefMeta platforms="Web,iOS,Android">
Category: Overlay - Live specimens: the [System gallery](/system).
</RefMeta>

## Usage

```dsx
<confirm-dialog present="dsx.variable.confirm" title="Delete episode?" buttons="dsx.variable.dialogButtons" on:dismiss="dsx.variable.confirm = false"/>
```

`confirm-dialog` takes no children.

## Catalog specimen

The catalog has no specimen for `confirm-dialog` at the default rung yet, so there is nothing to copy here. It appears with no change to this page the moment the catalog carries one: the page is a projection of the catalog, not a screenshot of it.

## States

| Renderer | Audited | Dated | Evidence |
|---|---|---|---|
| web | yes | 2026-08-18 | probe: opens, destructive button voice rgb(201,42,42), button click fires on:dismiss, focus moves in - w8 Chromium probe (compileComponent->bootDsx, full skin), scratchpad/w8/*.mjs, shots/w8-audit-* |
| ios | review | 2026-08-18 | Present/dismiss lifecycle (two-way bool + on:dismiss on any close), role-tinted actions, automatic Cancel appended when the list omits one (ConfirmDialogAnchor actions, ClosedSource/DSX/Modules/Mandatory/Foundation/Components/Structure/ConfirmDialog/swift/ConfirmDialog.swift). Verified-by-review; the visual capture awaits the iOS capture lane. |
| android | review | 2026-08-18 | VERIFIED-BY-REVIEW: REAL M3 AlertDialog (Dialogs.kt, shared with `<alert>`): Material owns touch states/scrim/BACK; auto-appends a localized Cancel when no cancel role is present; destructive role paints the M3 error emphasis. |
| desktop | unaudited | unaudited | none recorded |

Rest, hover on a fine pointer, pressed, focus visible and disabled, in both colour schemes, plus loading, error and empty where the component has them.

## Attributes

| Attribute | Type | Default | Notes |
|---|---|---|---|
| `buttons` | `expr` |  |  |
| `message` | `string` |  |  |
| `on:dismiss` | `action` |  |  |
| `options` | `string` | `{}` |  |
| `present` | `expr` |  |  |
| `title` | `string` |  |  |

Every element also carries the [universal attributes](/components/attributes): accessibility, animation, `class`, `style` and the platform suffixes.

## Events

| Event | Handler |
|---|---|
| `dismiss` | `on:dismiss="..."` |

A payload arrives FLAT in the handler scope, so a declared action names the key bare (`message="message"`), never through an `event` plane.

## Platform notes

| Renderer | Grammar | What that means |
|---|---|---|
| web | `supported` | the built in renderer implements this element |
| ios | `reference` | the reference renderer this element is specified against |
| android | `enforced` | implemented and pinned by the element parity test |
| desktop | `uncaptured` | no desktop capture has measured it, which claims nothing in either direction |

The overlay twin provides an adaptive confirm dialog with modal semantics, normalized actions, focus containment/restoration, and dismissal.

**Known limits on the web**

- Visual placement adapts to Web viewport/input rather than cloning platform dialog chrome.

Declared platforms: `ios`, `android`, `web`.

**Adaptivity (web, 2026-08-18).** desktop: centered alertdialog; 390 touch: bottom action sheet (role=dialog panel 374x178 anchored bottom) - w8 Chromium probe (compileComponent->bootDsx, full skin), scratchpad/w8/*.mjs, shots/w8-audit-*

## Theming

DSX has one styling vocabulary and it is CSS. Three doors reach this element, and they differ only in how often the look repeats: `style="..."` for a declaration list on one element, `class="..."` for a name declared in a `<style>` block, and the component's own sheet for everything a whole screen shares.

On the web this element's root carries `dsx-overlay-host dsx-confirm-host`, the stable class the contract application CSS targets. It is a rendering fact you can read, not a styling hook to depend on: style the element, not the class the renderer stamps.

Web runtime: `overlay`.

## Accessibility

| Renderer | Audited | Dated | Evidence |
|---|---|---|---|
| web | yes | 2026-08-18 | role=alertdialog desktop / dialog action-sheet compact, destructive voice color, axe clean while open - w8 Chromium probe (compileComponent->bootDsx, full skin), scratchpad/w8/*.mjs, shots/w8-audit-* |
| ios | review | 2026-08-18 | The system confirmation dialog carries full assistive semantics (button roles incl. destructive/cancel, VoiceOver focus capture); labels localize via DSXStrings. ClosedSource/DSX/Modules/Mandatory/Foundation/Components/Structure/ConfirmDialog/swift/ConfirmDialog.swift. Verified-by-review; the visual capture awaits the iOS capture lane. |
| android | review | 2026-08-18 | VERIFIED-BY-REVIEW: M3 AlertDialog accessibility component-owned + localized button labels via DSXStrings (Dialogs.kt). |
| desktop | unaudited | unaudited | none recorded |

Every element carries `aria-label`, `aria-description`, `aria-valuetext`, `role`, `aria-pressed` and `aria-hidden`. A control that draws an icon beside text is one group with one label, never two announcements; see the [universal attributes](/components/attributes).

This page is GENERATED by ClosedSource/scripts/generate_component_docs.rb. A hand edit here is overwritten on the next run by design: fix the ledger instead (the attribute and event contract in `OpenSource/Documentation/reference/stack-elements.json`, the platform support and the audit in `OpenSource/Conformance/library/matrix.json`, the description and the web limits in `OpenSource/Engine/TypeScript/support/element-support.json`, the specimen in `OpenSource/Catalog`).

