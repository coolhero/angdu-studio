import { ipcMain, shell, Notification, BrowserWindow } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import crypto from 'crypto'
import { createGzip, createGunzip } from 'zlib'
import { createReadStream, createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'

const AES_ALGORITHM = 'aes-256-gcm'

export function registerUtilityHandlers(): void {
  // Shortcuts
  ipcMain.handle(IpcChannel.Shortcuts_Register, () => {
    // Handled by ShortcutService at app level, not per-call
  })

  // Notifications
  ipcMain.handle(IpcChannel.Notification_Show, (_, { title, body }: { title: string; body: string }) => {
    new Notification({ title, body }).show()
  })

  ipcMain.handle(IpcChannel.Notification_Clear, () => {
    // Electron doesn't support clearing notifications directly
  })

  // Open
  ipcMain.handle(IpcChannel.Open_Url, (_, url: string) => {
    shell.openExternal(url)
  })

  ipcMain.handle(IpcChannel.Open_Path, (_, path: string) => {
    shell.openPath(path)
  })

  // AES
  ipcMain.handle(IpcChannel.AES_Encrypt, (_, { data, key }: { data: string; key: string }) => {
    const keyBuffer = crypto.scryptSync(key, 'salt', 32)
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(AES_ALGORITHM, keyBuffer, iv)
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag()
    return { encrypted, iv: iv.toString('hex'), authTag: authTag.toString('hex') }
  })

  ipcMain.handle(IpcChannel.AES_Decrypt, (_, { encrypted, key, iv, authTag }: { encrypted: string; key: string; iv: string; authTag: string }) => {
    const keyBuffer = crypto.scryptSync(key, 'salt', 32)
    const decipher = crypto.createDecipheriv(AES_ALGORITHM, keyBuffer, Buffer.from(iv, 'hex'))
    decipher.setAuthTag(Buffer.from(authTag, 'hex'))
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  })

  // Zip
  ipcMain.handle(IpcChannel.Zip_Compress, async (_, { src, dest }: { src: string; dest: string }) => {
    await pipeline(createReadStream(src), createGzip(), createWriteStream(dest))
  })

  ipcMain.handle(IpcChannel.Zip_Decompress, async (_, { src, dest }: { src: string; dest: string }) => {
    await pipeline(createReadStream(src), createGunzip(), createWriteStream(dest))
  })

  // StoreSync
  ipcMain.handle(IpcChannel.StoreSync_GetState, () => {
    return {} // Placeholder — state sync managed by BroadcastChannel in renderer
  })

  ipcMain.handle(IpcChannel.StoreSync_SetState, () => {
    // Placeholder
  })

  ipcMain.handle(IpcChannel.StoreSync_Subscribe, () => {
    // Placeholder
  })
}
