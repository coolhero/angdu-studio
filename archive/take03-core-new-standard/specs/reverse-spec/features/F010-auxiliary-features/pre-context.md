# Pre-Context: Auxiliary Features

**Feature ID**: F010
**Tier**: Tier 3
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| **Translation** | |
| `src/renderer/src/pages/translate/` | Translation UI pages |
| `src/renderer/src/services/TranslateService.ts` | Translation orchestration service |
| `src/renderer/src/store/translate.ts` | Translation state slice |
| **Paintings** | |
| `src/renderer/src/pages/paintings/` | Image generation UI pages (all) |
| `src/renderer/src/store/paintings.ts` | Paintings state slice |
| `src/renderer/src/hooks/usePaintings.ts` | Paintings hook |
| **Mini Apps** | |
| `src/renderer/src/pages/minapps/` | Mini apps management pages (all) |
| `src/renderer/src/store/minapps.ts` | Mini apps state slice |
| **Web Search** | |
| `src/renderer/src/providers/WebSearchProvider/` | Web search provider implementations (all) |
| `src/renderer/src/store/websearch.ts` | Web search state slice |
| **OCR** | |
| `src/renderer/src/store/ocr.ts` | OCR state slice |
| `src/main/services/ocr/` | OCR services (main process) |
| **File Management** | |
| `src/renderer/src/pages/files/` | File browsing UI |
| `src/renderer/src/services/FileManager.ts` | File management service |
| `src/renderer/src/services/FileAction.ts` | File action handlers |
| **API Server** | |
| `src/main/apiServer/` | Express API server (all routes, services, middleware) |
| **Code Tools** | |
| `src/renderer/src/pages/code/` | Code tools UI |
| `src/renderer/src/store/codeTools.ts` | Code tools state slice |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Extract: Translation service logic and history management, multi-provider image generation pipeline, mini app registration and lifecycle, web search provider abstraction and result compression, OCR processing pipeline, file browsing and action logic, REST API route contracts and auth middleware (OpenAI/Anthropic compatible), code tool definitions
- Ignore: Redux slices for translate/paintings/minapps/websearch/ocr/codeTools (migrating to Zustand), Ant Design UI components across all sub-features (migrating to shadcn/ui + Radix), styled-components styling (migrating to Tailwind)

### Static Resources

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| `src/renderer/src/assets/images/` (model logos ~145) | Image | `src/renderer/src/assets/images/` | Model provider logos |
| `src/renderer/src/assets/images/` (provider logos ~80) | Image | `src/renderer/src/assets/images/` | Provider brand logos |
| `src/renderer/src/assets/images/` (app logos ~53) | Image | `src/renderer/src/assets/images/` | Mini app logos |
| `src/renderer/src/assets/images/` (search icons ~9) | Image | `src/renderer/src/assets/images/` | Web search provider icons |
| `src/renderer/src/assets/images/` (paintings icons ~7) | Image | `src/renderer/src/assets/images/` | Image generation style icons |
| `src/renderer/src/assets/images/` (OCR icons ~2) | Image | `src/renderer/src/assets/images/` | OCR provider icons |

### Environment Variables

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| `RENDERER_VITE_PPIO_APP_SECRET` | secret | No | PPIO app secret for image generation | -- |
| `RENDERER_VITE_AIHUBMIX_SECRET` | secret | No | AihubMix OAuth AES decryption secret | -- |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

