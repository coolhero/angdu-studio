# F009-web-search — Pre-Context

> Angdu Studio reverse-spec | Rebuilt from Cherry Studio
> Feature: Web Search Provider Integration
> Tier: 2 (Recommended) | Demo Group: D2-Enhance
> Dependencies: F004-ai-core, F006-chat

---

## Feature Overview

Web search integration that augments AI chat with real-time information from the internet. Supports multiple search providers (Tavily, Exa, Google, Bing, Searxng, local search, etc.). Configurable per-assistant or globally. Search results are injected into the conversation context. Includes domain exclusion, result count limits, content length caps, and time-filtered search.

---

## Runtime Exploration Results

From `runtime-exploration.md`:

- **Settings location**: Settings sidebar > Features group > "Web Search"
- **Chat integration**: Input toolbar includes a web search toggle button (one of 8 toolbar actions)
- **Message status**: Messages show `SEARCHING` status during web search augmentation
- **Assistant config**: Per-assistant `enableWebSearch` toggle

---

## Source Reference

| Layer | Cherry Studio Path | Purpose |
|-------|-------------------|---------|
| Provider implementations | `src/renderer/src/providers/WebSearchProvider/` | Per-provider search adapters |
| Store | `src/renderer/src/store/websearch.ts` | Redux slice (web search state) |
| Service | `src/renderer/src/services/WebSearchService.ts` | Search orchestration |
| Hooks | `src/renderer/src/hooks/useWebSearchProviders.ts` | React hooks for provider UI |

---

## Spec Backlog Items (SBI)

| ID | Title | Priority | Description |
|----|-------|----------|-------------|
| B200 | Web search provider configuration UI | P1 | Settings page for configuring search providers with API keys and hosts. |
| B201 | Multi-provider support (Tavily, Exa, Google, Bing, Searxng) | P1 | Implement adapter pattern for multiple search provider APIs. |
| B202 | Search result injection into chat context | P1 | Inject search results into conversation before AI completion. Triggered by assistant setting or manual toggle. |
| B203 | Per-assistant web search toggle | P1 | Enable/disable web search per assistant. Override via global setting. |
| B204 | Domain exclusion list | P2 | Configure domains to exclude from search results. |
| B205 | Result count and content length limits | P2 | Configure maxResults and contentMaxLength per search. |
| B206 | Time-filtered search | P3 | Option to filter search results by recency. |
| B207 | Search status in message pipeline | P2 | Show SEARCHING status on messages during web search phase. |
| B208 | Global override for assistant-level web search | P3 | Global setting to override per-assistant web search config. |

---

## Business Rules

No dedicated BR entries for F009 in business-logic-map.md. Web search operates as a plugin in the AI completion pipeline (BR-002) and triggers the SEARCHING message status (BR-009).

---

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| (none detected) | Search providers configured via settings UI, API keys stored in WebSearchState | — |

---

## For /speckit.specify

- **Entities**: WebSearchProvider, WebSearchState (see entity-registry.md)
- **Business rules**: Operates within BR-002 (plugin pipeline) and BR-009 (stream chunk protocol)
- **Key screens**: Settings > Web Search (provider config), Chat input toolbar (search toggle)
- **Cross-feature**: Search results injected into F006-chat message pipeline as a plugin

## For /speckit.plan

- **Migration impact**: Low UI, Low state (see stack-migration.md)
- **UI migration**: Small settings form, AntD -> shadcn/ui
- **State migration**: `websearch` Redux slice -> part of `useSettingsStore` or dedicated small store
- **Dependencies**: Requires F004-ai-core for plugin pipeline integration
- **Zustand store**: Web search state may merge into `useSettingsStore` or standalone `useWebSearchStore`

---

## Feature Contracts

### Provides to Other Features

| Contract | Consumer | Description |
|----------|----------|-------------|
| Web search plugin | F004-ai-core | Plugin injected into completion pipeline via buildPlugins() |
| Search results | F006-chat | Results displayed in message context |

### Consumes from Other Features

| Contract | Provider | Description |
|----------|----------|-------------|
| Plugin pipeline | F004-ai-core | Web search registered as composable plugin |
| Assistant.enableWebSearch | F005-assistant | Per-assistant web search toggle |
| Message status protocol | F006-chat | SEARCHING status during search phase |
