import { MainTextBlockView } from './MainTextBlockView'
import { ThinkingBlockView } from './ThinkingBlockView'
import { CodeBlockView } from './CodeBlockView'
import { ErrorBlockView } from './ErrorBlockView'
import type {
  MessageBlock,
  MainTextBlock,
  ThinkingBlock,
  CodeBlock,
  ErrorBlock
} from '@shared/types'

interface BlockRendererProps {
  block: MessageBlock
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case 'main_text': {
      const b = block as MainTextBlock
      return <MainTextBlockView content={b.content} />
    }
    case 'thinking': {
      const b = block as ThinkingBlock
      return (
        <ThinkingBlockView
          content={b.content}
          duration={b.thinking_millsec}
          status={b.status}
        />
      )
    }
    case 'code': {
      const b = block as CodeBlock
      return <CodeBlockView content={b.content} language={b.language} />
    }
    case 'error': {
      const b = block as ErrorBlock
      return <ErrorBlockView error={b.error ?? 'Unknown error'} />
    }
    default:
      return null
  }
}
