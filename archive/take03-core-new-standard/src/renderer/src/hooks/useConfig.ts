import { useState, useEffect, useCallback } from 'react'
import type { ConfigKey, ConfigValues } from '@shared/types'

declare global {
  interface Window {
    api: {
      config: {
        get: <K extends ConfigKey>(key: K) => Promise<ConfigValues[K]>
        set: <K extends ConfigKey>(key: K, value: ConfigValues[K]) => Promise<void>
      }
      [key: string]: unknown
    }
  }
}

export function useConfig<K extends ConfigKey>(key: K, defaultValue: ConfigValues[K]) {
  const [value, setValue] = useState<ConfigValues[K]>(defaultValue)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.api.config.get(key).then((v) => {
      setValue(v ?? defaultValue)
      setLoading(false)
    })
  }, [key, defaultValue])

  const update = useCallback(
    async (newValue: ConfigValues[K]) => {
      setValue(newValue)
      await window.api.config.set(key, newValue)
    },
    [key]
  )

  return { value, update, loading }
}
