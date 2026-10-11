---
title: Plans and licences
description: What is free, what a licence adds, and how build credits work.
---

DSX, the open source packages and the web are free, with no watermark. A licence is needed only for an app that uses a commercial package on iOS or Android, and even then you can build and ship without one while you evaluate.

## What a licence changes

An app that includes a commercial package and has no licence runs in evaluation mode:

- It builds, and you can ship it to the stores.
- It shows a **Development Version** bar.
- The source export (`despia export ios` or `despia export android`, the Xcode or Android Studio project) is refused.

A licence removes the bar and allows the source export. Nothing else changes. `npx despia license status` shows the mode of your project for each platform, without going online.

If you would rather not license, remove the commercial package (`npx despia remove <package>`) or write your own equivalent.

## Seats

A licence is a seat for one app on one platform family:

| Seat | Covers |
| :-- | :-- |
| Apple | iOS and macOS |
| Compose | Android, Windows and Linux |

A licence is paid once and does not expire. You can move a seat to another app once per calendar month.

```sh
npx despia license upgrade   # sign in, buy and attach seats for this app
npx despia license sync      # attach the seats your account owns and install the licence file
npx despia license claim DSP-XXXX-XXXX-XXXX   # attach a seat someone gave you
```

The licence is a signed file beside `dsx.config.json` (`despia-entitlement.ios.json`, `despia-entitlement.android.json`), and it is built into the app. The app checks it when it starts, offline, with no call to Despia.

Plans and prices are on the [Billing page in the console](https://console.despia.com/billing).

## Build credits

Cloud builds use credits:

- A cloud build costs 5 credits.
- A build that fails gives its credits back.
- Over-the-air updates use no credits.
- Each licence seat comes with 200 credits.

You can buy more credits in the console. `npx despia workspace credits` shows the balance and every charge. Credits pay for builds; they are not a licence, so an app built in the cloud without a licence still shows the bar.

## Coming from Despia V3

A paid Despia V3 licence carries over to Despia V4 for the same app and platform when you import the app. An app without a paid V3 licence imports in evaluation mode. See [Moving from Despia V3](/convert/from-v3).
