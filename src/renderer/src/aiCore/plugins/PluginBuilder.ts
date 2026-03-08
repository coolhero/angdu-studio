import type { PluginDefinition, PluginHooks, PluginContext, AICoreParams, AICoreResult } from '../../types/ai-core'

export function definePlugin(
  name: string,
  hooks: PluginHooks,
  enforce?: 'pre' | 'post'
): PluginDefinition {
  return { name, hooks, enforce }
}

export class PluginPipeline {
  private plugins: PluginDefinition[] = []

  register(plugin: PluginDefinition): void {
    this.plugins.push(plugin)
  }

  private getSortedPlugins(): PluginDefinition[] {
    const pre = this.plugins.filter((p) => p.enforce === 'pre')
    const normal = this.plugins.filter((p) => !p.enforce)
    const post = this.plugins.filter((p) => p.enforce === 'post')
    return [...pre, ...normal, ...post]
  }

  configureContext(ctx: PluginContext): PluginContext {
    let result = ctx
    for (const plugin of this.getSortedPlugins()) {
      if (plugin.hooks.configureContext) {
        try {
          result = plugin.hooks.configureContext(result)
        } catch (error) {
          console.warn(`Plugin ${plugin.name} configureContext failed:`, error)
        }
      }
    }
    return result
  }

  async onRequestStart(ctx: PluginContext): Promise<void> {
    for (const plugin of this.getSortedPlugins()) {
      if (plugin.hooks.onRequestStart) {
        try {
          await plugin.hooks.onRequestStart(ctx)
        } catch (error) {
          console.warn(`Plugin ${plugin.name} onRequestStart failed:`, error)
        }
      }
    }
  }

  transformParams(params: AICoreParams, ctx: PluginContext): AICoreParams {
    let result = params
    for (const plugin of this.getSortedPlugins()) {
      if (plugin.hooks.transformParams) {
        try {
          result = plugin.hooks.transformParams(result, ctx)
        } catch (error) {
          console.warn(`Plugin ${plugin.name} transformParams failed:`, error)
        }
      }
    }
    return result
  }

  async onRequestEnd(result: AICoreResult, ctx: PluginContext): Promise<void> {
    for (const plugin of this.getSortedPlugins()) {
      if (plugin.hooks.onRequestEnd) {
        try {
          await plugin.hooks.onRequestEnd(result, ctx)
        } catch (error) {
          console.warn(`Plugin ${plugin.name} onRequestEnd failed:`, error)
        }
      }
    }
  }

  getPluginNames(): string[] {
    return this.getSortedPlugins().map((p) => p.name)
  }
}
