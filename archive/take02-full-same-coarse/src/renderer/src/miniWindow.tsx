import { theme as antdTheme, ConfigProvider } from 'antd'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, store } from './store'

function MiniWindowApp() {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider
          theme={{
            algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm
          }}
        >
          <div className={`mini-window ${isDark ? 'dark' : ''}`} style={{ padding: 16, height: '100vh' }}>
            <h3 style={{ margin: 0, marginBottom: 8 }}>Cherry Studio</h3>
            <p style={{ margin: 0, color: '#888', fontSize: 12 }}>Mini Window</p>
          </div>
        </ConfigProvider>
      </PersistGate>
    </Provider>
  )
}

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <MiniWindowApp />
    </React.StrictMode>
  )
}