Auxiliary Features is an umbrella feature covering multiple peripheral capabilities: (1) Translation with multi-provider support and history tracking; (2) Multi-provider image generation (paintings) with style variants; (3) Mini app management for built-in and custom browser-based tools; (4) Web search with provider abstraction and result compression for context injection; (5) OCR for text extraction from images; (6) File browsing and management; (7) REST API server exposing OpenAI and Anthropic-compatible endpoints for external tool integration; (8) Code tools for development utilities.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Translation | User translates text between languages using AI; history is saved for reference |
| P1 | Image Generation | User generates images via multiple providers (DALL-E, Stable Diffusion, etc.) with style options |
| P1 | Web Search | AI chat augments responses with web search results compressed for context |
| P2 | Mini Apps | User browses and uses built-in mini applications (browser tools, utilities) |
| P2 | API Server | User starts REST API server; external tools call OpenAI/Anthropic-compatible endpoints |
| P2 | File Management | User browses and manages files within the app |
| P3 | OCR | User extracts text from images using OCR providers |
| P3 | Code Tools | User accesses code-related development utilities |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Implement translation service with multi-provider support and translation history
- **FR-002**: Implement custom translation language management
- **FR-003**: Implement multi-provider image generation with style variants (paintings)
- **FR-004**: Implement mini app management (built-in apps, custom app registration, launch)
- **FR-005**: Implement web search provider abstraction with result compression
- **FR-006**: Implement OCR text extraction from images
- **FR-007**: Implement file browsing and action handlers
- **FR-008**: Implement REST API server with OpenAI-compatible chat completions endpoint
- **FR-009**: Implement REST API server with Anthropic-compatible messages endpoint
- **FR-010**: Implement API server authentication middleware (Bearer/API key)
- **FR-011**: Implement code tools utilities

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: Translation produces correct output and saves to history
- **SC-002**: Image generation returns rendered images for all supported providers
- **SC-003**: Web search results are compressed and injected into chat context correctly
- **SC-004**: API server starts and accepts requests within 3 seconds
- **SC-005**: API authentication rejects invalid keys with timing-safe comparison
- **SC-006**: Mini apps launch in embedded browser with correct isolation

### Edge Cases

- Translation with unsupported language pair (graceful fallback)
- Image generation provider rate limit or timeout
- Web search provider returning empty or malformed results
- API server port already in use at startup
- Concurrent API requests exceeding server capacity
- OCR with low-quality or rotated images
- Mini app with broken URL or inaccessible resource
- Large file listing performance in file browser

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | IPC, File | File operations, app lifecycle, IPC channels |
| F002-provider-management | Provider config | Translation, image generation, web search, and OCR use provider credentials |
| F003-ai-core-engine | AI pipeline | Translation and web search delegate to AI completion pipeline |

### Related Entities (data-model.md draft)

#### Owned Entities

**WebSearchProvider** -- Refer to the corresponding section in entity-registry.md

**TranslateHistory** -- Refer to the corresponding section in entity-registry.md

**CustomTranslateLanguage** -- Refer to the corresponding section in entity-registry.md

**MinAppType** -- Refer to the corresponding section in entity-registry.md

**Painting variants** -- Refer to the corresponding section in entity-registry.md

**TranslateState** -- Refer to the corresponding section in entity-registry.md

**PaintingsState** -- Refer to the corresponding section in entity-registry.md

**MinAppsState** -- Refer to the corresponding section in entity-registry.md

**WebSearchState** -- Refer to the corresponding section in entity-registry.md

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F002-provider-management | Read access | Provider credentials for translation, image gen, web search |
| Model | F002-provider-management | Read access | Model selection for translation and image generation |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| REST | `POST /v1/chat/completions` | OpenAI-compatible chat completions (for external clients) |
| REST | `POST /v1/messages` | Anthropic-compatible messages API |
| REST | `GET /v1/models` | Model listing |
| IPC | `translate:*` | Translation CRUD and history |
| IPC | `paintings:*` | Image generation operations |
| IPC | `minapps:*` | Mini app management |
| IPC | `ocr:*` | OCR operations |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Each sub-feature has its own Redux slice, service layer, and Ant Design UI pages. The API server is Express-based in the main process. Web search providers use a strategy pattern.
- **Recommended implementation approach**: Replace all Redux slices with individual Zustand stores. Replace Ant Design UI with shadcn/ui components. Keep Express API server logic in main process (framework-agnostic). Keep web search provider abstraction. Core translation, image generation, and OCR logic is largely framework-agnostic.
- **Caveats**: The API server routes reference the AI completion pipeline; ensure the API server correctly delegates to the new pipeline implementation. Static resource logos (~300 images) should be copied as-is.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| AI pipeline delegation | F003-ai-core-engine | Verify translation and API server correctly delegate to AI completion pipeline |
| Provider resolution | F002-provider-management | Verify all sub-features correctly resolve provider credentials |
| Web search injection | F005-ai-chat | Verify web search results are correctly injected into chat context |
| Backup inclusion | F007-backup-sync | Verify translation history and mini app configs are included in backup |
| MCP proxy | F006-mcp-integration | Verify API server MCP endpoints route correctly to MCP service |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F005-ai-chat | Context injection | If web search result format changes, chat context injection must adapt |
| F003-ai-core-engine | Image routing | If image generation pipeline changes, AI core routing is affected |
| F007-backup-sync | Data format | If translation history or mini app format changes, backup must handle it |
