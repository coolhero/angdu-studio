# Store API Contracts: Provider Management

**Feature**: 002-provider-management

## Zustand Stores

### useLlmStore

Primary store for provider and model state management.

```typescript
interface LlmState {
  // ── State ──
  providers: Provider[]
  defaultModel: Model
  topicNamingModel: Model
  quickModel: Model
  translateModel: Model
  settings: LlmSettings

  // ── Provider CRUD ──
  addProvider: (provider: Provider) => void           // Prepends to list
  removeProvider: (id: string) => void                // By ID (rejects system providers)
  updateProvider: (id: string, update: Partial<Provider>) => void
  updateAll: (providers: Provider[]) => void          // Replace entire provider list
  moveProvider: (id: string, position: number) => void // 1-indexed

  // ── Model CRUD ──
  addModel: (providerId: string, model: Model) => void    // Dedupe by ID, auto-enables provider
  removeModel: (providerId: string, modelId: string) => void
  updateModel: (providerId: string, modelId: string, update: Partial<Model>) => void

  // ── Default Model Setters ──
  setDefaultModel: (model: Model) => void
  setTopicNamingModel: (model: Model) => void
  setQuickModel: (model: Model) => void
  setTranslateModel: (model: Model) => void

  // ── CherryIN Tokens ──
  setCherryInTokens: (accessToken: string, refreshToken?: string) => void
  clearCherryInTokens: () => void
}
```

**Middleware**: `persist` (localStorage) + `broadcastSync` (BroadcastChannel for multi-window)

## React Hooks

### useProviders()

Returns enabled providers + CRUD operations.

```typescript
function useProviders(): {
  providers: Provider[]          // Enabled providers + CherryAI (normalized URLs)
  addProvider: (provider: Provider) => void
  removeProvider: (id: string) => void
  updateProvider: (id: string, update: Partial<Provider>) => void
  updateAll: (providers: Provider[]) => void
}
```

### useProvider(id: string)

Returns a single provider by ID with fallback + model operations.

```typescript
function useProvider(id: string): {
  provider: Provider             // Falls back to default if not found
  models: Model[]
  addModel: (model: Model) => void
  removeModel: (modelId: string) => void
  updateModel: (modelId: string, update: Partial<Model>) => void
}
```

### useSystemProviders()

Returns only system providers (`isSystem: true` AND `id in SystemProviderId`).

### useUserProviders()

Returns only user-created providers (non-system).

### useAllProviders()

Returns all providers regardless of enabled state.

## Selector Functions

```typescript
// All selectors normalize provider URLs (strip trailing slash)
selectEnabledProviders(state) => Provider[]    // Enabled + CherryAI appended
selectSystemProviders(state) => Provider[]     // Only system providers
selectUserProviders(state) => Provider[]       // Only user-created
selectAllProviders(state) => Provider[]        // All providers
```

## Preload API

### providerApi (exposed via contextBridge)

```typescript
const providerApi = {
  // Copilot OAuth
  copilot: {
    getAuthMessage: () => Promise<{ device_code, user_code, verification_uri }>
    getToken: (deviceCode: string) => Promise<{ access_token: string }>
    saveToken: (token: string) => Promise<void>
    getCopilotToken: () => Promise<{ token: string }>
    getUser: (token: string) => Promise<{ login, name, avatar_url }>
    logout: () => Promise<void>
  }

  // CherryIN OAuth
  cherryIn: {
    startOAuth: (oauthServer: string, apiHost?: string) => Promise<{ authUrl, state }>
    exchangeToken: (code: string, state: string) => Promise<{ apiKeys: string }>
    getBalance: (apiHost: string) => Promise<{ balance: number }>
    logout: (apiHost: string) => Promise<void>
    refreshToken: () => Promise<{ accessToken: string }>
    onOAuthCallback: (cb: (data: { code, state }) => void) => () => void
  }

  // Anthropic OAuth
  anthropic: {
    startOAuth: () => Promise<{ authUrl: string }>
    complete: (code: string) => Promise<{ accessToken: string }>
    getToken: () => Promise<{ accessToken: string }>
    clear: () => Promise<void>
    cancel: () => Promise<void>
    getStatus: () => Promise<{ isAuthed: boolean }>
  }

  // VertexAI Auth
  vertexAI: {
    getAccessToken: (params: VertexAIAuthParams) => Promise<{ token: string }>
    getAuthHeaders: (params: VertexAIAuthParams) => Promise<{ headers: Record<string, string> }>
    clearCache: (projectId?: string, clientEmail?: string) => Promise<void>
  }

  // Provider validation
  checkConnectivity: (provider: Provider) => Promise<{ ok, error?, models? }>
}
```
