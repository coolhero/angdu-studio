import { useState, useCallback, useEffect, useRef } from 'react'

const isMac = navigator.platform.toUpperCase().includes('MAC')

function getModifierLabel(key: string): string | null {
  switch (key) {
    case 'Meta':
      return isMac ? 'Cmd' : 'Ctrl'
    case 'Control':
      return 'Ctrl'
    case 'Alt':
      return 'Alt'
    case 'Shift':
      return 'Shift'
    default:
      return null
  }
}

function getKeyLabel(key: string): string {
  if (key.length === 1) return key.toUpperCase()
  switch (key) {
    case 'ArrowUp':
      return 'Up'
    case 'ArrowDown':
      return 'Down'
    case 'ArrowLeft':
      return 'Left'
    case 'ArrowRight':
      return 'Right'
    case 'Backspace':
      return 'Backspace'
    case 'Delete':
      return 'Delete'
    case 'Enter':
      return 'Enter'
    case 'Tab':
      return 'Tab'
    case ' ':
      return 'Space'
    default:
      return key
  }
}

function buildCombo(e: KeyboardEvent): string[] {
  const combo: string[] = []

  if (e.metaKey) combo.push(isMac ? 'Cmd' : 'Ctrl')
  if (e.ctrlKey && !e.metaKey) combo.push('Ctrl')
  if (e.altKey) combo.push('Alt')
  if (e.shiftKey) combo.push('Shift')

  const mod = getModifierLabel(e.key)
  if (!mod) {
    combo.push(getKeyLabel(e.key))
  }

  return combo
}

export function useShortcutRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [currentCombo, setCurrentCombo] = useState<string[] | null>(null)
  const listenerRef = useRef<((e: KeyboardEvent) => void) | null>(null)

  const stopRecording = useCallback(() => {
    setIsRecording(false)
    if (listenerRef.current) {
      window.removeEventListener('keydown', listenerRef.current, true)
      listenerRef.current = null
    }
  }, [])

  const startRecording = useCallback(() => {
    setIsRecording(true)
    setCurrentCombo(null)

    const handler = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (e.key === 'Escape') {
        stopRecording()
        return
      }

      // Ignore standalone modifier key presses
      if (['Meta', 'Control', 'Alt', 'Shift'].includes(e.key)) {
        return
      }

      const combo = buildCombo(e)
      if (combo.length > 0) {
        setCurrentCombo(combo)
        stopRecording()
      }
    }

    listenerRef.current = handler
    window.addEventListener('keydown', handler, true)
  }, [stopRecording])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        window.removeEventListener('keydown', listenerRef.current, true)
      }
    }
  }, [])

  return { isRecording, currentCombo, startRecording, stopRecording }
}
