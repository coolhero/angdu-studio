import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { CherryStudioDB, type StoredFile } from '@renderer/databases/index'
import { FileType } from '@shared/types/file'

describe('CherryStudioDB', () => {
  let db: CherryStudioDB

  beforeEach(async () => {
    // Use a unique name per test to avoid state bleed
    db = new CherryStudioDB(`TestDB_${Date.now()}_${Math.random()}`)
  })

  it('creates a database instance', () => {
    expect(db).toBeDefined()
    expect(db.files).toBeDefined()
  })

  it('can add and retrieve a file record', async () => {
    const file: StoredFile = {
      id: 'file-1',
      name: 'test.png',
      path: '/files/test.png',
      size: 1024,
      type: FileType.Image,
      mimeType: 'image/png',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      refCount: 1
    }

    await db.files.add(file)
    const retrieved = await db.files.get('file-1')
    expect(retrieved).toBeDefined()
    expect(retrieved!.name).toBe('test.png')
    expect(retrieved!.refCount).toBe(1)
  })

  it('can query files by type', async () => {
    const imageFile: StoredFile = {
      id: 'file-img',
      name: 'photo.jpg',
      path: '/files/photo.jpg',
      size: 2048,
      type: FileType.Image,
      mimeType: 'image/jpeg',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      refCount: 1
    }
    const docFile: StoredFile = {
      id: 'file-doc',
      name: 'readme.txt',
      path: '/files/readme.txt',
      size: 512,
      type: FileType.Document,
      mimeType: 'text/plain',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      refCount: 1
    }

    await db.files.bulkAdd([imageFile, docFile])
    const images = await db.files.where('type').equals(FileType.Image).toArray()
    expect(images).toHaveLength(1)
    expect(images[0].name).toBe('photo.jpg')
  })

  it('can delete a file record', async () => {
    const file: StoredFile = {
      id: 'file-del',
      name: 'delete-me.txt',
      path: '/files/delete-me.txt',
      size: 100,
      type: FileType.Document,
      mimeType: 'text/plain',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      refCount: 0
    }

    await db.files.add(file)
    await db.files.delete('file-del')
    const result = await db.files.get('file-del')
    expect(result).toBeUndefined()
  })
})
