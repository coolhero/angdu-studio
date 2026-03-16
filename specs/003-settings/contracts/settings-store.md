# Contract: Settings Stores

## useSettingsStore

Zustand store managing all user preferences. Hydrated from `config:getAll` on init, synced to electron-store via `config:set` on each change.

### State

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| theme | 'light' \| 'dark' \| 'system' | 'light' | Theme preference |
| language | string | '' | UI language code |
| proxyUrl | string \| null | null | HTTP/SOCKS proxy URL |
| autoUpdate | boolean | true | Auto-update enabled |
| navbarPosition | 'top' \| 'left' | 'top' | Navigation layout mode |
| fontSize | number | 14 | UI font size (px) |
| sendKey | 'enter' \| 'ctrl+enter' | 'enter' | Chat send key |
| messageStyle | 'bubble' \| 'plain' | 'bubble' | Message display style |
| avatarStyle | 'default' \| 'identicon' \| 'initials' | 'default' | Avatar style |
| codeBlockTheme | string | 'github-dark' | Code highlight theme |
| customCSS | string | '' | User custom CSS |
| launchAtLogin | boolean | false | Launch on OS login |
| startMinimized | boolean | false | Start minimized |
| backupMaxRetained | number | 5 | Max retained backups |
| isHydrated | boolean | false | Whether store has loaded from config |

### Actions

| Action | Signature | Side Effect |
|--------|-----------|-------------|
| hydrate | `() => Promise<void>` | Reads `config:getAll`, sets all fields, sets `isHydrated=true` |
| setSetting | `<K>(key: K, value: V) => void` | Updates local state + calls `config:set(key, value)` IPC |
| setTheme | `(theme: ThemeMode) => void` | Calls `setSetting('theme', theme)` + `theme:set` IPC |
| setLanguage | `(lang: string) => void` | Calls `setSetting('language', lang)` + `i18n.changeLanguage(lang)` |
| setNavbarPosition | `(pos: 'top' \| 'left') => void` | Calls `setSetting('navbarPosition', pos)` |
| resetAll | `() => Promise<void>` | Calls `config:reset` IPC + re-hydrates |

### Debouncing

- `setSetting` for `fontSize`, `customCSS`, `proxyUrl` fields: debounced 300ms
- All other fields: immediate

---

## useShortcutsStore

Zustand store managing keyboard shortcut bindings.

### State

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| shortcuts | Shortcut[] | DEFAULT_SHORTCUTS | All shortcut bindings |
| isRecording | boolean | false | Recording mode active |
| recordingKey | string \| null | null | Which shortcut is being recorded |

### Actions

| Action | Signature | Side Effect |
|--------|-----------|-------------|
| hydrate | `() => Promise<void>` | Reads `config:get('shortcuts')`, parses JSON, sets state |
| updateShortcut | `(key: string, combo: string[]) => void` | Updates binding + `config:set` + IPC register |
| resetToDefaults | `() => void` | Resets all to DEFAULT_SHORTCUTS + `config:set` + IPC re-register |
| startRecording | `(key: string) => void` | Sets `isRecording=true`, `recordingKey=key` |
| stopRecording | `() => void` | Sets `isRecording=false`, `recordingKey=null` |
| checkConflict | `(combo: string[]) => Shortcut \| null` | Returns conflicting shortcut or null |

---

## useQuickPhrasesStore

Zustand store managing quick phrases.

### State

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| phrases | QuickPhrase[] | [] | All quick phrases |

### Actions

| Action | Signature | Side Effect |
|--------|-----------|-------------|
| hydrate | `() => Promise<void>` | Reads `config:get('quickPhrases')`, parses JSON |
| addPhrase | `(title: string, content: string) => void` | Creates QuickPhrase, appends, persists |
| updatePhrase | `(id: string, updates: Partial<QuickPhrase>) => void` | Updates and persists |
| deletePhrase | `(id: string) => void` | Removes and persists |
| reorderPhrases | `(ids: string[]) => void` | Updates order field for each, persists |
| searchPhrases | `(query: string) => QuickPhrase[]` | Filters by title/content match (local) |
