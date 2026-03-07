import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_SHORTCUTS } from '@shared/config'
import type { Shortcut } from '@shared/types'

interface ShortcutsState {
  shortcuts: Shortcut[]
}

const initialState: ShortcutsState = {
  shortcuts: DEFAULT_SHORTCUTS
}

const shortcutsSlice = createSlice({
  name: 'shortcuts',
  initialState,
  reducers: {
    setShortcuts(state, action: PayloadAction<Shortcut[]>) {
      state.shortcuts = action.payload
    },
    updateShortcut(state, action: PayloadAction<Shortcut>) {
      const index = state.shortcuts.findIndex((s) => s.key === action.payload.key)
      if (index !== -1) {
        state.shortcuts[index] = action.payload
      }
    },
    toggleShortcutEnabled(state, action: PayloadAction<string>) {
      const shortcut = state.shortcuts.find((s) => s.key === action.payload)
      if (shortcut) {
        shortcut.enabled = !shortcut.enabled
      }
    }
  }
})

export const { setShortcuts, updateShortcut, toggleShortcutEnabled } = shortcutsSlice.actions
export default shortcutsSlice.reducer
