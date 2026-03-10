# Research: F006 MCP Tools

**Date**: 2026-03-10
**Feature**: 006-mcp-tools

## R-001: MCP SDK Transport Types

**Decision**: Use `@modelcontextprotocol/sdk` v1.x with all four transport types: `StdioClientTransport`, `SSEClientTransport`, `StreamableHTTPClientTransport`, `InMemoryTransport`.

**Rationale**: The SDK provides all transport implementations. The original Cherry Studio uses the same SDK — no migration needed for the transport layer.

**Alternatives considered**:
- Custom transport implementation: Rejected — SDK transports are well-tested and maintained.
- Limiting to stdio+SSE only: Rejected — StreamableHTTP is increasingly common for cloud-hosted MCP servers.

## R-002: State Management Migration (Redux → Zustand)

**Decision**: Create two Zustand stores:
1. `useMCPStore` — server list CRUD, active toggle, package manager availability. Persisted via electron-store IPC.
2. `useToolPermissionStore` — runtime permission state machine. NOT persisted (session-only).

**Rationale**: The original Redux `mcp` slice has 7 simple actions and 2 selectors — direct Zustand conversion. Permission state is ephemeral (permissions are re-requested each session).

**Alternatives considered**:
- Single store for both: Rejected — permission state has different lifecycle (runtime vs persisted).
- Persist permission state: Rejected — stale permissions are a security risk.

## R-003: Shell Environment Resolution

**Decision**: Use `shell-env` or equivalent to read the user's login shell environment before spawning stdio processes. This ensures PATH, NVM_DIR, PYENV_ROOT, etc. are available.

**Rationale**: Without shell env resolution, stdio commands like `npx`, `uvx`, or Python commands may fail because the Electron main process doesn't inherit the user's shell PATH.

**Alternatives considered**:
- Manual PATH configuration per server: Rejected — poor UX, error-prone.
- Using `shell: true` in spawn options: Partially helpful but doesn't load login shell profile.

## R-004: Built-in Server Architecture

**Decision**: Each built-in server is a standalone module that exports a factory function. The `createInMemoryMCPServer()` factory creates an `InMemoryTransport` pair, connects the `Client` to the `Server` instance. 9 core built-in servers with `@angdu/` namespace.

**Rationale**: InMemoryTransport eliminates IPC overhead for built-in servers. The factory pattern keeps server implementations decoupled.

**Alternatives considered**:
- Running built-in servers as child processes: Rejected — unnecessary overhead for local-only servers.
- Single monolithic built-in server: Rejected — violates modularity, harder to enable/disable individually.

## R-005: UI Component Migration (Ant Design → shadcn/ui)

**Decision**: Migrate MCP Settings UI from Ant Design to shadcn/ui + Tailwind CSS 4:
- `Form` + `Form.Item` → `react-hook-form` + `zod` schemas + shadcn `FormField`
- `Tabs` → shadcn `Tabs`
- `Modal` → shadcn `Dialog`
- `Switch` → shadcn `Switch`
- `Select` → shadcn `Select`
- `Badge` → shadcn `Badge`
- `Input`/`TextArea` → shadcn `Input`/`Textarea`
- styled-components → Tailwind utility classes

**Rationale**: Consistent with project-wide migration. shadcn/ui provides unstyled, accessible primitives customizable with Tailwind.

**Alternatives considered**:
- Keep Ant Design for MCP pages only: Rejected — inconsistent UI, double bundle size.

## R-006: DXT Package Handling

**Decision**: DXT packages are uploaded via IPC as ArrayBuffer, extracted in the main process to a dedicated directory, and registered as MCP servers. The `DxtService` handles extraction, validation, and cleanup.

**Rationale**: DXT is the original Cherry Studio format. Maintaining compatibility allows reuse of existing DXT packages from the ecosystem.

## R-007: OAuth Authentication

**Decision**: Implement MCP OAuth client provider for authenticated SSE/HTTP connections. OAuth callback handled via a local HTTP server (redirect URI) that exchanges the auth code for tokens.

**Rationale**: Some MCP servers require OAuth for access. The SDK provides `OAuthClientProvider` interface — implement following the SDK contract.

## R-008: Connection Pooling Strategy

**Decision**: Use `Map<string, Client>` keyed by a hash of server config (baseUrl + command + args + registryUrl + env + id). Implement pending connection deduplication via `pendingClients` Map to prevent race conditions.

**Rationale**: Config-hash keying ensures the same server doesn't get multiple connections. Pending dedup handles concurrent init requests (e.g., multiple tool calls triggering connection simultaneously).

## R-009: Sensitive Field Redaction

**Decision**: Before logging tool call arguments, redact fields matching: `authorization`, `apiKey`, `api_key`, `token`, `access_token`, `secret`. Truncate string values > 300 characters.

**Rationale**: Prevents accidental exposure of credentials in logs and UI.
