import { useCallback, useRef, useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodeBlockViewProps {
  content: string
  language?: string
}

export function CodeBlockView({ content, language }: CodeBlockViewProps) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 2000)
  }, [content])

  return (
    <div className="group relative overflow-hidden rounded-md border border-border">
      <div className="flex items-center justify-between bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="rounded p-0.5 hover:text-foreground"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <pre className="overflow-x-auto bg-muted/30 p-3 text-sm">
        <code>{content}</code>
      </pre>
    </div>
  )
}
