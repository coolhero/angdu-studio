import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APP_PROTOCOL } from '@shared/constants'

const { mockApp } = vi.hoisted(() => ({
  mockApp: {
    setAsDefaultProtocolClient: vi.fn().mockReturnValue(true),
    getPath: vi.fn().mockReturnValue('/mock'),
    getName: vi.fn().mockReturnValue('Cherry Studio')
  }
}))

vi.mock('electron', () => ({
  app: mockApp
}))

import { ProtocolService } from '../ProtocolService'

describe('ProtocolService', () => {
  let service: ProtocolService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ProtocolService()
  })

  it('should register protocol handler', () => {
    service.register()
    expect(mockApp.setAsDefaultProtocolClient).toHaveBeenCalledWith(APP_PROTOCOL)
  })

  it('should parse valid URL', () => {
    const result = service.parseUrl(`${APP_PROTOCOL}://action/path?key=value`)
    expect(result).toEqual({
      protocol: `${APP_PROTOCOL}:`,
      host: 'action',
      pathname: '/path',
      searchParams: expect.any(URLSearchParams)
    })
    expect(result!.searchParams.get('key')).toBe('value')
  })

  it('should return null for malformed URL', () => {
    const result = service.parseUrl('not-a-valid-url')
    expect(result).toBeNull()
  })

  it('should return null for wrong protocol', () => {
    const result = service.parseUrl('http://example.com')
    expect(result).toBeNull()
  })

  it('should use cherry-studio protocol', () => {
    expect(APP_PROTOCOL).toBe('cherry-studio')
  })
})
