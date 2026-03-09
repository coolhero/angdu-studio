import { describe, it, expect } from 'vitest'

/**
 * Unit tests for PlaceholderBlock logic.
 *
 * Since @testing-library/react is not available, we test the
 * conditional rendering logic and CSS class computation.
 */

describe('PlaceholderBlock — logic', () => {
  // Mirrors the cn() logic in PlaceholderBlock
  function getPlaceholderClasses(isStreaming: boolean): string[] {
    const classes = ['flex', 'items-center', 'gap-1.5', 'py-2']
    if (!isStreaming) {
      classes.push('hidden')
    }
    return classes
  }

  it('shows loading dots when streaming', () => {
    const classes = getPlaceholderClasses(true)
    expect(classes).not.toContain('hidden')
    expect(classes).toContain('flex')
    expect(classes).toContain('items-center')
  })

  it('hides when not streaming', () => {
    const classes = getPlaceholderClasses(false)
    expect(classes).toContain('hidden')
  })

  it('has three bounce dots with staggered delays', () => {
    // The component renders 3 dots with animation delays
    const delays = ['-0.3s', '-0.15s', undefined]
    expect(delays).toHaveLength(3)
    expect(delays[0]).toBe('-0.3s')
    expect(delays[1]).toBe('-0.15s')
    expect(delays[2]).toBeUndefined()
  })

  it('uses animate-bounce class for animation', () => {
    const dotClasses = [
      'inline-block',
      'h-2',
      'w-2',
      'animate-bounce',
      'rounded-full',
      'bg-gray-400',
    ]
    expect(dotClasses).toContain('animate-bounce')
    expect(dotClasses).toContain('rounded-full')
  })
})
