import { memo } from 'react'
import { Wrench, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ToolBlock as ToolBlockType } from '@shared/types/message'

interface ToolBlockProps {
  block: ToolBlockType
}

export const ToolBlock = memo(function ToolBlock({ block }: ToolBlockProps) {
  const { t } = useTranslation()
  const { toolName, status } = block.content

  const StatusIcon = status === 'calling' ? Loader2 : status === 'done' ? CheckCircle2 : XCircle
  const statusClass =
    status === 'calling'
      ? 'text-blue-500 animate-spin'
      : status === 'done'
        ? 'text-green-500'
        : 'text-red-500'

  return (
    <div className="my-2 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-sm">
        <Wrench className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{toolName}</span>
        <StatusIcon className={`h-4 w-4 ${statusClass}`} />
        <span className="text-xs text-muted-foreground">
          {status === 'calling'
            ? t('chat.toolCalling', '실행 중...')
            : status === 'done'
              ? t('chat.toolDone', '완료')
              : t('chat.toolError', '오류')}
        </span>
      </div>
      {block.content.result && (
        <pre className="mt-2 max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
          {block.content.result}
        </pre>
      )}
    </div>
  )
})
