# Business Logic Map — Angdu Studio

> Key business rules per Feature, extracted from Cherry Studio source.

---

## F001 — Electron Shell

| Rule | Description | Source |
|------|-------------|--------|
| BL-001 | Single-instance lock: only one app instance allowed; second instance focuses the existing window | `src/main/index.ts` |
| BL-002 | macOS: hidden titlebar with traffic light positioning at (10, 16); Linux/Windows: custom titlebar | `src/main/index.ts` |
| BL-003 | Minimum window size: 1080x600 (MIN_WINDOW_WIDTH, MIN_WINDOW_HEIGHT) | `src/shared/config/constant.ts` |
| BL-004 | Zoom factor: persisted to config, applied to all windows on change; supports delta-based zoom and reset | `src/main/utils/zoom.ts` |
| BL-005 | Quit prevention: when critical operations are running (backup, transfer), block quit with notification | `src/main/ipc.ts` |
| BL-006 | Relaunch: platform-specific handling for AppImage (Linux) and Portable (Windows) executables | `src/main/ipc.ts` |
| BL-007 | Factory reset: close all data connections, recursively delete data directory, then relaunch | `src/main/ipc.ts` |
| BL-008 | Auto-update: configurable on/off, supports test plan and upgrade channel selection | `src/main/services/AppUpdater.ts` |

## F002 — Navigation & Layout

| Rule | Description | Source |
|------|-------------|--------|
| BL-009 | Tab system: always has at least one tab (home); closing last tab is prevented | `src/renderer/src/store/tabs.ts` |
| BL-010 | Tab deduplication: adding a tab with existing path activates the existing tab instead | `src/renderer/src/store/tabs.ts` |
| BL-011 | Tab close: when closing active tab, activates the last tab in the list | `src/renderer/src/store/tabs.ts` |
| BL-012 | Sidebar: toggleable assistants and topics panels; topic position configurable (left/right) | `src/renderer/src/store/settings.ts` |
| BL-013 | Window maximize state: main -> renderer notification on maximize/unmaximize for UI updates | `src/main/ipc.ts` |

## F003 — Theme & Appearance

| Rule | Description | Source |
|------|-------------|--------|
| BL-014 | Theme modes: 'light', 'dark', 'auto' (follows system); set via IPC to main process ThemeService | `src/main/services/ThemeService.ts` |
| BL-015 | User theme overrides: colorPrimary, userFontFamily, userCodeFontFamily stored in settings | `src/renderer/src/store/settings.ts` |
| BL-016 | Window style: 'transparent' (vibrancy) or 'opaque'; affects BrowserWindow creation | `src/renderer/src/store/settings.ts` |
| BL-017 | Font loading: system fonts queried via IPC, filtered for non-empty names | `src/main/ipc.ts` |
| BL-018 | Custom CSS: user-provided CSS injected into the renderer | `src/renderer/src/store/settings.ts` |

## F004 — Provider Management

| Rule | Description | Source |
|------|-------------|--------|
| BL-019 | Provider types: 12 base types via Zod enum; extensible via 'new-api' and 'gateway' types | `src/renderer/src/types/provider.ts` |
| BL-020 | System providers: 60+ pre-configured provider definitions with isSystem=true; cannot be deleted | `src/renderer/src/types/provider.ts` |
| BL-021 | API key storage: encrypted via AES; decrypt on use only | `src/main/utils/aes.ts` |
| BL-022 | OAuth flows: Copilot (device code flow), Anthropic (authorization code flow) — separate IPC channels | `src/main/services/CopilotService.ts`, `src/main/services/AnthropicService.ts` |
| BL-023 | Provider health check: validate API key by making a test request to provider endpoint | Various provider services |
| BL-024 | Provider rate limiting: optional rateLimit field per provider | `src/renderer/src/types/provider.ts` |
| BL-025 | Provider API options: per-provider feature flags (isNotSupportArrayContent, isNotSupportStreamOptions, etc.) | `src/renderer/src/types/provider.ts` |

