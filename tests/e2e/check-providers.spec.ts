import { test, type ElectronApplication, type Page } from '@playwright/test'
import { _electron as electron } from 'playwright'
import path from 'path'

let app: ElectronApplication
let page: Page

test.beforeAll(async () => {
  app = await electron.launch({
    args: [path.join(__dirname, '../../out/main/index.js')],
    timeout: 30000
  })
  page = await app.firstWindow()
  await page.waitForTimeout(3000)
})

test.afterAll(async () => {
  if (app) await app.close()
})

test('Check provider configuration', async () => {
  const providerData = await page.evaluate(() => {
    try {
      const raw = localStorage.getItem('provider-store')
      if (!raw) return { found: false }
      const data = JSON.parse(raw)
      const providers = data?.state?.providers || []
      return {
        found: true,
        total: providers.length,
        enabled: providers.filter((p: any) => p.enabled).map((p: any) => ({
          id: p.id,
          name: p.name,
          hasKey: !!p.apiKey,
          modelCount: p.models?.length || 0
        }))
      }
    } catch { return { found: false, error: 'parse error' } }
  })
  console.log('PROVIDERS:', JSON.stringify(providerData, null, 2))
})
