// ── F006-T042: @angdu/filesystem built-in MCP server ──
// Provides file system tools: read, write, list, search, move, info, mkdir, read_multiple.

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js'
import { app } from 'electron'
import fs from 'fs/promises'
import path from 'path'

// ── Path validation ──

function validatePath(filePath: string, baseDir: string): string {
  const resolved = path.resolve(baseDir, filePath)
  if (!resolved.startsWith(baseDir)) {
    throw new McpError(ErrorCode.InvalidParams, `Path traversal detected: ${filePath}`)
  }
  return resolved
}

// ── Tool handlers ──

async function handleReadFile(args: Record<string, unknown>, baseDir: string) {
  const filePath = validatePath(String(args.path), baseDir)
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return { content: [{ type: 'text', text: content }] }
  } catch (error) {
    return { content: [{ type: 'text', text: `Error reading file: ${(error as Error).message}` }], isError: true }
  }
}

async function handleWriteFile(args: Record<string, unknown>, baseDir: string) {
  const filePath = validatePath(String(args.path), baseDir)
  const content = String(args.content ?? '')
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, content, 'utf-8')
    return { content: [{ type: 'text', text: `Successfully wrote to ${filePath}` }] }
  } catch (error) {
    return { content: [{ type: 'text', text: `Error writing file: ${(error as Error).message}` }], isError: true }
  }
}

async function handleListDirectory(args: Record<string, unknown>, baseDir: string) {
  const dirPath = validatePath(String(args.path || '.'), baseDir)
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const result = entries.map((e) => `${e.isDirectory() ? '[DIR]' : '[FILE]'} ${e.name}`).join('\n')
    return { content: [{ type: 'text', text: result || '(empty directory)' }] }
  } catch (error) {
    return { content: [{ type: 'text', text: `Error listing directory: ${(error as Error).message}` }], isError: true }
  }
}

async function handleSearchFiles(args: Record<string, unknown>, baseDir: string) {
  const searchPath = validatePath(String(args.path || '.'), baseDir)
  const pattern = String(args.pattern || '')
  const regex = new RegExp(pattern, 'i')
  const results: string[] = []
  const maxResults = 100

  async function search(dir: string): Promise<void> {
    if (results.length >= maxResults) return
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        if (results.length >= maxResults) break
        const fullPath = path.join(dir, entry.name)
        if (regex.test(entry.name)) {
          results.push(path.relative(baseDir, fullPath))
        }
        if (entry.isDirectory()) {
          await search(fullPath)
        }
      }
    } catch {
      // skip inaccessible directories
    }
  }

  await search(searchPath)
  return { content: [{ type: 'text', text: results.length > 0 ? results.join('\n') : 'No matching files found' }] }
}

async function handleMoveFile(args: Record<string, unknown>, baseDir: string) {
  const srcPath = validatePath(String(args.source), baseDir)
  const destPath = validatePath(String(args.destination), baseDir)
  try {
    await fs.mkdir(path.dirname(destPath), { recursive: true })
    await fs.rename(srcPath, destPath)
    return { content: [{ type: 'text', text: `Moved ${srcPath} to ${destPath}` }] }
  } catch (error) {
    return { content: [{ type: 'text', text: `Error moving file: ${(error as Error).message}` }], isError: true }
  }
}

async function handleGetFileInfo(args: Record<string, unknown>, baseDir: string) {
  const filePath = validatePath(String(args.path), baseDir)
  try {
    const stat = await fs.stat(filePath)
    const info = {
      path: filePath,
      size: stat.size,
      isDirectory: stat.isDirectory(),
      isFile: stat.isFile(),
      created: stat.birthtime.toISOString(),
      modified: stat.mtime.toISOString(),
      accessed: stat.atime.toISOString(),
      permissions: stat.mode.toString(8)
    }
    return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] }
  } catch (error) {
    return { content: [{ type: 'text', text: `Error getting file info: ${(error as Error).message}` }], isError: true }
  }
}

async function handleCreateDirectory(args: Record<string, unknown>, baseDir: string) {
  const dirPath = validatePath(String(args.path), baseDir)
  try {
    await fs.mkdir(dirPath, { recursive: true })
    return { content: [{ type: 'text', text: `Created directory: ${dirPath}` }] }
  } catch (error) {
    return { content: [{ type: 'text', text: `Error creating directory: ${(error as Error).message}` }], isError: true }
  }
}

