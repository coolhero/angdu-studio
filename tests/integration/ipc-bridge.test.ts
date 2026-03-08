import { describe, it, expect } from 'vitest'
import { IpcChannel } from '@shared/ipc-channels'

describe('IPC Channel Contract', () => {
  it('all IpcChannel enum values are unique', () => {
    const values = Object.values(IpcChannel)
    const uniqueValues = new Set(values)
    expect(uniqueValues.size).toBe(values.length)
  })

  it('all channel names follow the namespace:action pattern', () => {
    const values = Object.values(IpcChannel)
    for (const channel of values) {
      expect(channel).toMatch(/^[a-z-]+:[a-z-]+$/)
    }
  })

  it('has all expected channel groups', () => {
    const values = Object.values(IpcChannel)
    const prefixes = new Set(values.map((v) => v.split(':')[0]))

    const expectedPrefixes = [
      'app', 'window', 'config', 'theme', 'proxy',
      'notification', 'system', 'miniwindow', 'tray',
      'update', 'shortcut', 'protocol', 'store-sync',
      'zoom', 'crash'
    ]

    for (const prefix of expectedPrefixes) {
      expect(prefixes.has(prefix)).toBe(true)
    }
  })

  it('has the correct number of channels', () => {
    const values = Object.values(IpcChannel)
    // Filter out reverse mappings (TypeScript enums create both key->value and value->key)
    const channels = values.filter((v) => typeof v === 'string')
    expect(channels.length).toBeGreaterThanOrEqual(40)
  })
})
