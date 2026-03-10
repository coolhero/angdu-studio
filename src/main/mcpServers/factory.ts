// ── F006-T041: Built-in MCP Server Factory ──

import type { Server } from '@modelcontextprotocol/sdk/server/index.js'
import type { BuiltinMCPServerName } from '@shared/types/mcp'
import { BuiltinMCPServerNames } from '@shared/types/mcp'

import BraveSearchServer from './brave-search'
import BrowserServer from './browser'
import DiDiMcpServer from './didi-mcp'
import DifyKnowledgeServer from './dify-knowledge'
import FetchServer from './fetch'
import FileSystemServer from './filesystem'
import HubServer from './hub'
import MemoryServer from './memory'
import PythonServer from './python'
import ThinkingServer from './sequentialthinking'

/**
 * Create an in-memory MCP server instance by name.
 *
 * Each built-in server exposes a `.server` property (the low-level MCP `Server`)
 * that can be connected to an `InMemoryTransport` pair inside `MCPService`.
 */
export function createInMemoryMCPServer(
  name: BuiltinMCPServerName,
  args: string[] = [],
  envs: Record<string, string> = {}
): Server {
  console.debug(`[MCPFactory] Creating in-memory MCP server: ${name} with args: ${JSON.stringify(args)} and envs: ${JSON.stringify(envs)}`)

  switch (name) {
    case BuiltinMCPServerNames.memory: {
      const envPath = envs.MEMORY_FILE_PATH
      return new MemoryServer(envPath).server
    }
    case BuiltinMCPServerNames.sequentialThinking: {
      return new ThinkingServer().server
    }
    case BuiltinMCPServerNames.braveSearch: {
      return new BraveSearchServer(envs.BRAVE_API_KEY).server
    }
    case BuiltinMCPServerNames.fetch: {
      return new FetchServer().server
    }
    case BuiltinMCPServerNames.filesystem: {
      return new FileSystemServer(envs.WORKSPACE_ROOT).server
    }
    case BuiltinMCPServerNames.difyKnowledge: {
      const difyKey = envs.DIFY_KEY
      return new DifyKnowledgeServer(difyKey, args).server
    }
    case BuiltinMCPServerNames.python: {
      return new PythonServer().server
    }
    case BuiltinMCPServerNames.didiMCP: {
      const apiKey = envs.DIDI_API_KEY
      return new DiDiMcpServer(apiKey).server
    }
    case BuiltinMCPServerNames.browser: {
      return new BrowserServer().server
    }
    case BuiltinMCPServerNames.hub: {
      return new HubServer().server
    }
    default:
      throw new Error(`Unknown in-memory MCP server: ${name}`)
  }
}
