import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  File,
  FolderOpen,
  Globe,
  Map,
  StickyNote,
  Video,
  Settings2,
  Trash2,
  RotateCcw
} from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { useKnowledgeStore, useSelectedBase } from '@renderer/stores/useKnowledgeStore'
import { KnowledgeFiles } from './items/KnowledgeFiles'
import type { ItemType, KnowledgeBase } from '@shared/types/knowledge'

type TabKey = 'files' | 'urls' | 'notes'

const TABS: Array<{ key: TabKey; icon: typeof File; label: string }> = [
  { key: 'files', icon: File, label: 'knowledge.files' },
  { key: 'urls', icon: Globe, label: 'knowledge.urls' },
  { key: 'notes', icon: StickyNote, label: 'knowledge.notes' }
]

interface KnowledgeContentProps {
  base: KnowledgeBase
}

export function KnowledgeContent({ base }: KnowledgeContentProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabKey>('files')

  const handleDelete = useCallback(async () => {
    if (!confirm(t('knowledge.deleteConfirm', 'Are you sure you want to delete this knowledge base?'))) {
      return
    }
    await window.api.invoke['kb:delete'](base.id)
    useKnowledgeStore.getState().deleteBase(base.id)
  }, [base.id, t])

  const handleReset = useCallback(async () => {
    if (!confirm(t('knowledge.resetConfirm', 'Reset all embeddings for this knowledge base?'))) {
      return
    }
    await window.api.invoke['kb:reset'](base.id)
    // Reload bases from main
    await useKnowledgeStore.getState().hydrate()
  }, [base.id, t])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold">{base.name}</h2>
          <p className="text-xs text-muted-foreground">
            {base.model.name} &middot; {base.items.length}{' '}
            {t('knowledge.items', 'items')}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleReset}
            title={t('knowledge.reset', 'Reset embeddings')}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            title={t('knowledge.delete', 'Delete')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b px-4">
        {TABS.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors ${
              activeTab === key
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {t(label, key)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'files' && <KnowledgeFiles base={base} />}
        {activeTab === 'urls' && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Globe className="mb-2 h-8 w-8" />
            <p className="text-sm">{t('knowledge.urlsComingSoon', 'URL ingestion coming soon')}</p>
          </div>
        )}
        {activeTab === 'notes' && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <StickyNote className="mb-2 h-8 w-8" />
            <p className="text-sm">{t('knowledge.notesComingSoon', 'Notes coming soon')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
