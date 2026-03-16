import { useState, useCallback } from 'react'
import { ChatHeader } from '@renderer/components/chat/ChatHeader'
import { MessageList } from '@renderer/components/chat/MessageList'
import { MessageInput } from '@renderer/components/chat/MessageInput'

interface ChatAreaProps {
  onToggleAssistantPanel: () => void
  onToggleTopicSidebar: () => void
  assistantPanelVisible: boolean
  topicSidebarVisible: boolean
}

export function ChatArea({
  onToggleAssistantPanel,
  onToggleTopicSidebar,
  assistantPanelVisible,
  topicSidebarVisible
}: ChatAreaProps) {
  const [editState, setEditState] = useState<{ messageId: string; text: string } | null>(null)

  const handleEditMessage = useCallback((messageId: string, currentText: string) => {
    setEditState({ messageId, text: currentText })
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditState(null)
  }, [])

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <ChatHeader
        onToggleAssistantPanel={onToggleAssistantPanel}
        onToggleTopicSidebar={onToggleTopicSidebar}
        assistantPanelVisible={assistantPanelVisible}
        topicSidebarVisible={topicSidebarVisible}
      />
      <MessageList onEditMessage={handleEditMessage} />
      <MessageInput
        editText={editState?.text}
        editMessageId={editState?.messageId}
        onCancelEdit={editState ? handleCancelEdit : undefined}
      />
    </div>
  )
}
