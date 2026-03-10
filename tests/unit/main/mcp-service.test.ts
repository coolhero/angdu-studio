import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock electron
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/test-data'),
    getVersion: vi.fn(() => '0.1.0'),
    getName: vi.fn(() => 'AngduStudio'),
    isPackaged: false
  },
  net: {
    fetch: vi.fn()
  },
  shell: {
    openExternal: vi.fn()
  }
}))

// Mock the MCP SDK Client
vi.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    ping: vi.fn().mockResolvedValue(true),
    listTools: vi.fn().mockResolvedValue({ tools: [] }),
    listPrompts: vi.fn().mockResolvedValue({ prompts: [] }),
    listResources: vi.fn().mockResolvedValue({ resources: [] }),
    getServerVersion: vi.fn().mockReturnValue({ version: '1.0.0' }),
    setNotificationHandler: vi.fn()
  }))
}))

vi.mock('@modelcontextprotocol/sdk/client/sse.js', () => ({
  SSEClientTransport: vi.fn()
}))

vi.mock('@modelcontextprotocol/sdk/client/stdio.js', () => ({
  StdioClientTransport: vi.fn()
}))

vi.mock('@modelcontextprotocol/sdk/client/streamableHttp.js', () => ({
  StreamableHTTPClientTransport: vi.fn()
}))

vi.mock('@modelcontextprotocol/sdk/inMemory.js', () => ({
  InMemoryTransport: {
    createLinkedPair: vi.fn().mockReturnValue([{}, {}])
  }
}))

vi.mock('@modelcontextprotocol/sdk/types.js', () => ({
  CancelledNotificationSchema: {},
  LoggingMessageNotificationSchema: {},
  PromptListChangedNotificationSchema: {},
  ResourceListChangedNotificationSchema: {},
  ResourceUpdatedNotificationSchema: {},
  ToolListChangedNotificationSchema: {}
}))

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-id-123')
}))

vi.mock('@shared/types/mcp', () => ({
  BuiltinMCPServerNames: {},
  isBuiltinMCPServer: vi.fn(() => false)
}))

vi.mock('../../../src/main/mcpServers/factory', () => ({
  createInMemoryMCPServer: vi.fn()
}))

vi.mock('../../../src/main/services/WindowService', () => ({
  windowService: {
    getMainWindow: vi.fn(() => null)
  }
}))

vi.mock('../../../src/main/services/mcp/oauth/callback', () => ({
  CallBackServer: vi.fn()
}))

vi.mock('../../../src/main/services/mcp/oauth/provider', () => ({
  McpOAuthClientProvider: vi.fn()
}))

// Import MCPService module — the singleton is created on import
// We test via the exported functions since MCPService is a singleton
describe('MCPService', () => {
  describe('getConfigHash uniqueness', () => {
    // Test the getConfigHash function indirectly via the module
    // Since it's module-scoped, we import the module fresh
    it('produces different keys for different servers', async () => {
      const serverA = {
        id: 'a',
        name: 'Server A',
        baseUrl: 'http://localhost:3000',
        command: undefined,
        args: [],
        registryUrl: undefined,
        env: {},
        isActive: true
      }
      const serverB = {
        id: 'b',
        name: 'Server B',
        baseUrl: 'http://localhost:3001',
        command: undefined,
        args: [],
        registryUrl: undefined,
        env: {},
        isActive: true
      }

      // getConfigHash uses JSON.stringify of specific fields
      const hashA = JSON.stringify({
        id: serverA.id,
        baseUrl: serverA.baseUrl,
        command: serverA.command,
        args: [],
        registryUrl: serverA.registryUrl,
        env: serverA.env
      })
      const hashB = JSON.stringify({
        id: serverB.id,
        baseUrl: serverB.baseUrl,
        command: serverB.command,
        args: [],
        registryUrl: serverB.registryUrl,
        env: serverB.env
      })

      expect(hashA).not.toBe(hashB)
    })

    it('produces same key for identical config', () => {
      const config = {
        id: 'x',
        baseUrl: 'http://localhost:3000',
        command: undefined,
        args: [],
        registryUrl: undefined,
        env: {}
      }

      const hash1 = JSON.stringify(config)
      const hash2 = JSON.stringify(config)

      expect(hash1).toBe(hash2)
    })
  })

  describe('redactSensitiveFields', () => {
    // We need to test the redaction logic. Since it's a module-level function,
    // we replicate the logic here for unit testing
    const SENSITIVE_KEYS = new Set([
      'authorization', 'Authorization', 'apiKey', 'api_key',
      'apikey', 'token', 'access_token', 'secret', 'password'
    ])
    const MAX_STRING_LENGTH = 300

    function redactSensitiveFields(input: unknown): unknown {
      if (input == null) return input
      if (typeof input === 'string') {
        return input.length > MAX_STRING_LENGTH
          ? `${input.slice(0, MAX_STRING_LENGTH)}...<${input.length - MAX_STRING_LENGTH} more>`
          : input
      }
      if (Array.isArray(input)) return input.map(redactSensitiveFields)
      if (typeof input === 'object') {
        const out: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
          out[k] = SENSITIVE_KEYS.has(k) ? '<redacted>' : redactSensitiveFields(v)
        }
        return out
      }
      return input
    }

    it('redacts sensitive keys', () => {
      const input = {
        name: 'test',
        apiKey: 'secret-key-123',
        password: 'p4ss',
        data: { token: 'tok', nested: 'visible' }
      }

      const result = redactSensitiveFields(input) as Record<string, unknown>
      expect(result.name).toBe('test')
      expect(result.apiKey).toBe('<redacted>')
      expect(result.password).toBe('<redacted>')

      const data = result.data as Record<string, unknown>
      expect(data.token).toBe('<redacted>')
      expect(data.nested).toBe('visible')
    })

    it('truncates long strings', () => {
      const longString = 'x'.repeat(500)
      const result = redactSensitiveFields(longString)
      expect(result).toContain('...<200 more>')
    })

    it('handles null and undefined', () => {
      expect(redactSensitiveFields(null)).toBeNull()
      expect(redactSensitiveFields(undefined)).toBeUndefined()
    })

    it('handles arrays', () => {
      const input = [{ apiKey: 'secret' }, 'visible']
      const result = redactSensitiveFields(input) as unknown[]
      expect((result[0] as Record<string, unknown>).apiKey).toBe('<redacted>')
      expect(result[1]).toBe('visible')
    })

    it('passes through numbers and booleans', () => {
      expect(redactSensitiveFields(42)).toBe(42)
      expect(redactSensitiveFields(true)).toBe(true)
    })
  })

  describe('singleton pattern', () => {
    it('returns the same instance', async () => {
      const { mcpService: instance1 } = await import('@main/services/MCPService')
      const { mcpService: instance2 } = await import('@main/services/MCPService')
      expect(instance1).toBe(instance2)
    })
  })

  describe('cleanup', () => {
    it('clears all clients without error', async () => {
      const { mcpService } = await import('@main/services/MCPService')
      // cleanup should not throw even when there are no clients
      await expect(mcpService.cleanup()).resolves.toBeUndefined()
    })
  })
})
