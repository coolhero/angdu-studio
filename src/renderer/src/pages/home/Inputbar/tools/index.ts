import {
  Paperclip,
  Globe,
  BookOpen,
  Wrench,
  AtSign,
  Brain,
  ImagePlus,
  Plus,
  RefreshCw,
  Trash2,
  Maximize2,
  Minimize2,
  Slash,
  MessageSquare,
  FolderOpen,
  Link,
  Layout,
} from 'lucide-react'
import React from 'react'
import { defineTool, registerTool } from '../registry'
import { eventService, ChatEvent } from '@renderer/services/EventService'
import { useMCPStore } from '@renderer/stores/useMCPStore'
import type { ToolContext, ToolDefinition } from '../types'

// ── Helper: creates a simple icon-button tool ──

function makeSimpleTool(
  key: string,
  label: string,
  icon: React.ComponentType<{ className?: string }>,
  scopes: ToolContext['scope'][] = ['chat', 'session', 'mini'],
  onClick?: (ctx: ToolContext) => void
): ToolDefinition {
  return defineTool({
    key,
    label,
    icon,
    visibleInScopes: scopes,
    render: () => null, // uses default icon button rendering
  })
}

// ── T062: 18 input tool definitions ──

const attachmentTool = defineTool({
  key: 'attachment',
  label: 'Attachment',
  icon: Paperclip,
  visibleInScopes: ['chat', 'session', 'mini'],
  render: () => null,
})

const webSearchTool = defineTool({
  key: 'webSearch',
  label: 'Web Search',
  icon: Globe,
  visibleInScopes: ['chat', 'session'],
  render: () => null,
})

const knowledgeBaseTool = defineTool({
  key: 'knowledgeBase',
  label: 'Knowledge Base',
  icon: BookOpen,
  visibleInScopes: ['chat', 'session'],
  render: () => null,
})

function McpToolsButton(): React.ReactElement {
  const mcpEnabled = useMCPStore((s) => s.mcpEnabled)
  const toggleMcpEnabled = useMCPStore((s) => s.toggleMcpEnabled)
  const activeCount = useMCPStore((s) => s.servers.filter((sv) => sv.isActive).length)

  return React.createElement('button', {
    type: 'button',
    title: `MCP Tools${mcpEnabled ? ` (${activeCount} active)` : ''}`,
    onClick: toggleMcpEnabled,
    className: [
      'flex h-7 w-7 items-center justify-center rounded transition-colors',
      mcpEnabled
        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200',
    ].join(' '),
    children: React.createElement(Wrench, { className: 'h-4 w-4' }),
  })
}

const mcpToolsTool = defineTool({
  key: 'mcpTools',
  label: 'MCP Tools',
  icon: Wrench,
  visibleInScopes: ['chat', 'session'],
  render: () => React.createElement(McpToolsButton),
})

const mentionModelsTool = defineTool({
  key: 'mentionModels',
  label: 'Mention Models',
  icon: AtSign,
  visibleInScopes: ['chat', 'session', 'mini'],
  render: () => null,
})

const thinkingTool = defineTool({
  key: 'thinking',
  label: 'Thinking',
  icon: Brain,
  visibleInScopes: ['chat', 'session'],
  render: () => null,
})

const generateImageTool = defineTool({
  key: 'generateImage',
  label: 'Generate Image',
  icon: ImagePlus,
  visibleInScopes: ['chat', 'session'],
  render: () => null,
})

const newTopicTool = defineTool({
  key: 'newTopic',
  label: 'New Topic',
  icon: Plus,
  visibleInScopes: ['chat', 'session'],
  render: (ctx: ToolContext) => {
    const handleClick = () => {
      eventService.emit(ChatEvent.ADD_NEW_TOPIC)
    }
    return React.createElement('button', {
      type: 'button',
      title: 'New Topic',
      onClick: handleClick,
      className:
        'flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 transition-colors',
      children: React.createElement(Plus, { className: 'h-4 w-4' }),
    })
  },
})

const newContextTool = defineTool({
  key: 'newContext',
  label: 'New Context',
  icon: RefreshCw,
  visibleInScopes: ['chat', 'session'],
  render: (ctx: ToolContext) => {
    const handleClick = () => {
      eventService.emit(ChatEvent.NEW_CONTEXT)
    }
    return React.createElement('button', {
      type: 'button',
      title: 'New Context',
      onClick: handleClick,
      className:
        'flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 transition-colors',
      children: React.createElement(RefreshCw, { className: 'h-4 w-4' }),
    })
  },
})

const clearTopicTool = defineTool({
  key: 'clearTopic',
  label: 'Clear Topic',
  icon: Trash2,
  visibleInScopes: ['chat', 'session'],
  render: (ctx: ToolContext) => {
    const handleClick = () => {
      // Uses window.confirm as a simple fallback; real app uses useConfirmDialog
      const confirmed = window.confirm('Clear all messages in this topic?')
      if (confirmed) {
        eventService.emit(ChatEvent.CLEAR_MESSAGES, ctx.topicId)
      }
    }
    return React.createElement('button', {
      type: 'button',
      title: 'Clear Topic',
      onClick: handleClick,
      className:
        'flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 transition-colors',
      children: React.createElement(Trash2, { className: 'h-4 w-4' }),
    })
  },
})

const toggleExpandTool = defineTool({
  key: 'toggleExpand',
  label: 'Toggle Expand',
  icon: Maximize2,
  visibleInScopes: ['chat', 'session'],
  render: () => null,
})

const slashCommandsTool = defineTool({
  key: 'slashCommands',
  label: 'Slash Commands',
  icon: Slash,
  visibleInScopes: ['chat', 'session', 'mini'],
  render: () => null,
})

const quickPhrasesTool = defineTool({
  key: 'quickPhrases',
  label: 'Quick Phrases',
  icon: MessageSquare,
  visibleInScopes: ['chat', 'session'],
  render: () => null,
})

const resourceTool = defineTool({
  key: 'resource',
  label: 'Resource',
  icon: FolderOpen,
  visibleInScopes: ['chat', 'session'],
  render: () => null,
})

const urlContextTool = defineTool({
  key: 'urlContext',
  label: 'URL Context',
  icon: Link,
  visibleInScopes: ['chat', 'session'],
  render: () => null,
})

const createSessionTool = defineTool({
  key: 'createSession',
  label: 'Create Session',
  icon: Layout,
  visibleInScopes: ['chat', 'session'],
  render: () => null,
})

// ── Register all tools ──

const allTools: ToolDefinition[] = [
  attachmentTool,
  webSearchTool,
  knowledgeBaseTool,
  mcpToolsTool,
  mentionModelsTool,
  thinkingTool,
  generateImageTool,
  newTopicTool,
  newContextTool,
  clearTopicTool,
  toggleExpandTool,
  slashCommandsTool,
  quickPhrasesTool,
  resourceTool,
  urlContextTool,
  createSessionTool,
]

export function registerAllTools(): void {
  for (const tool of allTools) {
    registerTool(tool)
  }
}

// Auto-register on import
registerAllTools()

export { allTools }
