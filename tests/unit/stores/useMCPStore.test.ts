import { describe, it, expect, beforeEach } from 'vitest'

import { useMCPStore } from '../../../src/renderer/src/stores/useMCPStore'
import type { MCPServer } from '../../../src/shared/types/mcp'

function makeServer(overrides: Partial<MCPServer> = {}): MCPServer {
  return {
    id: `server-${Date.now()}-${Math.random()}`,
    name: 'Test Server',
    isActive: false,
    ...overrides
  }
}

describe('useMCPStore', () => {
  beforeEach(() => {
    useMCPStore.setState({
      servers: [],
      isUvInstalled: false,
      isBunInstalled: false
    })
  })

  describe('addServer', () => {
    it('adds a server to the list', () => {
      const server = makeServer({ id: 's1', name: 'My Server' })
      useMCPStore.getState().addServer(server)

      const state = useMCPStore.getState()
      expect(state.servers).toHaveLength(1)
      expect(state.servers[0].name).toBe('My Server')
    })

    it('appends multiple servers', () => {
      useMCPStore.getState().addServer(makeServer({ id: 's1', name: 'First' }))
      useMCPStore.getState().addServer(makeServer({ id: 's2', name: 'Second' }))

      expect(useMCPStore.getState().servers).toHaveLength(2)
    })
  })

  describe('updateServer', () => {
    it('modifies fields of an existing server', () => {
      const server = makeServer({ id: 's1', name: 'Original' })
      useMCPStore.getState().addServer(server)

      useMCPStore.getState().updateServer('s1', { name: 'Updated', description: 'desc' })

      const updated = useMCPStore.getState().servers[0]
      expect(updated.name).toBe('Updated')
      expect(updated.description).toBe('desc')
    })

    it('does not affect other servers', () => {
      useMCPStore.getState().addServer(makeServer({ id: 's1', name: 'First' }))
      useMCPStore.getState().addServer(makeServer({ id: 's2', name: 'Second' }))

      useMCPStore.getState().updateServer('s1', { name: 'Changed' })

      expect(useMCPStore.getState().servers[1].name).toBe('Second')
    })
  })

  describe('deleteServer', () => {
    it('removes a server from the list', () => {
      useMCPStore.getState().addServer(makeServer({ id: 's1' }))
      useMCPStore.getState().addServer(makeServer({ id: 's2' }))

      useMCPStore.getState().deleteServer('s1')

      const servers = useMCPStore.getState().servers
      expect(servers).toHaveLength(1)
      expect(servers[0].id).toBe('s2')
    })

    it('does nothing for non-existent id', () => {
      useMCPStore.getState().addServer(makeServer({ id: 's1' }))
      useMCPStore.getState().deleteServer('nonexistent')

      expect(useMCPStore.getState().servers).toHaveLength(1)
    })
  })

  describe('setServerActive', () => {
    it('toggles isActive to true', () => {
      useMCPStore.getState().addServer(makeServer({ id: 's1', isActive: false }))

      useMCPStore.getState().setServerActive('s1', true)

      expect(useMCPStore.getState().servers[0].isActive).toBe(true)
    })

    it('toggles isActive to false', () => {
      useMCPStore.getState().addServer(makeServer({ id: 's1', isActive: true }))

      useMCPStore.getState().setServerActive('s1', false)

      expect(useMCPStore.getState().servers[0].isActive).toBe(false)
    })
  })

  describe('setServers', () => {
    it('replaces the entire server list', () => {
      useMCPStore.getState().addServer(makeServer({ id: 's1', name: 'Old' }))

      const newServers = [
        makeServer({ id: 'n1', name: 'New1' }),
        makeServer({ id: 'n2', name: 'New2' })
      ]
      useMCPStore.getState().setServers(newServers)

      const servers = useMCPStore.getState().servers
      expect(servers).toHaveLength(2)
      expect(servers[0].name).toBe('New1')
      expect(servers[1].name).toBe('New2')
    })
  })
})
