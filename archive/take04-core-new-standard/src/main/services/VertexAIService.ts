import { GoogleAuth } from 'google-auth-library'
import { withContext } from '../logger'

const log = withContext('vertexAI')

interface VertexAIAuthParams {
  privateKey: string
  clientEmail: string
  projectId: string
  location: string
}

class VertexAIService {
  private authClientCache: Map<string, GoogleAuth> = new Map()

  async getAccessToken(params: VertexAIAuthParams): Promise<{ access_token: string; expires_at: number }> {
    const cacheKey = `${params.projectId}-${params.clientEmail}`

    try {
      const auth = this.getOrCreateClient(params)
      const client = await auth.getClient()
      const tokenResponse = await client.getAccessToken()

      if (!tokenResponse.token) {
        throw new Error('No access token returned from Google Auth')
      }

      return {
        access_token: tokenResponse.token,
        expires_at: Math.floor(Date.now() / 1000) + 3600
      }
    } catch (error) {
      this.authClientCache.delete(cacheKey)
      log.error(`Failed to get access token for project ${params.projectId}: ${error}`)
      throw new Error(`VertexAI authentication failed: ${error}`)
    }
  }

  async getAuthHeaders(params: VertexAIAuthParams): Promise<Record<string, string>> {
    const cacheKey = `${params.projectId}-${params.clientEmail}`

    try {
      const auth = this.getOrCreateClient(params)
      const headers = await auth.getRequestHeaders()
      return headers
    } catch (error) {
      this.authClientCache.delete(cacheKey)
      log.error(`Failed to get auth headers for project ${params.projectId}: ${error}`)
      throw new Error(`VertexAI auth headers failed: ${error}`)
    }
  }

  clearCache(projectId?: string, clientEmail?: string): { ok: true } {
    if (projectId && clientEmail) {
      const cacheKey = `${projectId}-${clientEmail}`
      this.authClientCache.delete(cacheKey)
      log.info(`Cleared auth cache for ${cacheKey}`)
    } else {
      this.authClientCache.clear()
      log.info('Cleared entire auth client cache')
    }

    return { ok: true }
  }

  private getOrCreateClient(params: VertexAIAuthParams): GoogleAuth {
    const cacheKey = `${params.projectId}-${params.clientEmail}`

    const cached = this.authClientCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const formattedKey = this.formatPrivateKey(params.privateKey)

    const auth = new GoogleAuth({
      credentials: {
        client_email: params.clientEmail,
        private_key: formattedKey
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      projectId: params.projectId
    })

    this.authClientCache.set(cacheKey, auth)
    log.info(`Created new auth client for project ${params.projectId}`)

    return auth
  }

  private formatPrivateKey(key: string): string {
    let formatted = key

    if (!formatted.startsWith('-----BEGIN')) {
      const parts = formatted.split('\\n')
      formatted = `-----BEGIN PRIVATE KEY-----\n${parts.join('\n')}\n-----END PRIVATE KEY-----\n`
    }

    formatted = formatted.replace(/\\n/g, '\n')

    return formatted
  }
}

export const vertexAIService = new VertexAIService()
