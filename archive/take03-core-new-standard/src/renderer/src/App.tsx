import { RouterProvider, createHashHistory, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './assets/styles/globals.css'

// Hash history for Electron file:// protocol
const hashHistory = createHashHistory()

const router = createRouter({
  routeTree,
  history: hashHistory
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return <RouterProvider router={router} />
}
