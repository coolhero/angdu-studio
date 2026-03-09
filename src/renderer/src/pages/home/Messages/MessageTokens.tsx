import React from 'react'
import type { TokenUsage } from '@renderer/types/message'

interface MessageTokensProps {
  usage?: TokenUsage
}

function formatTokenCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return String(count)
}

const MessageTokens: React.FC<MessageTokensProps> = ({ usage }) => {
  if (!usage) return null

  return (
    <div className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500">
      <span title="Input tokens">
        {formatTokenCount(usage.inputTokens)} in
      </span>
      <span className="text-zinc-300 dark:text-zinc-600">/</span>
      <span title="Output tokens">
        {formatTokenCount(usage.outputTokens)} out
      </span>
    </div>
  )
}

export default React.memo(MessageTokens)
