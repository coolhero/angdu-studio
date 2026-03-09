import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAssistantsStore } from '@renderer/stores/useAssistantsStore'
import { useRuntimeStore } from '@renderer/stores/useRuntimeStore'
import { useConfirmDialog } from '@renderer/hooks/useConfirmDialog'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import AssistantItem from './components/AssistantItem'
import AddButton from './components/AddButton'

const AssistantsTab: React.FC = () => {
  const { t } = useTranslation()
  const { confirm } = useConfirmDialog()

  const assistants = useAssistantsStore((s) => s.assistants)
  const addAssistant = useAssistantsStore((s) => s.addAssistant)
  const removeAssistant = useAssistantsStore((s) => s.removeAssistant)
  const tags = useAssistantsStore((s) => s.tags)

  const activeAssistantId = useRuntimeStore((s) => s.activeAssistantId)
  const setActiveAssistant = useRuntimeStore((s) => s.setActiveAssistant)
  const setActiveTopic = useRuntimeStore((s) => s.setActiveTopic)

  const handleAdd = useCallback(() => {
    const assistant = addAssistant({
      name: t('assistant.default.name', 'New Assistant'),
      prompt: '',
      type: 'chat',
      emoji: '🤖',
    })
    setActiveAssistant(assistant.id)
    if (assistant.topics.length > 0) {
      setActiveTopic(assistant.topics[0].id)
    }
  }, [addAssistant, setActiveAssistant, setActiveTopic, t])

  const handleSelect = useCallback(
    (id: string) => {
      setActiveAssistant(id)
      const assistant = useAssistantsStore.getState().getAssistant(id)
      if (assistant && assistant.topics.length > 0) {
        setActiveTopic(assistant.topics[0].id)
      } else {
        setActiveTopic(null)
      }
    },
    [setActiveAssistant, setActiveTopic]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmed = await confirm({
        title: t('assistant.delete.title', 'Delete Assistant'),
        description: t(
          'assistant.delete.description',
          'Are you sure you want to delete this assistant? This action cannot be undone.'
        ),
        variant: 'destructive',
        confirmLabel: t('common.delete', 'Delete'),
      })
      if (confirmed) {
        removeAssistant(id)
        // If we deleted the active assistant, select the first remaining one
        if (id === activeAssistantId) {
          const remaining = useAssistantsStore.getState().assistants
          if (remaining.length > 0) {
            handleSelect(remaining[0].id)
          }
        }
      }
    },
    [confirm, removeAssistant, activeAssistantId, handleSelect, t]
  )

  // Group assistants by tags
  const grouped = useMemo(() => {
    const tagOrder = tags.order
    const untagged: typeof assistants = []
    const tagMap = new Map<string, typeof assistants>()

    for (const tag of tagOrder) {
      tagMap.set(tag, [])
    }

    for (const assistant of assistants) {
      if (assistant.tags && assistant.tags.length > 0) {
        for (const tag of assistant.tags) {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, [])
          }
          tagMap.get(tag)!.push(assistant)
        }
      } else {
        untagged.push(assistant)
      }
    }

    const hasTags = tagMap.size > 0 && assistants.some((a) => a.tags && a.tags.length > 0)
    return { tagMap, untagged, hasTags }
  }, [assistants, tags.order])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
        <span className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
          {t('sidebar.assistants', 'Assistants')}
        </span>
        <AddButton onClick={handleAdd} title={t('assistant.add', 'Add Assistant')} />
      </div>
      <ScrollArea className="flex-1 p-2">
        {grouped.hasTags ? (
          <>
            {Array.from(grouped.tagMap.entries()).map(([tag, tagAssistants]) =>
              tagAssistants.length > 0 ? (
                <div key={tag} className="mb-2">
                  <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {tag}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {tagAssistants.map((assistant) => (
                      <AssistantItem
                        key={assistant.id}
                        assistant={assistant}
                        isActive={assistant.id === activeAssistantId}
                        onClick={() => handleSelect(assistant.id)}
                      />
                    ))}
                  </div>
                </div>
              ) : null
            )}
            {grouped.untagged.length > 0 && (
              <div className="mb-2">
                <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {t('sidebar.untagged', 'Other')}
                </div>
                <div className="flex flex-col gap-0.5">
                  {grouped.untagged.map((assistant) => (
                    <AssistantItem
                      key={assistant.id}
                      assistant={assistant}
                      isActive={assistant.id === activeAssistantId}
                      onClick={() => handleSelect(assistant.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-0.5">
            {assistants.map((assistant) => (
              <AssistantItem
                key={assistant.id}
                assistant={assistant}
                isActive={assistant.id === activeAssistantId}
                onClick={() => handleSelect(assistant.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

export default React.memo(AssistantsTab)
