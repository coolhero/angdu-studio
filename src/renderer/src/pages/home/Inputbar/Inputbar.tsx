import React, { useCallback, useMemo, useState } from 'react'
import { cn } from '@renderer/lib/utils'
import { useRuntimeStore } from '@renderer/stores/useRuntimeStore'
import { MessagesService } from '@renderer/services/MessagesService'
import { InputbarToolsProvider } from './context/InputbarToolsProvider'
import InputbarCore from './InputbarCore'
import InputbarTools from './InputbarTools'
import TokenCount from './TokenCount'
import AttachmentPreview from './AttachmentPreview'
import { useInputText } from '@renderer/hooks/useInputText'
import type { Assistant } from '@renderer/types/assistant'
import type { Topic } from '@renderer/types/conversation'
import type { FileMetadata } from '@renderer/types/message-block'
import type { ToolContext } from './types'

// Ensure tools are registered
import './tools/index'

interface InputbarProps {
  assistant: Assistant
  topic: Topic
}

const Inputbar: React.FC<InputbarProps> = ({ assistant, topic }) => {
  const isGenerating = useRuntimeStore((s) => s.generatingTopicIds.has(topic.id))
  const canSendMessage = !isGenerating
  const { text } = useInputText(topic.id)
  const [attachments, setAttachments] = useState<FileMetadata[]>([])

  const toolContext = useMemo<ToolContext>(
    () => ({
      scope: 'chat',
      topicId: topic.id,
      assistantId: assistant.id,
      isGenerating,
    }),
    [topic.id, assistant.id, isGenerating]
  )

  const handleSend = useCallback(
    (content: string) => {
      if (!canSendMessage) return
      MessagesService.createUserMessage(content, topic.id, assistant.id)
    },
    [topic.id, assistant.id, canSendMessage]
  )

  const handleStop = useCallback(() => {
    useRuntimeStore.getState().setGenerating(topic.id, false)
  }, [topic.id])

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((f) => f.id !== id))
  }, [])

  return (
    <InputbarToolsProvider scope="chat" toolContext={toolContext}>
      <div className="px-[18px] pb-[18px]">
        <AttachmentPreview files={attachments} onRemove={handleRemoveAttachment} />
        <div className="rounded-[17px] border border-zinc-200 bg-white/80 pt-2 dark:border-zinc-700 dark:bg-zinc-800/80">
          <InputbarCore
            onSend={handleSend}
            onStop={handleStop}
            disabled={!canSendMessage}
            isGenerating={isGenerating}
            topicId={topic.id}
          />

          <div className="flex h-10 items-center justify-between gap-4 px-2">
            <InputbarTools toolContext={toolContext} />
            <TokenCount text={text} />
          </div>
        </div>
      </div>
    </InputbarToolsProvider>
  )
}

export default React.memo(Inputbar)
