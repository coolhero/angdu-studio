// useMessages — message send pipeline with streaming AI responses (F005)

import { useCallback, useRef } from 'react'
import { v4 as uuid } from 'uuid'
import { useMessageStore } from '../stores/useMessageStore'
import { useRuntimeStore } from '../stores/useRuntimeStore'
import { useLlmStore } from '../stores/useLlmStore'
import {
  createUserMessage,
  createAssistantMessage,
  resetAssistantMessage,
  filterContextMessages,
  checkRateLimit,
  recordMessageTime
} from '../services/MessagesService'
import { createExecutorFromProvider } from '../services/AiCoreService'
import { db } from '../lib/db'
import type { Assistant, Topic, Message, MessageBlock, MainTextBlock, ThinkingBlock, BlockType } from '@shared/types'
import type { FileMetadata, Model } from '@shared/types'

// ── DB persistence helpers ──

async function persistMessage(message: Message): Promise<void> {
  await db.messages.put(message)
}

async function persistBlocks(blocks: MessageBlock[]): Promise<void> {
  await db.message_blocks.bulkPut(blocks)
}

// ── AI SDK message format conversion ──

function messagesToAiMessages(
  messages: Message[],
  blockEntities: Record<string, MessageBlock>
): { role: 'user' | 'assistant' | 'system'; content: string }[] {
  return messages.map((msg) => {
    const content = msg.blocks
      .map((bid) => blockEntities[bid])
      .filter((b): b is MessageBlock => b != null)
      .filter((b) => b.type === 'main_text')
      .map((b) => (b as MainTextBlock).content)
      .join('\n')

    return {
      role: msg.role as 'user' | 'assistant' | 'system',
      content
    }
  })
}

// ── Hook ──

