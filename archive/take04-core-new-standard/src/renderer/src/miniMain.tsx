import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/globals.css'
import './i18n'

function MiniApp() {
  return (
    <div className="flex items-center justify-center h-screen bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-lg font-semibold">Quick Assistant</h1>
        <p className="text-sm text-muted-foreground mt-2">Mini window ready</p>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MiniApp />
  </React.StrictMode>
)
