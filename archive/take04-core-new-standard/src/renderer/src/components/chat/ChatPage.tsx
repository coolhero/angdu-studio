import { useCallback } from 'react'
import { useAssistant } from '../../hooks/useAssistant'
import { useTopic } from '../../hooks/useTopic'
import { useMessages } from '../../hooks/useMessages'
import { useMessageStore } from '../../stores/useMessageStore'
import { useRuntimeStore } from '../../stores/useRuntimeStore'
import { MessageList } from './MessageList'
import { InputBar } from './InputBar'
import { MessageSquare } from 'lucide-react'
import type { Assistant, Topic } from '@shared/types'

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
      <MessageSquare size={40} strokeWidth={1.5} />
      <p className="text-sm">Select or create a topic to start chatting</p>
    </div>
  )
}

function ChatArea({ assistant, topic }: { assistant: Assistant; topic: Topic }) {
  const { sendMessage, cancelStream } = useMessages(assistant, topic)
  const messages = useMessageStore((s) => s.getMessagesForTopic(topic.id))
  const generating = useRuntimeStore((s) => s.generating[topic.id] ?? false)
  const streamingMessageId = useRuntimeStore((s) => s.streamingMessageId)

  const handleSend = useCallback(
    (content: string) => {
      sendMessage(content)
    },
    [sendMessage]
  )

  return (
    <div className="flex h-full flex-col">
      <MessageList messages={messages} streamingMessageId={streamingMessageId} />
      <InputBar onSend={handleSend} onCancel={cancelStream} generating={generating} />
    </div>
  )
}

export function ChatPage() {
  const { activeAssistant } = useAssistant()
  const { activeTopic } = useTopic(activeAssistant?.id ?? '')

  if (!activeAssistant || !activeTopic) {
    return <EmptyState />
  }

  return <ChatArea assistant={activeAssistant} topic={activeTopic} />
}
