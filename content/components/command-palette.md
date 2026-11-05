---
title: command-palette
description: The global Web twin is the stock command palette: a combobox over a grouped listbox, opened by its chord or its present key, reading the sidebar destinations, the live shortcut owners, the declared commands and the bound lists, ranked by the shared PaletteCore laws, with arrow, Return and Escape keys, restored focus and a full-height compact sheet.
order: 3
section: components
element: command-palette
category: overlay
scope: library
platforms: web,ios,android
properties: [{"name":"commands","type":"expr","default":null},{"name":"id","type":"string","default":""},{"name":"label","type":"string","default":"Command Palette"},{"name":"on:dismiss","type":"action","default":null},{"name":"on:query","type":"action","default":null},{"name":"present","type":"expr","default":null},{"name":"results","type":"expr","default":null},{"name":"results-title","type":"string","default":"Results"},{"name":"shortcut","type":"string","default":"cmd+k"}]
actions: ["dismiss","query"]
catalog: 0.1.0
commit: 468dc3f018c7ba11202d2d17f04f9e04ad2e336e
generator: ClosedSource/scripts/generate_component_docs.rb
---

# command-palette

The global Web twin is the stock command palette: a combobox over a grouped listbox, opened by its chord or its present key, reading the sidebar destinations, the live shortcut owners, the declared commands and the bound lists, ranked by the shared PaletteCore laws, with arrow, Return and Escape keys, restored focus and a full-height compact sheet.

<RefMeta platforms="Web,iOS,Android">
Category: Overlay - Live specimens: the [System gallery](/system).
</RefMeta>

## Usage

```dsx
<command-palette present="dsx.variable.palette" commands="dsx.variable.places"><command id="out" title="Sign Out" on:run="dsx.module.account.signOut()"/></command-palette>
```

`command-palette` takes children.

## Catalog specimen

The catalog has no specimen for `command-palette` at the default rung yet, so there is nothing to copy here. It appears with no change to this page the moment the catalog carries one: the page is a projection of the catalog, not a screenshot of it.

## States

| Renderer | Audited | Dated | Evidence |
|---|---|---|---|
| web | review | 2026-10-09 | OpenSource/Engine/TypeScript/packages/dom/src/command-palette.ts: rows are role=option with aria-selected on the active row (the --dsx-fill wash, moved by arrows and by pointermove), focus stays in the combobox input (aria-activedescendant), the match letters are marked, an empty answer shows No results, the recents group leads an empty query, and the colours are tokens so both schemes follow. Verified by code review (lane MINI-DOM); the visual capture awaits the capture lane. |
| ios | review | 2026-10-09 | ClosedSource/DSX/Modules/Mandatory/Foundation/Components/Structure/CommandPalette/swift/CommandPalette.swift: rows are List buttons in sections (the system pressed and pointer highlight), the typed letters are underlined and strong, an empty answer shows No results, and the recents lead an empty query; there is no separate active-row state because SwiftUI's List owns focus and selection. Verified by code review (lane MINI-DOM); the visual capture awaits the capture lane. |
| android | review | 2026-10-09 | OpenSource/Engine/Kotlin/render/src/main/kotlin/despia/engine/render/elements/CommandPalette.kt: rows are M3 ListItems with the active row on secondaryContainer and selected semantics, moved by the arrow keys with the list scrolled to it; an empty answer shows No results; the typed letters are marked; recents lead an empty query. Verified by code review (lane MINI-DOM); the visual capture awaits the capture lane. |
| desktop | unaudited | unaudited | none recorded |

Rest, hover on a fine pointer, pressed, focus visible and disabled, in both colour schemes, plus loading, error and empty where the component has them.

## Attributes

| Attribute | Type | Default | Notes |
|---|---|---|---|
| `commands` | `expr` |  |  |
| `id` | `string` | `""` |  |
| `label` | `string` | `Command Palette` |  |
| `on:dismiss` | `action` |  |  |
| `on:query` | `action` |  |  |
| `present` | `expr` |  |  |
| `results` | `expr` |  |  |
| `results-title` | `string` | `Results` |  |
| `shortcut` | `string` | `cmd+k` |  |

Every element also carries the [universal attributes](/components/attributes): accessibility, animation, `class`, `style` and the platform suffixes.

## Events

| Event | Handler |
|---|---|
| `dismiss` | `on:dismiss="..."` |
| `query` | `on:query="..."` |

A payload arrives FLAT in the handler scope, so a declared action names the key bare (`message="message"`), never through an `event` plane.

