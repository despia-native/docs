---
title: chart
description: The rich Web twin renders accessible SVG line, area, bar and point charts from bound data - multi-series with palette or single color=, stacked= areas and bars (domain from the stack totals, bands closing on the previous layer), legend= at the census positions (a figcaption, so assistive tech reads it as the caption), xType=time positioning by parsed timestamps with the kernel timeTicks ladder, y2Key/y2Color riding a labeled secondary axis, animate= draw-in (reduced-motion instant), interpolation=linear|smooth|monotone|step, grids, and deterministic downsampling.
order: 3
section: components
element: chart
category: data
scope: library
platforms: web,ios,android
properties: [{"name":"animate","type":"bool","default":"true"},{"name":"color","type":"color","default":"var(--dsx-accent)"},{"name":"colors","type":"csv","default":null},{"name":"data","type":"expr","default":null},{"name":"interpolation","type":"enum","default":"linear","values":["linear","monotone","step"]},{"name":"legend","type":"enum","default":"bottom with series, else none","values":["bottom","top","leading","trailing","none"]},{"name":"on:select","type":"action","default":null},{"name":"rule-x","type":"string","default":null},{"name":"rule-y","type":"number","default":null},{"name":"series","type":"string","default":null},{"name":"show-points","type":"bool","default":"false"},{"name":"stacked","type":"bool","default":"true for area, else false"},{"name":"type","type":"enum","default":"line","values":["line","bar","area","point"]},{"name":"x","type":"string","default":null},{"name":"x-grid","type":"bool","default":"false"},{"name":"x-hide","type":"bool","default":"false"},{"name":"x-max","type":"string","default":null},{"name":"x-min","type":"string","default":null},{"name":"x-title","type":"string","default":null},{"name":"x-type","type":"enum","default":"category","values":["category","number","time"]},{"name":"y","type":"string","default":null},{"name":"y-grid","type":"bool","default":"true"},{"name":"y-hide","type":"bool","default":"false"},{"name":"y-max","type":"number","default":null},{"name":"y-min","type":"number","default":null},{"name":"y-title","type":"string","default":null},{"name":"y2-key","type":"string","default":null},{"name":"y2-max","type":"number","default":null},{"name":"y2-min","type":"number","default":null},{"name":"y2-title","type":"string","default":null}]
actions: ["select"]
catalog: 0.1.0
commit: 468dc3f018c7ba11202d2d17f04f9e04ad2e336e
generator: ClosedSource/scripts/generate_component_docs.rb
---

# chart

The rich Web twin renders accessible SVG line, area, bar and point charts from bound data - multi-series with palette or single color=, stacked= areas and bars (domain from the stack totals, bands closing on the previous layer), legend= at the census positions (a figcaption, so assistive tech reads it as the caption), xType=time positioning by parsed timestamps with the kernel timeTicks ladder, y2Key/y2Color riding a labeled secondary axis, animate= draw-in (reduced-motion instant), interpolation=linear|smooth|monotone|step, grids, and deterministic downsampling.

<RefMeta platforms="Web,iOS,Android">
Category: Data - Live specimens: the [System gallery](/system).
</RefMeta>

## Usage

```dsx
<chart type="line" data="dsx.variable.sales" x="month" y="revenue" style="height: 220px; min-height: 220px"/>
```

`chart` takes no children.

## Catalog specimen

`ChartDefault.dsx`, verbatim from the catalog:

