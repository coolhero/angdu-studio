import { createClient, type WebDAVClient } from 'webdav'
import fs from 'node:fs'

export interface WebDavConfig {
  webdavUrl: string
  webdavUsername: string
  webdavPassword: string
  webdavPath: string
}

export interface BackupFileInfo {
  name: string
  path: string
  size: number
  createdAt: string
}

class WebDavService {
  private createWebDavClient(config: WebDavConfig): WebDAVClient {
    return createClient(config.webdavUrl, {
      username: config.webdavUsername,
      password: config.webdavPassword
    })
  }

  async checkConnection(config: WebDavConfig): Promise<boolean> {
    try {
      const client = this.createWebDavClient(config)
      await client.getDirectoryContents('/')
      return true
    } catch {
      return false
    }
  }

  async upload(config: WebDavConfig, localPath: string, remoteName: string): Promise<void> {
    const client = this.createWebDavClient(config)
    const fileContent = fs.readFileSync(localPath)
    const remotePath = `${config.webdavPath}/${remoteName}`.replace(/\/+/g, '/')
    await client.putFileContents(remotePath, fileContent, { overwrite: true })
  }

  async download(config: WebDavConfig, remoteName: string, localPath: string): Promise<void> {
    const client = this.createWebDavClient(config)
    const remotePath = `${config.webdavPath}/${remoteName}`.replace(/\/+/g, '/')
    const content = (await client.getFileContents(remotePath)) as Buffer
    fs.writeFileSync(localPath, content)
  }

  async listFiles(config: WebDavConfig): Promise<BackupFileInfo[]> {
    const client = this.createWebDavClient(config)
    const items = await client.getDirectoryContents(config.webdavPath)

    if (!Array.isArray(items)) {
      return []
    }

    return items
      .filter((item) => item.type === 'file')
      .map((item) => ({
        name: item.basename,
        path: item.filename,
        size: item.size,
        createdAt: item.lastmod
      }))
  }

  async deleteFile(config: WebDavConfig, remoteName: string): Promise<void> {
    const client = this.createWebDavClient(config)
    const remotePath = `${config.webdavPath}/${remoteName}`.replace(/\/+/g, '/')
    await client.deleteFile(remotePath)
  }
}

export const webDavService = new WebDavService()
