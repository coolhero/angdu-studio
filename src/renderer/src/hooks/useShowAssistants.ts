import { useSettingsStore } from '@renderer/stores/useSettingsStore'
import { useCallback } from 'react'

export function useShowAssistants(): [boolean, (show: boolean) => void] {
  const showAssistants = useSettingsStore((s) => s.showAssistants)
  const setSetting = useSettingsStore((s) => s.setSetting)
  const setShow = useCallback((show: boolean) => setSetting('showAssistants', show), [setSetting])
  return [showAssistants, setShow]
}
