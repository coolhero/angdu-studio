import { useEffect, useCallback } from 'react'
import { useAssistant } from '../../hooks/useAssistant'
import { useTopic } from '../../hooks/useTopic'
import { AssistantSelector } from './AssistantSelector'
import { TopicList } from './TopicList'

export function Sidebar() {
  const {
    assistants,
    activeAssistant,
    setActiveAssistant,
    initDefaultAssistant
  } = useAssistant()

  const assistantId = activeAssistant?.id ?? ''

  const {
    topics,
    activeTopic,
    setActiveTopic,
    addTopic,
    renameTopic,
    pinTopic,
    unpinTopic,
    removeTopic
  } = useTopic(assistantId)

  // Initialize default assistant on first launch
  useEffect(() => {
    initDefaultAssistant()
  }, [initDefaultAssistant])

  // Auto-create first topic when assistant has none
  useEffect(() => {
    if (activeAssistant && topics.length === 0) {
      addTopic('New Chat')
    }
  }, [activeAssistant, topics.length, addTopic])

  const handleAddTopic = useCallback(() => {
    addTopic('New Chat')
  }, [addTopic])

  if (!activeAssistant) return null

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border">
        <AssistantSelector
          assistants={assistants}
          activeAssistant={activeAssistant}
          onSelect={setActiveAssistant}
        />
      </div>
      <TopicList
        topics={topics}
        activeTopicId={activeTopic?.id}
        onSelectTopic={setActiveTopic}
        onAddTopic={handleAddTopic}
        onRenameTopic={renameTopic}
        onPinTopic={pinTopic}
        onUnpinTopic={unpinTopic}
        onDeleteTopic={removeTopic}
      />
    </div>
  )
}
