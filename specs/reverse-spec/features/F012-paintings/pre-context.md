# F012-paintings Pre-Context

> Feature: Image Generation (Paintings)
> Ring: RG-4 | Tier: T3
> Generated: 2026-03-08

---

## 1. Feature Overview and Purpose

The Paintings feature provides AI-powered image generation and editing within the desktop app. It supports multiple image generation providers through a provider-routed architecture where each provider has its own page component with provider-specific configurations. All provider pages share common UI patterns: a left settings panel (provider/model/parameter selection), a central artboard for viewing generated images, a prompt input area with translate button, and a right-side gallery strip for managing multiple paintings.

Key capabilities:
- Text-to-image generation with configurable model, size, quality, and other parameters
- Image editing mode (upload source images + prompt for modifications)
- Image remix (style transfer with image weight control) -- Aihubmix, PPIO
- Image upscale (super-resolution) -- Aihubmix
- Provider selector with dynamic URL routing per provider
- Image gallery management (create, select, delete, drag-and-drop reorder)
- Prompt input with translate-to-English button (+ triple-space shortcut)
- Generated image viewer with navigation for multi-image results
- Provider-specific configuration forms (static configs and dynamic JSON schema forms)
- Download and cache generated images locally via `FileManager`
- OVMS local model management (start/stop server, add models)
- PPIO async task tracking (polling for generation status)

## 2. Key Source Files and Their Roles

### Route and Provider Pages

| File | Role |
|------|------|
| `src/renderer/src/pages/paintings/PaintingsRoutePage.tsx` | Route dispatcher (~73 lines). Maps URL paths to provider-specific page components via `react-router-dom` `Routes`/`Route`. Manages provider options list: static `BASE_OPTIONS` (`['zhipu', 'aihubmix', 'silicon', 'dmxapi', 'tokenflux', 'ovms', 'ppio']`) plus dynamic new-api providers. Checks OVMS running status. Dispatches `setDefaultPaintingProvider` and `updateTab` on route change. |
| `NewApiPage.tsx` | Generic OpenAI-compatible image generation page (~865 lines). Most complete implementation. Supports generate + edit modes via `Segmented`. Makes direct `fetch` API calls to `{apiHost}/v1/images/generations` and `{apiHost}/v1/images/edits`. Handles model selection (grouped by `group`), image size, quality, moderation, background, n-images. Supports base64 and URL response formats. |
| `ZhipuPage.tsx` | Zhipu provider page. Uses `ZhipuConfig` for model/size/style options. |
| `AihubmixPage.tsx` | Aihubmix provider page. Supports 4 modes: generate, remix, edit, upscale. Uses `aihubmixConfig` with JSON schema for `DynamicFormRender`. |
| `SiliconPage.tsx` | SiliconFlow provider page. |
| `DmxapiPage.tsx` | DMXAPI provider page. Uses `DmxapiConfig`. |
| `TokenFluxPage.tsx` | TokenFlux provider page. Uses `TokenFluxService` for API calls. |
| `OvmsPage.tsx` | OVMS (OpenVINO Model Server) provider page. Manages local model lifecycle via `window.api.ovms.*`. |
| `PpioPage.tsx` | PPIO provider page. Supports draw + edit modes with async task polling via `PpioService`. |

### Shared Components

| File | Role |
|------|------|
| `components/Artboard.tsx` | Central image display area (~210 lines). Shows generated image via `ImageViewer` with navigation arrows for multi-image results (`prev`/`next` buttons), loading overlay with `Spin` + cancel button, retry button for failed URL downloads, image placeholder for empty state. Image constrained to `--artboard-max: calc(100vh - 256px)`. |
| `components/PaintingsList.tsx` | Right-side gallery strip (~157 lines). Shows 80x80px thumbnail grid of paintings with `DraggableList` for drag-and-drop reordering, "new painting" button (dashed border), delete with `Popconfirm`. Container width: 100px with border-left. |
| `components/ProviderSelect.tsx` | Provider dropdown selector (~101 lines). antd `Select` with custom `labelRender` and `optionRender` showing provider logos via `ProviderAvatarPrimitive`. Loads custom logos from `ImageStorage`. |
| `components/DynamicFormRender.tsx` | Dynamic form renderer (~218 lines) for JSON-schema-driven configuration. Renders field types: string (text input, enum select, textarea for prompts, image URL+upload combo), number/integer (InputNumber with min/max), integer seed (with random generate button), boolean (Switch). |
| `components/ImageUploader.tsx` | Multi-image upload component (~203 lines) for edit modes. antd `Upload` with `listType="picture-card"`. Supports replace-on-click, delete individual images with `Popconfirm`, add more images up to a max count. |

