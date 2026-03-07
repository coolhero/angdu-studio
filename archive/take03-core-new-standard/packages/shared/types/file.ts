export type FileType = 'image' | 'video' | 'audio' | 'document' | 'text' | 'code' | 'archive' | 'other'

export interface FileMetadata {
  id: string
  name: string
  origin_name: string
  path: string
  size: number
  ext: string
  type: FileType
  created_at: number
  count?: number
  tokens?: number
  purpose?: string
}

export interface FileSelectOptions {
  filters?: { name: string; extensions: string[] }[]
  multiple?: boolean
  directory?: boolean
}

export interface FileSaveOptions {
  defaultPath?: string
  filters?: { name: string; extensions: string[] }[]
  data: string | Buffer
}

export interface DirectoryListOptions {
  path: string
  recursive?: boolean
  maxDepth?: number
  includeHidden?: boolean
  pattern?: string
  maxEntries?: number
}

export interface FileEntry {
  name: string
  path: string
  isDirectory: boolean
  size?: number
  modifiedAt?: number
}

export interface TreeNode {
  name: string
  path: string
  isDirectory: boolean
  children?: TreeNode[]
}

export interface WatcherConfig {
  path: string
  extensions?: string[]
  ignorePatterns?: string[]
  debounceMs?: number
  stabilityThresholdMs?: number
}

export interface FileChangeEvent {
  watcherId: string
  type: 'add' | 'change' | 'unlink'
  path: string
}

export interface PdfInfo {
  pageCount: number
  title?: string
  author?: string
}
