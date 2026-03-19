import type { PreprocessProviderType } from '@shared/types/knowledge'
import { DefaultPreprocessor } from './DefaultPreprocessor'

/**
 * Interface that all preprocessors must implement.
 */
export interface Preprocessor {
  process(text: string): Promise<string>
}

/**
 * Factory function to get a preprocessor by type.
 * Currently only 'default' is implemented; other types return the default preprocessor.
 */
export function getPreprocessor(type?: PreprocessProviderType): Preprocessor {
  switch (type) {
    case 'openai':
    case 'custom':
      // TODO: Implement provider-specific preprocessors
      return new DefaultPreprocessor()
    case 'default':
    default:
      return new DefaultPreprocessor()
  }
}
