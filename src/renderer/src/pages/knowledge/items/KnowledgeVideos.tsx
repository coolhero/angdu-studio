import { useState } from 'react'
import { Plus, Trash2, Video } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { StatusIcon } from '@renderer/pages/knowledge/components/StatusIcon'
import type { KnowledgeItem } from '@shared/types/knowledge'

interface KnowledgeVideosProps {
  items: KnowledgeItem[]
  baseId: string
  onAddVideo: (url: string) => void
  onRemoveItem: (itemId: string) => void
}

export default function KnowledgeVideos({
  items,
  baseId,
  onAddVideo,
  onRemoveItem
}: KnowledgeVideosProps) {
  const [urlInput, setUrlInput] = useState('')
  const videoItems = items.filter((i) => i.type === 'video')

  const handleAdd = () => {
    const url = urlInput.trim()
    if (!url) return
    onAddVideo(url)
    setUrlInput('')
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Videos</h3>
      <div className="flex gap-2">
        <Input
          placeholder="https://youtube.com/watch?v=..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="text-sm"
        />
        <Button variant="outline" size="sm" onClick={handleAdd} disabled={!urlInput.trim()}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {videoItems.length > 0 && (
        <div className="divide-y divide-border rounded-md border border-border">
          {videoItems.map((item) => (
            <div key={item.id} className="group flex items-center gap-3 px-3 py-2">
              <StatusIcon status={item.status} error={item.error} />
              <Video className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-sm">{item.content}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500 opacity-0 group-hover:opacity-100"
                onClick={() => onRemoveItem(item.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
