# Feature Boundary Proposal — Angdu Studio Core Rebuild

> Scope: Core | Stack: Electron + React + shadcn/ui + Zustand + unified SQLite
> Date: 2026-03-15

---

## Level 1: Coarse (Domain-level) — 6 Features

Large domains, fast to plan, risk of monolithic Features that are hard to verify.

| # | Feature | Description | Covers Areas | Tier |
|---|---------|-------------|-------------|------|
| 1 | **App Shell** | Electron main process, window management, titlebar, theme, tray, auto-update, navigation (tabs + sidebar), and routing. | 1, 2, 20 | Tier 1 |
| 2 | **AI Chat** | Full chat experience: assistants, topics, message composition, streaming LLM responses, message blocks, multi-model, editing, regeneration, context management. | 4 | Tier 1 |
| 3 | **Provider & Model Management** | Provider CRUD, API key management, model listing/selection/pinning, token counting, OAuth flows, custom parameters. | 3 | Tier 1 |
| 4 | **Settings & Data** | All settings panels, backup/restore, data export/import, file management, cache management. | 5, 8, 9 | Tier 1 |
| 5 | **Knowledge & Tools** | Knowledge base (RAG), MCP server management, web search integration, memory system. | 6, 7, 15, 16 | Tier 2 |
| 6 | **Extended Apps** | Translation, image generation, notes, code workspace, mini apps, selection assistant, API server, trace/analytics. | 10, 11, 12, 13, 14, 17, 18, 19, 21 | Tier 3 |

**Pros:**
- Minimal planning overhead — only 6 specs to write
- Clear domain ownership, low cross-feature ambiguity
- Fastest path to "something works"

**Cons:**
- Feature 2 (AI Chat) and Feature 6 (Extended Apps) are too large to verify atomically
- Hard to parallelize work — each Feature is a multi-week effort
- Tier 2/3 Features bundle unrelated capabilities, making partial delivery awkward
- Difficult to estimate accurately

---

## Level 2: Standard (Module-level) — 12 Features ★ RECOMMENDED

Balanced scope. Each Feature is independently deliverable and verifiable in 1-3 days.

| # | Feature | Description | Covers Areas | Tier |
|---|---------|-------------|-------------|------|
| F-01 | **Electron Shell** | Main process bootstrap, BrowserWindow creation, macOS hidden titlebar with traffic lights, window controls (min/max/close), app lifecycle (startup, quit, tray), auto-update, zoom/fullscreen. | 1 | Tier 1 |
| F-02 | **Navigation & Layout** | Top tab bar with multi-session support ("+" new tab, DnD reorder, close), left sidebar (assistants/topics toggle), configurable layout mode (tabs vs sidebar), React Router integration. | 2 | Tier 1 |
| F-03 | **Theme & Appearance** | Dark/light/system theme switching, CSS variable-based theming with shadcn/ui, font settings, zoom factor persistence. Provides design tokens consumed by all other Features. | 1 (theme subset), 5 (display subset) | Tier 1 |
| F-04 | **Provider Management** | Provider CRUD (add, edit, delete, reorder), API key entry and validation, per-provider custom parameters, provider health check. 16+ provider type definitions. OAuth flows for Copilot/Anthropic. | 3 (provider subset) | Tier 1 |
| F-05 | **Model Management** | Model listing from provider APIs, model search/filter, pinning favorites, custom model definitions, default model selection, token counting configuration. | 3 (model subset) | Tier 1 |
| F-06 | **Chat Core** | Assistant management (create, edit, delete, emoji avatars), topic/conversation CRUD, message composition with toolbar, streaming LLM responses via Vercel AI SDK, message display (text, thinking, code blocks), message actions (copy, edit, regenerate, delete). | 4 (core subset) | Tier 1 |
| F-07 | **Chat Advanced** | Multi-model responses (horizontal/vertical/fold/grid), context count management, quick phrases, message block types (image, tool call, citation, error), file/image attachments in chat, message branching. | 4 (advanced subset) | Tier 2 |
| F-08 | **Settings System** | Unified settings UI with categorized panels (general, display, provider, model, data, shortcuts). Zustand-backed preferences with SQLite persistence. Proxy configuration, launch behavior, language selection. | 5 | Tier 1 |
| F-09 | **Data & Storage** | Unified SQLite schema for all persistent data (replaces Dexie + SQLite + Redux split). File upload/download/delete with metadata. Local backup/restore (ZIP). Data export/import. | 8, 9 (local subset) | Tier 1 |
| F-10 | **Knowledge Base** | Knowledge base CRUD, multi-source ingestion (files, URLs, notes, sitemaps, directories), vector search, embedding model selection, re-ranking, chunk configuration, processing status tracking. | 6 | Tier 2 |
| F-11 | **MCP Integration** | MCP server management (add, remove, restart, stop), tool listing and execution in chat, prompt/resource management, DXT file support, server logs, tool permission system. | 7 | Tier 2 |
| F-12 | **i18n** | i18next setup, language file loading, 11 language support, language switching in settings, interpolation and pluralization. | 20 | Tier 1 |

