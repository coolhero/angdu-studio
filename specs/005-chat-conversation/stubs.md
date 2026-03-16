# F005 Chat Conversation — Dependency Stubs

> Guard 6c artifact. Stubs for behaviors that depend on future features.

| # | Stub Location | Description | Depends On | Expected Resolution Feature |
|---|---------------|-------------|------------|----------------------------|
| 1 | `components/chat/blocks/ToolBlock.tsx` | ToolBlock renders placeholder UI ("Tool use will be supported in a future update") | MCP/Tool integration | F007 (mcp-tools) |
| 2 | `components/chat/MessageInput.tsx` | Paperclip file attach button exists but no file upload processing pipeline | File handling / Knowledge base | F006 or F008 |
| 3 | `stores/useBlockStore.ts` | `tool_use` block type defined in schema but ToolBlock is placeholder | Tool execution | F007 (mcp-tools) |
