import chokidar, { type FSWatcher } from 'chokidar'
import { BrowserWindow } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import { withContext } from '../logger'

const log = withContext('file-watcher')

interface WatcherOptions {
  patterns?: string[]
  depth?: number
}

class FileWatcherService {
  private watchers = new Map<string, FSWatcher>()

  startWatcher(id: string, path: string, options: WatcherOptions = {}): void {
    if (this.watchers.has(id)) {
      log.warn(`Watcher ${id} already exists, stopping first`)
      this.stopWatcher(id)
    }

    const watcher = chokidar.watch(path, {
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      },
      depth: options.depth ?? 10,
      usePolling: false
    })

    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const notify = (event: string, filePath: string) => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send(IpcChannel.File_Changed, { id, event, path: filePath })
        })
      }, 1000)
    }

    watcher
      .on('add', (p) => notify('add', p))
      .on('change', (p) => notify('change', p))
      .on('unlink', (p) => notify('unlink', p))
      .on('error', (err) => log.error(`Watcher ${id} error: ${String(err)}`))

    this.watchers.set(id, watcher)
    log.debug(`Watcher ${id} started for ${path}`)
  }

  stopWatcher(id: string): void {
    const watcher = this.watchers.get(id)
    if (watcher) {
      watcher.close()
      this.watchers.delete(id)
      log.debug(`Watcher ${id} stopped`)
    }
  }

  stopAll(): void {
    for (const [id] of this.watchers) {
      this.stopWatcher(id)
    }
  }
}

export const fileWatcherService = new FileWatcherService()
