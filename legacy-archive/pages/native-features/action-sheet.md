> ## Documentation Index
> Fetch the complete documentation index at: https://setup.despia.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Action Sheet

> Trigger a native iOS or Android action sheet from your web app and react to the user's selection.

Show a real platform action sheet over your web view, with optional icons, destructive styling, and theme control. Attach one global callback function and trigger the sheet whenever you need it.

***

## Installation

<Tabs>
  <Tab title="Bundle">
    <CodeGroup>
      ```bash npm theme={null}
      npm install despia-native
      ```

      ```bash pnpm theme={null}
      pnpm add despia-native
      ```

      ```bash yarn theme={null}
      yarn add despia-native
      ```
    </CodeGroup>

    ```javascript theme={null}
    import despia from 'despia-native';
    ```
  </Tab>

  <Tab title="CDN">
    <CodeGroup>
      ```html UMD theme={null}
      <script src="https://cdn.jsdelivr.net/npm/despia-native/index.min.js"></script>
      ```

      ```html ESM theme={null}
      <script type="module">
          import despia from 'https://cdn.jsdelivr.net/npm/despia-native/+esm'
      </script>
      ```
    </CodeGroup>
  </Tab>
</Tabs>

***

## How it works

Attach a global `window.onSheetEvent` function once, somewhere in your app. The native side calls it with the `value` of the tapped row, or `null` if the user dismissed the sheet. Then trigger the sheet with `despia('actionsheet://?...')`.

```javascript theme={null}
window.onSheetEvent = function (value) {
    if (value === null) {
        // user tapped outside or tapped back
        return
    }
    console.log('selected', value)
}

const isDespia = navigator.userAgent.toLowerCase().includes('despia')

if (isDespia) {
    const items = JSON.stringify([
        { label: 'Edit',   value: 'edit'   },
        { label: 'Delete', value: 'delete' },
    ])

    const params = new URLSearchParams({
        title: 'Post Options',
        items,
    }).toString()

    despia(`actionsheet://?${params}`)
}
```

`items` must be a JSON string, not an object. Each item needs both `label` (the displayed text) and `value` (the stable identifier passed to your callback, so prefer `'delete'` over `'Delete Post'`).

`window.onSheetEvent` is a single global hook. If you have multiple call sites, reassign it right before each `despia()` call so the correct handler runs.

***

## Icons

Icons are platform-specific. Pass `iconIos` (an SF Symbol name) and `iconAndroid` (a Material drawable resource name) on the same item, the native side picks the right one per platform.

```javascript theme={null}
const items = JSON.stringify([
    { label: 'Edit',   value: 'edit',   iconIos: 'pencil',              iconAndroid: 'edit'         },
    { label: 'Share',  value: 'share',  iconIos: 'square.and.arrow.up', iconAndroid: 'share'        },
    { label: 'Copy',   value: 'copy',   iconIos: 'doc.on.doc',          iconAndroid: 'content_copy' },
])
```

If an SF Symbol does not exist on the user's iOS version, or if the Android host has not bundled that drawable, the row renders without an icon and nothing crashes. Browse symbol names at [developer.apple.com/sf-symbols](https://developer.apple.com/sf-symbols/) and Android drawables at [fonts.google.com/icons](https://fonts.google.com/icons) (lowercase with underscores when copying the Material Symbols name).

***

## Destructive actions

Set `destructive: true` on any item to render that row in red. Use this for delete, remove, leave, and other irreversible actions, the styling is the visual cue iOS users expect before tapping.

```javascript theme={null}
window.onSheetEvent = function (value) {
    if (value === 'delete') {
        deletePost()
    }
}

const isDespia = navigator.userAgent.toLowerCase().includes('despia')

if (isDespia) {
    const items = JSON.stringify([
        { label: 'Edit',   value: 'edit',   iconIos: 'pencil', iconAndroid: 'edit'                       },
        { label: 'Delete', value: 'delete', iconIos: 'trash',  iconAndroid: 'delete', destructive: true  },
    ])

    const params = new URLSearchParams({
        title: 'Post',
        items,
    }).toString()

    despia(`actionsheet://?${params}`)
}
```

***

## Force a theme

By default the sheet follows the operating system appearance. Pass `theme: 'light'` or `theme: 'dark'` to override.

```javascript theme={null}
const params = new URLSearchParams({
    title: 'Options',
    items: JSON.stringify(items),
    theme: 'dark',
}).toString()

despia(`actionsheet://?${params}`)
```

Valid values are `light`, `dark`, and `system`. Omit the param to default to `system`.

***

## Resources

<CardGroup cols={2}>
  <Card title="NPM Package" icon="npm" href="https://www.npmjs.com/package/despia-native">
    despia-native
  </Card>

  <Card title="Support" icon="envelope" href="mailto:support@despia.com">
    [support@despia.com](mailto:support@despia.com)
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.