export function useMessages(assistant: Assistant, topic: Topic) {
  const abortControllerRef = useRef<AbortController | null>(null)

  // ── Streaming pipeline (shared between sendMessage and retryMessage) ──

  const runStreamingPipeline = useCallback(
    async (assistantMessage: Message, contextMessages: Message[]) => {
      const { updateMessage, upsertBlock, upsertBlockReference, blockEntities } =
        useMessageStore.getState()
      const { setGenerating, setStreamingMessage } = useRuntimeStore.getState()
      const { providers, defaultModel } = useLlmStore.getState()

      // Resolve model: assistant.model > assistant.defaultModel > store default
      const model =
        assistant.model ?? assistant.defaultModel ?? defaultModel

      // Resolve provider
      const provider = providers.find((p) => p.id === model.provider)
      if (!provider) {
        updateMessage(topic.id, assistantMessage.id, { status: 'error' })
        await persistMessage({ ...assistantMessage, status: 'error' })
        setGenerating(topic.id, false)
        setStreamingMessage(null)
        return
      }

      // Set generating state
      setGenerating(topic.id, true)
      setStreamingMessage(assistantMessage.id)

      // KB injection
      let systemPrompt = assistant.prompt || undefined
      if (assistant.knowledgeBaseIds?.length && window.api?.knowledge?.search) {
        try {
          const userMessage = contextMessages[contextMessages.length - 1]
          const userContent = userMessage
            ? userMessage.blocks
                .map((bid) => blockEntities[bid])
                .filter((b): b is MessageBlock => b != null)
                .filter((b) => b.type === 'main_text')
                .map((b) => (b as MainTextBlock).content)
                .join('\n')
            : ''

          const knowledgeResults = await Promise.all(
            assistant.knowledgeBaseIds.map((baseId) =>
              window.api!.knowledge!.search(baseId, userContent, 5)
            )
          )
          const knowledgeContext = knowledgeResults
            .flat()
            .map((ref: { content: string }) => ref.content)
            .join('\n\n')

          if (knowledgeContext) {
            systemPrompt = systemPrompt
              ? `${systemPrompt}\n\nRelevant knowledge:\n${knowledgeContext}`
              : `Relevant knowledge:\n${knowledgeContext}`
          }
        } catch {
          // KB injection failure is non-fatal; proceed without KB context
        }
      }

      // Prepare AI SDK messages
      const aiMessages = messagesToAiMessages(contextMessages, blockEntities)

      // Create AbortController
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      // Create executor
      const executor = createExecutorFromProvider(provider)

      // Track partial blocks
      let mainTextBlock: MainTextBlock | null = null
      let thinkingBlock: ThinkingBlock | null = null
      const now = new Date().toISOString()

      try {
        const result = await executor.streamText({
          model: model.id,
          messages: aiMessages,
          system: systemPrompt,
          maxTokens: assistant.settings?.enableMaxTokens ? assistant.settings.maxTokens : undefined,
          temperature: assistant.settings?.enableTemperature
            ? assistant.settings.temperature
            : undefined,
          topP: assistant.settings?.enableTopP ? assistant.settings.topP : undefined,
          abortSignal: abortController.signal
        })

        for await (const part of result.fullStream) {
          if (abortController.signal.aborted) break

          if (part.type === 'text-delta') {
            if (!mainTextBlock) {
              mainTextBlock = {
                id: uuid(),
                messageId: assistantMessage.id,
                type: 'main_text',
                status: 'streaming',
                content: part.textDelta,
                createdAt: now
              }
            } else {
              mainTextBlock = {
                ...mainTextBlock,
                content: mainTextBlock.content + part.textDelta,
                status: 'streaming'
              }
            }
            upsertBlock(mainTextBlock)
            upsertBlockReference(assistantMessage.id, mainTextBlock.id, 'main_text' as BlockType)
          } else if (part.type === 'reasoning') {
            const reasoningText = (part as { type: 'reasoning'; textDelta: string }).textDelta ?? ''
            if (!thinkingBlock) {
              thinkingBlock = {
                id: uuid(),
                messageId: assistantMessage.id,
                type: 'thinking',
                status: 'streaming',
                content: reasoningText,
                createdAt: now
              }
            } else {
              thinkingBlock = {
                ...thinkingBlock,
                content: thinkingBlock.content + reasoningText,
                status: 'streaming'
              }
            }
            upsertBlock(thinkingBlock)
            upsertBlockReference(assistantMessage.id, thinkingBlock.id, 'thinking' as BlockType)
          }
        }

        // Resolve usage from stream result
        const usage = await result.usage.catch(() => null)

        // Finalize blocks
        const finalBlocks: MessageBlock[] = []
        if (thinkingBlock) {
          const finished: ThinkingBlock = { ...thinkingBlock, status: 'success' }
          upsertBlock(finished)
          finalBlocks.push(finished)
        }
        if (mainTextBlock) {
          const finished: MainTextBlock = { ...mainTextBlock, status: 'success' }
          upsertBlock(finished)
          finalBlocks.push(finished)
        }

        const finishedMessage: Message = {
          ...assistantMessage,
          status: 'success',
          usage: usage
            ? {
                prompt_tokens: usage.promptTokens,
                completion_tokens: usage.completionTokens,
                total_tokens: usage.totalTokens
              }
            : undefined,
          updatedAt: new Date().toISOString()
        }
        updateMessage(topic.id, assistantMessage.id, finishedMessage)
        await persistMessage(finishedMessage)
        if (finalBlocks.length > 0) {
          await persistBlocks(finalBlocks)
        }
      } catch (error: unknown) {
        const isAbort =
          error instanceof Error && (error.name === 'AbortError' || abortController.signal.aborted)

        const errorStatus = isAbort ? 'paused' : 'error'

        // Persist partial content if any
        const partialBlocks: MessageBlock[] = []
        if (thinkingBlock) {
          const partial: ThinkingBlock = { ...thinkingBlock, status: errorStatus }
          upsertBlock(partial)
          partialBlocks.push(partial)
        }
        if (mainTextBlock) {
          const partial: MainTextBlock = { ...mainTextBlock, status: errorStatus }
          upsertBlock(partial)
          partialBlocks.push(partial)
        }

        const errorMessage: Message = {
          ...assistantMessage,
          status: errorStatus,
          updatedAt: new Date().toISOString()
        }
        updateMessage(topic.id, assistantMessage.id, errorMessage)
        await persistMessage(errorMessage)
        if (partialBlocks.length > 0) {
          await persistBlocks(partialBlocks)
        }
      } finally {
        setGenerating(topic.id, false)
        setStreamingMessage(null)
        abortControllerRef.current = null
      }
    },
    [assistant, topic]
  )

  // ── sendMessage ──

  const sendMessage = useCallback(
    async (content: string, files?: FileMetadata[]): Promise<void> => {
      const { generating } = useRuntimeStore.getState()

      // 1. Check if already generating for this topic
      if (generating[topic.id]) return

      const { addMessage, getMessagesForTopic, blockEntities } = useMessageStore.getState()
      const { providers, defaultModel } = useLlmStore.getState()

      // 2. Create user message
      const { message: userMessage, blocks: userBlocks } = createUserMessage(
        assistant,
        topic,
        content,
        files
      )

      // 3. Add to store + persist
      addMessage(topic.id, userMessage)
      for (const block of userBlocks) {
        useMessageStore.getState().upsertBlock(block)
        useMessageStore
          .getState()
          .upsertBlockReference(userMessage.id, block.id, block.type as BlockType)
      }
      await persistMessage(userMessage)
      await persistBlocks(userBlocks)

      // 4. Resolve model
      const model = assistant.model ?? assistant.defaultModel ?? defaultModel

      // 5. Resolve provider
      const provider = providers.find((p) => p.id === model.provider)
      if (!provider) {
        console.error(`[useMessages] Provider not found for model: ${model.id}`)
        return
      }

      // 6. Check rate limit
      const { limited, waitMs } = checkRateLimit(provider)
      if (limited) {
        console.warn(`[useMessages] Rate limited. Wait ${waitMs}ms before sending.`)
        return
      }

      // 7. Record message time
      recordMessageTime(provider.id)

      // 8. Create assistant message
      const assistantMessage = createAssistantMessage(assistant, topic, model)

      // 9. Add assistant message to store + persist
      addMessage(topic.id, assistantMessage)
      await persistMessage(assistantMessage)

      // 10. Get context messages
      const topicMessages = getMessagesForTopic(topic.id)
      const contextCount = assistant.settings?.contextCount ?? 5
      const contextMessages = filterContextMessages(topicMessages, contextCount)

      // 11-19. Run streaming pipeline
      await runStreamingPipeline(assistantMessage, contextMessages)
    },
    [assistant, topic, runStreamingPipeline]
  )

  // ── cancelStream ──

  const cancelStream = useCallback((): void => {
    const { streamingMessageId } = useRuntimeStore.getState()
    const { updateMessage } = useMessageStore.getState()
    const { setGenerating, setStreamingMessage } = useRuntimeStore.getState()

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    if (streamingMessageId) {
      updateMessage(topic.id, streamingMessageId, {
        status: 'paused',
        updatedAt: new Date().toISOString()
      })

      // Persist paused state
      const message = useMessageStore.getState().getMessage(streamingMessageId)
      if (message) {
        persistMessage({ ...message, status: 'paused', updatedAt: new Date().toISOString() }).catch(
          console.error
        )
      }
    }

    setGenerating(topic.id, false)
    setStreamingMessage(null)
  }, [topic])

  // ── editMessage ──

  const editMessage = useCallback(
    async (messageId: string, newContent: string): Promise<void> => {
      const { entities, blockEntities, removeMessage, removeMessages, updateMessage, upsertBlock } =
        useMessageStore.getState()

      const userMessage = entities[messageId]
      if (!userMessage || userMessage.role !== 'user') return

      // Find the assistant response associated with this user message (askId === messageId)
      const topicMessageIds = useMessageStore.getState().messagesByTopic[topic.id] ?? []
      const assistantMessageId = topicMessageIds.find((id) => {
        const msg = entities[id]
        return msg?.role === 'assistant' && msg?.askId === messageId
      })

      // Remove old assistant response if exists
      if (assistantMessageId) {
        removeMessage(topic.id, assistantMessageId)
        await db.messages.delete(assistantMessageId)
        const assistantMsg = entities[assistantMessageId]
        if (assistantMsg) {
          await db.message_blocks.where('messageId').equals(assistantMessageId).delete()
        }
      }

      // Update user message's main text block
      const mainTextBlockId = userMessage.blocks.find((bid) => {
        const block = blockEntities[bid]
        return block?.type === 'main_text'
      })

      if (mainTextBlockId) {
        const existing = blockEntities[mainTextBlockId] as MainTextBlock
        const updated: MainTextBlock = {
          ...existing,
          content: newContent,
          updatedAt: new Date().toISOString()
        }
        upsertBlock(updated)
        await db.message_blocks.put(updated)
      }

      updateMessage(topic.id, messageId, { updatedAt: new Date().toISOString() })
      const updatedUserMsg = useMessageStore.getState().getMessage(messageId)
      if (updatedUserMsg) {
        await persistMessage(updatedUserMsg)
      }

      // Re-send: create a new assistant message and run pipeline
      const { providers, defaultModel } = useLlmStore.getState()
      const model = assistant.model ?? assistant.defaultModel ?? defaultModel
      const provider = providers.find((p) => p.id === model.provider)

      if (!provider) {
        console.error(`[useMessages] Provider not found for model: ${model.id}`)
        return
      }

      const { limited, waitMs } = checkRateLimit(provider)
      if (limited) {
        console.warn(`[useMessages] Rate limited. Wait ${waitMs}ms before re-sending.`)
        return
      }

      recordMessageTime(provider.id)

      const newAssistantMessage = createAssistantMessage(assistant, topic, model)
      useMessageStore.getState().addMessage(topic.id, newAssistantMessage)
      await persistMessage(newAssistantMessage)

      const topicMessages = useMessageStore.getState().getMessagesForTopic(topic.id)
      const contextCount = assistant.settings?.contextCount ?? 5
      const contextMessages = filterContextMessages(topicMessages, contextCount)

      await runStreamingPipeline(newAssistantMessage, contextMessages)
    },
    [assistant, topic, runStreamingPipeline]
  )

  // ── retryMessage ──

  const retryMessage = useCallback(
    async (messageId: string): Promise<void> => {
      const { entities, removeBlocks, updateMessage } = useMessageStore.getState()
      const { generating } = useRuntimeStore.getState()

      if (generating[topic.id]) return

      const message = entities[messageId]
      if (!message || message.role !== 'assistant') return

      // Remove existing blocks
      const oldBlockIds = [...message.blocks]
      removeBlocks(oldBlockIds)
      await db.message_blocks.where('messageId').equals(messageId).delete()

      // Reset the assistant message
      const reset = resetAssistantMessage(message)
      updateMessage(topic.id, messageId, reset)
      await persistMessage(reset)

      // Get context messages up to (but not including) this assistant message
      const topicMessages = useMessageStore.getState().getMessagesForTopic(topic.id)
      const msgIndex = topicMessages.findIndex((m) => m.id === messageId)
      const messagesBeforeRetry = msgIndex >= 0 ? topicMessages.slice(0, msgIndex) : topicMessages
      const contextCount = assistant.settings?.contextCount ?? 5
      const contextMessages = filterContextMessages(messagesBeforeRetry, contextCount)

      await runStreamingPipeline(reset, contextMessages)
    },
    [assistant, topic, runStreamingPipeline]
  )

  // ── deleteMessage ──

  const deleteMessage = useCallback(
    async (messageId: string): Promise<void> => {
      const { removeMessage } = useMessageStore.getState()

      removeMessage(topic.id, messageId)
      await db.messages.delete(messageId)
      await db.message_blocks.where('messageId').equals(messageId).delete()
    },
    [topic]
  )

  // ── runStreamingPipelineForModel — model-scoped variant for multi-model dispatch ──

  const runStreamingPipelineForModel = useCallback(
    async (assistantMessage: Message, contextMessages: Message[], model: Model): Promise<void> => {
      const { updateMessage, upsertBlock, upsertBlockReference, blockEntities } =
        useMessageStore.getState()
      const { providers } = useLlmStore.getState()

      // Resolve provider for the specific model
      const provider = providers.find((p) => p.id === model.provider)
      if (!provider) {
        updateMessage(topic.id, assistantMessage.id, { status: 'error' })
        await persistMessage({ ...assistantMessage, status: 'error' })
        return
      }

      // KB injection (reuse same logic, non-fatal)
      let systemPrompt = assistant.prompt || undefined
      if (assistant.knowledgeBaseIds?.length && window.api?.knowledge?.search) {
        try {
          const userMessage = contextMessages[contextMessages.length - 1]
          const userContent = userMessage
            ? userMessage.blocks
                .map((bid) => blockEntities[bid])
                .filter((b): b is MessageBlock => b != null)
                .filter((b) => b.type === 'main_text')
                .map((b) => (b as MainTextBlock).content)
                .join('\n')
            : ''

          const knowledgeResults = await Promise.all(
            assistant.knowledgeBaseIds.map((baseId) =>
              window.api!.knowledge!.search(baseId, userContent, 5)
            )
          )
          const knowledgeContext = knowledgeResults
            .flat()
            .map((ref: { content: string }) => ref.content)
            .join('\n\n')

          if (knowledgeContext) {
            systemPrompt = systemPrompt
              ? `${systemPrompt}\n\nRelevant knowledge:\n${knowledgeContext}`
              : `Relevant knowledge:\n${knowledgeContext}`
          }
        } catch {
          // KB injection failure is non-fatal
        }
      }

      const aiMessages = messagesToAiMessages(contextMessages, blockEntities)
      const abortController = new AbortController()
      const executor = createExecutorFromProvider(provider)

      let mainTextBlock: MainTextBlock | null = null
      let thinkingBlock: ThinkingBlock | null = null
      const now = new Date().toISOString()

      try {
        const result = await executor.streamText({
          model: model.id,
          messages: aiMessages,
          system: systemPrompt,
          maxTokens: assistant.settings?.enableMaxTokens ? assistant.settings.maxTokens : undefined,
          temperature: assistant.settings?.enableTemperature
            ? assistant.settings.temperature
            : undefined,
          topP: assistant.settings?.enableTopP ? assistant.settings.topP : undefined,
          abortSignal: abortController.signal
        })

        for await (const part of result.fullStream) {
          if (abortController.signal.aborted) break

          if (part.type === 'text-delta') {
            if (!mainTextBlock) {
              mainTextBlock = {
                id: uuid(),
                messageId: assistantMessage.id,
                type: 'main_text',
                status: 'streaming',
                content: part.textDelta,
                createdAt: now
              }
            } else {
              mainTextBlock = {
                ...mainTextBlock,
                content: mainTextBlock.content + part.textDelta,
                status: 'streaming'
              }
            }
            upsertBlock(mainTextBlock)
            upsertBlockReference(assistantMessage.id, mainTextBlock.id, 'main_text' as BlockType)
          } else if (part.type === 'reasoning') {
            const reasoningText = (part as { type: 'reasoning'; textDelta: string }).textDelta ?? ''
            if (!thinkingBlock) {
              thinkingBlock = {
                id: uuid(),
                messageId: assistantMessage.id,
                type: 'thinking',
                status: 'streaming',
                content: reasoningText,
                createdAt: now
              }
            } else {
              thinkingBlock = {
                ...thinkingBlock,
                content: thinkingBlock.content + reasoningText,
                status: 'streaming'
              }
            }
            upsertBlock(thinkingBlock)
            upsertBlockReference(assistantMessage.id, thinkingBlock.id, 'thinking' as BlockType)
          }
        }

        const usage = await result.usage.catch(() => null)

        const finalBlocks: MessageBlock[] = []
        if (thinkingBlock) {
          const finished: ThinkingBlock = { ...thinkingBlock, status: 'success' }
          upsertBlock(finished)
          finalBlocks.push(finished)
        }
        if (mainTextBlock) {
          const finished: MainTextBlock = { ...mainTextBlock, status: 'success' }
          upsertBlock(finished)
          finalBlocks.push(finished)
        }

        const finishedMessage: Message = {
          ...assistantMessage,
          status: 'success',
          usage: usage
            ? {
                prompt_tokens: usage.promptTokens,
                completion_tokens: usage.completionTokens,
                total_tokens: usage.totalTokens
              }
            : undefined,
          updatedAt: new Date().toISOString()
        }
        updateMessage(topic.id, assistantMessage.id, finishedMessage)
        await persistMessage(finishedMessage)
        if (finalBlocks.length > 0) {
          await persistBlocks(finalBlocks)
        }
      } catch (error: unknown) {
        const isAbort =
          error instanceof Error && (error.name === 'AbortError' || abortController.signal.aborted)

        const errorStatus = isAbort ? 'paused' : 'error'

        const partialBlocks: MessageBlock[] = []
        if (thinkingBlock) {
          const partial: ThinkingBlock = { ...thinkingBlock, status: errorStatus }
          upsertBlock(partial)
          partialBlocks.push(partial)
        }
        if (mainTextBlock) {
          const partial: MainTextBlock = { ...mainTextBlock, status: errorStatus }
          upsertBlock(partial)
          partialBlocks.push(partial)
        }

        const errorMessage: Message = {
          ...assistantMessage,
          status: errorStatus,
          updatedAt: new Date().toISOString()
        }
        updateMessage(topic.id, assistantMessage.id, errorMessage)
        await persistMessage(errorMessage)
        if (partialBlocks.length > 0) {
          await persistBlocks(partialBlocks)
        }
      }
    },
    [assistant, topic]
  )

  // ── sendMultiModelMessage ──

  const sendMultiModelMessage = useCallback(
    async (content: string, models: Model[], files?: FileMetadata[]): Promise<void> => {
      const { generating } = useRuntimeStore.getState()

      // Bail if already generating for this topic
      if (generating[topic.id]) return

      const { addMessage, getMessagesForTopic } = useMessageStore.getState()

      // 1. Create ONE user message tagged with all mentioned models and horizontal layout
      const { message: userMessage, blocks: userBlocks } = createUserMessage(
        assistant,
        topic,
        content,
        files
      )

      const taggedUserMessage: Message = {
        ...userMessage,
        mentions: models,
        multiModelMessageStyle: 'horizontal'
      }

      // 2. Persist user message + blocks
      addMessage(topic.id, taggedUserMessage)
      for (const block of userBlocks) {
        useMessageStore.getState().upsertBlock(block)
        useMessageStore
          .getState()
          .upsertBlockReference(taggedUserMessage.id, block.id, block.type as BlockType)
      }
      await persistMessage(taggedUserMessage)
      await persistBlocks(userBlocks)

      // 3. Resolve context messages (shared across all model streams)
      const topicMessages = getMessagesForTopic(topic.id)
      const contextCount = assistant.settings?.contextCount ?? 5
      const contextMessages = filterContextMessages(topicMessages, contextCount)

      // 4. Create one independent assistant message per model, persist all upfront
      const assistantMessages: Message[] = models.map((model) =>
        createAssistantMessage(assistant, topic, model)
      )

      for (const assistantMessage of assistantMessages) {
        addMessage(topic.id, assistantMessage)
        await persistMessage(assistantMessage)
      }

      // 5. Run all streaming pipelines in parallel — each failure is isolated
      await Promise.allSettled(
        assistantMessages.map((assistantMessage, i) =>
          runStreamingPipelineForModel(assistantMessage, contextMessages, models[i])
        )
      )
    },
    [assistant, topic, runStreamingPipelineForModel]
  )

  return {
    sendMessage,
    sendMultiModelMessage,
    cancelStream,
    editMessage,
    retryMessage,
    deleteMessage
  }
}
