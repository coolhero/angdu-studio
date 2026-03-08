import { net, shell } from 'electron'

interface AngduINTokens {
  accessToken: string
  refreshToken: string
}

interface AngduINBalance {
  credits: number
  plan: string
}

class AngduINOAuthService {
  private tokens: AngduINTokens | null = null
  private readonly baseUrl = 'https://api.angdu.in'

  async startOAuthFlow(): Promise<void> {
    const authUrl = `${this.baseUrl}/oauth/authorize?client_id=angdu-studio&redirect_uri=angdu-studio://oauth/angduin/callback`
    await shell.openExternal(authUrl)
  }

  async exchangeToken(code: string): Promise<AngduINTokens> {
    const response = await net.fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: 'angdu-studio',
        redirect_uri: 'angdu-studio://oauth/angduin/callback'
      })
    })

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`)
    }

    const data = (await response.json()) as {
      access_token: string
      refresh_token: string
    }

    this.tokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token
    }

    return this.tokens
  }

  saveToken(accessToken: string, refreshToken: string): void {
    this.tokens = { accessToken, refreshToken }
  }

  hasToken(): boolean {
    return this.tokens !== null
  }

  async getBalance(): Promise<AngduINBalance> {
    if (!this.tokens) {
      throw new Error('Not authenticated')
    }

    const response = await net.fetch(`${this.baseUrl}/api/balance`, {
      headers: {
        Authorization: `Bearer ${this.tokens.accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`Balance request failed: ${response.status}`)
    }

    return (await response.json()) as AngduINBalance
  }

  logout(): void {
    this.tokens = null
  }
}

export const angduINOAuthService = new AngduINOAuthService()
