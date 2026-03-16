import { ipcMain } from 'electron'
import { ChatService } from '../services/ChatService'
import { TopicNameService } from '../services/TopicNameService'
import type { Message, MessageBlock } from '@shared/types/message'

export function registerChatHandlers(): void {
  const chatService = ChatService.getInstance()
  const topicNameService = TopicNameService.getInstance()

  // --- Topic channels ---

  ipcMain.handle('chat:getTopics', (_event, assistantId: string) => {
    return chatService.getTopics(assistantId)
  })

  ipcMain.handle(
    'chat:createTopic',
    (_event, assistantId: string, name?: string) => {
      return chatService.createTopic(assistantId, name)
    }
  )

  ipcMain.handle('chat:deleteTopic', (_event, topicId: string) => {
    chatService.deleteTopic(topicId)
  })

  ipcMain.handle('chat:renameTopic', (_event, topicId: string, name: string) => {
    chatService.renameTopic(topicId, name)
  })

  // --- Message channels ---

  ipcMain.handle(
    'chat:getMessages',
    (_event, topicId: string, offset?: number, limit?: number) => {
      return chatService.getMessages(topicId, offset, limit)
    }
  )

  ipcMain.handle(
    'chat:addMessage',
    (_event, data: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>) => {
      return chatService.addMessage(data)
    }
  )

  ipcMain.handle(
    'chat:updateMessage',
    (_event, id: string, updates: Partial<Message>) => {
      return chatService.updateMessage(id, updates)
    }
  )

  ipcMain.handle('chat:deleteMessage', (_event, id: string) => {
    chatService.deleteMessage(id)
  })

  ipcMain.handle(
    'chat:deleteMessagesAfter',
    (_event, topicId: string, afterMessageId: string) => {
      return chatService.deleteMessagesAfter(topicId, afterMessageId)
    }
  )

  // --- Block channels ---

  ipcMain.handle('chat:getBlocks', (_event, messageId: string) => {
    return chatService.getBlocks(messageId)
  })

  ipcMain.handle('chat:getBlocksBatch', (_event, messageIds: string[]) => {
    return chatService.getBlocksBatch(messageIds)
  })

  ipcMain.handle(
    'chat:addBlock',
    (_event, data: Omit<MessageBlock, 'id' | 'createdAt' | 'updatedAt'>) => {
      return chatService.addBlock(data)
    }
  )

  ipcMain.handle(
    'chat:updateBlock',
    (_event, id: string, updates: Partial<MessageBlock>) => {
      return chatService.updateBlock(id, updates)
    }
  )

  ipcMain.handle(
    'chat:updateBlocksBatch',
    (_event, blocks: Array<{ id: string; updates: Partial<MessageBlock> }>) => {
      chatService.updateBlocksBatch(blocks)
    }
  )

  ipcMain.handle(
    'chat:upsertBlocksBatch',
    (_event, blocks: MessageBlock[]) => {
      chatService.upsertBlocksBatch(blocks)
    }
  )

  // --- Topic naming ---

  ipcMain.handle(
    'chat:generateTopicName',
    (_event, topicId: string, messages: Array<{ role: string; content: string }>) => {
      return topicNameService.generateTopicName(topicId, messages)
    }
  )
}
