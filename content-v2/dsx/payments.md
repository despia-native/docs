---
title: Payments
description: One payments API for cards, Apple Pay, Google Pay and bank payments. The provider is a setting; your pages call dsx.module.payments.
---

Payments in a DSX app go through one package, `payments`. It shows the native payment sheet, confirms the payment and reports the result. A provider package does the work behind it. Today that is [Stripe](/packages/stripe).

For digital goods and subscriptions sold inside an iOS or Android app, the stores require their own in-app purchase. Use the [store](/packages/store) package or [RevenueCat](/packages/revenuecat) for those. `payments` is for physical goods, services and anything else the stores allow outside in-app purchase.

## Take a payment

Your server creates the payment with the provider and returns its client secret. The app then opens the payment sheet:

```dsx title="Components/Checkout.dsx"
<stack style="gap: 12px; padding: 20px">
  <head>
    <variable as="clientSecret">return ''</variable>
    <variable as="paid">return false</variable>
    <action as="pay">
      const result = await dsx.module.payments.payment({ publishableKey: 'pk_test_yourKey', paymentIntentClientSecret: dsx.variable.clientSecret });
      dsx.variable.paid = result.status === 'completed';
    </action>
  </head>
  <button label="Pay" on:tap="dsx.action.pay()"/>
  <text value="Thank you" visible-if="dsx.variable.paid"/>
</stack>
```

The package also saves payment methods (`manage`), connects bank accounts (`connectBank`), takes ACH payments (`payAch`) and builds a payment in steps (`session`, `confirm`, `close`). Every argument and result is on the [payments package page](/packages/payments).

## provider

Add the provider package. With one provider in the app there is nothing to choose: it is used. Name it under `moduleConfig.payments.provider` in `dsx.config.json` to make the choice explicit:

```json title="dsx.config.json"
{
  "moduleConfig": {
    "payments": { "provider": "stripe" }
  }
}
```

An older name for this setting, `processor`, still works and test builds show a notice once. Rename it to `provider`. If both are set and name different providers, the build stops with `provider_ambiguous`.

## Errors

| Code | Meaning |
| :-- | :-- |
| `not_configured` | No payment provider is in the app. Add one, such as Stripe |
| `provider_ambiguous` | Two payment providers are in the app and none is chosen. Set `moduleConfig.payments.provider` |
| `unsupported_provider` | The named provider is not in this build |
| `unsupported_by_provider` | The provider does not offer this call |

Every package that has providers works the same way: see [Providers](/dsx/providers).
