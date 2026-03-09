import type { InputbarScope } from '@renderer/stores/useInputToolsStore'

export interface ToolContext {
  scope: InputbarScope
  topicId: string | null
  assistantId: string | null
  isGenerating: boolean
}

export interface ToolDefinition {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  visibleInScopes: InputbarScope[]
  condition?: (ctx: ToolContext) => boolean
  render: (ctx: ToolContext) => React.ReactNode
  quickPanel?: {
    trigger: string
    component: React.ComponentType
  }
}
