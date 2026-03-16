import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuickPhrasesStore, usePhrasesList } from '@renderer/stores/useQuickPhrasesStore'
import { SettingSection } from '@renderer/components/settings/SettingSection'
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus, Search, X, Check } from 'lucide-react'
import type { QuickPhrase } from '@shared/types/settings'

export function QuickPhraseEditor() {
  const { t } = useTranslation()
  const phrases = usePhrasesList()
  const addPhrase = useQuickPhrasesStore((s) => s.addPhrase)
  const updatePhrase = useQuickPhrasesStore((s) => s.updatePhrase)
  const deletePhrase = useQuickPhrasesStore((s) => s.deletePhrase)
  const reorderPhrases = useQuickPhrasesStore((s) => s.reorderPhrases)

  const [searchQuery, setSearchQuery] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const filteredPhrases = useMemo(() => {
    if (!searchQuery.trim()) return phrases
    const q = searchQuery.toLowerCase()
    return phrases.filter(
      (p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
    )
  }, [phrases, searchQuery])

  const handleAdd = useCallback(() => {
    setIsAdding(true)
    setFormTitle('')
    setFormContent('')
    setEditingId(null)
  }, [])

  const handleSaveNew = useCallback(() => {
    if (!formTitle.trim() || !formContent.trim()) return
    addPhrase(formTitle.trim(), formContent.trim())
    setIsAdding(false)
    setFormTitle('')
    setFormContent('')
  }, [formTitle, formContent, addPhrase])

  const handleCancelAdd = useCallback(() => {
    setIsAdding(false)
    setFormTitle('')
    setFormContent('')
  }, [])

  const handleStartEdit = useCallback((phrase: QuickPhrase) => {
    setEditingId(phrase.id)
    setFormTitle(phrase.title)
    setFormContent(phrase.content)
    setIsAdding(false)
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (!editingId || !formTitle.trim() || !formContent.trim()) return
    updatePhrase(editingId, { title: formTitle.trim(), content: formContent.trim() })
    setEditingId(null)
    setFormTitle('')
    setFormContent('')
  }, [editingId, formTitle, formContent, updatePhrase])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setFormTitle('')
    setFormContent('')
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      deletePhrase(id)
      setDeleteConfirmId(null)
    },
    [deletePhrase]
  )

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index <= 0) return
      const reordered = [...phrases]
      ;[reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]]
      reorderPhrases(reordered)
    },
    [phrases, reorderPhrases]
  )

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index >= phrases.length - 1) return
      const reordered = [...phrases]
      ;[reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]]
      reorderPhrases(reordered)
    },
    [phrases, reorderPhrases]
  )

  return (
    <SettingSection title={t('settings.quickPhrases.title')}>
      {/* Search + Add */}
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('settings.quickPhrases.searchPlaceholder')}
            className="h-8 w-full rounded-md border border-border bg-transparent pl-7 pr-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={isAdding}
          className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          {t('settings.quickPhrases.add')}
        </button>
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="mb-3 rounded-md border border-primary/30 bg-muted/50 p-3">
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder={t('settings.quickPhrases.titlePlaceholder')}
            className="mb-2 h-8 w-full rounded-md border border-border bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <textarea
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            placeholder={t('settings.quickPhrases.contentPlaceholder')}
            rows={3}
            className="mb-2 w-full resize-none rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelAdd}
              className="flex h-7 items-center gap-1 rounded-md border border-border px-3 text-xs text-muted-foreground hover:bg-muted"
            >
              <X className="h-3 w-3" />
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSaveNew}
              disabled={!formTitle.trim() || !formContent.trim()}
              className="flex h-7 items-center gap-1 rounded-md bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Check className="h-3 w-3" />
              {t('common.save')}
            </button>
          </div>
        </div>
      )}

      {/* Phrase list */}
      {filteredPhrases.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {searchQuery ? t('settings.quickPhrases.noResults') : t('settings.quickPhrases.empty')}
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {filteredPhrases.map((phrase, index) => (
            <div key={phrase.id}>
              {editingId === phrase.id ? (
                /* Edit inline form */
                <div className="rounded-md border border-primary/30 bg-muted/50 p-3">
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder={t('settings.quickPhrases.titlePlaceholder')}
                    className="mb-2 h-8 w-full rounded-md border border-border bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder={t('settings.quickPhrases.contentPlaceholder')}
                    rows={3}
                    className="mb-2 w-full resize-none rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex h-7 items-center gap-1 rounded-md border border-border px-3 text-xs text-muted-foreground hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                      {t('common.cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={!formTitle.trim() || !formContent.trim()}
                      className="flex h-7 items-center gap-1 rounded-md bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      <Check className="h-3 w-3" />
                      {t('common.save')}
                    </button>
                  </div>
                </div>
              ) : (
                /* Display row */
                <div className="group flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/50">
                  {/* Reorder buttons */}
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === filteredPhrases.length - 1}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{phrase.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{phrase.content}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(phrase)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {deleteConfirmId === phrase.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(phrase.id)}
                          className="rounded bg-destructive px-2 py-0.5 text-[10px] text-destructive-foreground"
                        >
                          {t('settings.quickPhrases.confirmDelete')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(phrase.id)}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SettingSection>
  )
}
