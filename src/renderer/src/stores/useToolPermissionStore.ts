import { create } from 'zustand'

import type { ToolPermissionRequest } from '@renderer/types/mcp'

export interface ToolPermissionStoreState {
  requests: ToolPermissionRequest[]

  // Actions
  addRequest: (request: ToolPermissionRequest) => void
  allowRequest: (requestId: string, resolvedInputs?: Record<string, unknown>) => void
  denyRequest: (requestId: string) => void
  submissionFailed: (requestId: string) => void
  clearAll: () => void
}

export const useToolPermissionStore = create<ToolPermissionStoreState>()((set) => ({
  requests: [],

  addRequest: (request) =>
    set((state) => ({ requests: [...state.requests, request] })),

  allowRequest: (requestId, resolvedInputs) =>
    set((state) => ({
      requests: state.requests.map((r) =>
        r.requestId === requestId
          ? { ...r, status: 'submitting-allow' as const, resolvedInputs: resolvedInputs ?? r.resolvedInputs }
          : r,
      ),
    })),

  denyRequest: (requestId) =>
    set((state) => ({
      requests: state.requests.map((r) =>
        r.requestId === requestId ? { ...r, status: 'submitting-deny' as const } : r,
      ),
    })),

  submissionFailed: (requestId) =>
    set((state) => ({
      requests: state.requests.map((r) =>
        r.requestId === requestId ? { ...r, status: 'pending' as const } : r,
      ),
    })),

  clearAll: () => set({ requests: [] }),
}))

// ── Selectors (referentially stable — no inline filter/map) ──

/** Get the first pending request (FIFO queue). */
export function getActivePermission(state: ToolPermissionStoreState): ToolPermissionRequest | undefined {
  return state.requests.find((r) => r.status === 'pending')
}

/** Get a request by toolCallId. */
export function getRequestByToolCallId(
  state: ToolPermissionStoreState,
  toolCallId: string,
): ToolPermissionRequest | undefined {
  return state.requests.find((r) => r.toolCallId === toolCallId)
}
