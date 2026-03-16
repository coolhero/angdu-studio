# Contract: IPC Extensions for Settings

F003 extends F001's IPC channel set with additional channels for data management and shortcut registration.

## New IPC Invoke Channels

### `data:export`
- **Request**: `{ includeDocs?: boolean }`
- **Response**: `{ filePath: string }` (path where ZIP was saved)
- **Error**: `{ code: 'EXPORT_CANCELLED' | 'EXPORT_FAILED', message: string }`
- **Behavior**: Collects all config + feature data, creates ZIP, shows save dialog, writes file

### `data:import`
- **Request**: `{ filePath: string }`
- **Response**: `{ success: boolean, version: string }`
- **Error**: `{ code: 'INVALID_FORMAT' | 'VERSION_MISMATCH' | 'IMPORT_FAILED', message: string }`
- **Behavior**: Reads ZIP, validates schema version, restores config. On VERSION_MISMATCH: returns error (not auto-migrated)

### `data:clear`
- **Request**: `void`
- **Response**: `void`
- **Behavior**: Clears all user data (config, feature data). App should relaunch after.

### `data:getStoragePath`
- **Request**: `void`
- **Response**: `{ path: string }`
- **Behavior**: Returns `app.getPath('userData')`

### `shortcuts:register`
- **Request**: `{ key: string, accelerator: string }`
- **Response**: `{ success: boolean }`
- **Error**: `{ code: 'REGISTRATION_FAILED', message: string }`
- **Behavior**: Registers a global shortcut via Electron's globalShortcut API

### `shortcuts:unregister`
- **Request**: `{ key: string }`
- **Response**: `void`
- **Behavior**: Unregisters a global shortcut

### `shortcuts:unregisterAll`
- **Request**: `void`
- **Response**: `void`
- **Behavior**: Unregisters all global shortcuts managed by F003

### `startup:setLoginItem`
- **Request**: `{ openAtLogin: boolean, openAsHidden: boolean }`
- **Response**: `void`
- **Behavior**: Sets app.setLoginItemSettings for launch-at-login

## Preload Whitelist Extension

These channels MUST be added to `INVOKE_CHANNELS` in `src/preload/index.ts`:

```
'data:export', 'data:import', 'data:clear', 'data:getStoragePath',
'shortcuts:register', 'shortcuts:unregister', 'shortcuts:unregisterAll',
'startup:setLoginItem'
```

## Consumed Channels (from F001)

No changes — F003 uses existing F001 channels:
- `config:get`, `config:set`, `config:reset`, `config:getAll`
- `theme:get`, `theme:set`
- `dialog:openFile`, `dialog:saveFile`
- `app:getPath`, `app:relaunch`
- `shell:openPath`
