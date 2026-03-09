import React, { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import type { Assistant } from '@renderer/types/assistant'
import type { Topic } from '@renderer/types/conversation'
import { useSettingsStore } from '@renderer/stores/useSettingsStore'
import { useRuntimeStore } from '@renderer/stores/useRuntimeStore'
import { useShortcut } from '@renderer/hooks/useShortcut'
import { useTopicMessages } from '@renderer/hooks/useTopicMessages'
import ContentSearch from '@renderer/components/ContentSearch'
import Messages from './Messages/Messages'
import Inputbar from './Inputbar/Inputbar'
import Prompt from './Messages/Prompt'

interface ChatProps {
  assistant: Assistant
  topic: Topic
}

const Chat: React.FC<ChatProps> = ({ assistant, topic }) => {
  const { t } = useTranslation()
  const showPrompt = useSettingsStore((s) => s.showPrompt)
  const isGenerating = useRuntimeStore((s) => s.generatingTopicIds.has(topic.id))
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { messages } = useTopicMessages(topic.id)
  const sendRef = useRef<((content: string) => void) | null>(null)

  // Ctrl+F / Cmd+F to toggle search
  useShortcut('mod+f', () => setIsSearchOpen((v) => !v))

  const handleSearchClose = useCallback(() => setIsSearchOpen(false), [])

  const handleSearchLocate = useCallback((messageId: string) => {
    const el = document.querySelector(`[data-message-id="${messageId}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Generating indicator */}
      {isGenerating && (
        <div className="flex items-center gap-1.5 border-b border-zinc-200 px-4 py-1 dark:border-zinc-700">
          <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {t('chat.generating', 'Generating...')}
          </span>
        </div>
      )}

      {/* Content search overlay */}
      {isSearchOpen && (
        <ContentSearch
          messages={messages}
          onLocate={handleSearchLocate}
          onClose={handleSearchClose}
        />
      )}

      {/* System prompt display */}
      {showPrompt && assistant.prompt && <Prompt prompt={assistant.prompt} />}

      <Messages topicId={topic.id} onSuggestionClick={(text) => sendRef.current?.(text)} />
      <Inputbar assistant={assistant} topic={topic} sendRef={sendRef} />
    </div>
  )
}

export default React.memo(Chat)
