import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@renderer/lib/utils'
import { useThemeStore } from '@renderer/stores/useThemeStore'

interface MermaidBlockProps {
  code: string
  className?: string
}

let mermaidInstance: typeof import('mermaid')['default'] | null = null
let mermaidInitPromise: Promise<void> | null = null
let mermaidCounter = 0

const MermaidBlock: React.FC<MermaidBlockProps> = ({ code, className }) => {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme)

  useEffect(() => {
    let cancelled = false

    const renderMermaid = async () => {
      setLoading(true)
      setError(null)

      try {
        // Lazy-load mermaid
        if (!mermaidInstance) {
          if (!mermaidInitPromise) {
            mermaidInitPromise = import('mermaid').then((mod) => {
              mermaidInstance = mod.default
              mermaidInstance.initialize({
                startOnLoad: false,
                theme: resolvedTheme === 'dark' ? 'dark' : 'default',
                securityLevel: 'loose',
              })
            })
          }
          await mermaidInitPromise
        }

        // Re-initialize if theme changed
        mermaidInstance!.initialize({
          startOnLoad: false,
          theme: resolvedTheme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
        })

        const id = `mermaid-${++mermaidCounter}`
        const { svg: renderedSvg } = await mermaidInstance!.render(id, code)

        if (!cancelled) {
          setSvg(renderedSvg)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render Mermaid diagram')
          setLoading(false)
        }
      }
    }

    renderMermaid()

    return () => {
      cancelled = true
    }
  }, [code, resolvedTheme])

  if (loading) {
    return (
      <div className={cn('my-3 flex items-center justify-center p-8 rounded-lg border border-border bg-muted/30', className)}>
        <span className="text-sm text-muted-foreground">Rendering diagram...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('my-3', className)}>
        <div className="text-xs text-destructive mb-2">Mermaid error: {error}</div>
        <pre className="p-4 rounded-lg border border-border bg-muted/30 overflow-x-auto">
          <code className="text-sm">{code}</code>
        </pre>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn('my-3 overflow-x-auto flex justify-center', className)}
      dangerouslySetInnerHTML={{ __html: svg ?? '' }}
    />
  )
}

export default React.memo(MermaidBlock)
