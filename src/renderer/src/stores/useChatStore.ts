import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { Message } from '@shared/types/message'
import type { Assistant } from '@shared/types/assistant'
import type { SerializedError, TokenUsage } from '@shared/types/ai-core'
import { useAssistantStore } from './useAssistantStore'
import { useTopicStore } from './useTopicStore'
import { useMessageStore } from './useMessageStore'
import { useBlockStore } from './useBlockStore'
import { registerStream } from '../services/ChatStreamService'
import { buildContext } from '../services/ContextBuilder'
import { processChunk, initStream, cleanupStream } from '../services/BlockBuilder'

interface ChatState {
  isStreaming: boolean
  activeRequestId: string | null
  error: SerializedError | null
}

interface ChatActions {
  sendMessage: (text: string) => Promise<void>
  stopGeneration: () => Promise<void>
  regenerate: (messageId: string) => Promise<void>
  editAndResend: (messageId: string, newText: string) => Promise<void>
  clearError: () => void
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  isStreaming: false,
  activeRequestId: null,
  error: null,

  sendMessage: async (text: string) => {
    if (get().isStreaming) return

    const assistant = useAssistantStore.getState().getActiveAssistant()
    let topicId = useTopicStore.getState().activeTopicId

    // Auto-create topic if none active
    if (!topicId) {
      const topic = await useTopicStore.getState().createTopic(assistant.id)
      topicId = topic.id
      await useMessageStore.getState().loadMessages(topicId)
    }

    // Create user message
    const userMessage = await useMessageStore.getState().addMessage({
      topicId,
      assistantId: assistant.id,
      role: 'user',
      status: 'success',
      type: 'text'
    })

    // Create user text block
    const now = new Date().toISOString()
    await useBlockStore.getState().addBlock({
      messageId: userMessage.id,
      type: 'main_text',
      status: 'success',
      content: { text },
      sortOrder: 1,
      createdAt: now,
      updatedAt: now
    } as never)

    // Start AI response
    await startAIResponse(topicId, assistant, userMessage)
  },

  stopGeneration: async () => {
    const { activeRequestId } = get()
    if (!activeRequestId) return
    try {
      await window.api.invoke['ai:abort'](activeRequestId)
    } catch {
      // ignore
    }
    set({ isStreaming: false, activeRequestId: null })
  },

  regenerate: async (messageId: string) => {
    if (get().isStreaming) return

    const { messages } = useMessageStore.getState()
    const msgIndex = messages.findIndex((m) => m.id === messageId)
    if (msgIndex < 0) return

    const msg = messages[msgIndex]
    if (msg.role !== 'assistant') return

    // Delete this message and all after it
    await useMessageStore.getState().deleteMessagesAfter(msg.topicId, messages[msgIndex - 1]?.id ?? messageId)
    await useMessageStore.getState().deleteMessage(messageId)
    useBlockStore.getState().clearBlocksForMessage(messageId)

    // Re-send with same context
    const assistant = useAssistantStore.getState().getActiveAssistant()
    await startAIResponse(msg.topicId, assistant)
  },

  editAndResend: async (messageId: string, newText: string) => {
    if (get().isStreaming) return

    const { messages } = useMessageStore.getState()
    const msg = messages.find((m) => m.id === messageId)
    if (!msg || msg.role !== 'user') return

    // Delete all messages after this one
    await useMessageStore.getState().deleteMessagesAfter(msg.topicId, messageId)

    // Update the user message block
    const blocks = useBlockStore.getState().getBlocksForMessage(messageId)
    const textBlock = blocks.find((b) => b.type === 'main_text')
    if (textBlock) {
      await window.api.invoke['chat:updateBlock'](textBlock.id, {
        content: { text: newText }
      } as never)
      // Update local state
      useBlockStore.getState().clearBlocksForMessage(messageId)
      await useBlockStore.getState().loadBlocks([messageId])
    }

    // Start AI response
    const assistant = useAssistantStore.getState().getActiveAssistant()
    await startAIResponse(msg.topicId, assistant)
  },

  clearError: () => set({ error: null })
}))

