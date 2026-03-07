export enum FileType {
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Document = 'document',
  Text = 'text',
  Code = 'code',
  Archive = 'archive',
  Other = 'other'
}

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
