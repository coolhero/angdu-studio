import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { messages } from './messages'

export const messageBlocks = sqliteTable(
  'message_blocks',
  {
    id: text('id').primaryKey(),
    messageId: text('message_id')
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),
    type: text('type', {
      enum: [
        'unknown',
        'main_text',
        'thinking',
        'translation',
        'image',
        'code',
        'tool',
        'file',
        'error',
        'citation',
        'video',
        'compact'
      ]
    })
      .notNull()
      .default('unknown'),
    status: text('status', { enum: ['pending', 'streaming', 'success', 'error'] })
      .notNull()
      .default('pending'),
    content: text('content', { mode: 'json' }).notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull()
  },
  (table) => [index('idx_message_blocks_message_id').on(table.messageId)]
)
