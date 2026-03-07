# Pre-Context: MCP (Model Context Protocol)

**Feature ID**: F007
**Tier**: Tier 2
**Generated**: 2026-03-02

---

## Source Reference

**Source Root**: `$SOURCE_ROOT`

### Related Original File List

| File Path | Role |
|-----------|------|
| `src/main/services/MCPService.ts` | MCP service (server lifecycle, tool calls) |
| `src/main/mcpServers/` | Builtin MCP server implementations |
| `src/main/mcpServers/factory.ts` | Builtin server factory |
| `src/main/mcpServers/hub/` | Hub meta-server |
| `src/renderer/src/store/mcp.ts` | MCP Redux slice |
| `src/renderer/src/store/toolPermissions.ts` | Tool permission state |
| `src/renderer/src/types/index.ts` | MCPServer type (line 774) |
| `src/renderer/src/types/tool.ts` | MCPTool type |
| `packages/shared/mcp.ts` | MCP utility functions |

### Reference Guide

#### [New Stack] Logic-Only Reference
- Extract: Transport type handling (stdio/SSE/HTTP/inMemory), command resolution for npx/uvx, tool permission workflow, hub server aggregation logic, client caching/deduplication
- Ignore: Redux mcp/toolPermissions slices

### Static Resources

None.

### Environment Variables

| Variable | Category | Required | Description | Example |
|----------|----------|----------|-------------|---------|
| `DIDI_API_KEY` | secret | No | DiDi MCP server API key | — |

---

## For /speckit.specify

### Existing Feature Summary

MCP implements the Model Context Protocol for tool integration. Manages server lifecycle across 4 transport types (stdio, SSE, streamableHTTP, inMemory). Includes 11 builtin servers (memory, sequential-thinking, fetch, filesystem, browser, etc.). Hub server aggregates all active servers for auto mode. Tool permission system with pending/allow/deny states and input editing.

### Draft Requirements

- **FR-050**: Implement MCP server lifecycle management (connect, disconnect, restart)
- **FR-051**: Support 4 transport types: stdio, SSE, streamableHTTP, inMemory
- **FR-052**: Implement builtin MCP servers (memory, fetch, filesystem at minimum)
- **FR-053**: Implement hub meta-server that aggregates tools from all active servers
- **FR-054**: Implement tool permission system with auto-approve, manual approval, input editing
- **FR-055**: Implement MCP tool name namespacing (mcp__serverName__toolName, max 63 chars)
- **FR-056**: Implement command resolution for npx/uvx with fallback to bundled binaries

### Draft Acceptance Criteria

- **SC-028**: MCP server connects and lists tools within 5 seconds
- **SC-029**: Tool execution completes with result returned to AI model
- **SC-030**: Hub server correctly aggregates tools from all active servers
- **SC-031**: Permission system blocks unauthorized tool execution

---

## For /speckit.plan

### Preceding Feature Dependencies

| Dependency Target | Dependency Type | Specific Details |
|-------------------|----------------|-----------------|
| F001-app-core | IPC | MCP service runs in main process, exposed via IPC |
| F003-provider-management | None direct | MCP servers are independent of providers |

### Related Entities

#### Owned Entities

**MCPServer** — 28 fields
**MCPTool** — 9 fields
**MCPToolResponse** — 10 fields

---

## For /speckit.analyze

### Cross-Feature Verification Points

| Verification Item | Target Feature | Verification Content |
|-------------------|---------------|---------------------|
| Tool availability | F005 | Verify tools listed correctly in completion function calling |
| Tool blocks | F004 | Verify ToolBlock renders tool call/result correctly |
| API proxy | F012 | Verify MCP proxy endpoint works for external clients |
