import { useHotkeys } from 'react-hotkeys-hook'

export function useShortcut(
  keys: string,
  handler: () => void,
  options?: { enabled?: boolean; scopes?: string[] }
) {
  useHotkeys(keys, handler, {
    enabled: options?.enabled ?? true,
    scopes: options?.scopes,
    preventDefault: true,
  })
}
