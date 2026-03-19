import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@renderer/components/ui/button'
import { Checkbox } from '@renderer/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@renderer/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { useKnowledgeStore } from '@renderer/stores/useKnowledgeStore'
import type { KnowledgeBase } from '@shared/types/knowledge'

interface SaveToKBPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  content: string
  sourceType: 'message' | 'topic' | 'note'
}

const CONTENT_TYPES = [
  { value: 'text', label: 'Text content' },
  { value: 'code', label: 'Code blocks' },
  { value: 'thinking', label: 'Thinking blocks' }
]

/**
 * Save message/topic/note content to a knowledge base.
 * Matches source SaveToKnowledgePopup: content type checkboxes + KB selector.
 */
export default function SaveToKBPopup({
  open,
  onOpenChange,
  content,
  sourceType
}: SaveToKBPopupProps) {
  const bases = useKnowledgeStore(useShallow((s) => s.bases))
  const [selectedKBId, setSelectedKBId] = useState<string>('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['text'])
  const [saving, setSaving] = useState(false)

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleSave = async () => {
    if (!selectedKBId || !content.trim()) return
    setSaving(true)
    try {
      await window.api.invoke['kb:saveContent'](selectedKBId, content, 'note', `Saved from ${sourceType}`)
      useKnowledgeStore.getState().hydrate()
      onOpenChange(false)
    } catch (err) {
      console.error('[SaveToKBPopup] Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save to Knowledge Base</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Content types</p>
            {CONTENT_TYPES.map((ct) => (
              <label key={ct.value} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedTypes.includes(ct.value)}
                  onCheckedChange={() => toggleType(ct.value)}
                />
                <span className="text-sm">{ct.label}</span>
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Target Knowledge Base</p>
            <Select value={selectedKBId} onValueChange={setSelectedKBId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a knowledge base" />
              </SelectTrigger>
              <SelectContent>
                {bases.map((kb: KnowledgeBase) => (
                  <SelectItem key={kb.id} value={kb.id}>
                    {kb.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md bg-muted p-3">
            <p className="text-xs text-muted-foreground line-clamp-3">{content}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedKBId || saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
