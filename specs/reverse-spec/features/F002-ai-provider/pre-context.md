# Pre-Context: AI Provider

**Feature ID**: F002-ai-provider
**Tier**: Tier 1
**Generated**: 2026-03-07

---

## Source Reference

**Source Root**: `/Users/coolhero/Develop/cherry-studio`

> All file paths below are **relative to Source Root**. The actual Source Root value is stored in `sdd-state.md` -> `Source Path` field and resolved at runtime by smart-sdd.

### Related Original File List

| File Path | Role |
|-----------|------|
| `packages/aiCore/src/` | Main AI core package directory |
| `packages/aiCore/src/core/runtime/executor.ts` | Core execution engine (RuntimeExecutor) |
| `packages/aiCore/src/core/runtime/pluginEngine.ts` | Plugin engine with hook lifecycle |
| `packages/aiCore/src/core/providers/` | Provider factory and registry (15+ providers) |
| `packages/aiCore/src/core/plugins/` | Built-in plugins (toolUse, webSearch, google, logging) |
| `packages/aiCore/src/core/middleware/` | Middleware chain composition |
| `packages/aiCore/src/core/models/` | Model resolver |
| `packages/aiCore/src/core/options/` | Per-provider options factory |
| `packages/ai-sdk-provider/src/` | Custom Vercel AI SDK provider implementations |
| `src/renderer/src/aiCore/` | Renderer-side AI integration layer |
| `src/renderer/src/aiCore/provider/` | Provider configurations |
| `src/renderer/src/config/models/` | Model configuration definitions |
| `src/renderer/src/config/registry/` | Provider registry |
| `src/main/services/VertexAIService.ts` | Google Vertex AI service (main process) |
| `src/main/services/MistralClientManager.ts` | Mistral client management (main process) |

> Original sources are referenced directly from their original locations without copying.
> When proceeding with /speckit.specify and /speckit.plan, resolve each path as `[Source Root]/[File Path]` and read the files to review existing implementations.

### Reference Guide

#### [New Stack] Logic-Only Reference
- Reference existing code only for understanding **plugin system architecture and hook lifecycle, runtime executor pattern, provider adapter design (15+ providers), middleware pipeline composition, per-provider options builders (temperature, topP, maxTokens, etc.), model resolution logic, streaming-first response delivery, multi-model dispatch, error handling with provider-specific parsing, tool use execution, web search plugin, and context creation**
- Do not reference: Any Redux state management patterns (migrating to Zustand), any UI components (aiCore is a pure TypeScript package)
- **Extract**: Plugin hook categories (executeFirst, executeTransformParams, executeTransformResult) and lifecycle (pre/normal/post), RuntimeExecutor pattern (createExecutor, createOpenAICompatibleExecutor), provider adapter registration and lookup (15+ providers), middleware chain composition (createMiddlewares, wrapModelWithMiddlewares), options builder interface contracts per provider (createAnthropicOptions, createOpenAIOptions, createGoogleOptions, mergeProviderOptions), streaming vs generation execution modes (streamText, generateText, generateImage), model resolution (ModelResolver.resolve, globalModelResolver), tool use plugin architecture (ToolExecutor.execute), web search plugin, stream event management (StreamEventManager.process), error class hierarchy, model version detection (isV2Model, isV3Model)
- **Ignore**: Redux store access patterns (`useSelector`, `useDispatch`), Ant Design component usage in renderer-side config UIs

### SBI Table (B021-B060)

