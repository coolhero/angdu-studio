import { useEffect, useState, useCallback } from 'react'
import { cn } from '../../lib/utils'

interface ShortcutCaptureProps {
  value: string
  onChange: (keys: string) => void
  onCancel: () => void
}

const MOD_KEYS = new Set(['Control', 'Alt', 'Shift', 'Meta'])

function formatKeyForDisplay(key: string): string {
  const isMac = navigator.platform.toUpperCase().includes('MAC')

  const map: Record<string, string> = {
    mod: isMac ? '\u2318' : 'Ctrl',
    ctrl: isMac ? '\u2303' : 'Ctrl',
    control: isMac ? '\u2303' : 'Ctrl',
    alt: isMac ? '\u2325' : 'Alt',
    shift: isMac ? '\u21E7' : 'Shift',
    meta: isMac ? '\u2318' : 'Win',
    backspace: '\u232B',
    delete: 'Del',
    enter: '\u21A9',
    escape: 'Esc',
    arrowup: '\u2191',
    arrowdown: '\u2193',
    arrowleft: '\u2190',
    arrowright: '\u2192',
    ' ': 'Space',
  }

  return map[key.toLowerCase()] ?? key.charAt(0).toUpperCase() + key.slice(1)
}

function formatKeyCombination(keys: string): string {
  return keys
    .split('+')
    .map((k) => formatKeyForDisplay(k.trim()))
    .join(' + ')
}

function normalizeKey(e: KeyboardEvent): string {
  const isMac = navigator.platform.toUpperCase().includes('MAC')
  const parts: string[] = []

  if (isMac ? e.metaKey : e.ctrlKey) parts.push('mod')
  if (isMac ? e.ctrlKey : e.metaKey) parts.push(isMac ? 'ctrl' : 'meta')
  if (e.altKey) parts.push('alt')
  if (e.shiftKey) parts.push('shift')

  if (!MOD_KEYS.has(e.key)) {
    parts.push(e.key.toLowerCase())
  }

  return parts.join('+')
}

function ShortcutCapture({ value, onChange, onCancel }: ShortcutCaptureProps) {
  const [currentKeys, setCurrentKeys] = useState<string>(value)
  const [capturing, setCapturing] = useState(true)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (e.key === 'Escape') {
        onCancel()
        return
      }

      // Ignore lone modifier presses
      if (MOD_KEYS.has(e.key)) {
        return
      }

      const normalized = normalizeKey(e)
      setCurrentKeys(normalized)
      setCapturing(false)
      onChange(normalized)
    },
    [onChange, onCancel]
  )

  useEffect(() => {
    if (!capturing) return
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [capturing, handleKeyDown])

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div
        className={cn(
          'flex min-h-[48px] min-w-[200px] items-center justify-center rounded-lg border-2 px-6 py-3 text-lg font-mono',
          capturing
            ? 'border-primary bg-primary/5 animate-pulse'
            : 'border-zinc-300 dark:border-zinc-600'
        )}
      >
        {capturing ? (
          <span className="text-sm text-muted-foreground">Press a key combination...</span>
        ) : (
          <span className="text-zinc-900 dark:text-zinc-100">
            {formatKeyCombination(currentKeys)}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Press Escape to cancel</p>
    </div>
  )
}

export { ShortcutCapture, formatKeyCombination }
export type { ShortcutCaptureProps }
