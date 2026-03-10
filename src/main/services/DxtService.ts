// ── F006: DXT Package Management Service ──

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import AdmZip from 'adm-zip'
import { app } from 'electron'

// ── Types ──

export interface DxtManifest {
  dxt_version: string
  name: string
  display_name?: string
  version: string
  description?: string
  author?: {
    name?: string
    email?: string
    url?: string
  }
  server: {
    type: string
    entry_point: string
    mcp_config: {
      command: string
      args: string[]
      env?: Record<string, string>
      platform_overrides?: {
        [platform: string]: {
          command?: string
          args?: string[]
          env?: Record<string, string>
        }
      }
    }
  }
  tools?: Array<{ name: string; description: string }>
  keywords?: string[]
  license?: string
  user_config?: Record<string, unknown>
}

export interface DxtUploadResult {
  success: boolean
  data?: {
    manifest: DxtManifest
    extractDir: string
  }
  error?: string
}

export interface ResolvedMcpConfig {
  command: string
  args: string[]
  env?: Record<string, string>
}

// ── Path traversal prevention ──

export function ensurePathWithin(basePath: string, targetPath: string): string {
  const resolvedBase = path.resolve(basePath)
  const resolvedTarget = path.resolve(path.normalize(targetPath))

  if (!resolvedTarget.startsWith(resolvedBase + path.sep) && resolvedTarget !== resolvedBase) {
    throw new Error('Path traversal detected: target path escapes base directory')
  }

  return resolvedTarget
}

// ── Command validation ──

export function validateCommand(command: string): string {
  if (!command || typeof command !== 'string') {
    throw new Error('Invalid command: command must be a non-empty string')
  }

  const trimmed = command.trim()
  if (!trimmed) {
    throw new Error('Invalid command: command cannot be empty')
  }

  if (/(?:^|[/\\])\.\.(?:[/\\]|$)/.test(trimmed) || trimmed === '..') {
    throw new Error(`Invalid command: path traversal detected in "${command}"`)
  }

  if (trimmed.includes('\0')) {
    throw new Error('Invalid command: null byte detected')
  }

  return trimmed
}

// ── Variable substitution ──

export function performVariableSubstitution(
  value: string,
  extractDir: string,
  userConfig?: Record<string, unknown>
): string {
  let result = value

  result = result.replace(/\$\{__dirname\}/g, extractDir)
  result = result.replace(/\$\{HOME\}/g, os.homedir())
  result = result.replace(/\$\{DESKTOP\}/g, path.join(os.homedir(), 'Desktop'))
  result = result.replace(/\$\{DOCUMENTS\}/g, path.join(os.homedir(), 'Documents'))
  result = result.replace(/\$\{DOWNLOADS\}/g, path.join(os.homedir(), 'Downloads'))
  result = result.replace(/\$\{pathSeparator\}/g, path.sep)
  result = result.replace(/\$\{\/\}/g, path.sep)

  if (userConfig) {
    result = result.replace(/\$\{user_config\.([^}]+)\}/g, (match, key) => {
      const val = userConfig[key]
      return typeof val === 'string' ? val : match
    })
  }

  return result
}

// ── Platform overrides ──

export function applyPlatformOverrides(
  mcpConfig: DxtManifest['server']['mcp_config'],
  extractDir: string,
  userConfig?: Record<string, unknown>
): ResolvedMcpConfig {
  const platform = process.platform
  const resolved = { ...mcpConfig }

  if (mcpConfig.platform_overrides?.[platform]) {
    const override = mcpConfig.platform_overrides[platform]
    if (override.command) resolved.command = override.command
    if (override.args) resolved.args = override.args
    if (override.env) resolved.env = { ...resolved.env, ...override.env }
  }

  if (resolved.command) {
    resolved.command = validateCommand(
      performVariableSubstitution(resolved.command, extractDir, userConfig)
    )
  }

  if (resolved.args) {
    resolved.args = resolved.args.map((arg) =>
      performVariableSubstitution(arg, extractDir, userConfig)
    )
  }

  if (resolved.env) {
    for (const [key, value] of Object.entries(resolved.env)) {
      resolved.env[key] = performVariableSubstitution(value, extractDir, userConfig)
    }
  }

  return {
    command: resolved.command,
    args: resolved.args,
    env: resolved.env
  }
}

// ── DxtService ──

class DxtService {
  private dxtDir: string

  constructor() {
    this.dxtDir = path.join(app.getPath('userData'), 'dxt')
    this.ensureDirectories()
  }

  private ensureDirectories(): void {
    try {
      if (!fs.existsSync(this.dxtDir)) {
        fs.mkdirSync(this.dxtDir, { recursive: true })
      }
    } catch (error) {
      console.error('[DxtService] Failed to create dxt directory:', error)
    }
  }

