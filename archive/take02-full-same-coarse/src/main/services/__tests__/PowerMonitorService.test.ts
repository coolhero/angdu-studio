import { beforeEach, describe, expect, it, vi } from 'vitest'

const powerMonitorHandlers: Record<string, Array<(...args: unknown[]) => void>> = {}

vi.mock('electron', () => ({
  powerMonitor: {
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (!powerMonitorHandlers[event]) {
        powerMonitorHandlers[event] = []
      }
      powerMonitorHandlers[event].push(handler)
    })
  }
}))

vi.mock('@main/services/LoggerService', () => ({
  loggerService: {
    withContext: vi.fn().mockReturnValue({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    })
  }
}))

describe('PowerMonitorService', () => {
  let PowerMonitorService: typeof import('../PowerMonitorService').PowerMonitorService

  beforeEach(async () => {
    vi.clearAllMocks()
    // Clear handler registry
    for (const key of Object.keys(powerMonitorHandlers)) {
      delete powerMonitorHandlers[key]
    }
    vi.resetModules()
    const mod = await import('../PowerMonitorService')
    PowerMonitorService = mod.PowerMonitorService
  })

  describe('initialization', () => {
    it('should subscribe to suspend event', async () => {
      const service = new PowerMonitorService()
      service.init()

      const { powerMonitor } = vi.mocked(await import('electron'))
      expect(powerMonitor.on).toHaveBeenCalledWith('suspend', expect.any(Function))
    })

    it('should subscribe to shutdown event', async () => {
      const service = new PowerMonitorService()
      service.init()

      const { powerMonitor } = vi.mocked(await import('electron'))
      expect(powerMonitor.on).toHaveBeenCalledWith('shutdown', expect.any(Function))
    })

    it('should subscribe to lock-screen event', async () => {
      const service = new PowerMonitorService()
      service.init()

      const { powerMonitor } = vi.mocked(await import('electron'))
      expect(powerMonitor.on).toHaveBeenCalledWith('lock-screen', expect.any(Function))
    })

    it('should not initialize twice', async () => {
      const service = new PowerMonitorService()
      service.init()
      service.init()

      const { powerMonitor } = vi.mocked(await import('electron'))
      // Each event should only be registered once
      const suspendCalls = (powerMonitor.on as unknown as ReturnType<typeof vi.fn>).mock.calls.filter(
        (call: unknown[]) => call[0] === 'suspend'
      )
      expect(suspendCalls.length).toBe(1)
    })
  })

  describe('onStateChange', () => {
    it('should register a callback', () => {
      const service = new PowerMonitorService()
      const callback = vi.fn()

      service.onStateChange(callback)
      // Callback should be stored but not yet called
      expect(callback).not.toHaveBeenCalled()
    })

    it('should invoke callback on suspend event', () => {
      const service = new PowerMonitorService()
      const callback = vi.fn()

      service.onStateChange(callback)
      service.init()

      // Simulate suspend event
      const suspendHandlers = powerMonitorHandlers.suspend || []
      for (const handler of suspendHandlers) handler()

      expect(callback).toHaveBeenCalledOnce()
    })

    it('should invoke callback on shutdown event', () => {
      const service = new PowerMonitorService()
      const callback = vi.fn()

      service.onStateChange(callback)
      service.init()

      // Simulate shutdown event
      const shutdownHandlers = powerMonitorHandlers.shutdown || []
      for (const handler of shutdownHandlers) handler()

      expect(callback).toHaveBeenCalledOnce()
    })

    it('should invoke callback on lock-screen event', () => {
      const service = new PowerMonitorService()
      const callback = vi.fn()

      service.onStateChange(callback)
      service.init()

      // Simulate lock-screen event
      const lockScreenHandlers = powerMonitorHandlers['lock-screen'] || []
      for (const handler of lockScreenHandlers) handler()

      expect(callback).toHaveBeenCalledOnce()
    })

    it('should support multiple callbacks', () => {
      const service = new PowerMonitorService()
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      service.onStateChange(callback1)
      service.onStateChange(callback2)
      service.init()

      // Simulate suspend event
      const suspendHandlers = powerMonitorHandlers.suspend || []
      for (const handler of suspendHandlers) handler()

      expect(callback1).toHaveBeenCalledOnce()
      expect(callback2).toHaveBeenCalledOnce()
    })
  })
})
