import { useState, useCallback } from 'react'
import type { FileMetadata } from '@shared/types'

interface UseFileUploadReturn {
  upload: () => Promise<FileMetadata | null>
  uploading: boolean
  error: string | null
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(async (): Promise<FileMetadata | null> => {
    setError(null)
    setUploading(true)

    try {
      const result = await window.api?.file?.open({
        properties: ['openFile']
      })

      if (result?.canceled || !result?.filePaths?.length) {
        setUploading(false)
        return null
      }

      const filePath = result.filePaths[0]
      const metadata = await window.api?.file?.upload(filePath)

      setUploading(false)
      return metadata as FileMetadata
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      setUploading(false)
      return null
    }
  }, [])

  return { upload, uploading, error }
}
