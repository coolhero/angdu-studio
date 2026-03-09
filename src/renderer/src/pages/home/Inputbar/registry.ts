import type { InputbarScope } from '@renderer/stores/useInputToolsStore'
import type { ToolDefinition } from './types'

const toolRegistry = new Map<string, ToolDefinition>()

export function defineTool(def: ToolDefinition): ToolDefinition {
  return def
}

export function registerTool(tool: ToolDefinition): void {
  toolRegistry.set(tool.key, tool)
}

export function getTool(key: string): ToolDefinition | undefined {
  return toolRegistry.get(key)
}

export function getAllTools(): ToolDefinition[] {
  return Array.from(toolRegistry.values())
}

export function getToolsForScope(scope: InputbarScope): ToolDefinition[] {
  return getAllTools().filter((t) => t.visibleInScopes.includes(scope))
}
