# Quickstart: App Core (F001)

**Feature Branch**: `001-app-core`
**Date**: 2026-03-02
**Spec**: [spec.md](./spec.md)

---

## Prerequisites

- Node.js >= 24.11.1
- pnpm (latest)
- Git

## Setup

```bash
# Clone the repository and switch to the feature branch
git clone <repository-url>
cd cherry-studio
git checkout 001-app-core

# Install dependencies
pnpm install

# Start in development mode
pnpm dev
```

The `pnpm dev` command starts Electron-Vite in development mode, which launches both the main process and the renderer with hot reload.

---

## Validation Scenarios

### Scenario 1: Application Launch

**Covers**: FR-001, SC-001

**Steps**:
1. Run `pnpm dev` to launch the application
2. Observe that the main window appears within 3 seconds
3. Verify the window has standard controls (minimize, maximize, close)
4. Verify the system tray icon appears in the system notification area

**Expected result**: Main window renders with the default theme applied. System tray icon is visible. Window title shows "Cherry Studio".

---

### Scenario 2: Window State Persistence

**Covers**: FR-002, FR-003, SC-005

**Steps**:
1. Launch the app
2. Resize the window to a non-default size (e.g., 1200x800)
3. Move the window to a different position on screen
4. Attempt to resize the window below 1000x600 -- verify it stops at the minimum size
5. Close the application
6. Relaunch the application
7. Verify the window opens at the same size and position as step 2-3

**Expected result**: Window state (size, position, maximized state) persists across restarts. Minimum size of 1000x600 is enforced.

---

### Scenario 3: File Upload and Metadata

**Covers**: FR-006, FR-007, FR-008, SC-002

**Steps**:
1. Launch the app
2. Trigger a file upload via the file picker (through the dev console or a test UI surface):
   ```javascript
   // In renderer dev console
   const result = await window.api.invoke('file:select', {
     properties: ['openFile'],
     filters: [{ name: 'All Files', extensions: ['*'] }]
   })
   console.log('Selected files:', result)
   ```
3. Verify the returned `FileMetadata` object contains:
   - A valid UUID `id`
   - Correct `origin_name` matching the selected file
   - A `path` pointing to the app data `files/` directory
   - Correct `size`, `ext`, and `type` values
   - A `created_at` ISO timestamp
   - `count` of 0

**Expected result**: File is copied to the managed storage directory. Metadata is complete and accurate. Upload completes within 2 seconds for files up to 50MB.

---

### Scenario 4: File Read by ID

**Covers**: FR-006, SC-002

**Steps**:
1. After uploading a file (Scenario 3), note the returned `id`
2. Read the file content via IPC:
   ```javascript
   const content = await window.api.invoke('file:read', fileId)
   console.log('File content length:', content.length)
   ```
3. Compare the content with the original file to verify integrity

**Expected result**: File content returned matches the original uploaded file exactly.

---

### Scenario 5: Configuration Persistence

**Covers**: FR-009, FR-010, SC-006

**Steps**:
1. Launch the app
2. Set a configuration value:
   ```javascript
   await window.api.invoke('config:set', { key: 'testKey', value: 'testValue' })
   ```
3. Read the value back:
   ```javascript
   const value = await window.api.invoke('config:get', 'testKey')
   console.log('Config value:', value) // Should print 'testValue'
   ```
4. Close and relaunch the application
5. Read the value again and verify it persists

**Expected result**: Configuration values persist across application restarts. Default values are returned for unset keys.

---

### Scenario 6: Language Switching

**Covers**: FR-011, FR-012, SC-004

**Steps**:
1. Launch the app (default language should be detected from system locale)
2. Switch language to Chinese:
   ```javascript
   await window.api.invoke('app:set-language', 'zh-cn')
   ```
3. Observe that all visible UI text changes to Chinese within 500ms
4. Switch back to English:
   ```javascript
   await window.api.invoke('app:set-language', 'en-us')
   ```
5. Verify all text reverts to English

**Expected result**: UI text updates immediately on language change. No application restart required. Missing translations fall back to English.

---

### Scenario 7: Keyboard Shortcuts

**Covers**: FR-014, SC-010

