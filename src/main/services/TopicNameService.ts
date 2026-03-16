import { BrowserWindow } from 'electron'
import { ChatService } from './ChatService'
import { AICoreService } from './AICoreService'
import { ProviderService } from './ProviderService'
import { logger } from './LoggerService'
import type { ChatMessage } from '@shared/types/ai-core'

export class TopicNameService {
  private static instance: TopicNameService

  static getInstance(): TopicNameService {
    if (!TopicNameService.instance) {
      TopicNameService.instance = new TopicNameService()
    }
    return TopicNameService.instance
  }

  /**
   * Generate a concise topic name (3-7 words) from the provided messages.
   * Falls back to truncated first message content on failure.
   */
  async generateTopicName(
    topicId: string,
    inputMessages: Array<{ role: string; content: string }>
  ): Promise<{ name: string }> {
    const chatService = ChatService.getInstance()

    try {
      // Find an active provider/model to use for naming
      const providerService = ProviderService.getInstance()
      const providers = providerService.getProviders()
      const activeProvider = providers.find((p) => p.enabled && p.models.length > 0)

      if (!activeProvider) {
        throw new Error('No active provider available for topic naming')
      }

      const model = activeProvider.models.find((m) => m.enabled)
      if (!model) {
        throw new Error('No enabled model available for topic naming')
      }

      // Get the real provider (with decrypted key)
      const realProvider = providerService.getProviderWithKey(activeProvider.id)
      if (!realProvider) {
        throw new Error('Provider not found')
      }

      const apiKey = providerService.decryptKey(realProvider.apiKey)
      const aiCore = AICoreService.getInstance()

      const namingMessages: ChatMessage[] = [
        {
          role: 'system',
          content:
            'Generate a concise topic title (3-7 words) that summarizes the conversation. Reply with ONLY the title, no quotes, no punctuation at the end.'
        },
        ...inputMessages.map(
          (m) =>
            ({
              role: m.role as 'user' | 'assistant',
              content: m.content
            }) satisfies ChatMessage
        )
      ]

      // Use a simple non-streaming request for naming
      const window = BrowserWindow.getAllWindows()[0]
      if (!window) {
        throw new Error('No browser window available')
      }

      const requestId = `topic-name-${topicId}`
      let generatedName = ''

      // Collect the response via a promise
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Topic naming timed out'))
        }, 15000)

        const cleanup = () => {
          clearTimeout(timeout)
        }

        // Listen for the response
        const chunkHandler = (
          _event: Electron.Event,
          payload: { requestId: string; chunk: { content: string } }
        ) => {
          if (payload.requestId === requestId) {
            generatedName += payload.chunk.content
          }
        }

        const completeHandler = (
          _event: Electron.Event,
          payload: { requestId: string }
        ) => {
          if (payload.requestId === requestId) {
            cleanup()
            window.webContents.ipc.removeListener('ai:stream-chunk', chunkHandler)
            window.webContents.ipc.removeListener('ai:stream-complete', completeHandler)
            window.webContents.ipc.removeListener('ai:stream-error', errorHandler)
            resolve()
          }
        }

        const errorHandler = (
          _event: Electron.Event,
          payload: { requestId: string; error: { message: string } }
        ) => {
          if (payload.requestId === requestId) {
            cleanup()
            window.webContents.ipc.removeListener('ai:stream-chunk', chunkHandler)
            window.webContents.ipc.removeListener('ai:stream-complete', completeHandler)
            window.webContents.ipc.removeListener('ai:stream-error', errorHandler)
            reject(new Error(payload.error.message))
          }
        }

        window.webContents.ipc.on('ai:stream-chunk', chunkHandler)
        window.webContents.ipc.on('ai:stream-complete', completeHandler)
        window.webContents.ipc.on('ai:stream-error', errorHandler)

        aiCore.chat(
          realProvider,
          apiKey,
          model,
          namingMessages,
          { requestId, maxTokens: 50, stream: true },
          window
        )
      })

      // Clean up and validate the generated name
      const name = generatedName.trim().replace(/^["']|["']$/g, '').trim()
      const finalName = name || this.fallbackName(inputMessages)

      // Update the topic name (does NOT set isNameManuallyEdited)
      chatService.updateTopicName(topicId, finalName)
      logger.info(`[TopicNameService] Named topic ${topicId}: "${finalName}"`)

      return { name: finalName }
    } catch (err) {
      logger.warn('[TopicNameService] Topic naming failed, using fallback', err)
      const fallback = this.fallbackName(inputMessages)
      chatService.updateTopicName(topicId, fallback)
      return { name: fallback }
    }
  }

  private fallbackName(messages: Array<{ role: string; content: string }>): string {
    const firstUserMsg = messages.find((m) => m.role === 'user')
    if (firstUserMsg) {
      const text = firstUserMsg.content.trim()
      if (text.length <= 50) return text
      return text.substring(0, 47) + '...'
    }
    return 'New Topic'
  }
}
