import React, { useMemo, useState, useCallback } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  type Node,
  type Edge,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { GitBranch, List } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@renderer/lib/utils'
import type { Message } from '@renderer/types/message'

interface ChatFlowHistoryProps {
  messages: Message[]
}

const NODE_WIDTH = 200
const NODE_HEIGHT = 60
const NODE_GAP_Y = 100
const NODE_GAP_X = 260

function buildFlowGraph(messages: Message[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  if (messages.length === 0) return { nodes, edges }

  // Group messages by askId to detect branches
  const askGroups = new Map<string, Message[]>()
  for (const msg of messages) {
    if (msg.askId) {
      const group = askGroups.get(msg.askId) ?? []
      group.push(msg)
      askGroups.set(msg.askId, group)
    }
  }

  let yOffset = 0
  let prevNodeId: string | null = null

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    const isUser = msg.role === 'user'

    // Check if this message has siblings (multi-model branch)
    const siblings = msg.askId ? askGroups.get(msg.askId) ?? [] : []
    const isBranch = siblings.length > 1 && !isUser

    if (isBranch) {
      // Check if we already rendered this branch group
      const firstSibling = siblings[0]
      if (msg.id !== firstSibling.id) continue

      // Render branch nodes side by side
      siblings.forEach((sibling, idx) => {
        const xOffset = (idx - (siblings.length - 1) / 2) * NODE_GAP_X

        nodes.push({
          id: sibling.id,
          position: { x: xOffset, y: yOffset },
          data: {
            label: `${sibling.model?.name ?? sibling.role}: ${truncate(sibling.id, 12)}`,
          },
          style: {
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
            background: '#dbeafe',
            border: '1px solid #93c5fd',
            borderRadius: 8,
            fontSize: 11,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        })

        if (prevNodeId) {
          edges.push({
            id: `e-${prevNodeId}-${sibling.id}`,
            source: prevNodeId,
            target: sibling.id,
            animated: true,
          })
        }
      })

      // skip the rest of siblings in the main loop
      yOffset += NODE_GAP_Y
      prevNodeId = siblings[siblings.length - 1].id
      continue
    }

    nodes.push({
      id: msg.id,
      position: { x: 0, y: yOffset },
      data: {
        label: `${msg.role === 'user' ? 'You' : (msg.model?.name ?? 'Assistant')}`,
      },
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        background: isUser ? '#e0f2fe' : '#f0fdf4',
        border: `1px solid ${isUser ? '#7dd3fc' : '#86efac'}`,
        borderRadius: 8,
        fontSize: 11,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    })

    if (prevNodeId) {
      edges.push({
        id: `e-${prevNodeId}-${msg.id}`,
        source: prevNodeId,
        target: msg.id,
      })
    }

    prevNodeId = msg.id
    yOffset += NODE_GAP_Y
  }

  return { nodes, edges }
}

function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '...' : str
}

const FlowContent: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const { nodes, edges } = useMemo(() => buildFlowGraph(messages), [messages])

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}

const ChatFlowHistory: React.FC<ChatFlowHistoryProps> = ({ messages }) => {
  const { t } = useTranslation()
  const [isGraphView, setIsGraphView] = useState(false)

  const toggleView = useCallback(() => setIsGraphView((v) => !v), [])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-end px-4 py-1">
        <button
          onClick={toggleView}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs',
            'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          )}
          title={
            isGraphView
              ? t('chat.flow.listView', 'List view')
              : t('chat.flow.graphView', 'Graph view')
          }
        >
          {isGraphView ? <List className="h-3.5 w-3.5" /> : <GitBranch className="h-3.5 w-3.5" />}
          <span>
            {isGraphView
              ? t('chat.flow.listView', 'List view')
              : t('chat.flow.graphView', 'Graph view')}
          </span>
        </button>
      </div>

      {isGraphView && (
        <div className="flex-1">
          <ReactFlowProvider>
            <FlowContent messages={messages} />
          </ReactFlowProvider>
        </div>
      )}
    </div>
  )
}

export default React.memo(ChatFlowHistory)
