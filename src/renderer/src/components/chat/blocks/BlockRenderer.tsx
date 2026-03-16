import { memo, lazy, Suspense } from 'react'
import type { MessageBlock } from '@shared/types/message'
import { TextBlock } from './TextBlock'
import { ThinkingBlock } from './ThinkingBlock'
import { ToolBlock } from './ToolBlock'
import { ImageBlock } from './ImageBlock'
import { FileBlock } from './FileBlock'
import { ErrorBlock } from './ErrorBlock'

// Lazy-load CodeBlock since it pulls in shiki
const CodeBlock = lazy(() =>
  import('./CodeBlock').then((m) => ({ default: m.CodeBlock }))
)

interface BlockRendererProps {
  block: MessageBlock
  onRetry?: () => void
}

export const BlockRenderer = memo(function BlockRenderer({ block, onRetry }: BlockRendererProps) {
  switch (block.type) {
    case 'main_text':
      return <TextBlock block={block} />
    case 'code':
      return (
        <Suspense
          fallback={
            <pre className="my-2 overflow-x-auto rounded-lg border border-border bg-muted p-4 text-sm">
              <code>{block.content.code}</code>
            </pre>
          }
        >
          <CodeBlock block={block} />
        </Suspense>
      )
    case 'thinking':
      return <ThinkingBlock block={block} />
    case 'tool':
      return <ToolBlock block={block} />
    case 'image':
      return <ImageBlock block={block} />
    case 'file':
      return <FileBlock block={block} />
    case 'error':
      return <ErrorBlock block={block} onRetry={onRetry} />
    default:
      return null
  }
})
