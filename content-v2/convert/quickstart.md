---
title: Quickstart
description: From your web app's address to a native app on your phone that calls a native feature.
---

You need a web app at a public HTTPS address and a Despia account. You do not need Xcode or Android Studio.

::: steps

### Create the app

Open the [Despia Console](https://console.despia.com), choose **New app**, and enter your web app's address. The Despia Console makes the iOS and Android app around it.

From a terminal, the same step is:

```sh
npx @despia-native/cli login
npx @despia-native/cli account create --web https://your-app.com
```

### Add a package

In the app, open **Packages** and add **Haptics**. Packages are the native features your app can call. Each one is listed in the [package catalog](/packages).

### Call it from your web app

Add one line where you want the phone to respond, for example after a save:

```js
await dsx.module.haptic.success();
```

Deploy your web app as usual. The app loads it from your address, so the change is live at once.

### Build and try it

Press **Build** in the Despia Console, or from a terminal:

```sh
npx @despia-native/cli build ios --cloud --project <project-id> --wait
```

`<project-id>` is the id `account create` printed, or the one in the app's settings in the Despia Console.

Install the build on your phone from the link it gives you, tap your button, and feel the haptic. A release build for the stores needs your store credentials: see [App Store Connect Key](/ship/app-store-connect) and [Google Play Service Account](/ship/google-play).

:::

## Next

::: cards
- [Native features from JavaScript](/web-apps/native-features) {shippingbox} Results, errors, events and which pages can call.
- [React and Next.js](/web-apps/frameworks) {curlybraces} Where calls may run in frameworks that render on the server.
- [Running inside Despia](/web-apps/outside-despia) {globe} One site in the app and in a normal browser.
:::
