import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

export const topics = sqliteTable(
  'topics',
  {
    id: text('id').primaryKey(),
    assistantId: text('assistant_id').notNull(),
    name: text('name').notNull().default('New Topic'),
    type: text('type', { enum: ['normal', 'pinned'] })
      .notNull()
      .default('normal'),
    pinned: integer('pinned', { mode: 'boolean' }).notNull().default(false),
    isNameManuallyEdited: integer('is_name_manually_edited', { mode: 'boolean' })
      .notNull()
      .default(false),
    messageCount: integer('message_count').notNull().default(0),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull()
  },
  (table) => [index('idx_topics_assistant_id').on(table.assistantId)]
)
