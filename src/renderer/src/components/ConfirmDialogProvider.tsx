import { type ReactNode, useState, useCallback, useRef } from 'react'
import {
  ConfirmDialogContext,
  type ConfirmDialogOptions,
} from '../hooks/useConfirmDialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './ui/alert-dialog'

interface ConfirmDialogProviderProps {
  children: ReactNode
}

export function ConfirmDialogProvider({ children }: ConfirmDialogProviderProps) {
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const show = useCallback((opts: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts)
      setIsOpen(true)
      resolveRef.current = resolve
    })
  }, [])

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true)
    resolveRef.current = null
    setIsOpen(false)
    setOptions(null)
  }, [])

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false)
    resolveRef.current = null
    setIsOpen(false)
    setOptions(null)
  }, [])

  return (
    <ConfirmDialogContext.Provider
      value={{
        show,
        options,
        isOpen,
        resolve: resolveRef.current,
      }}
    >
      {children}
      <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) handleCancel() }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options?.title}</AlertDialogTitle>
            {options?.description && (
              <AlertDialogDescription>{options.description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {options?.cancelLabel ?? 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                options?.variant === 'destructive'
                  ? 'bg-red-500 text-zinc-50 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                  : undefined
              }
            >
              {options?.confirmLabel ?? 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmDialogContext.Provider>
  )
}
