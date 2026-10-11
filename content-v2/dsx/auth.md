---
title: Sign-in
description: One auth API for every sign-in provider. Pick the provider in configuration; your pages call dsx.module.auth the same way.
---

Sign-in in a DSX app goes through one package, `auth`. It owns the calls, the session and the errors. A provider package does the work behind it: Despia Identity, Supabase, Firebase or Clerk. Change the provider and your pages stay the same.

## signIn

```dsx title="Components/SignIn.dsx"
<stack style="gap: 12px; padding: 20px">
  <head>
    <variable as="email">return ''</variable>
    <variable as="password">return ''</variable>
    <action as="signIn">
      await dsx.module.auth.signIn({ method: 'password', identifier: dsx.variable.email, password: dsx.variable.password });
    </action>
  </head>
  <textfield bind="dsx.variable.email" placeholder="Email" keyboard="email"/>
  <textfield bind="dsx.variable.password" placeholder="Password" secure="true"/>
  <button label="Sign In" on:tap="dsx.action.signIn()"/>
</stack>
```

`method` chooses how the person signs in:

| Method | What happens |
| :-- | :-- |
| `password` | Signs in with `identifier` and `password` |
| `code` | Sends a one-time code to `identifier`, then `verifyCode({ code })` finishes |
| `passkey` | Signs in with a passkey on the device |
| A sign-in source, such as `google` | Signs in with that account |

`signUp` takes the same arguments. `signIn` resolves with `signedIn`, `userId`, `provider` and `method`. With `code` it resolves `{ status: 'awaitingCode', identifier }` first.

The other calls are `sendCode`, `verifyCode`, `signOut`, `session`, `token` and `updateProfile`. Every argument and result is on the [auth package page](/packages/auth).

## The session

The session is readable from any document, without a call:

```dsx fragment
<text value="Signed in as {{ dsx.module.auth.context.email }}" visible-if="dsx.module.auth.context.signedIn"/>
```

`context` holds `signedIn`, `userId`, `email`, `name`, `imageUrl`, `provider`, `method` and `status` (`idle`, `working`, `awaitingCode` or `error`). It updates when the person signs in or out.

## Choose the provider

Add the provider package and name it under `moduleConfig.auth.provider` in `dsx.config.json`:

```json title="dsx.config.json"
{
  "moduleConfig": {
    "auth": { "provider": "supabase" }
  }
}
```

| Provider | Package |
| :-- | :-- |
| `identity` | [Despia Identity](/packages/authidentity) |
| `supabase` | [Supabase](/packages/supabase) |
| `firebase` | [Firebase Auth](/packages/authfirebase) |
| `clerk` | [Clerk](/packages/clerk) |

Leave `provider` empty when the app has one provider package: that one is used. Two provider packages and no choice is the error `provider_ambiguous`. Sign-in sources such as [Google](/packages/google) add to whichever provider you use, so you can include several.

## Supabase calls with their own names

Supabase also answers its own spellings of the shared calls. They keep working, and test builds show a notice once. Move each to the shared call:

| Supabase call | Shared call |
| :-- | :-- |
| `signInWithPassword` | `signIn({ method: 'password', identifier, password })` |
| `signInWithOtp` | `sendCode({ identifier })` |
| `verifyOtp` | `verifyCode({ code })` |
| `signInWithOAuth`, `signInWithIdToken` | `signIn({ method: '<sign-in source>' })` |

## Errors

A failed call rejects with a code you can branch on:

| Code | Meaning |
| :-- | :-- |
| `not_configured` | No provider package is in the app |
| `provider_ambiguous` | Two providers are in the app and none is chosen |
| `unsupported_method` | The provider does not offer this method |
| `cancelled` | The person closed the sign-in |
| `invalid_code` | The one-time code was wrong or expired |
| `rejected` | The provider refused the sign-in |
| `network_unavailable` | The device is offline |
