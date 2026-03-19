import { statSync } from 'node:fs'
import { basename, extname } from 'node:path'
import { logger } from '../services/LoggerService'

/**
 * Video metadata extracted from file.
 * Transcript extraction is a complex task requiring external tools/services,
 * so this is a stub that returns available file metadata.
 */
export interface VideoMetadata {
  fileName: string
  extension: string
  sizeBytes: number
  transcript: string | null
}

const SUPPORTED_VIDEO_EXTENSIONS = new Set([
  '.mp4',
  '.mkv',
  '.avi',
  '.mov',
  '.webm',
  '.flv',
  '.wmv',
  '.m4v'
])

/**
 * Load video metadata. Transcript extraction is not yet implemented
 * (requires integration with speech-to-text services).
 */
export function loadVideo(filePath: string): VideoMetadata {
  const ext = extname(filePath).toLowerCase()

  if (!SUPPORTED_VIDEO_EXTENSIONS.has(ext)) {
    throw new Error(`Unsupported video extension: ${ext}. Supported: ${[...SUPPORTED_VIDEO_EXTENSIONS].join(', ')}`)
  }

  const stats = statSync(filePath)

  logger.info(`[VideoLoader] Loaded metadata for ${filePath} (${stats.size} bytes)`)

  return {
    fileName: basename(filePath),
    extension: ext,
    sizeBytes: stats.size,
    transcript: null // Placeholder — requires speech-to-text integration
  }
}
