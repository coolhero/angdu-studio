# Quickstart: Settings

## Prerequisites

- F001 (app-shell) implemented — Config API, Theme API, Dialog API
- F002 (navigation) implemented — tab routing, HashRouter
- Node.js >= 24.11.1, pnpm

## Setup

```bash
# Install new dependencies
pnpm add i18next react-i18next jszip
pnpm add -D @types/jszip

# shadcn/ui components (if not already added)
npx shadcn@latest add switch select slider input button alert-dialog radio-group tabs label separator
```

## Key Files to Create

```
src/
├── shared/types/
│   └── settings.ts          # Settings types, Zod schemas, defaults
├── main/
│   ├── ipc/
│   │   ├── data.ts          # data:export, data:import, data:clear handlers
│   │   ├── shortcuts.ts     # shortcuts:register/unregister handlers
│   │   └── startup.ts       # startup:setLoginItem handler
│   └── services/
│       ├── DataService.ts    # Export/import/clear logic
│       └── ShortcutService.ts # Global shortcut registration
├── renderer/src/
│   ├── stores/
│   │   ├── useSettingsStore.ts
│   │   ├── useShortcutsStore.ts
│   │   └── useQuickPhrasesStore.ts
│   ├── pages/settings/
│   │   ├── SettingsPage.tsx       # Layout: sidebar + content
│   │   ├── SettingsSidebar.tsx    # Left nav with sub-page links
│   │   ├── GeneralSettings.tsx
│   │   ├── DisplaySettings.tsx
│   │   ├── DataSettings.tsx
│   │   └── ShortcutSettings.tsx
│   ├── hooks/
│   │   ├── useShortcutRecorder.ts
│   │   └── useTheme.ts
│   └── i18n/
│       ├── index.ts               # i18next config
│       └── locales/
│           ├── en.json
│           └── zh-CN.json
```

## Verification

```bash
# Build check
pnpm run build

# Type check
pnpm run typecheck

# Run app and navigate to Settings
pnpm run dev
# → Click settings gear icon or navigate to #/settings
```
