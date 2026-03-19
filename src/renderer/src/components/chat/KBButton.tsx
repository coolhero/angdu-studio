import { useState, useCallback } from 'react'
import { FileSearch, Plus, X } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@renderer/components/ui/popover'
import { Button } from '@renderer/components/ui/button'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { useKnowledgeStore } from '@renderer/stores/useKnowledgeStore'
import { useAssistantStore } from '@renderer/stores/useAssistantStore'
import type { KnowledgeBase } from '@shared/types/knowledge'
import { useNavigate } from 'react-router-dom'

interface KBButtonProps {
  disabled?: boolean
}

/**
 * Chat inputbar KB selection button.
 * Opens a QuickPanel with checkboxes for multi-selecting knowledge bases.
 * Matches source KnowledgeBaseButton pattern: FileSearch icon, QuickPanel,
 * +Add option, highlights when selected, disabled when files attached.
 */
export default function KBButton({ disabled = false }: KBButtonProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const bases = useKnowledgeStore(useShallow((s) => s.bases))
  const activeAssistant = useAssistantStore((s) => s.getActiveAssistant())
  const updateAssistant = useAssistantStore((s) => s.updateAssistant)

  const selectedIds = activeAssistant.knowledge_bases ?? []
  const hasSelection = selectedIds.length > 0

  const toggleKB = useCallback(
    (kbId: string) => {
      const current = activeAssistant.knowledge_bases ?? []
      const next = current.includes(kbId)
        ? current.filter((id) => id !== kbId)
        : [...current, kbId]
      updateAssistant(activeAssistant.id, { knowledge_bases: next })
    },
    [activeAssistant, updateAssistant]
  )

  const handleAddNew = () => {
    setOpen(false)
    navigate('/knowledge')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${hasSelection ? 'text-primary' : 'text-muted-foreground'}`}
          disabled={disabled}
          title="Knowledge Base"
        >
          <FileSearch className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="mb-1 px-2 text-xs font-medium text-muted-foreground">Knowledge Bases</div>
        <div className="max-h-48 space-y-0.5 overflow-y-auto">
          {bases.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">No knowledge bases yet</p>
          ) : (
            bases.map((kb: KnowledgeBase) => (
              <button
                key={kb.id}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                onClick={() => toggleKB(kb.id)}
              >
                <Checkbox
                  checked={selectedIds.includes(kb.id)}
                  className="pointer-events-none h-3.5 w-3.5"
                />
                <span className="truncate">{kb.name}</span>
              </button>
            ))
          )}
        </div>
        <div className="mt-1 border-t border-border pt-1">
          <button
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={handleAddNew}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Knowledge Base...</span>
          </button>
          {hasSelection && (
            <button
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-red-500 hover:bg-red-500/10"
              onClick={() => updateAssistant(activeAssistant.id, { knowledge_bases: [] })}
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
