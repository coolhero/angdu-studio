import { useCallback } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@renderer/components/ui/button'
import { useTopicStore, useTopics, useActiveTopicId } from '@renderer/stores/useTopicStore'
import { useAssistantStore } from '@renderer/stores/useAssistantStore'
import { useMessageStore } from '@renderer/stores/useMessageStore'
import { useBlockStore } from '@renderer/stores/useBlockStore'
import { TopicList } from '@renderer/components/chat/TopicList'

export function TopicSidebar() {
  const { t } = useTranslation()
  const topics = useTopics()
  const activeTopicId = useActiveTopicId()

  const handleNewTopic = useCallback(async () => {
    const assistantId = useAssistantStore.getState().activeAssistantId
    const topic = await useTopicStore.getState().createTopic(assistantId)
    // Clear messages for new topic
    useMessageStore.getState().clearMessages()
    useBlockStore.getState().clearAll()
    await useMessageStore.getState().loadMessages(topic.id)
  }, [])

  const handleSelect = useCallback(async (id: string) => {
    useTopicStore.getState().setActiveTopicId(id)
    useBlockStore.getState().clearAll()
    await useMessageStore.getState().loadMessages(id)
  }, [])

  const handleRename = useCallback(async (id: string, name: string) => {
    await useTopicStore.getState().renameTopic(id, name)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm(t('chat.deleteTopicConfirm', '이 대화를 삭제하시겠습니까?'))) return
    await useTopicStore.getState().deleteTopic(id)
    // If this was the active topic, load the next one
    const { activeTopicId: newActiveId } = useTopicStore.getState()
    if (newActiveId) {
      useBlockStore.getState().clearAll()
      await useMessageStore.getState().loadMessages(newActiveId)
    } else {
      useMessageStore.getState().clearMessages()
      useBlockStore.getState().clearAll()
    }
  }, [t])

  return (
    <div className="flex h-full w-60 shrink-0 flex-col border-l border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <h3 className="text-sm font-semibold">{t('chat.topics', '대화 목록')}</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={handleNewTopic}
          title={t('chat.newTopic', '새 대화')}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      <TopicList
        topics={topics}
        activeTopicId={activeTopicId}
        onSelect={handleSelect}
        onRename={handleRename}
        onDelete={handleDelete}
      />
    </div>
  )
}
