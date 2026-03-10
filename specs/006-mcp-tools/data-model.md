# Data Model: F006 MCP Tools

**Date**: 2026-03-10
**Feature**: 006-mcp-tools

## Entity Relationship Overview

```
MCPServer (persisted, Zustand + electron-store)
  ├── has many MCPTool (runtime, fetched)
  ├── has many MCPPrompt (runtime, fetched)
  ├── has many MCPResource (runtime, fetched)
  ├── has many ServerLogEntry (runtime, ring buffer)
  └── referenced by Assistant (F003, via mcpServers[])

ToolPermissionRequest (runtime, Zustand)
  └── references MCPTool (via toolId)

MCPToolResponse (runtime, per-message)
  └── references MCPTool (via tool)
```

## Entities

### MCPServer

**Storage**: Zustand store (`useMCPStore`), persisted to electron-store via IPC
**Owner**: F006

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | yes | nanoid() | Internal UUID |
| name | string | yes | — | Server display name (unique key) |
| type | McpServerType | no | 'stdio' | 'stdio' \| 'sse' \| 'streamableHttp' \| 'inMemory' |
| description | string | no | '' | Server description |
| baseUrl | string | no | — | HTTP endpoint URL (for SSE/StreamableHTTP) |
| command | string | no | — | CLI command to spawn (for stdio) |
| registryUrl | string | no | — | Package registry URL |
| args | string[] | no | [] | Command arguments |
| env | Record<string, string> | no | {} | Environment variables |
| headers | Record<string, string> | no | {} | Custom HTTP headers |
| provider | string | no | — | Provider name (ModelScope, etc.) |
| providerUrl | string | no | — | Provider website URL |
| logoUrl | string | no | — | Server logo URL |
| tags | string[] | no | [] | Tags |
| longRunning | boolean | no | false | Long-running server flag |
| timeout | number | no | 60 | Timeout in seconds |
| dxtVersion | string | no | — | DXT package version |
| dxtPath | string | no | — | DXT extracted path |
| reference | string | no | — | Documentation link |
| searchKey | string | no | — | Marketplace search key |
| configSample | MCPConfigSample | no | — | Sample configuration |
| disabledTools | string[] | no | [] | Disabled tool names |
| disabledAutoApproveTools | string[] | no | [] | Tools needing manual approval |
| shouldConfig | boolean | no | false | Built-in needs config flag |
| isActive | boolean | yes | false | Running state |
| installSource | MCPServerInstallSource | no | 'manual' | 'builtin' \| 'manual' \| 'protocol' |
| isTrusted | boolean | no | false | User trust flag |
| trustedAt | number | no | — | Trust timestamp (epoch ms) |
| installedAt | number | no | — | Install timestamp (epoch ms) |

**Type definitions**:
```typescript
type McpServerType = 'stdio' | 'sse' | 'streamableHttp' | 'inMemory'
type MCPServerInstallSource = 'builtin' | 'manual' | 'protocol'

interface MCPConfigSample {
  command?: string
  args?: string[]
  env?: Record<string, string>
}
```

**Validation rules**:
- `name` must be non-empty and unique across all servers
- `type` determines required fields: stdio → `command` required; sse/streamableHttp → `baseUrl` required; inMemory → no connection params
- `timeout` must be > 0
- Built-in servers use `@angdu/` prefix for name

**State transitions**:
```
inactive → starting → active → stopping → inactive
                   → error → inactive (retry)
```

### MCPTool

**Storage**: Runtime only (fetched from connected MCP server via `listTools`)
**Owner**: F006

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| serverId | string | yes | Parent MCP server ID |
| serverName | string | yes | Parent MCP server name |
| name | string | yes | Tool name |
| description | string | no | Tool description |
| inputSchema | object | yes | JSON Schema for tool inputs |

**Composite key**: `serverId__toolName` (used as tool ID in AI pipeline)

### MCPPrompt

**Storage**: Runtime only (fetched via `listPrompts`)
**Owner**: F006

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Prompt identifier |
| name | string | yes | Prompt name |
| description | string | no | Prompt description |
| arguments | PromptArgument[] | no | Typed arguments |
| serverId | string | yes | Parent MCP server ID |
| serverName | string | yes | Parent MCP server name |

```typescript
interface PromptArgument {
  name: string
  description?: string
  required?: boolean
}
```

### MCPResource

**Storage**: Runtime only (fetched via `listResources`, from SDK)
**Owner**: F006

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| uri | string | yes | Resource URI |
| name | string | yes | Resource name |
| description | string | no | Resource description |
| mimeType | string | no | MIME type |

### MCPToolResponse