### Configuration

| File | Role |
|------|------|
| `config/NewApiConfig.ts` | Model definitions for new-api: `MODELS` array with `{ name, imageSizes, quality, moderation, background, max_images }`. `SUPPORTED_MODELS` list. `DEFAULT_PAINTING` template with empty defaults. |
| `config/ZhipuConfig.ts` | Zhipu-specific model/size/style configurations. |
| `config/DmxapiConfig.ts` | DMXAPI-specific configurations. |
| `config/aihubmixConfig.tsx` | Aihubmix configurations with JSON schema definitions for dynamic forms per mode. |
| `config/ovmsConfig.tsx` | OVMS configurations. |
| `config/ppioConfig.tsx` | PPIO configurations. |
| `config/tokenFluxConfig.ts` | TokenFlux configurations. |
| `config/constants.ts` | Shared constants (image sizes, aspect ratios, defaults). |

### Utilities and Services

| File | Role |
|------|------|
| `utils/index.ts` | `checkProviderEnabled()` -- validates provider is enabled before generation. |
| `utils/PpioService.ts` | PPIO-specific API service for async task management. |
| `utils/TokenFluxService.ts` | TokenFlux-specific API service. |

### Store

| File | Role |
|------|------|
| `store/paintings.ts` | Redux Toolkit slice (~97 lines). CRUD operations: `addPainting`, `removePainting`, `updatePainting`, `updatePaintings`. All operations are namespaced by `keyof PaintingsState` (e.g., `'openai_image_generate'`, `'zhipu_paintings'`). Uses `@ts-ignore` for array type compatibility. |
| `store/settings.ts` | Contains `defaultPaintingProvider: PaintingProvider` setting. |
| `store/runtime.ts` | Contains `generating: boolean` flag for generation-in-progress state. |

### Hooks

| File | Role |
|------|------|
| `hooks/usePaintings.ts` | Accessor hook for paintings state. Provides typed access to each provider's paintings arrays + `addPainting()`, `removePainting()`, `updatePainting()`, `updatePaintings()` dispatchers. |
| `hooks/useRuntime.ts` | Provides `generating` boolean. |
| `hooks/useSettings.ts` | Provides `autoTranslateWithSpace` setting. |
| `hooks/useProvider.ts` | `useAllProviders()` for provider list. |

## 3. Data Models and State

### Core Types

```typescript
type PaintingProvider = 'zhipu' | 'aihubmix' | 'silicon' | 'dmxapi'
                      | 'new-api' | 'ovms' | 'cherryin' | 'ppio'

type PaintingParams = {
  id: string
  urls: string[]           // Generated image URLs (from API response)
  files: FileMetadata[]    // Locally cached image files
  providerId?: string      // Provider that generated this painting
}

interface Painting extends PaintingParams {
  model?: string
  prompt?: string
  negativePrompt?: string
  imageSize?: string
  numImages?: number
  seed?: string
  steps?: number
  guidanceScale?: number
  promptEnhancement?: boolean
}

// Provider-specific variants (all extend PaintingParams):
interface GeneratePainting extends PaintingParams {
  model: string; prompt: string; aspectRatio?; numImages?; styleType?;
  seed?; negativePrompt?; quality?; moderation?; n?; size?; background?;
  personGeneration?; width?; height?; imageSize?; ...
}
interface EditPainting extends PaintingParams { ... }
interface RemixPainting extends PaintingParams { ... }
interface ScalePainting extends PaintingParams { ... }
interface DmxapiPainting extends PaintingParams { ... }
interface TokenFluxPainting extends PaintingParams { ... }
interface OvmsPainting extends PaintingParams { ... }
interface PpioPainting extends PaintingParams { ... }

// Union type used by provider pages:
type PaintingAction = Partial<all-painting-types> & PaintingParams
```