## F005 — Model Management

| Rule | Description | Source |
|------|-------------|--------|
| BL-026 | Model listing: fetched from provider APIs; merged with system-defined defaults | `src/renderer/src/config/models.ts` |
| BL-027 | Default model: global setting stored in LLM state; used when assistant has no model set | `src/renderer/src/store/llm.ts` |
| BL-028 | Special models: defaultModel, topicNamingModel, quickModel, translateModel — each independently configurable | `src/renderer/src/store/llm.ts` |
| BL-029 | Model deduplication: models merged by ID with uniqBy | `src/renderer/src/store/llm.ts` |
| BL-030 | Model capabilities: tagged with types (vision, embedding, reasoning, function_calling, web_search, rerank, free) | `src/renderer/src/types/index.ts` |
| BL-031 | Endpoint types: models support multiple endpoint types (openai, openai-response, anthropic, gemini, image-generation, jina-rerank) | `src/renderer/src/types/index.ts` |

## F006 — Chat Core

| Rule | Description | Source |
|------|-------------|--------|
| BL-032 | Assistant defaults: temperature=0.7, contextCount=20, streamOutput=true, toolUseMode='function' | `src/renderer/src/services/AssistantService.ts` |
| BL-033 | Topic auto-naming: enabled by default; uses topicNamingModel to generate name from first message; skipped if isNameManuallyEdited | `src/renderer/src/store/settings.ts` |
| BL-034 | Message blocks architecture: messages contain ordered block IDs; blocks stored separately in message_blocks table | `src/renderer/src/types/newMessage.ts` |
| BL-035 | Streaming: responses stream via Vercel AI SDK; status transitions: pending -> processing/streaming -> success/error/paused | `src/renderer/src/types/newMessage.ts` |
| BL-036 | Context window: contextCount controls how many recent messages are sent to LLM; 'clear' type messages reset context | `src/renderer/src/types/index.ts` |
| BL-037 | Ask-reply linking: assistant messages reference the user message via askId | `src/renderer/src/types/newMessage.ts` |
| BL-038 | Reasoning effort: per-assistant setting with options (none, minimal, low, medium, high, xhigh, auto, default); effort ratios map to budget multipliers | `src/renderer/src/types/index.ts` |
| BL-039 | MCP mode: per-assistant setting ('disabled', 'auto', 'manual'); legacy fallback based on mcpServers presence | `src/renderer/src/types/index.ts` |

## F007 — Settings System

| Rule | Description | Source |
|------|-------------|--------|
| BL-040 | Settings persistence: Redux state synced to main process ConfigManager via IPC; ConfigManager writes to electron-store | `src/main/services/ConfigManager.ts` |
| BL-041 | Proxy modes: 'system' (OS proxy), 'custom' (user-specified URL + bypass rules), 'none' (direct) | `src/renderer/src/store/settings.ts` |
| BL-042 | Send message shortcut: configurable (Enter, Shift+Enter, Ctrl+Enter, Command+Enter, Alt+Enter) | `src/renderer/src/store/settings.ts` |
| BL-043 | Launch behavior: launchOnBoot, launchToTray, trayOnClose — each independent boolean | `src/renderer/src/store/settings.ts` |
| BL-044 | Keyboard shortcuts: registered globally via Electron; updated via IPC; all unregistered before re-registration | `src/main/services/ShortcutService.ts` |
| BL-045 | Message style: 'plain' or 'bubble' layout | `src/renderer/src/store/settings.ts` |

## F008 — Data & Storage

| Rule | Description | Source |
|------|-------------|--------|
| BL-046 | Dual storage: Dexie (IndexedDB) for files, topics, message_blocks, settings; SQLite for knowledge, agents | `src/renderer/src/databases/index.ts` |
| BL-047 | Backup format: ZIP archive containing exported data; supports local directory backup/restore | `src/main/services/BackupManager.ts` |
| BL-048 | File management: files stored with UUID-based names; original names preserved in origin_name field | `src/main/services/FileStorage.ts` |
| BL-049 | Cache management: clears session storage, cookies, filesystem, shader cache; also clears temp files | `src/main/ipc.ts` |
| BL-050 | Data path migration: supports changing userData directory; copies all data to new location with filter for occupied dirs | `src/main/ipc.ts` |
| BL-051 | Dexie schema versioning: 10 versions with upgrade migrations (v5: legacy message migration, v7: message blocks extraction) | `src/renderer/src/databases/index.ts` |

