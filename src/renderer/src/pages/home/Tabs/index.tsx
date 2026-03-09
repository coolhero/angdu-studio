import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@renderer/lib/utils'
import { Users, MessageSquare, Bot } from 'lucide-react'
import AssistantsTab from './AssistantsTab'
import TopicsTab from './TopicsTab'
import SessionsTab from './SessionsTab'

type TabId = 'assistants' | 'topics' | 'sessions'

const TABS: { id: TabId; icon: React.ElementType; labelKey: string; fallback: string }[] = [
  { id: 'assistants', icon: Users, labelKey: 'sidebar.assistants', fallback: 'Assistants' },
  { id: 'topics', icon: MessageSquare, labelKey: 'sidebar.topics', fallback: 'Topics' },
  { id: 'sessions', icon: Bot, labelKey: 'sidebar.sessions', fallback: 'Sessions' },
]

const TAB_COMPONENTS: Record<TabId, React.FC> = {
  assistants: AssistantsTab,
  topics: TopicsTab,
  sessions: SessionsTab,
}

const HomeTabs: React.FC = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabId>('assistants')

  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId)
  }, [])

  const ActiveComponent = TAB_COMPONENTS[activeTab]

  return (
    <div className="flex h-full w-[260px] flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
      {/* Tab headers */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-700">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'relative flex flex-1 items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t(tab.labelKey, tab.fallback)}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0"
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default React.memo(HomeTabs)
