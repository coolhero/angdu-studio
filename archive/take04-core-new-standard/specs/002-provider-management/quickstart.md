# Quickstart: Provider Management

**Feature**: 002-provider-management

## Integration Scenarios

### Scenario 1: Add Provider and Test Connectivity

```
1. User opens provider settings
2. User selects a system provider (e.g., OpenAI)
3. User enters API key
4. User clicks "Test Connection"
5. System sends test request to provider's API endpoint
6. System displays pass/fail result
7. User enables the provider
8. Provider's models become available in model selection
```

### Scenario 2: Complete CherryIN OAuth Flow

```
1. User clicks "Login with CherryIN" on the CherryIN provider
2. Renderer calls providerApi.cherryIn.startOAuth(oauthServer, apiHost)
3. Main process generates PKCE challenge + state, opens auth URL in browser
4. User authenticates in browser, grants permissions
5. Browser redirects to cherry-studio:// deep link
6. Main process receives callback, sends CherryIN_OAuthCallback event to renderer
7. Renderer calls providerApi.cherryIn.exchangeToken(code, state)
8. Main process exchanges code for tokens, fetches API keys
9. Tokens saved to LlmStore.settings.cherryIn
10. API keys set as provider's apiKey
11. Provider marked as authenticated (isAuthed: true)
```

### Scenario 3: GitHub Copilot Device Code Flow

```
1. User clicks "Authenticate" on the Copilot provider
2. Renderer calls providerApi.copilot.getAuthMessage()
3. Main process requests device code from GitHub
4. System displays: user_code + verification_uri to user
5. User visits verification_uri and enters code in browser
6. Renderer polls providerApi.copilot.getToken(device_code) with exponential backoff
7. GitHub returns access_token on successful authorization
8. Main process encrypts token with safeStorage and writes to file
9. Provider marked as authenticated
```

### Scenario 4: Custom Provider with Dual Endpoints

```
1. User creates a custom provider (type: openai)
2. User enters apiHost: https://api.example.com/v1
3. User optionally enters anthropicApiHost: https://api.example.com/anthropic
4. URL normalization strips trailing slashes
5. When a Claude model is used through this provider:
   - Request routes to anthropicApiHost instead of apiHost
6. When a non-Claude model is used:
   - Request routes to apiHost as normal
```

### Scenario 5: Default Model Configuration

```
1. User has multiple providers configured with various models
2. User selects a model as "Default Chat Model"
3. User selects a lightweight model as "Topic Naming Model"
4. User selects a model as "Quick Action Model"
5. User selects a model as "Translation Model"
6. All selections persist in LlmStore
7. New conversations use the default chat model
8. Auto-topic-naming uses the topic naming model
9. Quick assistant uses the quick action model
10. Translation panel uses the translation model
```

## Test Scenarios

### Unit Tests

- Provider CRUD operations on LlmStore (add, remove, update, reorder)
- Model CRUD operations (add with dedup, remove, update)
- URL normalization (trailing slash removal)
- Provider selector functions (enabled, system, user, all)
- System provider detection (isSystemProvider)
- Default model getters/setters
- CherryAI injection (always present in enabled list)

### Integration Tests

- Provider creation → persistence → reload → verify data intact
- Model addition → auto-enable provider → verify enabled state
- BroadcastChannel sync: state change in one window → reflected in another
- OAuth IPC round-trip: renderer → main → renderer callback

### Service Tests (Main Process)

- CopilotService: device code request, token polling, encryption/decryption
- CherryINOAuthService: PKCE generation, token exchange, host allowlisting
- AnthropicService: PKCE flow, code exchange, token refresh
- VertexAIService: private key formatting, auth client caching, token retrieval
