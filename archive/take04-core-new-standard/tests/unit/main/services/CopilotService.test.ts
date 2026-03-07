import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
const mockEncryptString = vi.fn()
const mockDecryptString = vi.fn()
const mockExistsSync = vi.fn()
const mockMkdirSync = vi.fn()
const mockWriteFileSync = vi.fn()
const mockReadFileSync = vi.fn()
const mockUnlinkSync = vi.fn()

vi.mock('electron', () => ({
  safeStorage: {
    encryptString: mockEncryptString,
    decryptString: mockDecryptString
  },
  net: {
    fetch: mockFetch
  }
}))

vi.mock('fs', () => ({
  existsSync: mockExistsSync,
  mkdirSync: mockMkdirSync,
  writeFileSync: mockWriteFileSync,
  readFileSync: mockReadFileSync,
  unlinkSync: mockUnlinkSync
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

describe('CopilotService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAuthMessage', () => {
    it('should call GitHub device login and return device code', async () => {
      const deviceCodeResponse = {
        device_code: 'dc-123',
        user_code: 'ABCD-1234',
        verification_uri: 'https://github.com/login/device',
        expires_in: 900,
        interval: 5
      }
      mockFetch.mockResolvedValue(mockJsonResponse(deviceCodeResponse))

      const { copilotService } = await import('../../../../src/main/services/CopilotService')
      const result = await copilotService.getAuthMessage()

      expect(mockFetch).toHaveBeenCalledWith(
        'https://github.com/login/device/code',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }),
          body: expect.stringContaining('Iv1.b507a08c87ecfe98')
        })
      )
      expect(result).toEqual(deviceCodeResponse)
    })
  })

  describe('getToken', () => {
    it('should return access_token from GitHub OAuth', async () => {
      const tokenResponse = {
        access_token: 'gho_test_token_abc123'
      }
      mockFetch.mockResolvedValue(mockJsonResponse(tokenResponse))

      const { copilotService } = await import('../../../../src/main/services/CopilotService')
      const result = await copilotService.getToken('dc-123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://github.com/login/oauth/access_token',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('dc-123')
        })
      )
      expect(result).toBe('gho_test_token_abc123')
    })

    it('should throw on OAuth error response', async () => {
      const errorResponse = {
        error: 'authorization_pending',
        error_description: 'The authorization request is still pending.'
      }
      mockFetch.mockResolvedValue(mockJsonResponse(errorResponse))

      const { copilotService } = await import('../../../../src/main/services/CopilotService')

      await expect(copilotService.getToken('dc-123')).rejects.toThrow(
        'OAuth error: authorization_pending - The authorization request is still pending.'
      )
    })
  })

  describe('saveToken', () => {
    it('should encrypt and write token file, creating dir if needed', async () => {
      mockExistsSync.mockReturnValue(false)
      const encryptedBuffer = Buffer.from('encrypted-data')
      mockEncryptString.mockReturnValue(encryptedBuffer)

      const { copilotService } = await import('../../../../src/main/services/CopilotService')
      copilotService.saveToken('gho_test_token')

      expect(mockExistsSync).toHaveBeenCalled()
      expect(mockMkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('copilot'),
        { recursive: true }
      )
      expect(mockEncryptString).toHaveBeenCalledWith('gho_test_token')
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.copilot_token'),
        encryptedBuffer
      )
    })
  })

  describe('loadToken', () => {
    it('should read and decrypt token file', async () => {
      mockExistsSync.mockReturnValue(true)
      const encryptedBuffer = Buffer.from('encrypted-data')
      mockReadFileSync.mockReturnValue(encryptedBuffer)
      mockDecryptString.mockReturnValue('gho_decrypted_token')

      const { copilotService } = await import('../../../../src/main/services/CopilotService')
      const result = copilotService.loadToken()

      expect(mockReadFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.copilot_token')
      )
      expect(mockDecryptString).toHaveBeenCalledWith(encryptedBuffer)
      expect(result).toBe('gho_decrypted_token')
    })

    it('should return null when file does not exist', async () => {
      mockExistsSync.mockReturnValue(false)

      const { copilotService } = await import('../../../../src/main/services/CopilotService')
      const result = copilotService.loadToken()

      expect(result).toBeNull()
      expect(mockReadFileSync).not.toHaveBeenCalled()
    })
  })

  describe('getUser', () => {
    it('should return GitHub user info', async () => {
      const userResponse = {
        login: 'testuser',
        avatar_url: 'https://avatars.githubusercontent.com/u/12345',
        name: 'Test User'
      }
      mockFetch.mockResolvedValue(mockJsonResponse(userResponse))

      const { copilotService } = await import('../../../../src/main/services/CopilotService')
      const result = await copilotService.getUser('gho_test_token')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/user',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer gho_test_token'
          })
        })
      )
      expect(result).toEqual({
        login: 'testuser',
        avatar_url: 'https://avatars.githubusercontent.com/u/12345',
        name: 'Test User'
      })
    })
  })

  describe('logout', () => {
    it('should remove token file', async () => {
      mockExistsSync.mockReturnValue(true)

      const { copilotService } = await import('../../../../src/main/services/CopilotService')
      copilotService.logout()

      expect(mockUnlinkSync).toHaveBeenCalledWith(
        expect.stringContaining('.copilot_token')
      )
    })

    it('should handle missing file gracefully', async () => {
      mockExistsSync.mockReturnValue(false)

      const { copilotService } = await import('../../../../src/main/services/CopilotService')
      copilotService.logout()

      expect(mockUnlinkSync).not.toHaveBeenCalled()
    })
  })
})
