// Knowledge Base Types (F004)

import type { FileMetadata } from './file'
import type { Model } from './provider'

// ── Enumerations ──

export type KnowledgeItemType = 'file' | 'url' | 'sitemap' | 'note' | 'directory' | 'video'

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'error'

// ── KnowledgeBase ──

export interface KnowledgeBase {
  id: string
  name: string
  model: Model
  description?: string
  documentCount: number
  chunkSize: number
  chunkOverlap: number
  items: KnowledgeItem[]
  rerankModel?: Model
  preprocessModel?: Model
  preprocessProvider?: string
  version: number
  created_at: number
  updated_at: number
}

export interface KnowledgeBaseParams {
  name: string
  model: Model
  chunkSize?: number
  chunkOverlap?: number
  documentCount?: number
}

// ── KnowledgeItem ──

export interface KnowledgeItem {
  id: string
  baseId: string
  type: KnowledgeItemType
  content: FileMetadata | string
  uniqueId?: string
  uniqueIds?: string[]
  status: ProcessingStatus
  progress: number
  error?: string
  retryCount: number
  remark?: string
  sourceUrl?: string
  isPreprocessed?: boolean
  created_at: number
  updated_at: number
}

// ── KnowledgeReference (transient search result) ──

export interface KnowledgeReference {
  id: string
  content: string
  sourceUrl?: string
  type?: string
  score?: number
  metadata?: Record<string, unknown>
}

// ── KnowledgeNote (separate storage) ──

export interface KnowledgeNote {
  id: string
  content: string
  updated_at: number
}

// ── Loader Result ──

export interface LoaderResult {
  uniqueId: string
  uniqueIds: string[]
  entriesAdded: number
}

// ── IPC Payloads ──

export interface KBItemStatusPayload {
  baseId: string
  itemId: string
  status: ProcessingStatus
  progress: number
  error?: string
}

export interface KBDirectoryProgressPayload {
  baseId: string
  itemId: string
  percent: number
}
