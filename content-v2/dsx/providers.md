---
title: Providers
description: Packages like auth, payments, maps and analytics have one API and several providers. You choose the provider in dsx.config.json; your pages never change.
---

Some packages own a capability, such as sign-in, payments, maps, analytics or error reporting, and leave the vendor to a provider package. The capability package has the calls, the results and the errors. The provider package connects one vendor. Your pages always call the capability package, so switching vendors is a change to configuration, not to code.

## Choose a provider

Add the provider package, then name it under `moduleConfig.<package>.provider` in `dsx.config.json`:

```json title="dsx.config.json"
{
  "moduleConfig": {
    "auth": { "provider": "supabase" },
    "payments": { "provider": "stripe" },
    "map": { "provider": "mapbox" },
    "telemetry": { "provider": "sentry" }
  }
}
```

Capability packages pick their provider the same way. Where an empty `provider` means something else, the table under Packages with providers says so.

| Situation | Result |
| :-- | :-- |
| `provider` is empty and the app has one provider package | That one is used |
| `provider` is empty and the app has none | Calls reject with `not_configured` |
| `provider` is empty and the app has two or more | `provider_ambiguous`: name one |
| `provider` names a package that is not in the build | `unsupported_provider` |
| The provider does not offer one call | That call rejects with `unsupported_by_provider` |

## Packages with providers

| Package | Setting | Providers |
| :-- | :-- | :-- |
| [Sign-in](/dsx/auth) | `auth.provider` | identity, supabase, firebase, clerk |
| [Payments](/dsx/payments) | `payments.provider` | stripe |
| [Maps](/packages/map) | `map.provider` | mapbox, maplibre. Empty uses the system map |
| [Analytics](/packages/growth) | `growth.provider` | amplitude, braze, customerio, mixpanel, posthog, rudderstack, segment |
| [Error reporting](/packages/telemetry) | `telemetry.provider` | sentry, datadog, bugsnag, posthog, logrocket, http (your own endpoint), console (development only). Empty collects nothing |
| [In-app purchases](/packages/store) | `store.provider` | store, revenuecat, commerce. Empty uses the one in the app, or the App Store and Google Play directly |

Each provider package lists its own settings, such as an API key, on its package page.

## renamed-keys

A few settings had a different name before every package used `provider`. The old names still work, and test builds show a notice once. Rename them when you next edit `dsx.config.json`:

| Package | Old setting | New setting |
| :-- | :-- | :-- |
| `growth` | `destination` | `provider` |
| `map` | `renderer` | `provider` |
| `map` | `rendererToken` | `providerToken` |
| `telemetry` | `sink` | `provider` |
| `payments` | `processor` | `provider` |

If you set both the old and the new name to different values, the build stops with `provider_ambiguous`, so the app never guesses.