| SBI ID | Behavior | Priority | Description |
|--------|----------|----------|-------------|
| B021 | createExecutor | P1 | Creates AI execution runtime |
| B022 | createOpenAICompatibleExecutor | P1 | Creates OpenAI-compatible executor |
| B023 | streamText | P1 | Streams text from AI provider |
| B024 | generateText | P1 | Generates text (non-streaming) |
| B025 | generateImage | P1 | Generates images via AI provider |
| B026 | PluginEngine.execute | P1 | Executes plugin pipeline |
| B027 | PluginManager.executeFirst | P2 | Returns first valid hook result |
| B028 | PluginManager.executeTransformParams | P2 | Chains parameter merging |
| B029 | PluginManager.executeTransformResult | P2 | Sequential result transformation |
| B030 | ModelResolver.resolve | P1 | Resolves model ID to model object |
| B031 | ProviderConfigBuilder.build | P2 | Fluent provider config setup |
| B032 | createAnthropicOptions | P2 | Creates Anthropic-specific options |
| B033 | createOpenAIOptions | P2 | Creates OpenAI-specific options |
| B034 | createGoogleOptions | P2 | Creates Google-specific options |
| B035 | mergeProviderOptions | P2 | Merges provider options |
| B036 | createMiddlewares | P2 | Creates middleware chain |
| B037 | wrapModelWithMiddlewares | P2 | Wraps model with middleware |
| B038 | definePlugin | P2 | Defines a new plugin |
| B039 | createContext | P2 | Creates plugin context |
| B040 | toolUsePlugin | P2 | Handles tool/function calling |
| B041 | webSearchPlugin | P2 | Web search capability |
| B042 | ToolExecutor.execute | P2 | Executes tool calls |
| B043 | StreamEventManager.process | P2 | Manages stream events |
| B044 | isV2Model/isV3Model | P3 | Model version detection |
| B045 | globalModelResolver | P2 | Global model resolution registry |
| B046 | createGeminiExecutor | P2 | Creates Google Gemini executor |
| B047 | createClaudeExecutor | P2 | Creates Anthropic Claude executor |
| B048 | createOllamaExecutor | P2 | Creates Ollama executor |
| B049 | createAzureExecutor | P2 | Creates Azure OpenAI executor |
| B050 | createMistralExecutor | P2 | Creates Mistral executor |
| B051 | createGroqExecutor | P2 | Creates Groq executor |
| B052 | loggingPlugin | P3 | Request/response logging plugin |
| B053 | googlePlugin | P2 | Google-specific parameter handling |
| B054 | VertexAIService.getToken | P2 | Retrieves Vertex AI auth token |
| B055 | MistralClientManager.getClient | P2 | Creates/caches Mistral client |
| B056 | providerRegistry.register | P2 | Registers provider in global registry |
| B057 | providerRegistry.resolve | P2 | Resolves provider by ID from registry |
| B058 | modelConfigLoader | P2 | Loads model configurations |
| B059 | createDeepSeekExecutor | P2 | Creates DeepSeek executor |
| B060 | createPerplexityExecutor | P3 | Creates Perplexity executor |

### Static Resources

> Non-code files used by this Feature that must be **copied from the original source** during implementation.
> These files cannot be regenerated -- they must be copied as-is and placed in the appropriate location in the new project.
> Source Path is **relative to Source Root** (same as file paths above). Resolve as `[Source Root]/[Source Path]` at runtime.

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| (none) | | | aiCore is a pure TypeScript package with no static resources |

> If resources need modification (e.g., resizing images, updating translation keys), note it in the Usage column.

### Environment Variables

> Environment variables required by this Feature at runtime. Variables marked as `secret` must NOT have their actual values recorded here -- only the variable name and purpose.

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| `API_KEY` | secret | Yes (per provider) | LLM provider API keys (stored in provider config, not env) | (not recorded) |
| `BASE_URL` | config | No | Provider base URL override | `https://api.openai.com/v1` |

**Shared variables** (defined by other Features but also used here):

| Variable | Owner Feature | Usage in This Feature |
|----------|--------------|----------------------|
| `HTTP_PROXY` | F001-app-core | Proxy for outbound AI API calls |
| `HTTPS_PROXY` | F001-app-core | Proxy for outbound AI API calls |
| `ANGDU_LOGGER_MAIN_LEVEL` | F001-app-core | Log level for AI execution logging |

### Naming Remapping

| Original | Replacement | Location |
|----------|------------|----------|
| `@cherrystudio/ai-core` | `@angdu/ai-core` | Package name in package.json |
| `@cherrystudio/ai-sdk-provider` | `@angdu/ai-sdk-provider` | Package name in package.json |
| `@cherrystudio/openai` | `@angdu/openai` | Package name in package.json |
| `CherryAI` provider references | `AngduAI` | Provider identifiers in registry |

