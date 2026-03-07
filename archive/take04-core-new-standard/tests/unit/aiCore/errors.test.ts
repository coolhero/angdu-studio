import { describe, it, expect } from 'vitest'
import {
  AiCoreError,
  ModelResolutionError,
  ParameterValidationError,
  PluginExecutionError,
  ProviderConfigError,
  TemplateLoadError,
  RecursiveDepthError
} from '@aiCore/core/errors'

describe('Error Hierarchy', () => {
  describe('AiCoreError', () => {
    it('should have code, message, and context', () => {
      const error = new AiCoreError('TEST_ERROR', 'Test message', { key: 'value' })
      expect(error.code).toBe('TEST_ERROR')
      expect(error.message).toBe('Test message')
      expect(error.context).toEqual({ key: 'value' })
      expect(error.name).toBe('AiCoreError')
    })

    it('should support cause chain', () => {
      const cause = new Error('root cause')
      const error = new AiCoreError('CHAIN', 'Wrapper', {}, cause)
      expect(error.cause).toBe(cause)
      expect(error.cause!.message).toBe('root cause')
    })

    it('should serialize to JSON', () => {
      const cause = new Error('root')
      const error = new AiCoreError('CODE', 'msg', { foo: 'bar' }, cause)
      const json = error.toJSON()
      expect(json).toEqual({
        name: 'AiCoreError',
        code: 'CODE',
        message: 'msg',
        context: { foo: 'bar' },
        cause: { name: 'Error', message: 'root' }
      })
    })

    it('should serialize without cause when absent', () => {
      const error = new AiCoreError('CODE', 'msg')
      const json = error.toJSON()
      expect(json.cause).toBeUndefined()
    })
  })

  describe('instanceof checks', () => {
    it('ModelResolutionError should be instanceof AiCoreError', () => {
      const error = new ModelResolutionError('model not found', { modelId: 'x' })
      expect(error).toBeInstanceOf(AiCoreError)
      expect(error).toBeInstanceOf(ModelResolutionError)
      expect(error).toBeInstanceOf(Error)
      expect(error.code).toBe('MODEL_RESOLUTION_ERROR')
      expect(error.name).toBe('ModelResolutionError')
    })

    it('ParameterValidationError instanceof check', () => {
      const error = new ParameterValidationError('bad param')
      expect(error).toBeInstanceOf(AiCoreError)
      expect(error.code).toBe('PARAMETER_VALIDATION_ERROR')
      expect(error.name).toBe('ParameterValidationError')
    })

    it('PluginExecutionError instanceof check', () => {
      const error = new PluginExecutionError('plugin failed', { plugin: 'test' })
      expect(error).toBeInstanceOf(AiCoreError)
      expect(error.code).toBe('PLUGIN_EXECUTION_ERROR')
      expect(error.name).toBe('PluginExecutionError')
    })

    it('ProviderConfigError instanceof check', () => {
      const error = new ProviderConfigError('bad config')
      expect(error).toBeInstanceOf(AiCoreError)
      expect(error.code).toBe('PROVIDER_CONFIG_ERROR')
      expect(error.name).toBe('ProviderConfigError')
    })

    it('TemplateLoadError instanceof check', () => {
      const error = new TemplateLoadError('template missing')
      expect(error).toBeInstanceOf(AiCoreError)
      expect(error.code).toBe('TEMPLATE_LOAD_ERROR')
      expect(error.name).toBe('TemplateLoadError')
    })

    it('RecursiveDepthError instanceof check', () => {
      const error = new RecursiveDepthError('too deep', { depth: 11 })
      expect(error).toBeInstanceOf(AiCoreError)
      expect(error.code).toBe('RECURSIVE_DEPTH_ERROR')
      expect(error.name).toBe('RecursiveDepthError')
    })
  })

  describe('error narrowing', () => {
    it('should narrow correctly in catch block', () => {
      const error: Error = new ModelResolutionError('test', { modelId: 'gpt-4' })
      if (error instanceof ModelResolutionError) {
        expect(error.context.modelId).toBe('gpt-4')
      } else {
        expect.unreachable('Should have matched ModelResolutionError')
      }
    })
  })
})
