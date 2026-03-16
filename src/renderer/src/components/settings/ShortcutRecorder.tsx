import { useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useShortcutRecorder } from '@renderer/hooks/useShortcutRecorder'
import { useShortcutsStore } from '@renderer/stores/useShortcutsStore'
import type { Shortcut } from '@shared/types/settings'
import { cn } from '@renderer/lib/utils'

interface ShortcutRecorderProps {
  shortcut: Shortcut
  onUpdate: (combo: string[]) => void
}

export function ShortcutRecorder({ shortcut, onUpdate }: ShortcutRecorderProps) {
  const { t } = useTranslation()
  const { isRecording, currentCombo, startRecording, stopRecording } = useShortcutRecorder()
  const checkConflict = useShortcutsStore((s) => s.checkConflict)

  // When a combo is recorded, check conflict and apply
  useEffect(() => {
    if (currentCombo && currentCombo.length > 0) {
      const conflict = checkConflict(currentCombo)
      if (conflict && conflict.key !== shortcut.key) {
        // Conflict exists — don't apply, user sees the warning via re-render
        return
      }
      onUpdate(currentCombo)
    }
  }, [currentCombo, checkConflict, shortcut.key, onUpdate])

  const handleClick = useCallback(() => {
    if (!shortcut.editable) return
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [shortcut.editable, isRecording, stopRecording, startRecording])

  const displayCombo = currentCombo ?? shortcut.shortcut
  const comboText = displayCombo
    .map((k) => (k === 'CommandOrControl' ? (navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl') : k))
    .join(' + ')

  // Check conflict for display
  const conflict = currentCombo ? checkConflict(currentCombo) : null
  const hasConflict = conflict !== null && conflict.key !== shortcut.key

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={!shortcut.editable}
        className={cn(
          'rounded-md border px-3 py-1 text-xs font-mono transition-all',
          isRecording
            ? 'animate-pulse border-primary bg-primary/10 text-primary'
            : 'border-border bg-muted text-foreground hover:border-primary/50',
          !shortcut.editable && 'cursor-not-allowed opacity-50'
        )}
      >
        {isRecording ? t('settings.shortcuts.pressKeys') : comboText}
      </button>
      {hasConflict && (
        <span className="text-[10px] text-destructive">
          {t('settings.shortcuts.conflict', { action: conflict!.key })}
        </span>
      )}
    </div>
  )
}
