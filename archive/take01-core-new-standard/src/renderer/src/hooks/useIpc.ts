import { useCallback, useState } from 'react'
import type { CherryStudioApi } from '@preload/index'

/** The typed API object exposed by the preload script via contextBridge */
declare global {
  interface Window {
    api: CherryStudioApi
  }
}

interface UseIpcState<T> {
  data: T | null
  error: Error | null
  loading: boolean
}

interface UseIpcReturn<T> extends UseIpcState<T> {
  execute: () => Promise<T>
}

/**
 * Typed React hook for calling IPC channels exposed through window.api.
 *
 * @param method - The method name on window.api to call
 * @param args - Arguments to pass to the method
 * @returns An object with { data, error, loading, execute }
 *
 * @example
 * ```tsx
 * const { data, loading, execute } = useIpc('getAppInfo')
 *
 * useEffect(() => { execute() }, [execute])
 *
 * if (loading) return <p>Loading...</p>
 * return <p>{data?.name} v{data?.version}</p>
 * ```
 */
export function useIpc<
  M extends keyof CherryStudioApi,
  R = Awaited<ReturnType<CherryStudioApi[M]>>
>(
  method: M,
  ...args: Parameters<CherryStudioApi[M]>
): UseIpcReturn<R> {
  const [state, setState] = useState<UseIpcState<R>>({
    data: null,
    error: null,
    loading: false
  })

  const execute = useCallback(async (): Promise<R> => {
    setState({ data: null, error: null, loading: true })
    try {
      const fn = window.api[method] as (...a: unknown[]) => Promise<R>
      const result = await fn(...args)
      setState({ data: result, error: null, loading: false })
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setState({ data: null, error, loading: false })
      throw error
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, ...args])

  return { ...state, execute }
}
