import Dexie, { type EntityTable } from 'dexie'
import type { FileMetadata } from '@shared/types'

interface SettingsRecord {
  key: string
  value: unknown
}

class CherryStudioDB extends Dexie {
  files!: EntityTable<FileMetadata, 'id'>
  settings!: EntityTable<SettingsRecord, 'key'>

  constructor() {
    super('CherryStudio')

    // Version 1 — F001 foundation tables only
    this.version(1).stores({
      files: 'id, type, purpose, created_at',
      settings: 'key'
    })
  }
}

export const db = new CherryStudioDB()
