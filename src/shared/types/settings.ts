/**
 * Shared type definitions for F004-settings-data.
 *
 * ThemeMode, ProxyMode, and ProxyConfig live in `src/shared/types.ts` and are
 * re-exported here for convenience so consumers can import from a single path.
 */

import type { ProxyConfig, ProxyMode } from '../types'
import { ThemeMode } from '../types'

// ── Re-exports ──────────────────────────────────────────────────────────────
export { ThemeMode }
export type { ProxyMode, ProxyConfig }

// ── FileType ────────────────────────────────────────────────────────────────

export enum FileType {
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Text = 'text',
  Document = 'document',
  Other = 'other'
}

// ── FileMetadata ────────────────────────────────────────────────────────────

export interface FileMetadata {
  /** Unique id (nanoid) */
  id: string
  /** Display name */
  name: string
  /** Original file name at upload time */
  origin_name: string
  /** Resolved storage path */
  path: string
  /** File size in bytes */
  size: number
  /** File extension without leading dot, e.g. "png" */
  ext: string
  /** Classified file type */
  type: FileType
  /** ISO-8601 creation timestamp */
  created_at: string
  /** Reference / usage count */
  count: number
  /** Token count (for text-like files) */
  tokens?: number
  /** Optional purpose tag (e.g. "avatar", "attachment") */
  purpose?: string
}

// ── Input / UI preference types ─────────────────────────────────────────────

export type SendMessageShortcut =
  | 'Enter'
  | 'Shift+Enter'
  | 'Ctrl+Enter'
  | 'Meta+Enter'
  | 'Alt+Enter'

export type TopicPosition = 'left' | 'right'

export type WindowStyle = 'default' | 'transparent'

// ── Sidebar ─────────────────────────────────────────────────────────────────

export interface SidebarIcon {
  /** Unique identifier */
  id: string
  /** Lucide icon name */
  icon: string
  /** Whether the item is shown in the sidebar */
  visible: boolean
  /** Sort order (ascending) */
  order: number
}

// ── Quick phrases ───────────────────────────────────────────────────────────

export interface QuickPhrase {
  /** Unique id (nanoid) */
  id: string
  /** Short label shown in the picker */
  label: string
  /** Full text to insert */
  text: string
}

// ── Mini-apps ───────────────────────────────────────────────────────────────

export interface MiniApp {
  /** Unique id (nanoid) */
  id: string
  /** Display name */
  name: string
  /** URL to load */
  url: string
  /** Optional Lucide icon name or image URL */
  icon?: string
  /** Sort order (ascending) */
  order: number
}

// ── Shortcuts ───────────────────────────────────────────────────────────────

export interface Shortcut {
  /** Unique id (nanoid) */
  id: string
  /** Human-readable shortcut name */
  name: string
  /** Key combination, e.g. "Ctrl+Shift+P" */
  keys: string
  /** Action identifier to dispatch */
  action: string
}

// ── Backup / Sync configs ───────────────────────────────────────────────────

export interface WebDavConfig {
  webdavUrl: string
  webdavUsername: string
  webdavPassword: string
  webdavPath: string
}

export interface S3Config {
  s3Bucket: string
  s3Region: string
  s3AccessKeyId: string
  s3SecretAccessKey: string
  s3Endpoint?: string
}

export interface BackupFileInfo {
  name: string
  path: string
  /** Size in bytes */
  size: number
  /** ISO-8601 timestamp */
  createdAt: string
}

export interface DirectoryEntry {
  name: string
  path: string
  isDirectory: boolean
  /** Size in bytes (0 for directories) */
  size: number
  /** ISO-8601 timestamp */
  modifiedAt: string
}

export interface BackupProgress {
  /** 0-100 */
  percent: number
  /** Human-readable stage description */
  stage: string
}

// ── Default sidebar icons ───────────────────────────────────────────────────

export const DEFAULT_SIDEBAR_ICONS: SidebarIcon[] = [
  { id: 'chat', icon: 'MessageSquare', visible: true, order: 0 },
  { id: 'assistants', icon: 'Users', visible: true, order: 1 },
  { id: 'settings', icon: 'Settings', visible: true, order: 2 },
  { id: 'files', icon: 'FolderOpen', visible: true, order: 3 },
  { id: 'minapps', icon: 'Grid', visible: true, order: 4 }
]
