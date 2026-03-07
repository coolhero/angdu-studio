import { describe, it, expect, vi } from 'vitest'
import { PluginEngine } from '@aiCore/core/runtime/pluginEngine'
import { definePlugin } from '@aiCore/core/plugins'
import { RecursiveDepthError } from '@aiCore/core/errors'

const mockModel = { specificationVersion: 'v1', modelId: 'test' } as any

describe('PluginEngine', () => {
  describe('plugin registration', () => {
    it('should register and execute plugins', async () => {
      const engine = new PluginEngine()
      const log: string[] = []

      engine.use(
        definePlugin({
          name: 'logger',
          onRequestStart: () => {
            log.push('start')
          },
          onRequestEnd: () => {
            log.push('end')
          }
        })
      )

      await engine.executeWithPlugins('openai', mockModel, { data: 'test' }, async (params) => params, {})

      expect(log).toEqual(['start', 'end'])
    })

    it('should support usePlugins batch registration', () => {
      const engine = new PluginEngine()
      engine.usePlugins([definePlugin({ name: 'a' }), definePlugin({ name: 'b' })])
      expect(engine.getPluginManager().getPlugins()).toHaveLength(2)
    })

    it('should remove plugin by name', () => {
      const engine = new PluginEngine([definePlugin({ name: 'a' }), definePlugin({ name: 'b' })])
      engine.removePlugin('a')
      expect(engine.getPluginManager().getPlugins()).toHaveLength(1)
      expect(engine.getPluginManager().getPlugins()[0].name).toBe('b')
    })
  })

  describe('enforce ordering', () => {
    it('should execute pre plugins before post plugins', async () => {
      const order: string[] = []
      const engine = new PluginEngine([
        definePlugin({
          name: 'post',
          enforce: 'post',
          configureContext: () => {
            order.push('post')
          }
        }),
        definePlugin({
          name: 'normal',
          configureContext: () => {
            order.push('normal')
          }
        }),
        definePlugin({
          name: 'pre',
          enforce: 'pre',
          configureContext: () => {
            order.push('pre')
          }
        })
      ])

      await engine.executeWithPlugins('openai', mockModel, {}, async (p) => p, {})

      expect(order).toEqual(['pre', 'normal', 'post'])
    })
  })

  describe('recursive calls', () => {
    it('should track recursive depth', async () => {
      let maxDepth = 0
      const engine = new PluginEngine([
        definePlugin({
          name: 'depth-tracker',
          configureContext: (ctx) => {
            if (ctx.recursiveDepth > maxDepth) {
              maxDepth = ctx.recursiveDepth
            }
          }
        })
      ])

      await engine.executeWithPlugins('openai', mockModel, {}, async (params) => params, {})

      expect(maxDepth).toBe(0) // First call has depth 0
    })

    it('should throw RecursiveDepthError when exceeding max depth', async () => {
      // Build a chain that recurses beyond max depth
      let callCount = 0
      const engine = new PluginEngine()

      // Create an engine that allows only 2 recursive calls
      const executeRecursive = async (depth: number, parentCtx?: any): Promise<void> => {
        await engine.executeWithPlugins(
          'openai',
          mockModel,
          { depth },
          async (params, ctx) => {
            callCount++
            if (callCount < 15) {
              // Keep recursing until depth limit
              return executeRecursive(depth + 1, ctx)
            }
            return {}
          },
          {},
          parentCtx
        )
      }

      await expect(executeRecursive(0)).rejects.toThrow(RecursiveDepthError)
    })
  })

  describe('error handling in pipeline', () => {
    it('should call onError hooks when execution fails', async () => {
      let errorCaught = false
      const engine = new PluginEngine([
        definePlugin({
          name: 'error-handler',
          onError: () => {
            errorCaught = true
          }
        })
      ])

      await expect(
        engine.executeWithPlugins('openai', mockModel, {}, async () => {
          throw new Error('exec failed')
        }, {})
      ).rejects.toThrow('exec failed')

      expect(errorCaught).toBe(true)
    })
  })

  describe('stream execution', () => {
    it('should execute stream with plugins', async () => {
      const log: string[] = []
      const engine = new PluginEngine([
        definePlugin({
          name: 'stream-logger',
          onRequestStart: () => {
            log.push('start')
          },
          onRequestEnd: () => {
            log.push('end')
          }
        })
      ])

      const result = await engine.executeStreamWithPlugins('openai', mockModel, { model: 'test' }, async (params) => ({ stream: true, ...params }), {})

      expect(result).toEqual({ stream: true, model: 'test' })
      expect(log).toEqual(['start', 'end'])
    })
  })
})
