import { X, FileSearch } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useKnowledgeStore } from '@renderer/stores/useKnowledgeStore'
import { useAssistantStore } from '@renderer/stores/useAssistantStore'

/**
 * Green closable tags below the message input showing selected KB names.
 * Matches source KnowledgeBaseInput pattern: horizontal scroll, green tags, closable.
 */
export default function KBInputDisplay() {
  const bases = useKnowledgeStore(useShallow((s) => s.bases))
  const activeAssistant = useAssistantStore((s) => s.getActiveAssistant())
  const updateAssistant = useAssistantStore((s) => s.updateAssistant)

  const selectedIds = activeAssistant.knowledge_bases ?? []
  if (selectedIds.length === 0) return null

  const selectedBases = bases.filter((b) => selectedIds.includes(b.id))
  if (selectedBases.length === 0) return null

  const handleRemove = (kbId: string) => {
    const next = selectedIds.filter((id) => id !== kbId)
    updateAssistant(activeAssistant.id, { knowledge_bases: next })
  }

  return (
    <div className="flex gap-1.5 overflow-x-auto px-3 pb-1">
      {selectedBases.map((kb) => (
        <span
          key={kb.id}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400"
        >
          <FileSearch className="h-3 w-3" />
          <span className="max-w-[120px] truncate">{kb.name}</span>
          <button
            className="ml-0.5 rounded-full p-0.5 hover:bg-green-500/20"
            onClick={() => handleRemove(kb.id)}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
    </div>
  )
}
