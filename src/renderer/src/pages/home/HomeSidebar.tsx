import { useState, useCallback } from 'react'
import { Plus, Search, Download, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { useAssistantStore, useAssistants, useActiveAssistantId } from '@renderer/stores/useAssistantStore'
import { useTopicStore, useTopics, useActiveTopicId, useSidebarVisible } from '@renderer/stores/useTopicStore'
import { useMessageStore } from '@renderer/stores/useMessageStore'
import { useBlockStore } from '@renderer/stores/useBlockStore'
import { AssistantList } from '@renderer/components/chat/AssistantList'
import { AssistantEditor } from '@renderer/components/chat/AssistantEditor'
import { TopicList } from '@renderer/components/chat/TopicList'
import type { Assistant } from '@shared/types/assistant'

type SidebarTab = 'assistants' | 'topics'

export function HomeSidebar() {
  const { t } = useTranslation()
  const sidebarVisible = useSidebarVisible()
  const [activeTab, setActiveTab] = useState<SidebarTab>('assistants')

  // Assistant state
  const assistants = useAssistants()
  const activeAssistantId = useActiveAssistantId()
  const [searchQuery, setSearchQuery] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingAssistant, setEditingAssistant] = useState<Assistant | null>(null)

  // Topic state
  const topics = useTopics()
  const activeTopicId = useActiveTopicId()

  // --- Assistant handlers ---

  const handleSelectAssistant = useCallback(async (id: string) => {
    useAssistantStore.getState().setActiveAssistantId(id)
    useTopicStore.getState().clearTopics()
    useMessageStore.getState().clearMessages()
    useBlockStore.getState().clearAll()
    await useTopicStore.getState().loadTopics(id)
    // Switch to topics tab after selecting an assistant
    setActiveTab('topics')
  }, [])

  const handleCreateAssistant = useCallback(() => {
    setEditingAssistant(null)
    setEditorOpen(true)
  }, [])

  const handleEditAssistant = useCallback((assistant: Assistant) => {
    setEditingAssistant(assistant)
    setEditorOpen(true)
  }, [])

  const handleDeleteAssistant = useCallback(async (id: string) => {
    if (!confirm(t('chat.deleteAssistantConfirm', 'Delete this assistant?'))) return
    await useAssistantStore.getState().deleteAssistant(id)
  }, [t])

  const handleSaveAssistant = useCallback(
    async (data: Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (editingAssistant) {
        await useAssistantStore.getState().updateAssistant(editingAssistant.id, data)
      } else {
        await useAssistantStore.getState().addAssistant(data)
      }
    },
    [editingAssistant]
  )

  const handleImportAssistants = useCallback(async () => {
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

  const handleExportAssistants = useCallback(async () => {
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

  // --- Topic handlers ---

  const handleNewTopic = useCallback(async () => {
    const assistantId = useAssistantStore.getState().activeAssistantId
    const topic = await useTopicStore.getState().createTopic(assistantId)
    useMessageStore.getState().clearMessages()
    useBlockStore.getState().clearAll()
    await useMessageStore.getState().loadMessages(topic.id)
  }, [])

  const handleSelectTopic = useCallback(async (id: string) => {
    useTopicStore.getState().setActiveTopicId(id)
    useBlockStore.getState().clearAll()
    await useMessageStore.getState().loadMessages(id)
  }, [])

  const handleRenameTopic = useCallback(async (id: string, name: string) => {
    await useTopicStore.getState().renameTopic(id, name)
  }, [])

  const handleDeleteTopic = useCallback(async (id: string) => {
    if (!confirm(t('chat.deleteTopicConfirm', 'Delete this conversation?'))) return
    await useTopicStore.getState().deleteTopic(id)
    const { activeTopicId: newActiveId } = useTopicStore.getState()
    if (newActiveId) {
      useBlockStore.getState().clearAll()
      await useMessageStore.getState().loadMessages(newActiveId)
    } else {
      useMessageStore.getState().clearMessages()
      useBlockStore.getState().clearAll()
    }
  }, [t])

  return (
    <div
      className="overflow-hidden transition-all duration-200 ease-in-out"
      style={{ width: sidebarVisible ? 260 : 0 }}
    >
      {sidebarVisible && (
        <div className="flex h-full min-h-0 w-[260px] shrink-0 flex-col border-r border-border bg-background">
          {/* Tab switcher — like cherry-studio */}
          <div className="flex border-b border-border px-3 pt-1.5 pb-0">
            <button
              className={`flex-1 pb-2 text-center text-sm font-medium transition-colors relative ${
                activeTab === 'assistants'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('assistants')}
            >
              {t('chat.assistants', 'Assistants')}
              {activeTab === 'assistants' && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded bg-primary" />
              )}
            </button>
            <button
              className={`flex-1 pb-2 text-center text-sm font-medium transition-colors relative ${
                activeTab === 'topics'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('topics')}
            >
              {t('chat.topics', 'Topics')}
              {activeTab === 'topics' && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded bg-primary" />
              )}
            </button>
          </div>

          {/* Tab content */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {activeTab === 'assistants' && (
              <>
                {/* Assistants toolbar */}
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleImportAssistants} title={t('chat.importAssistants', 'Import')}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleExportAssistants} title={t('chat.exportAssistants', 'Export')}>
                      <Upload className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleCreateAssistant} title={t('chat.newAssistant', 'New Assistant')}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="px-3 pb-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="h-8 pl-7 text-xs"
                      placeholder={t('chat.searchAssistants', 'Search...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <AssistantList
                  assistants={assistants}
                  activeAssistantId={activeAssistantId}
                  searchQuery={searchQuery}
                  onSelect={handleSelectAssistant}
                  onEdit={handleEditAssistant}
                  onDelete={handleDeleteAssistant}
                />
                <AssistantEditor
                  assistant={editingAssistant}
                  open={editorOpen}
                  onClose={() => setEditorOpen(false)}
                  onSave={handleSaveAssistant}
                />
              </>
            )}

            {activeTab === 'topics' && (
              <>
                {/* Topics toolbar */}
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs text-muted-foreground">
                    {t('chat.topicCount', '{{count}} topics', { count: topics.length })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={handleNewTopic}
                    title={t('chat.newTopic', 'New Topic')}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <TopicList
                  topics={topics}
                  activeTopicId={activeTopicId}
                  onSelect={handleSelectTopic}
                  onRename={handleRenameTopic}
                  onDelete={handleDeleteTopic}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
