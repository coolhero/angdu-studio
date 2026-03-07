import type { StateCreator, StoreMutatorIdentifier } from 'zustand'

type BroadcastConfig = {
  channelName: string
  syncedKeys?: string[]
}

type Write<T, U> = Omit<T, keyof U> & U

type Broadcast = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  initializer: StateCreator<T, Mps, Mcs>,
  config: BroadcastConfig
) => StateCreator<T, Mps, Mcs>

type BroadcastImpl = <T>(
  initializer: StateCreator<T, [], []>,
  config: BroadcastConfig
) => StateCreator<T, [], []>

const broadcastImpl: BroadcastImpl = (initializer, config) => (set, get, store) => {
  const { channelName, syncedKeys } = config
  let channel: BroadcastChannel | null = null

  try {
    channel = new BroadcastChannel(channelName)
  } catch {
    // BroadcastChannel not available (e.g., test env)
  }

  const originalSet = set

  const newSet: typeof set = (...args) => {
    const prevState = get()
    originalSet(...args)
    const nextState = get()

    if (channel && prevState !== nextState) {
      const patch: Record<string, unknown> = {}
      for (const key of Object.keys(nextState as object)) {
        if (syncedKeys && !syncedKeys.includes(key)) continue
        if (typeof (nextState as Record<string, unknown>)[key] === 'function') continue
        if (
          (prevState as Record<string, unknown>)[key] !==
          (nextState as Record<string, unknown>)[key]
        ) {
          patch[key] = (nextState as Record<string, unknown>)[key]
        }
      }
      if (Object.keys(patch).length > 0) {
        channel.postMessage(patch)
      }
    }
  }

  if (channel) {
    channel.onmessage = (event) => {
      originalSet(event.data)
    }
  }

  return initializer(newSet, get, store)
}

export const broadcast = broadcastImpl as unknown as Broadcast
