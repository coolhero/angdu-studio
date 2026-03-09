export enum ChatEvent {
  SEND_MESSAGE = 'SEND_MESSAGE',
  CLEAR_MESSAGES = 'CLEAR_MESSAGES',
  NEW_CONTEXT = 'NEW_CONTEXT',
  NEW_BRANCH = 'NEW_BRANCH',
  EDIT_CODE_BLOCK = 'EDIT_CODE_BLOCK',
  EDIT_MESSAGE = 'EDIT_MESSAGE',
  LOCATE_MESSAGE = 'LOCATE_MESSAGE',
  SHOW_TOPIC_SIDEBAR = 'SHOW_TOPIC_SIDEBAR',
  ESTIMATED_TOKEN_COUNT = 'ESTIMATED_TOKEN_COUNT',
  ADD_NEW_TOPIC = 'ADD_NEW_TOPIC',
}

type EventHandler = (...args: unknown[]) => void

class EventService {
  private listeners = new Map<string, Set<EventHandler>>()

  on(event: ChatEvent, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)

    return () => {
      this.listeners.get(event)?.delete(handler)
    }
  }

  off(event: ChatEvent, handler: EventHandler): void {
    this.listeners.get(event)?.delete(handler)
  }

  emit(event: ChatEvent, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        handler(...args)
      } catch (err) {
        console.error(`[EventService] Error in handler for ${event}:`, err)
      }
    })
  }

  removeAllListeners(event?: ChatEvent): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }
}

export const eventService = new EventService()
