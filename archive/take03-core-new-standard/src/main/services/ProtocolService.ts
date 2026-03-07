import { app } from 'electron'
import { APP_PROTOCOL } from '@shared/constants'

interface ParsedUrl {
  protocol: string
  host: string
  pathname: string
  searchParams: URLSearchParams
}

export class ProtocolService {
  register(): void {
    app.setAsDefaultProtocolClient(APP_PROTOCOL)
  }

  parseUrl(rawUrl: string): ParsedUrl | null {
    try {
      const url = new URL(rawUrl)
      if (url.protocol !== `${APP_PROTOCOL}:`) {
        return null
      }
      return {
        protocol: url.protocol,
        host: url.host,
        pathname: url.pathname,
        searchParams: url.searchParams
      }
    } catch {
      return null
    }
  }
}
