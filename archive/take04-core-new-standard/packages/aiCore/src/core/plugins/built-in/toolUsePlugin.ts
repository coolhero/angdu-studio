// Tool Use Plugin — prompt-based tool calling for models without native function call (F003)

import type { AiPlugin, AiRequestContext } from '../types'

export interface ToolUsePluginOptions {
  toolDescriptions: Record<string, string>
  toolExecutors: Record<string, (args: Record<string, unknown>) => Promise<unknown>>
}

export function createToolUsePlugin(options: ToolUsePluginOptions): AiPlugin {
  const { toolDescriptions, toolExecutors } = options

  // Build tool description prompt
  const toolPrompt = Object.entries(toolDescriptions)
    .map(([name, desc]) => `- ${name}: ${desc}`)
    .join('\n')

  return {
    name: 'ai-core:tool-use',

    transformParams(params: any, _context: AiRequestContext) {
      // Inject tool descriptions into system message
      if (!params.system) {
        params.system = ''
      }
      params.system += `\n\nAvailable tools:\n${toolPrompt}\n\nTo use a tool, respond with: <tool name="TOOL_NAME">{"arg": "value"}</tool>`
      return params
    },

    async transformResult(result: any, context: AiRequestContext) {
      if (!result.text) return result

      // Check for tool call patterns in response
      const toolCallPattern = /<tool name="(\w+)">([\s\S]*?)<\/tool>/g
      let match
      const toolResults: Array<{ tool: string; result: unknown }> = []

      while ((match = toolCallPattern.exec(result.text)) !== null) {
        const [, toolName, argsJson] = match
        const executor = toolExecutors[toolName]
        if (executor) {
          try {
            const args = JSON.parse(argsJson)
            const toolResult = await executor(args)
            toolResults.push({ tool: toolName, result: toolResult })
          } catch {
            // Skip malformed tool calls
          }
        }
      }

      if (toolResults.length > 0) {
        return { ...result, toolResults }
      }

      return result
    }
  }
}
