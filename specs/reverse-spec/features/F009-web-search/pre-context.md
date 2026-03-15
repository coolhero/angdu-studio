# F009 - web-search: Pre-Context

> Web search providers, search result integration into chat
> Tier 3, RG-6 | Dependencies: F001, F004

---

## 1. Runtime Exploration Results

| Observation | Detail |
|---|---|
| WebSearchService (568 lines) | Renderer-side service managing web search lifecycle |
| Search flow | search() → provider search → fetch web contents → compress results → inject into chat |
| Provider abstraction | WebSearchEngineProvider handles multiple search backends |
| Abort support | Per-request AbortController with requestId tracking |
| KB integration | Uses KnowledgeService (F006) for RAG-based result compression |
| Compression modes | Two compression strategies: searchBase (RAG) and cutoff (token slicing) |
| Result processing | fetchWebContents extracts page content, consolidateReferencesByUrl deduplicates |
| Status tracking | WebSearchStatus tracked in runtime store, UI updates reactively |
| Web search state | Dedicated websearch store with compression config |
| Settings UI | WebSearchSettings page for provider configuration |
| Token management | sliceByTokens (tokenx) for result truncation within context limits |
| Search base | Creates temporary KB for search result embedding and querying |

## 2. Source Reference

| File Path (Cherry Studio) | Role | Rebuild Target |
|---|---|---|
| src/renderer/src/services/WebSearchService.ts (568 lines) | Web search orchestration: search, compress, inject | [TBD] |
| src/renderer/src/providers/WebSearchProvider.ts | Web search provider abstraction | [TBD] |
| src/renderer/src/store/websearch.ts | Web search state (compression config) | [TBD] |
| src/renderer/src/store/runtime.ts (setWebSearchStatus) | Runtime status for web search | [TBD] |
| src/renderer/src/pages/settings/WebSearchSettings/ | Search provider settings UI | [TBD] |
| src/renderer/src/utils/fetch.ts (fetchWebContents) | Web content fetching utility | [TBD] |
| src/renderer/src/utils/websearch.ts | Web search utilities (consolidateReferencesByUrl, selectReferences) | [TBD] |
| src/renderer/src/utils/extract.ts | Content extraction from web pages | [TBD] |
| src/renderer/src/config/constant.ts (DEFAULT_WEBSEARCH_RAG_DOCUMENT_COUNT) | Default config constants | [TBD] |

## 3. Source Behavior Inventory (SBI)

| ID | Behavior | Source Location |
|---|---|---|
| B276 | Check if web search is enabled for provider | WebSearchService.isWebSearchEnabled |
| B277 | Check if overwrite mode is enabled | WebSearchService.isOverwriteEnabled |
| B278 | Get web search provider by ID | WebSearchService.getWebSearchProvider |
| B279 | Execute web search via provider | WebSearchService.search |
| B280 | Validate search provider connectivity | WebSearchService.checkSearch |
| B281 | Create abort signal for search request | WebSearchService.createAbortSignal |
| B282 | Track web search status per request | setWebSearchStatus in runtime store |
| B283 | Create temporary search base for RAG compression | WebSearchService.ensureSearchBase |
| B284 | Clean up temporary search base after use | WebSearchService.cleanupSearchBase |
| B285 | Query search base for relevant results | WebSearchService.querySearchBase |
| B286 | Compress results using RAG search base | WebSearchService.compressWithSearchBase |
| B287 | Compress results using token cutoff | WebSearchService.compressWithCutoff |
| B288 | Full web search processing pipeline | WebSearchService.processWebsearch |
| B289 | Fetch and extract web page contents | fetchWebContents utility |
| B290 | Consolidate and deduplicate search references | consolidateReferencesByUrl, selectReferences |

## 4. UI Component Features

| Component | Feature |
|---|---|
| WebSearchSettings | Provider configuration: API keys, search engine selection, result count |
| Search status indicator | Shows search progress in chat (searching → fetching → compressing → done) |
| Search results in chat | Inline references with source URLs displayed in chat messages |

