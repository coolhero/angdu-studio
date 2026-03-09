import { useCallback } from 'react'
import { useMessageStore } from '@renderer/stores/useMessageStore'
import { useMessageBlockStore } from '@renderer/stores/useMessageBlockStore'
import { useRuntimeStore } from '@renderer/stores/useRuntimeStore'
import type { Topic } from '@renderer/types/conversation'
import type { Message } from '@renderer/types/message'
import { MessageBlockType, type MainTextMessageBlock } from '@renderer/types/message-block'

export function useMessageOperations(topic: Topic) {
  const { removeMessage, updateMessage, clearTopicMessages } = useMessageStore()
  const { getBlocksForMessage, updateBlock } = useMessageBlockStore()
  const setGenerating = useRuntimeStore((s) => s.setGenerating)

  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      const blocks = getBlocksForMessage(messageId)
      const mainBlock = blocks.find(
        (b) => b.type === MessageBlockType.MAIN_TEXT
      ) as MainTextMessageBlock | undefined

      if (mainBlock) {
        updateBlock(mainBlock.id, { content } as Partial<MainTextMessageBlock>)
      }

      updateMessage(messageId, { updatedAt: new Date().toISOString() })
    },
    [getBlocksForMessage, updateBlock, updateMessage]
  )

  const deleteMessage = useCallback(
    async (messageId: string) => {
      removeMessage(messageId)
    },
    [removeMessage]
  )

  const resendMessage = useCallback(
    async (messageId: string, _content: string) => {
      // Get the message to find its askId
      const message = useMessageStore.getState().messages[messageId]
      if (message?.askId) {
        // Remove old response by askId
        useMessageStore.getState().removeMessagesByAskId(message.askId)
      }
      // The actual re-send would be handled by the chat input/send pipeline
    },
    []
  )

  const retryMessage = useCallback(
    async (messageId: string) => {
      const message = useMessageStore.getState().messages[messageId]
      if (!message?.askId) return

      // Find the user message with the same askId to get content
      const topicMessages = useMessageStore
        .getState()
        .getMessagesForTopic(topic.id)
      const userMessage = topicMessages.find(
        (m) => m.askId === message.askId && m.role === 'user'
      )

      if (userMessage) {
        const blocks = getBlocksForMessage(userMessage.id)
        const mainBlock = blocks.find(
          (b) => b.type === MessageBlockType.MAIN_TEXT
        ) as MainTextMessageBlock | undefined

        if (mainBlock) {
          // Remove old messages by askId and the caller should re-send
          useMessageStore.getState().removeMessagesByAskId(message.askId)
        }
      }
    },
    [topic.id, getBlocksForMessage]
  )

  const pauseMessage = useCallback(
    (_messageId: string) => {
      setGenerating(topic.id, false)
    },
    [topic.id, setGenerating]
  )

  const clearMessages = useCallback(async () => {
    await clearTopicMessages(topic.id)
  }, [topic.id, clearTopicMessages])

  const createBranch = useCallback(
    async (_messageId: string) => {
      // Branch creation would involve creating a new topic and copying messages
      // This is a placeholder for the actual implementation
      console.log('Branch creation not yet implemented')
    },
    []
  )

  return {
    editMessage,
    resendMessage,
    deleteMessage,
    retryMessage,
    pauseMessage,
    clearTopicMessages: clearMessages,
    createBranch,
  }
}
