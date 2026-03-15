import { Home } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <Home className="h-12 w-12 text-primary" />
      <h1 className="text-2xl font-bold text-foreground">Welcome to Angdu Studio</h1>
      <p className="text-sm text-muted-foreground">Your AI Desktop Assistant</p>
    </div>
  )
}
