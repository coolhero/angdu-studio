# Angdu Studio — Roadmap

> Rebuild of Cherry Studio (AI-powered productivity assistant desktop application).
> Scope: Core | Stack: New (see stack-migration.md)

---

## 1. Project Overview

| Attribute | Value |
|-----------|-------|
| Original Project | Cherry Studio |
| New Name | Angdu Studio |
| Domain | AI-powered productivity assistant desktop application |
| Source | `/Users/coolhero/Develop/cherry-studio` |
| Scale | ~500+ TypeScript files, ~20 major entities, 26+ REST + 280+ IPC endpoints |
| Feature Count | 12 (Standard granularity) |
| Release Groups | 4 |
| Demo Groups | 4 |

---

## 2. Tech Stack

| Area | Technology | Version |
|------|-----------|---------|
| Language | TypeScript | 5.x |
| Runtime | Electron | latest |
| UI Framework | React | 19 |
| UI Components | shadcn/ui + Tailwind CSS 4 | latest |
| State Management | Zustand + persist | latest |
| Client DB | Dexie 4 (IndexedDB) | 4.x |
| Server DB | Drizzle ORM + LibSQL | latest |
| Editor | TipTap 3 | 3.x |
| AI SDK | Vercel AI SDK | latest |
| Build | electron-vite + SWC | latest |
| Testing | Vitest + Playwright | latest |
| i18n | i18next | latest |

---

## 3. Feature Inventory

### Tier 1 — Essential

| ID | Feature | Description |
|----|---------|-------------|
| F001 | app-core | App shell, window management, config, theme, tray, shortcuts, system info. All Features depend on it. |
| F002 | ai-provider | Multi-provider AI SDK (Vercel AI), model resolution, plugins, middleware pipeline. 8 Features depend on AI capabilities. |
| F003 | chat | Conversation management, topics, message creation/streaming, assistants. Primary user-facing Feature. |
| F004 | editor | TipTap rich text, CodeMirror, markdown rendering, mermaid diagrams. Required for chat rendering. |

### Tier 2 — Recommended

| ID | Feature | Description |
|----|---------|-------------|
| F005 | auth | OAuth flows (Anthropic, Copilot, AngduIN), credential management. Required for provider access. |
| F006 | mcp | MCP server lifecycle, built-in servers (browser, filesystem, python), tool execution, resources. Key differentiator. |
| F007 | knowledge | Knowledge base, RAG pipeline, embeddings, reranking, preprocessing. Major feature. |
| F008 | file-management | File storage, upload/download, export/import, backup/sync (WebDAV, S3, local). Multiple Features reference it. |
| F009 | settings-ui | Settings pages, provider config, translation, web search config. Required for practical usage. |

### Tier 3 — Optional

| ID | Feature | Description |
|----|---------|-------------|
| F010 | agent | Claude Code agent system, sessions, tool permissions, plugins. Independent module. |
| F011 | memory | Long-term vector memory, search, context injection. Loosely coupled. |
| F012 | extensions | Mini apps, selection assistant, notes, API server, LAN transfer, paintings, OpenClaw. All optional. |

---

## 4. Dependency Graph

```
F001-app-core
 ├── F002-ai-provider
 │    ├── F003-chat ← also depends on F004
 │    ├── F006-mcp
 │    ├── F007-knowledge ← also depends on F008
 │    ├── F009-settings-ui
 │    ├── F010-agent ← also depends on F003, F005, F006
 │    ├── F011-memory ← also depends on F003
 │    └── F012-extensions ← also depends on F003
 ├── F004-editor
 ├── F005-auth
 └── F008-file-management
```

### Dependency Matrix

| Feature | Depends On | Depended On By |
|---------|-----------|----------------|
| F001-app-core | — | All |
| F002-ai-provider | F001 | F003, F006, F007, F009, F010, F011, F012 |
| F003-chat | F001, F002, F004 | F010, F011, F012 |
| F004-editor | F001 | F003 |
| F005-auth | F001 | F002, F010 |
| F006-mcp | F001, F002 | F010 |
| F007-knowledge | F001, F002, F008 | — |
| F008-file-management | F001 | F007 |
| F009-settings-ui | F001, F002 | — |
| F010-agent | F001, F002, F003, F005, F006 | — |
| F011-memory | F001, F002, F003 | — |
| F012-extensions | F001, F002, F003 | — |

---

## 5. Cross-Feature Entity Dependencies

| Entity | Owner | Referencing Features |
|--------|-------|---------------------|
| Message / MessageBlock | F003-chat | F004-editor, F007-knowledge, F011-memory, F012-extensions |
| Assistant | F003-chat | F002-ai-provider, F007-knowledge, F009-settings-ui |
| Model / Provider | F002-ai-provider | F003-chat, F007-knowledge, F010-agent, F011-memory |
| FileMetadata | F008-file-management | F003-chat, F007-knowledge |
| KnowledgeBase | F007-knowledge | F003-chat |
| MCPServer | F006-mcp | F003-chat, F010-agent |
| Agent / Session | F010-agent | F003-chat |
| Topic | F003-chat | F004-editor, F012-extensions |
| ConfigKeys | F001-app-core | All Features |

---

## 6. Cross-Feature API Dependencies

