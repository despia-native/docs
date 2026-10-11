---
title: Store rejections
description: The App Store and Google Play rejections apps run into most, and the Despia command that fixes each one.
---

When a store rejects a version, the console marks the release and asks you to paste the reviewer's message: the store APIs never send it to Despia. Despia matches the message to a known rejection and shows the fix below, often with a one-click action.

From the terminal, save the message to a file and attach it:

```sh
npx despia store releases rejection --submission <id> --reason-file message.txt
```

The [App Review](/app-review) section explains the most common Apple guidelines in depth.

## App Store

| Guideline | Rejection | Fix |
| :-- | :-- | :-- |
| 2.1 | App completeness: crashes, placeholder content or no demo account | Add a working demo account and any steps to the review notes, make every screen work, then resubmit. `despia store listing lint` checks the listing |
| 2.3.1(a) | Hidden or undocumented features | Remove every package the app does not use with `despia remove <package>`, rebuild, and describe the remaining capabilities in the review notes |
| 2.3.3 | Screenshots do not show the app in use | Replace them with real screens at the right device sizes, then `despia store listing apply --target ios --apply` |
| 2.3.10 | Other platforms named in the listing | Remove Android, Google Play and other platforms from the iOS description, keywords and screenshots |
| 3.1.1 | Digital goods sold without In-App Purchase | Sell digital content and subscriptions with In-App Purchase, through the [store](/packages/store) package or [RevenueCat](/packages/revenuecat), or remove the purchase path from the iOS app |
| 4.2 | Minimum functionality | Add native features that make the app useful on iPhone, such as push notifications, offline access and native navigation, with `despia add <package>`, and describe them in the review notes |
| 4.3 | Spam: similar apps | Combine similar apps into one, or make this one clearly different and explain how in the review notes |
| 5.1.1 | Data collection and permission purpose strings | Every permission request explains why the app needs it. Check each package's purpose strings and your App Privacy answers with `despia store declarations --target ios`, and offer account deletion if people can create accounts |
| 5.1.2 | Tracking without App Tracking Transparency | Ask with App Tracking Transparency and declare tracking in App Privacy, or remove the tracking package |
| None | Export compliance missing | Answer the encryption question for the build. Most apps use only the system's standard encryption and are exempt: `despia store submit ios --encryption exempt` |

## Google Play

| Policy | Rejection | Fix |
| :-- | :-- | :-- |
| User data | The Data safety form does not match the app | Regenerate the answers from your packages and your own declarations with `despia store declarations --target android`, then send them again |
| Permissions | A sensitive permission without a declaration | Remove the package that asks for it, or complete the permission declaration in Play Console under App content, with a video of the feature |
| Families | Target audience and the Families policy | Check the target audience in Play Console under App content, and remove ad or analytics packages that are not certified for children when children are in the audience |
| Metadata | Store listing metadata | Make the title, short and full description describe the app accurately, with no keyword lists, other brands or misleading claims. Then `despia store listing apply --target android --apply` |
| Minimum functionality | Broken or minimum functionality | Make sure the app loads and works on a fresh install, and that it does more than show a website |

## After the fix

Build a new version, then submit it again from the console or with `despia store submit`. Reply to the reviewer in App Store Connect or Play Console when you changed something they asked about.
