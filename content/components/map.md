---
title: map
description: The rich Web twin renders a REAL basemap when tiles= names a source - a self-hosted Protomaps .pmtiles archive (range-read, MVT-decoded, canvas-painted in the Despia neutral language with archive-metadata attribution) or a raster {z}/{x}/{y} template - plus accessible pins and pointer/keyboard pan/zoom; without tiles= it is the honest offline coordinate plane.
order: 3
section: components
element: map
category: data
scope: library
platforms: web,ios,android
properties: [{"name":"interaction","type":"enum","default":"all","values":["all","none"]},{"name":"lat","type":"number","default":"0"},{"name":"lon","type":"number","default":"0"},{"name":"pin-glyph","type":"sf-symbol","default":"mappin.circle.fill"},{"name":"pin-lat","type":"string","default":"lat"},{"name":"pin-lon","type":"string","default":"lng"},{"name":"pin-subtitle","type":"string","default":"subtitle"},{"name":"pin-title","type":"string","default":"title"},{"name":"pins","type":"expr","default":null},{"name":"route-line-type","type":"enum","default":"solid","values":["solid","dashed","dotted"]},{"name":"style","type":"enum","default":"standard","values":["standard"]},{"name":"user-location","type":"bool","default":"false"},{"name":"zoom","type":"number","default":"12"}]
actions: []
catalog: 0.1.0
commit: 468dc3f018c7ba11202d2d17f04f9e04ad2e336e
generator: ClosedSource/scripts/generate_component_docs.rb
---

# map

The rich Web twin renders a REAL basemap when tiles= names a source - a self-hosted Protomaps .pmtiles archive (range-read, MVT-decoded, canvas-painted in the Despia neutral language with archive-metadata attribution) or a raster {z}/{x}/{y} template - plus accessible pins and pointer/keyboard pan/zoom; without tiles= it is the honest offline coordinate plane.

<RefMeta platforms="Web,iOS,Android">
Category: Data - Live specimens: the [System gallery](/system).
</RefMeta>

## Usage

```dsx
<map lat="52.52" lon="13.405" zoom="12" style="height: 240px; min-height: 240px"/>
```

`map` takes no children.

## Catalog specimen

`MapDefault.dsx`, verbatim from the catalog:

```dsx
<stack style="width: 100%; height: 160px">
  <head/>
  <map lat="52.52" lon="13.405" zoom="12"/>
</stack>
```

Every component in the library is authored at four rungs in the catalog (default, system words, one property override, fully custom), so the cost of leaving the system design is visible in one place. The [System gallery](/system) runs them.

## States

| Renderer | Audited | Dated | Evidence |
|---|---|---|---|
| web | no, and named | 2026-08-18 | W11 disposition (b), dated decision: map is the maps module's tag (census module: maps); the web twin is the documented offline coordinate plane (OpenSource/Engine/TypeScript/support/element-support.json map row keeps status partial: no tiles/routes/regions/user location), so its pin/pan interaction states are functional but not held to the library per-state bar; the full map presentation follows the maps module roadmap. Red-by-record. |
| ios | review | 2026-08-18 | Selection state rides the Map selection binding: on:select/on:pin-tap fire with pin payloads, on:tap converts to {lat, lon}; interaction= gates pan/zoom modes; iOS<17 renders empty by decision, fail-open (ClosedSource/DSX/Modules/Core/Maps/swift/Maps.swift). Verified-by-review; the visual capture awaits the iOS capture lane. |
| android | n/a | 2026-08-18 | the surface is the platform map control (Google Maps Compose, Maps.kt): interaction= gates gestures (all/none/pan/zoom), pins/camera/route are bound DATA; no component state axis of its own. |
| desktop | unaudited | unaudited | none recorded |

Rest, hover on a fine pointer, pressed, focus visible and disabled, in both colour schemes, plus loading, error and empty where the component has them.

## Attributes

| Attribute | Type | Default | Notes |
|---|---|---|---|
| `interaction` | `all` \| `none` | `all` |  |
| `lat` | `number` | `0` |  |
| `lon` | `number` | `0` |  |
| `pin-glyph` | `sf-symbol` | `mappin.circle.fill` |  |
| `pin-lat` | `string` | `lat` |  |
| `pin-lon` | `string` | `lng` |  |
| `pin-subtitle` | `string` | `subtitle` |  |
| `pin-title` | `string` | `title` |  |
| `pins` | `expr` |  |  |
| `route-line-type` | `solid` \| `dashed` \| `dotted` | `solid` |  |
| `style` | `standard` | `standard` |  |
| `user-location` | `bool` | `false` |  |
| `zoom` | `number` | `12` |  |