async function handleReadMultipleFiles(args: Record<string, unknown>, baseDir: string) {
  const paths = args.paths as string[]
  if (!Array.isArray(paths)) {
    return { content: [{ type: 'text', text: 'Error: paths must be an array of strings' }], isError: true }
  }
  const results: string[] = []
  for (const p of paths) {
    try {
      const filePath = validatePath(p, baseDir)
      const content = await fs.readFile(filePath, 'utf-8')
      results.push(`--- ${p} ---\n${content}`)
    } catch (error) {
      results.push(`--- ${p} ---\nError: ${(error as Error).message}`)
    }
  }
  return { content: [{ type: 'text', text: results.join('\n\n') }] }
}

// ── Server class ──

export class FileSystemServer {
  public server: Server
  private baseDir: string

  constructor(baseDir?: string) {
    if (baseDir && path.isAbsolute(baseDir)) {
      this.baseDir = baseDir
    } else {
      const userData = app.getPath('userData')
      this.baseDir = path.join(userData, 'Data', 'Workspace')
    }

    this.server = new Server(
      { name: 'filesystem-server', version: '1.0.0' },
      { capabilities: { tools: {} } }
    )

    this.initialize()
  }

  private async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true })
    } catch {
      // ignore if already exists
    }

    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'read_file',
          description: 'Read the contents of a file',
          inputSchema: {
            type: 'object',
            properties: { path: { type: 'string', description: 'File path relative to workspace root' } },
            required: ['path']
          }
        },
        {
          name: 'write_file',
          description: 'Write content to a file (creates directories as needed)',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'File path relative to workspace root' },
              content: { type: 'string', description: 'Content to write' }
            },
            required: ['path', 'content']
          }
        },
        {
          name: 'list_directory',
          description: 'List files and directories in a path',
          inputSchema: {
            type: 'object',
            properties: { path: { type: 'string', description: 'Directory path (default: workspace root)' } }
          }
        },
        {
          name: 'search_files',
          description: 'Search for files matching a regex pattern',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'Starting directory' },
              pattern: { type: 'string', description: 'Regex pattern to match file names' }
            },
            required: ['pattern']
          }
        },
        {
          name: 'move_file',
          description: 'Move or rename a file',
          inputSchema: {
            type: 'object',
            properties: {
              source: { type: 'string', description: 'Source path' },
              destination: { type: 'string', description: 'Destination path' }
            },
            required: ['source', 'destination']
          }
        },
        {
          name: 'get_file_info',
          description: 'Get file metadata (size, timestamps, permissions)',
          inputSchema: {
            type: 'object',
            properties: { path: { type: 'string', description: 'File path' } },
            required: ['path']
          }
        },
        {
          name: 'create_directory',
          description: 'Create a directory (recursive)',
          inputSchema: {
            type: 'object',
            properties: { path: { type: 'string', description: 'Directory path to create' } },
            required: ['path']
          }
        },
        {
          name: 'read_multiple_files',
          description: 'Read multiple files at once',
          inputSchema: {
            type: 'object',
            properties: { paths: { type: 'array', items: { type: 'string' }, description: 'Array of file paths' } },
            required: ['paths']
          }
        }
      ]
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params
        const toolArgs = (args ?? {}) as Record<string, unknown>

        switch (name) {
          case 'read_file': return await handleReadFile(toolArgs, this.baseDir)
          case 'write_file': return await handleWriteFile(toolArgs, this.baseDir)
          case 'list_directory': return await handleListDirectory(toolArgs, this.baseDir)
          case 'search_files': return await handleSearchFiles(toolArgs, this.baseDir)
          case 'move_file': return await handleMoveFile(toolArgs, this.baseDir)
          case 'get_file_info': return await handleGetFileInfo(toolArgs, this.baseDir)
          case 'create_directory': return await handleCreateDirectory(toolArgs, this.baseDir)
          case 'read_multiple_files': return await handleReadMultipleFiles(toolArgs, this.baseDir)
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`)
        }
      } catch (error) {
        if (error instanceof McpError) throw error
        return {
          content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
          isError: true
        }
      }
    })
  }
}

export default FileSystemServer
