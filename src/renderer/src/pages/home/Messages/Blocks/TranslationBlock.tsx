import React from 'react'
import { Languages } from 'lucide-react'
import type { TranslationMessageBlock } from '@renderer/types/message-block'
import Markdown from '../../Markdown/Markdown'

interface TranslationBlockProps {
  block: TranslationMessageBlock
  isStreaming: boolean
}

const TranslationBlock: React.FC<TranslationBlockProps> = ({ block, isStreaming }) => {
  return (
    <div className="my-1 rounded-md border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-3 py-1.5 dark:border-zinc-700">
        <Languages className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {block.targetLanguage}
        </span>
      </div>
      <div className="px-3 py-2">
        <Markdown content={block.content} isStreaming={isStreaming} />
      </div>
    </div>
  )
}

export default React.memo(TranslationBlock)
