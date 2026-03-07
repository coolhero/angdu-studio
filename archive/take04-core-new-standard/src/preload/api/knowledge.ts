import { ipcRenderer } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import type {
  KnowledgeBaseParams,
  KnowledgeItem,
  KnowledgeReference,
  KBItemStatusPayload,
  KBDirectoryProgressPayload,
  Model
} from '@shared/types'

export const knowledgeApi = {
  create: (params: KnowledgeBaseParams) => ipcRenderer.invoke(IpcChannel.KB_Create, params),

  delete: (baseId: string) => ipcRenderer.invoke(IpcChannel.KB_Delete, baseId),

  reset: (baseId: string) => ipcRenderer.invoke(IpcChannel.KB_Reset, baseId),

  addItem: (baseId: string, item: KnowledgeItem) =>
    ipcRenderer.invoke(IpcChannel.KB_AddItem, { baseId, item }),

  removeItem: (baseId: string, itemId: string) =>
    ipcRenderer.invoke(IpcChannel.KB_RemoveItem, { baseId, itemId }),

  search: (baseId: string, query: string, count?: number) =>
    ipcRenderer.invoke(IpcChannel.KB_Search, { baseId, query, count }),

  rerank: (baseId: string, query: string, results: KnowledgeReference[], model: Model) =>
    ipcRenderer.invoke(IpcChannel.KB_Rerank, { baseId, query, results, model }),

  // Event listeners (M->R) returning cleanup functions
  onItemStatus: (callback: (data: KBItemStatusPayload) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: KBItemStatusPayload) => callback(data)
    ipcRenderer.on(IpcChannel.KB_ItemStatus, handler)
    return () => ipcRenderer.removeListener(IpcChannel.KB_ItemStatus, handler)
  },

  onDirectoryProgress: (callback: (data: KBDirectoryProgressPayload) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: KBDirectoryProgressPayload) =>
      callback(data)
    ipcRenderer.on(IpcChannel.KB_DirectoryProgress, handler)
    return () => ipcRenderer.removeListener(IpcChannel.KB_DirectoryProgress, handler)
  }
}
