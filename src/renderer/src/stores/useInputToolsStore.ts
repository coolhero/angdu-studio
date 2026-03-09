import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type InputbarScope = 'chat' | 'session' | 'mini'

interface ToolOrder {
  visible: string[]
  hidden: string[]
}

interface InputToolsState {
  toolOrder: Record<InputbarScope, ToolOrder>
  isCollapsed: boolean

  setToolOrder: (scope: InputbarScope, order: ToolOrder) => void
  toggleCollapsed: () => void
  moveToolToVisible: (scope: InputbarScope, key: string) => void
  moveToolToHidden: (scope: InputbarScope, key: string) => void
  reorderTool: (scope: InputbarScope, fromIndex: number, toIndex: number) => void
}

const DEFAULT_VISIBLE_TOOLS = [
  'attachment',
  'webSearch',
  'knowledgeBase',
  'mcpTools',
  'mentionModels',
  'thinking',
  'generateImage',
  'newTopic',
  'newContext',
  'clearTopic',
]

const DEFAULT_HIDDEN_TOOLS = [
  'toggleExpand',
  'slashCommands',
  'quickPhrases',
  'resource',
  'urlContext',
  'createSession',
]

const defaultToolOrder: ToolOrder = {
  visible: DEFAULT_VISIBLE_TOOLS,
  hidden: DEFAULT_HIDDEN_TOOLS,
}

export const useInputToolsStore = create<InputToolsState>()(
  persist(
    (set) => ({
      toolOrder: {
        chat: { ...defaultToolOrder },
        session: { ...defaultToolOrder },
        mini: { visible: DEFAULT_VISIBLE_TOOLS.slice(0, 4), hidden: [...DEFAULT_VISIBLE_TOOLS.slice(4), ...DEFAULT_HIDDEN_TOOLS] },
      },
      isCollapsed: false,

      setToolOrder: (scope, order) =>
        set((state) => ({
          toolOrder: { ...state.toolOrder, [scope]: order },
        })),

      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),

      moveToolToVisible: (scope, key) =>
        set((state) => {
          const current = state.toolOrder[scope]
          if (current.visible.includes(key)) return state
          return {
            toolOrder: {
              ...state.toolOrder,
              [scope]: {
                visible: [...current.visible, key],
                hidden: current.hidden.filter((k) => k !== key),
              },
            },
          }
        }),

      moveToolToHidden: (scope, key) =>
        set((state) => {
          const current = state.toolOrder[scope]
          if (current.hidden.includes(key)) return state
          return {
            toolOrder: {
              ...state.toolOrder,
              [scope]: {
                visible: current.visible.filter((k) => k !== key),
                hidden: [...current.hidden, key],
              },
            },
          }
        }),

      reorderTool: (scope, fromIndex, toIndex) =>
        set((state) => {
          const current = state.toolOrder[scope]
          const visible = [...current.visible]
          const [moved] = visible.splice(fromIndex, 1)
          visible.splice(toIndex, 0, moved)
          return {
            toolOrder: {
              ...state.toolOrder,
              [scope]: { ...current, visible },
            },
          }
        }),
    }),
    {
      name: 'angdu-input-tools',
      version: 1,
      partialize: (state) => ({
        toolOrder: state.toolOrder,
      }),
    },
  ),
)
