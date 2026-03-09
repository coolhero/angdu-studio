import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAssistantsStore } from '@renderer/stores/useAssistantsStore'
import { useRuntimeStore } from '@renderer/stores/useRuntimeStore'
import { useConfirmDialog } from '@renderer/hooks/useConfirmDialog'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import TopicItem from './components/TopicItem'
import AddButton from './components/AddButton'

const TopicsTab: React.FC = () => {
  const { t } = useTranslation()
  const { confirm } = useConfirmDialog()

  const activeAssistantId = useRuntimeStore((s) => s.activeAssistantId)
  const activeTopicId = useRuntimeStore((s) => s.activeTopicId)
  const setActiveTopic = useRuntimeStore((s) => s.setActiveTopic)

  const getAssistant = useAssistantsStore((s) => s.getAssistant)
  const addTopic = useAssistantsStore((s) => s.addTopic)
  const updateTopic = useAssistantsStore((s) => s.updateTopic)
  const removeTopic = useAssistantsStore((s) => s.removeTopic)
  const pinTopic = useAssistantsStore((s) => s.pinTopic)

  const assistant = activeAssistantId ? getAssistant(activeAssistantId) : undefined

  // Sort topics: pinned first, then by updatedAt descending
  const sortedTopics = useMemo(() => {
    if (!assistant) return []
    const topics = [...assistant.topics]
    topics.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
    return topics
  }, [assistant])

  const handleAdd = useCallback(() => {
    if (!activeAssistantId) return
    const topic = addTopic(activeAssistantId, {
      name: t('topic.default.name', 'New Topic'),
    })
    setActiveTopic(topic.id)
  }, [activeAssistantId, addTopic, setActiveTopic, t])

  const handleSelect = useCallback(
    (topicId: string) => {
      setActiveTopic(topicId)
    },
    [setActiveTopic]
  )

  const handleRename = useCallback(
    (topicId: string, name: string) => {
      if (!activeAssistantId) return
      updateTopic(activeAssistantId, topicId, { name, isNameManuallyEdited: true })
    },
    [activeAssistantId, updateTopic]
  )

  const handleDelete = useCallback(
    async (topicId: string) => {
      if (!activeAssistantId) return
      const confirmed = await confirm({
        title: t('topic.delete.title', 'Delete Topic'),
        description: t(
          'topic.delete.description',
          'Are you sure you want to delete this topic? All messages will be lost.'
        ),
        variant: 'destructive',
        confirmLabel: t('common.delete', 'Delete'),
      })
      if (confirmed) {
        removeTopic(activeAssistantId, topicId)
        if (topicId === activeTopicId) {
          const remaining = useAssistantsStore
            .getState()
            .getAssistant(activeAssistantId)?.topics
          if (remaining && remaining.length > 0) {
            setActiveTopic(remaining[0].id)
          } else {
            setActiveTopic(null)
          }
        }
      }
    },
    [activeAssistantId, activeTopicId, confirm, removeTopic, setActiveTopic, t]
  )

  const handleTogglePin = useCallback(
    (topicId: string, currentlyPinned: boolean) => {
      if (!activeAssistantId) return
      pinTopic(activeAssistantId, topicId, !currentlyPinned)
    },
    [activeAssistantId, pinTopic]
  )

  if (!assistant) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {t('sidebar.noAssistant', 'Select an assistant')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
        <span className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
          {t('sidebar.topics', 'Topics')}
        </span>
        <AddButton onClick={handleAdd} title={t('topic.add', 'Add Topic')} />
      </div>
      <ScrollArea className="flex-1 p-2">
        {sortedTopics.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {t('sidebar.noTopics', 'No topics yet')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {sortedTopics.map((topic) => (
              <TopicItem
                key={topic.id}
                topic={topic}
                isActive={topic.id === activeTopicId}
                onClick={() => handleSelect(topic.id)}
                onRename={(name) => handleRename(topic.id, name)}
                onDelete={() => handleDelete(topic.id)}
                onTogglePin={() => handleTogglePin(topic.id, !!topic.pinned)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

export default React.memo(TopicsTab)
