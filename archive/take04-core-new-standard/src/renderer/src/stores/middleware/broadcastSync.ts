import type { StateCreator } from 'zustand'

export function broadcastSync<T>(
  f: StateCreator<T, [], []>,
  channelName: string
): StateCreator<T, [], []> {
  return (set, get, store) => {
    const channel = new BroadcastChannel(channelName)

    channel.onmessage = (event) => {
      if (event.data?.type === 'state-sync') {
        set(event.data.state)
      }
    }

    const originalSetState = store.setState.bind(store)
    store.setState = (...args: any[]) => {
      (originalSetState as any)(...args)
      try {
        channel.postMessage({ type: 'state-sync', state: store.getState() })
      } catch {
        // BroadcastChannel may be closed
      }
    }

    return f(set, get, store)
  }
}
