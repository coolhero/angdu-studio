import { describe, it, expect, vi, beforeEach } from 'vitest'

// Track registered handlers
const registeredHandlers = new Map<string, Function>()

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: Function) => {
      registeredHandlers.set(channel, handler)
    })
  }
}))

vi.mock('@shared/ipc-channels', () => ({
  IpcChannel: {
    Mcp_RestartServer: 'mcp:restart-server',
    Mcp_StopServer: 'mcp:stop-server',
    Mcp_RemoveServer: 'mcp:remove-server',
    Mcp_CheckConnectivity: 'mcp:check-connectivity',
    Mcp_GetServerVersion: 'mcp:get-server-version',
    Mcp_ListTools: 'mcp:list-tools',
    Mcp_CallTool: 'mcp:call-tool',
    Mcp_AbortTool: 'mcp:abort-tool',
    Mcp_ListPrompts: 'mcp:list-prompts',
    Mcp_GetPrompt: 'mcp:get-prompt',
    Mcp_ListResources: 'mcp:list-resources',
    Mcp_GetResource: 'mcp:get-resource',
    Mcp_GetServerLogs: 'mcp:get-server-logs'
  }
}))

const mockMcpService = {
  restartServer: vi.fn().mockResolvedValue(undefined),
  stopServer: vi.fn().mockResolvedValue(undefined),
  removeServer: vi.fn().mockResolvedValue(undefined),
  checkConnectivity: vi.fn().mockResolvedValue(true),
  getServerVersion: vi.fn().mockResolvedValue('1.0.0'),
  listTools: vi.fn().mockResolvedValue([]),
  callTool: vi.fn().mockResolvedValue({ content: [] }),
  abortTool: vi.fn().mockResolvedValue(true),
  listPrompts: vi.fn().mockResolvedValue([]),
  getPrompt: vi.fn().mockResolvedValue({}),
  listResources: vi.fn().mockResolvedValue([]),
  getResource: vi.fn().mockResolvedValue({ contents: [] }),
  getServerLogs: vi.fn().mockReturnValue([])
}

vi.mock('../../../src/main/services/MCPService', () => ({
  mcpService: mockMcpService
}))

describe('MCP IPC Handlers', () => {
  beforeEach(() => {
    registeredHandlers.clear()
    vi.clearAllMocks()
  })

  it('registers handlers for all expected channels', async () => {
    const { registerMcpIpc } = await import('@main/ipc/mcp-handlers')
    registerMcpIpc()

    const expectedChannels = [
      'mcp:restart-server',
      'mcp:stop-server',
      'mcp:remove-server',
      'mcp:check-connectivity',
      'mcp:get-server-version',
      'mcp:list-tools',
      'mcp:call-tool',
      'mcp:abort-tool',
      'mcp:list-prompts',
      'mcp:get-prompt',
      'mcp:list-resources',
      'mcp:get-resource',
      'mcp:get-server-logs'
    ]

    for (const channel of expectedChannels) {
      expect(registeredHandlers.has(channel), `Handler for ${channel} should be registered`).toBe(true)
    }
  })

  it('restart-server handler calls mcpService.restartServer', async () => {
    const { registerMcpIpc } = await import('@main/ipc/mcp-handlers')
    registerMcpIpc()

    const handler = registeredHandlers.get('mcp:restart-server')
    expect(handler).toBeDefined()

    const mockEvent = {} as Electron.IpcMainInvokeEvent
    const mockServer = { id: 's1', name: 'Test', isActive: true }

    await handler!(mockEvent, mockServer)
    expect(mockMcpService.restartServer).toHaveBeenCalledWith(mockEvent, mockServer)
  })

  it('list-tools handler calls mcpService.listTools', async () => {
    const { registerMcpIpc } = await import('@main/ipc/mcp-handlers')
    registerMcpIpc()

    const handler = registeredHandlers.get('mcp:list-tools')
    const mockEvent = {} as Electron.IpcMainInvokeEvent
    const mockServer = { id: 's1', name: 'Test', isActive: true }

    await handler!(mockEvent, mockServer)
    expect(mockMcpService.listTools).toHaveBeenCalledWith(mockEvent, mockServer)
  })

  it('call-tool handler calls mcpService.callTool', async () => {
    const { registerMcpIpc } = await import('@main/ipc/mcp-handlers')
    registerMcpIpc()

    const handler = registeredHandlers.get('mcp:call-tool')
    const mockEvent = {} as Electron.IpcMainInvokeEvent
    const mockArgs = { server: { id: 's1', name: 'Test', isActive: true }, name: 'tool1', args: {} }

    await handler!(mockEvent, mockArgs)
    expect(mockMcpService.callTool).toHaveBeenCalledWith(mockEvent, mockArgs)
  })
})
