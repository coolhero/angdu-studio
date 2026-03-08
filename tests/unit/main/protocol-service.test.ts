import { describe, it, expect } from 'vitest'

describe('Protocol URL Parsing', () => {
  it('parses angdu-studio:// URLs correctly', () => {
    const url = 'angdu-studio://settings?tab=theme'
    const parsed = new URL(url)

    expect(parsed.protocol).toBe('angdu-studio:')
    expect(parsed.hostname).toBe('settings')
    expect(parsed.searchParams.get('tab')).toBe('theme')
  })

  it('extracts all query params', () => {
    const url = 'angdu-studio://install?name=test-server&url=https://example.com'
    const parsed = new URL(url)
    const params: Record<string, string> = {}
    parsed.searchParams.forEach((value, key) => {
      params[key] = value
    })

    expect(params).toEqual({
      name: 'test-server',
      url: 'https://example.com'
    })
  })

  it('handles URL without params', () => {
    const url = 'angdu-studio://settings'
    const parsed = new URL(url)

    expect(parsed.hostname).toBe('settings')
    expect([...parsed.searchParams.entries()]).toHaveLength(0)
  })
})