**Steps**:
1. Launch the app
2. Update a shortcut binding:
   ```javascript
   await window.api.invoke('shortcuts:update', [
     { key: 'showApp', shortcut: 'CommandOrControl+Shift+M', editable: true, enabled: true }
   ])
   ```
3. Minimize or hide the app window
4. Press the registered shortcut key combination (Ctrl+Shift+M or Cmd+Shift+M)
5. Verify the app window is brought to the foreground

**Expected result**: Shortcut registration takes effect immediately. Pressing the key combination triggers the associated action.

---

### Scenario 8: Tray Icon Theme

**Covers**: FR-020

**Steps**:
1. Launch the app with the system in light mode
2. Verify the tray icon uses the light variant
3. Switch the system to dark mode (via OS settings)
4. Verify the tray icon updates to the dark variant

**Expected result**: Tray icon matches the current system theme. Both light and dark variants are available and rendered correctly.

---

## Demo Guide

This section provides a guided walkthrough for non-developer stakeholders to verify F001-app-core functionality.

### Building the Application

```bash
# Development mode (with hot reload)
pnpm dev

# Production build
pnpm build

# Package for current platform
pnpm package
```

### Demo Walkthrough

#### Step 1: Launch and Window Management

1. Start the application with `pnpm dev`
2. The main window appears with the Cherry Studio interface
3. Try the following window operations:
   - Click the **minimize** button -- window minimizes to taskbar/dock
   - Click the **maximize** button -- window fills the screen
   - Drag the window to resize -- note it cannot go below 1000x600
   - Right-click the **tray icon** -- context menu appears
   - Click the tray icon -- window toggles visibility
4. Close and reopen the app -- window restores to previous size and position

#### Step 2: Exercise IPC Channels

Open the developer tools (View > Toggle Developer Tools or Ctrl+Shift+I) and test each core IPC channel:

```javascript
// App info
const info = await window.api.invoke('app:info')
console.log('App version:', info.version)
console.log('Files path:', info.filesPath)
console.log('Is portable:', info.isPortable)

// Window controls
await window.api.invoke('window:minimize')
await window.api.invoke('window:maximize')

// System info
const deviceType = await window.api.invoke('system:getDeviceType')
console.log('Device type:', deviceType)
```

#### Step 3: File Storage Round-Trip

Demonstrate the complete file lifecycle:

```javascript
// 1. Select a file
const files = await window.api.invoke('file:select', {
  properties: ['openFile']
})
console.log('Selected:', files[0].origin_name)

// 2. Verify file exists in storage
const fileId = files[0].id
const content = await window.api.invoke('file:read', fileId)
console.log('Read back', content.length, 'bytes')

// 3. Delete the file
await window.api.invoke('file:delete', fileId)
console.log('File deleted')
```

#### Step 4: Configuration Round-Trip

```javascript
// Write a config value
await window.api.invoke('config:set', { key: 'demo.greeting', value: 'Hello from demo!' })

// Read it back
const greeting = await window.api.invoke('config:get', 'demo.greeting')
console.log(greeting) // "Hello from demo!"
```

#### Step 5: Language Switch

```javascript
// Switch to Chinese
await window.api.invoke('app:set-language', 'zh-cn')
// Observe: all UI text changes to Chinese

// Switch back to English
await window.api.invoke('app:set-language', 'en-us')
// Observe: all UI text changes to English
```

### Verification Checklist

| # | What to Verify | Pass Criteria |
|---|----------------|---------------|
| 1 | App launches | Main window visible within 3 seconds |
| 2 | Window minimum size | Cannot resize below 1000x600 |
| 3 | Window state persistence | Size and position restored after restart |
| 4 | Tray icon | Visible in system tray, responds to clicks |
| 5 | File select + upload | Returns FileMetadata with UUID, correct name and type |
| 6 | File read | Content matches original file |
| 7 | File delete | File removed from storage |
| 8 | Config set/get | Value persists across operations |
| 9 | Config persistence | Value survives app restart |
| 10 | Language switch | UI text updates immediately, no restart |
| 11 | Keyboard shortcut | Registered shortcut triggers action |
| 12 | Tray icon theme | Matches system light/dark mode |
| 13 | Single instance | Second launch focuses existing window instead of opening new |
| 14 | IPC response time | All IPC calls complete within 100ms |
