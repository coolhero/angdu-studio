import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SelectionState {
  selectedText: string
  selectionHistory: string[]
  setSelectedText: (text: string) => void
  clearHistory: () => void
}

export const useSelectionStore = create<SelectionState>()(
  persist(
    (set, get) => ({
      selectedText: '',
      selectionHistory: [],
      setSelectedText: (text) => {
        const history = get().selectionHistory
        set({
          selectedText: text,
          selectionHistory: [text, ...history].slice(0, 50),
        })
      },
      clearHistory: () => set({ selectionHistory: [] }),
    }),
    {
      name: 'angdu-studio-selection',
    }
  )
)
