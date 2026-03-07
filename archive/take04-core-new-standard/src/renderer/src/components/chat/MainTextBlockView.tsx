import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { useCallback, useRef } from 'react'
import { Copy, Check } from 'lucide-react'

interface MainTextBlockViewProps {
  content: string
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <button
      onClick={handleCopy}
      className="absolute right-2 top-2 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}

import React from 'react'

export function MainTextBlockView({ content }: MainTextBlockViewProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre({ children, ...props }) {
            const codeEl = React.Children.toArray(children).find(
              (child): child is React.ReactElement =>
                React.isValidElement(child) && child.type === 'code'
            )
            const codeString =
              codeEl && React.isValidElement(codeEl)
                ? String((codeEl.props as { children?: React.ReactNode }).children ?? '')
                : ''

            const className = codeEl
              ? String((codeEl.props as { className?: string }).className ?? '')
              : ''
            const lang = className.replace('language-', '').replace('hljs ', '')

            return (
              <div className="group relative">
                {lang && (
                  <div className="flex items-center justify-between rounded-t-md border-b border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                    <span>{lang}</span>
                  </div>
                )}
                <pre
                  {...props}
                  className="!mt-0 rounded-t-none rounded-b-md bg-muted/30 p-3 text-sm"
                >
                  {children}
                </pre>
                <CopyButton code={codeString} />
              </div>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
