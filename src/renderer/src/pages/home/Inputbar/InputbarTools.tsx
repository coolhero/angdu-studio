import React, { useState, useCallback } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import { useTranslation } from 'react-i18next'
import { useInputbarTools } from './context/InputbarToolsProvider'
import type { ToolDefinition, ToolContext } from './types'

interface InputbarToolsProps {
  toolContext: ToolContext
}

const ToolButton: React.FC<{
  tool: ToolDefinition
  toolContext: ToolContext
}> = ({ tool, toolContext }) => {
  const Icon = tool.icon
  const rendered = tool.render(toolContext)

  // If the tool's render returns a custom element, use it
  if (rendered) return <>{rendered}</>

  // Fallback: icon-only button
  return (
    <button
      type="button"
      title={tool.label}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded transition-colors',
        'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700',
        'dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200'
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

const InputbarTools: React.FC<InputbarToolsProps> = ({ toolContext }) => {
  const { t } = useTranslation()
  const { visibleTools, hiddenTools, reorderTool } = useInputbarTools()
  const [showHidden, setShowHidden] = useState(false)

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return
      if (result.source.index === result.destination.index) return
      reorderTool(result.source.index, result.destination.index)
    },
    [reorderTool]
  )

  const toggleHidden = useCallback(() => {
    setShowHidden((prev) => !prev)
  }, [])

  if (visibleTools.length === 0 && hiddenTools.length === 0) return null

  return (
    <div className="flex flex-col gap-1">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="inputbar-tools" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-wrap items-center gap-0.5"
            >
              {visibleTools.map((tool, index) => (
                <Draggable key={tool.key} draggableId={tool.key} index={index}>
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      className={cn(snapshot.isDragging && 'opacity-70')}
                    >
                      <ToolButton tool={tool} toolContext={toolContext} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {hiddenTools.length > 0 && (
                <button
                  type="button"
                  onClick={toggleHidden}
                  title={t('chat.input.moreTools', 'More tools')}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded transition-colors',
                    'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600',
                    'dark:text-zinc-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-300'
                  )}
                >
                  {showHidden ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {showHidden && hiddenTools.length > 0 && (
        <div className="flex flex-wrap items-center gap-0.5 border-t border-zinc-100 pt-1 dark:border-zinc-700">
          {hiddenTools.map((tool) => (
            <ToolButton key={tool.key} tool={tool} toolContext={toolContext} />
          ))}
        </div>
      )}
    </div>
  )
}

export default React.memo(InputbarTools)
