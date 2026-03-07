// Runtime entry point (F003)

export { RuntimeExecutor, type StreamTextParams, type GenerateTextParams, type GenerateImageParams } from './executor'
export { PluginEngine } from './pluginEngine'
import { RuntimeExecutor, type StreamTextParams, type GenerateTextParams } from './executor'
import type { ProviderId, ProviderSettingsMap } from '../../types'
import type { AiPlugin } from '../plugins/types'

// ── Convenience factory functions ──

export function createExecutor<T extends ProviderId>(
  providerId: T,
  providerSettings: ProviderSettingsMap[T],
  plugins?: AiPlugin[]
): RuntimeExecutor<T> {
  return RuntimeExecutor.create(providerId, providerSettings, plugins)
}

export function createOpenAICompatibleExecutor(
  providerSettings: ProviderSettingsMap['openai-compatible'],
  plugins?: AiPlugin[]
): RuntimeExecutor<'openai-compatible'> {
  return RuntimeExecutor.createOpenAICompatible(providerSettings, plugins)
}

// ── Direct execution functions ──

export async function streamText(providerId: ProviderId, settings: ProviderSettingsMap[ProviderId], params: StreamTextParams) {
  const executor = createExecutor(providerId, settings)
  return executor.streamText(params)
}

export async function generateText(providerId: ProviderId, settings: ProviderSettingsMap[ProviderId], params: GenerateTextParams) {
  const executor = createExecutor(providerId, settings)
  return executor.generateText(params)
}
