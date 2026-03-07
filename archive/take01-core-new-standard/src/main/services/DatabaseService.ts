import Database from 'better-sqlite3'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import { getConfigPath } from '../utils/paths'

const DB_FILENAME = 'cherry-studio.db'

/**
 * Manages the SQLite database connection using better-sqlite3
 * and provides a Drizzle ORM instance for type-safe queries.
 *
 * No tables are defined in F001 — this is infrastructure only.
 */
export class DatabaseService {
  private sqlite: Database.Database
  private db: BetterSQLite3Database

  constructor(dbPath?: string) {
    const configPath = dbPath ?? join(getConfigPath(), DB_FILENAME)

    // Ensure directory exists
    const dir = configPath.substring(0, configPath.lastIndexOf('/'))
    if (dir) {
      mkdirSync(dir, { recursive: true })
    }

    this.sqlite = new Database(configPath)

    // Enable WAL mode for better concurrent performance
    this.sqlite.pragma('journal_mode = WAL')

    // Initialize Drizzle ORM (no schema for F001)
    this.db = drizzle(this.sqlite)
  }

  /** Returns the Drizzle ORM database instance */
  getDrizzle(): BetterSQLite3Database {
    return this.db
  }

  /** Returns the raw better-sqlite3 database instance */
  getSqlite(): Database.Database {
    return this.sqlite
  }

  /** Closes the database connection */
  close(): void {
    this.sqlite.close()
  }
}
