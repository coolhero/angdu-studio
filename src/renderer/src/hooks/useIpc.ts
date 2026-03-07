import { useState, useCallback } from 'react'

interface UseIpcResult<T> {
  data: T | null
  error: string | null
  loading: boolean
  invoke: (...args: unknown[]) => Promise<T>
}

export function useIpc<T>(
  method: (...args: unknown[]) => Promise<T>
): UseIpcResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const invoke = useCallback(
    async (...args: unknown[]): Promise<T> => {
      setLoading(true)
      setError(null)
      try {
        const result = await method(...args)
        setData(result)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [method]
  )

  return { data, error, loading, invoke }
}
