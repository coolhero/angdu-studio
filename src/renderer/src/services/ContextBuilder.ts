import type { ChatMessage } from '@shared/types/ai-core'
import type { Assistant } from '@shared/types/assistant'
import type { Message, MessageBlock } from '@shared/types/message'

/**
 * Build a ChatMessage[] array for the AI API call.
 * Applies contextCount windowing, variable replacement in system prompt,
 * and formats messages with their block content.
 */
export function buildContext(
  assistant: Assistant,
  messages: Message[],
  blocksByMessage: Record<string, MessageBlock[]>,
  modelId?: string
): ChatMessage[] {
  const result: ChatMessage[] = []

  // System prompt with variable replacement
  const systemPrompt = replaceVariables(assistant.prompt, modelId)
  if (systemPrompt.trim()) {
    result.push({ role: 'system', content: systemPrompt })
  }

  // Apply contextCount windowing — take last N messages
  const contextCount = assistant.settings.contextCount
  const windowed = contextCount > 0 ? messages.slice(-contextCount) : messages

  for (const msg of windowed) {
    // Skip system and divider messages
    if (msg.type === 'clear_context' || msg.type === 'divider') continue

    const blocks = blocksByMessage[msg.id] ?? []
    const content = extractTextFromBlocks(blocks)

    if (content.trim()) {
      result.push({
        role: msg.role as 'user' | 'assistant',
        content
      })
    }
  }

  return result
}

function replaceVariables(prompt: string, modelId?: string): string {
  const now = new Date()
  return prompt
    .replace(/\{\{date\}\}/g, now.toLocaleDateString())
    .replace(/\{\{time\}\}/g, now.toLocaleTimeString())
    .replace(/\{\{model\}\}/g, modelId ?? 'unknown')
    .replace(/\{\{datetime\}\}/g, now.toLocaleString())
}

function extractTextFromBlocks(blocks: MessageBlock[]): string {
  const parts: string[] = []
  for (const block of blocks) {
    switch (block.type) {
      case 'main_text':
        parts.push(block.content.text)
        break
      case 'code':
        parts.push(`\`\`\`${block.content.language}\n${block.content.code}\n\`\`\``)
        break
      case 'thinking':
        // Don't include thinking in context
        break
      case 'error':
        // Don't include errors in context
        break
      default:
        // For other block types, try to extract text if present
        if ('text' in block.content && typeof block.content.text === 'string') {
          parts.push(block.content.text)
        }
    }
  }
  return parts.join('\n\n')
}
