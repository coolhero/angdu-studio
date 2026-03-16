import { ipcMain } from 'electron'
import { dataService } from '../services/DataService'

export function registerDataHandlers(): void {
  ipcMain.handle('data:export', (_event, includeDocs?: boolean) => {
    return dataService.exportData(includeDocs)
  })

  ipcMain.handle('data:import', (_event, zipBuffer: ArrayBuffer) => {
    return dataService.importData(zipBuffer)
  })

  ipcMain.handle('data:clear', () => {
    return dataService.clearData()
  })

  ipcMain.handle('data:getStoragePath', () => {
    return dataService.getStoragePath()
  })
}
