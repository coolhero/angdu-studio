import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'

const HomePage = lazy(() => import('./pages/Home'))
const SettingsPage = lazy(() => import('./pages/settings'))

export function Router() {
  return (
    <HashRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/settings/*" element={<SettingsPage />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
