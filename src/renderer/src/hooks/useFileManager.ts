import { useCallback } from 'react'

// ── Local Types ──

export interface FileMetadata {
  id: string
  name: string
  path: string
  size: number
  mimeType: string
  createdAt: number
  modifiedAt: number
}

export interface DirectoryEntry {
  name: string
  path: string
  isDirectory: boolean
  size: number
  modifiedAt: number
}

export interface FileFilter {
  name: string
  extensions: string[]
}

/**
 * Hook providing file CRUD operations via IPC.
 *
 * Calls `window.api.file.*` methods exposed through the preload bridge.
 * These preload bindings will be added in the F004 preload update.
 */
export function useFileManager() {
  const uploadFile = useCallback(async (filePath: string): Promise<FileMetadata> => {
    return window.api.file.upload(filePath)
  }, [])

  const readFile = useCallback(async (id: string): Promise<ArrayBuffer> => {
    return window.api.file.read(id)
  }, [])

  const deleteFile = useCallback(async (id: string, path: string): Promise<void> => {
    return window.api.file.delete(id, path)
  }, [])

  const renameFile = useCallback(async (path: string, newName: string): Promise<void> => {
    return window.api.file.rename(path, newName)
  }, [])

  const moveFile = useCallback(async (from: string, to: string): Promise<void> => {
    return window.api.file.move(from, to)
  }, [])

  const downloadFile = useCallback(async (url: string): Promise<string> => {
    return window.api.file.download(url)
  }, [])

  const selectFiles = useCallback(
    async (filters?: FileFilter[], multiple?: boolean): Promise<string[]> => {
      return window.api.file.select(filters, multiple)
    },
    []
  )

  const selectFolder = useCallback(async (): Promise<string | undefined> => {
    return window.api.file.selectFolder()
  }, [])

  const listDirectory = useCallback(async (path: string): Promise<DirectoryEntry[]> => {
    return window.api.file.listDirectory(path)
  }, [])

  return {
    uploadFile,
    readFile,
    deleteFile,
    renameFile,
    moveFile,
    downloadFile,
    selectFiles,
    selectFolder,
    listDirectory
  }
}
