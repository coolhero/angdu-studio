import type { FileMetadata } from '@shared/types'
import Dexie, { type EntityTable } from 'dexie'

class CherryStudioDatabase extends Dexie {
  files!: EntityTable<FileMetadata, 'id'>

  constructor() {
    super('CherryStudio')

    this.version(1).stores({
      files: 'id'
    })
  }
}

export const db = new CherryStudioDatabase()
export default db
