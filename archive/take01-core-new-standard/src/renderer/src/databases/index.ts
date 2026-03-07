import Dexie, { type Table } from 'dexie'
import type { FileMetadata } from '@shared/types/file'

/**
 * Extended FileMetadata with id and refCount for Dexie storage.
 */
export interface StoredFile extends FileMetadata {
  id: string
  refCount: number
}

/**
 * Dexie database for Cherry Studio client-side storage.
 */
export class CherryStudioDB extends Dexie {
  files!: Table<StoredFile, string>

  constructor(name = 'CherryStudioDB') {
    super(name)

    this.version(1).stores({
      files: 'id, name, type, created_at'
    })
  }
}

/** Singleton database instance */
export const db = new CherryStudioDB()
