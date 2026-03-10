import { describe, it, expect, beforeEach } from 'vitest'

import { ServerLogBuffer, type ServerLogEntry } from '@main/services/mcp/ServerLogBuffer'

describe('ServerLogBuffer', () => {
  let buffer: ServerLogBuffer

  const makeEntry = (message: string): ServerLogEntry => ({
    timestamp: Date.now(),
    level: 'info',
    message,
    source: 'test'
  })

  beforeEach(() => {
    buffer = new ServerLogBuffer(200)
  })

  it('addLog appends entries for a server key', () => {
    buffer.addLog('server-a', makeEntry('msg1'))
    buffer.addLog('server-a', makeEntry('msg2'))

    const logs = buffer.getServerLogs('server-a')
    expect(logs).toHaveLength(2)
    expect(logs[0].message).toBe('msg1')
    expect(logs[1].message).toBe('msg2')
  })

  it('ring buffer caps at maxEntries', () => {
    const small = new ServerLogBuffer(5)

    for (let i = 0; i < 10; i++) {
      small.addLog('key', makeEntry(`msg-${i}`))
    }

    const logs = small.getServerLogs('key')
    expect(logs).toHaveLength(5)
    // Should keep the last 5 entries
    expect(logs[0].message).toBe('msg-5')
    expect(logs[4].message).toBe('msg-9')
  })

  it('getServerLogs returns a copy', () => {
    buffer.addLog('key', makeEntry('original'))

    const logs1 = buffer.getServerLogs('key')
    logs1.push(makeEntry('injected'))

    const logs2 = buffer.getServerLogs('key')
    expect(logs2).toHaveLength(1) // not affected by external mutation
  })

  it('getServerLogs returns empty array for unknown key', () => {
    const logs = buffer.getServerLogs('nonexistent')
    expect(logs).toEqual([])
  })

  it('clearServerLogs removes logs for a specific server', () => {
    buffer.addLog('server-a', makeEntry('a'))
    buffer.addLog('server-b', makeEntry('b'))

    buffer.clearServerLogs('server-a')

    expect(buffer.getServerLogs('server-a')).toHaveLength(0)
    expect(buffer.getServerLogs('server-b')).toHaveLength(1)
  })

  it('clearAll removes all logs', () => {
    buffer.addLog('server-a', makeEntry('a'))
    buffer.addLog('server-b', makeEntry('b'))

    buffer.clearAll()

    expect(buffer.getServerLogs('server-a')).toHaveLength(0)
    expect(buffer.getServerLogs('server-b')).toHaveLength(0)
  })
})
