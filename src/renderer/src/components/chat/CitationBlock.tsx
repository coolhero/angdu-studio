import { useMemo, useState } from 'react'
import { FileSearch, ChevronDown, ChevronUp } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@renderer/components/ui/tooltip'
import type { KnowledgeReference } from '@shared/types/knowledge'

interface CitationBlockProps {
  references: KnowledgeReference[]
  messageText: string
}

/**
 * 8-stage citation pipeline renderer.
 * Stage 3: Extract cited numbers from AI text
 * Stage 4: Filter to only cited references
 * Stage 5: Renumber by first appearance
 * Stage 7: Render inline badges + tooltip
 * Stage 8: Click interaction
 */
export default function CitationBlock({ references, messageText }: CitationBlockProps) {
  const [expanded, setExpanded] = useState(false)

  // Stage 3: Extract cited reference numbers from AI text
  const citedNumbers = useMemo(() => {
    const matches = messageText.match(/\[(\d+)\]/g)
    if (!matches) return new Set<number>()
    return new Set(matches.map((m) => parseInt(m.replace(/[[\]]/g, ''), 10)))
  }, [messageText])

  // Stage 4: Filter to only actually cited references
  const citedRefs = useMemo(() => {
    return references.filter((r) => citedNumbers.has(r.originalRefNumber))
  }, [references, citedNumbers])

  // Stage 5: Renumber by first appearance order in text
  const renumberedRefs = useMemo(() => {
    if (citedRefs.length === 0) return []

    // Find first-appearance position of each ref in text
    const withPosition = citedRefs.map((ref) => {
      const pattern = `[${ref.originalRefNumber}]`
      const position = messageText.indexOf(pattern)
      return { ...ref, position: position >= 0 ? position : Infinity }
    })

    // Sort by first appearance
    withPosition.sort((a, b) => a.position - b.position)

    // Assign display numbers (1-based)
    return withPosition.map((ref, idx) => ({
      ...ref,
      refNumber: idx + 1
    }))
  }, [citedRefs, messageText])

  if (renumberedRefs.length === 0) return null

  // Stage 8: Click handler — open source file
  const handleClick = (ref: KnowledgeReference) => {
    if (ref.sourceFile.startsWith('http')) {
      window.api.invoke['shell:openExternal'](ref.sourceFile)
    } else {
      window.api.invoke['shell:openPath'](ref.sourceFile)
    }
  }

  return (
    <div className="mt-2 rounded-lg border border-border bg-muted/30 p-2">
      {/* Summary header */}
      <button
        className="flex w-full items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setExpanded(!expanded)}
      >
        <FileSearch className="h-3.5 w-3.5" />
        <span>{renumberedRefs.length} reference{renumberedRefs.length > 1 ? 's' : ''}</span>
        {expanded ? <ChevronUp className="ml-auto h-3 w-3" /> : <ChevronDown className="ml-auto h-3 w-3" />}
      </button>

      {/* Expanded reference list */}
      {expanded && (
        <TooltipProvider>
          <div className="mt-2 space-y-1">
            {renumberedRefs.map((ref) => (
              <Tooltip key={ref.originalRefNumber}>
                <TooltipTrigger asChild>
                  <button
                    className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs hover:bg-muted"
                    onClick={() => handleClick(ref)}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                      {ref.refNumber}
                    </span>
                    <span className="truncate text-foreground">{ref.sourceFile.split('/').pop()}</span>
                    <span className="ml-auto shrink-0 text-muted-foreground">
                      {(ref.similarity * 100).toFixed(0)}%
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <p className="text-xs font-medium">{ref.sourceFile}</p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-3">{ref.content}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">from {ref.kbName}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      )}
    </div>
  )
}

/**
 * Inline citation badge component — renders [N] sup badges in message text.
 * Used during Stage 7 of the citation pipeline.
 * Rendering is done at display time via useMemo — stored text is NOT modified.
 */
export function CitationBadge({
  refNumber,
  onClick
}: {
  refNumber: number
  onClick?: () => void
}) {
  return (
    <button
      className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-[9px] font-semibold text-primary hover:bg-primary/25"
      onClick={onClick}
    >
      {refNumber}
    </button>
  )
}
