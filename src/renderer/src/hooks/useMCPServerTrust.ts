import { useCallback } from 'react'

import type { MCPServer } from '@shared/types/mcp'
import { useMCPStore } from '@renderer/stores/useMCPStore'
import { useConfirmDialog } from './useConfirmDialog'

/**
 * Hook for MCP server trust verification.
 *
 * If the server is already trusted, resolves immediately.
 * Otherwise shows a confirmation dialog and, if confirmed,
 * marks the server as trusted in the store.
 */
export function useMCPServerTrust() {
  const { confirm } = useConfirmDialog()
  const updateServer = useMCPStore((s) => s.updateServer)

  const ensureServerTrusted = useCallback(
    async (server: MCPServer): Promise<boolean> => {
      if (server.isTrusted) return true

      const confirmed = await confirm({
        title: `Trust "${server.name}"?`,
        description:
          `This MCP server wants to execute tools on your system. ` +
          `Only trust servers from sources you know and trust.`,
        confirmLabel: 'Trust',
        cancelLabel: 'Cancel',
        variant: 'destructive',
      })

      if (confirmed) {
        updateServer(server.id, { isTrusted: true, trustedAt: Date.now() })
        return true
      }

      return false
    },
    [confirm, updateServer],
  )

  return { ensureServerTrusted }
}
