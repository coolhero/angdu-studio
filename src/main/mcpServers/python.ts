// ── F006-T048: @angdu/python built-in MCP server ──
// Executes Python code via child_process.spawn.

import { spawn } from 'node:child_process'

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js'

// ── Python execution ──

function executePython(
  code: string,
  env?: Record<string, string>,
  timeout = 30000
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const proc = spawn('python3', ['-c', code], {
      env: { ...process.env, ...env },
      timeout,
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data: Buffer) => { stdout += data.toString() })
    proc.stderr.on('data', (data: Buffer) => { stderr += data.toString() })

    proc.on('close', (exitCode) => {
      resolve({ stdout, stderr, exitCode: exitCode ?? 1 })
    })

    proc.on('error', (error) => {
      reject(new Error(`Failed to execute Python: ${error.message}`))
    })
  })
}

// ── Server class ──

class PythonServer {
  public server: Server

  constructor() {
    this.server = new Server(
      { name: 'python-server', version: '1.0.0' },
      { capabilities: { tools: {} } }
    )

    this.setupRequestHandlers()
  }

  private setupRequestHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'execute_python',
          description: 'Execute Python 3 code. Returns stdout, stderr, and exit code.',
          inputSchema: {
            type: 'object',
            properties: {
              code: { type: 'string', description: 'Python code to execute' },
              env: {
                type: 'object',
                description: 'Optional environment variables',
                additionalProperties: { type: 'string' }
              }
            },
            required: ['code']
          }
        }
      ]
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      if (name !== 'execute_python') {
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`)
      }

      if (!args || typeof args.code !== 'string') {
        throw new McpError(ErrorCode.InvalidParams, 'code parameter is required and must be a string')
      }

      try {
        const result = await executePython(
          args.code as string,
          args.env as Record<string, string> | undefined
        )

        const output = [
          result.stdout ? `--- stdout ---\n${result.stdout}` : '',
          result.stderr ? `--- stderr ---\n${result.stderr}` : '',
          `--- exit code: ${result.exitCode} ---`
        ].filter(Boolean).join('\n')

        return {
          content: [{ type: 'text', text: output }],
          isError: result.exitCode !== 0
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Python execution failed: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    })
  }
}

export default PythonServer
