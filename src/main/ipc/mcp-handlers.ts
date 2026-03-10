import { ipcMain } from 'electron'

import { IpcChannel } from '@shared/ipc-channels'
import type { MCPServer } from '@shared/types/mcp'
import { mcpService } from '../services/MCPService'

export function registerMcpIpc(): void {
  // ── Server Lifecycle ──

  ipcMain.handle(IpcChannel.Mcp_RestartServer, async (event, server: MCPServer) => {
    try {
      return await mcpService.restartServer(event, server)
    } catch (error) {
      throw new Error(`MCP restart-server failed: ${(error as Error).message}`)
    }
  })

  ipcMain.handle(IpcChannel.Mcp_StopServer, async (event, server: MCPServer) => {
    try {
      return await mcpService.stopServer(event, server)
    } catch (error) {
      throw new Error(`MCP stop-server failed: ${(error as Error).message}`)
    }
  })

  ipcMain.handle(IpcChannel.Mcp_RemoveServer, async (event, server: MCPServer) => {
    try {
      return await mcpService.removeServer(event, server)
    } catch (error) {
      throw new Error(`MCP remove-server failed: ${(error as Error).message}`)
    }
  })

  // ── Connectivity & Version ──

  ipcMain.handle(IpcChannel.Mcp_CheckConnectivity, async (event, server: MCPServer) => {
    try {
      return await mcpService.checkConnectivity(event, server)
    } catch (error) {
      throw new Error(`MCP check-connectivity failed: ${(error as Error).message}`)
    }
  })

  ipcMain.handle(IpcChannel.Mcp_GetServerVersion, async (event, server: MCPServer) => {
    try {
      return await mcpService.getServerVersion(event, server)
    } catch (error) {
      throw new Error(`MCP get-server-version failed: ${(error as Error).message}`)
    }
  })

  // ── Tools ──

  ipcMain.handle(IpcChannel.Mcp_ListTools, async (event, server: MCPServer) => {
    try {
      return await mcpService.listTools(event, server)
    } catch (error) {
      throw new Error(`MCP list-tools failed: ${(error as Error).message}`)
    }
  })

  ipcMain.handle(
    IpcChannel.Mcp_CallTool,
    async (event, args: { server: MCPServer; name: string; args: unknown; callId?: string }) => {
      try {
        return await mcpService.callTool(event, args)
      } catch (error) {
        throw new Error(`MCP call-tool failed: ${(error as Error).message}`)
      }
    },
  )

  ipcMain.handle(IpcChannel.Mcp_AbortTool, async (event, callId: string) => {
    try {
      return await mcpService.abortTool(event, callId)
    } catch (error) {
      throw new Error(`MCP abort-tool failed: ${(error as Error).message}`)
    }
  })

  // ── Prompts ──

  ipcMain.handle(IpcChannel.Mcp_ListPrompts, async (event, server: MCPServer) => {
    try {
      return await mcpService.listPrompts(event, server)
    } catch (error) {
      throw new Error(`MCP list-prompts failed: ${(error as Error).message}`)
    }
  })

  ipcMain.handle(
    IpcChannel.Mcp_GetPrompt,
    async (event, args: { server: MCPServer; name: string; args?: Record<string, string> }) => {
      try {
        return await mcpService.getPrompt(event, args)
      } catch (error) {
        throw new Error(`MCP get-prompt failed: ${(error as Error).message}`)
      }
    },
  )

  // ── Resources ──

  ipcMain.handle(IpcChannel.Mcp_ListResources, async (event, server: MCPServer) => {
    try {
      return await mcpService.listResources(event, server)
    } catch (error) {
      throw new Error(`MCP list-resources failed: ${(error as Error).message}`)
    }
  })

  ipcMain.handle(
    IpcChannel.Mcp_GetResource,
    async (event, args: { server: MCPServer; uri: string }) => {
      try {
        return await mcpService.getResource(event, args)
      } catch (error) {
        throw new Error(`MCP get-resource failed: ${(error as Error).message}`)
      }
    },
  )

  // ── Server Logs ──

  ipcMain.handle(IpcChannel.Mcp_GetServerLogs, async (event, server: MCPServer) => {
    try {
      return mcpService.getServerLogs(event, server)
    } catch (error) {
      throw new Error(`MCP get-server-logs failed: ${(error as Error).message}`)
    }
  })
}
