import React, { useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PanelLeft, MessageSquare, Settings, FolderOpen, LayoutGrid, ChevronDown } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { useShowAssistants } from '@renderer/hooks/useShowAssistants'
import { useShowTopics } from '@renderer/hooks/useShowTopics'
import { useAppStore } from '@renderer/stores/useAppStore'
import { useRuntimeStore } from '@renderer/stores/useRuntimeStore'
import { useProviderStore } from '@renderer/stores/useProviderStore'
import { useAssistantsStore } from '@renderer/stores/useAssistantsStore'
import type { Assistant } from '@renderer/types/assistant'
import type { Topic } from '@renderer/types/conversation'
import type { Model } from '@renderer/types/provider'

interface NavbarProps {
  assistant?: Assistant
  topic?: Topic
}

const Navbar: React.FC<NavbarProps> = ({ assistant, topic }) => {
  const { t } = useTranslation()
  const [showAssistants, setShowAssistants] = useShowAssistants()
  const [showTopics, setShowTopics] = useShowTopics()
  const isMac = useAppStore((s) => s.appInfo?.platform === 'darwin')
  const setActivePage = useRuntimeStore((s) => s.setActivePage)
  const providers = useProviderStore((s) => s.providers)
  const updateAssistant = useAssistantsStore((s) => s.updateAssistant)

  // Collect all available models from enabled providers
  const availableModels = useMemo(() => {
    const models: Array<Model & { providerName: string }> = []
    for (const p of providers) {
      if (p.enabled === false) continue
      for (const m of p.models) {
        models.push({ ...m, providerName: p.name })
      }
    }
    return models
  }, [providers])

  const currentModel = assistant?.model ?? assistant?.defaultModel

  const handleModelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!assistant) return
      const selectedId = e.target.value
      if (!selectedId) {
        updateAssistant(assistant.id, { model: undefined })
        return
      }
      // Find the model across all providers
      for (const p of providers) {
        const model = p.models.find((m) => m.id === selectedId)
        if (model) {
          updateAssistant(assistant.id, { model })
          break
        }
      }
    },
    [assistant, providers, updateAssistant]
  )

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

      {/* Model selector */}
      {assistant && (
        <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          {availableModels.length > 0 ? (
            <div className="relative">
              <select
                value={currentModel?.id ?? ''}
                onChange={handleModelChange}
                className="h-7 appearance-none rounded-md border border-zinc-200 bg-transparent py-0 pl-2 pr-6 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
              >
                <option value="">Select model...</option>
                {providers
                  .filter((p) => p.enabled !== false && p.models.length > 0)
                  .map((p) => (
                    <optgroup key={p.id} label={p.name}>
                      {p.models.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name || m.id}
                        </option>
                      ))}
                    </optgroup>
                  ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-400" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setActivePage('settings')}
              className="rounded-md border border-dashed border-zinc-300 px-2 py-0.5 text-xs text-zinc-400 hover:border-zinc-400 hover:text-zinc-500 dark:border-zinc-600 dark:text-zinc-500"
            >
              {t('chat.error.noModel', 'No model configured')}
            </button>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center gap-0.5" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          type="button"
          onClick={() => setActivePage('files')}
          title={t('nav.files', 'Files')}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <FolderOpen className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setActivePage('minapps')}
          title={t('nav.minapps', 'Mini Apps')}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setActivePage('settings')}
          title={t('nav.settings', 'Settings')}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default React.memo(Navbar)
