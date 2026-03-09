import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { nanoid } from 'nanoid'

import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Textarea } from '@renderer/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@renderer/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@renderer/components/ui/alert-dialog'
import { useSettingsStore } from '@renderer/stores/useSettingsStore'

interface PhraseFormState {
  label: string
  text: string
}

export default function QuickPhraseSettings(): JSX.Element {
  const { t } = useTranslation()

  const quickPhrases = useSettingsStore((s) => s.quickPhrases)
  const addQuickPhrase = useSettingsStore((s) => s.addQuickPhrase)
  const updateQuickPhrase = useSettingsStore((s) => s.updateQuickPhrase)
  const removeQuickPhrase = useSettingsStore((s) => s.removeQuickPhrase)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PhraseFormState>({ label: '', text: '' })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const phraseList = useMemo(() => quickPhrases, [quickPhrases])

  const handleAdd = useCallback(() => {
    setEditingId(null)
    setForm({ label: '', text: '' })
    setDialogOpen(true)
  }, [])

  const handleEdit = useCallback(
    (id: string) => {
      const phrase = quickPhrases.find((p) => p.id === id)
      if (!phrase) return
      setEditingId(id)
      setForm({ label: phrase.label, text: phrase.text })
      setDialogOpen(true)
    },
    [quickPhrases]
  )

  const handleSave = useCallback(() => {
    const trimmedLabel = form.label.trim()
    const trimmedText = form.text.trim()
    if (!trimmedLabel || !trimmedText) return

    if (editingId) {
      updateQuickPhrase(editingId, { label: trimmedLabel, text: trimmedText })
    } else {
      addQuickPhrase({ id: nanoid(), label: trimmedLabel, text: trimmedText })
    }

    setDialogOpen(false)
    setForm({ label: '', text: '' })
    setEditingId(null)
  }, [form, editingId, addQuickPhrase, updateQuickPhrase])

  const handleDeleteConfirm = useCallback(() => {
    if (deleteId) {
      removeQuickPhrase(deleteId)
      setDeleteId(null)
    }
  }, [deleteId, removeQuickPhrase])

  const handleDialogClose = useCallback((open: boolean) => {
    if (!open) {
      setDialogOpen(false)
      setForm({ label: '', text: '' })
      setEditingId(null)
    }
  }, [])

  const isFormValid = form.label.trim().length > 0 && form.text.trim().length > 0

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {t('settings.quickPhrases.title', 'Quick Phrases')}
        </h2>
        <Button size="sm" onClick={handleAdd}>
          {t('settings.quickPhrases.add', 'Add')}
        </Button>
      </div>

      {/* Phrase list */}
      {phraseList.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-zinc-600">
          <p className="text-sm text-muted-foreground">
            {t('settings.quickPhrases.empty', 'No quick phrases yet. Click "Add" to create one.')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {phraseList.map((phrase) => (
            <div
              key={phrase.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-700"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {phrase.label}
                </div>
                <div className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {phrase.text}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(phrase.id)}>
                  {t('common.edit', 'Edit')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  onClick={() => setDeleteId(phrase.id)}
                >
                  {t('common.delete', 'Delete')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId
                ? t('settings.quickPhrases.editTitle', 'Edit Quick Phrase')
                : t('settings.quickPhrases.addTitle', 'Add Quick Phrase')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {t('settings.quickPhrases.label', 'Label')}
              </label>
              <Input
                placeholder={t('settings.quickPhrases.labelPlaceholder', 'e.g., Greeting')}
                value={form.label}
                onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {t('settings.quickPhrases.text', 'Text')}
              </label>
              <Textarea
                placeholder={t(
                  'settings.quickPhrases.textPlaceholder',
                  'Enter the phrase content...'
                )}
                value={form.text}
                onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogClose(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSave} disabled={!isFormValid}>
              {t('common.save', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('settings.quickPhrases.deleteTitle', 'Delete Quick Phrase')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'settings.quickPhrases.deleteDescription',
                'Are you sure you want to delete this quick phrase? This action cannot be undone.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-zinc-50 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
              onClick={handleDeleteConfirm}
            >
              {t('common.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
