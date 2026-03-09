import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { ShortcutCapture, formatKeyCombination } from '@renderer/components/settings/ShortcutCapture'
import { Button } from '@renderer/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { useShortcutsStore, type Shortcut } from '@renderer/stores/useShortcutsStore'

export default function ShortcutSettings(): JSX.Element {
  const { t } = useTranslation()

  const shortcuts = useShortcutsStore((s) => s.shortcuts)
  const updateShortcut = useShortcutsStore((s) => s.updateShortcut)
  const hasConflict = useShortcutsStore((s) => s.hasConflict)
  const resetAllShortcuts = useShortcutsStore((s) => s.resetAllShortcuts)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [capturedKeys, setCapturedKeys] = useState<string>('')
  const [conflictShortcut, setConflictShortcut] = useState<Shortcut | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleEdit = useCallback((id: string) => {
    setEditingId(id)
    setCapturedKeys('')
    setConflictShortcut(null)
  }, [])

  const handleCapture = useCallback(
    (keys: string) => {
      if (!editingId) return
      setCapturedKeys(keys)

      const conflict = hasConflict(editingId, keys)
      if (conflict) {
        setConflictShortcut(conflict)
      } else {
        updateShortcut(editingId, keys)
        setEditingId(null)
      }
    },
    [editingId, hasConflict, updateShortcut]
  )

  const handleConflictConfirm = useCallback(() => {
    if (!editingId || !capturedKeys) return
    updateShortcut(editingId, capturedKeys)
    setConflictShortcut(null)
    setEditingId(null)
  }, [editingId, capturedKeys, updateShortcut])

  const handleConflictCancel = useCallback(() => {
    setConflictShortcut(null)
    setCapturedKeys('')
  }, [])

  const handleCaptureCancel = useCallback(() => {
    setEditingId(null)
    setCapturedKeys('')
  }, [])

  const handleResetAll = useCallback(() => {
    resetAllShortcuts()
    setShowResetConfirm(false)
  }, [resetAllShortcuts])

  return (
    <div className="p-6">
      <h2 className="mb-4 text-lg font-semibold">
        {t('settings.shortcuts.title', 'Keyboard Shortcuts')}
      </h2>

      {/* Shortcuts table */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700">
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-zinc-200 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          <span>{t('settings.shortcuts.action', 'Action')}</span>
          <span className="w-48 text-center">{t('settings.shortcuts.binding', 'Binding')}</span>
          <span className="w-16" />
        </div>

        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.id}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-zinc-100 px-4 py-3 last:border-b-0 dark:border-zinc-800"
          >
            <span className="text-sm text-zinc-900 dark:text-zinc-100">
              {t(shortcut.name, shortcut.action)}
            </span>
            <span className="flex w-48 justify-center">
              <kbd className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-xs text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {formatKeyCombination(shortcut.keys)}
              </kbd>
            </span>
            <span className="flex w-16 justify-end">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(shortcut.id)}>
                {t('common.edit', 'Edit')}
              </Button>
            </span>
          </div>
        ))}
      </div>

      {/* Reset All button */}
      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={() => setShowResetConfirm(true)}>
          {t('settings.shortcuts.resetAll', 'Reset All')}
        </Button>
      </div>

      {/* Shortcut capture dialog */}
      <Dialog open={editingId !== null && conflictShortcut === null} onOpenChange={(open) => { if (!open) handleCaptureCancel() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('settings.shortcuts.editTitle', 'Edit Shortcut')}</DialogTitle>
            <DialogDescription>
              {t('settings.shortcuts.editDescription', 'Press a new key combination to assign.')}
            </DialogDescription>
          </DialogHeader>
          {editingId && (
            <ShortcutCapture
              value={shortcuts.find((s) => s.id === editingId)?.keys ?? ''}
              onChange={handleCapture}
              onCancel={handleCaptureCancel}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCaptureCancel}>
              {t('common.cancel', 'Cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conflict warning dialog */}
      <AlertDialog open={conflictShortcut !== null} onOpenChange={(open) => { if (!open) handleConflictCancel() }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('settings.shortcuts.conflictTitle', 'Shortcut Conflict')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'settings.shortcuts.conflictDescription',
                'The key combination "{{keys}}" is already assigned to "{{action}}". Do you want to override it?',
                {
                  keys: capturedKeys ? formatKeyCombination(capturedKeys) : '',
                  action: conflictShortcut ? t(conflictShortcut.name, conflictShortcut.action) : '',
                }
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleConflictCancel}>
              {t('common.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConflictConfirm}>
              {t('common.override', 'Override')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset all confirmation */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('settings.shortcuts.resetConfirmTitle', 'Reset All Shortcuts')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'settings.shortcuts.resetConfirmDescription',
                'This will reset all keyboard shortcuts to their default values. Are you sure?'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetAll}>
              {t('settings.shortcuts.resetAll', 'Reset All')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
