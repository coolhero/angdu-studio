# F014-mini-apps Pre-Context

## Feature Identity

| Field | Value |
|-------|-------|
| ID | F014 |
| Name | mini-apps |
| Title | Mini Apps — Webview AI Services & Launchpad |
| Tier | 3 |
| Risk Group | RG-4 |
| Dependencies | F001-shell, F002-i18n-theme |
| SBI Range | B226 – B237 |

## Project Context

- **Original**: Cherry Studio (`/Users/coolhero/Develop/cherry-studio`)
- **New**: Angdu Studio — Electron + React 19 + Zustand + Tailwind 4 + shadcn/ui + Vite 7
- **Naming**: Cherry -> Angdu, CS -> AS

## Key Source Files (relative to cherry-studio)

| Path | Role |
|------|------|
| `src/renderer/src/pages/minapps/MinAppsPage.tsx` | App grid — 60+ AI service tiles |
| `src/renderer/src/pages/minapps/MinAppPage.tsx` | Single app webview container |
| `src/renderer/src/pages/launchpad/LaunchpadPage.tsx` | Launchpad — feature card quick access |
| `src/renderer/src/store/minapps.ts` | Mini apps state (list, custom apps, order) |

## SBI Table

| ID | Source File | Function/Method | Behavior Description | Priority | Origin |
|----|-------------|----------------|---------------------|----------|--------|
| B226 | pages/minapps/MinAppsPage.tsx | renderAppGrid() | Renders grid of 60+ AI service tiles | P1 | extracted |
| B227 | pages/minapps/MinAppPage.tsx | renderWebview() | Renders webview for selected app | P1 | extracted |
| B228 | pages/minapps/MinAppPage.tsx | handleWebviewNavigation() | Manages webview navigation and external links | P2 | extracted |
| B229 | store/minapps.ts | addCustomApp() | Adds user-defined custom mini app | P2 | extracted |
| B230 | store/minapps.ts | removeApp() | Removes mini app from list | P2 | extracted |
| B231 | store/minapps.ts | updateApp() | Updates app configuration | P2 | extracted |
| B232 | store/minapps.ts | reorderApps() | Reorders app grid | P3 | extracted |
| B233 | pages/launchpad/LaunchpadPage.tsx | renderLaunchpad() | Renders feature card grid (quick access) | P1 | extracted |
| B234 | pages/launchpad/ | handleLaunchFeature() | Navigates to feature page from launchpad | P1 | extracted |
| B235 | main/ipc.ts | Webview_SetOpenLinkExternal() | Configures webview external link behavior | P2 | extracted |
| B236 | main/ipc.ts | Webview_PrintToPDF() | Exports webview content as PDF | P3 | extracted |
| B237 | main/ipc.ts | MiniWindow_Show/Hide() | Shows/hides mini window | P3 | extracted |

## Priority Summary

- **P1 (Must)**: 4 behaviors — app grid, webview render, launchpad grid, launch feature navigation
- **P2 (Should)**: 5 behaviors — webview navigation, add/remove/update custom apps, external link config
- **P3 (Nice)**: 3 behaviors — reorder apps, print to PDF, mini window show/hide

## Dependency Notes

- **F001-shell**: App shell provides navigation routing to mini-apps and launchpad pages; mini window management
- **F002-i18n-theme**: i18n strings for app names/descriptions, theme tokens for grid and webview styling

## Migration Notes

- Redux slice (`store/minapps.ts`) migrates to Zustand store
- Electron `<webview>` tag usage: verify CSP and security policies in new Electron version; consider `BrowserView` or `iframe` with `sandbox` as alternatives
- 60+ hardcoded AI service URLs: extract to a config/data file for maintainability
- Launchpad is a separate page but shares grid layout patterns with mini-apps — consider shared grid component
- `Webview_SetOpenLinkExternal` and `Webview_PrintToPDF` are main-process IPC; migrate to typed IPC pattern
- Mini window (MiniWindow_Show/Hide) may use `BrowserWindow` management from F001-shell
