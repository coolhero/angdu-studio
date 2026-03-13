# F012-creative-tools Pre-Context

> Feature: AI art/paintings, translation, code tools, mini-apps, OpenClaw, launchpad
> Tier: 3 | Risk Group: RG-4 | Dependencies: F002, F004

---

## 1. Runtime Exploration Results

### Screen: /paintings -- AI Art

**Layout**: Provider-specific sub-routes with shared navigation

**UI Elements (from source)**:
- Provider selector tab bar (Zhipu, Aihubmix, Silicon, DMXAPI, TokenFlux, OVMS, PPIO + custom new-api providers)
- Provider-specific painting pages with generation controls and gallery
- Route pattern: `/paintings/{provider}`

### Screen: /translate -- Translation

**Layout**: Split pane with source and target text areas

**UI Elements (from source)**:
- Source language select (with auto-detect)
- Target language select
- Model selector
- Input text area + output text area
- Send/translate button, swap languages, copy, OCR upload
- Translation history drawer
- Translation settings (auto-copy, markdown mode, bidirectional, scroll sync)

### Screen: /code -- Code Tools

**Layout**: Centered settings panel with launch button

**UI Elements (from source)**:
- CLI tool selector (Claude Code, Gemini CLI, OpenAI Codex, Qwen Code, iFlow CLI, GitHub Copilot CLI, Kimi CLI, OpenCode)
- Model selector (filtered by CLI tool compatibility)
- Working directory selector with history
- Environment variables editor
- Terminal selector (macOS/Windows)
- Auto-update checkbox
- Bun installation alert (required dependency)
- Launch button

### Screen: /apps -- Mini Apps

**Layout**: Grid of app cards with search and settings

**UI Elements (from source)**:
- Search input (name/URL filter)
- Settings button -> MinappSettingsPopup
- App grid with card components
- New app button

### Screen: /openclaw -- OpenClaw

**Layout**: Gateway management interface (inferred from store)

**State**: gatewayStatus (stopped/starting/running/error), gatewayPort, channels, health check

### Screen: /launchpad -- Launchpad

**Layout**: Minimal page component (from source -- `LaunchpadPage.tsx`)

---

## 2. Source Reference

| # | Source File | Role | Rebuild Target |
|---|------------|------|----------------|
| **Paintings** | | | |
| 1 | `src/renderer/src/pages/paintings/PaintingsRoutePage.tsx` | Route manager for painting providers | [TBD] |
| 2 | `src/renderer/src/pages/paintings/{Provider}Page.tsx` (8 files) | Provider-specific painting UIs | [TBD] |
| 3 | `src/renderer/src/pages/paintings/components/` | Shared painting components | [TBD] |
| 4 | `src/renderer/src/pages/paintings/config/` | Painting config | [TBD] |
| 5 | `src/renderer/src/pages/paintings/utils/` | Painting utilities | [TBD] |
| 6 | `src/renderer/src/store/paintings.ts` | Redux slice for paintings (-> Zustand) | [TBD] |
| **Translate** | | | |
| 7 | `src/renderer/src/pages/translate/TranslatePage.tsx` | Main translation page | [TBD] |
| 8 | `src/renderer/src/pages/translate/TranslateHistory.tsx` | Translation history UI | [TBD] |
| 9 | `src/renderer/src/pages/translate/TranslateSettings.tsx` | Translation settings | [TBD] |
| 10 | `src/renderer/src/store/translate.ts` | Redux slice for translate (-> Zustand) | [TBD] |
| **Code Tools** | | | |
| 11 | `src/renderer/src/pages/code/CodeToolsPage.tsx` | Code tools launch page | [TBD] |
| 12 | `src/renderer/src/pages/code/index.ts` | Code tools constants and helpers | [TBD] |
| 13 | `src/renderer/src/store/codeTools.ts` | Redux slice for code tools (-> Zustand) | [TBD] |
| 14 | `src/main/services/CodeToolsService.ts` | Main-process code tools launcher | [TBD] |
| **Mini Apps** | | | |
| 15 | `src/renderer/src/pages/minapps/MinAppsPage.tsx` | Mini apps grid page | [TBD] |
| 16 | `src/renderer/src/pages/minapps/MinAppPage.tsx` | Individual mini app page | [TBD] |
| 17 | `src/renderer/src/pages/minapps/NewAppButton.tsx` | Add new app button | [TBD] |
| 18 | `src/renderer/src/pages/minapps/MiniappSettings/` | Mini app settings | [TBD] |
| 19 | `src/renderer/src/store/minapps.ts` | Redux slice for mini apps (-> Zustand) | [TBD] |
| **OpenClaw** | | | |
| 20 | `src/renderer/src/pages/openclaw/OpenClawPage.tsx` | OpenClaw gateway page | [TBD] |
| 21 | `src/renderer/src/store/openclaw.ts` | Redux slice for OpenClaw (-> Zustand) | [TBD] |
| 22 | `src/main/services/OpenClawService.ts` | Main-process OpenClaw service | [TBD] |
| **Launchpad** | | | |
| 23 | `src/renderer/src/pages/launchpad/LaunchpadPage.tsx` | Launchpad page | [TBD] |

