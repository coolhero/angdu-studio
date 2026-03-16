import { memo, useCallback, useState } from 'react'
import { Copy, Pencil, Trash2, RefreshCw, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@renderer/components/ui/button'

interface MessageActionsProps {
  messageId: string
  role: 'user' | 'assistant' | 'system'
  onCopy: () => void
  onEdit?: () => void
  onDelete: () => void
  onRegenerate?: () => void
}

export const MessageActions = memo(function MessageActions({
  role,
  onCopy,
  onEdit,
  onDelete,
  onRegenerate
}: MessageActionsProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [onCopy])

  return (
    <div className="flex items-center gap-0.5 rounded-md border border-border bg-background p-0.5 shadow-sm">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={handleCopy}
        title={t('chat.copy', '복사')}
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
      {role === 'user' && onEdit && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onEdit}
          title={t('chat.edit', '수정')}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      )}
      {role === 'assistant' && onRegenerate && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onRegenerate}
          title={t('chat.regenerate', '재생성')}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:text-destructive"
        onClick={onDelete}
        title={t('chat.delete', '삭제')}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  )
})
