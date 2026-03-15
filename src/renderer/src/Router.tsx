import { lazy, Suspense } from 'react'
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'

const HomePage = lazy(() => import('./pages/HomePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const TranslatePage = lazy(() => import('./pages/TranslatePage'))
const KnowledgePage = lazy(() => import('./pages/KnowledgePage'))
const FilesPage = lazy(() => import('./pages/FilesPage'))
const NotesPage = lazy(() => import('./pages/NotesPage'))

function LoadingFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  )
}

const router = createHashRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <HomePage />
          </Suspense>
        )
      },
      {
        path: '/settings',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SettingsPage />
          </Suspense>
        )
      },
      {
        path: '/chat',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ChatPage />
          </Suspense>
        )
      },
      {
        path: '/translate',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TranslatePage />
          </Suspense>
        )
      },
      {
        path: '/knowledge',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <KnowledgePage />
          </Suspense>
        )
      },
      {
        path: '/files',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <FilesPage />
          </Suspense>
        )
      },
      {
        path: '/notes',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <NotesPage />
          </Suspense>
        )
      },
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

export { router }
