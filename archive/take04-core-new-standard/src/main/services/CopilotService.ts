import { safeStorage, net } from 'electron'
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs'
import { join } from 'path'
import { withContext } from '../logger'
import { dataDir } from '../bootstrap'

const COPILOT_CLIENT_ID = 'Iv1.b507a08c87ecfe98'
const GITHUB_API = 'https://api.github.com'
const GITHUB_DEVICE_LOGIN = 'https://github.com/login/device/code'
const GITHUB_OAUTH_TOKEN = 'https://github.com/login/oauth/access_token'
const COPILOT_TOKEN_URL = 'https://api.github.com/copilot_internal/v2/token'

const log = withContext('copilot')

const TOKEN_DIR = join(dataDir, 'copilot')
const TOKEN_PATH = join(TOKEN_DIR, '.copilot_token')

class CopilotService {
  async getAuthMessage(): Promise<{
    device_code: string
    user_code: string
    verification_uri: string
    expires_in: number
    interval: number
  }> {
    log.info('Requesting device code for GitHub OAuth')

    const response = await net.fetch(GITHUB_DEVICE_LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: COPILOT_CLIENT_ID,
        scope: 'read:user'
      })
    })

    if (!response.ok) {
      const text = await response.text()
      log.error(`Failed to request device code: ${response.status} ${text}`)
      throw new Error(`Failed to request device code: ${response.status} ${text}`)
    }

    const data = await response.json()
    log.info(`Device code obtained, user code: ${data.user_code}`)
    return data
  }

  async getToken(deviceCode: string): Promise<string> {
    log.info('Polling for OAuth access token')

    const response = await net.fetch(GITHUB_OAUTH_TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: COPILOT_CLIENT_ID,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
      })
    })

    if (!response.ok) {
      const text = await response.text()
      log.error(`Failed to get access token: ${response.status} ${text}`)
      throw new Error(`Failed to get access token: ${response.status} ${text}`)
    }

    const data = await response.json()

    if (data.error) {
      log.warn(`OAuth token error: ${data.error} - ${data.error_description}`)
      throw new Error(`OAuth error: ${data.error} - ${data.error_description}`)
    }

    log.info('GitHub OAuth access token obtained')
    return data.access_token
  }

  saveToken(token: string): void {
    log.info('Saving encrypted GitHub token')

    if (!existsSync(TOKEN_DIR)) {
      mkdirSync(TOKEN_DIR, { recursive: true })
    }

    const encrypted = safeStorage.encryptString(token)
    writeFileSync(TOKEN_PATH, encrypted)
    log.info('GitHub token saved successfully')
  }

  loadToken(): string | null {
    if (!existsSync(TOKEN_PATH)) {
      return null
    }

    log.info('Loading encrypted GitHub token')
    const encrypted = readFileSync(TOKEN_PATH)
    const token = safeStorage.decryptString(encrypted)
    log.info('GitHub token loaded successfully')
    return token
  }

  async getCopilotToken(): Promise<{ token: string; expires_at: number }> {
    log.info('Requesting Copilot session token')

    const githubToken = this.loadToken()
    if (!githubToken) {
      log.error('No saved GitHub token found')
      throw new Error('No saved GitHub token found. Please login first.')
    }

    const response = await net.fetch(COPILOT_TOKEN_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const text = await response.text()
      log.error(`Failed to get Copilot token: ${response.status} ${text}`)
      throw new Error(`Failed to get Copilot token: ${response.status} ${text}`)
    }

    const data = await response.json()
    log.info('Copilot session token obtained')
    return { token: data.token, expires_at: data.expires_at }
  }

  async getUser(token: string): Promise<{ login: string; avatar_url: string; name: string }> {
    log.info('Fetching GitHub user info')

    const response = await net.fetch(`${GITHUB_API}/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const text = await response.text()
      log.error(`Failed to fetch user info: ${response.status} ${text}`)
      throw new Error(`Failed to fetch user info: ${response.status} ${text}`)
    }

    const data = await response.json()
    log.info(`GitHub user: ${data.login}`)
    return { login: data.login, avatar_url: data.avatar_url, name: data.name }
  }

  logout(): void {
    log.info('Logging out, removing saved token')

    if (existsSync(TOKEN_PATH)) {
      unlinkSync(TOKEN_PATH)
      log.info('Token file removed')
    } else {
      log.warn('No token file found to remove')
    }
  }
}

export const copilotService = new CopilotService()
