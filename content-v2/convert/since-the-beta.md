---
title: What changed since the V4 beta
description: The spellings that were renamed before the first release, and what to use instead. Nothing has been deprecated, because no old spelling has shipped.
---

Before the first public release, Despia's command line and development server settled on one name for each thing. A retired spelling is refused with a sentence that names its replacement; it is never read, aliased or silently accepted. The command line exits with code 2 and prints the refusal on stderr, or in the `--json` error object. A retired HTTP path answers `410` with `reason: path_retired` and a `Despia-Migrate-To` header.

`npx despia migrate` lists the retired spellings it finds in your scripts and docs, and `npx despia migrate --apply` rewrites them. The full table is the [retired spellings reference](https://github.com/despia-native/framework/blob/dev/OpenSource/Documentation/reference/deprecations.md).

## Commands

| Retired | Use instead |
| :-- | :-- |
| `despia licence` | `despia license` |
| `despia license --lane` | `despia license --target` (`apple` is `ios`, `compose` is `android`) |
| `despia init --scheme` | `despia init --command` |
| `despia app verify` | `despia app check` |
| `despia report verify` | `despia report check` |
| `--platform`, `--lane` | `--target` |
| `--project-id` | `--project` |
| `--revision` | `--rev` |
| `--dry-run` | `--plan` |
| `--expires` on `despia sandbox` | `--expires-in` |
| `--web` on `despia new` | `--template web-view --set url=<address>` |

`--plan` previews a change and `--apply` runs it, on every command that changes something.

## Development server

Every development channel is under `/__despia/`: for example `/__despia/preview`, `/__despia/run` and `/__despia/reload`. The Studio feed is `/studio/events`, an authenticated WebSocket or bounded polling; server-sent events are not served. The editor mount `/edit` moved to `/studio`, and `/edit/mcp` and `/studio/mcp` are retired: use `despia mcp` over stdio.

The development credential is one grant. Use the `x-despia-grant` header, the `despia_grant` cookie or the `grant` query parameter in place of `x-despia-dev`, `x-despia-edit`, `x-dsx-dev`, `despia_edit`, `key` and `token`.

## What is deprecated

Nothing. A deprecation exists only for a spelling that shipped in a release and then moved. After the first release, exact verbs, flags, HTTP paths, JSON shapes, package entrypoints and event names follow versioned evolution: a change keeps the old spelling working for one minor version, prints the migration on stderr, and names the version in which it leaves.

## Next

::: cards
- [Despia CLI](/dsx/cli) {terminal} Create, run, lint, build and ship from the terminal.
- [Native features from JavaScript](/web-apps/native-features) {shippingbox} The call form, results, errors and events.
:::
