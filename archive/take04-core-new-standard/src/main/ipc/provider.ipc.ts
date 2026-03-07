import { ipcMain } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import { withContext } from '../logger'
import { copilotService } from '../services/CopilotService'
import { cherryInOAuthService } from '../services/CherryINOAuthService'
import { anthropicOAuthService } from '../services/AnthropicOAuthService'
import { vertexAIService } from '../services/VertexAIService'
import type { Provider, ConnectivityResult } from '@shared/types'

const log = withContext('ipc:provider')

export function registerProviderHandlers(): void {
  // ── Copilot OAuth ──
  ipcMain.handle(IpcChannel.Copilot_GetAuthMessage, async () => {
    return copilotService.getAuthMessage()
  })

  ipcMain.handle(IpcChannel.Copilot_GetToken, async (_event, deviceCode: string) => {
    const token = await copilotService.getToken(deviceCode)
    return { access_token: token }
  })

  ipcMain.handle(IpcChannel.Copilot_SaveToken, async (_event, token: string) => {
    copilotService.saveToken(token)
    return { ok: true }
  })

  ipcMain.handle(IpcChannel.Copilot_GetCopilotToken, async () => {
    return copilotService.getCopilotToken()
  })

  ipcMain.handle(IpcChannel.Copilot_GetUser, async (_event, token: string) => {
    return copilotService.getUser(token)
  })

  ipcMain.handle(IpcChannel.Copilot_Logout, async () => {
    copilotService.logout()
    return { ok: true }
  })

  // ── CherryIN OAuth ──
  ipcMain.handle(IpcChannel.CherryIN_StartOAuth, async (_event, oauthServer: string, apiHost?: string) => {
    return cherryInOAuthService.startOAuth(oauthServer, apiHost)
  })

  ipcMain.handle(IpcChannel.CherryIN_ExchangeToken, async (_event, code: string, state: string) => {
    return cherryInOAuthService.exchangeToken(code, state)
  })

  ipcMain.handle(IpcChannel.CherryIN_GetBalance, async (_event, apiHost: string) => {
    return cherryInOAuthService.getBalance(apiHost)
  })

  ipcMain.handle(IpcChannel.CherryIN_Logout, async (_event, apiHost: string, accessToken: string) => {
    return cherryInOAuthService.logout(apiHost, accessToken)
  })

  ipcMain.handle(IpcChannel.CherryIN_RefreshToken, async (_event, apiHost: string, refreshToken: string) => {
    return cherryInOAuthService.refreshToken(apiHost, refreshToken)
  })

  // Note: CherryIN_OAuthCallback is an event channel (M→R), not a handle.
  // It is sent via webContents.send() from CherryINOAuthService.sendOAuthCallback().

  // ── Anthropic OAuth ──
  ipcMain.handle(IpcChannel.AnthropicOAuth_Start, async () => {
    return anthropicOAuthService.start()
  })

  ipcMain.handle(IpcChannel.AnthropicOAuth_Complete, async (_event, code: string) => {
    return anthropicOAuthService.complete(code)
  })

  ipcMain.handle(IpcChannel.AnthropicOAuth_GetToken, async () => {
    return anthropicOAuthService.getToken()
  })

  ipcMain.handle(IpcChannel.AnthropicOAuth_Clear, async () => {
    return anthropicOAuthService.clear()
  })

  ipcMain.handle(IpcChannel.AnthropicOAuth_Cancel, async () => {
    return anthropicOAuthService.cancel()
  })

  ipcMain.handle(IpcChannel.AnthropicOAuth_Status, async () => {
    return anthropicOAuthService.getStatus()
  })

  // ── VertexAI Auth ──
  ipcMain.handle(
    IpcChannel.VertexAI_GetAccessToken,
    async (_event, params: { privateKey: string; clientEmail: string; projectId: string; location: string }) => {
      return vertexAIService.getAccessToken(params)
    }
  )

  ipcMain.handle(
    IpcChannel.VertexAI_GetAuthHeaders,
    async (_event, params: { privateKey: string; clientEmail: string; projectId: string; location: string }) => {
      return vertexAIService.getAuthHeaders(params)
    }
  )

  ipcMain.handle(IpcChannel.VertexAI_ClearCache, async (_event, projectId?: string, clientEmail?: string) => {
    return vertexAIService.clearCache(projectId, clientEmail)
  })

  // ── Provider Connectivity ──
  ipcMain.handle(IpcChannel.Provider_CheckConnectivity, async (_event, provider: Provider): Promise<ConnectivityResult> => {
    log.info(`Checking connectivity for provider: ${provider.name}`)
    try {
      const url = `${provider.apiHost}/v1/models`
      const headers: Record<string, string> = {
        Accept: 'application/json'
      }
      if (provider.apiKey) {
        headers['Authorization'] = `Bearer ${provider.apiKey}`
      }
      if (provider.extra_headers) {
        Object.assign(headers, provider.extra_headers)
      }

      const { net } = await import('electron')
      const response = await net.fetch(url, { method: 'GET', headers })

      if (!response.ok) {
        return { ok: false, error: `HTTP ${response.status}: ${response.statusText}` }
      }

      const data = await response.json()
      const models = Array.isArray(data.data) ? data.data : []
      return { ok: true, models }
    } catch (error) {
      log.error(`Connectivity check failed: ${error}`)
      return { ok: false, error: String(error) }
    }
  })

  log.info('Provider IPC handlers registered (22 channels)')
}
