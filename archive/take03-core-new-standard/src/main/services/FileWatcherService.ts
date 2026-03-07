import { watch, type FSWatcher } from 'chokidar'
import { BrowserWindow } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import { FILE_WATCHER_STABILITY_THRESHOLD_MS } from '@shared/constants'
import type { WatcherConfig, FileChangeEvent } from '@shared/types'

export class FileWatcherService {
  private watchers = new Map<string, FSWatcher>()
  private debounceTimers = new Map<string, NodeJS.Timeout>()

  startWatcher(watcherId: string, config: WatcherConfig): void {
    // Stop existing watcher with same ID
    if (this.watchers.has(watcherId)) {
      this.stopWatcher(watcherId)
    }

    const watcher = watch(config.path, {
      ignoreInitial: true,
      ignored: config.ignorePatterns,
      awaitWriteFinish: {
        stabilityThreshold: config.stabilityThresholdMs ?? FILE_WATCHER_STABILITY_THRESHOLD_MS,
        pollInterval: 100
      }
    })

    const debounceMs = config.debounceMs ?? 1000

    const emitChange = (type: FileChangeEvent['type'], path: string) => {
      const key = `${watcherId}:${path}`
      const existing = this.debounceTimers.get(key)
      if (existing) clearTimeout(existing)

      this.debounceTimers.set(
        key,
        setTimeout(() => {
          this.debounceTimers.delete(key)
          const event: FileChangeEvent = { watcherId, type, path }
          this.broadcastChange(event)
        }, debounceMs)
      )
    }

    watcher
      .on('add', (path) => emitChange('add', path))
      .on('change', (path) => emitChange('change', path))
      .on('unlink', (path) => emitChange('unlink', path))
      .on('error', (error) => {
        console.error(`File watcher ${watcherId} error:`, error)
        // Retry: restart watcher on error
        setTimeout(() => {
          if (this.watchers.has(watcherId)) {
            this.stopWatcher(watcherId)
            this.startWatcher(watcherId, config)
          }
        }, 5000)
      })

    this.watchers.set(watcherId, watcher)
  }

  async stopWatcher(watcherId: string): Promise<void> {
    const watcher = this.watchers.get(watcherId)
    if (watcher) {
      await watcher.close()
      this.watchers.delete(watcherId)
    }

    // Clear any pending debounce timers for this watcher
    for (const [key, timer] of this.debounceTimers) {
      if (key.startsWith(`${watcherId}:`)) {
        clearTimeout(timer)
        this.debounceTimers.delete(key)
      }
    }
  }

  async stopAll(): Promise<void> {
    for (const watcherId of this.watchers.keys()) {
      await this.stopWatcher(watcherId)
    }
  }

  private broadcastChange(event: FileChangeEvent): void {
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) {
        win.webContents.send(IpcChannel.File_OnChange, event)
      }
    }
  }
}
