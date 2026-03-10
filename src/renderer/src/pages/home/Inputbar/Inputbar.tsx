import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { streamText, jsonSchema } from 'ai'
import { nanoid } from 'nanoid'
import { useRuntimeStore } from '@renderer/stores/useRuntimeStore'
import { useProviderStore } from '@renderer/stores/useProviderStore'
import { useMessageStore } from '@renderer/stores/useMessageStore'
import { useMessageBlockStore } from '@renderer/stores/useMessageBlockStore'
import { useMCPStore } from '@renderer/stores/useMCPStore'
import { resolveProviderClient } from '@renderer/aiCore/provider/factory'
import type { MCPServer, MCPTool, MCPCallToolResponse } from '@shared/types/mcp'
import { InputbarToolsProvider } from './context/InputbarToolsProvider'
import InputbarCore from './InputbarCore'
import InputbarTools from './InputbarTools'
import TokenCount from './TokenCount'
import AttachmentPreview from './AttachmentPreview'
import { useInputText } from '@renderer/hooks/useInputText'
import type { Assistant } from '@renderer/types/assistant'
import type { Topic } from '@renderer/types/conversation'
import type { Message } from '@renderer/types/message'
import { MessageBlockType, MessageBlockStatus, type MessageBlock, type MainTextMessageBlock } from '@renderer/types/message-block'
import type { FileMetadata } from '@renderer/types/message-block'
import type { ToolContext } from './types'

// Ensure tools are registered
import './tools/index'

// ── MCP Tool Integration ──

/**
 * Normalize an MCP tool's inputSchema to a valid JSON Schema object type.
 * MCP servers may return schemas with missing or non-"object" type fields.
 */
