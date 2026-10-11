---
title: Legacy Files
description: Your Despia V3 apps, kept as encrypted archives you can download from the console.
---

Every app your workspace made with Despia V3 is kept as one archive. You find them in the console under **Settings > Legacy Files**.

## In each archive

| Part | What it holds |
| :-- | :-- |
| Builds and history | The latest iOS and Android builds, the history and logs of every build, icons, splash screens and sounds, and the app's settings |
| Source projects | Licensed apps also include their Xcode and Android Studio projects |
| No signing keys | Signing keys are not in the archive. They moved to the app's vault in Despia V4, where its builds use them |

## Download an archive

1. Open **Settings > Legacy Files** in the console.
2. Open the menu on the app's row and choose **Download**.
3. Choose **Show Password** on the same row. Despia asks you to confirm it's you first: sign in again with the same account, or enter the code sent to your email.
4. Keep the password in your password manager. It is cleared from the screen after a minute.

Each archive is an AES-256 encrypted zip with its own password. Despia shows a password only after a sign-in in the last few minutes, and that sign-in must be for the account you are signed in with.

## Open it

Use an app that reads encrypted zips:

| System | App |
| :-- | :-- |
| Windows | 7-Zip |
| Mac | Keka or The Unarchiver |

The macOS Archive Utility and Windows Explorer cannot open encrypted zips.

## How long it is kept

Archives of licensed apps are kept. Other archives are kept for two years from the archive date, and each row in the console says until when.

Workspace owners can delete an app's files from the row's menu. Deleting is permanent.

## Moving the app to Despia V4

The archive is a record of the V3 app. To keep shipping the app, move it to Despia V4: [Moving from Despia V3](/convert/from-v3) shows how, and your V3 calls keep working while you do.