### Not in Core Scope (deferred to post-MVP)

These areas from the original app are explicitly excluded from Core and would become separate Features later:

- Web search integration (Area 15)
- Memory system (Area 16)
- Translation app (Area 10)
- Image generation / Paintings (Area 11)
- Notes editor (Area 12)
- Code workspace (Area 13)
- Mini apps (Area 14)
- Selection assistant (Area 17)
- API server (Area 18)
- Trace/analytics (Area 19)
- OpenClaw integration (Area 21)
- Cloud backup — WebDAV, S3, LAN transfer (Area 9 cloud subset)

**Pros:**
- Each Feature maps to a clear module boundary in code (directory, store slice, IPC namespace)
- Tier 1 Features (8 of 12) form a complete, usable AI chat app
- Features are small enough to verify independently but large enough to avoid excessive cross-feature coordination
- Natural dependency graph: Shell → Navigation → Theme → Settings → Provider → Model → Chat Core → Chat Advanced
- Stack migration boundaries are clean — each Feature fully owns its storage/state

**Cons:**
- 12 specs to write (moderate effort, but each is focused)
- Some cross-cutting concerns (e.g., i18n touches every Feature) need interface contracts early
- Chat Core vs Chat Advanced split requires careful boundary definition

### Dependency Graph (Tier 1)

```
F-01 Electron Shell
 └─► F-02 Navigation & Layout
      └─► F-03 Theme & Appearance
           └─► F-08 Settings System
                ├─► F-04 Provider Management
                │    └─► F-05 Model Management
                │         └─► F-06 Chat Core
                └─► F-09 Data & Storage (consumed by all above)

F-12 i18n (parallel — consumed by all UI Features)
```

---

## Level 3: Fine (Capability-level) — 21 Features

One Feature per distinct user-facing capability. Maximum granularity.

