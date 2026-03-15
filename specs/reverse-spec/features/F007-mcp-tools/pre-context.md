# F007 - mcp-tools: Pre-Context

> MCP server management, tool execution, code tools, Python execution, OCR
> Tier 2, RG-5 | Dependencies: F001, F004, F005

---

## 1. Runtime Exploration Results

| Observation | Detail |
|---|---|
| MCP service (1151 lines) | Full MCP client implementation: stdio, SSE, StreamableHTTP, in-memory transports |
| Server lifecycle | initClient → startServer → stopServer → restartServer → removeServer → cleanup |
| Tool execution | callTool with caching, abort support, progress events, timeout handling |
| Resource/Prompt support | listResources, getResource, listPrompts, getPrompt with caching |
| Built-in MCP servers | brave-search, browser, didi-mcp, dify-knowledge, fetch, filesystem, hub, memory, python, sequentialthinking |
| OAuth support | McpOAuthClientProvider + CallBackServer for OAuth-based MCP servers |
| Notification handlers | ToolListChanged, ResourceListChanged, PromptListChanged, ResourceUpdated, Cancelled, LoggingMessage |
| Server logs | ServerLogBuffer tracks per-server log entries |
| CodeToolsService (1228 lines) | Terminal management, CLI tool execution, package management (bun/npm) |
| Code tools terminals | Preloads terminal configs, checks availability per platform |
| PythonService (99 lines) | Python script execution via subprocess |
| DxtService (479 lines) | DXT package management (install, list, update, remove) |
| MCP state (Redux) | Redux store for MCP server configs |
| Tool permissions | Separate store for tool-level permission management |
| OcrService | Not found in source (MISSING) — may be removed or renamed |

## 2. Source Reference

| File Path (Cherry Studio) | Role | Rebuild Target |
|---|---|---|
| src/main/services/McpService.ts (1151 lines) | MCP client management, tool calling, server lifecycle | [TBD] |
| src/main/mcpServers/factory.ts | In-memory MCP server factory | [TBD] |
| src/main/mcpServers/brave-search.ts | Built-in Brave Search MCP | [TBD] |
| src/main/mcpServers/browser/ | Built-in browser MCP server | [TBD] |
| src/main/mcpServers/didi-mcp.ts | Built-in DiDi MCP | [TBD] |
| src/main/mcpServers/dify-knowledge.ts | Built-in Dify Knowledge MCP | [TBD] |
| src/main/mcpServers/fetch.ts | Built-in fetch MCP | [TBD] |
| src/main/mcpServers/filesystem/ | Built-in filesystem MCP | [TBD] |
| src/main/mcpServers/hub/ | MCP hub server | [TBD] |
| src/main/mcpServers/memory.ts | Built-in memory MCP | [TBD] |
| src/main/mcpServers/python.ts | Built-in Python MCP | [TBD] |
| src/main/mcpServers/sequentialthinking.ts | Built-in sequential thinking MCP | [TBD] |
| src/main/services/CodeToolsService.ts (1228 lines) | Code tool runner, terminal management, package management | [TBD] |
| src/main/services/PythonService.ts (99 lines) | Python execution via subprocess | [TBD] |
| src/main/services/DxtService.ts (479 lines) | DXT package management | [TBD] |
| src/main/services/mcp/oauth/provider.ts | MCP OAuth client provider | [TBD] |
| src/main/services/mcp/oauth/callback.ts | OAuth callback server | [TBD] |
| src/main/services/mcp/ServerLogBuffer.ts | Per-server log buffer | [TBD] |
| src/renderer/src/store/mcp.ts | MCP state (server configs) | [TBD] |
| src/renderer/src/hooks/useMCPServers.ts | MCP hook for component use | [TBD] |
| src/renderer/src/store/toolPermissions.ts | Tool-level permissions state | [TBD] |

## 3. Source Behavior Inventory (SBI)

