import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { codeToHtml } from 'shiki'
import { cn } from '@renderer/lib/utils'
import { useThemeStore } from '@renderer/stores/useThemeStore'
import { useSettingsStore } from '@renderer/stores/useSettingsStore'

interface CodeBlockProps {
  code: string
  language: string
  className?: string
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, className }) => {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const resolvedTheme = useThemeStore((s) => s.resolvedTheme)
  const codeStyle = useSettingsStore((s) => s.codeStyle)
  const codeFontFamily = useSettingsStore((s) => s.codeFontFamily)

  const shikiTheme = useMemo(() => {
    const effective = codeStyle === 'auto' ? resolvedTheme : codeStyle
    return effective === 'dark' ? 'github-dark' : 'github-light'
  }, [resolvedTheme, codeStyle])

  useEffect(() => {
    let cancelled = false

    codeToHtml(code, {
      lang: language || 'text',
      theme: shikiTheme,
    })
      .then((html) => {
        if (!cancelled) setHighlightedHtml(html)
      })
      .catch(() => {
        if (!cancelled) setHighlightedHtml(null)
      })

    return () => {
      cancelled = true
    }
  }, [code, language, shikiTheme])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may not be available
    }
  }, [code])

  return (
    <div className={cn('group relative my-3 rounded-lg border border-border overflow-hidden', className)}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 text-xs text-muted-foreground border-b border-border">
        <span className="font-mono">{language || 'text'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'px-2 py-0.5 rounded text-xs transition-colors',
            'hover:bg-muted-foreground/20',
            'opacity-0 group-hover:opacity-100 focus:opacity-100'
          )}
          aria-label="Copy code"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code content */}
      <div
        className="overflow-x-auto"
        style={{ fontFamily: codeFontFamily }}
      >
        {highlightedHtml ? (
          <div
            className="[&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!p-4 [&_code]:!text-sm"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre className="m-0 rounded-none p-4">
            <code className="text-sm">{code}</code>
          </pre>
        )}
      </div>
    </div>
  )
}

export default React.memo(CodeBlock)
