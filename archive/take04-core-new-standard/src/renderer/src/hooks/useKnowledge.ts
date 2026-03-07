import { useEffect, useCallback, useMemo } from 'react'
import { useKnowledgeStore } from '../stores/useKnowledgeStore'
import type {
  KnowledgeItem,
  KnowledgeBaseParams,
  KBItemStatusPayload,
  KBDirectoryProgressPayload,
  Model
} from '@shared/types'

export function useKnowledge(baseId?: string) {
  const bases = useKnowledgeStore((s) => s.bases)
  const addBase = useKnowledgeStore((s) => s.addBase)
  const removeBase = useKnowledgeStore((s) => s.removeBase)
  const updateBase = useKnowledgeStore((s) => s.updateBase)
  const addItemToStore = useKnowledgeStore((s) => s.addItem)
  const removeItemFromStore = useKnowledgeStore((s) => s.removeItem)
  const updateItemStatus = useKnowledgeStore((s) => s.updateItemStatus)
  const clearCompletedProcessing = useKnowledgeStore((s) => s.clearCompletedProcessing)

  // Current base
  const base = useMemo(() => bases.find((b) => b.id === baseId), [bases, baseId])

  // ── Computed selectors ──

  const items = base?.items ?? []

  const fileItems = useMemo(() => items.filter((i) => i.type === 'file'), [items])
  const urlItems = useMemo(() => items.filter((i) => i.type === 'url'), [items])
  const sitemapItems = useMemo(() => items.filter((i) => i.type === 'sitemap'), [items])
  const directoryItems = useMemo(() => items.filter((i) => i.type === 'directory'), [items])
  const videoItems = useMemo(() => items.filter((i) => i.type === 'video'), [items])
  const noteItems = useMemo(() => items.filter((i) => i.type === 'note'), [items])

  // ── IPC event listeners ──

  useEffect(() => {
    const cleanupStatus = window.api?.knowledge?.onItemStatus((data: KBItemStatusPayload) => {
      updateItemStatus(data.baseId, data.itemId, data.status, data.progress, data.error)
    })

    const cleanupProgress = window.api?.knowledge?.onDirectoryProgress(
      (_data: KBDirectoryProgressPayload) => {
        // Directory progress is informational — could be used for UI progress bars
        // The item status update will handle the final state
      }
    )

    return () => {
      cleanupStatus?.()
      cleanupProgress?.()
    }
  }, [updateItemStatus])

  // ── IPC-calling methods ──

  const createBase = useCallback(
    async (params: KnowledgeBaseParams) => {
      const newBase = await window.api?.knowledge?.create(params)
      if (newBase) {
        addBase(newBase)
      }
      return newBase
    },
    [addBase]
  )

  const deleteBase = useCallback(
    async (id: string) => {
      await window.api?.knowledge?.delete(id)
      removeBase(id)
    },
    [removeBase]
  )

  const addFiles = useCallback(
    async (files: KnowledgeItem[]) => {
      if (!baseId) return
      for (const item of files) {
        addItemToStore(baseId, item)
        await window.api?.knowledge?.addItem(baseId, item)
      }
    },
    [baseId, addItemToStore]
  )

  const addUrl = useCallback(
    async (item: KnowledgeItem) => {
      if (!baseId) return
      addItemToStore(baseId, item)
      await window.api?.knowledge?.addItem(baseId, item)
    },
    [baseId, addItemToStore]
  )

  const addSitemap = useCallback(
    async (item: KnowledgeItem) => {
      if (!baseId) return
      addItemToStore(baseId, item)
      await window.api?.knowledge?.addItem(baseId, item)
    },
    [baseId, addItemToStore]
  )

  const addNote = useCallback(
    async (item: KnowledgeItem) => {
      if (!baseId) return
      addItemToStore(baseId, item)
      await window.api?.knowledge?.addItem(baseId, item)
    },
    [baseId, addItemToStore]
  )

  const addDirectory = useCallback(
    async (item: KnowledgeItem) => {
      if (!baseId) return
      addItemToStore(baseId, item)
      await window.api?.knowledge?.addItem(baseId, item)
    },
    [baseId, addItemToStore]
  )

  const addVideo = useCallback(
    async (item: KnowledgeItem) => {
      if (!baseId) return
      addItemToStore(baseId, item)
      await window.api?.knowledge?.addItem(baseId, item)
    },
    [baseId, addItemToStore]
  )

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!baseId) return
      await window.api?.knowledge?.removeItem(baseId, itemId)
      removeItemFromStore(baseId, itemId)
    },
    [baseId, removeItemFromStore]
  )

  const refreshItem = useCallback(
    async (item: KnowledgeItem) => {
      if (!baseId) return
      // Remove existing vectors, then re-add
      await window.api?.knowledge?.removeItem(baseId, item.id)
      updateItemStatus(baseId, item.id, 'pending', 0)
      await window.api?.knowledge?.addItem(baseId, item)
    },
    [baseId, updateItemStatus]
  )

  const migrateBase = useCallback(
    async (id: string, model: Model) => {
      if (!base) return
      // Reset the index and re-process all items with new model
      await window.api?.knowledge?.reset(id)
      updateBase(id, { model })
      // Re-add all items
      for (const item of base.items) {
        updateItemStatus(id, item.id, 'pending', 0)
        await window.api?.knowledge?.addItem(id, item)
      }
    },
    [base, updateBase, updateItemStatus]
  )

  const getNoteContent = useCallback(async (_noteId: string): Promise<string> => {
    // Notes are stored in Dexie — this will be handled by the renderer DB layer
    // Placeholder: return the content from the item directly
    const item = items.find((i) => i.id === _noteId)
    return typeof item?.content === 'string' ? item.content : ''
  }, [items])

  const updateNoteContent = useCallback(
    async (noteId: string, content: string) => {
      if (!baseId) return
      const { useKnowledgeStore: store } = await import('../stores/useKnowledgeStore')
      store.getState().updateItem(baseId, noteId, { content })
      // Re-process the note in the vector index
      const item = items.find((i) => i.id === noteId)
      if (item) {
        await window.api?.knowledge?.removeItem(baseId, noteId)
        await window.api?.knowledge?.addItem(baseId, { ...item, content })
      }
    },
    [baseId, items]
  )

  const clearCompleted = useCallback(() => {
    if (!baseId) return
    clearCompletedProcessing(baseId)
  }, [baseId, clearCompletedProcessing])

  return {
    // State
    bases,
    base,
    items,

    // Computed selectors
    fileItems,
    urlItems,
    sitemapItems,
    directoryItems,
    videoItems,
    noteItems,

    // Base operations
    createBase,
    deleteBase,
    updateBase,

    // Item operations
    addFiles,
    addUrl,
    addSitemap,
    addNote,
    addDirectory,
    addVideo,
    removeItem,
    refreshItem,

    // Other operations
    migrateBase,
    getNoteContent,
    updateNoteContent,
    clearCompleted
  }
}