| ID | Behavior | Source Location |
|---|---|---|
| B196 | Initialize MCP client for server (stdio/SSE/HTTP/in-memory transport) | McpService.initClient |
| B197 | Start MCP server connection | McpService (implicit in initClient) |
| B198 | Stop MCP server and close client | McpService.stopServer |
| B199 | Restart MCP server (stop + reinit) | McpService.restartServer |
| B200 | Remove MCP server and cleanup | McpService.removeServer |
| B201 | List tools from MCP server (with caching) | McpService.listTools |
| B202 | List all tools from all active servers | McpService.listAllActiveServerTools |
| B203 | Call MCP tool with args, progress, and abort support | McpService.callTool |
| B204 | Call tool by ID (resolve server + tool from combined ID) | McpService.callToolById |
| B205 | Abort tool execution by call ID | McpService.abortTool |
| B206 | List resources from MCP server (with caching) | McpService.listResources |
| B207 | Get specific resource content | McpService.getResource |
| B208 | List prompts from MCP server (with caching) | McpService.listPrompts |
| B209 | Get specific prompt with arguments | McpService.getPrompt |
| B210 | Check MCP server connectivity | McpService.checkMcpConnectivity |
| B211 | Get MCP server version | McpService.getServerVersion |
| B212 | Get server log entries | McpService.getServerLogs |
| B213 | Handle OAuth authentication flow for MCP servers | McpOAuthClientProvider + CallBackServer |
| B214 | Handle MCP notifications (tool/resource/prompt list changes) | Notification handlers in initClient |
| B215 | Handle MCP logging messages | LoggingMessageNotificationSchema handler |
| B216 | Handle MCP progress events | Progress callback in callTool |
| B217 | Create in-memory MCP server (built-in servers) | createInMemoryMCPServer factory |
| B218 | Get install info for MCP tools | McpService.getInstallInfo |
| B219 | Cleanup all MCP connections on shutdown | McpService.cleanup |
| B220 | Code tools — preload available terminals | CodeToolsService.preloadTerminals |
| B221 | Code tools — get available terminals per platform | CodeToolsService.getAvailableTerminalsForPlatform |
| B222 | Code tools — run CLI tool in terminal | CodeToolsService.run |
| B223 | Code tools — check package installation status | CodeToolsService.isPackageInstalled |
| B224 | Code tools — get version info for CLI tool | CodeToolsService.getVersionInfo |
| B225 | Code tools — update package via bun/npm | CodeToolsService.updatePackage |
| B226 | Code tools — set/get/remove custom terminal path | CodeToolsService.setCustomTerminalPath etc. |
| B227 | Python — execute Python script | PythonService |
| B228 | DXT — install DXT package | DxtService (install) |
| B229 | DXT — list/update/remove DXT packages | DxtService (list, update, remove) |
| B230 | Tool permissions — manage per-tool allow/deny | toolPermissions store |

## 4. UI Component Features

| Component | Feature |
|---|---|
| MCP server settings | Server configuration (name, transport type, endpoint, env vars) |
| MCP server list | List of configured MCP servers with status indicators |
| Tool permissions UI | Per-tool allow/deny toggles |
| Code tools settings | Terminal selection, custom paths |

## 5. Interaction Behavior Inventory

| Interaction | Behavior |
|---|---|
| Add MCP server | User configures server (name, type, endpoint), connection tested |
| Toggle MCP server | Enable/disable server, triggers start/stop |
| View server tools | Expand server to see available tools list |
| Call tool from chat | Tool call triggered by LLM, executed via McpService.callTool |
| Abort tool execution | User cancels, abortTool called with callId |
| View server logs | Show log entries from ServerLogBuffer |
| OAuth flow | Server requires auth, OAuth callback server started, browser opened |
| Install CLI tool | CodeToolsService checks availability, installs via package manager |
| Run code tool | Terminal opened, command executed, output captured |

## 6. Foundation Decisions

| Decision | Choice | Rationale |
|---|---|---|
| MCP SDK | @modelcontextprotocol/sdk | Standard MCP client SDK, no change needed |
| State management | Zustand (replacing Redux) | New stack decision |
| Built-in servers | Evaluate which to include in core scope | Not all 12 built-in servers may be needed |
| Code tools | Keep terminal abstraction | Platform-specific terminal management is valuable |
| DXT support | Evaluate inclusion | DXT is Cherry-specific, may not apply to Angdu |

