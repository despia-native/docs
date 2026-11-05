---
title: segmented-button
description: The data-control twin implements single or multiple segmented selection, labels/icons, binding, keyboard traversal, and accessibility state.
order: 3
section: components
element: segmented-button
category: input
scope: library
platforms: web,ios,android
properties: [{"name":"bind","type":"expr","default":null},{"name":"disabled","type":"bool","default":"false"},{"name":"disabled-if","type":"expr","default":null},{"name":"icons","type":"csv","default":null},{"name":"multiple","type":"bool","default":"true"},{"name":"options","type":"csv","default":null}]
actions: []
catalog: 0.1.0
commit: 468dc3f018c7ba11202d2d17f04f9e04ad2e336e
generator: ClosedSource/scripts/generate_component_docs.rb
---

# segmented-button

The data-control twin implements single or multiple segmented selection, labels/icons, binding, keyboard traversal, and accessibility state.

<RefMeta platforms="Web,iOS,Android">
Category: Input - Live specimens: the [System gallery](/system).
</RefMeta>

## Usage

```dsx
<segmented-button bind="dsx.variable.tools" options="Bold,Italic" multiple="true"/>
```

`segmented-button` takes no children.

## Catalog specimen

The catalog has no specimen for `segmented-button` at the default rung yet, so there is nothing to copy here. It appears with no change to this page the moment the catalog carries one: the page is a projection of the catalog, not a screenshot of it.

## States

| Renderer | Audited | Dated | Evidence |
|---|---|---|---|
| web | yes | 2026-08-18 | probe: single-select radiogroup mode, click selects + writes store, item hover rule (data-controls.ts), focus ring, selected state styling - w8 Chromium probe (compileComponent->bootDsx, full skin), scratchpad/w8/*.mjs, shots/w8-audit-* |
| ios | review | 2026-08-18 | Multi/single-select toggle segments: selected fill + on-tint label, isSelected add/remove per segment through distinct subtrees, group disabled, order-stable CSV write-back (ClosedSource/DSX/Modules/Mandatory/Foundation/Components/Basics/SegmentedButton/swift/SegmentedButton.swift). Verified-by-review; the visual capture awaits the iOS capture lane. |
| android | review | 2026-08-18 | VERIFIED-BY-REVIEW: the Material connected MULTI-select: M3 Multi/SingleChoiceSegmentedButtonRow on the system path (SelectionSystem.kt table; ChoiceElements.kt segmentedButton); legacy custom row byte-identical (SEG_* metrics from SegmentedButton.swift); selection CSV two-way; disabled= in the contract. |
| desktop | unaudited | unaudited | none recorded |

Rest, hover on a fine pointer, pressed, focus visible and disabled, in both colour schemes, plus loading, error and empty where the component has them.

## Attributes

| Attribute | Type | Default | Notes |
|---|---|---|---|
| `bind` | `expr` |  |  |
| `disabled` | `bool` | `false` |  |
| `disabled-if` | `expr` |  | Disabled when this expression is truthy. `disabled=` binds as TEXT, and the string "false" is TRUE - so a bound boolean belongs here, never there. |
| `icons` | `csv` |  |  |
| `multiple` | `bool` | `true` |  |
| `options` | `csv` |  |  |

Every element also carries the [universal attributes](/components/attributes): accessibility, animation, `class`, `style` and the platform suffixes.

## Events

`segmented-button` raises no events.

## Platform notes

| Renderer | Grammar | What that means |
|---|---|---|
| web | `supported` | the built in renderer implements this element |
| ios | `reference` | the reference renderer this element is specified against |
| android | `enforced` | implemented and pinned by the element parity test |
| desktop | `uncaptured` | no desktop capture has measured it, which claims nothing in either direction |

The data-control twin implements single or multiple segmented selection, labels/icons, binding, keyboard traversal, and accessibility state.

**Known limits on the web**

- Option and icon lists are bounded and normalized.

Declared platforms: `ios`, `android`, `web`.

**Adaptivity (web, 2026-08-18).** identical presentation at 390 touch and 1366 fine pointer by declaration (probed both, page overflow 0; only density tokens move); RTL mount: overflow 0, leading alignment mirrors (btn right edge flush) - w8 Chromium probe (compileComponent->bootDsx, full skin), scratchpad/w8/*.mjs, shots/w8-audit-*

## Theming

DSX has one styling vocabulary and it is CSS. Three doors reach this element, and they differ only in how often the look repeats: `style="..."` for a declaration list on one element, `class="..."` for a name declared in a `<style>` block, and the component's own sheet for everything a whole screen shares.

On the web this element's root carries `dsx-segmented`, the stable class the contract application CSS targets. It is a rendering fact you can read, not a styling hook to depend on: style the element, not the class the renderer stamps.

Web runtime: `data`.

## Accessibility

| Renderer | Audited | Dated | Evidence |
|---|---|---|---|
| web | yes | 2026-08-18 | role=radiogroup (single) / group (multiple) + aria-label; axe 0 serious/critical on the controls family page light+dark (calendar excluded, filed) |
| ios | review | 2026-08-18 | Each segment is a labeled Button with isSelected exposed through distinct subtrees + hover highlight (ClosedSource/DSX/Modules/Mandatory/Foundation/Components/Basics/SegmentedButton/swift/SegmentedButton.swift). Verified-by-review; the visual capture awaits the iOS capture lane. |
| android | review | 2026-08-18 | VERIFIED-BY-REVIEW: segments ride dsxAccessibleToggle (multiple=true) / dsxAccessibleSelectable (single) with per-segment state (ChoiceElements.kt:379,386). |
| desktop | unaudited | unaudited | none recorded |

Every element carries `aria-label`, `aria-description`, `aria-valuetext`, `role`, `aria-pressed` and `aria-hidden`. A control that draws an icon beside text is one group with one label, never two announcements; see the [universal attributes](/components/attributes).

This page is GENERATED by ClosedSource/scripts/generate_component_docs.rb. A hand edit here is overwritten on the next run by design: fix the ledger instead (the attribute and event contract in `OpenSource/Documentation/reference/stack-elements.json`, the platform support and the audit in `OpenSource/Conformance/library/matrix.json`, the description and the web limits in `OpenSource/Engine/TypeScript/support/element-support.json`, the specimen in `OpenSource/Catalog`).

