import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FilePlus, Trash2, RotateCcw } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { useKnowledgeStore } from '@renderer/stores/useKnowledgeStore'
import { StatusIcon } from '../components/StatusIcon'
import type { KnowledgeBase, KnowledgeItem } from '@shared/types/knowledge'

interface KnowledgeFilesProps {
  base: KnowledgeBase
}

function FileRow({ base, item }: { base: KnowledgeBase; item: KnowledgeItem }) {
  const { t } = useTranslation()

  const handleRemove = useCallback(async () => {
    await window.api.invoke['kb:removeItem'](base.id, item.id)
    useKnowledgeStore.getState().removeItem(base.id, item.id)
  }, [base.id, item.id])

  const handleRetry = useCallback(async () => {
    await window.api.invoke['kb:retryItem'](base.id, item.id)
  }, [base.id, item.id])

  // Extract filename from path
  const fileName = item.content.split(/[/\\]/).pop() ?? item.content

  return (
    <div className="flex items-center gap-3 rounded-md border px-3 py-2 hover:bg-accent/50">
      <StatusIcon status={item.status} error={item.error} />
      <span className="flex-1 truncate text-sm" title={item.content}>
        {fileName}
      </span>
      {item.remark && (
        <span className="text-xs text-muted-foreground">{item.remark}</span>
      )}
      {item.status === 'failed' && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleRetry}
          title={t('knowledge.retry', 'Retry')}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
        onClick={handleRemove}
        title={t('knowledge.removeItem', 'Remove')}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

export function KnowledgeFiles({ base }: KnowledgeFilesProps) {
  const { t } = useTranslation()

  const fileItems = base.items.filter((i) => i.type === 'file')

  const handleAddFiles = useCallback(async () => {
    const files = await window.api.invoke['dialog:openFile']({
      properties: ['openFile', 'multiSelections'],
      filters: [
        {
          name: 'Documents',
          extensions: ['txt', 'md', 'pdf', 'docx', 'csv', 'json', 'xml', 'yaml', 'yml']
        }
      ]
    })
    if (!files || files.length === 0) return

    const items = await window.api.invoke['kb:addFiles'](base.id, files)
    const store = useKnowledgeStore.getState()
    for (const item of items) {
      store.addItem(base.id, item)
    }
  }, [base.id])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {t('knowledge.files', 'Files')} ({fileItems.length})
        </h3>
        <Button variant="outline" size="sm" onClick={handleAddFiles}>
          <FilePlus className="mr-1.5 h-3.5 w-3.5" />
          {t('knowledge.addFiles', 'Add Files')}
        </Button>
      </div>

      {fileItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-8 text-muted-foreground">
          <FilePlus className="mb-2 h-8 w-8" />
          <p className="text-sm">{t('knowledge.noFiles', 'No files added yet')}</p>
          <Button variant="link" size="sm" onClick={handleAddFiles} className="mt-1">
            {t('knowledge.addFiles', 'Add Files')}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {fileItems.map((item) => (
            <FileRow key={item.id} base={base} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
