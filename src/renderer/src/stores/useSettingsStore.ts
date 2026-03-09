import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Existing types
type SendMessageShortcut = 'Enter' | 'Shift+Enter' | 'Ctrl+Enter' | 'Meta+Enter'
type MessageStyle = 'bubble' | 'plain'
type NavigationType = 'none' | 'buttons' | 'anchor'
type TopicPosition = 'left' | 'right'
type MathEngine = 'katex' | 'mathjax'
type CodeStyle = 'auto' | 'dark' | 'light'

// F004 types
type ProxyMode = 'system' | 'custom' | 'none'
type ThemeMode = 'dark' | 'light' | 'auto'
type WindowStyle = 'default' | 'transparent'

interface SidebarIcon {
  id: string
  icon: string
  visible: boolean
  order: number
}

interface QuickPhrase {
  id: string
  label: string
  text: string
}

const DEFAULT_SIDEBAR_ICONS: SidebarIcon[] = [
  { id: 'chat', icon: 'MessageSquare', visible: true, order: 0 },
  { id: 'assistants', icon: 'Users', visible: true, order: 1 },
  { id: 'settings', icon: 'Settings', visible: true, order: 2 },
  { id: 'files', icon: 'FolderOpen', visible: true, order: 3 },
  { id: 'minapps', icon: 'LayoutGrid', visible: true, order: 4 },
]

export interface SettingsState {
  // Existing fields
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

  // F004: General Settings
  language: string
  launchOnBoot: boolean
  launchToTray: boolean

  // F004: Proxy Settings
  proxyMode: ProxyMode
  proxyUrl: string

  // F004: Display Settings
  themeMode: ThemeMode
  primaryColor: string
  fontFamily: string
  showMessageDivider: boolean
  windowStyle: WindowStyle
  sidebarIcons: SidebarIcon[]

  // F004: Behavior Settings
  pasteAsFileThreshold: number
  clickToShowTopic: boolean
  useTopicNamingForMessageTitle: boolean

  // F004: Provider-Specific
  ollamaKeepAliveTime: string
  vertexaiServiceAccount: string
  awsBedrockAuthType: string

  // F004: Quick Phrases
  quickPhrases: QuickPhrase[]

  // Existing actions
  setSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void
  resetSettings: () => void

  // F004: Quick Phrase actions
  addQuickPhrase: (phrase: QuickPhrase) => void
  updateQuickPhrase: (id: string, updates: Partial<Omit<QuickPhrase, 'id'>>) => void
  removeQuickPhrase: (id: string) => void

  // F004: Sidebar Icon actions
  updateSidebarIcon: (id: string, updates: Partial<Omit<SidebarIcon, 'id'>>) => void
  reorderSidebarIcons: (icons: SidebarIcon[]) => void
}

const DEFAULT_SETTINGS = {
  // Existing defaults
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

  // F004: General Settings
  language: 'ko',
  launchOnBoot: false,
  launchToTray: false,

  // F004: Proxy Settings
  proxyMode: 'system' as ProxyMode,
  proxyUrl: '',

  // F004: Display Settings
  themeMode: 'dark' as ThemeMode,
  primaryColor: '#1890ff',
  fontFamily: 'system-ui',
  showMessageDivider: true,
  windowStyle: 'default' as WindowStyle,
  sidebarIcons: DEFAULT_SIDEBAR_ICONS,

  // F004: Behavior Settings
  pasteAsFileThreshold: 500,
  clickToShowTopic: false,
  useTopicNamingForMessageTitle: true,

  // F004: Provider-Specific
  ollamaKeepAliveTime: '5m',
  vertexaiServiceAccount: '',
  awsBedrockAuthType: 'keys',

  // F004: Quick Phrases
  quickPhrases: [] as QuickPhrase[],
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      // Existing actions
      setSetting: (key, value) => set({ [key]: value } as Partial<SettingsState>),

      resetSettings: () => set(DEFAULT_SETTINGS),

      // F004: Quick Phrase actions
      addQuickPhrase: (phrase) =>
        set((state) => ({ quickPhrases: [...state.quickPhrases, phrase] })),

      updateQuickPhrase: (id, updates) =>
        set((state) => ({
          quickPhrases: state.quickPhrases.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      removeQuickPhrase: (id) =>
        set((state) => ({
          quickPhrases: state.quickPhrases.filter((p) => p.id !== id),
        })),

      // F004: Sidebar Icon actions
      updateSidebarIcon: (id, updates) =>
        set((state) => ({
          sidebarIcons: state.sidebarIcons.map((icon) =>
            icon.id === id ? { ...icon, ...updates } : icon,
          ),
        })),

      reorderSidebarIcons: (icons) => set({ sidebarIcons: icons }),
    }),
    {
      name: 'angdu-settings',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>
        if (version < 2) {
          // Merge new F004 defaults into existing persisted state
          return {
            ...DEFAULT_SETTINGS,
            ...state,
          }
        }
        return state
      },
      partialize: (state) => {
        const {
          setSetting: _setSetting,
          resetSettings: _resetSettings,
          addQuickPhrase: _addQuickPhrase,
          updateQuickPhrase: _updateQuickPhrase,
          removeQuickPhrase: _removeQuickPhrase,
          updateSidebarIcon: _updateSidebarIcon,
          reorderSidebarIcons: _reorderSidebarIcons,
          ...data
        } = state
        return data
      },
    },
  ),
)
