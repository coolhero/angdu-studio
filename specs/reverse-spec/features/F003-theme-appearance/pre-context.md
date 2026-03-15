# F003 — Theme & Appearance — Pre-Context

> Feature ID: F003 | Tier: 1 | Release Group: RG-2

---

## Source Reference

| Key Source Files | Purpose |
|-----------------|---------|
| `src/main/services/ThemeService.ts` | Native theme setting via nativeTheme.themeSource |
| `src/renderer/src/store/settings.ts` | theme, userTheme, windowStyle, fontSize, messageFont settings |
| `src/renderer/src/context/` | Theme context provider |
| `src/main/ipc.ts` | App_SetTheme, App_HandleZoomFactor, App_GetSystemFonts |
| `src/renderer/src/assets/` | CSS variables, base styles |

---

## Source Behavior Inventory (SBI)

| ID | Source File | Function/Method | Behavior | Pri | Origin |
|----|-----------|----------------|----------|-----|--------|
| B028 | `ThemeService.ts` | `setTheme()` | Sets Electron nativeTheme.themeSource to 'light', 'dark', or 'system' | P1 | Source |
| B029 | `store/settings.ts` | `theme: ThemeMode` | Stores current theme preference; ThemeMode = 'light' \| 'dark' \| 'auto' | P1 | Source |
| B030 | `store/settings.ts` | `userTheme` | Custom overrides: colorPrimary (hex), userFontFamily, userCodeFontFamily | P1 | Source |
| B031 | `store/settings.ts` | `fontSize` | Base font size setting; affects global typography | P1 | Source |
| B032 | `store/settings.ts` | `windowStyle` | 'transparent' (vibrancy/blur) or 'opaque'; affects BrowserWindow options | P2 | Source |
| B033 | `ipc.ts` | `App_GetSystemFonts` | Queries OS font list via font-list package; returns cleaned array | P2 | Source |
| B034 | `store/settings.ts` | `messageFont` | 'system' or 'serif'; affects chat message typography | P2 | Source |
| B035 | `store/settings.ts` | `customCss` | User-provided CSS string injected into renderer | P2 | Source |
| B036 | `store/settings.ts` | `codeViewer` themes | Separate light/dark code syntax highlighting themes | P2 | Source |
| B037 | `store/settings.ts` | `messageStyle` | 'plain' or 'bubble'; affects chat message layout | P2 | Source |

---

## For /speckit.specify Hints

- Define CSS custom property naming convention for shadcn/ui tokens
- Specify dark/light theme token mapping
- Document font loading and fallback chain
- Define vibrancy/transparency behavior per platform

## For /speckit.plan Hints

- Task 1: CSS custom properties and Tailwind config
- Task 2: ThemeProvider with system theme detection
- Task 3: Font settings UI and application
- Task 4: Custom CSS injection
- Task 5: Code syntax theme management

---

## Feature Contracts

| Direction | Feature | Contract |
|-----------|---------|----------|
| Depends on F001 | Electron Shell | nativeTheme API, zoom factor, window style |
| Provides to All | — | CSS custom properties, theme context, design tokens |
| Depends on F007 | Settings System | Theme preferences stored in settings |
