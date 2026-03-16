import { useState, useCallback } from 'react'
import { Plus, Search, Download, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { useAssistantStore, useAssistants, useActiveAssistantId } from '@renderer/stores/useAssistantStore'
import { useTopicStore } from '@renderer/stores/useTopicStore'
import { useMessageStore } from '@renderer/stores/useMessageStore'
import { useBlockStore } from '@renderer/stores/useBlockStore'
import { AssistantList } from '@renderer/components/chat/AssistantList'
import { AssistantEditor } from '@renderer/components/chat/AssistantEditor'
import type { Assistant } from '@shared/types/assistant'

export function AssistantPanel() {
  const { t } = useTranslation()
  const assistants = useAssistants()
  const activeAssistantId = useActiveAssistantId()
  const [searchQuery, setSearchQuery] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingAssistant, setEditingAssistant] = useState<Assistant | null>(null)

  const handleSelect = useCallback(async (id: string) => {
    useAssistantStore.getState().setActiveAssistantId(id)
    // Load topics for the selected assistant
    useTopicStore.getState().clearTopics()
    useMessageStore.getState().clearMessages()
    useBlockStore.getState().clearAll()
    await useTopicStore.getState().loadTopics(id)
  }, [])

  const handleCreate = useCallback(() => {
    setEditingAssistant(null)
    setEditorOpen(true)
  }, [])

  const handleEdit = useCallback((assistant: Assistant) => {
    setEditingAssistant(assistant)
    setEditorOpen(true)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm(t('chat.deleteAssistantConfirm', '이 어시스턴트를 삭제하시겠습니까?'))) return
    await useAssistantStore.getState().deleteAssistant(id)
  }, [t])

  const handleSave = useCallback(
    async (data: Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (editingAssistant) {
        await useAssistantStore.getState().updateAssistant(editingAssistant.id, data)
      } else {
        await useAssistantStore.getState().addAssistant(data)
      }
    },
    [editingAssistant]
  )

  const handleImport = useCallback(async () => {
    const files = await window.api.invoke['dialog:openFile']({
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (!files?.[0]) return
    try {
      const buffer = await window.api.invoke['file:read'](files[0])
      const text = new TextDecoder().decode(buffer)
      await useAssistantStore.getState().importAssistants(text)
    } catch (err) {
      console.error('Import failed', err)
    }
  }, [])

  const handleExport = useCallback(async () => {
    const ids = assistants.filter((a) => !a.isDefault).map((a) => a.id)
    if (ids.length === 0) return
    try {
      const json = await useAssistantStore.getState().exportAssistants(ids)
      const path = await window.api.invoke['dialog:saveFile']({
        defaultPath: 'assistants.json',
        filters: [{ name: 'JSON', extensions: ['json'] }]
      })
      if (path) {
        const buffer = Buffer.from(json, 'utf-8')
        await window.api.invoke['file:write'](path, buffer)
      }
    } catch (err) {
      console.error('Export failed', err)
    }
  }, [assistants])

  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <h3 className="text-sm font-semibold">{t('chat.assistants', '어시스턴트')}</h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleImport} title={t('chat.importAssistants', '가져오기')}>
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleExport} title={t('chat.exportAssistants', '내보내기')}>
            <Upload className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleCreate} title={t('chat.newAssistant', '새 어시스턴트')}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 pl-7 text-xs"
            placeholder={t('chat.searchAssistants', '검색...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <AssistantList
        assistants={assistants}
        activeAssistantId={activeAssistantId}
        searchQuery={searchQuery}
        onSelect={handleSelect}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <AssistantEditor
        assistant={editingAssistant}
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
