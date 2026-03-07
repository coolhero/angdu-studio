import { theme as antdTheme, Button, ConfigProvider, Space } from 'antd'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, store } from './store'

function SelectionToolbarApp() {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider
          theme={{
            algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm
          }}
        >
          <div
            className={`selection-toolbar ${isDark ? 'dark' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
              padding: 8,
              borderRadius: 8,
              WebkitAppRegion: 'drag' as unknown as string
            }}
          >
            <Space size="small" style={{ WebkitAppRegion: 'no-drag' as unknown as string }}>
              <Button size="small" type="text">
                Copy
              </Button>
              <Button size="small" type="text">
                Translate
              </Button>
              <Button size="small" type="text">
                Explain
              </Button>
              <Button size="small" type="text">
                Summarize
              </Button>
            </Space>
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
      <SelectionToolbarApp />
    </React.StrictMode>
  )
}
