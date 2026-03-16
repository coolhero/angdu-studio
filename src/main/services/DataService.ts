import { app } from 'electron'
import JSZip from 'jszip'
import { configService } from './ConfigService'
import { logger } from './LoggerService'
import { CURRENT_SCHEMA_VERSION } from '@shared/types/config'
import type { ExportManifest } from '@shared/types/settings'

class DataService {
  private static instance: DataService | null = null

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService()
    }
    return DataService.instance
  }

  /**
   * Export all config data as a zip buffer containing manifest.json + config.json.
   */
  async exportData(_includeDocs = false): Promise<Buffer> {
    const config = configService.getAll()
    const manifest: ExportManifest = {
      version: app.getVersion(),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      platform: process.platform,
      features: ['config']
    }

    const zip = new JSZip()
    zip.file('manifest.json', JSON.stringify(manifest, null, 2))
    zip.file('config.json', JSON.stringify(config, null, 2))

    const buffer = await zip.generateAsync({ type: 'nodebuffer' })
    logger.info('[DataService] Data exported successfully')
    return buffer
  }

  /**
   * Import config data from a zip buffer.
   * Validates schema version before restoring.
   */
  async importData(zipBuffer: ArrayBuffer): Promise<void> {
    const zip = await JSZip.loadAsync(zipBuffer)

    // Read and validate manifest
    const manifestFile = zip.file('manifest.json')
    if (!manifestFile) {
      throw new Error('Invalid backup: missing manifest.json')
    }
    const manifestJson = await manifestFile.async('string')
    const manifest = JSON.parse(manifestJson) as ExportManifest

    if (manifest.schemaVersion > CURRENT_SCHEMA_VERSION) {
      throw new Error(
        `Backup schema version (${manifest.schemaVersion}) is newer than current (${CURRENT_SCHEMA_VERSION}). Please update the app first.`
      )
    }

    // Read and restore config
    const configFile = zip.file('config.json')
    if (!configFile) {
      throw new Error('Invalid backup: missing config.json')
    }
    const configJson = await configFile.async('string')
    const config = JSON.parse(configJson)

    // Restore each key individually so validation runs
    for (const [key, value] of Object.entries(config)) {
      try {
        configService.set(key as never, value as never)
      } catch (err) {
        logger.warn(`[DataService] Skipping invalid key "${key}" during import`, err)
      }
    }

    logger.info('[DataService] Data imported successfully')
  }

  /**
   * Clear all config data, resetting to defaults.
   */
  clearData(): void {
    configService.reset()
    logger.info('[DataService] All data cleared')
  }

  /**
   * Get the storage path for the app's user data.
   */
  getStoragePath(): string {
    return app.getPath('userData')
  }
}

export const dataService = DataService.getInstance()
