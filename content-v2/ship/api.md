---
title: Despia API
description: Automate projects, builds and store releases from CI with api.despia.com and a scoped workspace token.
---

Everything the console and the `despia` CLI do goes through one HTTP API at `https://api.despia.com`. Use it from CI or your own tools to start builds, read their logs, and manage store releases.

The full reference is an OpenAPI 3.1 document at [api.despia.com/v1/openapi.json](https://api.despia.com/v1/openapi.json). Load it into any OpenAPI client or code generator.

## Get a token

For automation, create a workspace token. It acts for the member who created it, only in one workspace and only with the scopes you give it.

```sh
npx despia workspace tokens create ci-builds --scopes builds:read,builds:write --expires-in-days 90 --out ci-token.txt
```

The secret is written to the new file `ci-token.txt` and never printed. Store it as a secret in your CI. `npx despia workspace tokens list` shows every token without its secret, and `npx despia workspace tokens revoke <name>` stops one at once.

A workspace owner or admin creates tokens. A token lives from 1 to 365 days, and a workspace holds at most 50 live tokens.

| Scope | Allows |
| :-- | :-- |
| `projects:read`, `projects:write`, `projects:create` | Read, change and create projects |
| `builds:read`, `builds:write` | Read builds and their logs, start and cancel builds |
| `integrations:read` | Read connected providers |
| `config:read`, `config:write` | Read and change app settings and secrets |
| `activity:read` | Read the workspace activity |
| `store:submit` | Submit to the App Store and Google Play |

Your own sign-in from `despia login` is a person token with your full access. Some operations, such as signing material, accept only a person token. Do not use a person token in CI.

## Call it

Send the token as a bearer token. This lists a project's builds, which needs `builds:read`:

```sh
curl "https://api.despia.com/v1/projects/$DESPIA_PROJECT_ID/builds" -H "Authorization: Bearer $DESPIA_TOKEN"
```

The version is in the path. Inside `/v1`, new fields and new endpoints only add to what is there; a breaking change gets a new prefix.

## Errors

Every error answer has the same body, with a stable code to branch on:

```json
{ "error": { "code": "insufficient_scope", "message": "<a sentence that names the missing scope>" } }
```

The CLI's `--json` output and the MCP server return the same codes.

## Rate limits

A request over a limit gets status 429 and a `Retry-After` header in seconds. Project creation allows 60 per hour per token, and build starts 20 per 10 minutes per token. Each operation's limit is in the OpenAPI document.

## What it covers

| Area | What you can do |
| :-- | :-- |
| Projects | Create, read, update and delete projects and their members |
| Builds | Dry-run, start, follow, read logs, cancel and download artifacts |
| Store | Checklist, listing, screenshots, submissions, review and releases |
| Packages | The catalog, versions and each project's installed packages |
| Secrets and config | Write secrets by name, read and change app identifiers |
| Connections | GitHub, Cloudflare, Vercel, Netlify, Supabase, App Store Connect and Google Play |
| Workspaces and tokens | Members, invitations, activity, tokens |
| Billing and licensing | Credits, checkout, licences and seats |
