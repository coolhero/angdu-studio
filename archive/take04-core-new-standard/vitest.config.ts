import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@main': resolve(__dirname, 'src/main'),
      '@renderer': resolve(__dirname, 'src/renderer/src'),
      '@shared': resolve(__dirname, 'packages/shared'),
      '@aiCore': resolve(__dirname, 'packages/aiCore/src'),
      '@ai-sdk-provider': resolve(__dirname, 'packages/ai-sdk-provider/src')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'packages/**/*.ts']
    }
  }
})