```dsx
<chart type="line" data="dsx.variable.sales" x="month" y="revenue" style="width: 100%; height: 160px">
  <head>
    <variable as="sales">return [{ month: 'Jan', revenue: 12 }, { month: 'Feb', revenue: 18 }, { month: 'Mar', revenue: 15 }, { month: 'Apr', revenue: 24 }]</variable>
  </head>
</chart>
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
| `animate` | `bool` | `true` |  |
| `color` | `color` | `var(--dsx-accent)` |  |
| `colors` | `csv` |  |  |
| `data` | `expr` |  |  |
| `interpolation` | `linear` \| `monotone` \| `step` | `linear` |  |
| `legend` | `bottom` \| `top` \| `leading` \| `trailing` \| `none` | `bottom with series, else none` |  |
| `on:select` | `action` |  |  |
| `rule-x` | `string` |  |  |
| `rule-y` | `number` |  |  |
| `series` | `string` |  |  |
| `show-points` | `bool` | `false` |  |
| `stacked` | `bool` | `true for area, else false` |  |
| `type` | `line` \| `bar` \| `area` \| `point` | `line` |  |
| `x` | `string` |  |  |
| `x-grid` | `bool` | `false` |  |
| `x-hide` | `bool` | `false` |  |
| `x-max` | `string` |  |  |
| `x-min` | `string` |  |  |
| `x-title` | `string` |  |  |
| `x-type` | `category` \| `number` \| `time` | `category` |  |
| `y` | `string` |  |  |
| `y-grid` | `bool` | `true` |  |
| `y-hide` | `bool` | `false` |  |
| `y-max` | `number` |  |  |
| `y-min` | `number` |  |  |
| `y-title` | `string` |  |  |
| `y2-key` | `string` |  |  |
| `y2-max` | `number` |  |  |
| `y2-min` | `number` |  |  |
| `y2-title` | `string` |  |  |

Every element also carries the [universal attributes](/components/attributes): accessibility, animation, `class`, `style` and the platform suffixes.

## Events

| Event | Handler |
|---|---|
| `select` | `on:select="..."` |

A payload arrives FLAT in the handler scope, so a declared action names the key bare (`message="message"`), never through an `event` plane.

## Platform notes

| Renderer | Grammar | What that means |
|---|---|---|
| web | `supported` | the built in renderer implements this element |
| ios | `reference` | the reference renderer this element is specified against |
| android | `module-facet` | filled by the module facet when that module is registered |
| desktop | `uncaptured` | no desktop capture has measured it, which claims nothing in either direction |

The rich Web twin renders accessible SVG line, area, bar and point charts from bound data - multi-series with palette or single color=, stacked= areas and bars (domain from the stack totals, bands closing on the previous layer), legend= at the census positions (a figcaption, so assistive tech reads it as the caption), xType=time positioning by parsed timestamps with the kernel timeTicks ladder, y2Key/y2Color riding a labeled secondary axis, animate= draw-in (reduced-motion instant), interpolation=linear|smooth|monotone|step, grids, and deterministic downsampling.

**Known limits on the web**

- More than 2,000 source points are deterministically downsampled.

**Implementation notes.** The mark paint is CSS (constitution Article 12): the registered knobs --dsx-chart-line-stroke-width (geometry.lineStrokeWidth, 2), --dsx-chart-point-width (geometry.pointWidth, 6.32, the width of a point's box) and --dsx-chart-area-opacity (geometry.areaOpacity, 0.25), and --dsx-chart-y2-color (colors.y2); the props lineWidth, pointSize, areaOpacity and y2Color are refused by the lint (E107). The domain and annotation attributes are data, not look: y-min/y-max and y2-min/y2-max pin a scale when both bounds are given, x-title/y-title/y2-title label the axes, rule-y draws a dashed reference line at a primary-axis value; iOS, Android and web draw them. The Compose Desktop renderer (desktop is 1.0.0 scope) draws type, series, colours and point overlays only: no axis bounds, titles, rule, secondary axis or on:select.

Declared platforms: `ios`, `android`, `web`.

**Adaptivity (web, 2026-08-18).** identical fluid presentation at both widths (data family page 390+1366, overflow 0); RTL page mirrors (ChatBubble sides flip: firstFromRight=0) - w8 Chromium probe (compileComponent->bootDsx, full skin), scratchpad/w8/*.mjs, shots/w8-audit-*

## Theming

DSX has one styling vocabulary and it is CSS. Three doors reach this element, and they differ only in how often the look repeats: `style="..."` for a declaration list on one element, `class="..."` for a name declared in a `<style>` block, and the component's own sheet for everything a whole screen shares.

On the web this element's root carries `dsx-chart`, the stable class the contract application CSS targets. It is a rendering fact you can read, not a styling hook to depend on: style the element, not the class the renderer stamps.

Web runtime: `rich`.

## Accessibility

| Renderer | Audited | Dated | Evidence |
|---|---|---|---|
| web | yes | 2026-08-18 | accessible SVG with generated summary label ('line chart with 4 points; values range from 0 to 8'); axe 0 serious/critical on the data family page light (dark: text link finding filed separately) |
| ios | review | 2026-08-18 | The platform charting framework provides per-mark accessibility elements by default for its marks; the kernel a11y pass applies on any element (StackStyle.apply, OpenSource/Engine/Swift/Stack.swift:6060-6092: a11yLabel/aria-label, a11yHint, a11yValue, a11yTrait/role, a11yGroup, a11yHidden; on:tap implies .isButton). ClosedSource/DSX/Modules/Core/Charts/swift/Charts.swift. Verified-by-review; the visual capture awaits the iOS capture lane. |
| android | review | 2026-08-19 | W12 red sweep 2026-08-19: the web-generated summary ported to Compose semantics - contentDescription '`<type>` chart with N points; values range from `<min>` to `<max>`' (empty data reads '`<type>` chart with 0 points') on the chart Canvas (ClosedSource/DSX/Modules/Core/Charts/kotlin/Charts.kt ChartView; the elements.ts figure aria-label twin). :app:assembleDebug green. Pending the Android capture lane. |
| desktop | unaudited | unaudited | none recorded |

Every element carries `aria-label`, `aria-description`, `aria-valuetext`, `role`, `aria-pressed` and `aria-hidden`. A control that draws an icon beside text is one group with one label, never two announcements; see the [universal attributes](/components/attributes).

This page is GENERATED by ClosedSource/scripts/generate_component_docs.rb. A hand edit here is overwritten on the next run by design: fix the ledger instead (the attribute and event contract in `OpenSource/Documentation/reference/stack-elements.json`, the platform support and the audit in `OpenSource/Conformance/library/matrix.json`, the description and the web limits in `OpenSource/Engine/TypeScript/support/element-support.json`, the specimen in `OpenSource/Catalog`).

