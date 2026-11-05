---
title: colorpicker
description: The browser's own colour control (input type=color) behind the iOS ColorPicker row: the label leading, a 28px well painting the bound colour trailing, the hex round-tripped by the shared core, the colour announced by name, on:change on every write and on:commit once when the browser picker closes.
order: 3
section: components
element: colorpicker
category: input
scope: library
platforms: web,ios,android
properties: [{"name":"alpha","type":"bool","default":"true"},{"name":"bind","type":"expr","default":null},{"name":"disabled","type":"bool","default":"false"},{"name":"disabled-if","type":"expr","default":null},{"name":"label","type":"string","default":null},{"name":"mode","type":"enum","default":null,"values":["wheel","sliders","swatches"]},{"name":"on:change","type":"action","default":null},{"name":"on:commit","type":"action","default":null},{"name":"swatches","type":"string","default":null}]
actions: ["change","commit"]
catalog: 0.1.0
commit: 468dc3f018c7ba11202d2d17f04f9e04ad2e336e
generator: ClosedSource/scripts/generate_component_docs.rb
---

# colorpicker

The browser's own colour control (input type=color) behind the iOS ColorPicker row: the label leading, a 28px well painting the bound colour trailing, the hex round-tripped by the shared core, the colour announced by name, on:change on every write and on:commit once when the browser picker closes.

<RefMeta platforms="Web,iOS,Android">
Category: Input - Live specimens: the [System gallery](/system).
</RefMeta>

## Usage

```dsx
<colorpicker bind="dsx.variable.accent" label="Accent"/>
```

`colorpicker` takes no children.

## Catalog specimen

The catalog has no specimen for `colorpicker` at the default rung yet, so there is nothing to copy here. It appears with no change to this page the moment the catalog carries one: the page is a projection of the catalog, not a screenshot of it.

## States

| Renderer | Audited | Dated | Evidence |
|---|---|---|---|
| web | review | 2026-10-06 | OpenSource/Engine/TypeScript/packages/dom/src/native-controls.ts `colorpicker` factory: disabled via bindDisabled (wrapper), focus-visible ring on the well (focus-visible rule, --dsx-focus-ring-width), pressed-state of the swatch rail via aria-pressed + 2px accent outline, the opaque browser colour input carries the value; no hover state (the platform well has none). Verified by review; the visual capture awaits the web capture lane. |
| ios | review | 2026-10-06 | ClosedSource/DSX/Modules/Mandatory/Foundation/Components/Forms/ColorPicker/swift/ColorPicker.swift: unstyled is the stock SwiftUI ColorPicker (UIColorWell): rest/pressed/focus OS-owned, disabled via .disabled(dsx.bool(disabled)\|\|disabled-if), value written through setBound only on an actual change. Verified by review; the visual capture awaits the iOS capture lane. |
| android | review | 2026-10-06 | OpenSource/Engine/Kotlin/render/src/main/kotlin/despia/engine/render/elements/ColorPickerElements.kt: the M3 ListItem row is clickable(enabled = !disabled) opening an AlertDialog; cancel writes the opening colour back, OK commits; swatch selected state is a 3 dp ring; disabled has no click. Verified by review; the capture awaits the Android capture lane. |
| desktop | unaudited | unaudited | none recorded |

Rest, hover on a fine pointer, pressed, focus visible and disabled, in both colour schemes, plus loading, error and empty where the component has them.

## Attributes

| Attribute | Type | Default | Notes |
|---|---|---|---|
| `alpha` | `bool` | `true` |  |
| `bind` | `expr` |  |  |
| `disabled` | `bool` | `false` |  |
| `disabled-if` | `expr` |  | Disabled when this expression is truthy. `disabled=` binds as TEXT, and the string "false" is TRUE - so a bound boolean belongs here, never there. |
| `label` | `string` |  |  |
| `mode` | `wheel` \| `sliders` \| `swatches` |  |  |
| `on:change` | `action` |  |  |
| `on:commit` | `action` |  |  |
| `swatches` | `string` |  |  |

Every element also carries the [universal attributes](/components/attributes): accessibility, animation, `class`, `style` and the platform suffixes.

