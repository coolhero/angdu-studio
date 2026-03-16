import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'
import { topics } from './topics'

export const messages = sqliteTable(
  'messages',
  {
    id: text('id').primaryKey(),
    topicId: text('topic_id')
      .notNull()
      .references(() => topics.id, { onDelete: 'cascade' }),
    assistantId: text('assistant_id').notNull(),
    role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
    status: text('status', {
      enum: ['pending', 'sending', 'streaming', 'success', 'error', 'paused']
    })
      .notNull()
      .default('pending'),
    modelId: text('model_id'),
    providerId: text('provider_id'),
    type: text('type', { enum: ['text', 'clear_context', 'divider'] })
      .notNull()
      .default('text'),
    mentions: text('mentions', { mode: 'json' }).$type<string[]>(),
    multiModelMessageStyle: text('multi_model_message_style', {
      enum: ['horizontal', 'vertical', 'fold', 'grid']
    }),
    // Token usage
    promptTokens: integer('prompt_tokens'),
    completionTokens: integer('completion_tokens'),
    totalTokens: integer('total_tokens'),
    // Timing metrics
    firstTokenLatency: real('first_token_latency'),
    totalDuration: real('total_duration'),
    // Timestamps
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull()
  },
  (table) => [
    index('idx_messages_topic_id').on(table.topicId),
    index('idx_messages_created_at').on(table.createdAt)
  ]
)
