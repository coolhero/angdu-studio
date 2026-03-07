import { useCallback } from 'react'
import type { FileMetadata } from '@shared/types/file'

interface UseFileUploadReturn {
  /** Handles a drop event by uploading each dropped file */
  handleDrop: (event: React.DragEvent) => Promise<FileMetadata[]>
  /** Handles a paste event by uploading pasted files */
  handlePaste: (event: React.ClipboardEvent) => Promise<FileMetadata[]>
  /** Opens a file select dialog and uploads selected files */
  selectAndUpload: (options?: {
    filters?: Array<{ name: string; extensions: string[] }>
  }) => Promise<FileMetadata[]>
}

/**
 * Hook for handling file uploads via drag-and-drop, paste, and dialog.
 * Calls the file:save IPC to persist files to the main process.
 */
export function useFileUpload(): UseFileUploadReturn {
  const handleDrop = useCallback(async (event: React.DragEvent): Promise<FileMetadata[]> => {
    event.preventDefault()
    event.stopPropagation()

    const files = Array.from(event.dataTransfer.files)
    if (files.length === 0) return []

    const results: FileMetadata[] = []
    for (const file of files) {
      // Read file content and save via IPC
      const buffer = await file.arrayBuffer()
      const data = new Uint8Array(buffer)
      const path = file.name
      await window.api.saveFile(path, data)
      const metadata = await window.api.getFileMetadata(path)
      results.push(metadata)
    }

    return results
  }, [])

  const handlePaste = useCallback(async (event: React.ClipboardEvent): Promise<FileMetadata[]> => {
    const files = Array.from(event.clipboardData.files)
    if (files.length === 0) return []

    const results: FileMetadata[] = []
    for (const file of files) {
      const buffer = await file.arrayBuffer()
      const data = new Uint8Array(buffer)
      const path = file.name
      await window.api.saveFile(path, data)
      const metadata = await window.api.getFileMetadata(path)
      results.push(metadata)
    }

    return results
  }, [])

  const selectAndUpload = useCallback(
    async (
      options?: { filters?: Array<{ name: string; extensions: string[] }> }
    ): Promise<FileMetadata[]> => {
      const filePaths = await window.api.selectFile(options)
      if (!filePaths) return []

      const results: FileMetadata[] = []
      for (const filePath of filePaths) {
        const metadata = await window.api.getFileMetadata(filePath)
        results.push(metadata)
      }

      return results
    },
    []
  )

  return { handleDrop, handlePaste, selectAndUpload }
}
