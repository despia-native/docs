---
title: V3 native rebuild
description: Rebuild a V3 app's screens as native DSX screens, one at a time. Not yet available to start from the console.
---

::: warning Not yet available
The **Turn Your Web App into a Native App** template, which sets a project up for this rebuild, is an alpha template in this release. It is not offered by the console, `despia new` or MCP yet, because native rendering in DSX View is still alpha. This page describes the design so you can plan. Until then, keep your site in the [Web App to Mobile App](/convert/from-v3-web-app) template.
:::

A V3 app shows your website. A native rebuild replaces the website screens with DSX screens that render as SwiftUI on iOS and Material 3 on Android, from the same project.

## How the rebuild template works

The template is the Despia Starter (tabs, sign-in, a paywall, notifications and dark mode) with a plan for your own coding agent to work through:

- `migration.json` lists the screens to rebuild, each with a status: todo, in progress, native or verified. The console shows it as a checklist.
- `MIGRATION.md` is the brief for your agent: what Despia found in your app and how to work.
- `AGENTS.md`, `CLAUDE.md`, `.mcp.json` and the Despia skills teach Claude Code, Cursor or Codex to write DSX and to run the checks.
- `Components/Web.dsx` (optional) shows your site in a Web tab so the app ships from the first day while screens move over.

Despia checks a screen before it counts as native: its component exists and a route shows it. Mark a screen with `npx despia template run mark --set entry=<id> --set status=native`.

## Order of work

1. Ship the web-view app first, so users are never without an app.
2. Rebuild the screens people use most, one per change. Lint, test and review each one before marking it native.
3. Replace `despia('scheme://...')` calls with `dsx.module` calls as you go, using the [feature map](/convert/v3-feature-map).
4. Remove the Web tab and the `legacy` package when nothing uses them.

## Next

::: cards
- [V3 web app to V4](/convert/from-v3-web-app) {globe} The step before a rebuild.
- [Use your AI agent](/dsx/agents) {sparkles} Connect the MCP server and install the skills.
- [DSX quickstart](/dsx/quickstart) {bolt} Scaffold, run and build a DSX app.
:::
