import { create } from 'zustand'
import type { Shortcut } from '@shared/types/settings'
import { DEFAULT_SHORTCUTS } from '@shared/types/settings'

interface ShortcutsState {
  shortcuts: Shortcut[]
  isRecording: boolean
  recordingKey: string | null

  hydrate: () => Promise<void>
  updateShortcut: (key: string, combo: string[]) => void
  resetToDefaults: () => Promise<void>
  startRecording: (key: string) => void
  stopRecording: () => void
  checkConflict: (combo: string[]) => Shortcut | null
}

function serializeShortcuts(shortcuts: Shortcut[]): string {
  return JSON.stringify(shortcuts)
}

function parseShortcuts(raw: string): Shortcut[] {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [...DEFAULT_SHORTCUTS]
    }
    return parsed as Shortcut[]
  } catch {
    return [...DEFAULT_SHORTCUTS]
  }
}

export const useShortcutsStore = create<ShortcutsState>((set, get) => ({
  shortcuts: [...DEFAULT_SHORTCUTS],
  isRecording: false,
  recordingKey: null,

  hydrate: async () => {
    try {
      const raw = (await window.api.invoke['config:get']('shortcuts')) as string
      const shortcuts = parseShortcuts(raw)
      set({ shortcuts })
    } catch {
      set({ shortcuts: [...DEFAULT_SHORTCUTS] })
    }
  },

  updateShortcut: (key: string, combo: string[]) => {
    const { shortcuts } = get()
    const updated = shortcuts.map((s) =>
      s.key === key ? { ...s, shortcut: combo } : s
    )
    set({ shortcuts: updated })

    // Persist
    window.api.invoke['config:set']('shortcuts', serializeShortcuts(updated))

    // Register with main process
    const accelerator = combo.join('+')
    window.api.invoke['shortcuts:register'](key, accelerator)
  },

  resetToDefaults: async () => {
    const defaults = [...DEFAULT_SHORTCUTS]
    set({ shortcuts: defaults })

    // Persist
    await window.api.invoke['config:set']('shortcuts', serializeShortcuts(defaults))

    // Unregister all and re-register defaults
    await window.api.invoke['shortcuts:unregisterAll']()
    for (const s of defaults) {
      if (s.enabled) {
        const accelerator = s.shortcut.join('+')
        window.api.invoke['shortcuts:register'](s.key, accelerator)
      }
    }
  },

  startRecording: (key: string) => {
    set({ isRecording: true, recordingKey: key })
  },

  stopRecording: () => {
    set({ isRecording: false, recordingKey: null })
  },

  checkConflict: (combo: string[]) => {
    const { shortcuts } = get()
    const comboStr = combo.join('+').toLowerCase()
    return (
      shortcuts.find(
        (s) => s.enabled && s.shortcut.join('+').toLowerCase() === comboStr
      ) ?? null
    )
  }
}))

// ─── Referentially stable selectors ─────────────────────────────────────────
import { useShallow } from 'zustand/react/shallow'

export function useShortcutsList(): Shortcut[] {
  return useShortcutsStore(useShallow((s) => s.shortcuts))
}

export const useIsRecording = (): boolean => useShortcutsStore((s) => s.isRecording)
export const useRecordingKey = (): string | null => useShortcutsStore((s) => s.recordingKey)
