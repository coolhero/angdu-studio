import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Slider } from '@renderer/components/ui/slider'
import type { KnowledgeBase } from '@shared/types/knowledge'
import { KNOWLEDGE_DEFAULTS } from '@shared/types/knowledge'

interface GeneralPanelProps {
  name: string
  documentCount: number
  onNameChange: (name: string) => void
  onDocumentCountChange: (count: number) => void
}

/**
 * KB General Settings: name, model selector, dimensions, documentCount slider.
 * Matches source GeneralSettingsPanel.
 */
export default function GeneralPanel({
  name,
  documentCount,
  onNameChange,
  onDocumentCountChange
}: GeneralPanelProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="kb-name">Name</Label>
        <Input
          id="kb-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Knowledge base name"
        />
      </div>

      <div className="space-y-2">
        <Label>Document Count (search results limit)</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[documentCount]}
            onValueChange={([v]) => onDocumentCountChange(v)}
            min={1}
            max={50}
            step={1}
            className="flex-1"
          />
          <span className="w-8 text-right text-sm text-muted-foreground">{documentCount}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Maximum number of search results per query (default: {KNOWLEDGE_DEFAULTS.documentCount})
        </p>
      </div>
    </div>
  )
}