Every element also carries the [universal attributes](/components/attributes): accessibility, animation, `class`, `style` and the platform suffixes.

## Events

`map` raises no events.

## Platform notes

| Renderer | Grammar | What that means |
|---|---|---|
| web | `partial` | a renderer exists and is narrower than the reference in the ways listed below |
| ios | `reference` | the reference renderer this element is specified against |
| android | `module-facet` | filled by the module facet when that module is registered |
| desktop | `uncaptured` | no desktop capture has measured it, which claims nothing in either direction |

The rich Web twin renders a REAL basemap when tiles= names a source - a self-hosted Protomaps .pmtiles archive (range-read, MVT-decoded, canvas-painted in the Despia neutral language with archive-metadata attribution) or a raster {z}/{x}/{y} template - plus accessible pins and pointer/keyboard pan/zoom; without tiles= it is the honest offline coordinate plane.

**Known limits on the web**

- It does not render routes, regions, circles, user location, or the native map style/glyph contract.
- It is a coordinate visualization with a tile plane, not a geocoding/navigation SDK.

**Fallback.** Mounts the functional offline coordinate plane (accessible pins, pointer/keyboard pan/zoom); tiles/routes/regions are absent, never a broken map-SDK surface.

**Implementation notes.** The overlay paint is CSS (constitution Article 12): the registered knobs --dsx-map-pin-color (colors.pin), --dsx-map-route-color (colors.route), --dsx-map-route-width (geometry.routeWidth, 4), --dsx-map-route-opacity, --dsx-map-region-color and --dsx-map-circle-color; the props pinColor, routeColor, routeWidth, routeOpacity, regionColor and circleColor are refused by the lint (E107). pinColorField stays data.

Declared platforms: `ios`, `android`, `web`.

## Theming

DSX has one styling vocabulary and it is CSS. Three doors reach this element, and they differ only in how often the look repeats: `style="..."` for a declaration list on one element, `class="..."` for a name declared in a `<style>` block, and the component's own sheet for everything a whole screen shares.

On the web this element's root carries `dsx-map`, the stable class the contract application CSS targets. It is a rendering fact you can read, not a styling hook to depend on: style the element, not the class the renderer stamps.

Web runtime: `rich`.

## Accessibility

| Renderer | Audited | Dated | Evidence |
|---|---|---|---|
| web | yes | 2026-08-18 | role=application, focusable plane, labelled zoom controls, accessible pins (element-support.json); axe 0 serious/critical on the data family page light (dark: text link finding filed separately) |
| ios | review | 2026-08-18 | The system SwiftUI Map exposes the platform map accessibility (controls + markers announced by the OS); pin titles feed marker labels. ClosedSource/DSX/Modules/Core/Maps/swift/Maps.swift. Verified-by-review; the visual capture awaits the iOS capture lane. |
| android | no, and named | 2026-08-19 | AUDITED-RED (dated 2026-08-19, W12 red sweep disposition): unchanged by the sweep, and out of reach in this environment - accessibility rides the Google Maps view's OWN tree (no repo-side semantics to add without occluding it, Maps.kt), so the honest verification is a DEVICE audit naming what TalkBack actually reaches; that needs a real device/emulator with Play services, which this environment does not have. Stays red until the device audit runs; the web column's role=application + labelled controls remain the reference bar. |
| desktop | unaudited | unaudited | none recorded |

Every element carries `aria-label`, `aria-description`, `aria-valuetext`, `role`, `aria-pressed` and `aria-hidden`. A control that draws an icon beside text is one group with one label, never two announcements; see the [universal attributes](/components/attributes).

This page is GENERATED by ClosedSource/scripts/generate_component_docs.rb. A hand edit here is overwritten on the next run by design: fix the ledger instead (the attribute and event contract in `OpenSource/Documentation/reference/stack-elements.json`, the platform support and the audit in `OpenSource/Conformance/library/matrix.json`, the description and the web limits in `OpenSource/Engine/TypeScript/support/element-support.json`, the specimen in `OpenSource/Catalog`).

