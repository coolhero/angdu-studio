import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@main': resolve('src/main'),
      '@renderer': resolve('src/renderer/src'),
      '@shared': resolve('packages/shared'),
      '@types': resolve('src/renderer/src/types'),
      '@logger': resolve('src/main/services/LoggerService')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'packages/**/*.test.ts']
  }
})
