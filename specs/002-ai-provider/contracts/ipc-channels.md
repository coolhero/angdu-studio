# IPC Channel Contract: F002-ai-provider

**Feature**: AI Provider
**Date**: 2026-03-08
**Status**: Draft

---

## 1. Provider Management (`provider:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `provider:add-key` | send(M→R) | `provider: Provider` | — | Notify renderer of provider key addition (from deep link or protocol) |

---

## 2. GitHub Copilot Auth (`copilot:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `copilot:get-auth-message` | invoke | — | `{ userCode: string, verificationUri: string }` | Initiate device auth flow |
| `copilot:get-copilot-token` | invoke | — | `string` | Exchange device code for Copilot token |
| `copilot:save-copilot-token` | invoke | `{ token: string, expiresAt: number }` | `void` | Save Copilot token |
| `copilot:get-token` | invoke | — | `string \| null` | Get cached Copilot token (refresh if expired) |
| `copilot:logout` | invoke | — | `void` | Clear Copilot auth state |
| `copilot:get-user` | invoke | — | `{ login: string, name?: string } \| null` | Get authenticated Copilot user info |

---

## 3. AngduIN Auth (`angduin:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `angduin:save-token` | invoke | `{ accessToken: string, refreshToken: string }` | `void` | Save AngduIN tokens |
| `angduin:has-token` | invoke | — | `boolean` | Check if AngduIN is authenticated |
| `angduin:get-balance` | invoke | — | `{ credits: number, plan: string }` | Get AngduIN balance info |
| `angduin:logout` | invoke | — | `void` | Clear AngduIN auth state |
| `angduin:start-oauth-flow` | invoke | — | `void` | Open system browser for AngduIN OAuth |
| `angduin:exchange-token` | invoke | `code: string` | `{ accessToken: string, refreshToken: string }` | Exchange OAuth code for tokens |

---

## 4. Gemini File Operations (`gemini:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `gemini:upload-file` | invoke | `{ filePath: string, mimeType: string, apiKey: string }` | `{ name: string, uri: string }` | Upload file to Gemini File API |
| `gemini:base64-file` | invoke | `{ name: string, apiKey: string }` | `string` | Get uploaded file content as base64 |
| `gemini:retrieve-file` | invoke | `{ name: string, apiKey: string }` | `{ state: string, uri: string }` | Check Gemini file processing status |
| `gemini:list-files` | invoke | `{ apiKey: string }` | `Array<{ name, uri, state }>` | List Gemini uploaded files |
| `gemini:delete-file` | invoke | `{ name: string, apiKey: string }` | `void` | Delete Gemini uploaded file |

---

## 5. Vertex AI Auth (`vertexai:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `vertexai:get-auth-headers` | invoke | `{ projectId: string, clientEmail: string, privateKey: string }` | `Record<string, string>` | Get OAuth2 headers from service account |
| `vertexai:get-access-token` | invoke | `{ projectId: string, clientEmail: string, privateKey: string }` | `string` | Get access token from service account |
| `vertexai:clear-auth-cache` | invoke | `{ projectId: string, clientEmail?: string }` | `void` | Clear cached auth for project |

---

## 6. Anthropic OAuth (`anthropic:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `anthropic:start-oauth-flow` | invoke | — | `{ url: string }` | Start Anthropic OAuth, return auth URL |
| `anthropic:complete-oauth-with-code` | invoke | `code: string` | `{ accessToken: string, refreshToken: string }` | Exchange auth code for tokens |
| `anthropic:cancel-oauth-flow` | invoke | — | `void` | Cancel in-progress OAuth flow |
| `anthropic:get-access-token` | invoke | — | `string` | Get valid access token (refresh if needed) |
| `anthropic:has-credentials` | invoke | — | `boolean` | Check if Anthropic OAuth is configured |
| `anthropic:clear-credentials` | invoke | — | `void` | Clear Anthropic OAuth credentials |

---

## 7. Encryption (`aes:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `aes:encrypt` | invoke | `{ text: string, secretKey: string, iv: string }` | `string` | AES encrypt a string |
| `aes:decrypt` | invoke | `{ encryptedData: string, iv: string, secretKey: string }` | `string` | AES decrypt a string |

---

## 8. AngduAI Signature (`angduai:*`)

| Channel | Direction | Parameters | Return Type | Description |
|---------|-----------|------------|-------------|-------------|
| `angduai:get-signature` | invoke | `params: Record<string, string>` | `{ signature: string, timestamp: number }` | Generate API signature for AngduAI requests |

---

## Consumed from F001

| Channel | Usage |
|---------|-------|
| `config:get` | Read proxy settings, API keys from secure config |
| `config:set` | Persist provider-related config |
| `proxy:set` | Apply proxy to provider HTTP clients |
| `store-sync:push` | Sync provider state changes across windows |
