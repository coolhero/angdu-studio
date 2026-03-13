import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

function MiniApp() {
  return (
    <div className="flex items-center justify-center h-screen bg-background text-foreground">
      <p>Quick Assistant</p>
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <MiniApp />
  </React.StrictMode>
)
