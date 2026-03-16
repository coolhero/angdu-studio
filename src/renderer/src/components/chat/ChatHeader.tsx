import { memo } from 'react'
import { Bot, PanelLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@renderer/components/ui/button'
import { useAssistantStore } from '@renderer/stores/useAssistantStore'
import { useTopicStore, useSidebarVisible } from '@renderer/stores/useTopicStore'
import { ModelSelector } from './ModelSelector'

interface ChatHeaderProps {
  onToggleSidebar: () => void
}

export const ChatHeader = memo(function ChatHeader({
  onToggleSidebar
}: ChatHeaderProps) {
  const { t } = useTranslation()
  const assistant = useAssistantStore((s) => s.getActiveAssistant())
  const sidebarVisible = useSidebarVisible()
  const activeTopicId = useTopicStore((s) => s.activeTopicId)
  const topics = useTopicStore((s) => s.topics)
  const activeTopic = topics.find((tp) => tp.id === activeTopicId)

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleSidebar}
          title={t('chat.toggleSidebar', 'Toggle sidebar')}
        >
          <PanelLeft className={`h-4 w-4 ${sidebarVisible ? 'text-primary' : ''}`} />
        </Button>
        <div className="flex items-center gap-1.5">
          <span className="text-base">{assistant.emoji ?? ''}</span>
          {!assistant.emoji && <Bot className="h-4 w-4 text-muted-foreground" />}
          <span className="text-sm font-medium">{assistant.name}</span>
        </div>
        <div className="mx-1 h-4 w-px bg-border" />
        <ModelSelector />
      </div>
      <div className="flex items-center gap-2">
        {activeTopic && (
          <span className="max-w-[200px] truncate text-xs text-muted-foreground">
            {activeTopic.name}
          </span>
        )}
      </div>
    </div>
  )
})
