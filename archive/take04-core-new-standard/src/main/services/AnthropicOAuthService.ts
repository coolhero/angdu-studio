import { shell, net } from 'electron'
import { randomBytes, createHash } from 'crypto'
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, chmodSync } from 'fs'
import { join } from 'path'
import { withContext } from '../logger'
import { dataDir } from '../bootstrap'

const ANTHROPIC_CLIENT_ID = '9d1c250a-e61b-44d9-88ed-5944d1962f5e'
const ANTHROPIC_AUTH_URL = 'https://console.anthropic.com/oauth/authorize'
const ANTHROPIC_TOKEN_URL = 'https://console.anthropic.com/v1/oauth/token'
const CREDS_DIR = join(dataDir, 'oauth')
const CREDS_FILE = join(CREDS_DIR, 'anthropic.json')

const log = withContext('anthropicOAuth')

interface AnthropicCredentials {
  access_token: string
  refresh_token?: string
  expires_at?: number
}

function base64url(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function generateCodeVerifier(): string {
  return base64url(randomBytes(32))
}

function generateCodeChallenge(verifier: string): string {
  const hash = createHash('sha256').update(verifier).digest()
  return base64url(hash)
}

class AnthropicOAuthService {
  private codeVerifier: string | null = null
  private state: string | null = null

  async start(): Promise<{ authorization_url: string }> {
    log.info('Starting Anthropic OAuth PKCE flow')

    this.codeVerifier = generateCodeVerifier()
    const codeChallenge = generateCodeChallenge(this.codeVerifier)
    this.state = randomBytes(16).toString('hex')

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: ANTHROPIC_CLIENT_ID,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: this.state,
      redirect_uri: 'https://console.anthropic.com/oauth/code'
    })

    const url = `${ANTHROPIC_AUTH_URL}?${params.toString()}`
    log.info('Opening authorization URL in browser')
    await shell.openExternal(url)

    return { authorization_url: url }
  }

  async complete(codeInput: string): Promise<{ ok: true }> {
    log.info('Completing Anthropic OAuth flow')

    if (!this.codeVerifier) {
      throw new Error('OAuth flow not started. Call start() first.')
    }

    let code = codeInput
    let inputState: string | undefined

    if (codeInput.includes('#')) {
      const parts = codeInput.split('#')
      code = parts[0]
      inputState = parts[1]
    }

    if (inputState && inputState !== this.state) {
      throw new Error('OAuth state mismatch. Possible CSRF attack.')
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: ANTHROPIC_CLIENT_ID,
      code,
      code_verifier: this.codeVerifier,
      redirect_uri: 'https://console.anthropic.com/oauth/code'
    })

    const response = await net.fetch(ANTHROPIC_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    })

    if (!response.ok) {
      const text = await response.text()
      log.error(`Token exchange failed: ${response.status} ${text}`)
      throw new Error(`Token exchange failed: ${response.status} ${text}`)
    }

    const data = await response.json()
    log.info('Token exchange successful')

    const creds: AnthropicCredentials = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined
    }

    this.saveCredentials(creds)
    this.codeVerifier = null
    this.state = null

    return { ok: true }
  }

  async getToken(): Promise<{ token: string }> {
    const creds = this.loadCredentials()

    if (!creds) {
      return { token: '' }
    }

    if (creds.expires_at && Date.now() >= creds.expires_at && creds.refresh_token) {
      log.info('Access token expired, refreshing')
      const newToken = await this.refreshAccessToken(creds.refresh_token)
      return { token: newToken }
    }

    return { token: creds.access_token }
  }

  async clear(): Promise<{ ok: true }> {
    log.info('Clearing Anthropic OAuth credentials')

    if (existsSync(CREDS_FILE)) {
      unlinkSync(CREDS_FILE)
      log.info('Credentials file removed')
    }

    this.codeVerifier = null
    this.state = null

    return { ok: true }
  }

  async cancel(): Promise<{ ok: true }> {
    log.info('Cancelling Anthropic OAuth flow')

    this.codeVerifier = null
    this.state = null

    return { ok: true }
  }

  async getStatus(): Promise<{ authenticated: boolean }> {
    const creds = this.loadCredentials()

    if (!creds || !creds.access_token) {
      return { authenticated: false }
    }

    if (creds.expires_at && Date.now() >= creds.expires_at && !creds.refresh_token) {
      return { authenticated: false }
    }

    return { authenticated: true }
  }

  private saveCredentials(creds: AnthropicCredentials): void {
    if (!existsSync(CREDS_DIR)) {
      mkdirSync(CREDS_DIR, { recursive: true })
    }

    writeFileSync(CREDS_FILE, JSON.stringify(creds, null, 2))
    chmodSync(CREDS_FILE, 0o600)
    log.info('Credentials saved')
  }

  private loadCredentials(): AnthropicCredentials | null {
    if (!existsSync(CREDS_FILE)) {
      return null
    }

    try {
      const raw = readFileSync(CREDS_FILE, 'utf-8')
      return JSON.parse(raw) as AnthropicCredentials
    } catch {
      log.warn('Failed to parse credentials file')
      return null
    }
  }

  private async refreshAccessToken(refreshToken: string): Promise<string> {
    log.info('Refreshing Anthropic access token')

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: ANTHROPIC_CLIENT_ID,
      refresh_token: refreshToken
    })

    const response = await net.fetch(ANTHROPIC_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    })

    if (!response.ok) {
      const text = await response.text()
      log.error(`Token refresh failed: ${response.status} ${text}`)
      throw new Error(`Token refresh failed: ${response.status} ${text}`)
    }

    const data = await response.json()
    log.info('Token refresh successful')

    const creds: AnthropicCredentials = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken,
      expires_at: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined
    }

    this.saveCredentials(creds)
    return creds.access_token
  }
}

export const anthropicOAuthService = new AnthropicOAuthService()
