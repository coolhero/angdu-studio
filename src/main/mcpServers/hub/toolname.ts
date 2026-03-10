// ── F006-T051: Hub tool name resolution ──
// Converts serverId__toolName format to camelCase JS names and back.

// ── Types ──

export interface ToolNameMapping {
  /** original tool id (serverId__toolName) -> js name */
  toJs: Map<string, string>
  /** js name -> original tool id (serverId__toolName) */
  toOriginal: Map<string, string>
}

export interface ToolIdentity {
  /** original tool id (serverId__toolName) */
  id: string
  /** human-friendly server name */
  serverName: string
  /** raw tool name as reported by the MCP server */
  toolName: string
}

// ── Utilities ──

/**
 * Check if a name uses the namespaced format (serverId__toolName).
 */
export function isNamespacedToolId(name: string): boolean {
  return name.includes('__')
}

/**
 * Convert a string to camelCase.
 * Handles separators: -, _, /, @, spaces.
 * Examples:
 *   "search_repos" -> "searchRepos"
 *   "@angdu/browser" -> "angduBrowser"
 *   "my-tool-name" -> "myToolName"
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[@]/g, '')
    .split(/[-_/\s]+/)
    .filter(Boolean)
    .map((word, i) => (i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
    .join('')
}

function capitalizeFirstLetter(str: string): string {
  if (!str) return str
  return str[0].toUpperCase() + str.slice(1)
}

/**
 * Build a readable JS tool name from (serverName, toolName).
 *
 * Examples:
 *   serverName: "GitHub", toolName: "search_repos" -> "githubSearchRepos"
 *   serverName: "@angdu/browser", toolName: "navigate" -> "angduBrowserNavigate"
 */
export function buildHubJsToolName(serverName: string | undefined, toolName: string): string {
  const serverPart = serverName ? toCamelCase(serverName) : ''
  const toolPart = toCamelCase(toolName)

  if (!serverPart) {
    return toolPart
  }

  return `${serverPart}${capitalizeFirstLetter(toolPart)}`
}

/**
 * Build a bidirectional tool name mapping.
 * If a collision happens, suffixes are added deterministically: name, name_2, name_3...
 */
export function buildToolNameMapping(tools: ToolIdentity[]): ToolNameMapping {
  const sorted = [...tools].sort((a, b) => a.id.localeCompare(b.id))

  const toJs = new Map<string, string>()
  const toOriginal = new Map<string, string>()

  for (const tool of sorted) {
    const base = buildHubJsToolName(tool.serverName, tool.toolName)
    let jsName = base
    let i = 2
    while (toOriginal.has(jsName)) {
      jsName = `${base}_${i}`
      i += 1
    }

    toJs.set(tool.id, jsName)
    toOriginal.set(jsName, tool.id)
  }

  return { toJs, toOriginal }
}

/**
 * Resolve a tool name (JS camelCase or namespaced id) to the original tool id.
 */
export function resolveToolId(mapping: ToolNameMapping, nameOrId: string): string | undefined {
  if (!nameOrId) return undefined

  // Already a namespaced id
  if (isNamespacedToolId(nameOrId)) {
    return nameOrId
  }

  return mapping.toOriginal.get(nameOrId)
}
