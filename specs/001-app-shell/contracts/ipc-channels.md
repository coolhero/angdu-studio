# IPC Channel Contracts: App Shell

All channels use the `ipcMain.handle` / `ipcRenderer.invoke` pattern unless noted.

## Window Controls

### Window_Minimize
- **Direction**: R→M
- **Request**: `void`
- **Response**: `void`
- **Side Effect**: Main window minimizes

### Window_Maximize
- **Direction**: R→M
- **Request**: `void`
- **Response**: `void`
- **Side Effect**: Main window toggles maximize/restore

### Window_Close
- **Direction**: R→M
- **Request**: `void`
- **Response**: `void`
- **Side Effect**: Hides to tray (if trayOnClose) or quits

### Window_IsMaximized
- **Direction**: R→M
- **Request**: `void`
- **Response**: `boolean`

### Window_SetFullScreen
- **Direction**: R→M
- **Request**: `{ enabled: boolean }`
- **Response**: `void`

### Window_IsFullScreen
- **Direction**: R→M
- **Request**: `void`
- **Response**: `boolean`

## Mini Window

### MiniWindow_Show
- **Direction**: R→M
- **Request**: `void`
- **Response**: `void`

### MiniWindow_Hide
- **Direction**: R→M
- **Request**: `void`
- **Response**: `void`

### MiniWindow_Toggle
- **Direction**: R→M
- **Request**: `void`
- **Response**: `void`

### MiniWindow_Close
- **Direction**: R→M
- **Request**: `void`
- **Response**: `void`

### MiniWindow_SetPin
- **Direction**: R→M
- **Request**: `{ pinned: boolean }`
- **Response**: `void`

## App Lifecycle

### App_Info
- **Direction**: R→M
- **Request**: `void`
- **Response**: `{ version: string, arch: string, platform: string, dataPath: string, isPackaged: boolean }`

### App_Reload
- **Direction**: R→M
- **Request**: `void`
- **Response**: `void`

### App_Quit
- **Direction**: R→M
- **Request**: `void`
- **Response**: `void`
- **Pre-condition**: Sends App_SaveData to renderer first

### App_SaveData
- **Direction**: M→R (broadcast)
- **Request**: `void`
- **Response**: `void`
- **Note**: Sent before quit so renderer can persist state

### App_QuitAndInstall
- **Direction**: R→M
- **Request**: `void`
- **Response**: `void` (app exits)

### App_ClearCache
- **Direction**: R→M
- **Request**: `void`
- **Response**: `void`

## Configuration

### App_SetProxy
- **Direction**: R→M
- **Request**: `{ mode: 'system' | 'custom' | 'direct', url?: string, bypassRules?: string }`
- **Response**: `void`

### App_SetTheme
- **Direction**: R→M
- **Request**: `{ theme: 'dark' | 'light' | 'system' }`
- **Response**: `void`
- **Side Effect**: Updates titlebar overlay, broadcasts to all windows

### App_HandleZoomFactor
- **Direction**: R→M
- **Request**: `{ action: 'in' | 'out' | 'reset' }`
- **Response**: `{ zoomFactor: number }`

## System

### Open_Website
- **Direction**: R→M
- **Request**: `{ url: string }`
- **Response**: `void`
- **Side Effect**: Opens URL in system default browser

### App_GetSystemFonts
- **Direction**: R→M
- **Request**: `void`
- **Response**: `string[]`

### App_GetIpCountry
- **Direction**: R→M
- **Request**: `void`
- **Response**: `string` (ISO country code)

### App_MacIsProcessTrusted
- **Direction**: R→M
- **Request**: `void`
- **Response**: `boolean`
- **Platform**: macOS only

### App_MacRequestProcessTrust
- **Direction**: R→M
- **Request**: `void`
- **Response**: `void`
- **Platform**: macOS only

## Update

### App_CheckForUpdates
- **Direction**: R→M
- **Request**: `void`
- **Response**: `{ currentVersion: string, updateInfo: UpdateInfo | null }`

### App_DownloadUpdate
- **Direction**: R→M
- **Request**: `void`
- **Response**: `void`
- **Side Effect**: Emits progress events via App_UpdateProgress (M→R)

### App_CancelDownload
- **Direction**: R→M
- **Request**: `void`
- **Response**: `void`

### App_UpdateProgress
- **Direction**: M→R (event)
- **Payload**: `{ percent: number, bytesPerSecond: number, transferred: number, total: number }`
