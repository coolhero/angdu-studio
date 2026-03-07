import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { CherryStudioDB, type StoredFile } from '@renderer/databases/index'
import { incrementRef, decrementRef } from '@renderer/databases/fileRefCount'
import { FileType } from '@shared/types/file'

function createTestFile(id: string, refCount: number): StoredFile {
  return {
    id,
    name: `${id}.png`,
    path: `/files/${id}.png`,
    size: 1024,
    type: FileType.Image,
    mimeType: 'image/png',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    refCount
  }
}

describe('fileRefCount', () => {
  let db: CherryStudioDB

  beforeEach(async () => {
    db = new CherryStudioDB(`TestRefDB_${Date.now()}_${Math.random()}`)
  })

  describe('incrementRef', () => {
    it('increments the reference count by 1', async () => {
      await db.files.add(createTestFile('file-1', 1))

      await incrementRef(db, 'file-1')

      const file = await db.files.get('file-1')
      expect(file!.refCount).toBe(2)
    })

    it('increments from 0 to 1', async () => {
      await db.files.add(createTestFile('file-zero', 0))

      await incrementRef(db, 'file-zero')

      const file = await db.files.get('file-zero')
      expect(file!.refCount).toBe(1)
    })
  })

  describe('decrementRef', () => {
    it('decrements the reference count by 1', async () => {
      await db.files.add(createTestFile('file-2', 3))

      await decrementRef(db, 'file-2')

      const file = await db.files.get('file-2')
      expect(file!.refCount).toBe(2)
    })

    it('deletes the record when count reaches 0', async () => {
      await db.files.add(createTestFile('file-cleanup', 1))

      await decrementRef(db, 'file-cleanup')

      const file = await db.files.get('file-cleanup')
      expect(file).toBeUndefined()
    })

    it('does nothing when file does not exist', async () => {
      // Should not throw
      await decrementRef(db, 'nonexistent')
    })
  })
})
