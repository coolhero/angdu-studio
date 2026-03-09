import React from 'react'
import { Wrench, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import type { ToolMessageBlock } from '@renderer/types/message-block'
import { MessageBlockStatus } from '@renderer/types/message-block'
import ArgsTable from './shared/ArgsTable'
import { truncateOutput } from './shared/truncateOutput'

interface MessageMcpToolProps {
  block: ToolMessageBlock
}

const MessageMcpTool: React.FC<MessageMcpToolProps> = ({ block }) => {
  const isProcessing =
    block.status === MessageBlockStatus.PROCESSING ||
    block.status === MessageBlockStatus.STREAMING
  const isError = block.status === MessageBlockStatus.ERROR
  const isSuccess = block.status === MessageBlockStatus.SUCCESS

  const toolName = block.toolName || block.toolId
  const output =
    block.content !== undefined && block.content !== null
      ? typeof block.content === 'string'
        ? block.content
        : JSON.stringify(block.content, null, 2)
      : ''
  const truncatedOutput = truncateOutput(output)

  return (
    <div className="my-1 rounded-md border border-zinc-200 dark:border-zinc-700">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        {isProcessing && (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-500" />
        )}
        {isSuccess && (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
        )}
        {isError && (
          <XCircle className="h-4 w-4 shrink-0 text-red-500" />
        )}
        {!isProcessing && !isSuccess && !isError && (
          <Wrench className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
        )}
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {toolName}
        </span>
        {isProcessing && (
          <span className="text-xs text-zinc-400">Running...</span>
        )}
      </div>

      {/* Arguments */}
      {block.arguments && Object.keys(block.arguments).length > 0 && (
        <div className="border-t border-zinc-200 px-3 py-2 dark:border-zinc-700">
          <ArgsTable args={block.arguments} />
        </div>
      )}

      {/* Response */}
      {truncatedOutput && (
        <div className="border-t border-zinc-200 dark:border-zinc-700">
          <pre
            className={cn(
              'max-h-40 overflow-auto px-3 py-2 text-xs',
              isError
                ? 'text-red-600 dark:text-red-400'
                : 'text-zinc-600 dark:text-zinc-400'
            )}
          >
            {truncatedOutput}
          </pre>
        </div>
      )}
    </div>
  )
}

export default React.memo(MessageMcpTool)
