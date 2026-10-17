> ## Documentation Index
> Fetch the complete documentation index at: https://setup.despia.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Prevent Autoscroll

> Stop the native WebView from repositioning when the keyboard appears so your JavaScript keyboard handling stays in full control.

When a keyboard appears, iOS and Android both attempt to resize or reposition the WebView automatically. If your web app is already full-height and manages keyboard avoidance in JavaScript, this native adjustment creates a white gap below the keyboard and disrupts your layout. The `preventdefault://autoscroll` scheme disables that native behavior and lets you opt back in at any time.

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

Call `preventdefault://autoscroll` with `enabled=false` to stop the native layer from moving the WebView when the keyboard opens. Call with `enabled=true` to restore the default behavior.

```javascript theme={null}
const isDespia = navigator.userAgent.toLowerCase().includes('despia')

if (isDespia) {
    // Disable native keyboard resize - your JS handles layout instead
    despia('preventdefault://autoscroll?enabled=false')
}
```

To restore native behavior later:

```javascript theme={null}
if (isDespia) {
    despia('preventdefault://autoscroll?enabled=true')
}
```

***

## Disable on app load

The most common pattern is to disable native keyboard resizing once on startup, before any input is focused. This ensures the WebView never shifts position during the session.

```javascript theme={null}
const isDespia = navigator.userAgent.toLowerCase().includes('despia')

document.addEventListener('DOMContentLoaded', () => {
    if (isDespia) {
        despia('preventdefault://autoscroll?enabled=false')
    }
})
```

***

## Selectively re-enable for specific inputs

If one part of your app relies on native scroll behavior - such as a form that does not manage its own keyboard avoidance - you can toggle the mode per interaction.

```javascript theme={null}
const isDespia = navigator.userAgent.toLowerCase().includes('despia')

function onNativeFormFocus() {
    if (isDespia) despia('preventdefault://autoscroll?enabled=true')
}

function onNativeFormBlur() {
    if (isDespia) despia('preventdefault://autoscroll?enabled=false')
}
```

***

## Platform behavior

The scheme maps to different native APIs on each platform but produces the same result - the WebView holds its position when the keyboard appears.

| Parameter | iOS | Android |
| - | - | - |
| `?enabled=false` | `contentInsetAdjustmentBehavior = .never` - WebView stays put | `SOFT_INPUT_ADJUST_NOTHING` - window does not resize |
| `?enabled=true` | `contentInsetAdjustmentBehavior = .automatic` - native behavior restored | `SOFT_INPUT_ADJUST_RESIZE` - native behavior restored |

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