import { describe, it, expect } from 'vitest'
import { SYSTEM_PROVIDERS, CHERRYAI_PROVIDER, PROVIDER_URLS } from '../../../src/renderer/src/config/providers'
import { PROVIDER_TYPES } from '@shared/types'

// ── T021: System Provider Configuration ──

describe('SYSTEM_PROVIDERS', () => {
  it('has at least 63 entries', () => {
    expect(SYSTEM_PROVIDERS.length).toBeGreaterThanOrEqual(63)
  })

  it('all system providers have isSystem: true', () => {
    for (const provider of SYSTEM_PROVIDERS) {
      expect(provider.isSystem, `Provider "${provider.id}" should have isSystem: true`).toBe(true)
    }
  })

  it('all system providers have type from PROVIDER_TYPES', () => {
    const validTypes = new Set(PROVIDER_TYPES)
    for (const provider of SYSTEM_PROVIDERS) {
      expect(
        validTypes.has(provider.type),
        `Provider "${provider.id}" has invalid type "${provider.type}"`
      ).toBe(true)
    }
  })

  it('all system providers have required fields', () => {
    for (const provider of SYSTEM_PROVIDERS) {
      expect(provider.id, `Provider missing id`).toBeTruthy()
      expect(provider.name, `Provider "${provider.id}" missing name`).toBeTruthy()
      expect(provider.type, `Provider "${provider.id}" missing type`).toBeTruthy()
      expect(typeof provider.apiHost, `Provider "${provider.id}" apiHost should be string`).toBe('string')
      expect(Array.isArray(provider.models), `Provider "${provider.id}" models should be array`).toBe(true)
    }
  })

  it('all system providers start with empty models array', () => {
    for (const provider of SYSTEM_PROVIDERS) {
      expect(provider.models, `Provider "${provider.id}" should have empty models`).toHaveLength(0)
    }
  })

  it('contains key provider IDs', () => {
    const ids = SYSTEM_PROVIDERS.map((p) => p.id)
    expect(ids).toContain('openai')
    expect(ids).toContain('anthropic')
    expect(ids).toContain('gemini')
    expect(ids).toContain('deepseek')
    expect(ids).toContain('ollama')
    expect(ids).toContain('cherryin')
  })

  it('has no duplicate IDs', () => {
    const ids = SYSTEM_PROVIDERS.map((p) => p.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})

describe('CHERRYAI_PROVIDER', () => {
  it('has correct shape', () => {
    expect(CHERRYAI_PROVIDER.id).toBe('cherryin')
    expect(CHERRYAI_PROVIDER.type).toBe('openai')
    expect(CHERRYAI_PROVIDER.enabled).toBe(true)
    expect(CHERRYAI_PROVIDER.isSystem).toBe(true)
  })

  it('has name set to CherryAI', () => {
    expect(CHERRYAI_PROVIDER.name).toBe('CherryAI')
  })

  it('has non-empty apiHost', () => {
    expect(CHERRYAI_PROVIDER.apiHost).toBeTruthy()
    expect(CHERRYAI_PROVIDER.apiHost).toContain('cherry-ai.com')
  })

  it('has empty models array', () => {
    expect(CHERRYAI_PROVIDER.models).toEqual([])
  })
})

describe('PROVIDER_URLS', () => {
  it('has entries for major providers', () => {
    expect(PROVIDER_URLS).toHaveProperty('openai')
    expect(PROVIDER_URLS).toHaveProperty('anthropic')
    expect(PROVIDER_URLS).toHaveProperty('gemini')
    expect(PROVIDER_URLS).toHaveProperty('deepseek')
    expect(PROVIDER_URLS).toHaveProperty('ollama')
    expect(PROVIDER_URLS).toHaveProperty('groq')
    expect(PROVIDER_URLS).toHaveProperty('mistral')
  })

  it('openai URL entry has api, website, apiKey, docs, and models', () => {
    const openai = PROVIDER_URLS['openai']
    expect(openai.api).toBeTruthy()
    expect(openai.website).toBeTruthy()
    expect(openai.apiKey).toBeTruthy()
    expect(openai.docs).toBeTruthy()
    expect(openai.models).toBeTruthy()
  })

  it('anthropic URL entry has api, website, apiKey, docs, and models', () => {
    const anthropic = PROVIDER_URLS['anthropic']
    expect(anthropic.api).toBeTruthy()
    expect(anthropic.website).toBeTruthy()
    expect(anthropic.apiKey).toBeTruthy()
    expect(anthropic.docs).toBeTruthy()
    expect(anthropic.models).toBeTruthy()
  })

  it('all URL entries have at least a website field', () => {
    for (const [id, urls] of Object.entries(PROVIDER_URLS)) {
      expect(
        urls.website || urls.api,
        `PROVIDER_URLS["${id}"] should have at least a website or api field`
      ).toBeTruthy()
    }
  })

  it('all URLs are valid format', () => {
    const urlPattern = /^https?:\/\/.+/
    for (const [id, urls] of Object.entries(PROVIDER_URLS)) {
      if (urls.api) {
        expect(urls.api, `PROVIDER_URLS["${id}"].api is not a valid URL`).toMatch(urlPattern)
      }
      if (urls.website) {
        expect(urls.website, `PROVIDER_URLS["${id}"].website is not a valid URL`).toMatch(urlPattern)
      }
      if (urls.apiKey) {
        expect(urls.apiKey, `PROVIDER_URLS["${id}"].apiKey is not a valid URL`).toMatch(urlPattern)
      }
      if (urls.docs) {
        expect(urls.docs, `PROVIDER_URLS["${id}"].docs is not a valid URL`).toMatch(urlPattern)
      }
      if (urls.models) {
        expect(urls.models, `PROVIDER_URLS["${id}"].models is not a valid URL`).toMatch(urlPattern)
      }
    }
  })
})
