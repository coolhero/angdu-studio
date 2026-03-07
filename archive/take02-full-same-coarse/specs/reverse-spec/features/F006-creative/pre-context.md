# Pre-Context: Creative Tools

**Feature ID**: F006
**Tier**: Tier 3
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` → `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/pages/paintings/PaintingsRoutePage.tsx` | Paintings routing |
| `src/renderer/src/pages/paintings/` | All painting pages by provider |
| `src/renderer/src/store/paintings.ts` | Paintings Redux slice |
| `src/renderer/src/pages/translate/TranslatePage.tsx` | Translation UI |
| `src/renderer/src/services/TranslateService.ts` | Translation service |
| `src/renderer/src/store/translate.ts` | Translation Redux slice |
| `src/renderer/src/types/index.ts` | Painting types (Painting, GeneratePainting, etc.) |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [Same Stack] Implementation Reference
- Actively reference and reuse existing implementation patterns
- **Key reference points**: Provider-specific painting page pattern, translation service with language detection, Redux slice patterns for creative tools
- **Reusable code**:
  - `src/renderer/src/pages/paintings/PaintingsRoutePage.tsx:PaintingsRoutePage` — Provider-based routing pattern for image generation pages
  - `src/renderer/src/store/paintings.ts` — Paintings state management with per-provider configuration and generation history
  - `src/renderer/src/services/TranslateService.ts:TranslateService` — Translation service with auto-language detection (franc, AI-based) and history management
  - `src/renderer/src/store/translate.ts` — Translation state with history, favorites, and custom language support
  - `src/renderer/src/types/index.ts` — Painting type definitions (Painting, GeneratePainting, and 8 provider-specific variants)

### Static Resources

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| `src/renderer/src/assets/images/paintings/` | Image | `src/renderer/src/assets/images/paintings/` | 7 aspect ratio SVG icons used in painting configuration UI |

### Environment Variables

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| `RENDERER_VITE_PPIO_APP_SECRET` | secret | No | PPIO OAuth app secret for PPIO image generation provider | — |

**Shared variables** (defined by other Features but also used here):

None

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

The Creative Tools feature provides AI-powered image generation (paintings) across 8+ providers and a full-featured translation tool. The paintings module supports multiple generation modes (generate, edit, remix, scale) with provider-specific configuration pages. The translation module offers bidirectional translation with automatic language detection, translation history with favorites, and custom language management.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Image generation | User selects a provider (SiliconFlow, DMXAPI, TokenFlux, ZhiPu, AiHubMix, OpenAI, OVMS, PPIO), configures parameters (size, aspect ratio, prompt), and generates AI images |
| P1 | Translation | User enters text, selects source/target languages (or uses auto-detect), and receives translated output |
| P2 | Painting modes | User switches between generation modes (generate, edit, remix, scale) depending on provider capabilities |
| P2 | Translation history | User browses previous translations, stars favorites, and searches through translation history |
| P3 | Custom languages | User adds or manages custom language pairs for translation |
| P3 | Language swap | User swaps source and target languages bidirectionally with a single click |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: AI image generation across SiliconFlow, DMXAPI, TokenFlux, ZhiPu, AiHubMix, OpenAI, OVMS, PPIO
- **FR-002**: Multiple painting modes (generate, edit, remix, scale) per provider
- **FR-003**: Translation with auto-language detection (franc, AI-based)
- **FR-004**: Translation history with star/favorite and search
- **FR-005**: Custom language management for translation
- **FR-006**: Bidirectional language pair auto-swap

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: Image generation returns at least one result for each supported provider
- **SC-002**: Translation produces output for text up to 5MB
- **SC-003**: Language detection correctly identifies source language >=80% of the time

### Edge Cases

- Provider API rate limiting or quota exhaustion during image generation
- Large image results exceeding available memory
- Translation of extremely long text requiring chunking
- Language detection failure for mixed-language or very short text inputs
- Provider-specific parameter validation (e.g., aspect ratios, image sizes differ per provider)
- PPIO OAuth token refresh when session expires during generation
- Unsupported language pairs for specific translation backends

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-platform | IPC infrastructure | Uses Electron IPC for file saving (generated images) and system integration |
| F001-platform | File system | Uses file system APIs to save generated images to disk |
| F002-ai-foundation | Provider/Model | References Provider and Model entities for AI image generation and translation backend selection |

### Related Entities (data-model.md draft)

#### Owned Entities

**Painting** (8 variants) — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | required, unique | Painting record identifier |
| provider | string | required | Provider identifier (siliconflow, dmxapi, tokenflux, zhipu, aihubmix, openai, ovms, ppio) |
| prompt | string | required | Text prompt for image generation |
| negativePrompt | string | optional | Negative prompt to exclude elements |
| mode | string | required | Generation mode (generate, edit, remix, scale) |
| width | number | optional | Image width in pixels |
| height | number | optional | Image height in pixels |
| aspectRatio | string | optional | Aspect ratio selection |
| result | string | optional | Generated image URL or path |
| status | string | required | Generation status |
| createdAt | string | required | Creation timestamp |

**TranslateHistory** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | required, unique | History entry identifier |
| sourceText | string | required | Original text |
| translatedText | string | required | Translated output |
| sourceLang | string | required | Source language code |
| targetLang | string | required | Target language code |
| starred | boolean | optional, default false | Whether this entry is favorited |
| createdAt | string | required | Creation timestamp |

**CustomTranslateLanguage** — Refer to the corresponding section in entity-registry.md

| Field Name | Type | Constraints | Description |
|------------|------|------------|-------------|
| id | string | required, unique | Custom language identifier |
| code | string | required | Language code |
| name | string | required | Display name |

#### Referenced Entities (owned by other Features)

| Entity | Owner Feature | Reference Type | Purpose |
|--------|--------------|----------------|---------|
| Provider | F002-ai-foundation | Read access | Determines which AI providers are available for image generation |
| Model | F002-ai-foundation | Read access | Determines which models are available for each provider |
| FileMetadata | F001-platform | Write access | Saves generated images as managed files |

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| IPC | paintings:generate | Generate image with specified provider and parameters |
| IPC | paintings:getHistory | Retrieve painting generation history |
| IPC | translate:execute | Translate text between languages |
| IPC | translate:detectLanguage | Auto-detect source language |
| IPC | translate:getHistory | Retrieve translation history |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | provider:getConfig | F002-ai-foundation | Retrieve provider API keys and configuration for image generation requests |
| IPC | model:list | F002-ai-foundation | List available models for selected provider |
| IPC | file:save | F001-platform | Save generated images to disk |

### Technical Decisions

#### [Same Stack]
- **Recommended reuse patterns**: Provider-specific painting page component pattern with shared base configuration; translation service with pluggable language detection backends; Redux slice pattern with history and favorites
- **Existing libraries**: franc — Language detection library; provider-specific SDKs for image generation APIs
- **Existing architecture decisions**: Each painting provider gets its own page component with provider-specific parameters; translation supports both local (franc) and AI-based language detection; painting types use a union type pattern with 8 provider-specific variants

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Provider entity compatibility | F002-ai-foundation | Verify that painting provider identifiers match Provider entity values in F002 |
| Model entity compatibility | F002-ai-foundation | Verify that model references for image generation align with Model entity schema in F002 |
| File save integration | F001-platform | Verify that generated image file saving uses the same file management patterns as F001 |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F002-ai-foundation | Provider reference impact | If new painting providers are added, F002's provider registry may need corresponding entries |
| F005-data-mgmt | Data format impact | If painting or translation history data format changes, F005's backup serialization must stay compatible |
