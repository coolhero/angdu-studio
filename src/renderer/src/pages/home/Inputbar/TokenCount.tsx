import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@renderer/stores/useSettingsStore'

interface TokenCountProps {
  text: string
}

const TokenCount: React.FC<TokenCountProps> = ({ text }) => {
  const { t } = useTranslation()
  const showTokens = useSettingsStore((s) => s.showInputEstimatedTokens)

  if (!showTokens || !text.trim()) return null

  const estimatedTokens = Math.ceil(text.length / 4)

  return (
    <div className="px-1 text-xs text-zinc-400 dark:text-zinc-500">
      ~{estimatedTokens} {t('chat.input.tokens', 'tokens')}
    </div>
  )
}

export default React.memo(TokenCount)
