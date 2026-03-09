import React from 'react'
import { Wrench, Loader2 } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import type { ToolMessageBlock } from '@renderer/types/message-block'

interface ToolBlockProps {
  block: ToolMessageBlock
  isStreaming: boolean
}

function formatToolOutput(content: string | object | undefined): string {
  if (content === undefined || content === null) return ''
  if (typeof content === 'string') return content
  try {
    return JSON.stringify(content, null, 2)
  } catch {
    return String(content)
  }
}

const ToolBlock: React.FC<ToolBlockProps> = ({ block, isStreaming }) => {
  const toolName = block.toolName || block.toolId
  const args = block.arguments
  const output = formatToolOutput(block.content)

  return (
    <div className="my-1 rounded-md border border-zinc-200 dark:border-zinc-700">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 text-sm">
        {isStreaming ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-500" />
        ) : (
          <Wrench className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
        )}
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {toolName}
        </span>
      </div>

      {/* Arguments */}
      {args && Object.keys(args).length > 0 && (
        <div className="border-t border-zinc-200 px-3 py-2 dark:border-zinc-700">
          <table className="w-full text-xs">
            <tbody>
              {Object.entries(args).map(([key, value]) => (
                <tr key={key}>
                  <td className="pr-3 py-0.5 font-medium text-zinc-500 dark:text-zinc-400 align-top whitespace-nowrap">
                    {key}
                  </td>
                  <td className="py-0.5 text-zinc-700 dark:text-zinc-300 break-all">
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="border-t border-zinc-200 dark:border-zinc-700">
          <pre className="max-h-40 overflow-auto px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}

export default React.memo(ToolBlock)
