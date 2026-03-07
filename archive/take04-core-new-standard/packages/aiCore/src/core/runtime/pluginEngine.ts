// PluginEngine — orchestrates execution pipeline (F003)

import type { AiPlugin, AiRequestContext } from '../plugins/types'
import type { ProviderId, AiSdkModel } from '../../types'
import { PluginManager } from '../plugins/manager'
import { createContext } from '../plugins'
import { RecursiveDepthError } from '../errors'

export class PluginEngine {
  private manager: PluginManager

  constructor(plugins: AiPlugin[] = []) {
    this.manager = new PluginManager()
    plugins.forEach((p) => this.manager.register(p))
  }

  use(plugin: AiPlugin): void {
    this.manager.register(plugin)
  }

  usePlugins(plugins: AiPlugin[]): void {
    this.manager.registerAll(plugins)
  }

  removePlugin(name: string): void {
    this.manager.remove(name)
  }

  getPluginManager(): PluginManager {
    return this.manager
  }

  // ── Execute with plugins (non-streaming) ──

  async executeWithPlugins<TParams, TResult>(
    providerId: ProviderId,
    model: AiSdkModel,
    params: TParams,
    executeFn: (transformedParams: TParams, ctx: AiRequestContext) => Promise<TResult>,
    metadata: AiRequestContext['metadata'] = {},
    parentContext?: AiRequestContext
  ): Promise<TResult> {
    const context = this.buildContext(providerId, model, params, metadata, parentContext)

    // configureContext
    await this.manager.executeConfigureContext(context)

    // onRequestStart (parallel)
    await this.manager.executeParallel('onRequestStart', [], context)

    try {
      // resolveModel (first-wins) — may override model
      const resolvedModel = await this.manager.resolveModel(context.originalParams as string, context)
      if (resolvedModel) {
        ;(context as { model: AiSdkModel }).model = resolvedModel
      }

      // transformParams
      const transformedParams = await this.manager.executeTransformParams(params, context)

      // execute
      const rawResult = await executeFn(transformedParams, context)

      // transformResult
      const result = await this.manager.executeTransformResult(rawResult, context)

      // onRequestEnd (parallel)
      await this.manager.executeParallel('onRequestEnd', [result], context)

      return result
    } catch (error) {
      // onError (parallel)
      await this.manager.executeParallel('onError', [error], context)
      throw error
    }
  }

  // ── Execute with plugins (streaming) ──

  async executeStreamWithPlugins<TParams, TResult>(
    providerId: ProviderId,
    model: AiSdkModel,
    params: TParams,
    executeFn: (transformedParams: TParams, ctx: AiRequestContext) => Promise<TResult>,
    metadata: AiRequestContext['metadata'] = {},
    parentContext?: AiRequestContext
  ): Promise<TResult> {
    const context = this.buildContext(providerId, model, params, metadata, parentContext)

    // configureContext
    await this.manager.executeConfigureContext(context)

    // onRequestStart (parallel)
    await this.manager.executeParallel('onRequestStart', [], context)

    try {
      // resolveModel (first-wins)
      const resolvedModel = await this.manager.resolveModel(context.originalParams as string, context)
      if (resolvedModel) {
        ;(context as { model: AiSdkModel }).model = resolvedModel
      }

      // transformParams
      const transformedParams = await this.manager.executeTransformParams(params, context)

      // execute (streaming)
      const result = await executeFn(transformedParams, context)

      // onRequestEnd fires after stream setup (not after stream completes)
      await this.manager.executeParallel('onRequestEnd', [result], context)

      return result
    } catch (error) {
      await this.manager.executeParallel('onError', [error], context)
      throw error
    }
  }

  // ── Collect stream transforms ──

  collectStreamTransforms(params: unknown, context: AiRequestContext): TransformStream[] {
    return this.manager.collectStreamTransforms(params, context)
  }

  // ── Build context with recursive call support ──

  private buildContext(
    providerId: ProviderId,
    model: AiSdkModel,
    params: unknown,
    metadata: AiRequestContext['metadata'],
    parentContext?: AiRequestContext
  ): AiRequestContext {
    const depth = parentContext ? parentContext.recursiveDepth + 1 : 0
    const maxDepth = parentContext?.maxRecursiveDepth ?? 10

    if (depth > maxDepth) {
      throw new RecursiveDepthError(`Recursive call depth ${depth} exceeds maximum ${maxDepth}`, {
        depth,
        maxDepth
      })
    }

    const context = createContext(providerId, model, params, metadata)
    context.isRecursiveCall = !!parentContext
    context.recursiveDepth = depth
    context.maxRecursiveDepth = maxDepth

    // Provide recursive call capability
    context.recursiveCall = async <T>(recursiveParams: unknown): Promise<T> => {
      return this.executeWithPlugins(
        providerId,
        model,
        recursiveParams as never,
        async (p) => p as unknown as T,
        metadata,
        context
      )
    }

    return context
  }
}