| # | Feature | Description | Covers Areas | Tier |
|---|---------|-------------|-------------|------|
| F-01 | **App Bootstrap** | Electron main process, app lifecycle, single-instance lock, tray icon, auto-update. | 1 (lifecycle) | Tier 1 |
| F-02 | **Window Management** | BrowserWindow creation, macOS hidden titlebar, traffic lights, min/max/close, fullscreen, zoom factor. | 1 (window) | Tier 1 |
| F-03 | **Tab System** | Top tab bar, new tab, close tab, DnD reorder, tab state persistence. | 2 (tabs) | Tier 1 |
| F-04 | **Sidebar & Routing** | Left sidebar with assistants/topics, layout mode toggle, React Router HashRouter, page routing. | 2 (sidebar/routing) | Tier 1 |
| F-05 | **Theme Engine** | Dark/light/system detection, CSS variable generation, shadcn/ui theme tokens. | 1 (theme) | Tier 1 |
| F-06 | **Provider CRUD** | Add, edit, delete, reorder providers. Provider type registry. Health check. | 3 (providers) | Tier 1 |
| F-07 | **API Key & Auth** | API key storage/validation per provider, OAuth flows (Copilot, Anthropic), secure credential storage. | 3 (auth) | Tier 1 |
| F-08 | **Model Registry** | Model listing from APIs, search/filter, pin favorites, custom model definitions, default selection. | 3 (models) | Tier 1 |
| F-09 | **Assistant Management** | Assistant CRUD, emoji avatars, system prompt editing, parameter presets, assistant import/export. | 4 (assistants) | Tier 1 |
| F-10 | **Topic Management** | Topic/conversation CRUD, topic listing, search, archive, auto-naming. | 4 (topics) | Tier 1 |
| F-11 | **Message Composer** | Rich input area, toolbar (8+ tools), file/image attachment, quick phrases, keyboard shortcuts. | 4 (input) | Tier 1 |
| F-12 | **LLM Streaming** | Vercel AI SDK integration, streaming response rendering, abort control, retry, error handling. | 4 (streaming) | Tier 1 |
| F-13 | **Message Display** | Message blocks (text, thinking, code, image), markdown rendering, syntax highlighting, message actions (copy, edit, regenerate, delete). | 4 (display) | Tier 1 |
| F-14 | **Multi-Model Chat** | Multi-model message dispatch, layout modes (horizontal/vertical/fold/grid), response comparison. | 4 (multi-model) | Tier 2 |
| F-15 | **Context Management** | Context window counting, message pruning, token budget controls. | 4 (context) | Tier 2 |
| F-16 | **Settings UI** | Categorized settings panels, form controls, settings navigation, reset to defaults. | 5 | Tier 1 |
| F-17 | **SQLite Data Layer** | Unified schema design, migrations, Zustand store hydration from SQLite, IPC data bridge. | 9 (storage) | Tier 1 |
| F-18 | **File Management** | File upload/download/delete, metadata tracking, image processing, PDF/document handling. | 8 | Tier 1 |
| F-19 | **Backup & Restore** | Local ZIP backup/restore, data export/import, cache cleanup. | 9 (backup) | Tier 2 |
| F-20 | **i18n Framework** | i18next setup, language files, switching, interpolation. | 20 | Tier 1 |
| F-21 | **Knowledge Base** | KB CRUD, multi-source ingestion, vector search, embedding config, re-ranking. | 6 | Tier 2 |

(MCP, web search, memory, translation, paintings, notes, code workspace, mini apps, selection assistant, API server, trace, OpenClaw — all deferred)

**Pros:**
- Maximum clarity — each Feature is a single, testable capability
- Easy to estimate (most are 0.5-2 days)
- Can parallelize aggressively across developers
- Verification is trivial — clear pass/fail per Feature
- Enables very precise prioritization

**Cons:**
- 21 specs to write and maintain — high overhead
- Heavy cross-feature dependencies (e.g., F-11 Composer depends on F-09, F-10, F-12, F-18)
- Integration testing becomes critical — individual Features may pass but composition may fail
- Risk of over-fragmentation: some "Features" (e.g., F-15 Context Management) are really just sub-components of chat
- Coordination cost grows quadratically with Feature count

---

## Recommendation: Level 2 (Standard) with Minor Adjustments

**Why Level 2:**

1. **Right-sized for spec writing** — 12 Features means 12 focused SDD documents, each manageable in a single session
2. **Clean module boundaries** — each Feature maps to a directory, a Zustand store slice, and an IPC namespace
3. **Stack migration is natural** — each Feature fully owns its UI (shadcn/ui), state (Zustand), and persistence (SQLite)
4. **Tier 1 delivers a complete app** — 8 Features give you: launch → see tabs → configure provider → pick model → chat with LLM → manage settings → persist data → switch language
5. **Tier 2 adds depth without blocking MVP** — Knowledge Base and MCP are high-value but not essential for first usable build

**Suggested build order for Tier 1:**

```
Phase 1: Foundation     F-01 Shell → F-09 Data & Storage → F-12 i18n
Phase 2: Chrome         F-02 Navigation → F-03 Theme → F-08 Settings
Phase 3: AI Core        F-04 Providers → F-05 Models → F-06 Chat Core
```

**One optional tweak:** If the team feels Chat Core (F-06) is still too large, split it into:
- F-06a: Assistants & Topics (management)
- F-06b: Message Composition & Streaming (the actual chat)

This would bring the count to 13, still well within the Standard range.