### PaintingsState (Redux slice)

```typescript
interface PaintingsState {
  siliconflow_paintings: Painting[]
  dmxapi_paintings: DmxapiPainting[]
  tokenflux_paintings: TokenFluxPainting[]
  zhipu_paintings: Painting[]
  aihubmix_image_generate: (Partial<GeneratePainting> & PaintingParams)[]
  aihubmix_image_remix: (Partial<RemixPainting> & PaintingParams)[]
  aihubmix_image_edit: (Partial<EditPainting> & PaintingParams)[]
  aihubmix_image_upscale: (Partial<ScalePainting> & PaintingParams)[]
  openai_image_generate: (Partial<GeneratePainting> & PaintingParams)[]
  openai_image_edit: (Partial<EditPainting> & PaintingParams)[]
  ovms_paintings: OvmsPainting[]
  ppio_draw: PpioPainting[]
  ppio_edit: PpioPainting[]
}
```

### Settings (Redux store/settings.ts)

- `defaultPaintingProvider: PaintingProvider` -- last selected provider, used for route redirect

### Runtime (Redux store/runtime.ts)

- `generating: boolean` -- whether image generation is in progress (shared across providers)

### Storage Architecture

- Generated images are cached locally as files managed by `FileManager.addFiles()` / `FileManager.deleteFiles()`.
- Image file references (`FileMetadata[]`) are stored in painting objects in Redux (persisted).
- Image URLs from API responses stored in `urls[]` for retry capability.
- No Dexie usage in paintings (all state in Redux).
- `FileManager.getFileUrl(file)` generates display URLs for cached images.

## 4. Component/Service Architecture

```
PaintingsRoutePage (router)
  |-- Routes:
       /zhipu        -> ZhipuPage
       /aihubmix     -> AihubmixPage
       /silicon      -> SiliconPage
       /dmxapi       -> DmxapiPage
       /tokenflux    -> TokenFluxPage
       /ovms         -> OvmsPage
       /ppio         -> PpioPage
       /new-api      -> NewApiPage
       /:providerId  -> NewApiPage (dynamic new-api providers)
       *             -> NewApiPage (fallback)

Each provider page follows this 3-column layout:

  Provider Page (e.g., NewApiPage ~865 LOC)
  |-- Navbar (title + optional "New" button on macOS)
  |-- ContentContainer (flex row)
  |     |-- LeftContainer (scrollable settings panel, max-width: --assistants-width)
  |     |     |-- ProviderSelect (provider dropdown with logos)
  |     |     |-- Mode selector (Segmented: generate/edit, if applicable)
  |     |     |-- ImageUploader (edit mode only)
  |     |     |-- Model selector (Select, grouped by model.group)
  |     |     |-- Image size selector (Select)
  |     |     |-- Quality selector (Select)
  |     |     |-- Moderation selector (Select, generate only)
  |     |     |-- Background selector (Select, edit only)
  |     |     |-- Number of images (InputNumber)
  |     |     |-- DynamicFormRender (for schema-driven providers)
  |     |-- MainContainer (center, flex column)
  |     |     |-- ModeSegmented (generate/edit toggle, centered)
  |     |     |-- Artboard (image display with navigation)
  |     |     |-- InputContainer (prompt + toolbar)
  |     |           |-- TextArea (prompt, borderless)
  |     |           |-- Toolbar
  |     |                 |-- TranslateButton
  |     |                 |-- SendMessageButton (generate trigger)
  |     |-- PaintingsList (right gallery strip, 100px wide)
  |           |-- NewPaintingButton (80x80, dashed border)
  |           |-- DraggableList of Canvas items (80x80 thumbnails)

Services:
  AiProvider(provider).getApiKey() --> API key for auth
  Direct fetch() calls to provider APIs (not centralized)
  FileManager.addFiles() / deleteFiles() / getFileUrl() --> local image cache
  TranslateService.translateText() --> prompt translation to English

Store:
  store/paintings.ts (Redux: namespaced arrays of PaintingAction)
  store/settings.ts (Redux: defaultPaintingProvider)
  store/runtime.ts (Redux: generating flag)

Routing:
  react-router-dom Routes/Route with useParams/useNavigate/useLocation
  URL pattern: /paintings/{providerId}
  Tab state synced via store/tabs.ts updateTab()
```

