import React, { useMemo } from 'react'
import { cn } from '@renderer/lib/utils'

interface MarkdownSvgRendererProps extends React.SVGAttributes<SVGSVGElement> {
  children?: React.ReactNode
}

const MarkdownSvgRenderer: React.FC<MarkdownSvgRendererProps> = ({
  children,
  className,
  ...props
}) => {
  // Build the SVG string from the props and children to render via dangerouslySetInnerHTML
  const svgContent = useMemo(() => {
    // Reconstruct the SVG attributes
    const attrs: string[] = []
    for (const [key, value] of Object.entries(props)) {
      if (key === 'dangerouslySetInnerHTML' || key === 'children') continue
      if (typeof value === 'string' || typeof value === 'number') {
        // Convert camelCase to kebab-case for SVG attributes
        const svgKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
        attrs.push(`${svgKey}="${value}"`)
      }
    }

    return null
  }, [props])

  // If we can't reconstruct, just render as a normal SVG element
  void svgContent

  return (
    <div className={cn('my-3 overflow-hidden max-w-full', className)}>
      <svg
        {...props}
        className="max-w-full h-auto"
        style={{
          maxWidth: '100%',
          height: 'auto',
          ...((props.style as React.CSSProperties) ?? {}),
        }}
      >
        {children}
      </svg>
    </div>
  )
}

export default React.memo(MarkdownSvgRenderer)
