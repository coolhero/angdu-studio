// AI Core Error Hierarchy (F003)

export class AiCoreError extends Error {
  readonly code: string
  readonly context: Record<string, unknown>
  override readonly cause?: Error

  constructor(code: string, message: string, context: Record<string, unknown> = {}, cause?: Error) {
    super(message)
    this.name = 'AiCoreError'
    this.code = code
    this.context = context
    this.cause = cause
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      cause: this.cause
        ? {
            name: this.cause.name,
            message: this.cause.message
          }
        : undefined
    }
  }
}

export class ModelResolutionError extends AiCoreError {
  constructor(message: string, context: Record<string, unknown> = {}, cause?: Error) {
    super('MODEL_RESOLUTION_ERROR', message, context, cause)
    this.name = 'ModelResolutionError'
  }
}

export class ParameterValidationError extends AiCoreError {
  constructor(message: string, context: Record<string, unknown> = {}, cause?: Error) {
    super('PARAMETER_VALIDATION_ERROR', message, context, cause)
    this.name = 'ParameterValidationError'
  }
}

export class PluginExecutionError extends AiCoreError {
  constructor(message: string, context: Record<string, unknown> = {}, cause?: Error) {
    super('PLUGIN_EXECUTION_ERROR', message, context, cause)
    this.name = 'PluginExecutionError'
  }
}

export class ProviderConfigError extends AiCoreError {
  constructor(message: string, context: Record<string, unknown> = {}, cause?: Error) {
    super('PROVIDER_CONFIG_ERROR', message, context, cause)
    this.name = 'ProviderConfigError'
  }
}

export class TemplateLoadError extends AiCoreError {
  constructor(message: string, context: Record<string, unknown> = {}, cause?: Error) {
    super('TEMPLATE_LOAD_ERROR', message, context, cause)
    this.name = 'TemplateLoadError'
  }
}

export class RecursiveDepthError extends AiCoreError {
  constructor(message: string, context: Record<string, unknown> = {}, cause?: Error) {
    super('RECURSIVE_DEPTH_ERROR', message, context, cause)
    this.name = 'RecursiveDepthError'
  }
}
