import { test as base, type ElectronApplication, _electron as electron } from '@playwright/test'
import { resolve } from 'path'

interface ElectronFixtures {
  electronApp: ElectronApplication
}

export const test = base.extend<ElectronFixtures>({
  electronApp: async ({}, use) => {
    const app = await electron.launch({
      args: [resolve(__dirname, '../../../dist-electron/main/index.js')]
    })
    await use(app)
    await app.close()
  }
})

export { expect } from '@playwright/test'
