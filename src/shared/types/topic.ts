export interface Topic {
  id: string
  assistantId: string
  name: string
  type: 'normal' | 'pinned'
  pinned: boolean
  isNameManuallyEdited: boolean
  messageCount: number
  createdAt: string
  updatedAt: string
}
