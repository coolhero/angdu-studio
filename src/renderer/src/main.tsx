import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('[GLOBAL ERROR]', event.error)
  const root = document.getElementById('root')
  if (root && !root.hasChildNodes()) {
    root.innerHTML = `<div style="padding:24px;font-family:monospace;color:#ff6b6b;background:#1a1a2e;height:100vh">
      <h1>Startup Error</h1>
      <pre style="color:#e0e0e0;white-space:pre-wrap">${event.error?.stack ?? event.message}</pre>
    </div>`
  }
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('[UNHANDLED REJECTION]', event.reason)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
