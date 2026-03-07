# IPC Channel Contracts: Provider Management

**Feature**: 002-provider-management

## IPC Channels to Add to IpcChannel Enum

### Copilot Domain

| Channel Enum | Value | Direction | Params | Returns | Description |
|-------------|-------|-----------|--------|---------|-------------|
| `Copilot_GetAuthMessage` | `copilot:getAuthMessage` | R→M | none | `{ device_code, user_code, verification_uri }` | Request device code for GitHub OAuth |
| `Copilot_GetToken` | `copilot:getToken` | R→M | `{ device_code: string }` | `{ access_token: string }` | Poll for OAuth access token |
| `Copilot_SaveToken` | `copilot:saveToken` | R→M | `{ token: string }` | `void` | Encrypt and save access token |
| `Copilot_GetCopilotToken` | `copilot:getCopilotToken` | R→M | none | `{ token: string }` | Get short-lived Copilot API token |
| `Copilot_GetUser` | `copilot:getUser` | R→M | `{ token: string }` | `{ login, name, avatar_url }` | Get GitHub user profile |
| `Copilot_Logout` | `copilot:logout` | R→M | none | `void` | Delete stored token |

### CherryIN Domain

| Channel Enum | Value | Direction | Params | Returns | Description |
|-------------|-------|-----------|--------|---------|-------------|
| `CherryIN_StartOAuth` | `cherryIn:startOAuth` | R→M | `{ oauthServer: string, apiHost?: string }` | `{ authUrl: string, state: string }` | Start PKCE OAuth flow |
| `CherryIN_ExchangeToken` | `cherryIn:exchangeToken` | R→M | `{ code: string, state: string }` | `{ apiKeys: string }` | Exchange auth code for tokens + API keys |
| `CherryIN_GetBalance` | `cherryIn:getBalance` | R→M | `{ apiHost: string }` | `{ balance: number }` | Get account balance |
| `CherryIN_Logout` | `cherryIn:logout` | R→M | `{ apiHost: string }` | `void` | Revoke tokens and clear stored credentials |
| `CherryIN_RefreshToken` | `cherryIn:refreshToken` | R→M | none | `{ accessToken: string }` | Refresh access token |
| `CherryIN_OAuthCallback` | `cherryIn:oauthCallback` | M→R | `{ code: string, state: string }` | — | Deep link callback with auth code |

### Anthropic OAuth Domain

| Channel Enum | Value | Direction | Params | Returns | Description |
|-------------|-------|-----------|--------|---------|-------------|
| `AnthropicOAuth_Start` | `anthropicOAuth:start` | R→M | none | `{ authUrl: string }` | Start PKCE OAuth flow, open in browser |
| `AnthropicOAuth_Complete` | `anthropicOAuth:complete` | R→M | `{ code: string }` | `{ accessToken: string }` | Exchange auth code for tokens |
| `AnthropicOAuth_GetToken` | `anthropicOAuth:getToken` | R→M | none | `{ accessToken: string }` | Get valid access token (auto-refresh if expired) |
| `AnthropicOAuth_Clear` | `anthropicOAuth:clear` | R→M | none | `void` | Delete stored credentials |
| `AnthropicOAuth_Cancel` | `anthropicOAuth:cancel` | R→M | none | `void` | Cancel in-progress OAuth flow |
| `AnthropicOAuth_Status` | `anthropicOAuth:status` | R→M | none | `{ isAuthed: boolean }` | Check OAuth connection status |

### VertexAI Domain

| Channel Enum | Value | Direction | Params | Returns | Description |
|-------------|-------|-----------|--------|---------|-------------|
| `VertexAI_GetAccessToken` | `vertexAI:getAccessToken` | R→M | `{ projectId, serviceAccount }` | `{ token: string }` | Get access token from service account |
| `VertexAI_GetAuthHeaders` | `vertexAI:getAuthHeaders` | R→M | `{ projectId, serviceAccount }` | `{ headers: Record<string, string> }` | Get auth headers for HTTP requests |
| `VertexAI_ClearCache` | `vertexAI:clearCache` | R→M | `{ projectId?, clientEmail? }` | `void` | Clear auth client cache |

### Provider Domain

| Channel Enum | Value | Direction | Params | Returns | Description |
|-------------|-------|-----------|--------|---------|-------------|
| `Provider_CheckConnectivity` | `provider:checkConnectivity` | R→M | `{ provider: Provider }` | `{ ok: boolean, error?: string, models?: Model[] }` | Test provider API connectivity |

## IPC Handler Registration

All F002 IPC handlers registered in `src/main/ipc/provider.ipc.ts`, imported by `src/main/ipc/index.ts` via `registerAllHandlers()`.
