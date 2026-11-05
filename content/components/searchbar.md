---
title: searchbar
description: The Web twin is the composite search field the native reference draws: a leading magnifier, the real search input with binding, the Search placeholder default and submit, and a trailing clear button that writes the bound path back and fires on:clear.
order: 3
section: components
element: searchbar
category: input
scope: library
platforms: web,ios,android,desktop
properties: [{"name":"autocapitalize","type":"enum","default":"-"},{"name":"bind","type":"expr","default":null},{"name":"disabled","type":"bool","default":"false"},{"name":"disabled-if","type":"expr","default":null},{"name":"enterkeyhint","type":"enum","default":"-"},{"name":"focus-bind","type":"state-key","default":"-"},{"name":"focus-key","type":"state-key","default":"-"},{"name":"focus-select","type":"enum","default":"-","values":["all","start","end"]},{"name":"keyboard","type":"enum","default":"-"},{"name":"on:blur","type":"action","default":null},{"name":"on:change","type":"action","default":null},{"name":"on:clear","type":"action","default":null},{"name":"on:focus","type":"action","default":null},{"name":"on:submit","type":"action","default":null},{"name":"placeholder","type":"string","default":"Search"},{"name":"readonly","type":"bool","default":"false"},{"name":"secure","type":"bool","default":"false"}]
actions: ["blur","change","clear","focus","submit"]
catalog: 0.1.0
commit: 468dc3f018c7ba11202d2d17f04f9e04ad2e336e
generator: ClosedSource/scripts/generate_component_docs.rb
---

# searchbar

The Web twin is the composite search field the native reference draws: a leading magnifier, the real search input with binding, the Search placeholder default and submit, and a trailing clear button that writes the bound path back and fires on:clear.

<RefMeta platforms="Web,iOS,Android,Desktop">
Category: Input - Live specimens: the [System gallery](/system).
</RefMeta>

## Usage

```dsx
<searchbar bind="dsx.variable.query" placeholder="Search" on:submit="dsx.action.search()"/>
```

`searchbar` takes no children.

## Catalog specimen

`SearchbarDefault.dsx`, verbatim from the catalog:

```dsx
<searchbar bind="dsx.variable.query" placeholder="Search" style="width: 100%">
  <head>
    <variable as="query">return ''</variable>
  </head>
</searchbar>
```

Every component in the library is authored at four rungs in the catalog (default, system words, one property override, fully custom), so the cost of leaving the system design is visible in one place. The [System gallery](/system) runs them.

## States

