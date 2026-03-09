const MAX_OUTPUT_LENGTH = 5000
const TRUNCATION_SUFFIX = '\n... [output truncated]'

/**
 * Truncates long tool output strings to prevent UI performance issues.
 * Returns the original string if under the limit, otherwise truncates
 * and appends a suffix indicating truncation.
 */
export function truncateOutput(
  output: string,
  maxLength: number = MAX_OUTPUT_LENGTH
): string {
  if (!output) return output
  if (output.length <= maxLength) return output
  return output.slice(0, maxLength) + TRUNCATION_SUFFIX
}
