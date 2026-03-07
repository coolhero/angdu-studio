import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@types': resolve('src/renderer/src/types'),
        '@shared': resolve('packages/shared'),
        '@logger': resolve('src/main/services/LoggerService')
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: undefined,
          inlineDynamicImports: true
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': resolve('packages/shared')
      }
    }
  },
  renderer: {
    plugins: [tailwindcss(), react()],
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('packages/shared'),
        '@types': resolve('src/renderer/src/types'),
        '@logger': resolve('src/renderer/src/services/LoggerService')
      }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/renderer/index.html'),
          miniWindow: resolve('src/renderer/miniWindow.html'),
          selectionToolbar: resolve('src/renderer/selectionToolbar.html'),
          selectionAction: resolve('src/renderer/selectionAction.html'),
          traceWindow: resolve('src/renderer/traceWindow.html')
        }
      }
    }
  }
})
