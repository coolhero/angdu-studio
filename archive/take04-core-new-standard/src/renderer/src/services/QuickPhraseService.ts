// QuickPhraseService — Dexie CRUD for QuickPhrase entities (T050-T051)

import { db } from '../lib/db'
import type { QuickPhrase } from '@shared/types'

/**
 * Persist a new QuickPhrase to the database.
 */
export async function addQuickPhrase(phrase: QuickPhrase): Promise<void> {
  await db.quick_phrases.put(phrase)
}

/**
 * Overwrite an existing QuickPhrase in the database.
 */
export async function updateQuickPhrase(phrase: QuickPhrase): Promise<void> {
  await db.quick_phrases.put(phrase)
}

/**
 * Remove a QuickPhrase from the database by id.
 */
export async function removeQuickPhrase(id: string): Promise<void> {
  await db.quick_phrases.delete(id)
}

/**
 * Flip the enabled flag of a QuickPhrase without touching other fields.
 */
export async function toggleQuickPhrase(id: string, enabled: boolean): Promise<void> {
  await db.quick_phrases.update(id, { enabled })
}

/**
 * Load all QuickPhrases from the database, sorted ascending by sortOrder.
 * Items without a sortOrder value are treated as 0.
 */
export async function loadQuickPhrases(): Promise<QuickPhrase[]> {
  const phrases = await db.quick_phrases.toArray()
  return phrases.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

/**
 * Pure function — returns the content as-is.
 * Reserved for future template processing (variable substitution, etc.).
 */
export function insertPhrase(content: string): string {
  return content
}