**[New Stack] Logic-Only Reference**: Business logic is in services/stores (stack-independent). All UI rebuilt with shadcn/ui + Tailwind.

---

## 3. Source Behavior Inventory

### Paintings Store -- P2

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B325 | addPainting | `({namespace, painting}) => void` | P2 |
| B326 | removePainting | `({namespace, painting}) => void` | P2 |
| B327 | updatePainting | `({namespace, painting}) => void` | P2 |
| B328 | updatePaintings | `({namespace, paintings}) => void` | P3 |

### Translate Store -- P2

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B329 | setTranslateInput | `(input: string) => void` | P2 |
| B330 | setTranslatedContent | `(content: string) => void` | P2 |
| B331 | updateSettings (translate) | `(settings: Partial<{autoCopy}>) => void` | P3 |

### TranslatePage -- P2

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B332 | TranslatePage | `FC` -- translation UI with model selection, language detection, history | P2 |
| B333 | translateText | from TranslateService -- AI-powered translation | P2 |
| B334 | saveTranslateHistory | from TranslateService -- save to Dexie | P3 |

### CodeTools Store -- P2

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B335 | CodeToolsState | selectedCliTool, selectedModels, environmentVariables, directories, currentDirectory, selectedTerminal | P2 |

### CodeToolsPage -- P2

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B336 | CodeToolsPage | `FC` -- CLI tool launcher with model, dir, env config | P2 |
| B337 | handleLaunch | validate -> prepareLaunchEnvironment -> executeLaunch | P2 |
| B338 | prepareLaunchEnvironment | generate tool-specific env vars from provider/model | P2 |
| B339 | checkBunInstallation | check if bun binary exists | P2 |
| B340 | handleInstallBun | install bun binary | P3 |
| B341 | loadAvailableTerminals | get available terminals for macOS/Windows | P3 |

### MinApps Store -- P2

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B342 | setMinApps | `(apps: MinAppType[]) => void` | P2 |
| B343 | addMinApp | `(app: MinAppType) => void` | P2 |
| B344 | setDisabledMinApps | `(apps: MinAppType[]) => void` | P3 |
| B345 | setPinnedMinApps | `(apps: MinAppType[]) => void` | P2 |

### OpenClaw Store -- P3

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B346 | setGatewayStatus | `(status: GatewayStatus) => void` | P3 |
| B347 | setGatewayPort | `(port: number) => void` | P3 |
| B348 | setChannels | `(channels: ChannelInfo[]) => void` | P3 |
| B349 | setLastHealthCheck | `(health: HealthInfo \| null) => void` | P3 |
| B350 | setSelectedModelUniqId | `(id: string \| null) => void` | P3 |

### PaintingsRoutePage -- P2

| ID | Function | Signature | Priority |
|----|----------|-----------|----------|
| B351 | PaintingsRoutePage | `FC` -- route manager for painting providers with sub-routes | P2 |

---

## 4. UI Component Features

| Source Component | Library | Replacement |
|-----------------|---------|-------------|
| `Button`, `Input`, `Select`, `Checkbox` | Ant Design | shadcn/ui equivalents |
| `TextArea` | Ant Design Input.TextArea | shadcn/ui Textarea |
| `Alert` | Ant Design | shadcn/ui Alert |
| `Avatar` | Ant Design | shadcn/ui Avatar |
| `Space.Compact` | Ant Design | Tailwind flex/group |
| `Popover`, `Tooltip` | Ant Design | shadcn/ui Popover/Tooltip |
| `FloatButton` | Ant Design | Custom FAB |
| `Image.PreviewGroup` | Ant Design | Custom lightbox |
| `Flex` | Ant Design | Tailwind flex |
| `Typography` | Ant Design | Native HTML/Tailwind |
| `ModelSelector` | Custom | Port |
| `ModelSelectButton` | Custom | Port |
| `LanguageSelect` | Custom | Port |
| `MinApp` component | Custom (webview?) | Port |
| `styled-components` | styled-components | Tailwind CSS 4 |
| `lucide-react` icons | lucide-react | Keep |

---

## 5. Interaction Behavior Inventory

| Pattern | Details |
|---------|---------|
| **Paintings** | Provider switching via route params, image generation with provider-specific controls |
| **Translate** | Auto-detect source language, swap languages, copy result, OCR from image, scroll sync between panes |
| **Translate** | Abort in-progress translation, auto-copy setting, markdown rendering toggle |
| **Translate** | History drawer with saved translations |
| **Code Tools** | CLI tool selection filters available models, folder select dialog, terminal selection |
| **Code Tools** | Bun dependency check with install prompt, environment variable configuration |
| **Mini Apps** | Search/filter apps, pin to sidebar, add custom web app, webview rendering |
| **OpenClaw** | Gateway start/stop, health check, channel status monitoring |
| **Drag & drop** | Translate: drag text/files into input area |

---

## 6. Naming Remapping

