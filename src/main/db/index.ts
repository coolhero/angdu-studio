import { app } from 'electron'
import { join } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { logger } from '../services/LoggerService'

let sqlite: Database.Database | null = null
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
  if (!_db) {
    throw new Error('[DB] Database not initialized. Call initializeDatabase() first.')
  }
  return _db
}

export function initializeDatabase(): void {
  const dbPath = join(app.getPath('userData'), 'angdu-studio.db')
  logger.info(`[DB] Opening database at ${dbPath}`)

  sqlite = new Database(dbPath)

  // Enable WAL mode for better concurrent read performance
  sqlite.pragma('journal_mode = WAL')
  // Enable foreign keys
  sqlite.pragma('foreign_keys = ON')

  _db = drizzle(sqlite, { schema })

  // Run migrations (create tables if they don't exist)
  runMigrations(sqlite)

  logger.info('[DB] Database initialized successfully')
}

function runMigrations(db: Database.Database): void {
  // Create tables directly — simpler than file-based migrations for embedded DB
  db.exec(`
    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      assistant_id TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT 'New Topic',
      type TEXT NOT NULL DEFAULT 'normal',
      pinned INTEGER NOT NULL DEFAULT 0,
      is_name_manually_edited INTEGER NOT NULL DEFAULT 0,
      message_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_topics_assistant_id ON topics(assistant_id);

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
      assistant_id TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      model_id TEXT,
      provider_id TEXT,
      type TEXT NOT NULL DEFAULT 'text',
      mentions TEXT,
      multi_model_message_style TEXT,
      prompt_tokens INTEGER,
      completion_tokens INTEGER,
      total_tokens INTEGER,
      first_token_latency REAL,
      total_duration REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_messages_topic_id ON messages(topic_id);
    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

    CREATE TABLE IF NOT EXISTS message_blocks (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
      type TEXT NOT NULL DEFAULT 'unknown',
      status TEXT NOT NULL DEFAULT 'pending',
      content TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_message_blocks_message_id ON message_blocks(message_id);
  `)

  logger.info('[DB] Migrations applied')
}

export function closeDatabase(): void {
  if (sqlite) {
    sqlite.close()
    sqlite = null
    _db = null
    logger.info('[DB] Database closed')
  }
}