function normalizeMcpSchema(schema: Record<string, unknown>): Record<string, unknown> {
  // Ensure the schema is type "object" — OpenAI requires this
  const normalized = { ...schema }
  if (!normalized.type || normalized.type === 'None') {
    normalized.type = 'object'
  }
  if (!normalized.properties) {
    normalized.properties = {}
  }
  return normalized
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type McpToolMap = Record<string, any>

/**
 * Map to capture MCP tool execute() return values by toolCallId.
 * AI SDK v6's fullStream tool-result event has part.result === undefined,
 * so we store results here and look them up in the stream handler.
 */
type ToolResultsMap = Map<string, string>

async function buildMcpToolsForStreamText(): Promise<McpToolMap | undefined> {
  const mcpState = useMCPStore.getState()
  if (!mcpState.mcpEnabled) return undefined

  const activeServers = mcpState.servers.filter((s) => s.isActive)
  if (activeServers.length === 0) return undefined

  const tools: McpToolMap = {}

  for (const server of activeServers) {
    try {
      const mcpTools: MCPTool[] = await window.api.mcp.listTools(server)
      for (const mcpTool of mcpTools) {
        // Skip disabled tools
        if (server.disabledTools?.includes(mcpTool.name)) continue

        const toolId = `${server.id}__${mcpTool.name}`
        const normalizedSchema = normalizeMcpSchema(mcpTool.inputSchema)

        // Build tool definition manually — AI SDK v6 prepareToolsAndToolChoice
        // reads `inputSchema` (not `parameters`), so we provide it directly.
        tools[toolId] = {
          type: 'function' as const,
          description: mcpTool.description || mcpTool.name,
          inputSchema: jsonSchema(normalizedSchema as Parameters<typeof jsonSchema>[0]),
          execute: async (args: Record<string, unknown>) => {
            const result: MCPCallToolResponse = await window.api.mcp.callTool({
              server,
              name: mcpTool.name,
              args,
            })
            // Extract text content from MCP response (content may be undefined)
            const contentArr = result?.content ?? []
            const textParts = contentArr
              .filter((c) => c.type === 'text' && c.text)
              .map((c) => c.text)
            const extracted = textParts.join('\n')
            if (extracted) return extracted
            // Fallback: stringify content array (return '(empty)' if truly empty)
            return contentArr.length > 0 ? JSON.stringify(contentArr) : '(no content returned)'
          },
        }
      }
    } catch (err) {
      console.warn(`[MCP] Failed to list tools from ${server.name}:`, err)
    }
  }

  return Object.keys(tools).length > 0 ? tools : undefined
}

interface InputbarProps {
  assistant: Assistant
  topic: Topic
  sendRef?: React.MutableRefObject<((content: string) => void) | null>
}

const Inputbar: React.FC<InputbarProps> = ({ assistant, topic, sendRef }) => {
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
    async (content: string) => {
      if (!canSendMessage) return

      const model = assistant.model ?? assistant.defaultModel
      if (!model) {
        toast.error('No model configured. Go to Settings → AI Providers to add one.')
        return
      }

      const providers = useProviderStore.getState().providers
      const provider = providers.find((p) => p.id === model.provider && p.enabled !== false)
      if (!provider) {
        toast.error('Provider not found or disabled for the selected model.')
        return
      }

      // Mark as generating
      useRuntimeStore.getState().setGenerating(topic.id, true)

      try {
        const now = new Date().toISOString()
        const askId = nanoid()
        const messageStore = useMessageStore.getState()
        const blockStore = useMessageBlockStore.getState()

        // --- Create user message + block ---
        const userBlockId = nanoid()
        const userBlock: MessageBlock = {
          id: userBlockId,
          messageId: '',
          type: MessageBlockType.MAIN_TEXT,
          createdAt: now,
          status: MessageBlockStatus.SUCCESS,
          content,
        } as MainTextMessageBlock

        const userMessage: Message = {
          id: nanoid(),
          role: 'user',
          assistantId: assistant.id,
          topicId: topic.id,
          createdAt: now,
          status: 'success',
          askId,
          blocks: [userBlockId],
        }
        ;(userBlock as { messageId: string }).messageId = userMessage.id

        messageStore.addMessage(userMessage)
        blockStore.addBlock(userBlock)

        // --- Create assistant message placeholder ---
        const assistantBlockId = nanoid()
        const assistantBlock: MessageBlock = {
          id: assistantBlockId,
          messageId: '',
          type: MessageBlockType.MAIN_TEXT,
          createdAt: now,
          status: MessageBlockStatus.STREAMING,
          content: '',
        } as MainTextMessageBlock

        const assistantMessage: Message = {
          id: nanoid(),
          role: 'assistant',
          assistantId: assistant.id,
          topicId: topic.id,
          createdAt: now,
          status: 'processing',
          askId,
          modelId: model.id,
          model,
          blocks: [assistantBlockId],
        }
        ;(assistantBlock as { messageId: string }).messageId = assistantMessage.id

        messageStore.addMessage(assistantMessage)
        blockStore.addBlock(assistantBlock)

        // --- Build simple messages array for AI SDK ---
        // Collect recent messages for context (last 10 user/assistant pairs)
        const topicMessages = messageStore.getMessagesForTopic(topic.id)
        const sdkMessages: Array<{ role: 'user' | 'assistant'; content: string }> = []

        for (const msg of topicMessages) {
          if (msg.id === assistantMessage.id) continue // skip the placeholder
          if (msg.role !== 'user' && msg.role !== 'assistant') continue

          const blocks = (msg.blocks ?? [])
            .map((bid) => blockStore.getBlock(bid))
            .filter(Boolean) as MessageBlock[]
          const textBlock = blocks.find((b) => b.type === MessageBlockType.MAIN_TEXT) as MainTextMessageBlock | undefined
          const textContent = textBlock?.content ?? ''
          if (!textContent) continue

          sdkMessages.push({
            role: msg.role as 'user' | 'assistant',
            content: textContent,
          })
        }

        // --- Create AI SDK client and call streamText ---
        const client = resolveProviderClient(provider)

        // Use .chat() for OpenAI providers (AI SDK v6 defaults to Responses API otherwise)
        const providerModel = typeof client.chat === 'function'
          ? client.chat(model.id)
          : client(model.id)

        // --- Build MCP tools if enabled ---
        // Track tool execute() return values — AI SDK v6 fullStream tool-result
        // has part.result === undefined, so we capture results via callback.
        const toolResultsMap: ToolResultsMap = new Map()
        const mcpTools = await buildMcpToolsForStreamText()

        const stream = streamText({
          model: providerModel,
          messages: sdkMessages,
          system: assistant.prompt || undefined,
          abortSignal: AbortSignal.timeout(120000),
          ...(mcpTools ? {
            tools: mcpTools,
            maxSteps: 5,
            experimental_onToolCallFinish: (event) => {
              if (event.success && event.output != null) {
                const callId = event.toolCall?.toolCallId
                if (callId) {
                  const value = typeof event.output === 'string'
                    ? event.output
                    : JSON.stringify(event.output)
                  toolResultsMap.set(callId, value)
                }
              }
            },
          } : {}),
        })

        // --- Stream the response ---
        let fullText = ''
        for await (const part of stream.fullStream) {
          if (part.type === 'text-delta') {
            fullText += part.text
            blockStore.updateBlock(assistantBlockId, { content: fullText })
          } else if (part.type === 'tool-call') {
            // Show tool name without serverId prefix for cleaner display
            const displayName = part.toolName.includes('__')
              ? part.toolName.split('__').slice(1).join('__')
              : part.toolName
            fullText += `\n\n> 🔧 \`${displayName}\`\n`
            blockStore.updateBlock(assistantBlockId, { content: fullText })
          } else if (part.type === 'tool-result') {
            // Look up the actual tool result from our callback map
            // (AI SDK v6 fullStream tool-result output may be undefined for custom tools)
            const captured = toolResultsMap.get(part.toolCallId)
            const trimmed = (captured ?? '').trim()
            if (trimmed && trimmed !== '(no content returned)') {
              const preview = trimmed.length > 500 ? trimmed.slice(0, 500) + '...' : trimmed
              fullText += `\n\`\`\`\n${preview}\n\`\`\`\n\n`
            } else {
              fullText += '\n'
            }
            blockStore.updateBlock(assistantBlockId, { content: fullText })
          } else if (part.type === 'error') {
            const err = part.error as { message?: string; statusCode?: number; responseBody?: string }
            const detail = err?.message || err?.responseBody || String(part.error)
            console.error('[Inputbar] Stream error:', err)
            toast.error(detail, { duration: 8000 })
          }
        }

        // Finalize
        blockStore.updateBlock(assistantBlockId, {
          status: MessageBlockStatus.SUCCESS,
          content: fullText || '(No response received)',
        })
        messageStore.updateMessage(assistantMessage.id, {
          status: fullText ? 'success' : 'error',
        })

      } catch (error) {
        console.error('[Inputbar] Send failed:', error)
        const err = error as { message?: string; statusCode?: number; url?: string; responseBody?: string; data?: { error?: { message?: string } } }
        let detail: string
        if (err?.statusCode) {
          const body = err.data?.error?.message || err.responseBody || err.message || 'API call failed'
          detail = `[${err.statusCode}] ${body}`
        } else {
          detail = err?.message || String(error)
        }
        // Strip unhelpful class names like "AI_APICallError"
        if (detail.startsWith('AI_')) {
          detail = detail.replace(/^AI_\w+:\s*/, '')
        }
        toast.error(detail || 'Unknown API error', { duration: 8000 })
      } finally {
        useRuntimeStore.getState().setGenerating(topic.id, false)
      }
    },
    [topic, assistant, canSendMessage, attachments]
  )

  const handleStop = useCallback(() => {
    useRuntimeStore.getState().setGenerating(topic.id, false)
  }, [topic.id])

  // Expose handleSend to parent via ref (for suggestion clicks)
  useEffect(() => {
    if (sendRef) sendRef.current = handleSend
    return () => { if (sendRef) sendRef.current = null }
  }, [sendRef, handleSend])

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
