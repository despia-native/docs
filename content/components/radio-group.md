---
title: radio-group
description: The global data-control twin renders real radio inputs from CSV or bound option data and writes the selected value back.
order: 3
section: components
element: radio-group
category: input
scope: library
platforms: web,ios,android,desktop
properties: [{"name":"bind","type":"expr","default":null},{"name":"disabled","type":"bool","default":"false"},{"name":"disabled-if","type":"expr","default":null},{"name":"label-field","type":"string","default":"label"},{"name":"options","type":"csv","default":null},{"name":"options-key","type":"expr","default":null},{"name":"value-field","type":"string","default":"id"}]
actions: []
catalog: 0.1.0
commit: 468dc3f018c7ba11202d2d17f04f9e04ad2e336e
generator: ClosedSource/scripts/generate_component_docs.rb
---

# radio-group

The global data-control twin renders real radio inputs from CSV or bound option data and writes the selected value back.

<RefMeta platforms="Web,iOS,Android,Desktop">
Category: Input - Live specimens: the [System gallery](/system).
</RefMeta>

## Usage

```dsx
<radio-group bind="dsx.variable.plan" options="Weekly,Monthly,Yearly"/>
```

`radio-group` takes no children.

## Catalog specimen

The catalog has no specimen for `radio-group` at the default rung yet, so there is nothing to copy here. It appears with no change to this page the moment the catalog carries one: the page is a projection of the catalog, not a screenshot of it.

## States

| Renderer | Audited | Dated | Evidence |
|---|---|---|---|
| web | yes | 2026-08-18 | probe: role=radiogroup, ArrowDown moves selection + writes store, .dsx-radio-option:hover fill, focus ring on radio input - w8 Chromium probe (compileComponent->bootDsx, full skin), scratchpad/w8/*.mjs, shots/w8-audit-* |
| ios | review | 2026-08-18 | Per-option system Buttons (.plain) with filled/hollow marks, 44pt targets, group-level W9 disabled grammar (ClosedSource/DSX/Modules/Mandatory/Foundation/Components/Core/swift/RadioGroup.swift:60-90); CI-asserted on iPad (Alpha to Beta flip refreshes the native selected state, ClosedSource/RuntimeUITests/RuntimeLaunchUITests.swift) and driven on Catalyst (inspector matrix Everything). Verified-by-review; the visual capture awaits the iOS capture lane. |
| android | review | 2026-08-18 | VERIFIED-BY-REVIEW: unstyled path renders REAL M3 RadioButton rows in a selectableGroup (ChoiceElements.kt M3 path, SelectionControl.RADIOGROUP - SelectionSystemTest green): platform state layers; legacy path rows via dsxAccessibleSelectable + SF glyphs (ChoiceElements.kt:239); disabled= in the contract. |
| desktop | unaudited | unaudited | none recorded |

Rest, hover on a fine pointer, pressed, focus visible and disabled, in both colour schemes, plus loading, error and empty where the component has them.

## Attributes

| Attribute | Type | Default | Notes |
|---|---|---|---|
| `bind` | `expr` |  |  |
| `disabled` | `bool` | `false` |  |
| `disabled-if` | `expr` |  | Disabled when this expression is truthy. `disabled=` binds as TEXT, and the string "false" is TRUE - so a bound boolean belongs here, never there. |
| `label-field` | `string` | `label` |  |
| `options` | `csv` |  |  |
| `options-key` | `expr` |  |  |
| `value-field` | `string` | `id` |  |

Every element also carries the [universal attributes](/components/attributes): accessibility, animation, `class`, `style` and the platform suffixes.

## Events

`radio-group` raises no events.

## Platform notes

| Renderer | Grammar | What that means |
|---|---|---|
| web | `supported` | the built in renderer implements this element |
| ios | `reference` | the reference renderer this element is specified against |
| android | `enforced` | implemented and pinned by the element parity test |
| desktop | `captured` | the desktop capture plane composed and measured this element at both locked widths |

The global data-control twin renders real radio inputs from CSV or bound option data and writes the selected value back.

**Known limits on the web**

- Options and labels are bounded by the shared data-control safety ceilings.

**Implementation notes.** Glyphs: largecircle.fill.circle / circle (RadioGroup.swift:57).

Declared platforms: `ios`, `android`, `web`.

**Adaptivity (web, 2026-08-18).** identical presentation at 390 touch and 1366 fine pointer by declaration (probed both, page overflow 0; only density tokens move); RTL mount: overflow 0, leading alignment mirrors (btn right edge flush) - w8 Chromium probe (compileComponent->bootDsx, full skin), scratchpad/w8/*.mjs, shots/w8-audit-*

## Theming

DSX has one styling vocabulary and it is CSS. Three doors reach this element, and they differ only in how often the look repeats: `style="..."` for a declaration list on one element, `class="..."` for a name declared in a `<style>` block, and the component's own sheet for everything a whole screen shares.

On the web this element's root carries `dsx-radio-group`, the stable class the contract application CSS targets. It is a rendering fact you can read, not a styling hook to depend on: style the element, not the class the renderer stamps.

Web runtime: `global`.

## Accessibility

| Renderer | Audited | Dated | Evidence |
|---|---|---|---|
| web | yes | 2026-08-18 | role=radiogroup + aria-label, roving radios, arrow keys; axe 0 serious/critical on the controls family page light+dark (calendar excluded, filed) |
| ios | review | 2026-08-18 | Option labels + isSelected add/remove through distinct subtrees (ClosedSource/DSX/Modules/Mandatory/Foundation/Components/Core/swift/RadioGroup.swift:80-88); CI-asserted: the selected trait refreshes and the deselected option drops it (ClosedSource/RuntimeUITests/RuntimeLaunchUITests.swift). Verified-by-review; the visual capture awaits the iOS capture lane. |
| android | review | 2026-08-18 | VERIFIED-BY-REVIEW: selectableGroup column of selectable rows (M3 path) / dsxAccessibleSelectable(Role.RadioButton) with selected state + Enter/Space (legacy, ChoiceElements.kt:239, AccessibilityModifiers.kt:135); on-device: DsxAccessibilityUiTest selects a RadioGroup option via semantics (assertIsSelectable/Selected on the <radio-group options="One,Two"/> fixture row). |
| desktop | unaudited | unaudited | none recorded |

Every element carries `aria-label`, `aria-description`, `aria-valuetext`, `role`, `aria-pressed` and `aria-hidden`. A control that draws an icon beside text is one group with one label, never two announcements; see the [universal attributes](/components/attributes).

This page is GENERATED by ClosedSource/scripts/generate_component_docs.rb. A hand edit here is overwritten on the next run by design: fix the ledger instead (the attribute and event contract in `OpenSource/Documentation/reference/stack-elements.json`, the platform support and the audit in `OpenSource/Conformance/library/matrix.json`, the description and the web limits in `OpenSource/Engine/TypeScript/support/element-support.json`, the specimen in `OpenSource/Catalog`).

