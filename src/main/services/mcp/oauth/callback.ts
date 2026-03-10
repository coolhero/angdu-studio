// ── F006: OAuth Callback Server for MCP ──

import type EventEmitter from 'events'
import http from 'node:http'
import { URL } from 'node:url'

import type { OAuthCallbackServerOptions } from './types'

/**
 * Lightweight HTTP server that listens for OAuth authorization code callbacks.
 * Starts on the given port, waits for a single code, then can be closed.
 */
export class CallBackServer {
  private server: Promise<http.Server>
  private events: EventEmitter

  constructor(options: OAuthCallbackServerOptions) {
    const { port, path: callbackPath, events } = options
    this.events = events
    this.server = this.initialize(port, callbackPath)
  }

  private initialize(port: number, callbackPath: string): Promise<http.Server> {
    const server = http.createServer((req, res) => {
      if (req.url?.startsWith(callbackPath)) {
        try {
          const url = new URL(req.url, `http://127.0.0.1:${port}`)
          const code = url.searchParams.get('code')

          if (code) {
            this.events.emit('auth-code-received', code)
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
            res.end(`
              <!DOCTYPE html>
              <html>
                <head><meta charset="utf-8"><title>Authorization Complete</title></head>
                <body style="font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;margin:0">
                  <div style="text-align:center">
                    <h1>Authorization Complete</h1>
                    <p>You can close this window and return to Angdu Studio.</p>
                  </div>
                </body>
              </html>
            `)
          } else {
            res.writeHead(400, { 'Content-Type': 'text/plain' })
            res.end('Missing authorization code')
          }
        } catch (error) {
          console.error('[OAuthCallback] Error processing callback:', error)
          res.writeHead(500, { 'Content-Type': 'text/plain' })
          res.end('Internal Server Error')
        }
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Not Found')
      }
    })

    server.on('error', (error) => {
      console.error('[OAuthCallback] Server error:', error)
    })

    return new Promise<http.Server>((resolve, reject) => {
      server.listen(port, '127.0.0.1', () => {
        console.debug(`[OAuthCallback] Listening on 127.0.0.1:${port}`)
        resolve(server)
      })

      server.on('error', (error) => {
        reject(error)
      })
    })
  }

  get getServer(): Promise<http.Server> {
    return this.server
  }

  async close(): Promise<void> {
    const server = await this.server
    server.close()
  }

  async waitForAuthCode(): Promise<string> {
    return new Promise((resolve) => {
      this.events.once('auth-code-received', (code: string) => {
        resolve(code)
      })
    })
  }
}
