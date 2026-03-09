import React, { useMemo } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeMathjax from 'rehype-mathjax'
import rehypeRaw from 'rehype-raw'
import { cn } from '@renderer/lib/utils'
import { useSettingsStore } from '@renderer/stores/useSettingsStore'

import CodeBlock from './CodeBlock'
import MermaidBlock from './MermaidBlock'
import Table from './Table'
import Link from './Link'
import MarkdownSvgRenderer from './MarkdownSvgRenderer'
import rehypeHeadingIds from './plugins/rehypeHeadingIds'
import rehypeScalableSvg from './plugins/rehypeScalableSvg'
import remarkDisableConstructs from './plugins/remarkDisableConstructs'

interface MarkdownProps {
  content: string
  isStreaming?: boolean
  className?: string
}

const Markdown: React.FC<MarkdownProps> = ({ content, isStreaming, className }) => {
  const mathEngine = useSettingsStore((s) => s.mathEngine)

  const remarkPlugins = useMemo(
    () => [remarkGfm, remarkMath, remarkDisableConstructs],
    []
  )

  const rehypePlugins = useMemo(() => {
    const mathPlugin = mathEngine === 'mathjax' ? rehypeMathjax : rehypeKatex
    return [mathPlugin, rehypeRaw, rehypeHeadingIds, rehypeScalableSvg]
  }, [mathEngine])

  const components = useMemo<Components>(
    () => ({
      code: ({ className: codeClassName, children, ...props }) => {
        // Detect fenced code blocks: react-markdown gives className like "language-js"
        const match = /language-(\w+)/.exec(codeClassName ?? '')
        const language = match?.[1] ?? ''
        const codeString = String(children).replace(/\n$/, '')

        // Inline code (no language, short content)
        if (!match) {
          return (
            <code className={cn('px-1.5 py-0.5 rounded bg-muted font-mono text-sm', codeClassName)} {...props}>
              {children}
            </code>
          )
        }

        // Mermaid diagrams
        if (language === 'mermaid') {
          return <MermaidBlock code={codeString} />
        }

        // Regular code blocks with Shiki
        return <CodeBlock code={codeString} language={language} />
      },
      table: ({ children, ...props }) => <Table {...props}>{children}</Table>,
      a: ({ children, ...props }) => <Link {...props}>{children}</Link>,
      svg: ({ children, ...props }) => (
        <MarkdownSvgRenderer {...(props as React.SVGAttributes<SVGSVGElement>)}>
          {children}
        </MarkdownSvgRenderer>
      ),
    }),
    []
  )

  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none break-words',
        isStreaming && 'streaming',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default React.memo(Markdown)
