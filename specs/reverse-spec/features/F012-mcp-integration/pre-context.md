# F012 — MCP Integration — Pre-Context

> Feature ID: F012 | Tier: 2 | Release Group: RG-4

---

## Source Reference

| Key Source Files | Purpose |
|-----------------|---------|
| `src/renderer/src/types/mcp.ts` | MCPServer Zod schema, McpServerType, McpConfig types |
| `src/renderer/src/types/index.ts` | MCPToolResponse, MCPPrompt, MCPResource, MCPConfig types |
| `src/renderer/src/store/mcp.ts` | MCP server state management |
| `src/renderer/src/store/toolPermissions.ts` | Tool permission management |
| `src/main/services/MCPService.ts` | MCP server lifecycle: start, stop, restart, tool execution |
| `src/main/services/DxtService.ts` | DXT package upload and installation |
| `src/main/services/mcp/` | MCP server implementations |
| `src/main/ipc.ts` | Mcp_* IPC handlers |
| `src/renderer/src/pages/store/` | MCP server management UI |

---

## Source Behavior Inventory (SBI)

| ID | Source File | Function/Method | Behavior | Pri | Origin |
|----|-----------|----------------|----------|-----|--------|
| B140 | `types/mcp.ts` | `McpServerConfigSchema` | Zod schema with strict validation: id, name, type, command, args, env, url, timeout, etc. | P1 | Source |
| B141 | `types/mcp.ts` | `McpServerTypeSchema` | Server types: stdio, sse, streamableHttp, inMemory; URL-based inference | P1 | Source |
| B142 | `MCPService.ts` | `restartServer()` / `stopServer()` | Server lifecycle management | P1 | Source |
| B143 | `MCPService.ts` | `listTools()` | Lists available tools for a connected server | P1 | Source |
| B144 | `MCPService.ts` | `callTool()` / `abortTool()` | Execute tool call with arguments; abort running tool | P1 | Source |
| B145 | `MCPService.ts` | `listPrompts()` / `getPrompt()` | List and retrieve server prompts | P2 | Source |
| B146 | `MCPService.ts` | `listResources()` / `getResource()` | List and retrieve server resources | P2 | Source |
| B147 | `DxtService.ts` | `uploadDxt()` | Upload DXT file -> create temp file -> extract -> install as MCP server | P1 | Source |
| B148 | `types/mcp.ts` | `disabledTools` / `disabledAutoApproveTools` | Per-server tool permission lists | P1 | Source |
| B149 | `types/mcp.ts` | `isTrusted` / `trustedAt` | Trust system: untrusted servers require user confirmation before tool execution | P1 | Source |
| B150 | `types/mcp.ts` | `installSource` | Track where server was installed from: builtin, manual, protocol, unknown | P2 | Source |
| B151 | `types/index.ts` | `MCPToolResponseStatus` | Tool call lifecycle: pending -> streaming -> invoking -> done/error/cancelled | P1 | Source |
| B152 | `types/mcp.ts` | `getMcpServerType()` | URL ending in /mcp -> streamableHttp; else -> sse | P2 | Source |
| B153 | `MCPService.ts` | `getServerLogs()` / `getServerVersion()` | Server diagnostics | P2 | Source |
| B154 | `MCPService.ts` | `checkMcpConnectivity()` | Verify server is reachable and responsive | P2 | Source |
| B155 | `types/index.ts` | `MCPPrompt` / `MCPResource` | Prompt and resource types with server ID references | P2 | Source |

---

## For /speckit.specify Hints

- Define MCP server lifecycle (add -> configure -> start -> use -> stop -> remove)
- Specify tool execution flow (call -> stream args -> invoke -> get result)
- Document DXT installation protocol
- Define trust and permission model
- Specify server health check and connectivity verification

## For /speckit.plan Hints

- Task 1: MCP Zustand store with server state
- Task 2: Server management UI (add/edit/remove)
- Task 3: MCP client implementation (stdio, sse, streamableHttp)
- Task 4: Tool listing and execution
- Task 5: DXT upload and installation
- Task 6: Tool permission management
- Task 7: Prompt and resource management
- Task 8: Server logs and diagnostics

---

## Feature Contracts

| Direction | Feature | Contract |
|-----------|---------|----------|
| Depends on F001 | Electron Shell | IPC bridge, subprocess management |
| Depends on F008 | Data & Storage | DXT file handling, server config persistence |
| Provides to F006 | Chat Core | Assistant.mcpMode and mcpServers configuration |
| Provides to F010 | Chat Advanced | ToolMessageBlock data, MCPToolResponse |
