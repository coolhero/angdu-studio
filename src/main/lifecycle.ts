// Quit prevention state — shared between index.ts and ipc.ts
let stopQuitReason: string | null = null
let isQuitting = false

export function setStopQuit(stop: boolean, reason: string): void {
  stopQuitReason = stop ? reason : null
}

export function getStopQuitReason(): string | null {
  return stopQuitReason
}

export function setIsQuitting(value: boolean): void {
  isQuitting = value
}

export function getIsQuitting(): boolean {
  return isQuitting
}
