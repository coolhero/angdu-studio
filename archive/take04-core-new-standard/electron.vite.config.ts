import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { resolve } from 'path'

const root = __dirname

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ['electron-store', 'conf', 'uuid'] })],
    resolve: {
      alias: {
        '@main': resolve(root, 'src/main'),
        '@shared': resolve(root, 'packages/shared')
      }
    },
    build: {
      rollupOptions: {
        output: {
          inlineDynamicImports: true
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': resolve(root, 'packages/shared'),
        '@aiCore': resolve(root, 'packages/aiCore/src'),
        '@ai-sdk-provider': resolve(root, 'packages/ai-sdk-provider/src')
      }
    },
    build: {
      rollupOptions: {
        output: {
          inlineDynamicImports: true
        }
      }
    }
  },
  renderer: {
    plugins: [
      react(),
      tailwindcss(),
      TanStackRouterVite({
        routesDirectory: resolve(root, 'src/renderer/src/routes'),
        generatedRouteTree: resolve(root, 'src/renderer/src/routeTree.gen.ts')
      })
    ],
    resolve: {
      alias: {
        '@renderer': resolve(root, 'src/renderer/src'),
        '@shared': resolve(root, 'packages/shared'),
        '@aiCore': resolve(root, 'packages/aiCore/src'),
        '@ai-sdk-provider': resolve(root, 'packages/ai-sdk-provider/src')
      }
    },
    root: resolve(root, 'src/renderer'),
    build: {
      rollupOptions: {
        input: {
          index: resolve(root, 'src/renderer/index.html'),
          miniWindow: resolve(root, 'src/renderer/miniWindow.html')
        }
      }
    }
  }
})