## 7. Foundation Dependencies

| Dependency | Feature | What is needed |
|---|---|---|
| F001 (shell) | IPC channels for MCP operations | IPC infrastructure for main↔renderer communication |
| F004 (provider-engine) | Model access for tool-using models | Provider API access for LLM tool-calling integration |
| F005 (chat-core) | Tool call integration in chat flow | Chat message flow triggers tool execution, results inserted |

## 8. Naming Remapping

| Cherry Studio | Angdu Studio |
|---|---|
| HOME_CHERRY_DIR | HOME_ANGDU_DIR |
| CherryHQ references | AngduStudio references |
| cherry-studio MCP paths | angdu-studio MCP paths |
| @cherrystudio references in MCP | @angdustudio equivalents |
| BuiltinMCPServerNames | BuiltinMCPServerNames (keep, content may change) |

## 9. Static Resources

| Resource | Location | Notes |
|---|---|---|
| Built-in MCP server configs | Bundled with app | Server definitions for built-in servers |
| DXT packages | {userData}/dxt/ | Installed DXT package files |

## 10. Environment Variables

| Variable | Purpose | Notes |
|---|---|---|
| Shell environment | Inherited by stdio MCP servers | getLoginShellEnvironment() used for PATH etc. |
| BUN_INSTALL | Bun installation path for code tools | Set dynamically during package operations |
| NPM_CONFIG_REGISTRY | NPM registry URL for package installation | Configurable |

## 11. Feature Contracts

### Provided Contracts (F007 provides to others)

| Contract | Consumer | Description |
|---|---|---|
| Tool execution API | F005 (chat-core) | Execute MCP tools and return results for chat |
| Tool list API | F005 (chat-core) | List available tools for LLM function calling |
| Resource access API | F005 (chat-core) | Access MCP resources for context |

### Required Contracts (F007 requires from others)

| Contract | Provider | Description |
|---|---|---|
| IPC infrastructure | F001 (shell) | IPC channel registration |
| Provider API | F004 (provider-engine) | Model access for tool-calling LLMs |
| Chat message flow | F005 (chat-core) | Integration point for tool calls in conversation |

## 12. For /speckit.specify

- MCP client must support all 4 transport types: stdio, SSE, StreamableHTTP, in-memory
- Tool caching strategy must be defined (invalidation on ToolListChanged notification)
- OAuth flow must work with external browser and callback server
- Built-in MCP servers to include in core scope must be decided
- Tool permissions must support per-tool granularity
- Code tools must handle platform-specific terminal differences (macOS/Linux/Windows)
- Abort support must propagate cancellation to MCP server

## 13. For /speckit.plan

- Phase 1: MCP client core (transport abstraction, client lifecycle)
- Phase 2: Tool execution (callTool, abort, progress)
- Phase 3: Resource and prompt support
- Phase 4: Built-in MCP servers (selected subset)
- Phase 5: OAuth support
- Phase 6: Code tools service (terminal management, package management)
- Phase 7: Zustand store for MCP state + tool permissions
- Phase 8: MCP settings UI
- Phase 9: Integration with chat-core (tool calling flow)

## 14. For /speckit.analyze

- McpService is 1151 lines — well-structured but large; consider splitting transport logic into separate module
- CodeToolsService at 1228 lines is the largest service — handles terminal management + package management; consider splitting
- OcrService referenced in feature definition but NOT FOUND in source — either removed or relocated
- DxtService is Cherry-specific — evaluate if DXT ecosystem applies to Angdu
- 12 built-in MCP servers is extensive — for core scope, consider starting with filesystem, fetch, memory, python
- OAuth flow adds complexity — may be Phase 2 if not core scope
- MCP SDK (@modelcontextprotocol/sdk) is stable and can be reused as-is
- Tool permissions store is separate from MCP store — good separation of concerns to maintain
- ServerLogBuffer is a useful pattern for debugging MCP connections — keep in rebuild
