# Pre-Context: Auxiliary Features

**Feature ID**: F010-auxiliary-features
**Tier**: Tier 3
**Generated**: 2026-03-04

---

## Source Reference

**Source Root**: `/Users/coolhero/Study/oss/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/pages/translate/` | Translation UI (source/target language, history) |
| `src/renderer/src/pages/paintings/` | Image generation UI (prompt, settings, gallery) |
| `src/renderer/src/pages/apps/` | Mini apps management (enable/disable/pin) |
| `src/main/services/SelectionService.ts` | Selection assistant (text selection -> AI action) |
| `src/main/services/ApiServerService.ts` | Embedded API server lifecycle management |
| `src/main/apiServer/` | Express server (24 endpoints, OpenAI/Anthropic-compatible) |
| `src/main/services/OcrService.ts` | OCR with multiple provider support |
| `src/main/services/OpenClawService.ts` | OpenClaw gateway management (install, start, stop) |
| `src/main/services/OvmsManager.ts` | OVMS local model management |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **translation with multiple provider support, image generation (paintings) with multiple providers and action variants (textToImage, imageToImage, upscale, inpaint), mini apps management (enable/disable/pin), web search provider configuration (12-field entity), OCR with multiple providers, selection assistant (text selection -> AI action), OpenClaw gateway management (install/start/stop), OVMS local model management, embedded API server (Express, 24 endpoints, OpenAI/Anthropic-compatible), Export to Word**
- Do not reference: Ant Design components in translation/painting/mini-app UIs (migrating to shadcn/ui + Radix), styled-components styling (migrating to Tailwind), Redux state slices for auxiliary features (migrating to Zustand)
- **Extract**: Translation prompt templates and language pair logic, painting action variant dispatching (textToImage/imageToImage/upscale/inpaint), mini app registry and lifecycle (enable/disable/pin), web search provider configuration and query execution, OCR provider abstraction, selection assistant event pipeline (text selection -> model invocation -> result display), OpenClaw binary management (download/install/start/stop), OVMS model download and runtime management, Express API server route definitions (24 endpoints), OpenAI-compatible and Anthropic-compatible response formatting, Export to Word document generation
- **Ignore**: Redux slices for translate/painting/apps state, Ant Design Form/Table/List/Modal/Gallery components, styled-components wrappers

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| (none) | | | Auxiliary features have no static resources requiring copying |

### Environment Variables

> Environment variables required by this Feature at runtime.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| (none specific to F010) | | | | |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `CSLOGGER_MAIN_LEVEL` | F001-core-platform | Log level for main process auxiliary services |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F010-auxiliary-features bundles several supplementary capabilities: translation with multiple AI provider support, image generation (paintings) with multiple providers and action variants (textToImage, imageToImage, upscale, inpaint), mini apps management (enable/disable/pin), web search provider configuration, OCR with multiple providers, selection assistant (text selection triggers AI action via system-level selection monitoring), OpenClaw gateway management (install/start/stop for local AI model serving), OVMS local model management, an embedded Express API server with 24 endpoints providing OpenAI-compatible and Anthropic-compatible interfaces, and Export to Word. These features enhance the application but are not essential for core AI chat functionality.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Translation | User translates text between languages using configurable AI providers |
| P1 | Image generation | User generates images via prompt with multiple providers; supports textToImage, imageToImage, upscale, inpaint actions |
| P2 | Mini apps | User enables, disables, and pins mini applications within the app |
| P2 | Web search | User configures web search providers for augmenting chat with real-time results |
| P2 | OCR | User extracts text from images using configurable OCR providers |
| P2 | Embedded API server | External clients access AI through OpenAI/Anthropic-compatible REST endpoints (24 endpoints) |
| P3 | Selection assistant | User selects text anywhere on screen; system offers AI actions on the selection |
| P3 | OpenClaw gateway | User installs, starts, and stops the OpenClaw local AI model serving gateway |
| P3 | OVMS local models | User manages local model downloads and runtime via OVMS |
| P3 | Export to Word | User exports chat conversations or content to Word document format |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Translation with multiple provider support
- **FR-002**: Image generation (paintings) with multiple providers
- **FR-003**: Mini apps management (enable/disable/pin)
- **FR-004**: Web search provider configuration
- **FR-005**: OCR with multiple provider support
- **FR-006**: Selection assistant (text selection -> AI action)
- **FR-007**: OpenClaw gateway management (install, start, stop)
- **FR-008**: OVMS local model management
- **FR-009**: Embedded API server (OpenAI/Anthropic-compatible, 24 endpoints)
- **FR-010**: Export to Word

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: Translation produces correct output for supported language pairs via configured provider
- **SC-002**: Image generation creates images from prompts using configured provider; all 4 action types work
- **SC-003**: Mini apps can be enabled, disabled, and pinned; state persists across restarts
- **SC-004**: Web search returns results from configured provider and injects into chat context
- **SC-005**: OCR extracts text from images with reasonable accuracy via configured provider
- **SC-006**: Selection assistant detects text selection and presents AI action options within 500ms
- **SC-007**: Embedded API server responds correctly to OpenAI-compatible and Anthropic-compatible requests
- **SC-008**: Export to Word generates valid .docx files from chat content

### Edge Cases

