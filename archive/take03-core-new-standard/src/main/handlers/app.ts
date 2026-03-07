import { app } from 'electron'
import { cpus, totalmem, freemem, hostname, platform, arch, release } from 'os'
import { IpcChannel } from '@shared/IpcChannel'
import type { AppInfo, SystemInfo } from '@shared/types'
import { registerHandlers } from '../ipc'
import { isPortable } from '../utils/platform'
import { getUserDataPath, getLogsPath, getTempPath, getDownloadsPath } from '../utils/paths'

export function registerAppHandlers(): void {
  registerHandlers([
    [
      IpcChannel.App_Info,
      (): AppInfo => ({
        version: app.getVersion(),
        name: app.getName(),
        paths: {
          userData: getUserDataPath(),
          temp: getTempPath(),
          logs: getLogsPath(),
          downloads: getDownloadsPath()
        },
        platform: process.platform as 'darwin' | 'win32' | 'linux',
        arch: process.arch,
        isPortable: isPortable()
      })
    ],
    [IpcChannel.App_Quit, () => app.quit()],
    [
      IpcChannel.App_Reload,
      (event) => {
        event.sender.reload()
      }
    ],
    [
      IpcChannel.App_Relaunch,
      () => {
        app.relaunch()
        app.quit()
      }
    ],
    [
      IpcChannel.App_GetPath,
      (_event, name: unknown) => app.getPath(name as Parameters<typeof app.getPath>[0])
    ],
    [
      IpcChannel.App_GetSystemInfo,
      (): SystemInfo => ({
        cpuModel: cpus()[0]?.model ?? 'Unknown',
        cpuCores: cpus().length,
        totalMemory: totalmem(),
        freeMemory: freemem(),
        platform: platform(),
        osVersion: release(),
        arch: arch()
      })
    ],
    [
      IpcChannel.App_ClearCache,
      async (event) => {
        await event.sender.session.clearCache()
      }
    ],
    [
      IpcChannel.App_GetCacheSize,
      async (event) => {
        return event.sender.session.getCacheSize()
      }
    ]
  ])
}
