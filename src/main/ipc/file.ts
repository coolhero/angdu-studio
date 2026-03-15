import { ipcMain, app } from 'electron'
import fs from 'fs'
import path from 'path'

function resolveUserDataPath(relativePath: string): string {
  const userDataDir = app.getPath('userData')
  const resolved = path.resolve(userDataDir, relativePath)

  if (!resolved.startsWith(userDataDir)) {
    throw new Error('Path traversal detected: path must be within userData directory')
  }

  return resolved
}

export function registerFileHandlers(): void {
  ipcMain.handle('file:read', (_event, relativePath: string) => {
    const fullPath = resolveUserDataPath(relativePath)
    return fs.readFileSync(fullPath)
  })

  ipcMain.handle('file:write', (_event, relativePath: string, data: Buffer) => {
    const fullPath = resolveUserDataPath(relativePath)
    const dir = path.dirname(fullPath)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(fullPath, data)
  })

  ipcMain.handle('file:delete', (_event, relativePath: string) => {
    const fullPath = resolveUserDataPath(relativePath)
    fs.unlinkSync(fullPath)
  })
}