## F009 — i18n

| Rule | Description | Source |
|------|-------------|--------|
| BL-052 | Language files: JSON format in locales directory; en-us, zh-cn, zh-tw plus 8 more | `src/renderer/src/i18n/locales/` |
| BL-053 | Language persistence: set via IPC to main ConfigManager; applied on next render cycle | `src/main/ipc.ts` |
| BL-054 | Default language: English (en-us); auto-detected from system on first launch | `src/renderer/src/i18n/index.ts` |

## F010 — Chat Advanced

| Rule | Description | Source |
|------|-------------|--------|
| BL-055 | Multi-model: @-mention models in message; responses rendered in configurable layout (horizontal/vertical/fold/grid) | `src/renderer/src/types/newMessage.ts` |
| BL-056 | Fold selection: in fold mode, one response is marked as foldSelected for primary display | `src/renderer/src/types/newMessage.ts` |
| BL-057 | Grid columns: configurable (gridColumns setting); popover trigger configurable (hover/click) | `src/renderer/src/store/settings.ts` |
| BL-058 | File attachments: FileMetadata array on user messages; supports image, document, PDF types | `src/renderer/src/types/newMessage.ts` |
| BL-059 | Paste long text as file: when pasted text exceeds threshold, auto-convert to file attachment | `src/renderer/src/store/settings.ts` |

## F011 — Knowledge Base

| Rule | Description | Source |
|------|-------------|--------|
| BL-060 | Embedding: requires embedding model; dimensions auto-detected or configured | `src/renderer/src/types/knowledge.ts` |
| BL-061 | Chunk config: chunkSize and chunkOverlap control text splitting for vector storage | `src/renderer/src/types/knowledge.ts` |
| BL-062 | Processing pipeline: items go through pending -> processing -> completed/failed; supports retry | `src/renderer/src/types/knowledge.ts` |
| BL-063 | Multi-source: supports file, URL, note, sitemap, directory item types | `src/renderer/src/types/knowledge.ts` |
| BL-064 | Re-ranking: optional rerankModel for post-retrieval result re-ordering | `src/renderer/src/types/knowledge.ts` |
| BL-065 | Similarity threshold: configurable per KB; filters low-relevance results | `src/renderer/src/types/knowledge.ts` |

## F012 — MCP Integration

| Rule | Description | Source |
|------|-------------|--------|
| BL-066 | Server types: stdio (subprocess), sse (HTTP SSE), streamableHttp, inMemory (builtin only) | `src/renderer/src/types/mcp.ts` |
| BL-067 | InMemory restriction: only builtin server names allowed for inMemory type | `src/renderer/src/types/mcp.ts` |
| BL-068 | URL-based type inference: URLs ending in /mcp -> streamableHttp; others -> sse | `src/renderer/src/types/mcp.ts` |
| BL-069 | Tool permissions: disabledTools and disabledAutoApproveTools arrays per server | `src/renderer/src/types/mcp.ts` |
| BL-070 | Trust system: isTrusted flag + trustedAt timestamp; untrusted servers require user confirmation | `src/renderer/src/types/mcp.ts` |
| BL-071 | DXT support: upload .dxt files -> extract -> install as MCP server with version tracking | `src/main/ipc.ts`, `src/main/services/DxtService.ts` |
| BL-072 | Tool call lifecycle: pending -> streaming -> invoking -> done/error/cancelled | `src/renderer/src/types/index.ts` |
| BL-073 | Server config validation: Zod schema with strict mode and custom refinements; validates all fields | `src/renderer/src/types/mcp.ts` |
