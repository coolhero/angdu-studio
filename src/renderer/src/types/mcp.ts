// ── F006: Renderer-side MCP Types ──

// Re-export shared MCP types for renderer convenience
export type {
  McpServerType,
  MCPServerInstallSource,
  MCPConfigSample,
  MCPServer,
  MCPTool,
  MCPPrompt,
  PromptArgument,
  MCPResource,
  MCPToolResponseStatus,
  MCPToolResponse,
  MCPToolResultContent,
  MCPCallToolResponse,
  GetResourceResponse,
  MCPProgressEvent,
  BuiltinMCPServerName,
} from '@shared/types/mcp'

export {
  BuiltinMCPServerNames,
  BuiltinMCPServerNamesArray,
  isBuiltinMCPServerName,
  isBuiltinMCPServer,
} from '@shared/types/mcp'

// ── Permission Types (renderer-only) ──

export type PermissionStatus = 'pending' | 'submitting-allow' | 'submitting-deny' | 'invoking'

export interface PermissionUpdate {
  toolId: string
  permission: 'allow' | 'deny'
}

export interface ToolPermissionRequest {
  requestId: string
  toolName: string
  toolId: string
  toolCallId: string
  description?: string
  requiresPermissions: boolean
  input?: Record<string, unknown>
  inputPreview?: string
  createdAt: number
  expiresAt?: number
  suggestions?: PermissionUpdate[]
  autoApprove?: boolean
  status: PermissionStatus
  resolvedInputs?: Record<string, unknown>
  serverId?: string
  serverName?: string
}

// ── Server Log Entry (renderer-side) ──

export interface ServerLogEntry {
  timestamp: number
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  data?: unknown
}
