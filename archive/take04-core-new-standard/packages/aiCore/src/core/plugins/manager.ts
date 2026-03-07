// PluginManager — hook execution engine (F003)

import type { AiPlugin, AiRequestContext } from './types'
import type { AiSdkModel } from '../../types'
import { PluginExecutionError } from '../errors'

type PluginOrder = 'pre' | 'normal' | 'post'

function getOrder(plugin: AiPlugin): PluginOrder {
  return plugin.enforce ?? 'normal'
}

function sortPlugins(plugins: AiPlugin[]): AiPlugin[] {
  const order: Record<PluginOrder, number> = { pre: 0, normal: 1, post: 2 }
  return [...plugins].sort((a, b) => order[getOrder(a)] - order[getOrder(b)])
}

export class PluginManager {
  private plugins: AiPlugin[] = []

  register(plugin: AiPlugin): void {
    this.plugins.push(plugin)
  }

  registerAll(plugins: AiPlugin[]): void {
    this.plugins.push(...plugins)
  }

  remove(name: string): void {
    this.plugins = this.plugins.filter((p) => p.name !== name)
  }

  getPlugins(): AiPlugin[] {
    return sortPlugins(this.plugins)
  }

  // ── First-wins: returns first non-null result ──

  async executeFirst<T>(
    hookName: 'resolveModel' | 'loadTemplate',
    args: unknown[],
    context: AiRequestContext
  ): Promise<T | null> {
    const sorted = this.getPlugins()
    for (const plugin of sorted) {
      const hook = plugin[hookName] as ((...a: unknown[]) => Promise<T | null> | T | null) | undefined
      if (!hook) continue
      try {
        const result = await hook.call(plugin, ...args, context)
        if (result != null) return result
      } catch (error) {
        throw new PluginExecutionError(`Plugin "${plugin.name}" failed in ${hookName}`, { plugin: plugin.name, hook: hookName }, error as Error)
      }
    }
    return null
  }

  // ── Sequential: transform params/result through chain ──

  async executeTransformParams<T>(params: T, context: AiRequestContext): Promise<T> {
    const sorted = this.getPlugins()
    let current = params
    for (const plugin of sorted) {
      if (!plugin.transformParams) continue
      try {
        const partial = await plugin.transformParams(current as never, context as never)
        current = { ...current, ...partial } as T
      } catch (error) {
        throw new PluginExecutionError(`Plugin "${plugin.name}" failed in transformParams`, { plugin: plugin.name, hook: 'transformParams' }, error as Error)
      }
    }
    return current
  }

  async executeTransformResult<T>(result: T, context: AiRequestContext): Promise<T> {
    const sorted = this.getPlugins()
    let current = result
    for (const plugin of sorted) {
      if (!plugin.transformResult) continue
      try {
        current = (await plugin.transformResult(current as never, context as never)) as T
      } catch (error) {
        throw new PluginExecutionError(`Plugin "${plugin.name}" failed in transformResult`, { plugin: plugin.name, hook: 'transformResult' }, error as Error)
      }
    }
    return current
  }

  // ── Sequential: configureContext ──

  async executeConfigureContext(context: AiRequestContext): Promise<void> {
    const sorted = this.getPlugins()
    for (const plugin of sorted) {
      if (!plugin.configureContext) continue
      try {
        await plugin.configureContext(context as never)
      } catch (error) {
        throw new PluginExecutionError(`Plugin "${plugin.name}" failed in configureContext`, { plugin: plugin.name, hook: 'configureContext' }, error as Error)
      }
    }
  }

  // ── Parallel: fire-and-forget with error collection ──

  async executeParallel(
    hookName: 'onRequestStart' | 'onRequestEnd' | 'onError',
    args: unknown[],
    context: AiRequestContext
  ): Promise<void> {
    const sorted = this.getPlugins()
    const promises: Promise<void>[] = []
    for (const plugin of sorted) {
      const hook = plugin[hookName] as ((...a: unknown[]) => void | Promise<void>) | undefined
      if (!hook) continue
      promises.push(
        Promise.resolve()
          .then(() => hook.call(plugin, ...args, context))
          .catch((error) => {
            // Parallel hooks: log but don't throw
            console.error(`Plugin "${plugin.name}" error in ${hookName}:`, error)
          })
      )
    }
    await Promise.allSettled(promises)
  }

  // ── Stream transforms: collect all ──

  collectStreamTransforms(params: unknown, context: AiRequestContext): TransformStream[] {
    const sorted = this.getPlugins()
    const transforms: TransformStream[] = []
    for (const plugin of sorted) {
      if (!plugin.transformStream) continue
      try {
        transforms.push(plugin.transformStream(params as never, context as never))
      } catch (error) {
        throw new PluginExecutionError(`Plugin "${plugin.name}" failed in transformStream`, { plugin: plugin.name, hook: 'transformStream' }, error as Error)
      }
    }
    return transforms
  }

  // ── Resolve model (first-wins) ──

  async resolveModel(modelId: string, context: AiRequestContext): Promise<AiSdkModel | null> {
    return this.executeFirst<AiSdkModel>('resolveModel', [modelId], context)
  }
}
