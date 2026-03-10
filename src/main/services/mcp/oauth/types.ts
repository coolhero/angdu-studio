// ── F006: OAuth Types for MCP ──

import type {
  OAuthClientInformation,
  OAuthClientInformationMixed,
  OAuthTokens
} from '@modelcontextprotocol/sdk/shared/auth.js'
import type EventEmitter from 'events'

export interface OAuthStorageData {
  clientInfo?: OAuthClientInformation
  tokens?: OAuthTokens
  codeVerifier?: string
  lastUpdated: number
}

export interface IOAuthStorage {
  getClientInformation(): Promise<OAuthClientInformation | undefined>
  saveClientInformation(info: OAuthClientInformationMixed | undefined): Promise<void>
  getTokens(): Promise<OAuthTokens | undefined>
  saveTokens(tokens: OAuthTokens | undefined): Promise<void>
  getCodeVerifier(): Promise<string>
  saveCodeVerifier(codeVerifier: string): Promise<void>
  clear(): Promise<void>
}

export interface OAuthCallbackServerOptions {
  port: number
  path: string
  events: EventEmitter
}

export interface OAuthProviderOptions {
  serverUrlHash: string
  callbackPort?: number
  callbackPath?: string
  clientName?: string
  clientUri?: string
}
