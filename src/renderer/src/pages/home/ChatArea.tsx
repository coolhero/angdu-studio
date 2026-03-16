import { useState, useCallback } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ChatHeader } from '@renderer/components/chat/ChatHeader'
import { MessageList } from '@renderer/components/chat/MessageList'
import { MessageInput } from '@renderer/components/chat/MessageInput'
import { useChatStore } from '@renderer/stores/useChatStore'
import { useAssistantStore } from '@renderer/stores/useAssistantStore'

interface ChatAreaProps {
  onToggleSidebar: () => void
}

export function ChatArea({ onToggleSidebar }: ChatAreaProps) {
  const { t } = useTranslation()
  const [editState, setEditState] = useState<{ messageId: string; text: string } | null>(null)
  const error = useChatStore((s) => s.error)
  const assistant = useAssistantStore((s) => s.getActiveAssistant())
  const hasModel = !!assistant.model

  const handleEditMessage = useCallback((messageId: string, currentText: string) => {
    setEditState({ messageId, text: currentText })
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditState(null)
  }, [])

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <ChatHeader onToggleSidebar={onToggleSidebar} />

      {/* Model not selected warning */}
      {!hasModel && (
        <div className="mx-4 mt-2 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{t('chat.noModelWarning', 'No model selected. Click "Select Model" in the header to choose a model.')}</span>
        </div>
      )}

      {/* Chat store error */}
      {error && (
        <div className="mx-4 mt-2 flex items-center justify-between gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error.message}</span>
          </div>
          <button onClick={() => useChatStore.getState().clearError()}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <MessageList onEditMessage={handleEditMessage} />
      <MessageInput
        editText={editState?.text}
        editMessageId={editState?.messageId}
        onCancelEdit={editState ? handleCancelEdit : undefined}
      />
    </div>
  )
}
