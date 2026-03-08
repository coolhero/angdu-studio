# Angdu Studio -- Business Logic Map

> **Spec-Kit SDD Artifact** | Reverse-engineered from Cherry Studio source
> Generated: 2026-03-08

---

## Table of Contents

1. [F001-app-core](#f001-app-core)
2. [F002-ai-provider](#f002-ai-provider)
3. [F003-chat-core](#f003-chat-core)
4. [F004-settings-data](#f004-settings-data)
5. [F005-chat-ui](#f005-chat-ui)
6. [F006-mcp-tools](#f006-mcp-tools)
7. [F007-knowledge](#f007-knowledge)
8. [F008-memory](#f008-memory)
9. [F009-agents](#f009-agents)
10. [F010-notes](#f010-notes)
11. [F011-translate](#f011-translate)
12. [F012-paintings](#f012-paintings)
13. [Cross-Cutting Business Logic](#cross-cutting-business-logic)

---

## F001-app-core

### BL-001: Application Bootstrap Sequence

| Field | Value |
|---|---|
| **ID** | BL-001 |
| **Name** | Application Bootstrap Sequence |
| **Feature Owner** | F001-app-core |
| **Description** | Orchestrates the Electron app lifecycle: creates BrowserWindow, loads renderer, initializes IPC channels, registers global shortcuts, sets up tray icon, configures auto-updater, applies proxy settings, and restores window state from persisted config. |
| **Trigger/Input** | `app.whenReady()` event in Electron main process |
| **Output/Effect** | Main window visible, all IPC handlers registered, tray created, services initialized |
| **Complexity** | High |
| **Source Files** | `src/main/index.ts`, `src/main/bootstrap.ts`, `src/main/services/WindowService.ts`, `src/main/services/AppService.ts`, `src/main/services/TrayService.ts`, `src/main/services/ShortcutService.ts` |

### BL-002: IPC Channel Router

| Field | Value |
|---|---|
| **ID** | BL-002 |
| **Name** | IPC Channel Registration and Dispatch |
| **Feature Owner** | F001-app-core |
| **Description** | Central routing layer that maps `IpcChannel` enum values to main-process handler functions via `ipcMain.handle()`. All renderer-to-main communication flows through this router. Channels are namespaced by feature (e.g., `Mcp_*`, `KnowledgeBase_*`, `Memory_*`). |
| **Trigger/Input** | `ipcRenderer.invoke(channel, ...args)` from renderer process |
| **Output/Effect** | Dispatches to the appropriate main-process service and returns the result |
| **Complexity** | Medium |
| **Source Files** | `src/main/ipc.ts`, `src/shared/IpcChannel.ts` |

### BL-003: Proxy Manager Configuration

| Field | Value |
|---|---|
| **ID** | BL-003 |
| **Name** | Proxy Mode Selection and Application |
| **Feature Owner** | F001-app-core |
| **Description** | Determines network proxy behavior based on user setting (`system`, `custom`, `none`). For `custom` mode, parses the proxy URL and applies it to both Electron session and environment variables. Includes bypass rules for local addresses. |
| **Trigger/Input** | Settings change to `proxyMode` or `proxyUrl` |
| **Output/Effect** | `session.defaultSession.setProxy()` applied; environment variables `HTTP_PROXY`/`HTTPS_PROXY` set or cleared |
| **Complexity** | Medium |
| **Source Files** | `src/main/services/ProxyManager.ts` |

### BL-004: Data Backup and Restore Pipeline

| Field | Value |
|---|---|
| **ID** | BL-004 |
| **Name** | Multi-target Backup/Restore Pipeline |
| **Feature Owner** | F001-app-core |
| **Description** | Exports the full application state (Redux store, Dexie DB, file attachments) as a ZIP archive to one of three targets: local directory, WebDAV server, or S3-compatible storage. Restore reverses the process with DB migration handling. Includes retry logic (up to 3 attempts with exponential backoff + random jitter) for remote file deletion. |
| **Trigger/Input** | User triggers backup/restore from settings UI or scheduled auto-backup |
| **Output/Effect** | ZIP archive created/extracted; app state replaced; app restarts on restore |
| **Complexity** | High |
| **Source Files** | `src/main/services/BackupManager.ts`, `src/renderer/src/services/BackupService.ts`, `src/renderer/src/store/backup.ts` |

### BL-005: Redux Store Sync (Main <-> Renderer)

| Field | Value |
|---|---|
| **ID** | BL-005 |
| **Name** | Redux Store Bidirectional Sync |
| **Feature Owner** | F001-app-core |
| **Description** | Keeps the main-process Redux mirror in sync with the renderer-process store. State changes in the renderer are forwarded to main via IPC. Main-process services read store state via `getMCPServersFromRedux()` and similar accessors. |
| **Trigger/Input** | Any Redux action dispatch in the renderer |
| **Output/Effect** | Main-process store mirror updated; services see current config |
| **Complexity** | Medium |
| **Source Files** | `src/main/services/ReduxService.ts`, `src/main/services/StoreSyncService.ts`, `src/renderer/src/services/StoreSyncService.ts` |

---

## F002-ai-provider

### BL-006: Provider Resolution and Factory

| Field | Value |
|---|---|
| **ID** | BL-006 |
| **Name** | AI SDK Provider Resolution Chain |
| **Feature Owner** | F002-ai-provider |
| **Description** | Resolves an Angdu Studio `Provider` to an AI SDK `Provider` instance through a three-step chain: (1) static mapping lookup (e.g., `gemini` -> `google`, `grok` -> `xai`, `copilot` -> `github-copilot-openai-compatible`, `tokenflux` -> `openrouter`), (2) alias resolution via `hasProviderConfigByAlias`, (3) fallback to provider type then provider ID. Special-case routing: Azure standard vs. responses endpoint, OpenAI chat mode, CherryIN/AngduIN chat mode. |
| **Trigger/Input** | `getAiSdkProviderId(provider)` called during parameter building |
| **Output/Effect** | Returns a resolved AI SDK provider ID string (e.g., `google`, `azure`, `openai-chat`) |
| **Complexity** | High |
| **Source Files** | `src/renderer/src/aiCore/provider/factory.ts`, `src/renderer/src/aiCore/provider/providerConfig.ts`, `src/renderer/src/aiCore/provider/providerInitialization.ts` |

### BL-007: Model Capability Detection

| Field | Value |
|---|---|
| **ID** | BL-007 |
| **Name** | Model Capability Validator |
| **Feature Owner** | F002-ai-provider |
| **Description** | Determines model capabilities (PDF input, image input, large file upload) using a whitelist/blacklist pattern via `modelSupportValidator()`. Checks model name against `supportedModels`/`unsupportedModels` arrays, then falls back to provider-level checks against `supportedProviders`/`unsupportedProviders`. Enforces provider-specific file size limits: Anthropic 32MB for documents, Gemini 20MB inline threshold (above triggers File API upload), Dashscope forces File API for supported models. |
| **Trigger/Input** | `supportsPdfInput(model)`, `supportsImageInput(model)`, `supportsLargeFileUpload(model)`, `getFileSizeLimit(model, fileType)` |
| **Output/Effect** | Boolean capability flag or numeric size limit |
| **Complexity** | Medium |
| **Source Files** | `src/renderer/src/aiCore/prepareParams/modelCapabilities.ts` |

### BL-008: Provider Options Builder

| Field | Value |
|---|---|
| **ID** | BL-008 |
| **Name** | Provider-Specific Options Construction |
| **Feature Owner** | F002-ai-provider |
| **Description** | Constructs `providerOptions` and `standardParams` for the AI SDK call based on the resolved provider, model, and assistant settings. Handles reasoning mode (thinking tokens, reasoning effort), web search config, image generation flags, and custom parameters. Extracts AI SDK standard params (topK, frequencyPenalty, presencePenalty, stopSequences, seed) from the assistant's custom parameters array and passes them directly to `streamText()`. |
| **Trigger/Input** | `buildProviderOptions(assistant, model, provider, capabilities)` |
| **Output/Effect** | `{ providerOptions, standardParams }` object ready for `streamText()` |
| **Complexity** | High |
| **Source Files** | `src/renderer/src/aiCore/utils/options.ts`, `src/renderer/src/aiCore/prepareParams/parameterBuilder.ts` |

### BL-009: Anthropic Beta Header Injection

| Field | Value |
|---|---|
| **ID** | BL-009 |
| **Name** | Anthropic Beta Header Assembly |
| **Feature Owner** | F002-ai-provider |
| **Description** | Conditionally assembles the `anthropic-beta` header string for Anthropic models. Adds beta feature flags based on assistant capabilities and model requirements. Uses `combineHeaders()` from AI SDK provider utils to merge with existing request headers. Skips header injection entirely for AWS Bedrock providers (which handle these features differently). |
| **Trigger/Input** | `isAnthropicModel(model) && !isAwsBedrockProvider(provider)` during parameter building |
| **Output/Effect** | Combined headers with `anthropic-beta` field containing comma-separated feature flags |
| **Complexity** | Low |
| **Source Files** | `src/renderer/src/aiCore/prepareParams/header.ts` |

### BL-010: Provider Health Check

| Field | Value |
|---|---|
| **ID** | BL-010 |
| **Name** | Provider Health Check Service |
| **Feature Owner** | F002-ai-provider |
| **Description** | Validates provider connectivity by attempting a lightweight API call. Checks API key presence, endpoint reachability, and model list availability. Used in settings UI to show provider status indicators. |
| **Trigger/Input** | User clicks "Check" button in provider settings |
| **Output/Effect** | Success/failure status displayed in UI; provider marked as verified |
| **Complexity** | Low |
| **Source Files** | `src/renderer/src/services/HealthCheckService.ts` |

---

## F003-chat-core

### BL-011: Stream Text Parameter Assembly

| Field | Value |
|---|---|
| **ID** | BL-011 |
| **Name** | StreamText Parameter Assembly Pipeline |
| **Feature Owner** | F003-chat-core |
| **Description** | Master function that assembles all parameters for the Vercel AI SDK `streamText()` call. Orchestrates: (1) model resolution via `getAiSdkProviderId()`, (2) capability detection -- reasoning enabled when model supports thinking tokens or reasoning effort and assistant has it configured, or model is fixed-reasoning; web search enabled when no external provider AND (assistant toggle + model supports it OR model forces it like `sonar`); URL context enabled when assistant flag set AND provider supports it AND model is Gemini or Anthropic; image generation enabled when model supports it AND assistant toggle. (3) MCP tool setup via `setupToolsConfig()`, (4) provider-specific web search tool injection (Google Vertex `googleSearch`, Vertex Anthropic `webSearch`, Azure `webSearchPreview`), (5) URL context tool injection, (6) system prompt construction with `replacePromptVariables()` and optional MCP auto-mode prompt, (7) Anthropic beta header assembly, (8) final `StreamTextParams` with `stepCountIs(20)` limit and `maxRetries: 0`. |
| **Trigger/Input** | `buildStreamTextParams(sdkMessages, assistant, provider, options)` |
| **Output/Effect** | `{ params: StreamTextParams, modelId, capabilities, webSearchPluginConfig }` |
| **Complexity** | High |
| **Source Files** | `src/renderer/src/aiCore/prepareParams/parameterBuilder.ts` |

### BL-012: Message Filtering Pipeline

| Field | Value |
|---|---|
| **ID** | BL-012 |
| **Name** | Conversation Message Filtering Pipeline |
| **Feature Owner** | F003-chat-core |
| **Description** | Nine-stage sequential filter chain that transforms raw UI messages into model-ready messages: (1) `filterAfterContextClearMessages` -- remove messages before context clear markers, (2) `filterUsefulMessages` -- keep only meaningful messages, (3) `filterErrorOnlyMessagesWithRelated` -- remove error-only assistant messages AND their triggering user messages as pairs, (4) `filterLastAssistantMessage` -- strip trailing assistant messages (since we're about to generate a new one), (5) `filterAdjacentUserMessages` -- collapse consecutive user messages, (6) `takeRight(n+2)` -- apply context window limit, (7) re-apply context clear filter on the trimmed set, (8) `filterEmptyMessages` -- remove messages with no content, (9) `filterUserRoleStartMessages` -- ensure conversation starts with a user message. Fallback: if pipeline produces empty result, includes at least the last user message. |
| **Trigger/Input** | `ConversationService.filterMessagesPipeline(messages, contextCount)` |
| **Output/Effect** | Filtered `Message[]` array ready for SDK conversion |
| **Complexity** | High |
| **Source Files** | `src/renderer/src/services/ConversationService.ts`, `src/renderer/src/utils/messageUtils/filters.ts` |

### BL-013: Message-to-SDK Conversion

| Field | Value |
|---|---|
| **ID** | BL-013 |
| **Name** | Message Format Conversion (AS -> AI SDK) |
| **Feature Owner** | F003-chat-core |
| **Description** | Converts Angdu Studio `Message` objects to AI SDK `ModelMessage` format. User messages: assembles `TextPart` + optional `ImagePart` (for vision models, from base64 or URL) + `FilePart` (native PDF/image support with fallback to text extraction). Assistant messages: assembles `ReasoningPart` (from thinking blocks, required first for Bedrock extended thinking) + `TextPart` (trimmed, only if non-empty) + `FilePart`. Adds `[Image]` placeholder for empty assistant messages with images (Gemini compatibility). Special image enhancement model handling: finds the nearest preceding assistant message, extracts its images, and merges them into the last user message to enable edit/enhance operations while preserving conversation history. Handles `fileid://` protocol for system-level file references. |
| **Trigger/Input** | `convertMessagesToSdkMessages(messages, model)` |
| **Output/Effect** | `ModelMessage[]` array compatible with AI SDK |
| **Complexity** | High |
| **Source Files** | `src/renderer/src/aiCore/prepareParams/messageConverter.ts`, `src/renderer/src/aiCore/prepareParams/fileProcessor.ts` |

### BL-014: Stream Processing State Machine

| Field | Value |
|---|---|
| **ID** | BL-014 |
| **Name** | Chunk-based Stream Processing State Machine |
| **Feature Owner** | F003-chat-core |
| **Description** | Processes incoming stream chunks via a callback-driven dispatcher. Chunk types and their callback paths: `LLM_RESPONSE_CREATED` -> `onLLMResponseCreated`, `TEXT_START/DELTA/COMPLETE` -> text callbacks, `THINKING_START/DELTA/COMPLETE` -> thinking callbacks (with millisecond timing), `TOOL_CALL_PENDING/IN_PROGRESS/COMPLETE` -> tool callbacks (MCPToolResponse or NormalToolResponse), `TOOL_ARGUMENT_STREAMING` -> partial argument display, `EXTERNAL_TOOL_IN_PROGRESS/COMPLETE` -> external tool callbacks (web search, knowledge), `LLM_WEB_SEARCH_*` -> built-in search callbacks, `IMAGE_CREATED/DELTA/GENERATED` -> image generation callbacks, `VIDEO_SEARCHED` -> video search callback, `ERROR` -> error callback, `BLOCK_COMPLETE` -> completion with response/usage data, `RAW_DATA` -> raw data forwarding (e.g., agent session IDs). The `BlockManager` orchestrates block creation and lifecycle transitions based on these events. |
| **Trigger/Input** | `Chunk` objects emitted by the AI SDK stream consumer |
| **Output/Effect** | Message blocks created/updated in Redux store; UI re-renders in real-time |
| **Complexity** | High |
| **Source Files** | `src/renderer/src/services/StreamProcessingService.ts`, `src/renderer/src/services/messageStreaming/BlockManager.ts`, `src/renderer/src/services/messageStreaming/callbacks/` |

### BL-015: User Message Construction

| Field | Value |
|---|---|
| **ID** | BL-015 |
| **Name** | User Message and Block Construction |
| **Feature Owner** | F003-chat-core |
| **Description** | Creates a user `Message` entity with associated `MessageBlock` entities. Generates a unique message ID upfront, then creates blocks: `MainTextBlock` for content (always created, even when empty), `ImageBlock` for `FILE_TYPE.IMAGE` files, `FileBlock` for all other files. All blocks initialized with `MessageBlockStatus.SUCCESS`. Message created with `createMessage('user', ...)` linking block IDs. Returns `{ message, blocks }` tuple for atomic dispatch to store. |
| **Trigger/Input** | User sends a message via chat input |
| **Output/Effect** | `Message` + `MessageBlock[]` entities ready for Redux dispatch |
| **Complexity** | Medium |
| **Source Files** | `src/renderer/src/services/MessagesService.ts`, `src/renderer/src/utils/messageUtils/create.ts` |

### BL-016: Rate Limiting Guard

| Field | Value |
|---|---|
| **ID** | BL-016 |
| **Name** | Provider Rate Limit Enforcement |
| **Feature Owner** | F003-chat-core |
| **Description** | Checks if the time elapsed since the last message in the current topic exceeds the provider's configured `rateLimit` (in seconds). Calculates `timeDiff = now - lastMessageTime` and compares against `rateLimitMs = rateLimit * 1000`. If within the limit window, shows a warning toast with the remaining wait time (rounded up to seconds) and returns `true` (blocked). Returns `false` if no rate limit configured, fewer than 2 messages, or rate limit satisfied. |
| **Trigger/Input** | `checkRateLimit(assistant)` called before sending a message |
| **Output/Effect** | Returns `true` (blocked) or `false` (allowed); toast notification if blocked |
| **Complexity** | Low |
| **Source Files** | `src/renderer/src/services/MessagesService.ts` |

### BL-017: Context Count Calculation

| Field | Value |
|---|---|
| **ID** | BL-017 |
| **Name** | Context Window Size Calculation |
| **Feature Owner** | F003-chat-core |
| **Description** | Determines how many historical messages to include in the context window. Reads `assistant.settings.contextCount` (defaults to `DEFAULT_CONTEXTCOUNT`). If set to `MAX_CONTEXT_COUNT`, treats as `UNLIMITED_CONTEXT_COUNT`. Applies `filterContextMessages()` to count actual messages within the window. Returns `{ current, max }` for UI display (e.g., "5/20 messages in context"). |
| **Trigger/Input** | `getContextCount(assistant, messages)` |
| **Output/Effect** | `{ current: number, max: number }` context count info |
| **Complexity** | Low |
| **Source Files** | `src/renderer/src/services/MessagesService.ts` |

---

## F004-settings-data

### BL-018: Settings State Schema

| Field | Value |
|---|---|
| **ID** | BL-018 |
| **Name** | Application Settings State Management |
| **Feature Owner** | F004-settings-data |
| **Description** | Redux slice managing 50+ settings fields organized into categories: display (theme mode, font size, sidebar icons, topic position, window style), behavior (send shortcut `Enter`/`Shift+Enter`/`Ctrl+Enter`/`Command+Enter`/`Alt+Enter`, paste-as-file threshold, click-to-show-topic), proxy (mode + URL + bypass rules), code execution (enabled + timeout), painting provider, translate prompt, API server config, S3 config, user theme (primary color, font families), and provider-specific settings (Ollama keep-alive, VertexAI service account, AWS Bedrock auth type). |
| **Trigger/Input** | User changes any setting in the Settings page |
| **Output/Effect** | Redux state updated; persisted via store sync |
| **Complexity** | Medium |
| **Source Files** | `src/renderer/src/store/settings.ts` |

### BL-019: LLM Provider Registry

| Field | Value |
|---|---|
| **ID** | BL-019 |
| **Name** | Provider and Model Registry |
| **Feature Owner** | F004-settings-data |
| **Description** | Redux slice maintaining the list of configured AI providers and role-specific model assignments: `defaultModel` (primary chat), `quickModel` (quick assistant), `translateModel` (translation). Providers initialized from `SYSTEM_PROVIDERS` (15+ built-in). Each provider entry has `apiKey`, `apiHost`, `type`, `models[]`, `rateLimit`, and custom headers. Models deduplicated via `uniqBy`. Provider-specific settings namespaced under `settings` (e.g., `settings.ollama.keepAliveTime`, `settings.vertexai.serviceAccount`, `settings.awsBedrock.authType`). |
| **Trigger/Input** | User configures providers in Settings; model list fetched from API |
| **Output/Effect** | `LlmState` updated with providers and role-specific model selections |
| **Complexity** | Medium |
| **Source Files** | `src/renderer/src/store/llm.ts`, `src/renderer/src/config/providers.ts` |

### BL-020: Assistant Settings Template

| Field | Value |
|---|---|
| **ID** | BL-020 |
| **Name** | Default Assistant Settings Configuration |
| **Feature Owner** | F004-settings-data |
| **Description** | Defines the canonical default values for assistant settings: `temperature` disabled (use provider defaults), `maxTokens` disabled, `topP` disabled, `streamOutput` enabled, standard `contextCount` (`DEFAULT_CONTEXTCOUNT`), `toolUseMode: 'function'`, `reasoning_effort: 'default'`, empty `customParameters`. These defaults are used as template for new assistant creation and as fallback for missing settings fields. The `satisfies AssistantSettings` type constraint ensures compile-time completeness. |
| **Trigger/Input** | New assistant creation or settings reset |
| **Output/Effect** | `DEFAULT_ASSISTANT_SETTINGS` constant applied to assistant entity |
| **Complexity** | Low |
| **Source Files** | `src/renderer/src/services/AssistantService.ts` |

### BL-021: Data Migration Pipeline

| Field | Value |
|---|---|
| **ID** | BL-021 |
| **Name** | Database and Store Migration |
| **Feature Owner** | F004-settings-data |
| **Description** | Handles version-to-version data migrations for the Dexie database (IndexedDB) and Redux persisted state. Migration functions (e.g., `upgradeToV7`, `upgradeToV8`) are applied during backup restore to ensure data compatibility. The store migration slice tracks migration state and applies transforms to legacy data structures. |
| **Trigger/Input** | App startup with older data version; backup restore |
| **Output/Effect** | Database schema upgraded; legacy data transformed to current format |
| **Complexity** | High |
| **Source Files** | `src/renderer/src/store/migrate.ts`, `src/renderer/src/databases/upgrades/` |

---

## F005-chat-ui

### BL-022: Assistant Management State Machine

| Field | Value |
|---|---|
| **ID** | BL-022 |
| **Name** | Assistant CRUD with Topics |
| **Feature Owner** | F005-chat-ui |
| **Description** | Redux slice managing assistant entities with embedded topics. Operations: `addAssistant` (unshift to front), `insertAssistant` (bounds-checked index insertion, throws if out of bounds), `removeAssistant` (filter by ID), `updateAssistant` (shallow merge by ID), `updateAssistantSettings` (deep merge with default initialization if settings undefined -- initializes with `DEFAULT_TEMPERATURE`, `DEFAULT_CONTEXTCOUNT`, `enableMaxTokens: false`, `streamOutput: true`). Topics normalized to arrays via `normalizeTopics()`. Supports tagging with `tagsOrder` and `collapsedTags`, presets, and unified list ordering across assistants and agents. |
| **Trigger/Input** | User creates/edits/deletes assistants via UI |
| **Output/Effect** | `AssistantsState` updated; topic data cascaded |
| **Complexity** | Medium |
| **Source Files** | `src/renderer/src/store/assistants.ts`, `src/renderer/src/services/AssistantService.ts` |

### BL-023: Topic Naming via LLM

| Field | Value |
|---|---|
| **ID** | BL-023 |
| **Name** | AI-Powered Topic Title Generation |
| **Feature Owner** | F005-chat-ui |
| **Description** | When `useTopicNamingForMessageTitle` setting is enabled, sends the message content to `fetchMessagesSummary()` to generate a human-readable title via LLM. Shows a loading toast while waiting. On success, shows success toast and returns the generated title. Falls back to `getTitleFromString(content, 30)` (first 30 characters) or timestamp-based naming (`YYYYMMDDHHmm` format) on failure or when the setting is disabled. |
| **Trigger/Input** | `getMessageTitle(message, length)` during export or topic auto-naming |
| **Output/Effect** | String title for the message/topic |
| **Complexity** | Medium |
| **Source Files** | `src/renderer/src/services/MessagesService.ts` |

### BL-024: Generation State Guard

| Field | Value |
|---|---|
| **ID** | BL-024 |
| **Name** | Active Generation State Lock |
| **Feature Owner** | F005-chat-ui |
| **Description** | Promise-based guard that checks `store.getState().runtime.generating`. If a generation is in progress, shows a warning toast (`message.switch.disabled`) and rejects. Used to prevent navigation, topic switching, and concurrent sends during active streaming. |
| **Trigger/Input** | `isGenerating()` called before state-changing operations |
| **Output/Effect** | Resolves `true` (proceed) or rejects `false` (blocked with toast) |
| **Complexity** | Low |
| **Source Files** | `src/renderer/src/services/MessagesService.ts` |

---

## F006-mcp-tools

### BL-025: MCP Client Lifecycle Management

| Field | Value |
|---|---|
| **ID** | BL-025 |
| **Name** | MCP Server Client Initialization and Connection |
| **Feature Owner** | F006-mcp-tools |
| **Description** | Manages the lifecycle of MCP client connections to servers. Supports four transport types: `stdio` (subprocess via `StdioClientTransport`), `sse` (Server-Sent Events via `SSEClientTransport`), `streamableHttp` (HTTP streaming via `StreamableHTTPClientTransport`), and `inMemory` (via `InMemoryTransport` for built-in servers). Implements connection pooling with a `clients` Map keyed by JSON-serialized server config hash (`baseUrl` + `command` + `args` + `registryUrl` + `env` + `id`). Uses ping-based health checks (1s timeout) to detect stale connections -- removes stale clients and reconnects. Handles pending connection deduplication via `pendingClients` map to prevent race conditions. Registers MCP SDK notification handlers for `ToolListChanged`, `ResourceListChanged`, `ResourceUpdated`, `PromptListChanged`, `LoggingMessage`, and `Cancelled`. |
| **Trigger/Input** | `initClient(server)` called when tools are needed or server is activated |
| **Output/Effect** | Connected `Client` instance stored in pool; ready for tool/resource/prompt operations |
| **Complexity** | High |
| **Source Files** | `src/main/services/MCPService.ts` |

### BL-026: MCP Tool Dispatch Pipeline

| Field | Value |
|---|---|
| **ID** | BL-026 |
| **Name** | MCP Tool Call Routing and Execution |
| **Feature Owner** | F006-mcp-tools |
| **Description** | Routes tool calls from the AI SDK to the appropriate MCP server. Tool IDs use `serverId__toolName` format (double underscore separator). The hub server (`listAllActiveServerTools`) aggregates tools from all active servers, filtering out entries in each server's `disabledTools` set. `callToolById()` splits the tool ID on `__`, looks up the server by `serverId`, and delegates to `callTool()`. Supports abort via `AbortController` stored in the `activeToolCalls` map. Sensitive fields (`authorization`, `apiKey`, `token`, `access_token`) are redacted before logging, and strings longer than 300 characters are truncated. |
| **Trigger/Input** | AI SDK invokes a tool during `streamText()` execution |
| **Output/Effect** | `MCPCallToolResponse` with tool execution results |
| **Complexity** | High |
| **Source Files** | `src/main/services/MCPService.ts`, `src/renderer/src/aiCore/utils/mcp.ts` |

### BL-027: Tool Permission State Machine

| Field | Value |
|---|---|
| **ID** | BL-027 |
| **Name** | Tool Permission Request/Approve/Deny Flow |
| **Feature Owner** | F006-mcp-tools |
| **Description** | Redux-based state machine for tool execution permissions. States: `pending` -> `submitting-allow`/`submitting-deny` -> `invoking` (on allow) or deletion (on deny). Each permission request carries: `requestId`, `toolName`, `toolId`, `toolCallId`, `description`, `requiresPermissions`, `input`, `inputPreview`, `createdAt`, `expiresAt`, `suggestions` (array of `PermissionUpdate`), and optional `autoApprove`. On allow: status transitions to `invoking`, resolved input (possibly modified by user) stored in `resolvedInputs` by `toolCallId`. On deny: entry removed from state. `selectActiveToolPermission` returns the oldest pending entry (FIFO). `submissionFailed` reverts to `pending` for retry. `clearAll` resets entire state. |
| **Trigger/Input** | Tool execution triggers `requestReceived` action with `ToolPermissionRequestPayload` |
| **Output/Effect** | UI shows permission dialog; tool execution proceeds or is denied based on user response |
| **Complexity** | High |
| **Source Files** | `src/renderer/src/store/toolPermissions.ts` |

### BL-028: MCP Server Log Buffer

| Field | Value |
|---|---|
| **ID** | BL-028 |
| **Name** | Server Log Collection and Forwarding |
| **Feature Owner** | F006-mcp-tools |
| **Description** | Ring buffer (capacity 200 entries per server) that collects log entries per MCP server. Logs are forwarded to the renderer via `IpcChannel.Mcp_ServerLog` for display in the MCP server management UI. Server key is a JSON hash of server config. |
| **Trigger/Input** | MCP server emits log entries during operations |
| **Output/Effect** | Log entries stored in buffer and sent to renderer for display |
| **Complexity** | Low |
| **Source Files** | `src/main/services/MCPService.ts` (ServerLogBuffer class in `src/main/services/mcp/ServerLogBuffer.ts`) |

### BL-029: Built-in MCP Server Factory

| Field | Value |
|---|---|
| **ID** | BL-029 |
| **Name** | Built-in MCP Server Registration |
| **Feature Owner** | F006-mcp-tools |
| **Description** | Factory function that creates in-memory MCP server instances for built-in capabilities: `brave-search` (web search), `filesystem` (file operations), `dify-knowledge` (Dify integration), `python` (code execution), `sequentialthinking` (reasoning), `browser` (web automation), `memory` (conversation memory), `fetch` (HTTP requests), and `didi-mcp` (additional services). These servers use `InMemoryTransport` and are registered alongside user-configured external servers. The hub server aggregates tools from all of these. |
| **Trigger/Input** | `createInMemoryMCPServer(serverName)` during server initialization |
| **Output/Effect** | In-memory MCP server instance connected via `InMemoryTransport` |
| **Complexity** | Medium |
| **Source Files** | `src/main/mcpServers/factory.ts`, `src/main/mcpServers/*.ts` |

### BL-030: MCP Server Configuration State

| Field | Value |
|---|---|
| **ID** | BL-030 |
| **Name** | MCP Server Registry Redux State |
| **Feature Owner** | F006-mcp-tools |
| **Description** | Redux slice managing the MCP server configuration list. Operations: `setMCPServers` (bulk replace), `addMCPServer` (unshift), `updateMCPServer` (by ID), `deleteMCPServer` (filter by ID), `setMCPServerActive` (toggle by ID). Tracks runtime state: `isUvInstalled`, `isBunInstalled` (package manager availability). Selectors: `getActiveServers` (filtered by `isActive`), `getAllServers`. |
| **Trigger/Input** | User manages MCP servers in settings UI |
| **Output/Effect** | `MCPConfig` state updated; servers available for tool execution |
| **Complexity** | Low |
| **Source Files** | `src/renderer/src/store/mcp.ts` |

---

## F007-knowledge

### BL-031: Knowledge Base Parameter Assembly

| Field | Value |
|---|---|
| **ID** | BL-031 |
| **Name** | Knowledge Base Configuration Builder |
| **Feature Owner** | F007-knowledge |
| **Description** | Constructs `KnowledgeBaseParams` from a `KnowledgeBase` entity. Resolves the embedding model provider via `ModernAiProvider` and rerank model provider via legacy `AiProvider`. Adjusts `baseURL` for provider-specific quirks: Gemini appends `/openai`, Azure OpenAI appends `/v1`, Ollama strips `/api` suffix (LangChain ecosystem compatibility). Resolves preprocess provider from current Redux state (not stale entity reference). Clamps `chunkSize` to the embedding model's `maxChunkSize` from `getEmbeddingMaxContext()`. |
| **Trigger/Input** | `getKnowledgeBaseParams(base)` called before any KB operation |
| **Output/Effect** | `KnowledgeBaseParams` with resolved `embedApiClient`, `rerankApiClient`, sizing, and preprocess config |
| **Complexity** | Medium |
| **Source Files** | `src/renderer/src/services/KnowledgeService.ts` |

### BL-032: Knowledge Search with Threshold and Rerank

| Field | Value |
|---|---|
| **ID** | BL-032 |
| **Name** | Knowledge Base Search Pipeline |
| **Feature Owner** | F007-knowledge |
| **Description** | Executes a vector search against a knowledge base with a multi-stage pipeline: (1) truncate query to embedding model's max context using proportional character slicing (`ratio = maxContext / estimatedTokens`, then `query.slice(0, floor(length * ratio))`), (2) call `knowledgeBase.search()` via IPC with span context for tracing, (3) filter results below the configured `threshold` score (default `DEFAULT_KNOWLEDGE_THRESHOLD`), (4) if a rerank model is configured, apply `knowledgeBase.rerank()` via IPC, (5) limit to `documentCount` results (default `DEFAULT_KNOWLEDGE_DOCUMENT_COUNT`), (6) resolve `FileMetadata` for each result by parsing the source URL for file IDs. Includes OpenTelemetry span tracking with Knowledge tag. |
| **Trigger/Input** | `searchKnowledgeBase(query, base, rewrite, topicId, parentSpanId, modelName)` |
| **Output/Effect** | Array of `KnowledgeSearchResult & { file: FileMetadata | null }` with scores |
| **Complexity** | High |
| **Source Files** | `src/renderer/src/services/KnowledgeService.ts` |

### BL-033: Multi-KB Multi-Question Search Aggregation

| Field | Value |
|---|---|
| **ID** | BL-033 |
| **Name** | Cross-KB Multi-Question Search Aggregation |
| **Feature Owner** | F007-knowledge |
| **Description** | Given multiple extracted questions and multiple knowledge base IDs, executes searches across all combinations in parallel. For each KB: runs all questions in parallel via `Promise.all`, flattens results, deduplicates by `uniqueId` or `pageContent` using a `Map`, sorts by score descending, and converts to `KnowledgeReference` format with sequential IDs, content, source URL, metadata, and `type: 'file'`. Final results across all KBs are flattened and re-indexed sequentially starting at 1. Skips processing if no valid question or no matching knowledge base IDs. |
| **Trigger/Input** | `processKnowledgeSearch(extractResults, knowledgeBaseIds, topicId)` |
| **Output/Effect** | `KnowledgeReference[]` with sequential IDs, ready for prompt injection |
| **Complexity** | High |
| **Source Files** | `src/renderer/src/services/KnowledgeService.ts` |

### BL-034: Knowledge Reference Prompt Injection

| Field | Value |
|---|---|
| **ID** | BL-034 |
| **Name** | RAG Prompt Injection into User Message |
| **Feature Owner** | F007-knowledge |
| **Description** | Injects knowledge base search results into the last user message of the model message array. Pipeline: (1) check assistant has `knowledge_bases`, (2) retrieve references via `getKnowledgeReferences()` which calls `processKnowledgeSearch()`, (3) create a `CitationBlock` via `createCitationBlock()` and add to assistant message via `BlockManager`, (4) construct `knowledgeSearchPrompt` by filling `REFERENCE_PROMPT` template with `{question}` and `{references}` (JSON-serialized), (5) replace the text content of the last user message -- handles both string content and array content (finds existing text part or appends new one). |
| **Trigger/Input** | `injectUserMessageWithKnowledgeSearchPrompt({modelMessages, assistant, ...})` |
| **Output/Effect** | Last user message content replaced with RAG-augmented prompt; citation block added to assistant message |
| **Complexity** | Medium |
| **Source Files** | `src/renderer/src/services/KnowledgeService.ts` |

---

## F008-memory

### BL-035: Memory Fact Extraction

| Field | Value |
|---|---|
| **ID** | BL-035 |
| **Name** | LLM-Powered Fact Extraction from Conversation |
| **Feature Owner** | F008-memory |
| **Description** | Sends conversation messages to a configured LLM with the `factExtractionPrompt` to extract atomic facts. Formats messages as `role: content` newline-joined lines. Uses `getFactRetrievalMessages()` to construct `[systemPrompt, userPrompt]`. Calls `fetchGenerate()` for non-streaming LLM call. Parses response with `jaison` (lenient JSON parser), handling both `{ facts: [...] }` wrapper format and bare array format. Validates against `FactRetrievalSchema` (Zod). Returns empty array on any parse failure or empty response rather than throwing. |
| **Trigger/Input** | `MemoryProcessor.extractFacts(messages, config)` |
| **Output/Effect** | `string[]` of extracted facts |
| **Complexity** | Medium |
| **Source Files** | `src/renderer/src/services/MemoryProcessor.ts`, `src/renderer/src/utils/memory-prompts.ts` |

### BL-036: Memory Update Decision Engine

| Field | Value |
|---|---|
| **ID** | BL-036 |
| **Name** | Memory CRUD Decision via LLM |
| **Feature Owner** | F008-memory |
| **Description** | Given new facts and existing memories (retrieved from `window.keyv.get('memory-search-{messageId}')` cache), decides the operation for each fact. Fast path: if no existing memories, all facts become `ADD` operations (skips LLM call). Otherwise: maps existing memories to `{ id, text }` pairs, constructs prompt via `getUpdateMemoryMessages()`, calls LLM with `updateMemorySystemPrompt`. Parses response against `MemoryUpdateSchema` (Zod), handling both `[...]` array and `{ memory: [...] }` wrapper formats. Executes each operation: `ADD` -> `memoryService.add()`, `UPDATE` -> `memoryService.update()` (with `oldMemory` for audit), `DELETE` -> `memoryService.delete()`, `NONE` -> skip. Each operation wrapped in try/catch for resilience. |
| **Trigger/Input** | `MemoryProcessor.updateMemories(facts, config)` |
| **Output/Effect** | Array of `{ action, ... }` operation records; memory store updated |
| **Complexity** | High |
| **Source Files** | `src/renderer/src/services/MemoryProcessor.ts` |

### BL-037: Conversation Memory Processing Pipeline

| Field | Value |
|---|---|
| **ID** | BL-037 |
| **Name** | End-to-End Conversation Memory Processing |
| **Feature Owner** | F008-memory |
| **Description** | Full pipeline: `extractFacts()` -> `updateMemories()`. Orchestrated by `processConversation()`. Triggered asynchronously after AI response completion via `storeConversationMemory()` in the search orchestration plugin's `onRequestEnd` hook (non-blocking, runs in background). Guard conditions: `globalMemoryEnabled` must be `true` in Redux state AND `assistant.enableMemory` must be set. Pre-filters messages to only `user`/`assistant` roles with non-empty trimmed content. Requires minimum 2 messages (at least one user-assistant exchange). |
| **Trigger/Input** | `storeConversationMemory()` in `searchOrchestrationPlugin.onRequestEnd` |
| **Output/Effect** | Memories added/updated/deleted in the memory store (via IPC to main process) |
| **Complexity** | High |
| **Source Files** | `src/renderer/src/aiCore/plugins/searchOrchestrationPlugin.ts`, `src/renderer/src/services/MemoryProcessor.ts` |

### BL-038: Memory Service Configuration and IPC

| Field | Value |
|---|---|
| **ID** | BL-038 |
| **Name** | Memory Service Singleton with Config Sync |
| **Feature Owner** | F008-memory |
| **Description** | Singleton `MemoryService` that delegates all operations (list, add, search, delete, update, get history, user management) to the main process via `window.api.memory.*` IPC calls. Manages a `currentUserId` context for scoping memory operations. Configuration sync: `updateConfig()` reads `memoryConfig` from Redux (`selectMemoryConfig`), resolves the embedding model, constructs an `embedApiClient` via `getKnowledgeBaseParams()`, and pushes the config to main via `window.api.memory.setConfig()`. Error responses from main process are caught and re-thrown. All list/search operations return empty results on error to prevent UI crashes. |
| **Trigger/Input** | `MemoryService.getInstance()` for singleton access; `updateConfig()` on init or config change |
| **Output/Effect** | Main process memory service updated; CRUD operations proxied to main process |
| **Complexity** | Medium |
| **Source Files** | `src/renderer/src/services/MemoryService.ts`, `src/renderer/src/store/memory.ts` |

### BL-039: Memory State Management

| Field | Value |
|---|---|
| **ID** | BL-039 |
| **Name** | Memory Redux State |
| **Feature Owner** | F008-memory |
| **Description** | Redux slice managing: `memoryConfig` (embedding model, dimensions, auto-dimensions flag, custom extraction/update prompts), `currentUserId` (persisted to `localStorage` under key `memory_currentUserId`, defaults to `'default-user'`), `globalMemoryEnabled` (defaults to `false`). Selectors with safety checks: `selectMemoryConfig` returns `defaultMemoryConfig` if state undefined, `selectCurrentUserId` returns `'default-user'` if state undefined, `selectGlobalMemoryEnabled` returns `false` if state undefined. |
| **Trigger/Input** | User configures memory settings; memory operations change user context |
| **Output/Effect** | `MemoryState` in Redux store; `localStorage` persistence for `currentUserId` |
| **Complexity** | Low |
| **Source Files** | `src/renderer/src/store/memory.ts` |

---

## F009-agents

### BL-040: Search Intent Analysis

| Field | Value |
|---|---|
| **ID** | BL-040 |
| **Name** | AI-Powered Search Intent Analysis |
| **Feature Owner** | F009-agents |
| **Description** | Analyzes the user's last message to determine search intent using the model itself. Selects one of three prompt variants based on which search types are needed: `SEARCH_SUMMARY_PROMPT_WEB_ONLY`, `SEARCH_SUMMARY_PROMPT_KNOWLEDGE_ONLY`, or `SEARCH_SUMMARY_PROMPT` (both). Constructs a formatted prompt with `{chat_history}` (from last assistant message, if any) and `{question}` (from last user message). Calls `generateText()` with the same model used for the main conversation. Parses the XML-structured response via `extractInfoFromXML()`. Falls back to using the raw message content as search queries if the model provider is missing, has no API key, or the analysis call fails. |
| **Trigger/Input** | `analyzeSearchIntent(lastUserMessage, assistant, options)` during plugin `onRequestStart` |
| **Output/Effect** | `ExtractResults` with `websearch` and/or `knowledge` search queries and optional rewrite |
| **Complexity** | High |
| **Source Files** | `src/renderer/src/aiCore/plugins/searchOrchestrationPlugin.ts`, `src/renderer/src/utils/extract.ts` |

### BL-041: Search Orchestration Plugin

| Field | Value |
|---|---|
| **ID** | BL-041 |
| **Name** | Search Orchestration Plugin (Pre/Post Request Hooks) |
| **Feature Owner** | F009-agents |
| **Description** | Central AI Core plugin that orchestrates pre-request search and post-request memory storage. `onRequestStart`: checks if web search (`shouldWebSearch = assistant has webSearchProviderId`), knowledge search (`shouldKnowledgeSearch = assistant has knowledge_bases`), or memory search are needed; performs intent analysis; injects web search tool (`webSearchToolWithPreExtractedKeywords` with pre-analyzed queries), knowledge search tool, and memory search tool as AI SDK tools into the request. `onRequestEnd`: triggers asynchronous memory storage via `storeConversationMemory()`. This plugin is the central coordination point for the RAG pipeline, ensuring search, knowledge, and memory features are composed without tight coupling. |
| **Trigger/Input** | AI request lifecycle hooks (`onRequestStart`, `transformParams`, `onRequestEnd`) |
| **Output/Effect** | Tools injected into request; knowledge/web search executed; memory stored after response |
| **Complexity** | High |
| **Source Files** | `src/renderer/src/aiCore/plugins/searchOrchestrationPlugin.ts`, `src/renderer/src/aiCore/tools/WebSearchTool.ts`, `src/renderer/src/aiCore/tools/KnowledgeSearchTool.ts`, `src/renderer/src/aiCore/tools/MemorySearchTool.ts` |

### BL-042: MCP Auto-Mode System Prompt

| Field | Value |
|---|---|
| **ID** | BL-042 |
| **Name** | MCP Auto-Mode Prompt Injection |
| **Feature Owner** | F009-agents |
| **Description** | When `getEffectiveMcpMode(assistant) === 'auto'`, retrieves the hub mode system prompt via `getHubModeSystemPrompt()` and appends it to the assistant's custom system prompt (or uses it standalone if no custom prompt). This instructs the model to autonomously decide when and how to use available MCP tools, enabling agent-like behavior without explicit tool selection by the user. |
| **Trigger/Input** | `buildStreamTextParams()` detects auto MCP mode |
| **Output/Effect** | System prompt augmented with MCP auto-mode instructions |
| **Complexity** | Low |
| **Source Files** | `src/renderer/src/aiCore/prepareParams/parameterBuilder.ts`, `src/renderer/src/config/prompts-code-mode.ts` |

---

## F010-notes

### BL-043: Notes Tree Management

| Field | Value |
|---|---|
| **ID** | BL-043 |
| **Name** | Filesystem-Backed Notes Tree Operations |
| **Feature Owner** | F010-notes |
| **Description** | Manages a tree of markdown notes stored on the local filesystem. `loadTree()` reads directory structure via IPC (`file.getDirectoryStructure`). `sortTree()` recursively sorts nodes -- folders always before files, then by selected sort type via `getSorter()` (A-Z, Z-A, date-based). `addDir()` creates directories with safe name resolution via `file.checkFileName`. `addNote()` creates `.md` files with safe name resolution and appends the `.md` extension. Path resolution uses `resolveNotesPath()` which falls back to a default notes directory (from `appInfo.notesPath`) if the configured path is invalid, and dispatches `setNotesPath()` to update the store with the fallback. |
| **Trigger/Input** | User navigates notes UI; creates/renames/deletes notes or folders |
| **Output/Effect** | `NotesTreeNode[]` for UI rendering; filesystem changes via IPC |
| **Complexity** | Medium |
| **Source Files** | `src/renderer/src/services/NotesService.ts`, `src/renderer/src/services/NotesTreeService.ts` |

### BL-044: Notes State Management

| Field | Value |
|---|---|
| **ID** | BL-044 |
| **Name** | Notes UI State and Preferences |
| **Feature Owner** | F010-notes |
| **Description** | Redux slice tracking notes UI state: `activeNodeId`, `activeFilePath`, `sortType` (enum `NotesSortType`), `starredPaths` (array of file paths), `expandedPaths` (array of folder paths), and display settings (`isFullWidth: true`, `fontFamily: 'default'|'serif'`, `fontSize: 16`, `showTableOfContents: true`, `defaultViewMode: 'edit'|'read'`, `defaultEditMode: 'preview'` (excluding 'read'), `showTabStatus: true`, `showWorkspace: true`). Persisted across sessions via Redux persistence. Empty arrays defaulted with `?? []` in selectors for safety. |
| **Trigger/Input** | User interacts with notes UI (opens note, stars, expands folder, changes settings) |
| **Output/Effect** | `NoteState` updated in Redux store |
| **Complexity** | Low |
| **Source Files** | `src/renderer/src/store/note.ts` |

---

## F011-translate

### BL-045: Translation Execution Pipeline

| Field | Value |
|---|---|
| **ID** | BL-045 |
| **Name** | LLM-Powered Text Translation |
| **Feature Owner** | F011-translate |
| **Description** | Translates text using a dedicated translate assistant with the configured translate model. Creates a `TranslateAssistant` via `getDefaultTranslateAssistant()` which validates the translate model exists and the target language is not `UNKNOWN`. Disables reasoning mode if the model supports `none` effort (via `getModelSupportedReasoningEffortOptions`). Streams the translation via `fetchChatCompletion()`, processing chunks: `TEXT_DELTA` accumulates text, `TEXT_COMPLETE` sets completion flag, `BLOCK_COMPLETE` tracks token usage via `trackTokenUsage()`, `ERROR` captures errors (abort errors are treated as completion). Handles abort signals via `readyToAbort(abortKey)`. Rejects with localized error if the result is empty after trimming. Silently catches `NoOutputGeneratedError` from AI SDK (thrown on abort). |
| **Trigger/Input** | `translateText(text, targetLanguage, onResponse, abortKey, options)` |
| **Output/Effect** | Translated text string; streaming updates via `onResponse(text, isComplete)` callback |
| **Complexity** | Medium |
| **Source Files** | `src/renderer/src/services/TranslateService.ts` |

### BL-046: Custom Language Management

| Field | Value |
|---|---|
| **ID** | BL-046 |
| **Name** | Custom Translation Language CRUD |
| **Feature Owner** | F011-translate |
| **Description** | Manages user-defined translation languages in the Dexie database (`translate_languages` table). `addCustomLanguage`: validates uniqueness by `langCode` (case-insensitive, normalized to lowercase), generates UUID, stores `{ id, value, langCode, emoji }`. `deleteCustomLanguage`: removes by ID. `updateCustomLanguage`: replaces entry preserving original ID. `getAllCustomLanguages`: returns full array. All operations throw on failure with logging. |
| **Trigger/Input** | User adds/edits/deletes custom languages in translate settings |
| **Output/Effect** | `CustomTranslateLanguage` records in IndexedDB |
| **Complexity** | Low |
| **Source Files** | `src/renderer/src/services/TranslateService.ts` |

### BL-047: Translation History Persistence

| Field | Value |
|---|---|
| **ID** | BL-047 |
| **Name** | Translation History CRUD |
| **Feature Owner** | F011-translate |
| **Description** | Persists translation history records in the Dexie database (`translate_history` table). `saveTranslateHistory`: creates record with `{ id: uuid(), sourceText, targetText, sourceLanguage, targetLanguage, createdAt: ISO string }`. `updateTranslateHistory`: partial update by ID. `deleteHistory`: removes by ID. `clearHistory`: clears entire table. |
| **Trigger/Input** | Translation completed; user manages history in UI |
| **Output/Effect** | `TranslateHistory` records in IndexedDB |
| **Complexity** | Low |
| **Source Files** | `src/renderer/src/services/TranslateService.ts` |

### BL-048: Translate State Management

| Field | Value |
|---|---|
| **ID** | BL-048 |
| **Name** | Translate Redux State |
| **Feature Owner** | F011-translate |
| **Description** | Redux slice managing translation UI state: `translateInput` (current input text), `translatedContent` (current output text), `settings.autoCopy` (auto-copy translated text to clipboard, defaults to `false`). |
| **Trigger/Input** | User types in translate input or receives translation output |
| **Output/Effect** | `TranslateState` updated in Redux store |
| **Complexity** | Low |
| **Source Files** | `src/renderer/src/store/translate.ts` |

---

## F012-paintings

### BL-049: Paintings Store with Multi-Provider Namespaces

| Field | Value |
|---|---|
| **ID** | BL-049 |
| **Name** | Painting Collection Management |
| **Feature Owner** | F012-paintings |
| **Description** | Redux slice managing image generation results partitioned by provider namespace. 12 namespaces: `siliconflow_paintings`, `dmxapi_paintings`, `tokenflux_paintings`, `zhipu_paintings`, `aihubmix_image_generate`, `aihubmix_image_remix`, `aihubmix_image_edit`, `aihubmix_image_upscale`, `openai_image_generate`, `openai_image_edit`, `ovms_paintings`, `ppio_draw`, `ppio_edit`. Operations: `addPainting` (unshift to front of namespace array), `removePainting` (filter by ID), `updatePainting` (find by ID, log error if not found), `updatePaintings` (bulk replace entire namespace). Default namespace fallback to `'paintings'`. |
| **Trigger/Input** | User generates/deletes images via painting UI |
| **Output/Effect** | `PaintingsState` updated with painting entries per namespace |
| **Complexity** | Medium |
| **Source Files** | `src/renderer/src/store/paintings.ts` |

### BL-050: Image Generation Model Detection

| Field | Value |
|---|---|
| **ID** | BL-050 |
| **Name** | Image Generation and Enhancement Model Classification |
| **Feature Owner** | F012-paintings |
| **Description** | Classifies models into image-related categories: `isGenerateImageModel()` (can generate images), `isPureGenerateImageModel()` (only generates images, no chat), `isImageEnhancementModel()` (can edit/enhance existing images). These classifications drive: (1) UI capability flags -- `enableGenerateImage` in parameter builder, (2) message conversion behavior -- image enhancement models trigger special conversation collapsing where previous assistant images are merged into the current user message for editing, (3) URL context guard -- pure image models are excluded from URL context. |
| **Trigger/Input** | `isGenerateImageModel(model)`, `isImageEnhancementModel(model)` during parameter building |
| **Output/Effect** | Boolean classification used for capability flags and message conversion |
| **Complexity** | Low |
| **Source Files** | `src/renderer/src/config/models.ts` |

---

## Cross-Cutting Business Logic

### BL-051: Web Search Processing Pipeline

| Field | Value |
|---|---|
| **ID** | BL-051 |
| **Name** | Web Search Execution and Compression |
| **Feature Owner** | F003-chat-core, F007-knowledge |
| **Description** | Full web search pipeline: (1) validate extracted questions, (2) handle special `summarize` requests (when `questions[0] === 'summarize'` and links present) by fetching page contents directly via `fetchWebContents()`, (3) execute parallel searches across all questions via `Promise.allSettled()`, (4) aggregate results from fulfilled promises (throw on rejected), (5) apply compression based on `compressionConfig.method`: **RAG** -- creates temporary KB (`websearch-compression-{requestId}`), sequentially adds all search results as knowledge items, executes multi-question search against the temporary KB, applies round-robin reference selection via `selectReferences()`, consolidates by URL via `consolidateReferencesByUrl()`, always cleans up temporary KB in `finally` block; **Cutoff** -- distributes `cutoffLimit` equally across results (`perResultLimit = floor(limit / count)`), truncates by character or by token (using `sliceByTokens()`), appends `...` if truncated. Includes phase-based status tracking for UI feedback: `default` -> `fetch_complete` -> `rag`/`cutoff` -> `rag_complete`/`rag_failed` -> `default`. Optionally prepends current date to queries when `searchWithTime` is enabled. |
| **Trigger/Input** | `WebSearchService.processWebsearch(provider, extractResults, requestId)` |
| **Output/Effect** | `WebSearchProviderResponse` with compressed/filtered results |
| **Complexity** | High |
| **Source Files** | `src/renderer/src/services/WebSearchService.ts` |

### BL-052: AI Core Plugin Architecture

| Field | Value |
|---|---|
| **ID** | BL-052 |
| **Name** | AI Core Plugin System |
| **Feature Owner** | F002-ai-provider, F003-chat-core |
| **Description** | Extensible plugin system using `definePlugin()` from `@cherrystudio/ai-core`. Plugins hook into the request lifecycle via: `configureContext` (add middleware to `context.middlewares`), `onRequestStart` (pre-processing), `transformParams` (modify request parameters), `onRequestEnd` (post-processing). Plugins declare `enforce: 'pre'` or `'post'` for ordering. Active plugins: `searchOrchestrationPlugin` (search + memory coordination), `reasoningExtractionPlugin` (extract `<thinking>` tags via `extractReasoningMiddleware`), `anthropicCachePlugin` (prompt caching), `noThinkPlugin` (disable thinking), `qwenThinkingPlugin` (Qwen-specific thinking mode), `simulateStreamingPlugin` (convert non-stream to stream), `telemetryPlugin` (OpenTelemetry tracing), `reasoningTimePlugin` (thinking duration measurement), `openrouterReasoningPlugin` (OpenRouter reasoning), `skipGeminiThoughtSignaturePlugin` (filter Gemini thought markers). |
| **Trigger/Input** | AI request lifecycle |
| **Output/Effect** | Request/response modified by plugin chain |
| **Complexity** | High |
| **Source Files** | `src/renderer/src/aiCore/plugins/PluginBuilder.ts`, `src/renderer/src/aiCore/plugins/*.ts` |

### BL-053: Reasoning Capability Detection and Configuration

| Field | Value |
|---|---|
| **ID** | BL-053 |
| **Name** | Reasoning Mode Detection and Parameter Setup |
| **Feature Owner** | F002-ai-provider, F003-chat-core |
| **Description** | Determines if reasoning/thinking mode should be enabled based on three OR conditions: (1) `isSupportedThinkingTokenModel(model)` AND `reasoning_effort` is configured, (2) `isSupportedReasoningEffortModel(model)` AND `reasoning_effort` is configured, (3) `isFixedReasoningModel(model)` (always-on reasoning, no configuration needed). The `enableReasoning` flag is passed to `buildProviderOptions()` which applies provider-specific reasoning configuration (e.g., Anthropic extended thinking budget, OpenAI reasoning effort level, Qwen think mode toggle). Known issue: Qwen3 reports `enableReasoning: true` even when thinking is disabled. |
| **Trigger/Input** | `buildStreamTextParams()` capability detection phase |
| **Output/Effect** | `enableReasoning` flag set; appropriate provider options configured |
| **Complexity** | Medium |
| **Source Files** | `src/renderer/src/aiCore/prepareParams/parameterBuilder.ts`, `src/renderer/src/config/models.ts` |

### BL-054: Provider-Specific Web Search Tool Construction

| Field | Value |
|---|---|
| **ID** | BL-054 |
| **Name** | Built-in Web Search Tool Injection |
| **Feature Owner** | F003-chat-core, F006-mcp-tools |
| **Description** | Constructs provider-specific web search tools when built-in web search is enabled (no external search provider AND model/assistant support web search). Routes to different tool implementations based on `aiSdkProviderId`: `google-vertex` -> `vertex.tools.googleSearch({})`, `google-vertex-anthropic` -> `vertexAnthropic.tools.webSearch_20250305({maxUses, blockedDomains})`, `azure-responses` -> `azure.tools.webSearchPreview({searchContextSize})`, `azure-anthropic` -> `anthropic.tools.webSearch_20250305({maxUses, blockedDomains})`. For AI Gateway providers, maps model to base provider via `mapVertexAIGatewayModelToProviderId()`. Excluded domains converted from regex patterns via `mapRegexToPatterns()`. Also handles URL context tools: `vertex.tools.urlContext({})`, `google.tools.urlContext({})`, `anthropic.tools.webFetch_20250910({maxUses, blockedDomains})`. |
| **Trigger/Input** | `enableWebSearch` or `enableUrlContext` flag is true during parameter building |
| **Output/Effect** | Provider-defined tool(s) added to the tools map |
| **Complexity** | Medium |
| **Source Files** | `src/renderer/src/aiCore/prepareParams/parameterBuilder.ts`, `src/renderer/src/aiCore/utils/websearch.ts` |

### BL-055: Caching Wrapper (Higher-Order Function)

| Field | Value |
|---|---|
| **ID** | BL-055 |
| **Name** | Generic Async Function Cache Wrapper |
| **Feature Owner** | F006-mcp-tools |
| **Description** | Higher-order function `withCache()` that wraps any async function with TTL-based caching. Takes the original function, a cache key generator, TTL in milliseconds, and a log prefix. On call: checks `CacheService.has(key)`, returns cached value if present, otherwise executes the original function, stores result via `CacheService.set(key, result, ttl)`, and logs timing. Used in MCPService for caching tool lists and server metadata. |
| **Trigger/Input** | Any wrapped async function call |
| **Output/Effect** | Cached result returned if within TTL; fresh result computed and cached otherwise |
| **Complexity** | Low |
| **Source Files** | `src/main/services/MCPService.ts` |

---

## Summary Statistics

| Feature | Logic Items | Complexity Distribution |
|---|---|---|
| F001-app-core | 5 | 2 High, 3 Medium |
| F002-ai-provider | 5 | 2 High, 2 Medium, 1 Low |
| F003-chat-core | 7 | 4 High, 1 Medium, 2 Low |
| F004-settings-data | 4 | 1 High, 2 Medium, 1 Low |
| F005-chat-ui | 3 | 1 Medium, 2 Low |
| F006-mcp-tools | 6 | 3 High, 1 Medium, 2 Low |
| F007-knowledge | 4 | 2 High, 2 Medium |
| F008-memory | 5 | 2 High, 2 Medium, 1 Low |
| F009-agents | 3 | 2 High, 1 Low |
| F010-notes | 2 | 1 Medium, 1 Low |
| F011-translate | 4 | 1 Medium, 3 Low |
| F012-paintings | 2 | 1 Medium, 1 Low |
| Cross-Cutting | 5 | 3 High, 2 Medium |
| **Total** | **55** | **21 High, 18 Medium, 16 Low** |
