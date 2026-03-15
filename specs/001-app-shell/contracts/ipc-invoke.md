# IPC Invoke Contracts (Request/Response)

All invoke channels use `ipcRenderer.invoke()` / `ipcMain.handle()`. The renderer awaits a response.

---

## Config Channels

### `config:get`
- **Request**: `{ key: ConfigKey }`
- **Response**: `ConfigValue[ConfigKey]`
- **Error**: Never (returns default if key missing)

### `config:set`
- **Request**: `{ key: ConfigKey, value: ConfigValue[ConfigKey] }`
- **Response**: `void`
- **Error**: `{ code: 'VALIDATION_ERROR', message: string }` if value fails Zod validation

### `config:reset`
- **Request**: `void`
- **Response**: `void`
- **Side effect**: All config reset to defaults, schemaVersion preserved

### `config:getAll`
- **Request**: `void`
- **Response**: `AppConfig` (full typed config object)

---

## Window Channels

### `window:minimize`
- **Request**: `void`
- **Response**: `void`

### `window:maximize`
- **Request**: `void`
- **Response**: `void`
- **Behavior**: Toggles maximize/restore

### `window:close`
- **Request**: `void`
- **Response**: `void`
- **Behavior**: Hides window to tray (does not quit)

### `window:setSize`
- **Request**: `{ width: number, height: number }`
- **Response**: `void`
- **Validation**: width >= 960, height >= 600

---

## File Channels

### `file:read`
- **Request**: `{ relativePath: string }`
- **Response**: `{ data: Buffer }`
- **Error**: `{ code: 'FILE_NOT_FOUND' | 'PERMISSION_DENIED', message: string }`
- **Security**: Path MUST resolve within `app.getPath('userData')`

### `file:write`
- **Request**: `{ relativePath: string, data: Buffer }`
- **Response**: `void`
- **Error**: `{ code: 'PERMISSION_DENIED' | 'DISK_FULL', message: string }`
- **Security**: Path MUST resolve within `app.getPath('userData')`

### `file:delete`
- **Request**: `{ relativePath: string }`
- **Response**: `void`
- **Error**: `{ code: 'FILE_NOT_FOUND', message: string }`
- **Security**: Path MUST resolve within `app.getPath('userData')`

---

## Shell Channels

### `shell:openExternal`
- **Request**: `{ url: string }`
- **Response**: `void`
- **Validation**: URL must have http:// or https:// scheme

### `shell:openPath`
- **Request**: `{ path: string }`
- **Response**: `void`

### `shell:showItemInFolder`
- **Request**: `{ path: string }`
- **Response**: `void`

---

## Dialog Channels

### `dialog:openFile`
- **Request**: `{ filters?: FileFilter[], properties?: OpenDialogProperty[] }`
- **Response**: `{ filePaths: string[] } | null` (null if cancelled)

### `dialog:saveFile`
- **Request**: `{ defaultPath?: string, filters?: FileFilter[] }`
- **Response**: `{ filePath: string } | null` (null if cancelled)

---

## Clipboard Channels

### `clipboard:read`
- **Request**: `void`
- **Response**: `{ text: string }`

### `clipboard:write`
- **Request**: `{ text: string }`
- **Response**: `void`

### `clipboard:readImage`
- **Request**: `void`
- **Response**: `{ data: Buffer } | null` (null if no image)

---

## Theme Channels

### `theme:get`
- **Request**: `void`
- **Response**: `{ theme: 'light' | 'dark' }` (resolved theme, not preference)

### `theme:set`
- **Request**: `{ theme: 'light' | 'dark' | 'system' }`
- **Response**: `void`
- **Side effect**: Persists preference, resolves 'system' to actual theme, emits `theme:changed`

---

## App Channels

### `app:getVersion`
- **Request**: `void`
- **Response**: `{ version: string }`

### `app:getPlatform`
- **Request**: `void`
- **Response**: `{ platform: 'darwin' | 'win32' | 'linux' }`

### `app:getPath`
- **Request**: `{ name: 'home' | 'appData' | 'userData' | 'temp' | 'logs' | 'documents' | 'downloads' }`
- **Response**: `{ path: string }`

### `app:relaunch`
- **Request**: `void`
- **Response**: `void` (app will restart)

### `app:quit`
- **Request**: `void`
- **Response**: `void` (app will exit)
