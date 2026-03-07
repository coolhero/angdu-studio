import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts', 'packages/**/*.{test,spec}.ts', 'tests/**/*.{test,spec}.ts'],
    exclude: ['tests/e2e/**']
  },
  resolve: {
    alias: {
      '@shared': resolve('packages/shared'),
      '@main': resolve('src/main'),
      '@renderer': resolve('src/renderer/src'),
      '@preload': resolve('src/preload')
    }
  }
})
