import { hostname, cpus, platform } from 'os'
import { IpcChannel } from '@shared/IpcChannel'
import { registerHandlers } from '../ipc'

export function registerSystemHandlers(): void {
  registerHandlers([
    [
      IpcChannel.System_GetDeviceType,
      () => {
        if (process.platform === 'darwin') return 'mac'
        if (process.platform === 'win32') return 'windows'
        return 'linux'
      }
    ],
    [IpcChannel.System_GetHostname, () => hostname()],
    [IpcChannel.System_GetCpuName, () => cpus()[0]?.model ?? 'Unknown'],
    [IpcChannel.System_GetPlatform, () => platform()]
  ])
}
