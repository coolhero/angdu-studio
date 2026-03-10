# IPC Contracts: F006 MCP Tools

**Date**: 2026-03-10
**Feature**: 006-mcp-tools

## MCP Channels

All channels use `ipcMain.handle` / `ipcRenderer.invoke` (request/response) unless noted as `send` (push notification).

### Server Management

| Channel | Direction | Request | Response | Description |
|---------|-----------|---------|----------|-------------|
| `mcp:restart-server` | invoke | `MCPServer` | `void` | Restart MCP server |
| `mcp:stop-server` | invoke | `MCPServer` | `void` | Stop MCP server |
| `mcp:remove-server` | invoke | `MCPServer` | `void` | Remove MCP server and disconnect |
| `mcp:check-connectivity` | invoke | `MCPServer` | `{ connected: boolean; error?: string }` | Check server connectivity via ping |
| `mcp:get-server-version` | invoke | `MCPServer` | `string \| null` | Get MCP server version |
| `mcp:upload-dxt` | invoke | `{ buffer: ArrayBuffer; fileName: string }` | `void` | Upload and install DXT package |

### Tool Operations

| Channel | Direction | Request | Response | Description |
|---------|-----------|---------|----------|-------------|
| `mcp:list-tools` | invoke | `MCPServer` | `MCPTool[]` | List available tools from server |
| `mcp:call-tool` | invoke | `{ server: MCPServer; toolName: string; args: Record<string, unknown>; callId?: string }` | `MCPCallToolResponse` | Execute tool call with timeout |
| `mcp:abort-tool` | invoke | `string` (callId) | `void` | Abort in-progress tool call |

### Prompt & Resource Operations

| Channel | Direction | Request | Response | Description |
|---------|-----------|---------|----------|-------------|
| `mcp:list-prompts` | invoke | `MCPServer` | `MCPPrompt[]` | List prompts from server |
| `mcp:get-prompt` | invoke | `{ server: MCPServer; name: string; args?: Record<string, string> }` | `GetPromptResult` | Get prompt content |
| `mcp:list-resources` | invoke | `MCPServer` | `MCPResource[]` | List resources from server |
| `mcp:get-resource` | invoke | `{ server: MCPServer; uri: string }` | `ReadResourceResult` | Read resource content |

### Logging

| Channel | Direction | Request | Response | Description |
|---------|-----------|---------|----------|-------------|
| `mcp:get-server-logs` | invoke | `MCPServer` | `ServerLogEntry[]` | Get server log history |

### Event Channels (main → renderer push)

| Channel | Direction | Payload | Description |
|---------|-----------|---------|-------------|
| `mcp:add-server` | send(M→R) | `MCPServer` | New server added notification |
| `mcp:servers-changed` | send(M→R) | `MCPServer[]` | Server list changed |
| `mcp:servers-updated` | send(M→R) | `MCPServer[]` | Server status updated |
| `mcp:progress` | send(M→R) | `{ callId: string; progress: number; total?: number }` | Tool execution progress |
| `mcp:server-log` | send(M→R) | `{ serverId: string; entry: ServerLogEntry }` | Real-time log entry |

## Code Tools Channels

| Channel | Direction | Request | Response | Description |
|---------|-----------|---------|----------|-------------|
| `code-tools:run` | invoke | `{ code: string; language: string }` | `{ output: string; exitCode: number }` | Run code tool |
| `code-tools:get-available-terminals` | invoke | — | `Terminal[]` | List available terminals |
| `code-tools:set-custom-terminal-path` | invoke | `{ terminalId: string; path: string }` | `void` | Set custom terminal path |
| `code-tools:get-custom-terminal-path` | invoke | `string` (terminalId) | `string` | Get custom terminal path |
| `code-tools:remove-custom-terminal-path` | invoke | `string` (terminalId) | `void` | Remove custom terminal |

## Python Channel

| Channel | Direction | Request | Response | Description |
|---------|-----------|---------|----------|-------------|
| `python:execute` | send(R→M) | `{ code: string; env?: Record<string, string> }` | — | Execute Python code (fire-and-forget) |

## REST API Routes

| Method | Path | Auth | Request | Response | Description |
|--------|------|------|---------|----------|-------------|
| GET | `/v1/mcps` | Bearer | — | `{ success: boolean; data: MCPServer[] }` | List all MCP servers |
| GET | `/v1/mcps/:server_id` | Bearer | — | `{ success: boolean; data: MCPServer }` | Get server detail |
| ALL | `/v1/mcps/:server_id/mcp` | Bearer | MCP JSON-RPC | MCP JSON-RPC | Proxy MCP protocol to connected server |

## Preload API Surface

```typescript
// window.api.mcp
interface MCPPreloadAPI {
  listTools: (server: MCPServer) => Promise<MCPTool[]>
  callTool: (params: { server: MCPServer; toolName: string; args: Record<string, unknown>; callId?: string }) => Promise<MCPCallToolResponse>
  abortTool: (callId: string) => Promise<void>
  listPrompts: (server: MCPServer) => Promise<MCPPrompt[]>
  getPrompt: (params: { server: MCPServer; name: string; args?: Record<string, string> }) => Promise<GetPromptResult>
  listResources: (server: MCPServer) => Promise<MCPResource[]>
  getResource: (params: { server: MCPServer; uri: string }) => Promise<ReadResourceResult>
  restartServer: (server: MCPServer) => Promise<void>
  stopServer: (server: MCPServer) => Promise<void>
  removeServer: (server: MCPServer) => Promise<void>
  getServerVersion: (server: MCPServer) => Promise<string | null>
  getServerLogs: (server: MCPServer) => Promise<ServerLogEntry[]>
  checkConnectivity: (server: MCPServer) => Promise<{ connected: boolean; error?: string }>
  uploadDxt: (buffer: ArrayBuffer, fileName: string) => Promise<void>
  onServerLog: (callback: (entry: { serverId: string; entry: ServerLogEntry }) => void) => () => void
  onServersChanged: (callback: (servers: MCPServer[]) => void) => () => void
  onProgress: (callback: (progress: { callId: string; progress: number; total?: number }) => void) => () => void
}
```
