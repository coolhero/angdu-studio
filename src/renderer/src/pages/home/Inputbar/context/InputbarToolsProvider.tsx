import React, { createContext, useContext, useMemo } from 'react'
import { useInputToolsStore, type InputbarScope } from '@renderer/stores/useInputToolsStore'
import { getTool } from '../registry'
import type { ToolDefinition, ToolContext } from '../types'

interface InputbarToolsContextValue {
  scope: InputbarScope
  visibleTools: ToolDefinition[]
  hiddenTools: ToolDefinition[]
  reorderTool: (fromIndex: number, toIndex: number) => void
  moveToVisible: (key: string) => void
  moveToHidden: (key: string) => void
}

const InputbarToolsContext = createContext<InputbarToolsContextValue | null>(null)

export function useInputbarTools(): InputbarToolsContextValue {
  const ctx = useContext(InputbarToolsContext)
  if (!ctx) throw new Error('useInputbarTools must be used within InputbarToolsProvider')
  return ctx
}

interface InputbarToolsProviderProps {
  scope: InputbarScope
  toolContext: ToolContext
  children: React.ReactNode
}

export function InputbarToolsProvider({ scope, toolContext, children }: InputbarToolsProviderProps) {
  const toolOrder = useInputToolsStore((s) => s.toolOrder[scope])
  const reorderToolAction = useInputToolsStore((s) => s.reorderTool)
  const moveToolToVisible = useInputToolsStore((s) => s.moveToolToVisible)
  const moveToolToHidden = useInputToolsStore((s) => s.moveToolToHidden)

  const visibleTools = useMemo(() => {
    return toolOrder.visible
      .map((key) => getTool(key))
      .filter((t): t is ToolDefinition => {
        if (!t) return false
        if (t.condition && !t.condition(toolContext)) return false
        return true
      })
  }, [toolOrder.visible, toolContext])

  const hiddenTools = useMemo(() => {
    return toolOrder.hidden
      .map((key) => getTool(key))
      .filter((t): t is ToolDefinition => {
        if (!t) return false
        if (t.condition && !t.condition(toolContext)) return false
        return true
      })
  }, [toolOrder.hidden, toolContext])

  const reorderTool = useMemo(
    () => (fromIndex: number, toIndex: number) => reorderToolAction(scope, fromIndex, toIndex),
    [scope, reorderToolAction]
  )

  const moveToVisible = useMemo(
    () => (key: string) => moveToolToVisible(scope, key),
    [scope, moveToolToVisible]
  )

  const moveToHidden = useMemo(
    () => (key: string) => moveToolToHidden(scope, key),
    [scope, moveToolToHidden]
  )

  const value = useMemo<InputbarToolsContextValue>(
    () => ({
      scope,
      visibleTools,
      hiddenTools,
      reorderTool,
      moveToVisible,
      moveToHidden,
    }),
    [scope, visibleTools, hiddenTools, reorderTool, moveToVisible, moveToHidden]
  )

  return <InputbarToolsContext.Provider value={value}>{children}</InputbarToolsContext.Provider>
}