### Data Flow

1. **Provider selection**: User selects provider in dropdown -> `navigate('../{providerId}')` -> URL changes -> `PaintingsRoutePage` renders correct page component -> `setDefaultPaintingProvider` dispatched.
2. **Configuration**: User selects model, size, quality, etc. -> local state updates -> `updatePainting(mode, painting)` persists to Redux.
3. **Generation** (NewApiPage flow):
   - Confirms regeneration if existing images.
   - Deletes existing files via `FileManager.deleteFiles()`.
   - Constructs API request (JSON body for generate, FormData for edit).
   - Calls `fetch()` with `Authorization: Bearer ${apiKey}`.
   - Parses response: `data[].url` (download) or `data[].b64_json` (save base64).
   - Downloads URLs via `window.api.file.download()`.
   - Saves base64 via `window.api.file.saveBase64Image()`.
   - Adds files via `FileManager.addFiles()`.
   - Updates painting state with file references.
4. **Prompt translation**: `translateText(prompt, LanguagesEnum.enUS)` translates prompt to English.
   - Triple-space shortcut: 3 spaces within 200ms triggers translation.
5. **Gallery management**: Add/select/delete paintings, drag-and-drop reorder via `DraggableList` -> `updatePaintings()`.

## 5. Dependencies on Other Features

| Dependency | Usage |
|------------|-------|
| **F001-app-core** | `window.api.file.download()`, `window.api.file.saveBase64Image()`, `window.api.ovms.*` (getStatus, getModels, runOVMS, stopOVMS, addModel, etc.) |
| **F002-ai-provider** | `AiProvider` class for API key access (`getApiKey()`), `useAllProviders()` for provider list, provider configuration (apiHost, models), `isNewApiProvider()` utility |
| **F004-settings-data** | Redux store, `useSettings().autoTranslateWithSpace`, provider settings, `store/tabs.ts` for tab sync |
| **F005-chat-ui** | Shared components: `Navbar`, `Scrollbar`, `ImageViewer`, `TranslateButton`, `SendMessageButton`, `DraggableList`, `ProviderAvatar`/`ProviderAvatarPrimitive`, `Selector` |
| **F011-translate** | `TranslateService.translateText()` for prompt translation to English |

### External Libraries

- `antd` -- Select, InputNumber, Button, Segmented, Upload, TextArea, Popconfirm, Empty, Avatar, Spin, Tooltip, Input, Switch
- `styled-components` -- all styling
- `react-router-dom` -- route-based provider switching (Routes, Route, useParams, useNavigate, useLocation)
- `lucide-react` -- icons
- `react-i18next` -- internationalization
- `@ant-design/icons` -- PlusOutlined, DeleteOutlined, CloseOutlined, LinkOutlined, RedoOutlined, UploadOutlined

## 6. Migration Notes

### Redux Toolkit to Zustand

- `store/paintings.ts` is a simple CRUD slice with namespaced arrays -- straightforward Zustand conversion.
- The namespace pattern (`state[namespace]`) with `keyof PaintingsState` requires careful typing in Zustand. Consider using a `Map<string, PaintingAction[]>` or explicit accessor methods.
- `usePaintings` hook wraps Redux dispatchers -- replace with Zustand hook.
- `store/settings.ts` field `defaultPaintingProvider` and `store/runtime.ts` field `generating` need to be part of appropriate Zustand stores.
- `store/tabs.ts` `updateTab()` for tab path sync needs consideration.

