import crypto from 'node:crypto'
import { net } from 'electron'

interface ServiceAccountCredentials {
  projectId: string
  clientEmail: string
  privateKey: string
}

interface CachedToken {
  token: string
  expiresAt: number
}

class VertexAIService {
  private tokenCache = new Map<string, CachedToken>()

  async getAccessToken(credentials: ServiceAccountCredentials): Promise<string> {
    const cacheKey = `${credentials.projectId}:${credentials.clientEmail}`
    const cached = this.tokenCache.get(cacheKey)

    if (cached && Date.now() < cached.expiresAt - 60000) {
      return cached.token
    }

    const token = await this.requestAccessToken(credentials)
    this.tokenCache.set(cacheKey, {
      token,
      expiresAt: Date.now() + 3600 * 1000 // 1 hour
    })

    return token
  }

  async getAuthHeaders(credentials: ServiceAccountCredentials): Promise<Record<string, string>> {
    const token = await this.getAccessToken(credentials)
    return {
      Authorization: `Bearer ${token}`
    }
  }

  clearAuthCache(projectId: string, clientEmail?: string): void {
    if (clientEmail) {
      this.tokenCache.delete(`${projectId}:${clientEmail}`)
    } else {
      // Clear all tokens for the project
      for (const key of this.tokenCache.keys()) {
        if (key.startsWith(`${projectId}:`)) {
          this.tokenCache.delete(key)
        }
      }
    }
  }

  private async requestAccessToken(credentials: ServiceAccountCredentials): Promise<string> {
    const now = Math.floor(Date.now() / 1000)
    const header = { alg: 'RS256', typ: 'JWT' }
    const payload = {
      iss: credentials.clientEmail,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600
    }

    const jwt = this.createJWT(header, payload, credentials.privateKey)

    const body = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })

    const response = await net.fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    })

    if (!response.ok) {
      throw new Error(`VertexAI token request failed: ${response.status}`)
    }

    const data = (await response.json()) as { access_token: string }
    return data.access_token
  }

  private createJWT(
    header: Record<string, string>,
    payload: Record<string, unknown>,
    privateKey: string
  ): string {
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const signatureInput = `${encodedHeader}.${encodedPayload}`

    const sign = crypto.createSign('RSA-SHA256')
    sign.update(signatureInput)
    const signature = sign.sign(privateKey, 'base64url')

    return `${signatureInput}.${signature}`
  }
}

export const vertexAIService = new VertexAIService()
