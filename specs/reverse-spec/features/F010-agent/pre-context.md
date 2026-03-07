# Pre-Context: F010-agent

## Feature Overview

**Feature:** Agent — Claude Code agent system, sessions, tool permissions, plugins.
**Tier:** 3
**SBI Range:** B311–B350

## Strategy

- **Approach:** Core scope, New Stack
- **Naming:** Cherry → Angdu, CherryStudio → AngduStudio, CherryIN → AngduIN

## Source Files (relative to /Users/coolhero/Develop/cherry-studio)

- `src/main/services/agents/` (entire directory)
- `src/main/services/agents/services/claudecode/index.ts`
- `src/main/services/agents/services/claudecode/tool-permissions.ts`
- `src/main/services/agents/services/AgentService.ts`
- `src/main/services/agents/services/SessionService.ts`
- `src/main/services/agents/services/SessionMessageService.ts`
- `src/main/services/agents/database/` (schema/, drizzle config)
- `src/main/services/CodeToolsService.ts`
- `src/renderer/src/hooks/agents/`
- `src/renderer/src/types/agent.ts`
- `src/renderer/src/pages/code/`

## SBI Inventory (B311–B350)

| SBI  | Name                                  | Priority |
|------|---------------------------------------|----------|
| B311 | AgentService.create                   | P1       |
| B312 | AgentService.update                   | P1       |
| B313 | AgentService.delete                   | P1       |
| B314 | SessionService.createSession          | P1       |
| B315 | SessionService.getSlashCommands       | P2       |
| B316 | SessionMessageService.streamMessage   | P1       |
| B317 | SessionMessageService.persistMessages | P1       |
| B318 | ClaudeCodeService.invoke              | P1       |
| B319 | ClaudeCodeService.setupMCPServers     | P1       |
| B320 | ToolPermissions.requestPermission     | P1       |
| B321 | ToolPermissions.autoApprove           | P1       |
| B322 | ToolPermissions.checkBuiltinTool      | P2       |
| B323 | CodeToolsService.run                  | P1       |
| B324 | CodeToolsService.getAvailableTerminals| P2       |
| B325–B330 | Plugin install/uninstall         | P2       |

## Naming Rules

- `claudeCodePlugin` IPC channel name → **keep as-is** (refers to the tool name, not the project name)
- All other occurrences: Cherry → Angdu, CherryStudio → AngduStudio

## Environment Variables

| Original                    | Renamed                     | Notes        |
|-----------------------------|-----------------------------|--------------|
| CHERRY_AUTO_ALLOW_TOOLS     | ANGDU_AUTO_ALLOW_TOOLS      | Feature flag |

## Dependencies

- **F001-app-core** — IPC infrastructure, database layer, window management
- **F002-ai-provider** — LLM invocation for agent responses
- **F003-chat** — Message types, conversation primitives
- **F005-auth** — User authentication for agent sessions
- **F006-mcp** — MCP server integration for Claude Code tool use
