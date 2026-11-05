---
title: scaffold
description: The base Web twin provides an accessible adaptive split/stack shell with sidebar/content/inspector panes, authored widths, collapse policy, and labels.
order: 3
section: components
element: scaffold
category: layout
scope: library
platforms: web,ios,android
properties: [{"name":"--dsx-content-min","type":"number","default":"480"},{"name":"--dsx-inspector-ideal","type":"number","default":"240 / 320 / 420"},{"name":"--dsx-inspector-max","type":"number","default":"240 / 320 / 420"},{"name":"--dsx-inspector-min","type":"number","default":"240 / 320 / 420"},{"name":"--dsx-sidebar-ideal","type":"number","default":"220 / 320 / 360"},{"name":"--dsx-sidebar-max","type":"number","default":"220 / 320 / 360"},{"name":"--dsx-sidebar-min","type":"number","default":"220 / 320 / 360"},{"name":"--dsx-window-medium","type":"number","default":"600"},{"name":"collapse","type":"enum","default":"platform","values":["platform","stack","content","tabs","none"]},{"name":"column-visibility","type":"enum","default":"automatic","values":["automatic","all","doubleColumn","detailOnly"]},{"name":"content-label","type":"string","default":"Content"},{"name":"inspector-label","type":"string","default":"Inspector"},{"name":"inspector-visibility","type":"enum","default":"automatic","values":["automatic","shown","hidden"]},{"name":"keyboard-avoid","type":"enum","default":"resize","values":["resize","overlay","none"]},{"name":"pane","type":"enum","default":"content for an unpinned child without pane","values":["sidebar","content","inspector"]},{"name":"pin","type":"enum","default":null,"values":["top","bottom"]},{"name":"preferred-compact-column","type":"enum","default":"automatic","values":["automatic","sidebar","content"]},{"name":"shell","type":"enum","default":"custom","values":["custom","automatic","native"]},{"name":"sidebar-label","type":"string","default":"Sidebar"},{"name":"sidebar-title","type":"string","default":null},{"name":"title","type":"string","default":null}]
actions: []
catalog: 0.1.0
commit: 468dc3f018c7ba11202d2d17f04f9e04ad2e336e
generator: ClosedSource/scripts/generate_component_docs.rb
---

# scaffold

The base Web twin provides an accessible adaptive split/stack shell with sidebar/content/inspector panes, authored widths, collapse policy, and labels.

<RefMeta platforms="Web,iOS,Android">
Category: Layout - Live specimens: the [System gallery](/system).
</RefMeta>

## Usage

```dsx
<scaffold shell="automatic"><vstack pane="sidebar"><text value="Library"/></vstack><scroll pane="content"><text value="Body"/></scroll></scaffold>
```

`scaffold` takes children.

## Catalog specimen

`ScaffoldDefault.dsx`, verbatim from the catalog:

```dsx
<scaffold shell="automatic" style="width: 100%; height: 200px; border: 1px solid var(--dsx-separator); --dsx-window-medium: 760px; --dsx-window-medium: 760px">
  <head/>
  <vstack pane="sidebar" style="padding: 12px">
    <text value="Library"/>
  </vstack>
  <scroll pane="content" style="padding: 12px">
    <text value="Body"/>
  </scroll>
</scaffold>
```

Every component in the library is authored at four rungs in the catalog (default, system words, one property override, fully custom), so the cost of leaving the system design is visible in one place. The [System gallery](/system) runs them.

## States

| Renderer | Audited | Dated | Evidence |
|---|---|---|---|
| web | n/a | 2026-08-18 | Non-interactive display/layout surface: no rest/hover/pressed/focus/disabled axis (value-driven rendering is data, not interaction state; Skeleton IS the loading state). |
| ios | n/a | 2026-08-18 | Non-interactive display/layout surface: no rest/hover/pressed/focus/disabled axis (value-driven rendering is data, not interaction state; Skeleton IS the loading state). |
| android | n/a | 2026-08-18 | Non-interactive display/layout surface: no rest/hover/pressed/focus/disabled axis (value-driven rendering is data, not interaction state; Skeleton IS the loading state). |
| desktop | unaudited | unaudited | none recorded |

Rest, hover on a fine pointer, pressed, focus visible and disabled, in both colour schemes, plus loading, error and empty where the component has them.

## Attributes

