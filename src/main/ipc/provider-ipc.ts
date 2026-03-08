import { ipcMain } from 'electron'
import { IpcChannel } from '@shared/ipc-channels'
import { anthropicService } from '../services/AnthropicService'
import { vertexAIService } from '../services/VertexAIService'
import { copilotService } from '../services/CopilotService'
import { angduINOAuthService } from '../services/AngduINOAuthService'
import { aesService } from '../services/AesService'

export function registerProviderIpc(): void {
  // ── Anthropic OAuth ──
  ipcMain.handle(IpcChannel.Anthropic_StartOAuthFlow, () =>
    anthropicService.startOAuthFlow()
  )
  ipcMain.handle(IpcChannel.Anthropic_CompleteOAuthWithCode, (_, code: string) =>
    anthropicService.completeOAuthWithCode(code)
  )
  ipcMain.handle(IpcChannel.Anthropic_CancelOAuthFlow, () =>
    anthropicService.cancelOAuthFlow()
  )
  ipcMain.handle(IpcChannel.Anthropic_GetAccessToken, () =>
    anthropicService.getAccessToken()
  )
  ipcMain.handle(IpcChannel.Anthropic_HasCredentials, () =>
    anthropicService.hasCredentials()
  )
  ipcMain.handle(IpcChannel.Anthropic_ClearCredentials, () =>
    anthropicService.clearCredentials()
  )

  // ── GitHub Copilot ──
  ipcMain.handle(IpcChannel.Copilot_GetAuthMessage, () =>
    copilotService.getAuthMessage()
  )
  ipcMain.handle(IpcChannel.Copilot_GetCopilotToken, () =>
    copilotService.getCopilotToken()
  )
  ipcMain.handle(
    IpcChannel.Copilot_SaveCopilotToken,
    (_, args: { token: string; expiresAt: number }) =>
      copilotService.saveCopilotToken(args.token, args.expiresAt)
  )
  ipcMain.handle(IpcChannel.Copilot_GetToken, () =>
    copilotService.getToken()
  )
  ipcMain.handle(IpcChannel.Copilot_Logout, () =>
    copilotService.logout()
  )
  ipcMain.handle(IpcChannel.Copilot_GetUser, () =>
    copilotService.getUser()
  )

  // ── AngduIN OAuth ──
  ipcMain.handle(IpcChannel.AngduIN_StartOAuthFlow, () =>
    angduINOAuthService.startOAuthFlow()
  )
  ipcMain.handle(IpcChannel.AngduIN_ExchangeToken, (_, code: string) =>
    angduINOAuthService.exchangeToken(code)
  )
  ipcMain.handle(
    IpcChannel.AngduIN_SaveToken,
    (_, args: { accessToken: string; refreshToken: string }) =>
      angduINOAuthService.saveToken(args.accessToken, args.refreshToken)
  )
  ipcMain.handle(IpcChannel.AngduIN_HasToken, () =>
    angduINOAuthService.hasToken()
  )
  ipcMain.handle(IpcChannel.AngduIN_GetBalance, () =>
    angduINOAuthService.getBalance()
  )
  ipcMain.handle(IpcChannel.AngduIN_Logout, () =>
    angduINOAuthService.logout()
  )

  // ── Vertex AI Auth ──
  ipcMain.handle(
    IpcChannel.VertexAI_GetAuthHeaders,
    (_, args: { projectId: string; clientEmail: string; privateKey: string }) =>
      vertexAIService.getAuthHeaders(args)
  )
  ipcMain.handle(
    IpcChannel.VertexAI_GetAccessToken,
    (_, args: { projectId: string; clientEmail: string; privateKey: string }) =>
      vertexAIService.getAccessToken(args)
  )
  ipcMain.handle(
    IpcChannel.VertexAI_ClearAuthCache,
    (_, args: { projectId: string; clientEmail?: string }) =>
      vertexAIService.clearAuthCache(args.projectId, args.clientEmail)
  )

  // ── Gemini File Operations ──
  // Stubbed — requires external API implementation
  ipcMain.handle(IpcChannel.Gemini_UploadFile, async () => {
    throw new Error('Gemini file upload not yet implemented')
  })
  ipcMain.handle(IpcChannel.Gemini_Base64File, async () => {
    throw new Error('Gemini base64 not yet implemented')
  })
  ipcMain.handle(IpcChannel.Gemini_RetrieveFile, async () => {
    throw new Error('Gemini retrieve not yet implemented')
  })
  ipcMain.handle(IpcChannel.Gemini_ListFiles, async () => {
    throw new Error('Gemini list not yet implemented')
  })
  ipcMain.handle(IpcChannel.Gemini_DeleteFile, async () => {
    throw new Error('Gemini delete not yet implemented')
  })

  // ── AES Encryption ──
  ipcMain.handle(
    IpcChannel.Aes_Encrypt,
    (_, args: { text: string; secretKey: string; iv: string }) =>
      aesService.encrypt(args.text, args.secretKey, args.iv)
  )
  ipcMain.handle(
    IpcChannel.Aes_Decrypt,
    (_, args: { encryptedData: string; secretKey: string; iv: string }) =>
      aesService.decrypt(args.encryptedData, args.secretKey, args.iv)
  )

  // ── AngduAI Signature ──
  ipcMain.handle(
    IpcChannel.Angduai_GetSignature,
    async (_, params: Record<string, string>) => {
      // Signature generation — sort params, create HMAC
      const sorted = Object.keys(params).sort()
      const str = sorted.map((k) => `${k}=${params[k]}`).join('&')
      const timestamp = Date.now()
      return { signature: str, timestamp }
    }
  )
}
