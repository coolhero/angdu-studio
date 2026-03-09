import { describe, it, expect, beforeEach, vi } from 'vitest'
import { eventService, ChatEvent } from '../../../src/renderer/src/services/EventService'

describe('EventService', () => {
  beforeEach(() => {
    eventService.removeAllListeners()
  })

  describe('on / emit', () => {
    it('calls registered handler when event is emitted', () => {
      const handler = vi.fn()
      eventService.on(ChatEvent.SEND_MESSAGE, handler)
      eventService.emit(ChatEvent.SEND_MESSAGE)

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('passes arguments to the handler', () => {
      const handler = vi.fn()
      eventService.on(ChatEvent.SEND_MESSAGE, handler)
      eventService.emit(ChatEvent.SEND_MESSAGE, 'hello', 42)

      expect(handler).toHaveBeenCalledWith('hello', 42)
    })

    it('supports multiple handlers for the same event', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      eventService.on(ChatEvent.SEND_MESSAGE, handler1)
      eventService.on(ChatEvent.SEND_MESSAGE, handler2)

      eventService.emit(ChatEvent.SEND_MESSAGE)

      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('does not call handlers for different events', () => {
      const handler = vi.fn()
      eventService.on(ChatEvent.SEND_MESSAGE, handler)
      eventService.emit(ChatEvent.CLEAR_MESSAGES)

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('off', () => {
    it('removes a specific handler', () => {
      const handler = vi.fn()
      eventService.on(ChatEvent.SEND_MESSAGE, handler)
      eventService.off(ChatEvent.SEND_MESSAGE, handler)
      eventService.emit(ChatEvent.SEND_MESSAGE)

      expect(handler).not.toHaveBeenCalled()
    })

    it('does not affect other handlers for the same event', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      eventService.on(ChatEvent.SEND_MESSAGE, handler1)
      eventService.on(ChatEvent.SEND_MESSAGE, handler2)

      eventService.off(ChatEvent.SEND_MESSAGE, handler1)
      eventService.emit(ChatEvent.SEND_MESSAGE)

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).toHaveBeenCalledTimes(1)
    })
  })

  describe('unsubscribe function', () => {
    it('returns an unsubscribe function from on()', () => {
      const handler = vi.fn()
      const unsubscribe = eventService.on(ChatEvent.SEND_MESSAGE, handler)

      unsubscribe()
      eventService.emit(ChatEvent.SEND_MESSAGE)

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('removeAllListeners', () => {
    it('removes all listeners for a specific event', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      eventService.on(ChatEvent.SEND_MESSAGE, handler1)
      eventService.on(ChatEvent.CLEAR_MESSAGES, handler2)

      eventService.removeAllListeners(ChatEvent.SEND_MESSAGE)
      eventService.emit(ChatEvent.SEND_MESSAGE)
      eventService.emit(ChatEvent.CLEAR_MESSAGES)

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('removes all listeners when called without arguments', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      eventService.on(ChatEvent.SEND_MESSAGE, handler1)
      eventService.on(ChatEvent.CLEAR_MESSAGES, handler2)

      eventService.removeAllListeners()
      eventService.emit(ChatEvent.SEND_MESSAGE)
      eventService.emit(ChatEvent.CLEAR_MESSAGES)

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('does not break other handlers when one throws', () => {
      const errorHandler = vi.fn(() => {
        throw new Error('handler error')
      })
      const safeHandler = vi.fn()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      eventService.on(ChatEvent.SEND_MESSAGE, errorHandler)
      eventService.on(ChatEvent.SEND_MESSAGE, safeHandler)

      eventService.emit(ChatEvent.SEND_MESSAGE)

      expect(errorHandler).toHaveBeenCalledTimes(1)
      expect(safeHandler).toHaveBeenCalledTimes(1)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })
})
