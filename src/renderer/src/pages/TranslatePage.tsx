import { Languages } from 'lucide-react'

export default function TranslatePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <Languages className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-bold text-foreground">Translate</h1>
      <p className="text-sm text-muted-foreground">Coming soon</p>
    </div>
  )
}
