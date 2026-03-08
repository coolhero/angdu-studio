import type { Provider } from '../../types/provider'
import { ANTHROPIC_BETA_HEADERS } from '../provider/constants'

export function buildProviderHeaders(provider: Provider): Record<string, string> {
  const headers: Record<string, string> = {}

  // Apply custom extra_headers from provider config
  if (provider.extra_headers) {
    Object.assign(headers, provider.extra_headers)
  }

  // Anthropic-specific beta headers (skip for AWS Bedrock)
  if (provider.type === 'anthropic' || provider.type === 'vertex-anthropic') {
    const betaFeatures: string[] = []

    if (provider.anthropicCacheControl?.enabled) {
      betaFeatures.push(ANTHROPIC_BETA_HEADERS.promptCaching)
    }

    betaFeatures.push(ANTHROPIC_BETA_HEADERS.extendedThinking)
    betaFeatures.push(ANTHROPIC_BETA_HEADERS.tokenCounting)

    if (betaFeatures.length > 0) {
      headers['anthropic-beta'] = betaFeatures.join(',')
    }
  }

  return headers
}
