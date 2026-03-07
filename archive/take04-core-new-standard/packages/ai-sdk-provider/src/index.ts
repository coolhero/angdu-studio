// CherryIN Provider Package (F003)

export type { CherryInProviderSettings } from './types'
export type { CherryInProvider } from './cherryin-provider'
export { createCherryInProvider as createCherryIn } from './cherryin-provider'

// Default singleton instance
import { createCherryInProvider } from './cherryin-provider'
export const cherryIn = createCherryInProvider()
