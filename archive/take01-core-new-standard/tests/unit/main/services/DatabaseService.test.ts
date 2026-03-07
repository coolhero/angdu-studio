import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSqliteInstance, mockDrizzleInstance, mockPragma, mockClose } = vi.hoisted(() => {
  const mockPragma = vi.fn()
  const mockClose = vi.fn()
  const mockSqliteInstance = {
    pragma: mockPragma,
    close: mockClose
  }
  const mockDrizzleInstance = {}
  return { mockSqliteInstance, mockDrizzleInstance, mockPragma, mockClose }
})

vi.mock('better-sqlite3', () => ({
  default: vi.fn().mockImplementation(() => mockSqliteInstance)
}))

vi.mock('drizzle-orm/better-sqlite3', () => ({
  drizzle: vi.fn().mockReturnValue(mockDrizzleInstance)
}))

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mock/userData'),
    getName: vi.fn().mockReturnValue('Cherry Studio'),
    getVersion: vi.fn().mockReturnValue('0.1.0')
  }
}))

vi.mock('@main/utils/paths', () => ({
  getConfigPath: vi.fn().mockReturnValue('/mock/userData/config')
}))

vi.mock('node:fs', () => ({
  mkdirSync: vi.fn()
}))

import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { DatabaseService } from '@main/services/DatabaseService'

describe('DatabaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('creates a database at the default config path', () => {
      new DatabaseService()
      expect(Database).toHaveBeenCalledWith('/mock/userData/config/cherry-studio.db')
    })

    it('creates a database at a custom path when provided', () => {
      new DatabaseService('/custom/path/test.db')
      expect(Database).toHaveBeenCalledWith('/custom/path/test.db')
    })

    it('enables WAL journal mode', () => {
      new DatabaseService()
      expect(mockPragma).toHaveBeenCalledWith('journal_mode = WAL')
    })

    it('initializes Drizzle ORM with the sqlite instance', () => {
      new DatabaseService()
      expect(drizzle).toHaveBeenCalledWith(mockSqliteInstance)
    })
  })

  describe('getDrizzle', () => {
    it('returns the Drizzle ORM instance', () => {
      const service = new DatabaseService()
      expect(service.getDrizzle()).toBe(mockDrizzleInstance)
    })
  })

  describe('getSqlite', () => {
    it('returns the raw better-sqlite3 instance', () => {
      const service = new DatabaseService()
      expect(service.getSqlite()).toBe(mockSqliteInstance)
    })
  })

  describe('close', () => {
    it('closes the database connection', () => {
      const service = new DatabaseService()
      service.close()
      expect(mockClose).toHaveBeenCalled()
    })
  })
})
