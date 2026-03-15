# Quickstart: Navigation

## Prerequisites

- F001 app-shell completed and merged
- Node.js 24+, pnpm
- `pnpm install` completed

## Key Files

| File | Purpose |
|------|---------|
| `src/renderer/src/Router.tsx` | Hash router setup, route definitions, lazy loading |
| `src/renderer/src/stores/useTabsStore.ts` | Zustand tab state + persistence |
| `src/renderer/src/services/NavigationService.ts` | Programmatic navigation API |
| `src/renderer/src/components/navigation/TabBar.tsx` | Top tab bar component |
| `src/renderer/src/components/navigation/Sidebar.tsx` | Left sidebar component |
| `src/renderer/src/components/navigation/NavbarWrapper.tsx` | Mode switch wrapper |
| `src/renderer/src/components/layout/AppLayout.tsx` | Main layout (sidebar + content area) |
| `src/shared/types/navigation.ts` | Tab, NavbarConfig types |

## Development

```bash
# Start dev mode
pnpm run dev

# Type check
npx tsc --noEmit

# Build
pnpm run build
```

## Testing Navigation

1. Launch app → Home tab should be visible and active
2. Click sidebar icon → new tab opens, page navigates
3. Right-click tab → context menu appears
4. Close tab → adjacent tab activates
5. Quit and relaunch → tabs restored
