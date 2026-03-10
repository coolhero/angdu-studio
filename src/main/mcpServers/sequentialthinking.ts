// ── F006-T045: @angdu/sequentialthinking built-in MCP server ──
// Provides a structured sequential thinking / chain-of-thought tool.

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

// ── Types ──

interface ThoughtData {
  thought: string
  thoughtNumber: number
  totalThoughts: number
  isRevision?: boolean
  revisesThought?: number
  branchFromThought?: number
  branchId?: string
  needsMoreThoughts?: boolean
  nextThoughtNeeded: boolean
}

// ── Sequential Thinking Engine ──

class SequentialThinkingEngine {
  private thoughtHistory: ThoughtData[] = []
  private branches: Record<string, ThoughtData[]> = {}

  private validateThoughtData(input: unknown): ThoughtData {
    const data = input as Record<string, unknown>

    if (!data.thought || typeof data.thought !== 'string') {
      throw new Error('Invalid thought: must be a string')
    }
    if (!data.thoughtNumber || typeof data.thoughtNumber !== 'number') {
      throw new Error('Invalid thoughtNumber: must be a number')
    }
    if (!data.totalThoughts || typeof data.totalThoughts !== 'number') {
      throw new Error('Invalid totalThoughts: must be a number')
    }
    if (typeof data.nextThoughtNeeded !== 'boolean') {
      throw new Error('Invalid nextThoughtNeeded: must be a boolean')
    }

    return {
      thought: data.thought,
      thoughtNumber: data.thoughtNumber,
      totalThoughts: data.totalThoughts,
      nextThoughtNeeded: data.nextThoughtNeeded,
      isRevision: data.isRevision as boolean | undefined,
      revisesThought: data.revisesThought as number | undefined,
      branchFromThought: data.branchFromThought as number | undefined,
      branchId: data.branchId as string | undefined,
      needsMoreThoughts: data.needsMoreThoughts as boolean | undefined
    }
  }

  private formatThought(data: ThoughtData): string {
    const { thoughtNumber, totalThoughts, thought, isRevision, revisesThought, branchFromThought, branchId } = data

    let prefix: string
    let context = ''

    if (isRevision) {
      prefix = 'Revision'
      context = ` (revising thought ${revisesThought})`
    } else if (branchFromThought) {
      prefix = 'Branch'
      context = ` (from thought ${branchFromThought}, ID: ${branchId})`
    } else {
      prefix = 'Thought'
    }

    return `[${prefix} ${thoughtNumber}/${totalThoughts}${context}] ${thought}`
  }

  processThought(input: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    try {
      const validated = this.validateThoughtData(input)

      if (validated.thoughtNumber > validated.totalThoughts) {
        validated.totalThoughts = validated.thoughtNumber
      }

      this.thoughtHistory.push(validated)

      if (validated.branchFromThought && validated.branchId) {
        if (!this.branches[validated.branchId]) {
          this.branches[validated.branchId] = []
        }
        this.branches[validated.branchId].push(validated)
      }

      const formatted = this.formatThought(validated)
      console.debug(`[SequentialThinking] ${formatted}`)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                thought: validated.thought,
                thoughtNumber: validated.thoughtNumber,
                totalThoughts: validated.totalThoughts,
                nextThoughtNeeded: validated.nextThoughtNeeded,
                branches: Object.keys(this.branches),
                thoughtHistoryLength: this.thoughtHistory.length
              },
              null,
              2
            )
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: error instanceof Error ? error.message : String(error), status: 'failed' }, null, 2)
          }
        ],
        isError: true
      }
    }
  }
}

// ── Tool definition ──

const SEQUENTIAL_THINKING_TOOL: Tool = {
  name: 'sequentialthinking',
  description: `A detailed tool for dynamic and reflective problem-solving through sequential thoughts.
This tool helps analyze problems through a flexible thinking process that can adapt and evolve.
Each thought can build on, question, or revise previous insights as understanding deepens.

When to use this tool:
- Breaking down complex problems into steps
- Planning and design with room for revision
- Analysis that might need course correction
- Problems where the full scope might not be clear initially
- Tasks that need to maintain context over multiple steps

Key features:
- Adjust total_thoughts up or down as you progress
- Question or revise previous thoughts
- Add more thoughts even after reaching what seemed like the end
- Express uncertainty and explore alternative approaches
- Branch or backtrack as needed

Parameters:
- thought: Your current thinking step
- nextThoughtNeeded: Whether another thought step is needed
- thoughtNumber: Current thought number (starts at 1)
- totalThoughts: Estimated total thoughts needed (adjustable)
- isRevision: Whether this revises previous thinking
- revisesThought: Which thought is being reconsidered
- branchFromThought: Branching point thought number
- branchId: Branch identifier
- needsMoreThoughts: If more thoughts are needed beyond the current total`,
  inputSchema: {
    type: 'object',
    properties: {
      thought: { type: 'string', description: 'Your current thinking step' },
      nextThoughtNeeded: { type: 'boolean', description: 'Whether another thought step is needed' },
      thoughtNumber: { type: 'integer', description: 'Current thought number', minimum: 1 },
      totalThoughts: { type: 'integer', description: 'Estimated total thoughts needed', minimum: 1 },
      isRevision: { type: 'boolean', description: 'Whether this revises previous thinking' },
      revisesThought: { type: 'integer', description: 'Which thought is being reconsidered', minimum: 1 },
      branchFromThought: { type: 'integer', description: 'Branching point thought number', minimum: 1 },
      branchId: { type: 'string', description: 'Branch identifier' },
      needsMoreThoughts: { type: 'boolean', description: 'If more thoughts are needed' }
    },
    required: ['thought', 'nextThoughtNeeded', 'thoughtNumber', 'totalThoughts']
  }
}

// ── Server wrapper ──

class ThinkingServer {
  public server: Server
  private engine: SequentialThinkingEngine

  constructor() {
    this.engine = new SequentialThinkingEngine()
    this.server = new Server(
      { name: 'sequential-thinking-server', version: '0.2.0' },
      { capabilities: { tools: {} } }
    )
    this.initialize()
  }

  private initialize(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [SEQUENTIAL_THINKING_TOOL]
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'sequentialthinking') {
        return this.engine.processThought(request.params.arguments)
      }
      return {
        content: [{ type: 'text', text: `Unknown tool: ${request.params.name}` }],
        isError: true
      }
    })
  }
}

export default ThinkingServer
