import { useState, useEffect, useCallback, useRef } from 'react'

export function useConfig<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue)
  const [loading, setLoading] = useState(true)
  const cacheRef = useRef<{ value: T; timestamp: number } | null>(null)
  const STALE_TIME = 5000

  useEffect(() => {
    const cached = cacheRef.current
    if (cached && Date.now() - cached.timestamp < STALE_TIME) {
      setValue(cached.value)
      setLoading(false)
      return
    }

    window.api?.config?.get(key).then((v: T) => {
      const resolved = v ?? defaultValue
      setValue(resolved)
      cacheRef.current = { value: resolved, timestamp: Date.now() }
      setLoading(false)
    })
  }, [key, defaultValue])

  const set = useCallback(
    async (newValue: T) => {
      setValue(newValue)
      cacheRef.current = { value: newValue, timestamp: Date.now() }
      await window.api?.config?.set(key, newValue)
    },
    [key]
  )

  return { value, set, loading }
}
