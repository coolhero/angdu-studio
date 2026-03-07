import { Plus } from 'lucide-react'
import { TopicItem } from './TopicItem'
import { Button } from '../ui/button'
import type { Topic } from '@shared/types'

interface TopicListProps {
  topics: Topic[]
  activeTopicId: string | undefined
  onSelectTopic: (id: string) => void
  onAddTopic: () => void
  onRenameTopic: (id: string, name: string) => void
  onPinTopic: (id: string) => void
  onUnpinTopic: (id: string) => void
  onDeleteTopic: (id: string) => void
}

export function TopicList({
  topics,
  activeTopicId,
  onSelectTopic,
  onAddTopic,
  onRenameTopic,
  onPinTopic,
  onUnpinTopic,
  onDeleteTopic
}: TopicListProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">Topics</span>
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onAddTopic}>
          <Plus size={14} />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        {topics.map((topic) => (
          <TopicItem
            key={topic.id}
            topic={topic}
            isActive={topic.id === activeTopicId}
            onSelect={onSelectTopic}
            onRename={onRenameTopic}
            onPin={onPinTopic}
            onUnpin={onUnpinTopic}
            onDelete={onDeleteTopic}
          />
        ))}
      </div>
    </div>
  )
}