---

## For /speckit.specify

> Use the content of this section as a draft when writing spec.md.

### Existing Feature Summary

F002-ai-provider is the Vercel AI SDK integration layer that provides a plugin-based, middleware-enhanced execution pipeline for all AI operations. It implements the RuntimeExecutor as the core execution engine, a plugin system with three hook types (executeFirst, executeTransformParams, executeTransformResult) and pre/normal/post execution order, provider adapters for 15+ providers (OpenAI, Anthropic, Google Gemini, Ollama, Azure, Mistral, Groq, DeepSeek, Perplexity, and more), a middleware pipeline for request/response transformation, per-provider options builders (temperature, topP, maxTokens, etc.), model resolution with global registry, streaming-first response delivery (streamText), non-streaming generation (generateText), image generation (generateImage), tool use support with configurable ToolExecutor, web search plugin, stream event management, and error handling with provider-specific parsing. Custom Vercel AI SDK provider implementations live in the `ai-sdk-provider` package.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Streaming chat | AI core receives a chat request, resolves the provider adapter, applies plugins and middleware, streams response tokens back to caller |
| P1 | Text generation | AI core receives a generation request, executes through the pipeline, returns complete response |
| P1 | Provider resolution | Given a provider ID and model ID, AI core creates the correct Vercel AI SDK adapter instance from 15+ provider adapters |
| P1 | Model resolution | ModelResolver resolves a model ID to a fully configured model object with provider-specific settings |
| P2 | Plugin execution | Plugins hook into pre/normal/post processing stages for provider-specific capabilities (tool use, web search, Google-specific params) |
| P2 | Tool use | Tool use plugin manages tool/function calling lifecycle with configurable ToolExecutor |
| P2 | Web search | Web search plugin integrates search results into AI context |
| P2 | Middleware chain | Custom middleware transforms requests (add headers, modify parameters) before reaching the provider |
| P2 | Image generation | AI core generates images via supported providers |
| P3 | Options builders | Per-provider options builders configure temperature, topP, maxTokens, and other provider-specific parameters |

### Draft Requirements (spec.md Requirements section)

- **FR-001**: Support 15+ AI providers via Vercel AI SDK
- **FR-002**: Unified streaming interface for all providers
- **FR-003**: Plugin engine with pre/normal/post execution order
- **FR-004**: Middleware pipeline for request/response transformation
- **FR-005**: Model resolution with provider-specific configuration
- **FR-006**: Tool use support with configurable tool executor
- **FR-007**: Web search plugin integration

### Draft Acceptance Criteria (spec.md Success Criteria section)

- **SC-001**: All 15+ provider types successfully resolve to correct Vercel AI SDK adapters
- **SC-002**: Streaming responses deliver first token within 2 seconds of request
- **SC-003**: Plugin hooks execute in correct order (pre -> normal -> post)
- **SC-004**: Error hierarchy correctly classifies provider errors into typed categories
- **SC-005**: Middleware chain applies transformations without corrupting request/response data
- **SC-006**: Tool use plugin correctly handles function calling lifecycle
- **SC-007**: Model resolution returns correct configuration for all registered models

### Edge Cases

- Provider returns unexpected response format; error hierarchy must classify correctly
- Streaming connection drops mid-response; graceful error recovery needed
- Multiple plugins modifying the same request field; merge strategy must be deterministic
- Rate limit error from provider triggers appropriate retry or backoff signal
- Empty response from provider handled without crash
- Plugin throws during execution; does not block other plugins in the chain
- Very large response exceeding memory limits during generation mode
- Model version detection (V2 vs V3) returns correct type for edge-case model IDs
- Tool execution timeout; must not block streaming response indefinitely

---

## For /speckit.plan

> Reference the content of this section when writing plan.md.

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-app-core | Infrastructure | Uses IPC framework for main process API access, logging infrastructure, proxy configuration |

### Related Entities (data-model.md draft)

