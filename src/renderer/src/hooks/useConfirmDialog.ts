import { createContext, useContext, useCallback, useState } from 'react'

export interface ConfirmDialogOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
}

interface ConfirmDialogContextValue {
  show: (options: ConfirmDialogOptions) => Promise<boolean>
  options: ConfirmDialogOptions | null
  isOpen: boolean
  resolve: ((value: boolean) => void) | null
}

export const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null)

export function useConfirmDialog() {
  const ctx = useContext(ConfirmDialogContext)
  if (!ctx) throw new Error('useConfirmDialog must be used within ConfirmDialogProvider')
  return { confirm: ctx.show }
}
