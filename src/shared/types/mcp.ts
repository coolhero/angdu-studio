// ── F006: MCP Types & Shared Infrastructure ──

// ── Server Types ──

export type McpServerType = 'stdio' | 'sse' | 'streamableHttp' | 'inMemory'

export type MCPServerInstallSource = 'builtin' | 'manual' | 'protocol'

export interface MCPConfigSample {
  command?: string
  args?: string[]
  env?: Record<string, string>
}

export interface MCPServer {
  id: string
  name: string
  type?: McpServerType
  description?: string
  baseUrl?: string
  command?: string
  registryUrl?: string
  args?: string[]
  env?: Record<string, string>
  headers?: Record<string, string>
  provider?: string
  providerUrl?: string
  logoUrl?: string
  tags?: string[]
  longRunning?: boolean
  timeout?: number
  dxtVersion?: string
  dxtPath?: string
  reference?: string
  searchKey?: string
  configSample?: MCPConfigSample
  disabledTools?: string[]
  disabledAutoApproveTools?: string[]
  shouldConfig?: boolean
  isActive: boolean
  installSource?: MCPServerInstallSource
  isTrusted?: boolean
  trustedAt?: number
  installedAt?: number
}

// ── Tool Types ──

export interface MCPTool {
  id: string
  serverId: string
  serverName: string
  name: string
  description?: string
  inputSchema: Record<string, unknown>
}

// ── Prompt Types ──

export interface PromptArgument {
  name: string
  description?: string
  required?: boolean
}

export interface MCPPrompt {
  id: string
  name: string
  description?: string
  arguments?: PromptArgument[]
  serverId: string
  serverName: string
}

// ── Resource Types ──

export interface MCPResource {
  uri: string
  name: string
  description?: string
  mimeType?: string
  serverId?: string
  serverName?: string
  size?: number
  text?: string
  blob?: string
}

// ── Tool Response Types ──

export type MCPToolResponseStatus = 'pending' | 'streaming' | 'cancelled' | 'invoking' | 'done' | 'error'

export interface MCPToolResponse {
  id: string
  tool: MCPTool
  arguments?: Record<string, unknown> | Record<string, unknown>[] | string
  status: MCPToolResponseStatus
  response?: unknown
  partialArguments?: string
  toolCallId?: string
  toolUseId?: string
  parentToolUseId?: string
}

export interface MCPToolResultContent {
  type: 'text' | 'image' | 'audio' | 'resource'
  text?: string
  data?: string
  mimeType?: string
  resource?: {
    uri?: string
    text?: string
    mimeType?: string
    blob?: string
  }
}

export interface MCPCallToolResponse {
  content: MCPToolResultContent[]
  isError?: boolean
}

// ── Resource Response ──

export interface GetResourceResponse {
  contents: MCPResource[]
}

// ── Progress Event ──

export interface MCPProgressEvent {
  callId: string
  progress: number
}

// ── Builtin Server Names ──

export const BuiltinMCPServerNames = {
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

export type BuiltinMCPServerName = (typeof BuiltinMCPServerNames)[keyof typeof BuiltinMCPServerNames]

export const BuiltinMCPServerNamesArray = Object.values(BuiltinMCPServerNames)

export function isBuiltinMCPServerName(name: string): name is BuiltinMCPServerName {
  return BuiltinMCPServerNamesArray.some((n) => n === name)
}

export function isBuiltinMCPServer(server: MCPServer): boolean {
  return server.type === 'inMemory' && isBuiltinMCPServerName(server.name)
}