### Ant Design to shadcn/ui + TailwindCSS 4

| antd Component | Usage | shadcn/ui Target |
|----------------|-------|------------------|
| `Select` (+ OptGroup) | Model, size, quality, moderation selectors | `Select` with grouped options |
| `InputNumber` | Steps, seed, dimensions, n-images | `Input` (type=number) or custom |
| `Button` | Generate, delete, upload, retry, cancel | `Button` |
| `Segmented` | Mode switcher (generate/edit) | `Tabs` / `ToggleGroup` |
| `Upload` (`listType="picture-card"`) | Image upload for edit mode | Custom file upload component |
| `TextArea` | Prompt input | shadcn `Textarea` |
| `Popconfirm` | Delete confirmation | `AlertDialog` |
| `Empty` | No model / no image state | Custom empty state |
| `Avatar` | Provider logo | `Avatar` |
| `Spin` | Loading overlay | Custom spinner |
| `Tooltip` | Parameter tooltips | `Tooltip` |
| `Switch` | Boolean parameters in DynamicFormRender | `Switch` |

### styled-components to Tailwind

- Every file uses `styled-components`.
- 3-column layout with `max-width: var(--assistants-width)` for left panel.
- Artboard sizing with CSS custom property `--artboard-max`.
- Hover-reveal patterns (delete button on gallery items, float button opacity).
- Theme-dependent image inversion (`filter: invert(100%)` for dark mode).

### Provider Architecture

- Each provider has its own page component (8 files). This is a deliberate design: different APIs require different request construction.
- Many provider pages share ~70% similar structure. Consider extracting a shared `PaintingPageLayout` component.
- Provider-specific configs (`*Config.ts`) can remain as-is.
- `DynamicFormRender` already handles schema-driven forms generically -- good candidate for reuse.
- Direct `fetch` API calls in provider pages are not centralized. Consider creating a `PaintingApiService` that each provider page configures.

### Identity Remapping

| Original | Target | Location |
|----------|--------|----------|
| `'cherryin'` in `PaintingProvider` type | Remove or rename to `'angduin'` | `types/index.ts` |
| `cherryin` route | Remove or rename | `PaintingsRoutePage.tsx` |
| `cherry_painting_models_v3.json` URL | Update or remove | DMXAPI config |
| `cherry-studio` in docs URL | Update to Angdu Studio | NewApiPage.tsx |

### Key Considerations

- Each provider page is a semi-independent module; can be migrated incrementally.
- The `NewApiPage` is the most generic and serves as the template for new providers.
- `PaintingAction` type is `Partial<all-painting-types> & PaintingParams` -- very loosely typed. Consider tightening per-provider types.
- `FileManager` integration for local image caching remains unchanged.
- The route-based provider switching via `react-router-dom` is a clean pattern to preserve.
- `autoTranslateWithSpace` feature (triple-space triggers prompt translation) is shared with chat settings.

## 7. Complexity Assessment

**Overall: HIGH**

| Dimension | Rating | Notes |
|-----------|--------|-------|
| Component count | Very High | 8 provider pages + 5 shared components + route page + 7 config files + 3 utils |
| State complexity | Medium | Redux slice is simple CRUD, but state is namespaced across 13 provider/mode keys |
| Provider diversity | High | 8+ providers with different APIs, request formats, response formats, and modes |
| UI complexity | Medium | 3-column layout is consistent; per-provider config panels vary; DynamicFormRender adds flexibility |
| Migration effort | High | Many antd components, styled-components, per-provider pages to update |
| Lines of code | ~4000+ | NewApiPage ~865, each provider page ~400-800, shared components ~900, configs ~500 |
| API integration | High | Direct HTTP calls, different response formats (URL vs base64), FormData vs JSON, async polling (PPIO) |

### Risk Areas

