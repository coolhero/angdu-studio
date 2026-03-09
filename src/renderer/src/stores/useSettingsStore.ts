import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SendMessageShortcut = 'Enter' | 'Shift+Enter' | 'Ctrl+Enter' | 'Meta+Enter'
type MessageStyle = 'bubble' | 'plain'
type NavigationType = 'none' | 'buttons' | 'anchor'
type TopicPosition = 'left' | 'right'
type MathEngine = 'katex' | 'mathjax'
type CodeStyle = 'auto' | 'dark' | 'light'

export interface SettingsState {
  sendMessageShortcut: SendMessageShortcut
  narrowMode: boolean
  messageStyle: MessageStyle
  messageFont: string
  fontSize: number
  showPrompt: boolean
  showMessageOutline: boolean
  showInputEstimatedTokens: boolean
  messageNavigation: NavigationType
  topicPosition: TopicPosition
  showAssistants: boolean
  showTopics: boolean
  mathEngine: MathEngine
  mathEnableSingleDollar: boolean
  enableQuickPanelTriggers: boolean
  codeStyle: CodeStyle
  codeFontFamily: string

  setSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void
  resetSettings: () => void
}

const DEFAULT_SETTINGS = {
  sendMessageShortcut: 'Enter' as SendMessageShortcut,
  narrowMode: false,
  messageStyle: 'plain' as MessageStyle,
  messageFont: 'system',
  fontSize: 14,
  showPrompt: false,
  showMessageOutline: false,
  showInputEstimatedTokens: true,
  messageNavigation: 'buttons' as NavigationType,
  topicPosition: 'left' as TopicPosition,
  showAssistants: true,
  showTopics: true,
  mathEngine: 'katex' as MathEngine,
  mathEnableSingleDollar: true,
  enableQuickPanelTriggers: true,
  codeStyle: 'auto' as CodeStyle,
  codeFontFamily: 'monospace',
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setSetting: (key, value) => set({ [key]: value } as Partial<SettingsState>),

      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'angdu-settings',
      version: 1,
      partialize: (state) => {
        const { setSetting: _s, resetSettings: _r, ...data } = state
        return data
      },
    },
  ),
)
