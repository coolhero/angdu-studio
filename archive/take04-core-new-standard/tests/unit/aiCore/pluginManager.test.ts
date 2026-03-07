import { describe, it, expect, vi } from 'vitest'
import { PluginManager } from '@aiCore/core/plugins/manager'
import { createContext, definePlugin } from '@aiCore/core/plugins'
import { PluginExecutionError } from '@aiCore/core/errors'

// Minimal mock model
const mockModel = { specificationVersion: 'v1', modelId: 'test' } as any

function makeContext() {
  return createContext('openai', mockModel, {})
}

describe('PluginManager', () => {
  describe('plugin ordering', () => {
    it('should sort plugins: pre → normal → post', () => {
      const manager = new PluginManager()
      manager.register(definePlugin({ name: 'post', enforce: 'post' }))
      manager.register(definePlugin({ name: 'normal' }))
      manager.register(definePlugin({ name: 'pre', enforce: 'pre' }))

      const sorted = manager.getPlugins()
      expect(sorted.map((p) => p.name)).toEqual(['pre', 'normal', 'post'])
    })

    it('should preserve insertion order within same enforcement level', () => {
      const manager = new PluginManager()
      manager.register(definePlugin({ name: 'a' }))
      manager.register(definePlugin({ name: 'b' }))
      manager.register(definePlugin({ name: 'c' }))

      const sorted = manager.getPlugins()
      expect(sorted.map((p) => p.name)).toEqual(['a', 'b', 'c'])
    })
  })

  describe('first-wins (resolveModel)', () => {
    it('should return first non-null result', async () => {
      const manager = new PluginManager()
      manager.register(
        definePlugin({
          name: 'resolver-a',
          resolveModel: () => null
        })
      )
      manager.register(
        definePlugin({
          name: 'resolver-b',
          resolveModel: () => ({ modelId: 'resolved', specificationVersion: 'v1' }) as any
        })
      )
      manager.register(
        definePlugin({
          name: 'resolver-c',
          resolveModel: () => ({ modelId: 'should-not-reach', specificationVersion: 'v1' }) as any
        })
      )

      const result = await manager.resolveModel('test-model', makeContext())
      expect((result as any)?.modelId).toBe('resolved')
    })

    it('should return null if no plugin resolves', async () => {
      const manager = new PluginManager()
      manager.register(definePlugin({ name: 'noop' }))

      const result = await manager.resolveModel('test-model', makeContext())
      expect(result).toBeNull()
    })
  })

  describe('sequential (transformParams)', () => {
    it('should chain transformParams results', async () => {
      const manager = new PluginManager()
      manager.register(
        definePlugin({
          name: 'add-temp',
          transformParams: (params: any) => ({ temperature: 0.5 })
        })
      )
      manager.register(
        definePlugin({
          name: 'add-max',
          transformParams: (params: any) => ({ maxTokens: 100 })
        })
      )

      const result = await manager.executeTransformParams({ model: 'test' }, makeContext())
      expect(result).toEqual({ model: 'test', temperature: 0.5, maxTokens: 100 })
    })

    it('should throw PluginExecutionError on failure', async () => {
      const manager = new PluginManager()
      manager.register(
        definePlugin({
          name: 'failing',
          transformParams: () => {
            throw new Error('transform failed')
          }
        })
      )

      await expect(manager.executeTransformParams({}, makeContext())).rejects.toThrow(PluginExecutionError)
    })
  })

  describe('sequential (transformResult)', () => {
    it('should chain transformResult', async () => {
      const manager = new PluginManager()
      manager.register(
        definePlugin({
          name: 'upper',
          transformResult: (result: any) => ({ ...result, text: result.text.toUpperCase() })
        })
      )

      const result = await manager.executeTransformResult({ text: 'hello' }, makeContext())
      expect(result).toEqual({ text: 'HELLO' })
    })
  })

  describe('parallel (onRequestStart/onRequestEnd/onError)', () => {
    it('should execute all parallel hooks even if one fails', async () => {
      const manager = new PluginManager()
      const results: string[] = []

      manager.register(
        definePlugin({
          name: 'good-a',
          onRequestStart: () => {
            results.push('a')
          }
        })
      )
      manager.register(
        definePlugin({
          name: 'bad',
          onRequestStart: () => {
            throw new Error('fail')
          }
        })
      )
      manager.register(
        definePlugin({
          name: 'good-b',
          onRequestStart: () => {
            results.push('b')
          }
        })
      )

      // Should not throw
      await manager.executeParallel('onRequestStart', [], makeContext())
      expect(results).toContain('a')
      expect(results).toContain('b')
    })

    it('should pass arguments to parallel hooks', async () => {
      const manager = new PluginManager()
      let capturedError: Error | null = null

      manager.register(
        definePlugin({
          name: 'error-handler',
          onError: (error: Error) => {
            capturedError = error
          }
        })
      )

      const testError = new Error('test error')
      await manager.executeParallel('onError', [testError], makeContext())
      expect(capturedError).toBe(testError)
    })
  })

  describe('configureContext', () => {
    it('should execute configureContext sequentially', async () => {
      const manager = new PluginManager()

      manager.register(
        definePlugin({
          name: 'ctx-plugin',
          configureContext: (ctx) => {
            ctx.extensions.set('key', 'value')
          }
        })
      )

      const ctx = makeContext()
      await manager.executeConfigureContext(ctx)
      expect(ctx.extensions.get('key')).toBe('value')
    })
  })

  describe('stream transforms', () => {
    it('should collect stream transforms from plugins', () => {
      const manager = new PluginManager()
      const transform = new TransformStream()

      manager.register(
        definePlugin({
          name: 'stream-plugin',
          transformStream: () => transform
        })
      )

      const transforms = manager.collectStreamTransforms({}, makeContext())
      expect(transforms).toHaveLength(1)
      expect(transforms[0]).toBe(transform)
    })
  })

  describe('remove plugin', () => {
    it('should remove plugin by name', () => {
      const manager = new PluginManager()
      manager.register(definePlugin({ name: 'keep' }))
      manager.register(definePlugin({ name: 'remove-me' }))

      manager.remove('remove-me')
      expect(manager.getPlugins().map((p) => p.name)).toEqual(['keep'])
    })
  })
})