- Provider-specific API call patterns are not centralized -- each page makes its own `fetch` calls with different auth, body format, and response parsing
- The `PaintingAction` type is a loose union via `Partial<>` -- runtime errors possible with wrong fields
- Image download/caching has multiple failure modes (URL access, proxy requirements, base64 encoding)
- The `cherryin` provider type needs identity remapping throughout types and routing
- File upload handling differs between providers (some use FormData, some base64, some URL reference)
- OVMS integration requires local binary management and server lifecycle
- PPIO requires async task polling with status tracking
- Testing is difficult due to provider API key requirements

---

## 8. Source Behavior Inventory

| ID | Behavior | Priority | Notes |
|----|----------|----------|-------|
| B226 | Generate image from text prompt (text-to-image) | P1 | Core feature across all providers |
| B227 | Edit image with prompt (image-to-image, inpainting) | P2 | NewApi, Aihubmix, PPIO edit modes |
| B228 | Remix image (style transfer with image weight) | P2 | Aihubmix, PPIO |
| B229 | Upscale/super-resolve image | P3 | Aihubmix only |
| B230 | Multi-provider support (8+ providers) | P1 | Route-based provider switching |
| B231 | Dynamic form rendering per provider config | P1 | DynamicFormRender with JSON schema |
| B232 | Image gallery with thumbnails and drag-reorder | P1 | PaintingsList with DraggableList |
| B233 | Image preview on artboard with multi-image navigation | P1 | Artboard with prev/next buttons |
| B234 | Prompt input with translate-to-English button | P1 | TranslateButton + triple-space shortcut |
| B235 | Image size/aspect ratio/quality configuration | P2 | Provider-dependent option sets |
| B236 | Generation parameters (steps, guidance scale, seed, n) | P2 | Advanced params per provider/model |
| B237 | Download and cache generated images locally | P1 | FileManager integration |
| B238 | Image upload for edit mode | P2 | ImageUploader component |
| B239 | OVMS local model management | P3 | Start/stop server, add models |
| B240 | PPIO async task tracking | P3 | Polling for generation status |
| B241 | Retry failed image downloads | P2 | Retry button in Artboard |
| B242 | Provider logo display in selector | P2 | System + custom logos |

---

## 9. Key Scenarios

| SC-ID | Scenario | Behaviors |
|-------|----------|-----------|
| SC-120 | User generates an image from a text prompt | B226, B230, B234, B237 |
| SC-121 | User configures provider-specific parameters | B231, B235, B236 |
| SC-122 | User edits an image with inpainting | B227, B238 |
| SC-123 | User browses and manages image gallery | B232, B233 |
| SC-124 | User switches between providers | B230, B242 |
| SC-125 | User remixes an image with style transfer | B228 |
| SC-126 | User upscales an image | B229 |
| SC-127 | User runs local OVMS model for generation | B239 |
| SC-128 | User tracks PPIO async generation task | B240 |
| SC-129 | User retries failed image download | B241 |
| SC-130 | User translates prompt to English before generating | B234 |

---

## 10. Cross-Feature Verification

| Check | Features | Status |
|-------|----------|--------|
| Provider config for painting providers | F012 <-> F002-ai-provider | API keys, apiHost, model lists |
| OVMS shared with OCR (OVOCR) | F012 <-> F011-translate | OvmsManager serves both |
| Prompt translate button uses TranslateService | F012 <-> F011-translate | `translateText()` dependency |
| `cherryin` -> `angduin` rename needed | F012 | Provider ID, route, display name, type |
| `cherry_painting_models_v3.json` URL | F012 | DMXAPI external endpoint needs update |
| `cherry-studio` docs URL in NewApiPage | F012 | External link needs update |
| Redux paintings slice migration | F012 | Simple CRUD to Zustand |
| Per-provider PaintingsState structure | F012 | 13 namespaced arrays in state |
| FileManager integration | F012 <-> F001-app-core | addFiles, deleteFiles, getFileUrl |
| Image storage in user data directory | F012 <-> F001-app-core | File system access |
| autoTranslateWithSpace setting | F012 <-> F004-settings-data | Shared setting from settings store |
| Tab sync on provider change | F012 <-> F001-app-core | store/tabs.ts updateTab |
