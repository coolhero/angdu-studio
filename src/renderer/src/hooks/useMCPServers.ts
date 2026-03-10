import { useCallback, useEffect, useRef } from 'react'

import type { MCPServer, MCPTool } from '@shared/types/mcp'
import { useMCPStore } from '@renderer/stores/useMCPStore'

/**
 * Hook that wraps MCP store actions with IPC calls.
 *
 * Subscribes to mcp:servers-changed and mcp:servers-updated events
 * and provides methods for server lifecycle management.
 */
export function useMCPServers() {
  const servers = useMCPStore((s) => s.servers)
  const isUvInstalled = useMCPStore((s) => s.isUvInstalled)
  const isBunInstalled = useMCPStore((s) => s.isBunInstalled)

  // ── IPC event subscriptions (run once on mount) ──

  const mountedRef = useRef(false)
  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true

    if (!window.api?.mcp) return

    const cleanupChanged = window.api.mcp.onServersChanged((updated: MCPServer[]) => {
      useMCPStore.getState().setServers(updated)
    })

    const cleanupUpdated = window.api.mcp.onServersUpdated((data: { id: string; updates: Partial<MCPServer> }) => {
      useMCPStore.getState().updateServer(data.id, data.updates)
    })

    return () => {
      cleanupChanged()
      cleanupUpdated()
    }
  }, [])

  // ── Actions (use getState() to avoid stale closures) ──

  const addServer = useCallback(async (server: MCPServer) => {
    useMCPStore.getState().addServer(server)
    if (server.isActive) {
      await window.api.mcp.restartServer(server)
    }
  }, [])

  const removeServer = useCallback(async (server: MCPServer) => {
    await window.api.mcp.removeServer(server)
    useMCPStore.getState().deleteServer(server.id)
  }, [])

  const toggleActive = useCallback(async (id: string, active: boolean) => {
    const server = useMCPStore.getState().servers.find((s) => s.id === id)
    if (!server) return

    if (active) {
      await window.api.mcp.restartServer({ ...server, isActive: true })
    } else {
      await window.api.mcp.stopServer({ ...server, isActive: false })
    }
    useMCPStore.getState().setServerActive(id, active)
  }, [])

  const restartServer = useCallback(async (server: MCPServer) => {
    await window.api.mcp.restartServer(server)
  }, [])

  const listTools = useCallback(async (server: MCPServer): Promise<MCPTool[]> => {
    return window.api.mcp.listTools(server)
  }, [])

  return {
    servers,
    isUvInstalled,
    isBunInstalled,
    addServer,
    removeServer,
    toggleActive,
    restartServer,
    listTools,
  }
}
