import type { Preprocessor } from './PreprocessorFactory'

/**
 * Default preprocessor: basic whitespace cleanup.
 */
export class DefaultPreprocessor implements Preprocessor {
  async process(text: string): Promise<string> {
    return text
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Collapse multiple blank lines into one
      .replace(/\n{3,}/g, '\n\n')
      // Trim leading/trailing whitespace per line
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n')
      // Trim the whole string
      .trim()
  }
}
