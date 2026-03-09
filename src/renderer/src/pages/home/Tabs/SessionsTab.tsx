import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Bot } from 'lucide-react'
import AddButton from './components/AddButton'

const SessionsTab: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
        <span className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
          {t('sidebar.sessions', 'Sessions')}
        </span>
        <AddButton
          onClick={() => {}}
          disabled
          title={t('session.add', 'Add Session')}
        />
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-zinc-400 dark:text-zinc-500">
          <Bot className="h-8 w-8" />
          <p className="text-xs">{t('sidebar.noSessions', 'No sessions')}</p>
        </div>
      </ScrollArea>
    </div>
  )
}

export default React.memo(SessionsTab)