- Translation of very long text exceeding provider token limits; chunking or truncation strategy
- Image generation with invalid prompt or unsupported dimensions; graceful error with provider-specific guidance
- Mini app configuration corruption; graceful reset to defaults
- Web search provider API key expired; clear error message with re-configuration prompt
- OCR on very large images; memory management and timeout handling
- Selection assistant on non-text content; graceful no-op
- OpenClaw gateway port conflict; detection and alternative port suggestion
- OVMS model download interruption; resume or restart capability
- API server port already in use; error handling and port conflict resolution
- Concurrent API server requests exceeding capacity; queuing or rate limiting
- Export to Word with very long conversations; pagination or size limits

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-core-platform | Infrastructure | Uses IPC framework for all auxiliary services, file system access, config persistence |
| F002-provider-management | Entity | Uses Provider and Model entities for translation, painting, OCR provider selection |
| F003-ai-core-engine | API | Uses aiCore RuntimeExecutor for translation and painting AI completions |

### Related Entities (data-model.md draft)

#### Owned Entities

**WebSearchProvider** (12 fields) -- Refer to E19 in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | PK | Unique provider identifier |
| name | string | required | Display name |
| apiKey | string | required | API authentication key |
| baseUrl | string | optional | Custom API base URL |
| engines | string[] | optional | Search engine identifiers |
| contentLimit | number | optional | Max content length per result |
| count | number | optional | Number of results to return |
| enabled | boolean | required | Whether provider is active |
| customHeaders | Record<string, string> | optional | Custom HTTP headers |
| excludeDomains | string[] | optional | Domains to exclude |
| filterMode | string | optional | Content filter mode |
| filterList | string[] | optional | Content filter patterns |

**Painting / PaintingAction** -- Refer to E20 in entity-registry.md

Painting variants: textToImage, imageToImage, upscale, inpaint

**TranslateHistory** -- Refer to E21 in entity-registry.md

Records past translation operations (source text, target text, languages, model, provider, timestamp).

**TranslateLanguage** -- Refer to E21 in entity-registry.md

Defines available language options (code, name, nativeName).

**QuickPhrase** -- Note: QuickPhrase is owned by F005-ai-chat (E09) but managed through auxiliary features UI.

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F002-provider-management | Read access | Provider selection for translation, painting, OCR |
| Model | F002-provider-management | Read access | Model selection for AI-powered auxiliary features |
| Message | F005-ai-chat | Read access | Export to Word reads chat messages |
| Topic | F005-ai-chat | Read access | Export to Word reads conversation topics |
| FileMetadata | F001-core-platform | Write | Generated images stored as file metadata |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| IPC | `selection:*` (17 channels) | Selection assistant management |
| IPC | `openclaw:*` (17 channels) | OpenClaw gateway management |
| IPC | `trace:*` (13 channels) | Trace/OCR operations |
| IPC | `ovms:*` (8 channels) | OVMS local model management |
| REST | `POST /v1/chat/completions` | OpenAI-compatible chat endpoint |
| REST | `POST /v1/messages` | Anthropic-compatible messages endpoint |
| REST | ~22 additional endpoints | Models, embeddings, health, etc. |
| Zustand | `useTranslateStore` | Translation state management |
| Zustand | `usePaintingStore` | Painting state management |
| Hook | `useApps()` | Mini apps management hook |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `app:*` | F001-core-platform | App info, platform detection, process management |
| IPC | `file:*` | F001-core-platform | File system access for generated images, OCR input |
| IPC | `config:*` | F001-core-platform | Config persistence for auxiliary feature settings |
| aiCore | RuntimeExecutor | F003-ai-core-engine | LLM streaming/generation for translation, painting |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Auxiliary features span both main process services (SelectionService, ApiServerService, OcrService, OpenClawService, OvmsManager) and renderer-side UI pages (translate, paintings, apps). The main process services are framework-agnostic Node.js code. The renderer pages use Ant Design components and Redux state slices. The embedded API server uses Express with 24 route handlers.
- **Recommended implementation approach**: Keep ALL main process services intact (framework-agnostic). Replace Ant Design components in translate/painting/apps UI with shadcn/ui equivalents. Replace Redux slices (translate, painting, apps) with Zustand stores. Replace styled-components with Tailwind. Express API server transfers directly (no framework dependency).
- **Caveats**: This feature is a bundle of loosely coupled sub-features. Consider implementing them incrementally rather than all at once. The embedded API server (Express) is completely framework-agnostic and transfers without modification. Selection assistant requires platform-specific native integration that transfers directly.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Web search in chat | F005-ai-chat | Verify web search results integrate correctly into chat context |
| Provider selection | F002-provider-management | Verify translation/painting/OCR correctly resolve providers from F002 |
| AI execution | F003-ai-core-engine | Verify translation and painting use F003's RuntimeExecutor correctly |
| File storage | F001-core-platform | Verify generated images are stored correctly via F001's file service |
| Export to Word | F005-ai-chat | Verify Export to Word correctly reads messages and topics from F005 |
| Backup inclusion | F007-backup-sync | Verify auxiliary feature data (translate history, paintings, web search config) included in backup |
| Selection assistant | F001-core-platform | Verify selection assistant IPC channels registered in F001 |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F005-ai-chat | Context format | If web search result format changes, chat context injection must adapt |
| F005-ai-chat | Selection flow | If selection assistant protocol changes, chat's selection handling must adapt |
| External clients | API contract | If embedded API server endpoints change, external clients must adapt |
| F008-settings-ui | Config schema | If auxiliary feature settings schemas change, settings pages must update |