## Events

| Event | Handler |
|---|---|
| `change` | `on:change="..."` |
| `commit` | `on:commit="..."` |

A payload arrives FLAT in the handler scope, so a declared action names the key bare (`message="message"`), never through an `event` plane.

## Platform notes

| Renderer | Grammar | What that means |
|---|---|---|
| web | `supported` | the built in renderer implements this element |
| ios | `reference` | the reference renderer this element is specified against |
| android | `enforced` | implemented and pinned by the element parity test |
| desktop | `uncaptured` | no desktop capture has measured it, which claims nothing in either direction |

The browser's own colour control (input type=color) behind the iOS ColorPicker row: the label leading, a 28px well painting the bound colour trailing, the hex round-tripped by the shared core, the colour announced by name, on:change on every write and on:commit once when the browser picker closes. The custom panel appears only for what the browser control cannot hold: the preset swatches and an opacity track (webNeedsCustomColorPanel).

**Known limits on the web**

- The picker surface itself (wheel, sliders, eyedropper) is the browser's and the OS's; `mode` is a native presentation hint the browser control cannot take.

**Implementation notes.** Not a markup component: the library `<ColorPicker>` (Core/ColorPicker.dsx) stays the palette-and-sliders markup for apps that want one; this element is the system picker.

Declared platforms: `ios`, `android`, `web`.

**Adaptivity (web, 2026-10-06).** OpenSource/Engine/TypeScript/packages/dom/src/native-controls.ts: the row is a 2-column grid (label minmax(0,1fr), well auto) with align-self: stretch and min-width: 0, so it fills any column and wraps no label under the well; swatches flex-wrap. No viewport media. Verified by review.

## Theming

DSX has one styling vocabulary and it is CSS. Three doors reach this element, and they differ only in how often the look repeats: `style="..."` for a declaration list on one element, `class="..."` for a name declared in a `<style>` block, and the component's own sheet for everything a whole screen shares.

On the web this element's root carries `dsx-colorpicker`, the stable class the contract application CSS targets. It is a rendering fact you can read, not a styling hook to depend on: style the element, not the class the renderer stamps.

Web runtime: `native-control`.

## Accessibility

| Renderer | Audited | Dated | Evidence |
|---|---|---|---|
| web | review | 2026-10-06 | OpenSource/Engine/TypeScript/packages/dom/src/native-controls.ts: wrapper role=group with aria-label from `label` (else the localized 'Colour'), the input carries aria-label and aria-valuetext = the colour NAME (nearestColorName, localized), swatches are buttons with name labels and aria-pressed, the opacity range has an 'Opacity' label. Verified by review. |
| ios | review | 2026-10-06 | ClosedSource/DSX/Modules/Mandatory/Foundation/Components/Forms/ColorPicker/swift/ColorPicker.swift: .accessibilityValue(Text(spoken)) with the localized colour NAME (never hex), the label is the picker's own accessible title, disabled via .disabled. Verified by review. |
| android | review | 2026-10-06 | OpenSource/Engine/Kotlin/render/src/main/kotlin/despia/engine/render/elements/ColorPickerElements.kt: the row is semantics(mergeDescendants) role=Button with the label (else 'Colour') as contentDescription, the field and tracks carry localized contentDescriptions, swatches are Role.Button named by the colour NAME. Verified by review. |
| desktop | unaudited | unaudited | none recorded |

Every element carries `aria-label`, `aria-description`, `aria-valuetext`, `role`, `aria-pressed` and `aria-hidden`. A control that draws an icon beside text is one group with one label, never two announcements; see the [universal attributes](/components/attributes).

This page is GENERATED by ClosedSource/scripts/generate_component_docs.rb. A hand edit here is overwritten on the next run by design: fix the ledger instead (the attribute and event contract in `OpenSource/Documentation/reference/stack-elements.json`, the platform support and the audit in `OpenSource/Conformance/library/matrix.json`, the description and the web limits in `OpenSource/Engine/TypeScript/support/element-support.json`, the specimen in `OpenSource/Catalog`).

