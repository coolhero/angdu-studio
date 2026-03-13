import { existsSync, mkdirSync } from 'fs'
import { getDataDir, getFilesDir } from './config'

export function initAppDataDir(): void {
  const dirs = [getDataDir(), getFilesDir()]
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
  }
}
