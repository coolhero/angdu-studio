import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ['electron-store'] })],
    resolve: {
      alias: {
        '@shared': resolve('packages/shared')
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
    resolve: {
      alias: {
        '@shared': resolve('packages/shared'),
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      tailwindcss(),
      TanStackRouterVite({
        routesDirectory: resolve('src/renderer/src/routes'),
        generatedRouteTree: resolve('src/renderer/src/routeTree.gen.ts')
      })
    ]
  }
})
