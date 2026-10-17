---
title: Naming rules
description: Markup is kebab-case like HTML, JavaScript and API names are camelCase, CSS is kebab-case, and every name has one spelling.
---

DSX names follow the layer they live in: markup is kebab-case like HTML, JavaScript and API names are camelCase, CSS is kebab-case. There are no aliases: each name has one spelling.

`despia lint`, `despia build`, `despia export` and the cloud build refuse a name that breaks a rule, name the current spelling, and print the command that fixes it. AI coding agents get the same rules from the project's `AGENTS.md`, from the Despia MCP server and from `llms.txt`.

## Built-in tags

Built-in tags are lowercase like HTML: one word for a single widget, hyphenated words for a phrase.

Write:

- `<textfield>`
- `<webview>`
- `<menu-sidebar>`

Never:

- `<TextField>`
- `<DSXWebView>`
- `<menuSidebar>`

Checked by `despia lint`, `despia build` and the cloud build (`element-tag-renamed`, `element-alias`). Rewritten by `--codemod element-tags`, `--codemod element-aliases`.

## Component tags

Your components and package components keep PascalCase, the component's file name; a package component is called through its package.

Write:

- `<Profile/>`
- `<admob.AdChoices/>`


## Attributes

Markup attributes and their values are kebab-case like HTML.

Write:

- `control-size="small"`
- `animation-curve="spring"`

Never:

- `controlSize="small"`
- `animationCurve="spring"`

Checked by `despia lint`, `despia build` and the cloud build (`attribute-renamed`, `motion-attribute-renamed`). Rewritten by `--codemod markup-attributes`.

## Component inputs

A component input is declared and passed in kebab-case; JavaScript reads the same input in camelCase.

Write:

- `<attribute as="user-name"/>`
- `<Profile user-name="Ada"/>`
- `dsx.attribute.userName`

Never:

- `<attribute as="userName"/>`
- `<Profile userName="Ada"/>`

Checked by `despia lint`, `despia build` and the cloud build (`attribute-name`, `attribute-renamed`). Rewritten by `--codemod component-inputs`.

## Events

Markup binds and declares events as on: plus kebab-case; JavaScript event names and payload keys stay camelCase.

Write:

- `on:long-press="dsx.action.hold()"`
- `<event as="state-change"/>`

Never:

- `on:longPress`
- `on:longpress`
- `<event as="stateChange"/>`

Checked by `despia lint`, `despia build` and the cloud build (`event-name`). Rewritten by `--codemod package-renames`.

## Accessibility

Accessibility uses aria-* attributes and role, as on the web.

Write:

- `aria-label="Close"`
- `role="button"`

Never:

- `a11yLabel="Close"`
- `a11y-label="Close"`

Checked by `despia lint`, `despia build` and the cloud build (`accessibility-attribute-retired`). Rewritten by `--codemod aria-attributes`.

## JavaScript and API names

JavaScript, package actions, arguments, results, payloads, settings keys and API fields are camelCase.

Write:

- `dsx.module.appsflyer.uid()`
- `dsx.attribute.userName`
- `{ "keyboardMode": "pan" }`

Never:

- `dsx.module.appsflyer.get_uid()`
- `dsx.attribute.user_name`

Checked by `despia lint`, `despia build` and the cloud build (`module-name-renamed`). Rewritten by `--codemod api-renames`, `--codemod package-renames`.

## CSS

CSS classes, properties and custom properties are kebab-case; the look lives in CSS, never in an attribute.

Write:

- `.card-title`
- `var(--dsx-sidebar-min)`
- `style="color: var(--dsx-accent)"`

Never:

- `.cardTitle`

Rewritten by `--codemod style-attributes`.

## Error words

Error words are snake_case; diagnostic codes are uppercase.

Write:

- `not_found`
- `E101`

Never:

- `notFound`
- `NOT_FOUND`

Rewritten by `--codemod error-code-renames`.

## Names from a web standard

A name borrowed from a web standard keeps that standard's spelling.

Write:

- `<svg viewBox="0 0 24 24">`
- `aria-activedescendant`


## One spelling, no aliases

Every name has one spelling. An old spelling is refused, never read as an alias; despia migrate --apply rewrites it.


## How despia migrate works

Run `despia migrate --apply` in the project directory. It runs every codemod in order and rewrites only what it can prove; `despia migrate` without `--apply` previews the changes. A site that needs a decision is listed in the report, and `despia lint` names it until you fix it by hand. The cloud build runs the same migration on its copy of your project before it compiles, and never changes your stored project.

The full table of old and current spellings is in the [0.1.0 migration guide](https://github.com/despia-native/despia/blob/main/Documentation/migration/0.1.0.md).
