> ## Documentation Index
> Fetch the complete documentation index at: https://setup.despia.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Clipboard

> Read the device clipboard contents through Despia and use them inside your app, useful for paste-style flows like coupon codes, share links, and attribution tokens.

<iframe src="https://www.youtube.com/embed/zoWQKLhlVp4" title="YouTube video player" frameborder="0" className="w-full aspect-video rounded-xl" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen />

<Note>
  The video uses a specific AI coding tool to demonstrate the setup, but the configuration works 1:1 with Cursor, Claude Code, or any other tool. Despia is web framework and tooling agnostic, so the only thing that matters is the SDK call and reading `.clipboarddata` from the result.
</Note>

`getclipboard://` returns the current text contents of the device clipboard. The runtime uses the native Pasteboard API on iOS and the Clipboard Service on Android, so the read goes through the same path as a manual paste, and triggers the same OS-level transparency banner ("MyApp pasted from Notes") on iOS 14 and later.

<Info>
  iOS shows a small banner at the top of the screen the first time your app reads from the clipboard in a session. This is a system behavior, not configurable from Despia. Only call `getclipboard://` in response to a clear user action like a "Paste" button tap, never on app launch or in the background, otherwise the banner will appear unexpectedly and look invasive.
</Info>

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

`getclipboard://` is async. Await the call and read the text from the `clipboarddata` key on the returned object.

```javascript theme={null}
import despia from 'despia-native'

const isDespia = navigator.userAgent.toLowerCase().includes('despia')

async function readClipboard() {
    if (!isDespia) return null

    const result = await despia('getclipboard://', ['clipboarddata'])
    return result.clipboarddata
}
```

The value is a string. If the clipboard is empty or holds non-text content (an image, a copied file), the runtime returns an empty string. Always handle that case rather than assuming the clipboard has text.

***

## Paste from a button

The natural pattern is a "Paste" button next to an input. Tap it, the clipboard content fills the field, the user reviews and submits.

```jsx theme={null}
import { useState } from 'react'
import despia from 'despia-native'

const isDespia = navigator.userAgent.toLowerCase().includes('despia')

function CouponInput() {
    const [code, setCode] = useState('')

    async function pasteFromClipboard() {
        if (!isDespia) {
            // browser fallback, see below
            return
        }

        const result = await despia('getclipboard://', ['clipboarddata'])
        if (result.clipboarddata) {
            setCode(result.clipboarddata.trim())
        }
    }

    return (
        <div>
            <input
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Coupon code"
            />
            <button onClick={pasteFromClipboard}>Paste</button>
        </div>
    )
}
```

The `.trim()` is worth doing reflexively. People copy text with leading or trailing whitespace constantly (especially from email signatures, code blocks, and chat apps), and most validation regexes do not account for it.

***

## Detect and validate before pasting

For codes with a known shape (referral codes, coupons, OAuth one-time tokens) you can sniff the clipboard on app focus and offer a one-tap paste banner if the contents look right. This is gentler than always reading on launch, since the banner only appears when the clipboard probably contains something the user wanted to paste.

```javascript theme={null}
async function checkClipboardForCode() {
    if (!isDespia) return null

    const result = await despia('getclipboard://', ['clipboarddata'])
    const text   = (result.clipboarddata || '').trim()

    // example shape: 8-character alphanumeric coupon
    if (/^[A-Z0-9]{8}$/.test(text)) {
        return text
    }

    return null
}
```

Trigger this on a deliberate user action (opening the redeem screen, focusing the relevant input). Do not poll the clipboard, do not call this on every screen, and do not call it on app launch. Each call may show the iOS transparency banner, and unexpected banners erode user trust quickly.

***

## Browser fallback

In a regular browser the SDK call is a no-op behind the `isDespia` guard. Fall back to the standard Clipboard API for web users.

```javascript theme={null}
async function readClipboardEverywhere() {
    if (isDespia) {
        const result = await despia('getclipboard://', ['clipboarddata'])
        return result.clipboarddata || ''
    }

    if (navigator.clipboard?.readText) {
        try {
            return await navigator.clipboard.readText()
        } catch {
            // user denied permission or browser blocked the read
            return ''
        }
    }

    return ''
}
```

The browser path requires user permission on most platforms (a click handler is enough on Chrome and Edge, Safari requires a permission prompt). Both can fail or return empty, so always treat the result as best-effort and have a manual entry fallback in the UI.

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