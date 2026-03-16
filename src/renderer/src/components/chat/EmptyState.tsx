import { memo } from 'react'
import { MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const EmptyState = memo(function EmptyState() {
  const { t } = useTranslation()

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <MessageSquare className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">
        {t('chat.emptyState.title', '새 대화를 시작하세요')}
      </h2>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        {t('chat.emptyState.description', '메시지를 입력하여 AI와 대화를 시작할 수 있습니다.')}
      </p>
    </div>
  )
})
