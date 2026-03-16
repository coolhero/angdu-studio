import { memo, useState } from 'react'
import { ChevronDown, ChevronRight, Brain } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ThinkingBlock as ThinkingBlockType } from '@shared/types/message'

interface ThinkingBlockProps {
  block: ThinkingBlockType
}

export const ThinkingBlock = memo(function ThinkingBlock({ block }: ThinkingBlockProps) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(block.content.collapsed ?? true)

  const durationText = block.content.thinkingMs
    ? `${(block.content.thinkingMs / 1000).toFixed(1)}s`
    : null

  return (
    <div className="my-2 rounded-lg border border-border bg-muted/30">
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted/50"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0" />
        )}
        <Brain className="h-4 w-4 shrink-0" />
        <span className="font-medium">
          {t('chat.thinking', '사고 과정')}
        </span>
        {durationText && (
          <span className="text-xs text-muted-foreground/70">({durationText})</span>
        )}
      </button>
      {!collapsed && (
        <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground whitespace-pre-wrap">
          {block.content.text}
        </div>
      )}
    </div>
  )
})
