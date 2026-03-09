import { useState, useCallback } from 'react'
import { ErrorBoundary } from '@renderer/components/ErrorBoundary'
import { useRuntimeStore } from '@renderer/stores/useRuntimeStore'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import {
  Upload,
  Download,
  FolderOpen,
  ChevronRight,
  ArrowLeft
} from 'lucide-react'

type FileTypeFilter = 'all' | 'image' | 'video' | 'audio' | 'text' | 'document'

interface FileEntry {
  id: string
  name: string
  size: number
  type: string
  ext: string
  created_at: string
}

interface BreadcrumbSegment {
  name: string
  path: string
}

function FilesPageContent(): JSX.Element {
  const [files] = useState<FileEntry[]>([])
  const [typeFilter, setTypeFilter] = useState<FileTypeFilter>('all')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [breadcrumbs] = useState<BreadcrumbSegment[]>([
    { name: 'Home', path: '/' }
  ])

  const handleUpload = useCallback(() => {
    // TODO: trigger file:select IPC
    // window.api.selectFile()
    console.log('Upload clicked — awaiting IPC implementation')
  }, [])

  const handleDownloadFromUrl = useCallback(() => {
    if (!downloadUrl.trim()) return
    // TODO: trigger file download IPC
    // window.api.downloadFile(downloadUrl.trim())
    console.log('Download from URL:', downloadUrl.trim())
    setDownloadUrl('')
  }, [downloadUrl])

  const handleRename = useCallback((_id: string, _newName: string) => {
    // TODO: call useFileManager hook
    console.log('Rename:', _id, _newName)
  }, [])

  const handleDelete = useCallback((_id: string) => {
    // TODO: call useFileManager hook
    console.log('Delete:', _id)
  }, [])

  const handleShowInFolder = useCallback((_id: string) => {
    // TODO: call useFileManager hook / IPC
    console.log('Show in folder:', _id)
  }, [])

  const handleBreadcrumbClick = useCallback((_path: string) => {
    // TODO: navigate to directory
    console.log('Navigate to:', _path)
  }, [])

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
  }

  const filteredFiles = typeFilter === 'all'
    ? files
    : files.filter((f) => f.type === typeFilter)

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => useRuntimeStore.getState().setActivePage('chat')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Files</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleUpload}>
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 px-6 py-3 dark:border-zinc-700">
        {/* Download from URL */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Download from URL..."
            value={downloadUrl}
            onChange={(e) => setDownloadUrl(e.target.value)}
            className="h-8 w-64"
            onKeyDown={(e) => { if (e.key === 'Enter') handleDownloadFromUrl() }}
          />
          <Button size="sm" variant="outline" onClick={handleDownloadFromUrl} disabled={!downloadUrl.trim()}>
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as FileTypeFilter)}
          className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="all">All types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="audio">Audio</option>
          <option value="text">Text</option>
          <option value="document">Documents</option>
        </select>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 border-b border-zinc-200 px-6 py-2 dark:border-zinc-700">
        <FolderOpen className="h-4 w-4 text-zinc-400" />
        {breadcrumbs.map((segment, index) => (
          <div key={segment.path} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-3 w-3 text-zinc-400" />}
            <button
              type="button"
              onClick={() => handleBreadcrumbClick(segment.path)}
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {segment.name}
            </button>
          </div>
        ))}
      </div>

      {/* File list */}
      <div className="flex-1 overflow-auto">
        {/* Table header */}
        <div className="sticky top-0 grid grid-cols-[1fr_100px_100px_140px_120px] gap-2 border-b border-zinc-200 bg-zinc-50 px-6 py-2 text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
          <span>Name</span>
          <span>Size</span>
          <span>Type</span>
          <span>Date</span>
          <span>Actions</span>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-zinc-400">No files found. Upload a file to get started.</p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              className="grid grid-cols-[1fr_100px_100px_140px_120px] items-center gap-2 border-b border-zinc-100 px-6 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
            >
              <span className="truncate font-medium">{file.name}</span>
              <span className="text-zinc-500">{formatSize(file.size)}</span>
              <span className="text-zinc-500">{file.ext}</span>
              <span className="text-zinc-500">{new Date(file.created_at).toLocaleDateString()}</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    const newName = window.prompt('Rename file:', file.name)
                    if (newName && newName !== file.name) handleRename(file.id, newName)
                  }}
                >
                  Rename
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-red-500"
                  onClick={() => handleDelete(file.id)}
                >
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleShowInFolder(file.id)}
                >
                  <FolderOpen className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function FilesPage(): JSX.Element {
  return (
    <ErrorBoundary>
      <FilesPageContent />
    </ErrorBoundary>
  )
}
