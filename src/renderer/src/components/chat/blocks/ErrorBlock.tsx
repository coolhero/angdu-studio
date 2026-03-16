import { memo } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@renderer/components/ui/button'
import type { ErrorBlock as ErrorBlockType } from '@shared/types/message'

interface ErrorBlockProps {
  block: ErrorBlockType
  onRetry?: () => void
}

export const ErrorBlock = memo(function ErrorBlock({ block, onRetry }: ErrorBlockProps) {
  const { t } = useTranslation()

  return (
    <div className="my-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-destructive">{block.content.message}</p>
          {block.content.code && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t('chat.errorCode', '오류 코드')}: {block.content.code}
              {block.content.statusCode ? ` (${block.content.statusCode})` : ''}
            </p>
          )}
        </div>
        {block.content.retryable && onRetry && (
          <Button variant="ghost" size="sm" className="h-7 shrink-0 gap-1 text-xs" onClick={onRetry}>
            <RefreshCw className="h-3 w-3" />
            {t('chat.retry', '재시도')}
          </Button>
        )}
      </div>
    </div>
  )
})
