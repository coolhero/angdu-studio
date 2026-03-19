import type { Model } from './provider'

// --- Item Type ---
export type ItemType = 'file' | 'directory' | 'url' | 'sitemap' | 'note' | 'video'

// --- Item Status ---
export type ItemStatus = 'pending' | 'processing' | 'completed' | 'failed'

// --- Preprocessor Provider Type ---
export type PreprocessProviderType = 'default' | 'openai' | 'custom'

// --- Knowledge Item ---
export interface KnowledgeItem {
  id: string
  baseId: string
  type: ItemType
  content: string
  status: ItemStatus
  progress: number
  error?: string
  retryCount: number
  uniqueId?: string
  remark?: string
  created_at: string
  updated_at: string
}

// --- Knowledge Base ---
export interface KnowledgeBase {
  id: string
  name: string
  model: Model
  dimensions?: number
  items: KnowledgeItem[]
  documentCount: number
  chunkSize?: number
  chunkOverlap?: number
  threshold?: number
  rerankModel?: Model
  preprocessProvider?: PreprocessProviderType
  version: number
  created_at: string
  updated_at: string
}

// --- Memory Item ---
export interface MemoryItem {
  id: string
  userId: string
  content: string
  hash: string
  embedding?: number[]
  metadata?: Record<string, unknown>
  score?: number
  created_at: string
  updated_at: string
}

// --- Memory Config ---
export interface MemoryConfig {
  embeddingModel?: Model
  llmModel?: Model
  dimensions?: number
  customFactExtractionPrompt?: string
  enabled: boolean
}

// --- Memory History Operation ---
export type MemoryHistoryOperation = 'ADD' | 'UPDATE' | 'DELETE'

// --- Memory History Item ---
export interface MemoryHistoryItem {
  id: string
  memoryId: string
  operation: MemoryHistoryOperation
  previousContent?: string
  newContent?: string
  timestamp: string
}

// --- Knowledge Reference ---
export interface KnowledgeReference {
  refNumber: number
  originalRefNumber: number
  sourceFile: string
  content: string
  similarity: number
  kbId: string
  kbName: string
}

// --- Save To Knowledge Request ---
export interface SaveToKnowledgeRequest {
  sourceType: string
  sourceId: string
  contentTypes: string[]
  targetKBId: string
}

// --- Vector Record (used by VectorStore) ---
export interface VectorRecord {
  id: string
  kb_id: string
  item_id: string
  content: string
  metadata: string
  embedding: Buffer
  created_at: number
}

// --- Defaults ---
export const KNOWLEDGE_DEFAULTS = {
  documentCount: 6,
  threshold: 0.3,
  chunkSize: 1000,
  chunkOverlap: 200
} as const
