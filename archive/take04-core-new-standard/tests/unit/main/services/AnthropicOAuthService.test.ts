import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHash } from 'crypto'

const mockOpenExternal = vi.fn().mockResolvedValue(undefined)
const mockFetch = vi.fn()
const mockExistsSync = vi.fn()
const mockMkdirSync = vi.fn()
const mockWriteFileSync = vi.fn()
const mockReadFileSync = vi.fn()
const mockUnlinkSync = vi.fn()
const mockChmodSync = vi.fn()

vi.mock('electron', () => ({
  shell: { openExternal: mockOpenExternal },
  net: { fetch: mockFetch }
}))

vi.mock('fs', () => ({
  existsSync: mockExistsSync,
  mkdirSync: mockMkdirSync,
  writeFileSync: mockWriteFileSync,
  readFileSync: mockReadFileSync,
  unlinkSync: mockUnlinkSync,
  chmodSync: mockChmodSync
}))

vi.mock('../../../../src/main/logger', () => ({
  withContext: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}))

vi.mock('../../../../src/main/bootstrap', () => ({
  dataDir: '/tmp/test-data'
}))

function mockJsonResponse(data: unknown, ok = true) {
  return {
    ok,
    status: ok ? 200 : 400,
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
    json: vi.fn().mockResolvedValue(data)
  }
}

