import { MessageSquare } from 'lucide-react'

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <MessageSquare className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-bold text-foreground">Chat</h1>
      <p className="text-sm text-muted-foreground">Coming soon</p>
    </div>
  )
}
