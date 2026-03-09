import { useSettingsStore } from '@renderer/stores/useSettingsStore'
import { useCallback } from 'react'

export function useShowTopics(): [boolean, (show: boolean) => void] {
  const showTopics = useSettingsStore((s) => s.showTopics)
  const setSetting = useSettingsStore((s) => s.setSetting)
  const setShow = useCallback((show: boolean) => setSetting('showTopics', show), [setSetting])
  return [showTopics, setShow]
}
