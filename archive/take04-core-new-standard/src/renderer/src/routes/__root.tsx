import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Sidebar } from '../components/chat/Sidebar'

export const Route = createRootRoute({
  component: RootLayout
})

function RootLayout() {
  return (
    <div className="flex h-screen w-screen">
      <aside className="flex w-56 shrink-0 flex-col overflow-hidden border-r border-border bg-card">
        <Sidebar />
      </aside>
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