| Original | Location | Remap To |
|----------|----------|----------|
| `cherryai` | CodeToolsPage.tsx:87 (provider filter) | `angduai` |
| `CherryHQ/cherry-studio` | store files (comments) | Remove/update |
| `CherryIN` | Runtime exploration model reference | Review |

---

## 7. Static Resources

- **Icons**: lucide-react (Terminal, Download, FolderOpen, HelpCircle, X, ArrowUpRight, Check, CirclePause, FolderClock, Settings2, UploadIcon, Search, SettingsIcon, Plus, SendOutlined, SwapOutlined, PlusOutlined)
- **Provider logos**: via `getProviderLogo(providerId)` -- image assets for AI providers
- **Mini app logos**: from MinAppType configuration

---

## 8. Environment Variables

### Code Tools (generated per CLI tool)
- `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL` -- for Claude Code
- `GEMINI_API_KEY` -- for Gemini CLI
- `OPENAI_API_KEY`, `OPENAI_BASE_URL` -- for OpenAI Codex
- Various per-tool env vars generated by `generateToolEnvironment()`

---

## 9. For /speckit.specify

### Summary
Creative tools is a collection of AI-powered utilities: image generation (paintings) with multiple provider backends, AI translation with language detection, code tools launcher for CLI development tools, mini-apps (embedded web apps), OpenClaw gateway management, and a launchpad. Each sub-feature is relatively independent.

### Key Scenarios
- SC-F012-01: User generates an image via a painting provider
- SC-F012-02: User translates text with auto-detect and copy
- SC-F012-03: User launches Claude Code with configured model and directory
- SC-F012-04: User browses and opens a mini app
- SC-F012-05: User pins a mini app to the sidebar
- SC-F012-06: User starts/stops OpenClaw gateway
- SC-F012-07: User adds a custom web mini-app

### Draft Functional Requirements
- FR-F012-01: Paintings shall support multiple provider backends with provider-specific UIs
- FR-F012-02: Translation shall support auto-language detection and bidirectional mode
- FR-F012-03: Code tools shall validate dependencies (bun) before launch
- FR-F012-04: Code tools shall generate provider-specific env vars from configured models
- FR-F012-05: Mini apps shall support pinning to sidebar for quick access
- FR-F012-06: OpenClaw shall manage gateway lifecycle with health monitoring
- FR-F012-07: Translation history shall persist in Dexie

### Edge Cases
- Painting generation fails -> error display with provider-specific message
- Translation abort during streaming -> cancel completion
- Bun not installed -> install flow before code tools can launch
- Mini app URL unreachable -> webview error handling
- OpenClaw gateway port conflict -> configurable port

---

## 10. For /speckit.plan

### Dependencies
- F002 (Provider Management): AI provider configs for painting/translate/code tools
- F004 (AI Chat Engine): AI completion API for translation, model selection

### Entities Owned
- `PaintingsState`: namespaced painting arrays (per provider)
- `PaintingAction`: id, files, provider-specific params
- `TranslateState`: translateInput, translatedContent, settings
- `TranslateHistory` (Dexie): persisted translation records
- `CodeToolsState`: selectedCliTool, selectedModels, directories, envVars, terminal
- `MinAppsState`: enabled, disabled, pinned (MinAppType arrays)
- `PluginMetadata`: mini app metadata
- `OpenClawState`: gatewayStatus, port, channels, healthCheck

### Key APIs (IPC)
- Paintings: Provider-specific image generation APIs
- Translate: AI completion for translation (reuses F004 AI provider)
- Code Tools: `codeTools.run`, `codeTools.getAvailableTerminals`, `codeTools.setCustomTerminalPath`
- OVMS: `ovms.getStatus`
- OpenClaw: gateway management APIs

### Tech Decisions
- Paintings: Provider-specific pages with shared route manager
- Translation: Streaming AI completion with abort support
- Code Tools: External CLI process launch via terminal emulator
- Mini Apps: Embedded webview for web applications
- OpenClaw: Local gateway server management

---

## 11. Feature Contracts

### Guarantees
- Painting history persisted per provider namespace
- Translation history saved to Dexie for retrieval
- Code tools validate all prerequisites before launch
- Mini app pinned state persists across sessions

### Dependencies on Other Features
- F002: Provider configuration for API access
- F004: AI completion for translation and paintings
- F008 (MCP): Code tools checks isBunInstalled from MCP store

### Failure Modes
- Provider API error -> provider-specific error display
- Bun binary missing -> install prompt blocks launch
- Mini app crash -> webview error recovery
- OpenClaw port in use -> port configuration option

---

## 12. For /speckit.analyze

### Cross-Feature Verification
- F012 <-> F002 (Providers): All creative tools use provider models
- F012 <-> F004 (AI Chat): Translation uses same AI completion pipeline
- F012 <-> F007 (Files): Paintings reference files (deletion protection in FilesPage)
- F012 <-> F008 (MCP): Code tools shares isBunInstalled state with MCP store

### Impact Scope
- Creative tools are mostly self-contained sub-features
- Paintings store is checked during file deletion (F007 cross-dependency)
- Translation reuses the AI completion infrastructure
- Code tools has terminal/binary dependency management
- Mini apps extend the app with third-party web content (security consideration)
