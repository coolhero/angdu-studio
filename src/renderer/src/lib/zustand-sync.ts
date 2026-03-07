import type { StateCreator, StoreMutatorIdentifier } from 'zustand'

type SyncMiddleware = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  initializer: StateCreator<T, Mps, Mcs>,
  channelName: string
) => StateCreator<T, Mps, Mcs>

const syncImpl: SyncMiddleware = (initializer, channelName) => (set, get, api) => {
  const channel = new BroadcastChannel(channelName)
  let isRemoteUpdate = false

  channel.onmessage = (event) => {
    isRemoteUpdate = true
    set(event.data)
    isRemoteUpdate = false
  }

  const syncedSet: typeof set = (...args) => {
    set(...args)
    if (!isRemoteUpdate) {
      channel.postMessage(typeof args[0] === 'function' ? get() : args[0])
    }
  }

  return initializer(syncedSet, get, api)
}

export const sync = syncImpl as SyncMiddleware
