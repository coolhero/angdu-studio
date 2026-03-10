import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { MCPServer } from '@shared/types/mcp'

export interface MCPStoreState {
  servers: MCPServer[]
  isUvInstalled: boolean
  isBunInstalled: boolean
  mcpEnabled: boolean

  // Actions
  setServers: (servers: MCPServer[]) => void
  addServer: (server: MCPServer) => void
  updateServer: (id: string, updates: Partial<MCPServer>) => void
  deleteServer: (id: string) => void
  setServerActive: (id: string, isActive: boolean) => void
  setIsUvInstalled: (installed: boolean) => void
  setIsBunInstalled: (installed: boolean) => void
  toggleMcpEnabled: () => void

  // Selectors
  getActiveServers: () => MCPServer[]
}

const DEFAULT_STATE = {
  servers: [] as MCPServer[],
  isUvInstalled: false,
  isBunInstalled: false,
  mcpEnabled: false,
}

export const useMCPStore = create<MCPStoreState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setServers: (servers) => set({ servers }),

      addServer: (server) =>
        set((state) => ({ servers: [...state.servers, server] })),

      updateServer: (id, updates) =>
        set((state) => ({
          servers: state.servers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),

      deleteServer: (id) =>
        set((state) => ({
          servers: state.servers.filter((s) => s.id !== id),
        })),

      setServerActive: (id, isActive) =>
        set((state) => ({
          servers: state.servers.map((s) => (s.id === id ? { ...s, isActive } : s)),
        })),

      setIsUvInstalled: (installed) => set({ isUvInstalled: installed }),
      setIsBunInstalled: (installed) => set({ isBunInstalled: installed }),
      toggleMcpEnabled: () => set((state) => ({ mcpEnabled: !state.mcpEnabled })),

      getActiveServers: () => {
        const state = useMCPStore.getState()
        return state.servers.filter((s) => s.isActive)
      },
    }),
    {
      name: 'angdu-mcp',
      version: 1,
      partialize: (state) => {
        const {
          setServers: _setServers,
          addServer: _addServer,
          updateServer: _updateServer,
          deleteServer: _deleteServer,
          setServerActive: _setServerActive,
          setIsUvInstalled: _setIsUvInstalled,
          setIsBunInstalled: _setIsBunInstalled,
          toggleMcpEnabled: _toggleMcpEnabled,
          getActiveServers: _getActiveServers,
          ...data
        } = state
        return data
      },
    },
  ),
)
