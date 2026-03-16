import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DraftContent } from '@shared/types/assistant'

interface DraftState {
  /** topicId → draft content */
  drafts: Record<string, DraftContent>
}

interface DraftActions {
  saveDraft: (topicId: string, draft: DraftContent) => void
  loadDraft: (topicId: string) => DraftContent | null
  clearDraft: (topicId: string) => void
}

export const useDraftStore = create<DraftState & DraftActions>()(
  persist(
    (set, get) => ({
      drafts: {},

      saveDraft: (topicId: string, draft: DraftContent) => {
        set((s) => ({
          drafts: { ...s.drafts, [topicId]: draft }
        }))
      },

      loadDraft: (topicId: string) => {
        return get().drafts[topicId] ?? null
      },

      clearDraft: (topicId: string) => {
        set((s) => {
          const { [topicId]: _, ...rest } = s.drafts
          return { drafts: rest }
        })
      }
    }),
    {
      name: 'angdu-drafts'
    }
  )
)
