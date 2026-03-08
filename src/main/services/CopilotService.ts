import { net } from 'electron'

interface DeviceCodeResponse {
  device_code: string
  user_code: string
  verification_uri: string
  expires_in: number
  interval: number
}

interface CopilotToken {
  token: string
  expiresAt: number
}

interface CopilotUser {
  login: string
  name?: string
}

class CopilotService {
  private githubToken: string | null = null
  private copilotToken: CopilotToken | null = null
  private pendingDeviceCode: DeviceCodeResponse | null = null
  private readonly clientId = 'Iv1.b507a08c87ecfe98' // GitHub Copilot client ID

  async getAuthMessage(): Promise<{ userCode: string; verificationUri: string }> {
    const response = await net.fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: this.clientId,
        scope: 'read:user'
      })
    })

    if (!response.ok) {
      throw new Error(`Device code request failed: ${response.status}`)
    }

    const data = (await response.json()) as DeviceCodeResponse
    this.pendingDeviceCode = data

    return {
      userCode: data.user_code,
      verificationUri: data.verification_uri
    }
  }

  async getCopilotToken(): Promise<string> {
    if (!this.pendingDeviceCode) {
      throw new Error('No pending device code')
    }

    const response = await net.fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: this.clientId,
        device_code: this.pendingDeviceCode.device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
      })
    })

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`)
    }

    const data = (await response.json()) as { access_token?: string; error?: string }

    if (data.error) {
      throw new Error(data.error)
    }

    this.githubToken = data.access_token ?? null
    this.pendingDeviceCode = null

    if (!this.githubToken) {
      throw new Error('No access token received')
    }

    return this.githubToken
  }

  saveCopilotToken(token: string, expiresAt: number): void {
    this.copilotToken = { token, expiresAt }
  }

  async getToken(): Promise<string | null> {
    if (this.copilotToken && Date.now() < this.copilotToken.expiresAt - 60000) {
      return this.copilotToken.token
    }

    if (!this.githubToken) return null

    // Refresh Copilot token using GitHub token
    try {
      const response = await net.fetch(
        'https://api.github.com/copilot_internal/v2/token',
        {
          headers: {
            Authorization: `token ${this.githubToken}`,
            Accept: 'application/json'
          }
        }
      )

      if (!response.ok) return null

      const data = (await response.json()) as { token: string; expires_at: number }
      this.copilotToken = {
        token: data.token,
        expiresAt: data.expires_at * 1000
      }

      return this.copilotToken.token
    } catch {
      return null
    }
  }

  logout(): void {
    this.githubToken = null
    this.copilotToken = null
    this.pendingDeviceCode = null
  }

  async getUser(): Promise<CopilotUser | null> {
    if (!this.githubToken) return null

    try {
      const response = await net.fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${this.githubToken}`,
          Accept: 'application/json'
        }
      })

      if (!response.ok) return null

      const data = (await response.json()) as CopilotUser
      return { login: data.login, name: data.name }
    } catch {
      return null
    }
  }
}

export const copilotService = new CopilotService()
