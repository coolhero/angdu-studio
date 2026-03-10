import { describe, it, expect, beforeEach } from 'vitest'

import {
  useToolPermissionStore,
  getActivePermission
} from '../../../src/renderer/src/stores/useToolPermissionStore'
import type { ToolPermissionRequest } from '../../../src/renderer/src/types/mcp'

function makeRequest(overrides: Partial<ToolPermissionRequest> = {}): ToolPermissionRequest {
  return {
    requestId: `req-${Date.now()}-${Math.random()}`,
    toolName: 'test-tool',
    toolId: 'tool-1',
    toolCallId: `call-${Math.random()}`,
    requiresPermissions: true,
    createdAt: Date.now(),
    status: 'pending',
    ...overrides
  }
}

describe('useToolPermissionStore', () => {
  beforeEach(() => {
    useToolPermissionStore.getState().clearAll()
  })

  describe('addRequest', () => {
    it('adds a pending request', () => {
      const request = makeRequest({ requestId: 'r1' })
      useToolPermissionStore.getState().addRequest(request)

      const state = useToolPermissionStore.getState()
      expect(state.requests).toHaveLength(1)
      expect(state.requests[0].requestId).toBe('r1')
      expect(state.requests[0].status).toBe('pending')
    })
  })

  describe('allowRequest', () => {
    it('transitions status to submitting-allow', () => {
      const request = makeRequest({ requestId: 'r1' })
      useToolPermissionStore.getState().addRequest(request)

      useToolPermissionStore.getState().allowRequest('r1')

      const updated = useToolPermissionStore.getState().requests[0]
      expect(updated.status).toBe('submitting-allow')
    })

    it('preserves resolvedInputs when provided', () => {
      const request = makeRequest({ requestId: 'r1' })
      useToolPermissionStore.getState().addRequest(request)

      const inputs = { path: '/tmp' }
      useToolPermissionStore.getState().allowRequest('r1', inputs)

      const updated = useToolPermissionStore.getState().requests[0]
      expect(updated.resolvedInputs).toEqual(inputs)
    })
  })

  describe('denyRequest', () => {
    it('transitions status to submitting-deny', () => {
      const request = makeRequest({ requestId: 'r1' })
      useToolPermissionStore.getState().addRequest(request)

      useToolPermissionStore.getState().denyRequest('r1')

      const updated = useToolPermissionStore.getState().requests[0]
      expect(updated.status).toBe('submitting-deny')
    })
  })

  describe('getActivePermission', () => {
    it('returns the first pending request (FIFO)', () => {
      const r1 = makeRequest({ requestId: 'r1', status: 'pending' })
      const r2 = makeRequest({ requestId: 'r2', status: 'pending' })

      useToolPermissionStore.getState().addRequest(r1)
      useToolPermissionStore.getState().addRequest(r2)

      const active = getActivePermission(useToolPermissionStore.getState())
      expect(active?.requestId).toBe('r1')
    })

    it('skips non-pending requests', () => {
      const r1 = makeRequest({ requestId: 'r1', status: 'pending' })
      useToolPermissionStore.getState().addRequest(r1)
      useToolPermissionStore.getState().allowRequest('r1')

      const r2 = makeRequest({ requestId: 'r2', status: 'pending' })
      useToolPermissionStore.getState().addRequest(r2)

      const active = getActivePermission(useToolPermissionStore.getState())
      expect(active?.requestId).toBe('r2')
    })

    it('returns undefined when no pending requests', () => {
      const active = getActivePermission(useToolPermissionStore.getState())
      expect(active).toBeUndefined()
    })
  })

  describe('submissionFailed', () => {
    it('resets status back to pending', () => {
      const request = makeRequest({ requestId: 'r1' })
      useToolPermissionStore.getState().addRequest(request)
      useToolPermissionStore.getState().allowRequest('r1')

      // Verify it's in submitting-allow
      expect(useToolPermissionStore.getState().requests[0].status).toBe('submitting-allow')

      useToolPermissionStore.getState().submissionFailed('r1')

      expect(useToolPermissionStore.getState().requests[0].status).toBe('pending')
    })
  })

  describe('clearAll', () => {
    it('removes all requests', () => {
      useToolPermissionStore.getState().addRequest(makeRequest())
      useToolPermissionStore.getState().addRequest(makeRequest())

      useToolPermissionStore.getState().clearAll()

      expect(useToolPermissionStore.getState().requests).toHaveLength(0)
    })
  })
})
