import { memo, useEffect, useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@renderer/components/ui/button'
import type { CodeBlock as CodeBlockType } from '@shared/types/message'

// Module-level singleton for shiki highlighter
let highlighterPromise: Promise<import('shiki').Highlighter> | null = null

async function getHighlighter(): Promise<import('shiki').Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki').then(({ createHighlighter }) =>
      createHighlighter({
        themes: ['github-dark', 'github-light'],
        langs: ['javascript', 'typescript', 'python', 'json', 'html', 'css', 'bash', 'markdown', 'yaml', 'sql', 'rust', 'go', 'java', 'cpp', 'c']
      })
    )
  }
  return highlighterPromise
}

interface CodeBlockProps {
  block: CodeBlockType
}

export const CodeBlock = memo(function CodeBlock({ block }: CodeBlockProps) {
  const { t } = useTranslation()
  const [html, setHtml] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const isDark = document.documentElement.classList.contains('dark')

  useEffect(() => {
    let cancelled = false
    getHighlighter()
      .then((highlighter) => {
        if (cancelled) return
        const lang = block.content.language || 'text'
        const loadedLangs = highlighter.getLoadedLanguages()
        const result = highlighter.codeToHtml(block.content.code, {
          lang: loadedLangs.includes(lang as never) ? lang : 'text',
          theme: isDark ? 'github-dark' : 'github-light'
        })
        setHtml(result)
      })
      .catch(() => {
        if (!cancelled) setHtml('')
      })
    return () => {
      cancelled = true
    }
  }, [block.content.code, block.content.language, isDark])

  const handleCopy = useCallback(() => {
    window.api.invoke['clipboard:write'](block.content.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [block.content.code])

  return (
    <div className="group relative my-2 overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between bg-muted/50 px-4 py-1.5">
        <span className="text-xs text-muted-foreground">
          {block.content.language || 'text'}
          {block.content.fileName && ` — ${block.content.fileName}`}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1 px-2 text-xs opacity-0 group-hover:opacity-100"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              {t('chat.copied', '복사됨')}
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              {t('chat.copy', '복사')}
            </>
          )}
        </Button>
      </div>
      {html ? (
        <div
          className="overflow-x-auto p-4 text-sm [&_pre]:m-0 [&_pre]:bg-transparent"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto p-4 text-sm">
          <code>{block.content.code}</code>
        </pre>
      )}
    </div>
  )
})