| API | Provider | Consumers | Purpose |
|-----|----------|-----------|---------|
| IPC: `config:get/set` | F001-app-core | All | Configuration access |
| IPC: `file:*` | F008-file-management | F003, F007, F012 | File operations |
| IPC: `mcp:*` | F006-mcp | F003, F010 | Tool execution |
| IPC: `knowledge-base:*` | F007-knowledge | F003 | Knowledge search |
| IPC: `memory:*` | F011-memory | F003 | Memory context |
| REST: `/v1/chat/completions` | F002-ai-provider | F012 (API server) | Chat completions |

---

## 7. Release Plan

### Release 1 — Foundation

| Feature | Tier | Rationale |
|---------|------|-----------|
| F001-app-core | T1 | Base dependency for everything; app shell, config, theme, window management |
| F004-editor | T1 | No AI dependency; required by F003 in next release |

**Exit Criteria:** Electron app launches with working shell, config persistence, theme switching, and TipTap editor rendering markdown and code blocks.

---

### Release 2 — Core AI

| Feature | Tier | Rationale |
|---------|------|-----------|
| F002-ai-provider | T1 | Unlocks all AI-dependent Features |
| F003-chat | T1 | Primary user-facing Feature; depends on F001, F002, F004 (all available) |

**Exit Criteria:** User can configure an AI provider, create an assistant, open a conversation, and receive streamed AI responses rendered in the editor.

---

### Release 3 — Ecosystem

| Feature | Tier | Rationale |
|---------|------|-----------|
| F005-auth | T2 | Enables OAuth provider access; prerequisite for F010 |
| F006-mcp | T2 | MCP tool execution; prerequisite for F010 |
| F008-file-management | T2 | File storage/export; prerequisite for F007 |
| F009-settings-ui | T2 | Settings and provider configuration UI |

**Exit Criteria:** OAuth login works, MCP servers can be started and tools invoked, files can be uploaded/exported/backed up, and all settings are configurable through the UI.

---

### Release 4 — Advanced

| Feature | Tier | Rationale |
|---------|------|-----------|
| F007-knowledge | T2 | RAG pipeline; depends on F002, F008 (both available) |
| F010-agent | T3 | Agent system; depends on F002, F003, F005, F006 (all available) |
| F011-memory | T3 | Long-term memory; depends on F002, F003 (both available) |
| F012-extensions | T3 | Optional apps and utilities; depends on F002, F003 (both available) |

**Exit Criteria:** Knowledge bases with RAG search work, agent sessions execute tools with permissions, memory persists across conversations, and extension mini-apps function.

---

## 8. Demo Groups

### DG-01: Basic AI Chat

| Attribute | Value |
|-----------|-------|
| Features | F001, F002, F003, F004 |
| Available After | Release 2 |
| Scenario | User configures an AI provider, creates an assistant, opens a chat, and receives a streamed response rendered with rich text and code highlighting. |

### DG-02: Knowledge-Augmented Chat

| Attribute | Value |
|-----------|-------|
| Features | F002, F003, F007, F008, F011 |
| Available After | Release 4 |
| Scenario | User creates a knowledge base, uploads documents, asks questions, and receives answers augmented with RAG context and long-term memory. |

### DG-03: Agent Execution

| Attribute | Value |
|-----------|-------|
| Features | F002, F003, F005, F006, F010 |
| Available After | Release 4 |
| Scenario | User creates an agent with tool permissions, starts a session, and the agent autonomously executes MCP tools to complete a task. |

### DG-04: Data Portability

| Attribute | Value |
|-----------|-------|
| Features | F001, F005, F008, F009 |
| Available After | Release 3 |
| Scenario | User backs up data to WebDAV/S3, restores from backup, and exports conversations in multiple formats. |

---

## 9. Topological Build Order

The following is the full topological sort across all releases, respecting dependency constraints:

```
1.  F001-app-core          (Release 1 — no dependencies)
2.  F004-editor             (Release 1 — depends on F001)
3.  F002-ai-provider        (Release 2 — depends on F001)
4.  F003-chat               (Release 2 — depends on F001, F002, F004)
5.  F005-auth               (Release 3 — depends on F001)
6.  F006-mcp                (Release 3 — depends on F001, F002)
7.  F008-file-management    (Release 3 — depends on F001)
8.  F009-settings-ui        (Release 3 — depends on F001, F002)
9.  F007-knowledge          (Release 4 — depends on F001, F002, F008)
10. F011-memory             (Release 4 — depends on F001, F002, F003)
11. F012-extensions         (Release 4 — depends on F001, F002, F003)
12. F010-agent              (Release 4 — depends on F001, F002, F003, F005, F006)
```

---

## 10. Risk Notes

| Risk | Impact | Mitigation |
|------|--------|------------|
| Vercel AI SDK breaking changes | Blocks F002 and all downstream | Pin version; abstract behind internal interface |
| TipTap 3 stability (pre-release) | Blocks F004, F003 rendering | Maintain fallback markdown renderer; monitor release notes |
| MCP protocol evolution | Breaks F006, F010 tool execution | Abstract MCP client; version-lock protocol schema |
| shadcn/ui + Tailwind CSS 4 migration effort | Slows all UI work | Build component library incrementally in F001 |
| Dexie 4 + Drizzle dual-DB complexity | Data sync issues across client/server | Define clear ownership boundaries per entity |
| OAuth provider changes (Anthropic, Copilot) | Breaks F005 auth flows | Abstract OAuth behind provider-agnostic interface |
