# Pre-Context: Provider Management

**Feature ID**: F003
**Tier**: Tier 1
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/renderer/src/store/llm.ts` | Provider/model Redux slice |
| `src/renderer/src/types/provider.ts` | Provider and ProviderType definitions |
| `src/renderer/src/types/index.ts` | Model type definition (line 311) |
| `src/renderer/src/config/providers.ts` | System provider configurations |
| `src/renderer/src/config/models.ts` | Model configurations |
| `src/renderer/src/aiCore/provider/providerConfig.ts` | Provider adaptation pipeline |
| `src/renderer/src/aiCore/legacy/clients/ApiClientFactory.ts` | Client factory pattern |
| `src/main/services/CopilotService.ts` | GitHub Copilot OAuth flow |
| `src/main/services/CherryINOAuthService.ts` | CherryIN OAuth PKCE flow |
| `src/main/services/AnthropicService.ts` | Anthropic OAuth flow |
| `src/main/services/VertexAIService.ts` | Vertex AI auth token management |
| `src/renderer/src/pages/settings/ProviderSettings/` | Provider settings UI |

### Reference Guide

#### [New Stack] Logic-Only Reference
- Extract: Provider type taxonomy, API host normalization rules, OAuth flow sequences, API key rotation logic, system provider configurations
- Ignore: Redux llm slice patterns, Ant Design provider settings forms

### Static Resources

| Source Path | Type | Target Path | Usage |
|-------------|------|-------------|-------|
| `src/renderer/src/assets/images/providers/` | Image | `src/renderer/src/assets/images/providers/` | 80 provider logo images |

### Environment Variables

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| `API_KEY` | secret | No | Default AI provider API key | `sk-xxx` |
| `BASE_URL` | config | No | Default API base URL | `https://api.openai.com/v1` |
| `MODEL` | config | No | Default model name | `gpt-4o` |
| `MAIN_VITE_CHERRYAI_CLIENT_SECRET` | secret | No | CherryAI client secret (build-time) | — |
| `RENDERER_VITE_AIHUBMIX_SECRET` | secret | No | AihubMix OAuth secret | — |
| `RENDERER_VITE_PPIO_APP_SECRET` | secret | No | PPIO OAuth secret | — |

---

## For /speckit.specify

### Existing Feature Summary

Provider Management handles configuration and authentication for 50+ AI providers (OpenAI, Anthropic, Gemini, Azure, AWS Bedrock, VertexAI, Ollama, and many more). It manages API keys (with comma-separated rotation), API host normalization per provider type, OAuth flows (GitHub Copilot device code, CherryIN PKCE, Anthropic OAuth), and model catalog management.

### Existing User Scenarios

| Priority | Scenario | Description |
|----------|----------|-------------|
| P1 | Add Provider | User adds a new AI provider with API key and host; models become available |
| P1 | API Key Config | User enters API key; system validates by listing models |
| P1 | OAuth Login | User authenticates with Copilot/CherryIN/Anthropic via OAuth flow |
| P2 | Model Selection | User browses provider models, sets default/quick/translate models |
| P2 | Key Rotation | Provider has multiple comma-separated keys; system rotates between them |

### Draft Requirements

- **FR-016**: Implement provider store managing 50+ provider configurations with Zustand
- **FR-017**: Implement provider type taxonomy (openai/anthropic/gemini/azure/vertex/bedrock/mistral/ollama/etc.)
- **FR-018**: Implement API host normalization per provider type (Anthropic adds /v1, Gemini adds /v1beta, etc.)
- **FR-019**: Implement API key rotation for comma-separated keys
- **FR-020**: Implement GitHub Copilot OAuth device code flow
- **FR-021**: Implement CherryIN OAuth PKCE flow
- **FR-022**: Implement Anthropic OAuth flow
- **FR-023**: Implement Vertex AI service account authentication
- **FR-024**: Implement model catalog with capabilities tagging (text/vision/embedding/reasoning/function_calling)

### Draft Acceptance Criteria

- **SC-010**: Provider configuration persists across app restarts
- **SC-011**: API key rotation distributes calls across all configured keys
- **SC-012**: OAuth flows complete successfully and tokens refresh automatically
- **SC-013**: Provider type correctly determines API call format

### Edge Cases

- Invalid API key: graceful error message, don't crash
- OAuth callback timeout (5 minutes for MCP OAuth)
- Provider host with trailing # disables auto /v1 append
- NewAPI providers resolved to actual backend type dynamically

---

## For /speckit.plan

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-app-core | IPC | OAuth flows use IPC for secure token storage |
| F001-app-core | Config | Uses ConfigManager for persistent credential storage |

### Related Entities

#### Owned Entities

**Provider** — See entity-registry.md (18 fields including id, type, apiKey, apiHost, models[], enabled, authType)

**Model** — See entity-registry.md (12 fields including id, provider, name, capabilities, endpoint_type)

### Technical Decisions

#### [New Stack]
- **Existing logic summary**: Redux llm slice stores providers/models. ApiClientFactory maps provider types to SDK clients. OAuth services in main process handle token lifecycle.
- **Recommended implementation approach**: Zustand store for provider state. Keep OAuth services unchanged in main process. Provider adaptation pipeline logic is framework-agnostic and transfers directly.
- **Caveats**: 50+ system provider configurations need careful migration. Consider generating provider configs from a data file rather than hardcoding.

---

## For /speckit.analyze

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Provider config | F005 | Verify Provider type correctly maps to AI SDK config |
| Model capabilities | F005 | Verify function_calling capability flag determines tool use mode |
| OAuth tokens | F005, F012 | Verify tokens refresh before expiry in completion calls |

### Impact Scope When This Feature Changes

| Impact Target | Impact Type | Description |
|---------------|------------|-------------|
| F005 | Provider config | If Provider schema changes, AI completion pipeline needs updates |
| F006, F008 | Model reference | If Model schema changes, embedding model selection is affected |
| F010, F011 | Provider reference | If provider API changes, image gen and translation providers affected |
