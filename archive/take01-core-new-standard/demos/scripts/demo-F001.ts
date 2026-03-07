// @demo-only
// This script is for demonstration purposes and should be removed after full UI is built.

import { execSync } from 'node:child_process'

/**
 * F001 App Core Demo Script
 *
 * Launches the Electron app and prints verification steps to the console.
 * Run with: npx tsx demos/scripts/demo-F001.ts
 */
function main(): void {
  console.log('=== Cherry Studio F001 Demo ===')
  console.log('')
  console.log('Starting Cherry Studio in dev mode...')
  console.log('')
  console.log('Verification Steps:')
  console.log('  1. Window should appear with correct title "Cherry Studio"')
  console.log('  2. Window should be resizable and remember its position')
  console.log('  3. File operations: select, read, save, delete should work via IPC')
  console.log('  4. Language switch: Settings > Language > Chinese should update UI')
  console.log('  5. Keyboard shortcuts should register/unregister via globalShortcut')
  console.log('  6. System info: platform, arch, hostname should be retrievable')
  console.log('  7. Zip: compress/decompress roundtrip should produce identical data')
  console.log('  8. Database: SQLite file should exist at config path')
  console.log('  9. Logs: check app data directory for log files')
  console.log('')

  try {
    console.log('Launching app with: pnpm dev')
    execSync('pnpm dev', { stdio: 'inherit' })
  } catch {
    console.log('App exited.')
  }
}

main()
