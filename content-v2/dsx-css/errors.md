---
title: CSS error codes
description: Every code despia lint reports for a style attribute or a style sheet, what it means and what to write instead.
---

DSX checks your CSS when you lint or build. Each finding has a stable code, the file, line and column, a message, a fix and a link to its entry on this page. `despia lint --json` prints the same findings for an agent to fix.

Codes that start with **E** are errors: lint and the build fail. **W** is a warning: `despia lint` fails until you fix it. **N** is a notice: it informs and never fails.

## E001

**Unknown property.** The property is not in the DSX style vocabulary, often a typo. The fix names the nearest known property.

```css
.card { paddng: 12px; }   /* E001: unknown property `paddng`, did you mean `padding`? */
.card { padding: 12px; }
```

The vocabulary is standard CSS. An older DSX-only property name is reported here too, with the standard property to use. Inside `@supports (property: value)` an unknown property is allowed, because the query is the check.

## E002

**Invalid keyword.** The value is not one of the keywords this property accepts.

```css
.row { display: flax; }   /* E002 */
.row { display: flex; }
```

## E003

**`!important` is not allowed.** Use a more specific class, or a token the component already reads.

## E004

**Unknown at-rule.** The at-rules DSX reads are `@media`, `@container`, `@supports`, `@keyframes`, `@starting-style`, `@ending-style`, `@property`, `@layer`, `@font-face`, `@mixin`, `@apply` and `@function`.

## E005

**Interpolation inside a sheet.** A `<style>` sheet is static. `{{ }}` belongs in a `style` attribute, where it is evaluated per element:

```dsx fragment
<text value="Total" style="color: {{ dsx.variable.overBudget ? 'var(--dsx-danger)' : 'inherit' }}"/>
```

## E006

**Raw colour inside a token-governed tree.** Components that follow the theme name colours through tokens such as `var(--dsx-accent)`, so light mode, dark mode and your brand colour all apply. Replace the literal with the token.

## E007

**Stray `*/` in a selector.** A comment was closed twice, so the rule matches nothing. Remove the extra `*/`.

## E010

**Old DSX word in a CSS value.** A value uses a DSX-only word that standard CSS replaced. The message names the standard value to write.

## E011

**Selector feature a target cannot match.** iOS, Android, desktop and the web each match the selector features DSX lists for them. A pseudo-class or combinator one of your targets does not match is an error, so a rule never works on one platform and silently does nothing on another. Rewrite the selector with a class, or put the rule in a block only that target reads.

A plain declaration on `:root` reaches no native element. Declare custom properties (`--name: value`) there.

## E012

**Bare word on a length or number property.** A length needs a unit or a keyword the property accepts.

```css
.card { width: wide; }    /* E012 */
.card { width: 100%; }
```

## E013

**A surface rounds its own corner.** Cards, item cards, link cards, stats, code blocks and callouts share one corner shape so they look like one family. Use `var(--dsx-surface-radius)` at page level and `var(--dsx-surface-inner-radius)` when nested, and `var(--dsx-surface-corner-shape)` for `corner-shape`.

## E014

**A component rounds with its own number.** A radius larger than 4px written as a raw length, or a radius token whose fallback never reaches a system radius token. Use `--dsx-surface-*` or `--dsx-radius-*`. A capsule (`999px`, `50%`), `0` and a proportional `calc()` are fine.

## N004

**Known selector debt.** An E011 site in a file that is on the shrink-only list of selectors being moved. Fix it when you touch the file.

## N005

**`appearance` has no platform control here.** `appearance` changes buttons, toggles, text fields and the other controls that have a native twin. On anything else it has no effect.

## N006

**Mixed appearances in one sheet.** A summary of the `appearance` values this sheet sets per control. It is legal on every platform and is reported so the mix is a choice.

## N007

**Feature query looks misspelled.** No platform knows the property named in this `@supports` query, so the block under it never runs. The notice names the property you probably meant.

## N014

**Package corner radius debt.** The E014 finding inside a package outside the Foundation components, on the shrink-only list.

## W101

**Missing semicolon.** The parser recovered a declaration that had no `;` before the next one. Add it.

## W102

**Dropped declaration.** The parser could not read a declaration and skipped it. The message shows the text it skipped.

## W103

**Debt pin too high.** A shrink-only debt entry allows more findings than the file has now. Lower it to the current count.

## W104

**Rule a watch or TV screen drops.** A document that also renders on a watch or a TV uses an at-rule other than `@property`, or a selector feature that target does not support. The whole rule does nothing there.
