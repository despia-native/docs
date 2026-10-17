> ## Documentation Index
> Fetch the complete documentation index at: https://setup.despia.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Storage Vault

> Encrypted persistent storage backed by iCloud Key Value Store on iOS and Android Key/Value Backup on Android. Survives uninstall and reinstall.

Encrypted key-value storage fully bridged to your web layer. Data survives app restarts, updates, and full uninstall/reinstall cycles. Lock any value behind Face ID or Touch ID by setting `locked=true`, reading it back triggers the biometric prompt.

<Info>
  Storage Vault uses iCloud Key Value Store on iOS and Android Key/Value Backup on Android. Data syncs automatically across all devices sharing the same Apple ID or Google account.
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

Call `setvault://` to store a value and `readvault://` to read it back. If the key does not exist, `readvault://` throws, wrap in try/catch to handle first-time users.

```javascript theme={null}
// Store
await despia('setvault://?key=userId&value=user123&locked=false')

// Read
const data   = await despia('readvault://?key=userId', ['userId'])
const userId = data.userId
```

Set `locked=true` to require biometric authentication before a value can be read:

```javascript theme={null}
// Store, reading this key will require Face ID / Touch ID
await despia('setvault://?key=sessionToken&value=abc123&locked=true')

// Read, triggers biometric prompt
const data  = await despia('readvault://?key=sessionToken', ['sessionToken'])
const token = data.sessionToken  // only returned after biometric success
```

***

## Common patterns

### Prevent free trial abuse

Data survives uninstall and reinstall, so you can identify users who have already used a trial even after they delete and re-download the app.

```javascript theme={null}
async function checkTrialEligibility() {
    try {
        const data = await despia('readvault://?key=hasUsedTrial', ['hasUsedTrial'])
        return data.hasUsedTrial !== 'yes'
    } catch {
        // Key not found, first time user
        await despia('setvault://?key=hasUsedTrial&value=yes&locked=false')
        return true
    }
}
```

### Persist a login session

```javascript theme={null}
// On login
await despia(`setvault://?key=loginToken&value=${token}&locked=false`)

// On app load
async function restoreSession() {
    try {
        const data = await despia('readvault://?key=loginToken', ['loginToken'])
        return data.loginToken
    } catch {
        return null
    }
}
```

### Protect a sensitive action with Face ID

```javascript theme={null}
async function confirmWithBiometrics() {
    await despia('setvault://?key=confirm&value=yes&locked=true')
    try {
        const data = await despia('readvault://?key=confirm', ['confirm'])
        if (data.confirm === 'yes') {
            await performSensitiveAction()
            await despia('setvault://?key=confirm&value=&locked=false')
        }
    } catch {
        // user cancelled or biometric failed
    }
}
```

***

## Resources

<CardGroup cols={2}>
  <Card icon="npm" href="https://www.npmjs.com/package/despia-native" title="NPM Package">
    despia-native
  </Card>

  <Card icon="envelope" href="mailto:support@despia.com" title="Support">
    [support@despia.com](mailto:support@despia.com)
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.