**Storage**: Runtime state (per-message, tracked during tool execution)
**Owner**: F006

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Response ID |
| tool | MCPTool | yes | Tool reference |
| arguments | Record<string, unknown> \| string | no | Tool call arguments |
| status | MCPToolResponseStatus | yes | Execution status |
| response | unknown | no | Tool execution result |
| partialArguments | string | no | Accumulated partial JSON during streaming |
| toolCallId | string | no | Tool call ID from AI SDK |
| toolUseId | string | no | Tool use ID |
| parentToolUseId | string | no | Parent tool use ID (nested calls) |

```typescript
type MCPToolResponseStatus = 'pending' | 'streaming' | 'cancelled' | 'invoking' | 'done' | 'error'
```

**State transitions**:
```
pending → streaming → invoking → done
pending → streaming → cancelled
pending → invoking → done
pending → invoking → error
streaming → cancelled
invoking → error
```

### MCPToolResultContent

**Storage**: Runtime (part of tool response)
**Owner**: F006

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | 'text' \| 'image' \| 'audio' \| 'resource' | yes | Content type |
| text | string | no | Text content |
| data | string | no | Base64-encoded binary data |
| mimeType | string | no | MIME type |
| resource | ResourceContent | no | Resource reference |

### ToolPermissionRequest

**Storage**: Zustand store (`useToolPermissionStore`), runtime only (NOT persisted)
**Owner**: F006

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| requestId | string | yes | Unique request ID |
| toolName | string | yes | Tool name |
| toolId | string | yes | Full tool ID (serverId__toolName) |
| toolCallId | string | yes | Tool call ID from AI SDK |
| description | string | no | Tool description |
| requiresPermissions | boolean | yes | Whether permission is needed |
| input | unknown | no | Tool call input |
| inputPreview | string | no | Formatted input preview |
| createdAt | number | yes | Request creation timestamp |
| expiresAt | number | no | Expiration timestamp |
| suggestions | PermissionUpdate[] | no | Suggested permission updates |
| autoApprove | boolean | no | Auto-approve flag |
| status | PermissionStatus | yes | Current status |
| resolvedInputs | Record<string, unknown> | no | User-modified inputs |

```typescript
type PermissionStatus = 'pending' | 'submitting-allow' | 'submitting-deny' | 'invoking'
```

**State transitions (BL-027)**:
```
pending → submitting-allow → invoking (resolved)
pending → submitting-deny → removed
submitting-allow → pending (on failure, retry)
submitting-deny → pending (on failure, retry)
```

### ServerLogEntry

**Storage**: Runtime ring buffer (200 entries per server), forwarded via IPC
**Owner**: F006

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| timestamp | number | yes | Log entry timestamp |
| level | 'debug' \| 'info' \| 'warn' \| 'error' | yes | Severity level |
| message | string | yes | Log message |
| data | unknown | no | Structured data |

### BuiltinMCPServerNames

**Storage**: Constant mapping
**Owner**: F006

```typescript
const BuiltinMCPServerNames = {
  memory: '@angdu/memory',
  sequentialThinking: '@angdu/sequentialthinking',
  braveSearch: '@angdu/brave-search',
  fetch: '@angdu/fetch',
  filesystem: '@angdu/filesystem',
  difyKnowledge: '@angdu/dify-knowledge',
  python: '@angdu/python',
  didiMCP: '@angdu/didi-mcp',
  browser: '@angdu/browser',
  hub: '@angdu/hub',
  mcpAutoInstall: '@angdu/mcp-auto-install',
  nowledgeMem: '@angdu/nowledge-mem',
} as const
```

## Store Definitions

### useMCPStore (Zustand, persisted)

```typescript
interface MCPStoreState {
  servers: MCPServer[]
  isUvInstalled: boolean
  isBunInstalled: boolean
}

interface MCPStoreActions {
  setServers: (servers: MCPServer[]) => void
  addServer: (server: MCPServer) => void
  updateServer: (id: string, updates: Partial<MCPServer>) => void
  deleteServer: (id: string) => void
  setServerActive: (id: string, isActive: boolean) => void
  setIsUvInstalled: (installed: boolean) => void
  setIsBunInstalled: (installed: boolean) => void
}

// Selectors
const getActiveServers = (state) => state.servers.filter(s => s.isActive)
const getAllServers = (state) => state.servers
```

### useToolPermissionStore (Zustand, runtime only)

```typescript
interface ToolPermissionStoreState {
  requests: ToolPermissionRequest[]
}

interface ToolPermissionStoreActions {
  addRequest: (request: ToolPermissionRequest) => void
  allowRequest: (requestId: string, resolvedInputs?: Record<string, unknown>) => void
  denyRequest: (requestId: string) => void
  submissionFailed: (requestId: string) => void
  clearAll: () => void
}

// Selectors
const getActivePermission = (state) => state.requests.find(r => r.status === 'pending')  // FIFO
const getRequestByToolCallId = (toolCallId: string) => (state) => state.requests.find(r => r.toolCallId === toolCallId)
```
