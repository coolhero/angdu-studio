import { FileSearch, Check } from 'lucide-react'

interface KBSearchToolProps {
  status: 'searching' | 'complete'
  resultCount?: number
}

/**
 * KB search tool display in chat messages.
 * Shows "Searching Knowledge Base" during search, result count when complete.
 */
export default function KBSearchTool({ status, resultCount = 0 }: KBSearchToolProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
      {status === 'searching' ? (
        <>
          <FileSearch className="h-3.5 w-3.5 animate-pulse" />
          <span>Searching Knowledge Base...</span>
        </>
      ) : (
        <>
          <Check className="h-3.5 w-3.5 text-green-500" />
          <span>
            Found {resultCount} result{resultCount !== 1 ? 's' : ''} from Knowledge Base
          </span>
        </>
      )}
    </div>
  )
}
