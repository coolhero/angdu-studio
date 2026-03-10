// ── F006: Per-server ring buffer for MCP logs ──

export interface ServerLogEntry {
  timestamp: number
  level: 'debug' | 'info' | 'warn' | 'error' | 'stderr' | 'stdout'
  message: string
  data?: unknown
  source?: string
}

/**
 * Lightweight ring buffer for per-server MCP logs.
 * Stores up to `maxEntries` log entries per server key.
 */
export class ServerLogBuffer {
  private maxEntries: number
  private logs: Map<string, ServerLogEntry[]> = new Map()

  constructor(maxEntries = 200) {
    this.maxEntries = maxEntries
  }

  /**
   * Append a log entry for a given server key.
   * Trims oldest entries when the buffer exceeds maxEntries.
   */
  addLog(serverKey: string, entry: ServerLogEntry): void {
    const list = this.logs.get(serverKey) ?? []
    list.push(entry)
    if (list.length > this.maxEntries) {
      list.splice(0, list.length - this.maxEntries)
    }
    this.logs.set(serverKey, list)
  }

  /**
   * Return a shallow copy of all log entries for a server.
   */
  getServerLogs(serverKey: string): ServerLogEntry[] {
    return [...(this.logs.get(serverKey) ?? [])]
  }

  /**
   * Clear all log entries for a specific server.
   */
  clearServerLogs(serverKey: string): void {
    this.logs.delete(serverKey)
  }

  /**
   * Clear all log entries for all servers.
   */
  clearAll(): void {
    this.logs.clear()
  }
}
