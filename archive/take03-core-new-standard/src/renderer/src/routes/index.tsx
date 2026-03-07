import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage
})

function HomePage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Cherry Studio</h1>
        <p className="mt-2 text-muted-foreground">Desktop AI Assistant</p>
      </div>
    </div>
  )
}
