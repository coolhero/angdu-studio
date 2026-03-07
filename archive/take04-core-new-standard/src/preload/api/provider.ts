import { ipcRenderer } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'

export const providerApi = {
  copilot: {
    getAuthMessage: () => ipcRenderer.invoke(IpcChannel.Copilot_GetAuthMessage),
    getToken: (deviceCode: string) => ipcRenderer.invoke(IpcChannel.Copilot_GetToken, deviceCode),
    saveToken: (token: string) => ipcRenderer.invoke(IpcChannel.Copilot_SaveToken, token),
    getCopilotToken: () => ipcRenderer.invoke(IpcChannel.Copilot_GetCopilotToken),
    getUser: (token: string) => ipcRenderer.invoke(IpcChannel.Copilot_GetUser, token),
    logout: () => ipcRenderer.invoke(IpcChannel.Copilot_Logout)
  },

  cherryIn: {
    startOAuth: (oauthServer: string, apiHost?: string) =>
      ipcRenderer.invoke(IpcChannel.CherryIN_StartOAuth, oauthServer, apiHost),
    exchangeToken: (code: string, state: string) =>
      ipcRenderer.invoke(IpcChannel.CherryIN_ExchangeToken, code, state),
    getBalance: (apiHost: string) =>
      ipcRenderer.invoke(IpcChannel.CherryIN_GetBalance, apiHost),
    logout: (apiHost: string) =>
      ipcRenderer.invoke(IpcChannel.CherryIN_Logout, apiHost),
    refreshToken: () =>
      ipcRenderer.invoke(IpcChannel.CherryIN_RefreshToken),
    onOAuthCallback: (cb: (data: { code: string; state: string }) => void) => {
      const handler = (_event: unknown, data: { code: string; state: string }) => cb(data)
      ipcRenderer.on(IpcChannel.CherryIN_OAuthCallback, handler)
      return () => ipcRenderer.removeListener(IpcChannel.CherryIN_OAuthCallback, handler)
    }
  },

  anthropic: {
    startOAuth: () => ipcRenderer.invoke(IpcChannel.AnthropicOAuth_Start),
    complete: (code: string) => ipcRenderer.invoke(IpcChannel.AnthropicOAuth_Complete, code),
    getToken: () => ipcRenderer.invoke(IpcChannel.AnthropicOAuth_GetToken),
    clear: () => ipcRenderer.invoke(IpcChannel.AnthropicOAuth_Clear),
    cancel: () => ipcRenderer.invoke(IpcChannel.AnthropicOAuth_Cancel),
    getStatus: () => ipcRenderer.invoke(IpcChannel.AnthropicOAuth_Status)
  },

  vertexAI: {
    getAccessToken: (params: { privateKey: string; clientEmail: string; projectId: string; location: string }) =>
      ipcRenderer.invoke(IpcChannel.VertexAI_GetAccessToken, params),
    getAuthHeaders: (params: { privateKey: string; clientEmail: string; projectId: string; location: string }) =>
      ipcRenderer.invoke(IpcChannel.VertexAI_GetAuthHeaders, params),
    clearCache: (projectId?: string, clientEmail?: string) =>
      ipcRenderer.invoke(IpcChannel.VertexAI_ClearCache, projectId, clientEmail)
  },

  checkConnectivity: (provider: unknown) =>
    ipcRenderer.invoke(IpcChannel.Provider_CheckConnectivity, provider)
}
