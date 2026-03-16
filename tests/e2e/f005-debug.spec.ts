import { test, _electron as electron } from '@playwright/test'
import path from 'path'

test('Debug: capture rendered HTML', async () => {
  const app = await electron.launch({
    args: [path.join(__dirname, '../../out/main/index.js')],
    env: { ...process.env, NODE_ENV: 'production' },
  })
  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(8000)

  const html = await page.locator('#root').innerHTML()
  console.log('=== ROOT HTML (first 3000 chars) ===')
  console.log(html.substring(0, 3000))
  console.log('=== END ===')

  // Also check for any contenteditable
  const editables = await page.locator('[contenteditable]').count()
  console.log(`Contenteditable elements: ${editables}`)

  // Check for input/textarea
  const inputs = await page.locator('input, textarea').count()
  console.log(`Input/textarea elements: ${inputs}`)

  await app.close()
})
