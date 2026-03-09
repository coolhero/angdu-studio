import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface MiniApp {
  id: string
  name: string
  url: string
  icon?: string
  order: number
}

interface MiniAppsState {
  miniApps: MiniApp[]
  addMiniApp: (app: Omit<MiniApp, 'id' | 'order'>) => void
  updateMiniApp: (id: string, updates: Partial<MiniApp>) => void
  removeMiniApp: (id: string) => void
  reorderMiniApps: (ids: string[]) => void
}

export const useMiniAppsStore = create<MiniAppsState>()(
  persist(
    immer((set) => ({
      miniApps: [] as MiniApp[],

      addMiniApp: (app: Omit<MiniApp, 'id' | 'order'>) =>
        set((state) => {
          state.miniApps.push({ ...app, id: nanoid(), order: state.miniApps.length })
        }),

      updateMiniApp: (id: string, updates: Partial<MiniApp>) =>
        set((state) => {
          const index = state.miniApps.findIndex((a) => a.id === id)
          if (index !== -1) {
            Object.assign(state.miniApps[index], updates)
          }
        }),

      removeMiniApp: (id: string) =>
        set((state) => {
          state.miniApps = state.miniApps
            .filter((a) => a.id !== id)
            .map((a, i) => ({ ...a, order: i }))
        }),

      reorderMiniApps: (ids: string[]) =>
        set((state) => {
          for (const [i, id] of ids.entries()) {
            const app = state.miniApps.find((a) => a.id === id)
            if (app) app.order = i
          }
        })
    })),
    {
      name: 'angdu-miniapps',
      partialize: (state) => ({
        miniApps: state.miniApps
      })
    }
  )
)
