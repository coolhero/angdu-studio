import { AlertCircle } from 'lucide-react'

interface ErrorBlockViewProps {
  error: string
}

export function ErrorBlockView({ error }: ErrorBlockViewProps) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{error}</span>
    </div>
  )
}