## 5. Interaction Behavior Inventory

| Interaction | Behavior |
|---|---|
| Enable web search | Toggle in chat or settings, enables search for subsequent messages |
| Send message with search | Message triggers web search → results compressed → injected as context |
| Cancel search | Abort signal cancels in-progress search |
| Configure provider | Settings page: select provider, enter API key, set result count |
| View references | Click reference links in chat to open source URLs |

## 6. Foundation Decisions

| Decision | Choice | Rationale |
|---|---|---|
| State management | Zustand (replacing Redux) | New stack decision |
| Search provider pattern | Keep provider abstraction | Clean separation, extensible |
| RAG compression | Depends on F006 KB search | Uses knowledge base for result ranking |
| Content extraction | Keep fetch + extract pipeline | Standard web scraping approach |

## 7. Foundation Dependencies

| Dependency | Feature | What is needed |
|---|---|---|
| F001 (shell) | IPC for network requests | Proxy/network configuration from main process |
| F004 (provider-engine) | Search provider API access | API key management, provider configuration |
| F006 (knowledge-memory) | RAG compression of search results | KB search API for result reranking (optional, enhances quality) |

## 8. Naming Remapping

| Cherry Studio | Angdu Studio |
|---|---|
| CherryStudio web search references | AngduStudio web search references |
| CS-specific search provider names | AS-specific search provider names |

## 9. Static Resources

| Resource | Location | Notes |
|---|---|---|
| (none) | Web search is stateless | Temporary search bases cleaned up after use |

## 10. Environment Variables

| Variable | Purpose | Notes |
|---|---|---|
| (none specific to F009) | API keys stored in provider config | Managed through settings UI |

## 11. Feature Contracts

### Provided Contracts (F009 provides to others)

| Contract | Consumer | Description |
|---|---|---|
| Web search results | F005 (chat-core) | Search results injected as context into chat messages |
| Search status | F005 (chat-core) | WebSearchStatus for UI progress indication |

### Required Contracts (F009 requires from others)

| Contract | Provider | Description |
|---|---|---|
| IPC/network | F001 (shell) | Network access and proxy configuration |
| Provider config | F004 (provider-engine) | API key and provider settings |
| KB search (optional) | F006 (knowledge-memory) | RAG-based compression of search results |

## 12. For /speckit.specify

- Web search must support multiple provider backends (pluggable)
- Search results must be compressed to fit within context window limits
- Two compression strategies needed: RAG-based (requires F006) and token cutoff (standalone)
- Per-request abort support is required
- Search status must be trackable for UI progress display
- Temporary search bases must be cleaned up to prevent storage leaks
- Provider validation (checkSearch) must verify API key and connectivity

## 13. For /speckit.plan

- Phase 1: Web search provider abstraction (interface + first provider)
- Phase 2: WebSearchService core (search, fetch, extract)
- Phase 3: Compression strategies (cutoff first, RAG later with F006)
- Phase 4: Zustand store for web search state
- Phase 5: Settings UI for provider configuration
- Phase 6: Integration with chat-core (context injection)
- Phase 7: RAG compression integration (after F006 is available)

## 14. For /speckit.analyze

- WebSearchService is renderer-side (568 lines) — consider whether search orchestration should move to main process for better network control
- RAG compression creates dependency on F006 (knowledge-memory) — but cutoff mode works standalone
- fetchWebContents is a shared utility — may be useful for other features
- Provider abstraction (WebSearchEngineProvider) is separate from the main provider engine (F004) — different concern
- Status tracking uses runtime store (setWebSearchStatus) — small, focused state
- tokenx library used for token counting/slicing — evaluate if this is the right tokenizer for Angdu
- Abort support pattern (per-request AbortController map) is clean and reusable
- Temporary KB creation for each search is expensive — consider caching or lighter-weight approach
