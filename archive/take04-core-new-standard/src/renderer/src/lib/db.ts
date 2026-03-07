import Dexie, { type EntityTable } from 'dexie'
import type { FileMetadata, KnowledgeNote, Assistant, Topic, Message, MessageBlock, QuickPhrase } from '@shared/types'

class AppDatabase extends Dexie {
  files!: EntityTable<FileMetadata, 'id'>
  knowledge_notes!: EntityTable<KnowledgeNote, 'id'>
  assistants!: EntityTable<Assistant, 'id'>
  topics!: EntityTable<Topic, 'id'>
  messages!: EntityTable<Message, 'id'>
  message_blocks!: EntityTable<MessageBlock, 'id'>
  quick_phrases!: EntityTable<QuickPhrase, 'id'>

  constructor() {
    super('cherry-studio', {
      chromeTransactionDurability: 'strict'
    })

    this.version(1).stores({
      files: 'id, name, type, created_at'
    })

    this.version(2).stores({
      files: 'id, name, type, created_at',
      knowledge_notes: '&id'
    })

    this.version(3).stores({
      files: 'id, name, type, created_at',
      knowledge_notes: '&id',
      assistants: '&id, type',
      topics: '&id, assistantId, pinned',
      messages: '&id, topicId, assistantId, createdAt',
      message_blocks: '&id, messageId, type',
      quick_phrases: '&id, enabled'
    })
  }
}

export const db = new AppDatabase()