#### Owned Entities

None -- F002 does not own persistent entities. It operates on transient execution contexts. Provider and Model configurations are managed by the provider management subsystem within F002's renderer-side config.

#### Referenced Entities (owned by other Features)

None directly persisted. Provider API keys and model configs are read from Zustand stores at runtime.

### Related API Contracts (contracts/ draft)

#### APIs Provided by This Feature

| Method | Path | Description |
|--------|------|-------------|
| Class | `RuntimeExecutor` | Core execution engine for unified AI completion |
| Function | `createExecutor()` | Creates AI execution runtime |
| Function | `createOpenAICompatibleExecutor()` | Creates OpenAI-compatible executor |
| Function | `streamText()` | Streams text from AI provider |
| Function | `generateText()` | Generates text (non-streaming) |
| Function | `generateImage()` | Generates images via AI provider |
| Function | `definePlugin()` | Defines a new plugin |
| Function | `createMiddlewares()` | Creates middleware chain |
| Class | `ModelResolver` | Resolves model ID to model object |
| Class | `PluginEngine` | Executes plugin pipeline |
| Class | `ToolExecutor` | Executes tool calls |
| Class | `StreamEventManager` | Manages stream events |

> See the corresponding section in api-registry.md for detailed schemas

#### APIs Consumed by This Feature (provided by other Features)

| Method | Path | Provider | Call Purpose |
|--------|------|----------|-------------|
| IPC | `app:*` | F001-app-core | App info and proxy configuration for API calls |
| IPC | `config:*` | F001-app-core | Read configuration values |

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: aiCore is a pure TypeScript package with no UI dependencies. It implements the RuntimeExecutor wrapping Vercel AI SDK with plugin system, middleware pipeline, and 15+ provider adapters. Options builders generate provider-specific request parameters. The `ai-sdk-provider` package contains custom SDK provider implementations. VertexAIService and MistralClientManager run in the main process. Provider registry and model configs live in the renderer.
- **Recommended implementation approach**: Directly reuse the aiCore package architecture as-is since it is stack-independent (pure TypeScript, no UI, no Redux). The only change is that provider config lookup should read from Zustand store instead of Redux store. The ai-sdk-provider custom implementations are also stack-independent. Rename package scopes from `@cherrystudio/*` to `@angdu/*`.
- **Caveats**: Minimal migration impact. Only the bridge between aiCore and the renderer state layer needs to change from Redux selectors to Zustand store access. All core execution logic, plugin system, middleware pipeline, options builders, and error handling are reusable as-is. Provider registry entries referencing "Cherry" identifiers must be renamed to "Angdu" equivalents.

---

## For /speckit.analyze

> Use the content of this section for cross-Feature verification during /speckit.analyze execution.

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Executor API compatibility | F003-chat | Verify F003 correctly calls RuntimeExecutor, streamText(), and generateText() for chat message processing |
| Plugin system extensibility | F003-chat | Verify F003 can register plugins for chat-specific pre/post processing (e.g., knowledge injection, web search) |
| Error hierarchy integration | F003-chat | Verify F003 correctly catches and displays typed error subclasses to users |
| Streaming interface | F003-chat | Verify F003's message streaming service correctly consumes the streaming execution output |
| Tool use integration | F003-chat | Verify F003's tool call handling integrates correctly with F002's ToolExecutor |
| Model resolution | F003-chat | Verify F003's model selection UI correctly maps to F002's ModelResolver |
| Image generation | F003-chat | Verify F003 can invoke generateImage() for image generation workflows |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F003-chat | API change impact | If RuntimeExecutor or streaming interface changes, F003's chat pipeline needs modification |
| F003-chat | Plugin change impact | If plugin hook categories or lifecycle changes, F003's registered plugins need modification |
| F003-chat | Error change impact | If error hierarchy changes, F003's error handling and user-facing error display needs modification |
| F003-chat | Tool use impact | If ToolExecutor interface changes, F003's tool call handling needs modification |
| F004-editor | Rendering impact | If streaming output format changes, F004's incremental rendering needs modification |
