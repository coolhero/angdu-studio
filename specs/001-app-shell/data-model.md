# Data Model: App Shell

## AppConfig

**Storage**: electron-store (JSON file in userData directory)
**Owner**: F001-app-shell (via ConfigManager service)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| theme | `'dark' \| 'light' \| 'system'` | `'dark'` | App theme mode |
| language | `'ko' \| 'en'` | `'ko'` | UI language (Korean default) |
| trayEnabled | `boolean` | `true` | Show system tray icon |
| trayOnClose | `boolean` | `false` | Hide to tray on close instead of quit |
| clickTrayToShowQuickAssistant | `boolean` | `false` | Tray click shows mini window instead of main |
| launchOnBoot | `boolean` | `false` | Start on system login |
| launchToTray | `boolean` | `false` | Start hidden (tray only) |
| autoUpdate | `boolean` | `true` | Auto-check for updates |
| updateChannel | `'latest' \| 'rc' \| 'beta'` | `'latest'` | Update feed channel |
| proxyMode | `'system' \| 'custom' \| 'direct'` | `'system'` | Proxy configuration mode |
| proxyUrl | `string` | `''` | Custom proxy URL (when proxyMode='custom') |
| proxyBypassRules | `string` | `''` | Proxy bypass rules |
| shortcuts | `ShortcutConfig` | (see below) | Global shortcut mappings |
| zoomFactor | `number` | `1.0` | Window zoom level |
| spellCheckEnabled | `boolean` | `false` | Enable spell check |
| spellCheckLanguages | `string[]` | `['en-US']` | Spell check languages |
| hardwareAcceleration | `boolean` | `true` | Enable GPU acceleration |

### ShortcutConfig

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| showApp | `string` | `'Alt+Shift+Space'` | Toggle main window |
| miniWindow | `string` | `'Alt+Space'` | Toggle mini window |
| selectionAssistant | `string` | `'Ctrl+Shift+A'` | Toggle selection assistant |

### Validation Rules

- `theme` must be one of the allowed values
- `language` must be `'ko'` or `'en'`
- `zoomFactor` must be between 0.5 and 3.0
- `proxyUrl` must be a valid URL when proxyMode is 'custom'
- `shortcuts` values must be valid Electron accelerator strings

---

## WindowState

**Storage**: electron-window-state (JSON file in userData directory)
**Owner**: F001-app-shell (managed by electron-window-state library)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| x | `number` | centered | Window X position |
| y | `number` | centered | Window Y position |
| width | `number` | `960` | Window width |
| height | `number` | `600` | Window height |
| isMaximized | `boolean` | `false` | Maximized state |

### Constraints

- `width` minimum: 960
- `height` minimum: 600
- Position validated against available screens on restore

---

## PreloadAPI (Interface)

**Type**: TypeScript interface (not persisted)
**Owner**: F001-app-shell

```typescript
interface PreloadAPI {
  windowControls: {
    minimize(): void;
    maximize(): void;
    close(): void;
    isMaximized(): Promise<boolean>;
  };
  miniWindow: {
    show(): void;
    hide(): void;
    close(): void;
    toggle(): void;
    setPin(pinned: boolean): void;
  };
  setTheme(theme: 'dark' | 'light' | 'system'): void;
  app: {
    getInfo(): Promise<AppInfo>;
    reload(): void;
    quit(): void;
    quitAndInstall(): void;
    clearCache(): Promise<void>;
    getSystemFonts(): Promise<string[]>;
    getIpCountry(): Promise<string>;
    setProxy(config: ProxyConfig): Promise<void>;
    setFullScreen(enabled: boolean): void;
    isFullScreen(): Promise<boolean>;
    openExternal(url: string): void;
  };
  on(channel: string, callback: (...args: unknown[]) => void): () => void;
  send(channel: string, ...args: unknown[]): void;
  invoke(channel: string, ...args: unknown[]): Promise<unknown>;
}
```

### Relationships

- **AppConfig → WindowState**: Config values (zoomFactor) are applied after window state restore
- **AppConfig → PreloadAPI**: Theme and proxy settings are applied via preload API methods
- **SettingsState (F003) → AppConfig**: F003 settings UI writes to AppConfig via IPC; F001 ConfigManager notifies subscribers
