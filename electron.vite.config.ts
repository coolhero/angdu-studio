import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'electron-vite'
import { resolve } from 'path'

const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@shared': resolve('src/shared')
      }
    },
    build: {
      rollupOptions: {
        external: ['electron', 'electron-updater', 'electron-store', 'electron-window-state', 'os-proxy-config', 'registry-js']
      },
      sourcemap: isDev
    },
    esbuild: isProd ? { legalComments: 'none' } : {}
  },
  preload: {
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    },
    build: {
      sourcemap: isDev
    }
  },
  renderer: {
    plugins: [
      (async () => (await import('@tailwindcss/vite')).default())(),
      react()
    ],
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared')
      }
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html')
        }
      }
    },
    esbuild: isProd ? { legalComments: 'none' } : {}
  }
})
