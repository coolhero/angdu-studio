export enum FileType {
  Image = 'image',
  Document = 'document',
  Audio = 'audio',
  Video = 'video',
  Archive = 'archive',
  Other = 'other'
}

export interface FileMetadata {
  name: string
  path: string
  size: number
  type: FileType
  mimeType: string
  createdAt: number
  modifiedAt: number
}
