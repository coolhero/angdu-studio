import React from 'react'
import { useTranslation } from 'react-i18next'
import { PanelLeft, MessageSquare } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { useShowAssistants } from '@renderer/hooks/useShowAssistants'
import { useShowTopics } from '@renderer/hooks/useShowTopics'
import { useAppStore } from '@renderer/stores/useAppStore'
import type { Assistant } from '@renderer/types/assistant'
import type { Topic } from '@renderer/types/conversation'

interface NavbarProps {
  assistant?: Assistant
  topic?: Topic
}

const Navbar: React.FC<NavbarProps> = ({ assistant, topic }) => {
  const { t } = useTranslation()
  const [showAssistants, setShowAssistants] = useShowAssistants()
  const [showTopics, setShowTopics] = useShowTopics()
  const isMac = useAppStore((s) => s.appInfo?.platform === 'darwin')

  return (
    <div
      className={cn(
        'flex h-10 items-center gap-1 border-b border-zinc-200 px-2 dark:border-zinc-700',
        isMac && 'pl-[70px]'
      )}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Sidebar toggle - assistants */}
      <button
        type="button"
        onClick={() => setShowAssistants(!showAssistants)}
        title={t('navbar.toggleAssistants', 'Toggle Assistants')}
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
          showAssistants
            ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100'
            : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
        )}
      >
        <PanelLeft className="h-4 w-4" />
      </button>

      {/* Sidebar toggle - topics */}
      <button
        type="button"
        onClick={() => setShowTopics(!showTopics)}
        title={t('navbar.toggleTopics', 'Toggle Topics')}
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
          showTopics
            ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100'
            : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
        )}
      >
        <MessageSquare className="h-4 w-4" />
      </button>

      {/* Separator */}
      <div className="mx-1 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />

      {/* Active assistant name */}
      {assistant && (
        <div className="flex items-center gap-1.5 text-sm">
          <span>{assistant.emoji || '🤖'}</span>
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{assistant.name}</span>
        </div>
      )}

      {/* Active topic name */}
      {topic && (
        <>
          <span className="mx-1 text-zinc-300 dark:text-zinc-600">/</span>
          <span className="truncate text-sm text-zinc-500 dark:text-zinc-400">{topic.name}</span>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Model name */}
      {assistant?.model && (
        <span className="truncate text-xs text-zinc-400 dark:text-zinc-500">
          {assistant.model.name || assistant.model.id}
        </span>
      )}
    </div>
  )
}

export default React.memo(Navbar)
