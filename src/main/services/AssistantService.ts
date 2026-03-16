import { nanoid } from 'nanoid'
import ElectronStore from 'electron-store'
import type { Assistant } from '@shared/types/assistant'
import { DEFAULT_ASSISTANT } from '@shared/types/assistant'
import { ChatService } from './ChatService'
import { logger } from './LoggerService'

const Store =
  (ElectronStore as unknown as { default?: typeof ElectronStore }).default ?? ElectronStore

interface AssistantStoreSchema {
  assistants: Assistant[]
}

export class AssistantService {
  private static instance: AssistantService
  private assistants: Assistant[] = []
  private store!: ElectronStore<AssistantStoreSchema>

  static getInstance(): AssistantService {
    if (!AssistantService.instance) {
      AssistantService.instance = new AssistantService()
    }
    return AssistantService.instance
  }

  initialize(): void {
    this.store = new Store<AssistantStoreSchema>({
      name: 'assistants',
      defaults: { assistants: [] }
    })
    this.assistants = this.store.get('assistants') ?? []
    this.ensureDefaultAssistant()
    logger.info('[AssistantService] Initialized')
  }

  private ensureDefaultAssistant(): void {
    const hasDefault = this.assistants.some((a) => a.id === 'default')
    if (!hasDefault) {
      this.assistants.unshift({ ...DEFAULT_ASSISTANT })
      this.persist()
    }
  }

  getAll(): Assistant[] {
    return [...this.assistants]
  }

  add(data: Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'>): Assistant {
    const now = new Date().toISOString()
    const assistant: Assistant = {
      ...data,
      id: nanoid(21),
      createdAt: now,
      updatedAt: now
    }
    this.assistants.push(assistant)
    this.persist()
    logger.info(`[AssistantService] Added assistant ${assistant.id}`)
    return assistant
  }

  update(id: string, updates: Partial<Assistant>): Assistant {
    const idx = this.assistants.findIndex((a) => a.id === id)
    if (idx === -1) {
      throw Object.assign(new Error(`Assistant not found: ${id}`), {
        code: 'NOT_FOUND'
      })
    }

    // Protect default assistant's isDefault flag
    if (this.assistants[idx].isDefault && updates.isDefault === false) {
      throw Object.assign(
        new Error('Cannot modify isDefault flag of the default assistant'),
        { code: 'DEFAULT_IMMUTABLE' }
      )
    }

    this.assistants[idx] = {
      ...this.assistants[idx],
      ...updates,
      id, // Prevent ID change
      updatedAt: new Date().toISOString()
    }
    this.persist()
    return { ...this.assistants[idx] }
  }

  delete(id: string): void {
    if (id === 'default') {
      throw Object.assign(new Error('Cannot delete the default assistant'), {
        code: 'DEFAULT_PROTECTED'
      })
    }

    const idx = this.assistants.findIndex((a) => a.id === id)
    if (idx === -1) {
      throw Object.assign(new Error(`Assistant not found: ${id}`), {
        code: 'NOT_FOUND'
      })
    }

    // Reassign topics to default assistant
    const chatService = ChatService.getInstance()
    chatService.reassignTopics(id, 'default')

    this.assistants.splice(idx, 1)
    this.persist()
    logger.info(`[AssistantService] Deleted assistant ${id}, topics reassigned to default`)
  }

  importAssistants(data: string): Assistant[] {
    let parsed: unknown
    try {
      parsed = JSON.parse(data)
    } catch {
      throw Object.assign(new Error('Invalid JSON format'), {
        code: 'INVALID_FORMAT'
      })
    }

    if (!Array.isArray(parsed)) {
      throw Object.assign(new Error('Expected an array of assistants'), {
        code: 'INVALID_FORMAT'
      })
    }

    const now = new Date().toISOString()
    const imported: Assistant[] = []

    for (const item of parsed) {
      if (!item || typeof item !== 'object' || !item.name) {
        continue // Skip invalid entries
      }

      const assistant: Assistant = {
        id: nanoid(21), // Generate new ID to avoid collisions
        name: item.name ?? 'Imported Assistant',
        emoji: item.emoji,
        description: item.description,
        prompt: item.prompt ?? '',
        topics: [], // Topics are device-specific, don't import
        model: item.model,
        settings: {
          temperature: item.settings?.temperature ?? 0.7,
          topP: item.settings?.topP ?? 1,
          maxTokens: item.settings?.maxTokens ?? 0,
          contextCount: item.settings?.contextCount ?? 20,
          streamOutput: item.settings?.streamOutput ?? true,
          ...(item.settings?.reasoning_effort && {
            reasoning_effort: item.settings.reasoning_effort
          })
        },
        tags: item.tags,
        category: item.category,
        mcpMode: item.mcpMode,
        mcpServers: item.mcpServers,
        isDefault: false, // Never import as default
        createdAt: now,
        updatedAt: now
      }

      this.assistants.push(assistant)
      imported.push(assistant)
    }

    if (imported.length > 0) {
      this.persist()
      logger.info(`[AssistantService] Imported ${imported.length} assistants`)
    }

    return imported
  }

  exportAssistants(ids: string[]): string {
    const toExport = this.assistants
      .filter((a) => ids.includes(a.id))
      .map((a) => {
        // Exclude runtime-only fields
        const { topics: _topics, ...rest } = a
        return rest
      })

    return JSON.stringify(toExport, null, 2)
  }

  private persist(): void {
    this.store.set('assistants', this.assistants)
  }
}
