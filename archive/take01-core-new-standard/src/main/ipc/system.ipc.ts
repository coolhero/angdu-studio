import { shell } from 'electron'
import { hostname } from 'node:os'
import { gzipSync, gunzipSync } from 'node:zlib'
import { IpcChannel } from '@shared/IpcChannel'
import { typedHandle } from './typedHandle'

/**
 * Registers system, shell, and zip IPC handlers.
 */
export function registerSystemIpc(): void {
  // System info
  typedHandle(IpcChannel.SystemGetDeviceType, async () => {
    return {
      platform: process.platform,
      arch: process.arch,
      hostname: hostname()
    }
  })

  // Shell / OS integration
  typedHandle(IpcChannel.ShellOpenExternal, async (_event, url) => {
    await shell.openExternal(url)
  })

  typedHandle(IpcChannel.ShellShowItemInFolder, async (_event, path) => {
    shell.showItemInFolder(path)
  })

  // Zip compress / decompress using Node.js zlib
  typedHandle(IpcChannel.ZipCompress, async (_event, data) => {
    const buffer = Buffer.from(data)
    const compressed = gzipSync(buffer)
    return new Uint8Array(compressed)
  })

  typedHandle(IpcChannel.ZipDecompress, async (_event, data) => {
    const buffer = Buffer.from(data)
    const decompressed = gunzipSync(buffer)
    return new Uint8Array(decompressed)
  })
}
