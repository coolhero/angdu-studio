import { dialog, shell } from 'electron'
import { stat } from 'fs/promises'
import { IpcChannel } from '@shared/IpcChannel'
import type { FileSelectOptions, FileSaveOptions, WatcherConfig } from '@shared/types'
import type { FileStorageService } from '../services/FileStorageService'
import type { FileWatcherService } from '../services/FileWatcherService'
import { registerHandlers } from '../ipc'

export function registerFileHandlers(
  fileService: FileStorageService,
  watcherService: FileWatcherService
): void {
  registerHandlers([
    [
      IpcChannel.File_Select,
      async (_event, options: unknown) => {
        const opts = options as FileSelectOptions
        const result = await dialog.showOpenDialog({
          filters: opts?.filters,
          properties: [
            opts?.directory ? 'openDirectory' : 'openFile',
            ...(opts?.multiple ? (['multiSelections'] as const) : [])
          ]
        })
        return result.canceled ? [] : result.filePaths
      }
    ],
    [
      IpcChannel.File_Open,
      async (_event, filePath: unknown) => {
        await shell.openPath(filePath as string)
      }
    ],
    [
      IpcChannel.File_Save,
      async (_event, options: unknown) => {
        const opts = options as FileSaveOptions
        const result = await dialog.showSaveDialog({
          defaultPath: opts?.defaultPath,
          filters: opts?.filters
        })
        if (!result.canceled && result.filePath) {
          await fileService.writeFile(result.filePath, opts.data as string)
          return result.filePath
        }
        return null
      }
    ],
    [
      IpcChannel.File_Read,
      async (_event, filePath: unknown) => {
        return fileService.readFile(filePath as string)
      }
    ],
    [
      IpcChannel.File_Write,
      async (_event, filePath: unknown, content: unknown) => {
        await fileService.writeFile(filePath as string, content as string)
      }
    ],
    [
      IpcChannel.File_Upload,
      async (_event, sourcePath: unknown) => {
        return fileService.uploadFile(sourcePath as string)
      }
    ],
    [
      IpcChannel.File_Delete,
      async (_event, filePath: unknown) => {
        await fileService.deleteFile(filePath as string)
      }
    ],
    [
      IpcChannel.File_Copy,
      async (_event, src: unknown, dest: unknown) => {
        await fileService.copyFile(src as string, dest as string)
      }
    ],
    [
      IpcChannel.File_Move,
      async (_event, src: unknown, dest: unknown) => {
        await fileService.moveFile(src as string, dest as string)
      }
    ],
    [
      IpcChannel.File_IsTextFile,
      (_event, filePath: unknown) => {
        return fileService.isTextFile(filePath as string)
      }
    ],
    [
      IpcChannel.File_IsDirectory,
      async (_event, filePath: unknown) => {
        const s = await stat(filePath as string)
        return s.isDirectory()
      }
    ],
    [
      IpcChannel.File_ListDirectory,
      async (_event, dirPath: unknown) => {
        return fileService.listDirectory(dirPath as string)
      }
    ],
    [
      IpcChannel.File_Base64Image,
      async (_event, imagePath: unknown) => {
        return fileService.imageToBase64(imagePath as string)
      }
    ],
    [
      IpcChannel.File_StartWatcher,
      (_event, watcherId: unknown, config: unknown) => {
        watcherService.startWatcher(watcherId as string, config as WatcherConfig)
      }
    ],
    [
      IpcChannel.File_StopWatcher,
      async (_event, watcherId: unknown) => {
        await watcherService.stopWatcher(watcherId as string)
      }
    ]
  ])
}