describe('AnthropicOAuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockExistsSync.mockReturnValue(false)
  })

  describe('start', () => {
    it('should open authorization URL in browser', async () => {
      const { anthropicOAuthService } = await import(
        '../../../../src/main/services/AnthropicOAuthService'
      )
      const result = await anthropicOAuthService.start()

      expect(mockOpenExternal).toHaveBeenCalledWith(
        expect.stringContaining('https://console.anthropic.com/oauth/authorize')
      )
      expect(result.authorization_url).toContain('response_type=code')
      expect(result.authorization_url).toContain('client_id=9d1c250a-e61b-44d9-88ed-5944d1962f5e')
      expect(result.authorization_url).toContain('code_challenge_method=S256')
    })

    it('should generate valid PKCE code challenge (S256)', async () => {
      const { anthropicOAuthService } = await import(
        '../../../../src/main/services/AnthropicOAuthService'
      )
      const result = await anthropicOAuthService.start()

      const url = new URL(result.authorization_url)
      const codeChallenge = url.searchParams.get('code_challenge')

      expect(codeChallenge).toBeTruthy()
      expect(codeChallenge).not.toContain('+')
      expect(codeChallenge).not.toContain('/')
      expect(codeChallenge).not.toContain('=')
    })
  })

  describe('complete', () => {
    it('should exchange code for token and save credentials', async () => {
      const tokenResponse = {
        access_token: 'ant_test_token_abc123',
        refresh_token: 'ant_refresh_xyz',
        expires_in: 3600
      }
      mockFetch.mockResolvedValue(mockJsonResponse(tokenResponse))
      mockExistsSync.mockReturnValue(false)

      const { anthropicOAuthService } = await import(
        '../../../../src/main/services/AnthropicOAuthService'
      )
      await anthropicOAuthService.start()
      const result = await anthropicOAuthService.complete('auth-code-123')

      expect(result).toEqual({ ok: true })
      expect(mockFetch).toHaveBeenCalledWith(
        'https://console.anthropic.com/v1/oauth/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded'
          })
        })
      )
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('anthropic.json'),
        expect.stringContaining('ant_test_token_abc123')
      )
      expect(mockChmodSync).toHaveBeenCalledWith(
        expect.stringContaining('anthropic.json'),
        0o600
      )
    })

    it('should handle code#state legacy format', async () => {
      const { anthropicOAuthService } = await import(
        '../../../../src/main/services/AnthropicOAuthService'
      )
      const startResult = await anthropicOAuthService.start()

      const url = new URL(startResult.authorization_url)
      const state = url.searchParams.get('state')!

      const tokenResponse = {
        access_token: 'ant_token_legacy',
        refresh_token: 'ant_refresh_legacy'
      }
      mockFetch.mockResolvedValue(mockJsonResponse(tokenResponse))
      mockExistsSync.mockReturnValue(false)

      const result = await anthropicOAuthService.complete(`auth-code-legacy#${state}`)

      expect(result).toEqual({ ok: true })
      expect(mockFetch).toHaveBeenCalledWith(
        'https://console.anthropic.com/v1/oauth/token',
        expect.objectContaining({
          body: expect.stringContaining('auth-code-legacy')
        })
      )
    })

    it('should throw on state mismatch', async () => {
      const { anthropicOAuthService } = await import(
        '../../../../src/main/services/AnthropicOAuthService'
      )
      await anthropicOAuthService.start()

      await expect(
        anthropicOAuthService.complete('auth-code#wrong-state-value')
      ).rejects.toThrow('OAuth state mismatch')
    })

    it('should throw if start not called', async () => {
      const { anthropicOAuthService } = await import(
        '../../../../src/main/services/AnthropicOAuthService'
      )
      await anthropicOAuthService.cancel()

      await expect(anthropicOAuthService.complete('auth-code')).rejects.toThrow(
        'OAuth flow not started'
      )
    })
  })

  describe('getToken', () => {
    it('should return saved token', async () => {
      const creds = {
        access_token: 'ant_saved_token',
        refresh_token: 'ant_refresh'
      }
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(JSON.stringify(creds))

      const { anthropicOAuthService } = await import(
        '../../../../src/main/services/AnthropicOAuthService'
      )
      const result = await anthropicOAuthService.getToken()

      expect(result).toEqual({ token: 'ant_saved_token' })
    })

    it('should return empty string when no credentials', async () => {
      mockExistsSync.mockReturnValue(false)

      const { anthropicOAuthService } = await import(
        '../../../../src/main/services/AnthropicOAuthService'
      )
      const result = await anthropicOAuthService.getToken()

      expect(result).toEqual({ token: '' })
    })
  })

  describe('clear', () => {
    it('should remove credentials file', async () => {
      mockExistsSync.mockReturnValue(true)

      const { anthropicOAuthService } = await import(
        '../../../../src/main/services/AnthropicOAuthService'
      )
      const result = await anthropicOAuthService.clear()

      expect(result).toEqual({ ok: true })
      expect(mockUnlinkSync).toHaveBeenCalledWith(
        expect.stringContaining('anthropic.json')
      )
    })
  })

  describe('cancel', () => {
    it('should clear PKCE state', async () => {
      const { anthropicOAuthService } = await import(
        '../../../../src/main/services/AnthropicOAuthService'
      )
      await anthropicOAuthService.start()
      const result = await anthropicOAuthService.cancel()

      expect(result).toEqual({ ok: true })

      // After cancel, complete should throw because codeVerifier is cleared
      await expect(anthropicOAuthService.complete('code')).rejects.toThrow(
        'OAuth flow not started'
      )
    })
  })

  describe('getStatus', () => {
    it('should return authenticated when credentials exist', async () => {
      const creds = {
        access_token: 'ant_valid_token',
        refresh_token: 'ant_refresh'
      }
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(JSON.stringify(creds))

      const { anthropicOAuthService } = await import(
        '../../../../src/main/services/AnthropicOAuthService'
      )
      const result = await anthropicOAuthService.getStatus()

      expect(result).toEqual({ authenticated: true })
    })

    it('should return not authenticated when no credentials', async () => {
      mockExistsSync.mockReturnValue(false)

      const { anthropicOAuthService } = await import(
        '../../../../src/main/services/AnthropicOAuthService'
      )
      const result = await anthropicOAuthService.getStatus()

      expect(result).toEqual({ authenticated: false })
    })
  })
})
