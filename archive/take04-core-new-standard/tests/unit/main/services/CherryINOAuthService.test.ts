import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockOpenExternal, mockWebContentsSend, mockGetFocusedWindow } = vi.hoisted(() => ({
  mockOpenExternal: vi.fn().mockResolvedValue(undefined),
  mockWebContentsSend: vi.fn(),
  mockGetFocusedWindow: vi.fn()
}))

vi.mock('electron', () => ({
  shell: { openExternal: mockOpenExternal },
  BrowserWindow: { getFocusedWindow: mockGetFocusedWindow },
  net: {
    fetch: vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        access_token: 'test-access',
        refresh_token: 'test-refresh'
      }),
      text: vi.fn().mockResolvedValue('')
    })
  }
}))

vi.mock('../../../../src/main/logger', () => ({
  withContext: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}))

import { cherryInOAuthService, CHERRYIN_CONFIG } from '../../../../src/main/services/CherryINOAuthService'

const ALLOWED_HOST = 'https://open.cherryin.ai'

describe('CherryINOAuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear internal PKCE state between tests by calling logout on an allowed host
    // We reset by using a fresh import approach — but since the service is a singleton,
    // we need to ensure stale state doesn't leak. The simplest way is to let each
    // test manage its own flow.
  })

  // ── CHERRYIN_CONFIG ──

  it('CHERRYIN_CONFIG — has correct CLIENT_ID and ALLOWED_HOSTS', () => {
    expect(CHERRYIN_CONFIG.CLIENT_ID).toBe('2a348c87-bae1-4756-a62f-b2e97200fd6d')
    expect(CHERRYIN_CONFIG.ALLOWED_HOSTS).toContain('https://open.cherryin.ai')
    expect(CHERRYIN_CONFIG.ALLOWED_HOSTS).toContain('https://open.cherryin.dev')
  })

  // ── startOAuth ──

  it('startOAuth — throws on disallowed host', async () => {
    await expect(cherryInOAuthService.startOAuth('https://evil.example.com')).rejects.toThrow(
      'Host not allowed: https://evil.example.com'
    )

    expect(mockOpenExternal).not.toHaveBeenCalled()
  })

  it('startOAuth — opens external URL and returns ok', async () => {
    const result = await cherryInOAuthService.startOAuth(ALLOWED_HOST)

    expect(result).toEqual({ ok: true })
    expect(mockOpenExternal).toHaveBeenCalledTimes(1)

    const url = mockOpenExternal.mock.calls[0][0] as string
    expect(url).toContain(`${ALLOWED_HOST}/api/oauth/authorize`)
    expect(url).toContain(`client_id=${CHERRYIN_CONFIG.CLIENT_ID}`)
    expect(url).toContain('code_challenge_method=S256')
    expect(url).toContain('state=')
  })

  // ── exchangeToken ──

  it('exchangeToken — throws on state mismatch', async () => {
    // Start a flow so that internal state is set
    await cherryInOAuthService.startOAuth(ALLOWED_HOST)

    await expect(cherryInOAuthService.exchangeToken('some-code', 'wrong-state')).rejects.toThrow(
      'OAuth state mismatch'
    )
  })

  it('exchangeToken — throws if startOAuth not called', async () => {
    // Without calling startOAuth, codeVerifier and state are null
    await expect(cherryInOAuthService.exchangeToken('code', 'state')).rejects.toThrow('OAuth state mismatch')
  })

  // ── logout ──

  it('logout — calls revoke endpoint and returns ok', async () => {
    const result = await cherryInOAuthService.logout(ALLOWED_HOST, 'my-access-token')

    expect(result).toEqual({ ok: true })

    const { net } = await import('electron')
    expect(net.fetch).toHaveBeenCalledWith(
      `${ALLOWED_HOST}/api/oauth/revoke`,
      expect.objectContaining({
        method: 'POST'
      })
    )
  })

  // ── sendOAuthCallback ──

  it('sendOAuthCallback — sends to focused window', () => {
    mockGetFocusedWindow.mockReturnValue({
      webContents: { send: mockWebContentsSend }
    })

    cherryInOAuthService.sendOAuthCallback('auth-code', 'auth-state')

    expect(mockWebContentsSend).toHaveBeenCalledWith('cherryIn:oauthCallback', {
      code: 'auth-code',
      state: 'auth-state'
    })
  })

  it('sendOAuthCallback — handles no focused window gracefully', () => {
    mockGetFocusedWindow.mockReturnValue(null)

    // Should not throw
    expect(() => {
      cherryInOAuthService.sendOAuthCallback('auth-code', 'auth-state')
    }).not.toThrow()

    expect(mockWebContentsSend).not.toHaveBeenCalled()
  })
})
