import { useShallow } from 'zustand/react/shallow'
import { useKnowledgeStore } from '@renderer/stores/useKnowledgeStore'
import { useAssistantStore } from '@renderer/stores/useAssistantStore'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { Label } from '@renderer/components/ui/label'
import { Switch } from '@renderer/components/ui/switch'
import type { KnowledgeBase } from '@shared/types/knowledge'

interface AssistantKBTabProps {
  assistantId: string
}

/**
 * Assistant settings: Knowledge Base tab.
 * Multi-select KB dropdown + recognition toggle.
 * Matches source AssistantKnowledgeBaseSettings.
 */
export default function AssistantKBTab({ assistantId }: AssistantKBTabProps) {
  const bases = useKnowledgeStore(useShallow((s) => s.bases))
  const assistants = useAssistantStore(useShallow((s) => s.assistants))
  const updateAssistant = useAssistantStore((s) => s.updateAssistant)

  const assistant = assistants.find((a) => a.id === assistantId)
  if (!assistant) return null

  const selectedIds = assistant.knowledge_bases ?? []

  const toggleKB = (kbId: string) => {
    const next = selectedIds.includes(kbId)
      ? selectedIds.filter((id) => id !== kbId)
      : [...selectedIds, kbId]
    updateAssistant(assistantId, { knowledge_bases: next })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Knowledge Bases</Label>
        <p className="text-xs text-muted-foreground">Select knowledge bases to attach to this assistant</p>
      </div>

      <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-2">
        {bases.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">No knowledge bases created yet</p>
        ) : (
          bases.map((kb: KnowledgeBase) => (
            <label
              key={kb.id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
            >
              <Checkbox
                checked={selectedIds.includes(kb.id)}
                onCheckedChange={() => toggleKB(kb.id)}
              />
              <span className="text-sm">{kb.name}</span>
            </label>
          ))
        )}
      </div>
    </div>
  )
}
