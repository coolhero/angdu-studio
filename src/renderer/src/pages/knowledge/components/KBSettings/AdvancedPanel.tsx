import { useState } from 'react'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { KNOWLEDGE_DEFAULTS } from '@shared/types/knowledge'

interface AdvancedPanelProps {
  chunkSize?: number
  chunkOverlap?: number
  threshold?: number
  onChunkSizeChange: (v: number | undefined) => void
  onChunkOverlapChange: (v: number | undefined) => void
  onThresholdChange: (v: number | undefined) => void
}

/**
 * KB Advanced Settings: chunkSize, chunkOverlap, threshold.
 * Validation: chunkOverlap must be < chunkSize.
 * Matches source AdvancedSettingsPanel.
 */
export default function AdvancedPanel({
  chunkSize,
  chunkOverlap,
  threshold,
  onChunkSizeChange,
  onChunkOverlapChange,
  onThresholdChange
}: AdvancedPanelProps) {
  const [overlapError, setOverlapError] = useState('')

  const handleOverlapChange = (value: string) => {
    const num = value ? parseInt(value, 10) : undefined
    if (num !== undefined && chunkSize !== undefined && num >= chunkSize) {
      setOverlapError('Overlap must be less than chunk size')
    } else {
      setOverlapError('')
    }
    onChunkOverlapChange(num)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Chunk Size</Label>
        <Input
          type="number"
          min={100}
          placeholder={String(KNOWLEDGE_DEFAULTS.chunkSize)}
          value={chunkSize ?? ''}
          onChange={(e) => onChunkSizeChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
        />
        <p className="text-xs text-muted-foreground">
          Text chunk size in characters (min 100, default: {KNOWLEDGE_DEFAULTS.chunkSize})
        </p>
      </div>

      <div className="space-y-2">
        <Label>Chunk Overlap</Label>
        <Input
          type="number"
          min={0}
          placeholder={String(KNOWLEDGE_DEFAULTS.chunkOverlap)}
          value={chunkOverlap ?? ''}
          onChange={(e) => handleOverlapChange(e.target.value)}
        />
        {overlapError && <p className="text-xs text-red-500">{overlapError}</p>}
        <p className="text-xs text-muted-foreground">
          Overlap between chunks (default: {KNOWLEDGE_DEFAULTS.chunkOverlap})
        </p>
      </div>

      <div className="space-y-2">
        <Label>Similarity Threshold</Label>
        <Input
          type="number"
          min={0}
          max={1}
          step={0.05}
          placeholder={String(KNOWLEDGE_DEFAULTS.threshold)}
          value={threshold ?? ''}
          onChange={(e) => onThresholdChange(e.target.value ? parseFloat(e.target.value) : undefined)}
        />
        <p className="text-xs text-muted-foreground">
          Minimum similarity score for search results (default: {KNOWLEDGE_DEFAULTS.threshold})
        </p>
      </div>
    </div>
  )
}
