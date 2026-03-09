import { useCallback } from 'react'
import { useRuntimeStore } from '@renderer/stores/useRuntimeStore'

export function useChatContext() {
  const isMultiSelectMode = useRuntimeStore((s) => s.isMultiSelectMode)
  const selectedMessageIds = useRuntimeStore((s) => s.selectedMessageIds)
  const toggleMultiSelectStore = useRuntimeStore((s) => s.toggleMultiSelect)
  const selectMessageStore = useRuntimeStore((s) => s.selectMessage)
  const deselectMessageStore = useRuntimeStore((s) => s.deselectMessage)
  const clearSelectionStore = useRuntimeStore((s) => s.clearSelection)

  const toggleMultiSelect = useCallback(() => {
    toggleMultiSelectStore()
  }, [toggleMultiSelectStore])

  const selectMessage = useCallback(
    (id: string) => {
      selectMessageStore(id)
    },
    [selectMessageStore]
  )

  const deselectMessage = useCallback(
    (id: string) => {
      deselectMessageStore(id)
    },
    [deselectMessageStore]
  )

  const clearSelection = useCallback(() => {
    clearSelectionStore()
  }, [clearSelectionStore])

  return {
    isMultiSelectMode,
    selectedMessageIds,
    toggleMultiSelect,
    selectMessage,
    deselectMessage,
    clearSelection,
  }
}