async function startAIResponse(
  topicId: string,
  assistant: Assistant,
  _afterMessage?: Message
): Promise<void> {
  const model = assistant.model
  if (!model) {
    useChatStore.setState({
      error: {
        code: 'NO_MODEL',
        message: 'No model configured for this assistant. Please set a model in assistant settings.'
      }
    })
    return
  }

  const requestId = nanoid(21)
  useChatStore.setState({ isStreaming: true, activeRequestId: requestId, error: null })

  // Create assistant message (pending)
  const assistantMessage = await useMessageStore.getState().addMessage({
    topicId,
    assistantId: assistant.id,
    role: 'assistant',
    status: 'sending',
    type: 'text',
    modelId: model.modelId,
    providerId: model.providerId
  })

  initStream(assistantMessage.id)

  const streamStartTime = Date.now()

  // Register stream handlers
  registerStream(requestId, {
    onChunk: (chunk) => {
      const blocks = useBlockStore.getState().getBlocksForMessage(assistantMessage.id)
      const result = processChunk(assistantMessage.id, chunk, blocks)
      if (!result) return

      if (result.isNew) {
        useBlockStore.getState().setStreamingBlock(result.block.id, result.block)
      } else {
        useBlockStore.getState().updateBlockContent(result.block.id, result.block.content as Record<string, unknown>)
      }

      // Update message status to streaming on first chunk
      const currentMsg = useMessageStore.getState().messages.find((m) => m.id === assistantMessage.id)
      if (currentMsg?.status === 'sending') {
        useMessageStore.getState().patchMessageLocal(assistantMessage.id, {
          status: 'streaming',
          metrics: { firstTokenLatency: Date.now() - streamStartTime }
        })
      }
    },

    onComplete: async (usage?: TokenUsage) => {
      cleanupStream(assistantMessage.id)

      // Finalize block statuses
      const blocks = useBlockStore.getState().getBlocksForMessage(assistantMessage.id)
      for (const block of blocks) {
        if (block.status === 'streaming') {
          useBlockStore.getState().setStreamingBlock(block.id, { ...block, status: 'success' })
        }
      }

      // Flush streaming blocks to DB
      await useBlockStore.getState().flushStreamingBlocks()

      // Update message status
      await useMessageStore.getState().updateMessage(assistantMessage.id, {
        status: 'success',
        usage,
        metrics: { totalDuration: Date.now() - streamStartTime }
      })

      useChatStore.setState({ isStreaming: false, activeRequestId: null })

      // Auto-name topic if first exchange
      const messages = useMessageStore.getState().messages
      if (messages.length <= 2) {
        autoNameTopic(topicId, messages)
      }
    },

    onError: async (error) => {
      cleanupStream(assistantMessage.id)
      await useBlockStore.getState().flushStreamingBlocks()

      // Add error block
      const now = new Date().toISOString()
      await useBlockStore.getState().addBlock({
        messageId: assistantMessage.id,
        type: 'error',
        status: 'error',
        content: {
          code: error.code,
          message: error.message,
          provider: error.provider,
          statusCode: error.statusCode,
          retryable: true
        },
        sortOrder: 999,
        createdAt: now,
        updatedAt: now
      } as never)

      await useMessageStore.getState().updateMessage(assistantMessage.id, {
        status: 'error'
      })

      useChatStore.setState({
        isStreaming: false,
        activeRequestId: null,
        error
      })
    }
  })

  // Build context and send
  const messages = useMessageStore.getState().messages
  const blocksByMessage = useBlockStore.getState().blocksByMessage
  const chatMessages = buildContext(assistant, messages, blocksByMessage, model.modelId)

  try {
    await window.api.invoke['ai:chat'](
      model.providerId,
      model.modelId,
      chatMessages,
      {
        requestId,
        temperature: assistant.settings.temperature,
        maxTokens: assistant.settings.maxTokens > 0 ? assistant.settings.maxTokens : undefined,
        topP: assistant.settings.topP,
        stream: assistant.settings.streamOutput
      }
    )
  } catch (err) {
    useChatStore.setState({
      isStreaming: false,
      activeRequestId: null,
      error: {
        code: 'SEND_FAILED',
        message: err instanceof Error ? err.message : 'Failed to send message'
      }
    })
  }
}

async function autoNameTopic(topicId: string, messages: Message[]): Promise<void> {
  const topic = useTopicStore.getState().topics.find((t) => t.id === topicId)
  if (!topic || topic.isNameManuallyEdited) return

  try {
    const blocksByMessage = useBlockStore.getState().blocksByMessage
    const contextMsgs = messages.map((m) => {
      const blocks = blocksByMessage[m.id] ?? []
      const text = blocks
        .filter((b) => b.type === 'main_text')
        .map((b) => (b as { content: { text: string } }).content.text)
        .join('\n')
      return { role: m.role, content: text }
    })

    const result = await window.api.invoke['chat:generateTopicName'](topicId, contextMsgs)
    if (result.name) {
      useTopicStore.setState((s) => ({
        topics: s.topics.map((t) =>
          t.id === topicId ? { ...t, name: result.name } : t
        )
      }))
    }
  } catch {
    // Naming failure is non-critical
  }
}

// Selectors
export const useIsStreaming = () => useChatStore((s) => s.isStreaming)
export const useChatError = () => useChatStore((s) => s.error)
