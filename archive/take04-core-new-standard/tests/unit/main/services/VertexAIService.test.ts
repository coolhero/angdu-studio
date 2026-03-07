import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetAccessToken = vi.fn()
const mockGetRequestHeaders = vi.fn()
const mockGetClient = vi.fn()

vi.mock('google-auth-library', () => ({
  GoogleAuth: vi.fn().mockImplementation(() => ({
    getClient: mockGetClient.mockResolvedValue({
      getAccessToken: mockGetAccessToken
    }),
    getRequestHeaders: mockGetRequestHeaders
  }))
}))

vi.mock('../../../../src/main/logger', () => ({
  withContext: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}))

import { vertexAIService } from '../../../../src/main/services/VertexAIService'
import { GoogleAuth } from 'google-auth-library'

const baseParams = {
  privateKey: '-----BEGIN PRIVATE KEY-----\nMIItest\n-----END PRIVATE KEY-----\n',
  clientEmail: 'test@project.iam.gserviceaccount.com',
  projectId: 'test-project',
  location: 'us-central1'
}

describe('VertexAIService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vertexAIService.clearCache()
  })

  // ── getAccessToken ──

  it('getAccessToken — returns token from GoogleAuth client', async () => {
    mockGetAccessToken.mockResolvedValue({ token: 'test-token-123' })

    const result = await vertexAIService.getAccessToken(baseParams)

    expect(result.access_token).toBe('test-token-123')
    expect(result.expires_at).toBeGreaterThan(0)
  })

  it('getAccessToken — caches auth clients by projectId-clientEmail key', async () => {
    mockGetAccessToken.mockResolvedValue({ token: 'tok' })

    await vertexAIService.getAccessToken(baseParams)
    await vertexAIService.getAccessToken(baseParams)

    // GoogleAuth constructor should only be called once for the same key
    expect(GoogleAuth).toHaveBeenCalledTimes(1)
  })

  it('getAccessToken — evicts cache on error and re-throws', async () => {
    mockGetAccessToken.mockResolvedValue({ token: 'tok' })
    await vertexAIService.getAccessToken(baseParams)
    expect(GoogleAuth).toHaveBeenCalledTimes(1)

    // Make next call fail — the cached client is reused so GoogleAuth isn't called again
    mockGetClient.mockRejectedValueOnce(new Error('auth boom'))

    await expect(vertexAIService.getAccessToken(baseParams)).rejects.toThrow('VertexAI authentication failed')

    // Cache was evicted by the error, so a NEW client must be created on retry
    mockGetClient.mockResolvedValue({ getAccessToken: mockGetAccessToken })
    mockGetAccessToken.mockResolvedValue({ token: 'tok2' })

    await vertexAIService.getAccessToken(baseParams)
    // 1 initial + 0 (error reused cached client) + 1 (retry after eviction) = 2
    expect(GoogleAuth).toHaveBeenCalledTimes(2)
  })

  // ── getAuthHeaders ──

  it('getAuthHeaders — returns authorization headers', async () => {
    const expectedHeaders = { Authorization: 'Bearer header-token' }
    mockGetRequestHeaders.mockResolvedValue(expectedHeaders)

    const headers = await vertexAIService.getAuthHeaders(baseParams)

    expect(headers).toEqual(expectedHeaders)
  })

  // ── clearCache ──

  it('clearCache — clears specific cache entry when both args provided', async () => {
    mockGetAccessToken.mockResolvedValue({ token: 'tok' })
    await vertexAIService.getAccessToken(baseParams)
    expect(GoogleAuth).toHaveBeenCalledTimes(1)

    vertexAIService.clearCache(baseParams.projectId, baseParams.clientEmail)

    // Next call should create a new client since cache was cleared
    await vertexAIService.getAccessToken(baseParams)
    expect(GoogleAuth).toHaveBeenCalledTimes(2)
  })

  it('clearCache — clears all cache when no args', async () => {
    mockGetAccessToken.mockResolvedValue({ token: 'tok' })

    const params2 = { ...baseParams, projectId: 'other-project' }
    await vertexAIService.getAccessToken(baseParams)
    await vertexAIService.getAccessToken(params2)
    expect(GoogleAuth).toHaveBeenCalledTimes(2)

    vertexAIService.clearCache()

    await vertexAIService.getAccessToken(baseParams)
    await vertexAIService.getAccessToken(params2)
    expect(GoogleAuth).toHaveBeenCalledTimes(4)
  })

  // ── formatPrivateKey (tested indirectly via getOrCreateClient) ──

  it('formatPrivateKey — adds PEM headers when missing', async () => {
    mockGetAccessToken.mockResolvedValue({ token: 'tok' })

    const paramsNoPEM = { ...baseParams, privateKey: 'MIIrawkeydata' }
    await vertexAIService.getAccessToken(paramsNoPEM)

    const ctorCall = vi.mocked(GoogleAuth).mock.calls[0][0] as {
      credentials: { private_key: string }
    }
    expect(ctorCall.credentials.private_key).toContain('-----BEGIN PRIVATE KEY-----')
    expect(ctorCall.credentials.private_key).toContain('-----END PRIVATE KEY-----')
    expect(ctorCall.credentials.private_key).toContain('MIIrawkeydata')
  })

  it('formatPrivateKey — replaces literal \\n with newlines', async () => {
    mockGetAccessToken.mockResolvedValue({ token: 'tok' })

    const paramsLiteralNewlines = {
      ...baseParams,
      privateKey: '-----BEGIN PRIVATE KEY-----\\nMIIdata\\n-----END PRIVATE KEY-----\\n'
    }
    await vertexAIService.getAccessToken(paramsLiteralNewlines)

    const ctorCall = vi.mocked(GoogleAuth).mock.calls[0][0] as {
      credentials: { private_key: string }
    }
    expect(ctorCall.credentials.private_key).not.toContain('\\n')
    expect(ctorCall.credentials.private_key).toContain('\n')
  })
})
