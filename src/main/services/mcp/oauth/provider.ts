// ── F006: MCP OAuth Client Provider ──

import type { OAuthClientProvider } from '@modelcontextprotocol/sdk/client/auth.js'
import type {
  OAuthClientInformation,
  OAuthClientInformationMixed,
  OAuthTokens
} from '@modelcontextprotocol/sdk/shared/auth.js'
import { shell } from 'electron'

import type { OAuthProviderOptions } from './types'

/**
 * OAuth client provider for MCP servers requiring OAuth authentication.
 * Stores tokens in memory and opens auth URLs in the default browser.
 */
export class McpOAuthClientProvider implements OAuthClientProvider {
  private tokenStore: OAuthTokens | undefined
  private clientInfoStore: OAuthClientInformation | undefined
  private codeVerifierStore: string = ''

  public readonly config: Required<OAuthProviderOptions>

  constructor(options: OAuthProviderOptions) {
    this.config = {
      serverUrlHash: options.serverUrlHash,
      callbackPort: options.callbackPort || 12346,
      callbackPath: options.callbackPath || '/oauth/callback',
      clientName: options.clientName || 'Angdu Studio',
      clientUri: options.clientUri || 'https://github.com/nicepkg/angdu-studio'
    }
  }

  get redirectUrl(): string {
    return `http://127.0.0.1:${this.config.callbackPort}${this.config.callbackPath}`
  }

  get clientMetadata() {
    return {
      redirect_uris: [this.redirectUrl],
      token_endpoint_auth_method: 'none' as const,
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      client_name: this.config.clientName,
      client_uri: this.config.clientUri
    }
  }

  async clientInformation(): Promise<OAuthClientInformation | undefined> {
    return this.clientInfoStore
  }

  async saveClientInformation(info: OAuthClientInformationMixed | undefined): Promise<void> {
    this.clientInfoStore = info as OAuthClientInformation | undefined
  }

  async tokens(): Promise<OAuthTokens | undefined> {
    return this.tokenStore
  }

  async saveTokens(tokens: OAuthTokens | undefined): Promise<void> {
    this.tokenStore = tokens
  }

  async redirectToAuthorization(authorizationUrl: URL): Promise<void> {
    await shell.openExternal(authorizationUrl.toString())
  }

  async saveCodeVerifier(codeVerifier: string): Promise<void> {
    this.codeVerifierStore = codeVerifier
  }

  async codeVerifier(): Promise<string> {
    return this.codeVerifierStore
  }

  async invalidateCredentials(scope: 'all' | 'client' | 'tokens' | 'verifier'): Promise<void> {
    switch (scope) {
      case 'all':
        this.tokenStore = undefined
        this.clientInfoStore = undefined
        this.codeVerifierStore = ''
        break
      case 'tokens':
        this.tokenStore = undefined
        break
      case 'client':
        this.clientInfoStore = undefined
        break
      case 'verifier':
        this.codeVerifierStore = ''
        break
    }
  }
}
