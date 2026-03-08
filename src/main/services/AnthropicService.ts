import { net, shell } from 'electron'
import crypto from 'node:crypto'

interface OAuthState {
  codeVerifier: string
  state: string
}

interface OAuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt?: number
}

class AnthropicService {
  private tokens: OAuthTokens | null = null
  private pendingOAuth: OAuthState | null = null
  private readonly clientId = 'angdu-studio'
  private readonly redirectUri = 'angdu-studio://oauth/anthropic/callback'
  private readonly authUrl = 'https://console.anthropic.com/oauth/authorize'
  private readonly tokenUrl = 'https://console.anthropic.com/oauth/token'

  async startOAuthFlow(): Promise<{ url: string }> {
    const codeVerifier = crypto.randomBytes(32).toString('base64url')
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url')
    const state = crypto.randomBytes(16).toString('hex')

    this.pendingOAuth = { codeVerifier, state }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
      scope: 'user:inference'
    })

    const url = `${this.authUrl}?${params.toString()}`
    await shell.openExternal(url)
    return { url }
  }

  async completeOAuthWithCode(code: string): Promise<OAuthTokens> {
    if (!this.pendingOAuth) {
      throw new Error('No pending OAuth flow')
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      code_verifier: this.pendingOAuth.codeVerifier
    })

    const response = await net.fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    })

    if (!response.ok) {
      throw new Error(`OAuth token exchange failed: ${response.status}`)
    }

    const data = (await response.json()) as {
      access_token: string
      refresh_token: string
      expires_in?: number
    }

    this.tokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in
        ? Date.now() + data.expires_in * 1000
        : undefined
    }

    this.pendingOAuth = null
    return this.tokens
  }

  cancelOAuthFlow(): void {
    this.pendingOAuth = null
  }

  async getAccessToken(): Promise<string> {
    if (!this.tokens) {
      throw new Error('Not authenticated')
    }

    // Refresh if expired
    if (this.tokens.expiresAt && Date.now() >= this.tokens.expiresAt - 60000) {
      await this.refreshAccessToken()
    }

    return this.tokens.accessToken
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token available')
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.tokens.refreshToken,
      client_id: this.clientId
    })

    const response = await net.fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    })

    if (!response.ok) {
      this.tokens = null
      throw new Error('Token refresh failed')
    }

    const data = (await response.json()) as {
      access_token: string
      refresh_token?: string
      expires_in?: number
    }

    this.tokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? this.tokens.refreshToken,
      expiresAt: data.expires_in
        ? Date.now() + data.expires_in * 1000
        : undefined
    }
  }

  hasCredentials(): boolean {
    return this.tokens !== null
  }

  clearCredentials(): void {
    this.tokens = null
    this.pendingOAuth = null
  }
}

export const anthropicService = new AnthropicService()
