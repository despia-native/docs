---
title: iOS, Android and web
description: One document runs on three platforms. What each one renders today, how a screen adapts to the window, and what is measured rather than claimed.
---

A `.dsx` document is executed by three kernels: Swift on iOS, Kotlin on Android and TypeScript on the web. They share the same conformance tests, so a document computes, routes and fails the same way everywhere.

## What runs where today

| | Status in Despia V4 0.0.2 |
| :-- | :-- |
| Web (DSX DOM) | Production |
| iOS and Android app, drawn by DSX DOM | Production |
| Native features through packages | Per package: see the [catalog](/packages) |
| macOS desktop | Production |
| Drawing with SwiftUI and Jetpack Compose (DSX View) | Alpha, production with DSX 1.0.0 |
| Windows and Linux desktop | Preview |

The same documents work in every row. When DSX View reaches production, your app's screens move to SwiftUI and Compose without a rewrite.

## The look follows the platform

An unstyled control takes the look of the platform it runs on. A Despia app is meant to look like an iPhone app on an iPhone and an Android app on Android, so the target for native rendering is close agreement in layout and type, not pixel identity with the web. Colours that the platform owns, such as the system background, come from the platform.

Your CSS still wins. When you style an element, every platform draws your declarations.

## One screen, every window size

DSX adapts by size class, the way the platforms do: a compact width (a phone), and a regular width (an iPad, a Mac, a desktop window). The same rule applies on every platform:

- A sheet rises from the bottom on a phone and is presented centred on an iPad, a Mac or a wide browser window.
- A `<scaffold>` shows a sidebar beside the content on a wide window and collapses to a single column on a phone.
- Back buttons become breadcrumbs on the web in a wide window.

```dsx title="Components/Shell.dsx"
<scaffold shell="automatic" sidebarLabel="Library" contentLabel="Album">
  <stack pane="sidebar" style="padding: 16px; gap: 8px">
    <text value="Albums"/>
  </stack>
  <stack pane="content" style="padding: 20px">
    <text value="Pick an album"/>
  </stack>
</scaffold>
```

On a phone the sidebar can become the bottom tab bar instead (SwiftUI's sidebar-adaptable tab view). Mark the sections that are tabs on the sidebar, and choose the phone form with the `--dsx-sidebar-compact` property on the scaffold's style: `stack` (the default, one column with a Back to the sidebar), `tabs`, or `hidden`. Write `collapse` with the same word too, which the native renderers read today:

```dsx title="Components/Shell.dsx"
<scaffold shell="automatic" collapse="tabs" style="--dsx-sidebar-compact: tabs" sidebarLabel="Library" contentLabel="Page">
  <head>
    <attribute as="route" default="'/albums'"/>
    <action as="open" input:path="dsx.this.value">
      await dsx.module.route.reset({ path: path });
    </action>
  </head>
  <SidebarList pane="sidebar" value="{{ dsx.attribute.route }}" on:change="dsx.action.open()">
    <SidebarSection title="Library" tab="items">
      <SidebarItem value="/albums" icon="square.stack" title="Albums"/>
      <SidebarItem value="/artists" icon="music.mic" title="Artists"/>
    </SidebarSection>
    <SidebarSection title="Settings" tab="Settings" tabIcon="gearshape" root="/settings">
      <SidebarItem value="/account" icon="person" title="Account"/>
    </SidebarSection>
  </SidebarList>
  <scroll pane="content">
    <slot/>
  </scroll>
</scaffold>
```

The column sizes are properties on the style as well (`--dsx-sidebar-min`, `--dsx-sidebar-ideal`, `--dsx-sidebar-max`, `--dsx-window-medium` for the phone breakpoint). `npx despia lint` refuses a `collapse` or size attribute written without its property, because the web would draw the default instead.

For your own layouts, use CSS media queries on width in your sheets, or a container that measures itself.

## Safe areas and edge to edge

Apps draw edge to edge on both phones. Keep content clear of the notch, the home indicator and the Android navigation bar with CSS padding and the inset variables, not with attributes.

## Testing on devices

`npx despia run --target ios` and `npx despia run --target android` build for a simulator or emulator on your machine, install the app and stream its log. `npx despia device doctor` checks your Xcode and Android tools first.

```sh
npx despia device doctor
npx despia run --target ios
npx despia logs --target ios
```

Cloud builds for the stores do not need Xcode or Android Studio at all. See [Build and ship](/ship).
