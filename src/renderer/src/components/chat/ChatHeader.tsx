import { memo } from 'react'
import { Bot, PanelLeft, PanelRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@renderer/components/ui/button'
import { useAssistantStore } from '@renderer/stores/useAssistantStore'
import { useTopicStore } from '@renderer/stores/useTopicStore'
import { ModelSelector } from './ModelSelector'

interface ChatHeaderProps {
  onToggleAssistantPanel: () => void
  onToggleTopicSidebar: () => void
  assistantPanelVisible: boolean
  topicSidebarVisible: boolean
}

export const ChatHeader = memo(function ChatHeader({
  onToggleAssistantPanel,
  onToggleTopicSidebar,
  assistantPanelVisible,
  topicSidebarVisible
}: ChatHeaderProps) {
  const { t } = useTranslation()
  const assistant = useAssistantStore((s) => s.getActiveAssistant())
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
          onClick={onToggleAssistantPanel}
          title={t('chat.toggleAssistantPanel', '어시스턴트 패널')}
        >
          <PanelLeft className={`h-4 w-4 ${assistantPanelVisible ? 'text-primary' : ''}`} />
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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleTopicSidebar}
          title={t('chat.toggleTopicSidebar', '토픽 사이드바')}
        >
          <PanelRight className={`h-4 w-4 ${topicSidebarVisible ? 'text-primary' : ''}`} />
        </Button>
      </div>
    </div>
  )
})