  /**
   * Upload and install a DXT package from a buffer.
   */
  async uploadDxt(
    _: Electron.IpcMainInvokeEvent,
    { buffer, fileName }: { buffer: ArrayBuffer; fileName: string }
  ): Promise<DxtUploadResult> {
    let tempExtractDir: string | null = null

    try {
      // Extract the DXT (zip) archive
      const zip = new AdmZip(Buffer.from(buffer))
      tempExtractDir = path.join(this.dxtDir, `_tmp_${Date.now()}`)
      this.extractDxt(zip, tempExtractDir)

      // Validate manifest
      const manifestPath = path.join(tempExtractDir, 'manifest.json')
      const manifest = this.validateManifest(manifestPath)

      // Move to final directory
      const serverDirName = `server-${manifest.name}`
      const finalDir = ensurePathWithin(this.dxtDir, path.join(this.dxtDir, serverDirName))

      // Remove existing version
      if (fs.existsSync(finalDir)) {
        fs.rmSync(finalDir, { recursive: true, force: true })
      }

      fs.renameSync(tempExtractDir, finalDir)
      tempExtractDir = null

      console.debug(`[DxtService] Installed DXT package "${manifest.name}" to ${finalDir}`)

      return {
        success: true,
        data: { manifest, extractDir: finalDir }
      }
    } catch (error) {
      // Cleanup temp dir on error
      if (tempExtractDir && fs.existsSync(tempExtractDir)) {
        fs.rmSync(tempExtractDir, { recursive: true, force: true })
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to process DXT file'
      console.error('[DxtService] Upload error:', error)

      return { success: false, error: errorMessage }
    }
  }

  /**
   * Extract a zip to a target directory with path traversal prevention.
   */
  private extractDxt(zip: AdmZip, targetDir: string): void {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    for (const entry of zip.getEntries()) {
      const entryPath = path.join(targetDir, entry.entryName)

      // Path traversal prevention
      ensurePathWithin(targetDir, entryPath)

      if (entry.isDirectory) {
        fs.mkdirSync(entryPath, { recursive: true })
      } else {
        const dir = path.dirname(entryPath)
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }
        fs.writeFileSync(entryPath, entry.getData())
      }
    }
  }

  /**
   * Validate a manifest.json file and return the parsed manifest.
   */
  private validateManifest(manifestPath: string): DxtManifest {
    if (!fs.existsSync(manifestPath)) {
      throw new Error('manifest.json not found in DXT package')
    }

    const content = fs.readFileSync(manifestPath, 'utf-8')
    const manifest: DxtManifest = JSON.parse(content)

    if (!manifest.name) throw new Error('Invalid manifest: missing name')
    if (!manifest.version) throw new Error('Invalid manifest: missing version')
    if (!manifest.server?.mcp_config?.command) {
      throw new Error('Invalid manifest: missing server.mcp_config.command')
    }

    return manifest
  }

  /**
   * Get resolved MCP config for a DXT server with platform overrides.
   */
  getResolvedMcpConfig(dxtPath: string, userConfig?: Record<string, unknown>): ResolvedMcpConfig | null {
    try {
      const manifestPath = path.join(dxtPath, 'manifest.json')
      if (!fs.existsSync(manifestPath)) {
        console.error(`[DxtService] Manifest not found: ${manifestPath}`)
        return null
      }

      const content = fs.readFileSync(manifestPath, 'utf-8')
      const manifest: DxtManifest = JSON.parse(content)

      if (!manifest.server?.mcp_config) {
        console.error('[DxtService] No mcp_config found in manifest')
        return null
      }

      return applyPlatformOverrides(manifest.server.mcp_config, dxtPath, userConfig)
    } catch (error) {
      console.error('[DxtService] Failed to resolve MCP config:', error)
      return null
    }
  }

  /**
   * Remove a DXT server's extracted files.
   */
  removeDxt(serverName: string): boolean {
    try {
      const serverDirName = `server-${serverName}`
      const serverDir = ensurePathWithin(this.dxtDir, path.join(this.dxtDir, serverDirName))

      if (fs.existsSync(serverDir)) {
        fs.rmSync(serverDir, { recursive: true, force: true })
        console.debug(`[DxtService] Removed DXT server: ${serverName}`)
        return true
      }

      console.warn(`[DxtService] Server directory not found: ${serverDir}`)
      return false
    } catch (error) {
      console.error('[DxtService] Failed to remove DXT server:', error)
      return false
    }
  }
}

export const dxtService = new DxtService()
export default dxtService
