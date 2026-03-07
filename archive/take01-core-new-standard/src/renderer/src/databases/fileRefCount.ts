import type { CherryStudioDB } from './index'

/**
 * Increments the reference count for a stored file.
 */
export async function incrementRef(db: CherryStudioDB, fileId: string): Promise<void> {
  await db.files.where('id').equals(fileId).modify((file) => {
    file.refCount = (file.refCount ?? 0) + 1
  })
}

/**
 * Decrements the reference count for a stored file.
 * If the count reaches 0, the file record is deleted from the database.
 */
export async function decrementRef(db: CherryStudioDB, fileId: string): Promise<void> {
  const file = await db.files.get(fileId)
  if (!file) return

  const newCount = (file.refCount ?? 1) - 1
  if (newCount <= 0) {
    await db.files.delete(fileId)
  } else {
    await db.files.update(fileId, { refCount: newCount })
  }
}