| Attribute | Type | Default | Notes |
|---|---|---|---|
| `--dsx-content-min` | `number` | `480` | The content column's readable minimum. A window that cannot hold it beside the other columns collapses them in order: the inspector becomes a trailing panel (the scaffold's inspector toggle), then a master column is pushed, then the sidebar overlays. `collapse="none"` opts out. |
| `--dsx-inspector-ideal` | `number` | `240 / 320 / 420` | Inspector width triplet; normalized so min ≤ ideal ≤ max. |
| `--dsx-inspector-max` | `number` | `240 / 320 / 420` | Inspector width triplet; normalized so min ≤ ideal ≤ max. |
| `--dsx-inspector-min` | `number` | `240 / 320 / 420` | Inspector width triplet; normalized so min ≤ ideal ≤ max. |
| `--dsx-sidebar-ideal` | `number` | `220 / 320 / 360` | Sidebar width triplet; normalized so min ≤ ideal ≤ max. The 320 ideal is the stock iPad NavigationSplitView sidebar. |
| `--dsx-sidebar-max` | `number` | `220 / 320 / 360` | Sidebar width triplet; normalized so min ≤ ideal ≤ max. The 320 ideal is the stock iPad NavigationSplitView sidebar. |
| `--dsx-sidebar-min` | `number` | `220 / 320 / 360` | Sidebar width triplet; normalized so min ≤ ideal ≤ max. The 320 ideal is the stock iPad NavigationSplitView sidebar. |
| `--dsx-window-medium` | `number` | `600` | The compact boundary in logical points/dp/CSS px, for this scaffold (the app-wide ladder is the `--dsx-window-*` CSS tokens). The scaffold plans from its OWN width. |
| `collapse` | `platform` \| `stack` \| `content` \| `tabs` \| `none` | `platform` | `content` \ |
| `column-visibility` | `automatic` \| `all` \| `doubleColumn` \| `detailOnly` | `automatic` | `doubleColumn` \ |
| `content-label` | `string` | `Content` |  |
| `inspector-label` | `string` | `Inspector` |  |
| `inspector-visibility` | `automatic` \| `shown` \| `hidden` | `automatic` | Two-way bindable, SwiftUI's `.inspector(isPresented:)` state. `automatic`: open where the fit gives the inspector a column, closed in every other presentation. `shown`: open in whatever presentation the size gives (the column, the overlay, the sheet). `hidden`: closed; the toggle reopens it. The toggle, Escape, the sheet's close or swipe and the system Back write it back. |
| `keyboard-avoid` | `resize` \| `overlay` \| `none` | `resize` | `none` |
| `pane` | `sidebar` \| `content` \| `inspector` | `content for an unpinned child without pane` |  |
| `pin` | `top` \| `bottom` |  |  |
| `preferred-compact-column` | `automatic` \| `sidebar` \| `content` | `automatic` | `content` |
| `shell` | `custom` \| `automatic` \| `native` | `custom` | `native` |
| `sidebar-label` | `string` | `Sidebar` |  |
| `sidebar-title` | `string` |  |  |
| `title` | `string` |  |  |

Every element also carries the [universal attributes](/components/attributes): accessibility, animation, `class`, `style` and the platform suffixes.

## Events

`scaffold` raises no events.

## Platform notes

| Renderer | Grammar | What that means |
|---|---|---|
| web | `supported` | the built in renderer implements this element |
| ios | `reference` | the reference renderer this element is specified against |
| android | `enforced` | implemented and pinned by the element parity test |
| desktop | `uncaptured` | no desktop capture has measured it, which claims nothing in either direction |

The base Web twin provides an accessible adaptive split/stack shell with sidebar/content/inspector panes, authored widths, collapse policy, and labels.

**Known limits on the web**

- Web uses semantic CSS layout and does not claim NavigationSplitView, WinUI, or GTK chrome.

**Implementation notes.** Apple uses a real NavigationSplitView when available. Compose/Web use semantic split/stack layouts and do not claim WinUI or GTK. See OpenSource/Conformance/layout/adaptive-shell.json.

Declared platforms: `ios`, `android`, `web`, `macos`, `windows`, `linux`.

**Adaptivity (web, 2026-08-18).** 1366: sidebar/content/inspector side by side (x=30/250/1097); below compactAt: panes stack (collapse=stack); /system gallery rides it in production - w8 Chromium probe (compileComponent->bootDsx, full skin), scratchpad/w8/*.mjs, shots/w8-audit-*

## Theming

DSX has one styling vocabulary and it is CSS. Three doors reach this element, and they differ only in how often the look repeats: `style="..."` for a declaration list on one element, `class="..."` for a name declared in a `<style>` block, and the component's own sheet for everything a whole screen shares.

On the web this element's root carries `dsx-scaffold`, the stable class the contract application CSS targets. It is a rendering fact you can read, not a styling hook to depend on: style the element, not the class the renderer stamps.

Web runtime: `base`.

## Accessibility

| Renderer | Audited | Dated | Evidence |
|---|---|---|---|
| web | yes | 2026-08-18 | nav/main/aside panes with sidebarLabel/contentLabel/inspectorLabel; a11y-demo.ts: 0 serious/critical over /system gallery, all 4 sections, light+dark (the /system gallery rides scaffold) |
| ios | review | 2026-08-18 | Panes are accessibility containers (.accessibilityElement(children: .contain), Scaffold.swift pane) inside the system split view; pinned bars stay reachable (CI asserts pinned survives the adaptive split). Verified-by-review; the visual capture awaits the iOS capture lane. |
| android | review | 2026-08-18 | VERIFIED-BY-REVIEW: every pane is a labelled semantics node: testTag dsx.scaffold.`<role>` + contentDescription Sidebar/Content/Inspector (Containers.kt Pane, SCAFFOLD_*_LABEL); bars stay inside safe insets so content is never occluded. |
| desktop | unaudited | unaudited | none recorded |

Every element carries `aria-label`, `aria-description`, `aria-valuetext`, `role`, `aria-pressed` and `aria-hidden`. A control that draws an icon beside text is one group with one label, never two announcements; see the [universal attributes](/components/attributes).

This page is GENERATED by ClosedSource/scripts/generate_component_docs.rb. A hand edit here is overwritten on the next run by design: fix the ledger instead (the attribute and event contract in `OpenSource/Documentation/reference/stack-elements.json`, the platform support and the audit in `OpenSource/Conformance/library/matrix.json`, the description and the web limits in `OpenSource/Engine/TypeScript/support/element-support.json`, the specimen in `OpenSource/Catalog`).

