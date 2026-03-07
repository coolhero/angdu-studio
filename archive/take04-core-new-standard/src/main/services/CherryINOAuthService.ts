import { shell, BrowserWindow } from 'electron'
import { randomBytes, createHash } from 'crypto'
import { net } from 'electron'
import { z } from 'zod'
import { withContext } from '../logger'
import { IpcChannel } from '@shared/IpcChannel'

const log = withContext('cherryIn')

// ── Configuration ──

export const CHERRYIN_CONFIG = {
  CLIENT_ID: '2a348c87-bae1-4756-a62f-b2e97200fd6d',
  REDIRECT_URI: 'cherrystudio://oauth/callback',
  SCOPES: 'openid profile',
  ALLOWED_HOSTS: ['https://open.cherryin.ai', 'https://open.cherryin.dev'] as readonly string[],
  FLOW_TIMEOUT_MS: 10 * 60 * 1000 // 10 minutes
} as const

// ── Zod Schemas ──

const TokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string().optional(),
  expires_in: z.number().optional()
})

// ── Service ──

class CherryINOAuthService {
  private codeVerifier: string | null = null
  private state: string | null = null
  private flowTimer: ReturnType<typeof setTimeout> | null = null
  private oauthServer: string | null = null

  // ── Public Methods ──

  async startOAuth(oauthServer: string, apiHost?: string): Promise<{ ok: true }> {
    this.validateHost(oauthServer)

    this.codeVerifier = this.generateCodeVerifier()
    const codeChallenge = this.generateCodeChallenge(this.codeVerifier)
    this.state = randomBytes(16).toString('hex')
    this.oauthServer = oauthServer

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CHERRYIN_CONFIG.CLIENT_ID,
      redirect_uri: CHERRYIN_CONFIG.REDIRECT_URI,
      scope: CHERRYIN_CONFIG.SCOPES,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: this.state
    })

    if (apiHost) {
      params.set('api_host', apiHost)
    }

    const authUrl = `${oauthServer}/api/oauth/authorize?${params.toString()}`
    log.info(`Opening OAuth authorization URL: ${oauthServer}/api/oauth/authorize`)

    await shell.openExternal(authUrl)

    // Set flow timeout to clear stale PKCE state
    this.flowTimer = setTimeout(() => {
      log.warn('OAuth flow timed out, clearing PKCE state')
      this.clearFlowState()
    }, CHERRYIN_CONFIG.FLOW_TIMEOUT_MS)

    return { ok: true }
  }

  async exchangeToken(
    code: string,
    state: string
  ): Promise<{ access_token: string; refresh_token: string }> {
    if (!this.state || state !== this.state) {
      log.error('OAuth state mismatch or missing')
      throw new Error('OAuth state mismatch')
    }

    if (!this.codeVerifier) {
      log.error('Missing code_verifier – was startOAuth called?')
      throw new Error('Missing code_verifier')
    }

    if (!this.oauthServer) {
      log.error('Missing oauthServer – was startOAuth called?')
      throw new Error('Missing oauthServer')
    }

    const tokenUrl = `${this.oauthServer}/api/oauth/token`

    try {
      const response = await net.fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: CHERRYIN_CONFIG.CLIENT_ID,
          code,
          redirect_uri: CHERRYIN_CONFIG.REDIRECT_URI,
          code_verifier: this.codeVerifier
        }).toString()
      })

      if (!response.ok) {
        const text = await response.text()
        log.error(`Token exchange failed: ${response.status} ${text}`)
        throw new Error(`Token exchange failed: ${response.status} ${text}`)
      }

      const data = await response.json()
      const parsed = TokenResponseSchema.parse(data)
      log.info('Token exchange successful')

      this.clearFlowState()

      return { access_token: parsed.access_token, refresh_token: parsed.refresh_token }
    } catch (error) {
      log.error(`Token exchange error: ${error}`)
      throw error
    }
  }

  async getBalance(apiHost: string): Promise<unknown> {
    this.validateHost(apiHost)

    try {
      const response = await net.fetch(`${apiHost}/api/user/balance`, {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      })

      if (!response.ok) {
        const text = await response.text()
        log.error(`Get balance failed: ${response.status} ${text}`)
        throw new Error(`Get balance failed: ${response.status} ${text}`)
      }

      const data = await response.json()
      log.info('Balance retrieved successfully')
      return data
    } catch (error) {
      log.error(`Get balance error: ${error}`)
      throw error
    }
  }

  async refreshToken(
    apiHost: string,
    refreshToken: string
  ): Promise<{ access_token: string; refresh_token: string }> {
    this.validateHost(apiHost)

    try {
      const response = await net.fetch(`${apiHost}/api/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: CHERRYIN_CONFIG.CLIENT_ID,
          refresh_token: refreshToken
        }).toString()
      })

      if (!response.ok) {
        const text = await response.text()
        log.error(`Token refresh failed: ${response.status} ${text}`)
        throw new Error(`Token refresh failed: ${response.status} ${text}`)
      }

      const data = await response.json()
      const parsed = TokenResponseSchema.parse(data)
      log.info('Token refresh successful')

      return { access_token: parsed.access_token, refresh_token: parsed.refresh_token }
    } catch (error) {
      log.error(`Token refresh error: ${error}`)
      throw error
    }
  }

  async logout(apiHost: string, accessToken: string): Promise<{ ok: true }> {
    this.validateHost(apiHost)

    try {
      const response = await net.fetch(`${apiHost}/api/oauth/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        },
        body: new URLSearchParams({
          token: accessToken
        }).toString()
      })

      if (!response.ok) {
        const text = await response.text()
        log.error(`Logout/revoke failed: ${response.status} ${text}`)
        throw new Error(`Logout/revoke failed: ${response.status} ${text}`)
      }

      log.info('Token revoked successfully')
    } catch (error) {
      log.error(`Logout error: ${error}`)
      throw error
    } finally {
      this.clearFlowState()
    }

    return { ok: true }
  }

  sendOAuthCallback(code: string, state: string): void {
    const win = BrowserWindow.getFocusedWindow()
    if (win) {
      win.webContents.send(IpcChannel.CherryIN_OAuthCallback, { code, state })
      log.info('OAuth callback sent to focused window')
    } else {
      log.warn('No focused window found to send OAuth callback')
    }
  }

  // ── Private Helpers ──

  private clearFlowState(): void {
    this.codeVerifier = null
    this.state = null
    this.oauthServer = null
    if (this.flowTimer) {
      clearTimeout(this.flowTimer)
      this.flowTimer = null
    }
  }

  private validateHost(host: string): void {
    if (!CHERRYIN_CONFIG.ALLOWED_HOSTS.includes(host)) {
      log.error(`Host not allowed: ${host}`)
      throw new Error(`Host not allowed: ${host}`)
    }
  }

  // ── PKCE Helpers ──

  private generateCodeVerifier(): string {
    return this.base64url(randomBytes(32))
  }

  private generateCodeChallenge(verifier: string): string {
    const hash = createHash('sha256').update(verifier).digest()
    return this.base64url(hash)
  }

  private base64url(buffer: Buffer): string {
    return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
}

export const cherryInOAuthService = new CherryINOAuthService()
