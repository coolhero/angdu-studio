import { describe, it, expect, vi } from 'vitest'

const { mockTable } = vi.hoisted(() => ({
  mockTable: {
    get: vi.fn(),
    put: vi.fn(),
    add: vi.fn(),
    delete: vi.fn(),
    toArray: vi.fn(),
    where: vi.fn().mockReturnThis(),
    equals: vi.fn().mockReturnThis(),
    first: vi.fn()
  }
}))

vi.mock('dexie', () => {
  class MockDexie {
    constructor() {}

    version() {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this as Record<string, unknown>
      return {
        stores: vi.fn().mockImplementation((schema: Record<string, string>) => {
          for (const tableName of Object.keys(schema)) {
            self[tableName] = mockTable
          }
          return { upgrade: vi.fn().mockReturnThis() }
        })
      }
    }

    table() {
      return mockTable
    }

    open() {
      return Promise.resolve()
    }
  }

  return { default: MockDexie }
})

import { db } from '../index'

describe('Dexie Database', () => {
  it('should export a database instance', () => {
    expect(db).toBeDefined()
  })

  it('should have files table', () => {
    expect(db.files).toBeDefined()
  })

  it('should have settings table', () => {
    expect(db.settings).toBeDefined()
  })
})