| Renderer | Audited | Dated | Evidence |
|---|---|---|---|
| web | yes | 2026-08-18 | probe: leading icon, typing writes store (q=amp), clear affordance, focus well, hover inner delta - w8 Chromium probe (compileComponent->bootDsx, full skin), scratchpad/w8/*.mjs, shots/w8-audit-* |
| ios | review | 2026-08-18 | Focus-preserving clear flow: the trailing clear appears only while non-empty and clears + fires on:clear without dropping keyboard focus (@FocusState, DSXSearchBar); submitLabel(.search) + on:submit; W9 disabled wrapper (ClosedSource/DSX/Modules/Mandatory/Foundation/Components/Basics/SearchBar/swift/SearchBar.swift:22-24). Verified-by-review; the visual capture awaits the iOS capture lane. |
| android | review | 2026-08-18 | VERIFIED-BY-REVIEW: bound field in the capsule: trailing clear button appears while non-empty (clears + on:clear), Return fires on:submit, on:change per keystroke through the seam (Forms.kt SEARCHBAR block, SearchBar.swift 1:1); disabled= in the contract. |
| desktop | unaudited | unaudited | none recorded |

Rest, hover on a fine pointer, pressed, focus visible and disabled, in both colour schemes, plus loading, error and empty where the component has them.

## Attributes

| Attribute | Type | Default | Notes |
|---|---|---|---|
| `autocapitalize` | `enum` | `-` | `off` \| `none` \| `on` \| `sentences` \| `words` \| `characters`, the HTML spelling. Sets the soft keyboard's auto-capitalization. Also on `<textarea>`. |
| `bind` | `expr` |  | Two-way bound String. |
| `disabled` | `bool` | `false` |  |
| `disabled-if` | `expr` |  | Disabled when this expression is truthy. `disabled=` binds as TEXT, and the string "false" is TRUE - so a bound boolean belongs here, never there. |
| `enterkeyhint` | `enum` | `-` | `enter` \| `done` \| `go` \| `next` \| `previous` \| `search` \| `send`, the HTML spelling. Sets the soft keyboard's return key label; wins over the label `keyboard` implies. Also on `<textarea>`. |
| `focus-bind` | `state-key` | `-` | Moves the caret from the document, the SwiftUI `.focused($field, equals: key)` shape: writing this field's `focus-key` to the `focus-bind` path focuses it, writing `""` blurs it, and the field writes its key there on focus and `""` on blur. One path names one field (e.g. `dsx.global.loginFocus = 'email'` after an invalid submit). `focus-key` interpolates. Also on `<textarea>`. |
| `focus-key` | `state-key` | `-` | Moves the caret from the document, the SwiftUI `.focused($field, equals: key)` shape: writing this field's `focus-key` to the `focus-bind` path focuses it, writing `""` blurs it, and the field writes its key there on focus and `""` on blur. One path names one field (e.g. `dsx.global.loginFocus = 'email'` after an invalid submit). `focus-key` interpolates. Also on `<textarea>`. |
| `focus-select` | `all` \| `start` \| `end` | `-` | The selection the field takes when it gains focus (a press, a tab or a `focus-bind` request): `all` selects the whole text (a copy field), `start` / `end` put the caret first / last. A binding is followed. Also on `<textarea>`. |
| `keyboard` | `enum` | `-` | `email` \| `number` \| `decimal` \| `phone` \| `url` \| `ascii` \| `twitter` \| `websearch`. Picks the soft-keyboard variant. |
| `on:blur` | `action` |  | Editing began / ended. |
| `on:change` | `action` |  | Fires on each edit. |
| `on:clear` | `action` |  | Web searchbar clear button; carries `{ value: "" }`, after `on:change`. |
| `on:focus` | `action` |  | Editing began / ended. |
| `on:submit` | `action` |  | Return key. |
| `placeholder` | `string` | `Search` |  |
| `readonly` | `bool` | `false` | The value shows, selects and copies but cannot be edited; the field still focuses and submits. A binding (`readonly="{{ … }}"`) is followed as it resolves. Also on `<textarea>`. |
| `secure` | `bool` | `false` | `"true"` → `SecureField`. A binding (`secure="{{ dsx.variable.type == 'password' }}"`) is followed as it resolves (a reveal toggle); a bound secure never puts its value in server-rendered markup. |

Every element also carries the [universal attributes](/components/attributes): accessibility, animation, `class`, `style` and the platform suffixes.

## Events

| Event | Handler |
|---|---|
| `blur` | `on:blur="..."` |
| `change` | `on:change="..."` |
| `clear` | `on:clear="..."` |
| `focus` | `on:focus="..."` |
| `submit` | `on:submit="..."` |

A payload arrives FLAT in the handler scope, so a declared action names the key bare (`message="message"`), never through an `event` plane.

## Platform notes

| Renderer | Grammar | What that means |
|---|---|---|
| web | `supported` | the built in renderer implements this element |
| ios | `reference` | the reference renderer this element is specified against |
| android | `enforced` | implemented and pinned by the element parity test |
| desktop | `captured` | the desktop capture plane composed and measured this element at both locked widths |

The Web twin is the composite search field the native reference draws: a leading magnifier, the real search input with binding, the Search placeholder default and submit, and a trailing clear button that writes the bound path back and fires on:clear.

**Known limits on the web**

- The leading and trailing glyphs are drawn as control chrome rather than resolved through the shared icon corpus, so a control affordance can never depend on an icon name being present in that table.
- The browser's own type=search cancel affordance is suppressed in favour of the declared clear button, and its `search` event is routed through the same on:clear contract.

**Implementation notes.** Leading magnifyingglass + trailing xmark.circle.fill clear button (shown while non-empty), both .secondary (SearchBar.swift:39-40,52-53).

Declared platforms: `ios`, `android`, `web`.

**Adaptivity (web, 2026-08-18).** identical presentation at 390 touch and 1366 fine pointer by declaration (probed both, page overflow 0; only density tokens move); RTL mount: overflow 0, leading alignment mirrors (btn right edge flush) - w8 Chromium probe (compileComponent->bootDsx, full skin), scratchpad/w8/*.mjs, shots/w8-audit-*

## Theming

DSX has one styling vocabulary and it is CSS. Three doors reach this element, and they differ only in how often the look repeats: `style="..."` for a declaration list on one element, `class="..."` for a name declared in a `<style>` block, and the component's own sheet for everything a whole screen shares.

On the web this element's root carries `dsx-searchbar-field`, the stable class the contract application CSS targets. It is a rendering fact you can read, not a styling hook to depend on: style the element, not the class the renderer stamps.

Web runtime: `base`.

## Accessibility

| Renderer | Audited | Dated | Evidence |
|---|---|---|---|
| web | yes | 2026-08-18 | labelled search input + labelled clear; axe 0 serious/critical on the controls family page light+dark (calendar excluded, filed) |
| ios | review | 2026-08-18 | System TextField (placeholder announced, search submit label); the clear control is a real Button carrying the system symbol's label; icons are secondary-tinted (DSXSearchBar, ClosedSource/DSX/Modules/Mandatory/Foundation/Components/Basics/SearchBar/swift/SearchBar.swift). Verified-by-review; the visual capture awaits the iOS capture lane. |
| android | review | 2026-08-18 | VERIFIED-BY-REVIEW: the clear affordance is an activation (dsxAccessibleActivation, Forms.kt:606); the field is a real text input with the localized Search placeholder (DSXStrings). |
| desktop | unaudited | unaudited | none recorded |

Every element carries `aria-label`, `aria-description`, `aria-valuetext`, `role`, `aria-pressed` and `aria-hidden`. A control that draws an icon beside text is one group with one label, never two announcements; see the [universal attributes](/components/attributes).

This page is GENERATED by ClosedSource/scripts/generate_component_docs.rb. A hand edit here is overwritten on the next run by design: fix the ledger instead (the attribute and event contract in `OpenSource/Documentation/reference/stack-elements.json`, the platform support and the audit in `OpenSource/Conformance/library/matrix.json`, the description and the web limits in `OpenSource/Engine/TypeScript/support/element-support.json`, the specimen in `OpenSource/Catalog`).