## Platform notes

| Renderer | Grammar | What that means |
|---|---|---|
| web | `supported` | the built in renderer implements this element |
| ios | `reference` | the reference renderer this element is specified against |
| android | `enforced` | implemented and pinned by the element parity test |
| desktop | `uncaptured` | no desktop capture has measured it, which claims nothing in either direction |

The global Web twin is the stock command palette: a combobox over a grouped listbox, opened by its chord or its present key, reading the sidebar destinations, the live shortcut owners, the declared commands and the bound lists, ranked by the shared PaletteCore laws, with arrow, Return and Escape keys, restored focus and a full-height compact sheet.

**Known limits on the web**

- Bounded by 512 rows and 100 results; the compact sheet is the viewport at or below 599px.

**Implementation notes.** The match and ranking laws are PaletteCore (corpus input/command-palette.json), the chord laws are input/shortcut-registry.json. Navigate (the scaffold sidebar) and the live shortcut registry rows are read on the web and the Compose renderers only; SwiftUI has neither list, a named degradation in platform-parity-register.json.

Declared platforms: `ios`, `android`, `web`.

**Adaptivity (web, 2026-10-09).** OpenSource/Engine/TypeScript/packages/dom/src/command-palette.ts: at 600px and up a flat centred panel (min(640px, 100vw - 32px), 18vh from the top); at 599px and below the full-height sheet with the Cancel button (the (max-width: 599px) row of Conformance/style-semantics/media-features.json); logical properties throughout, so RTL mirrors; the overlay layer carries the safe area. Verified by code review (lane MINI-DOM); the visual capture awaits the capture lane.

## Theming

DSX has one styling vocabulary and it is CSS. Three doors reach this element, and they differ only in how often the look repeats: `style="..."` for a declaration list on one element, `class="..."` for a name declared in a `<style>` block, and the component's own sheet for everything a whole screen shares.

On the web this element's root carries `dsx-overlay-host dsx-palette-host`, the stable class the contract application CSS targets. It is a rendering fact you can read, not a styling hook to depend on: style the element, not the class the renderer stamps.

Web runtime: `global`.

## Accessibility

| Renderer | Audited | Dated | Evidence |
|---|---|---|---|
| web | review | 2026-10-09 | OpenSource/Engine/TypeScript/packages/dom/src/command-palette.ts: the panel is role=dialog aria-modal with a localized aria-label, the input is a combobox (aria-autocomplete=list, aria-controls, aria-activedescendant), results are a listbox of labelled groups, a polite status line announces the result count, ArrowUp/Down wrap, Home/End jump, Enter chooses and Escape closes through the shared overlay coordinator, focus is restored on close, and the opening chord is exposed as aria-keyshortcuts. Verified by code review (lane MINI-DOM); the visual capture awaits the capture lane. |
| ios | review | 2026-10-09 | ClosedSource/DSX/Modules/Mandatory/Foundation/Components/Structure/CommandPalette/swift/CommandPalette.swift: the system search field is the entry, each row is one combined accessibility element, the shortcut hint is hidden from VoiceOver, the navigation title and the search prompt carry the label, Cancel is a toolbar button, and Return chooses the first row through onSubmit(of: .search). Verified by code review (lane MINI-DOM); the visual capture awaits the capture lane. |
| android | review | 2026-10-09 | OpenSource/Engine/Kotlin/render/src/main/kotlin/despia/engine/render/elements/CommandPalette.kt: the field is a DropdownList role whose stateDescription is the active row, each row is a selectable button named title, subtitle and hint, N results is a polite live region, the Dialog traps focus, and the arrow, Home, End, Enter and Escape keys drive it. Verified by code review (lane MINI-DOM); the visual capture awaits the capture lane. |
| desktop | unaudited | unaudited | none recorded |

Every element carries `aria-label`, `aria-description`, `aria-valuetext`, `role`, `aria-pressed` and `aria-hidden`. A control that draws an icon beside text is one group with one label, never two announcements; see the [universal attributes](/components/attributes).

This page is GENERATED by ClosedSource/scripts/generate_component_docs.rb. A hand edit here is overwritten on the next run by design: fix the ledger instead (the attribute and event contract in `OpenSource/Documentation/reference/stack-elements.json`, the platform support and the audit in `OpenSource/Conformance/library/matrix.json`, the description and the web limits in `OpenSource/Engine/TypeScript/support/element-support.json`, the specimen in `OpenSource/Catalog`).

