import { test, expect, _electron } from '@playwright/test'
import type { ElectronApplication, Page } from '@playwright/test'

test('F006 PDF upload full flow — capture all errors', async () => {
  const app = await _electron.launch({ args: ['out/main/index.js'] })
  const page = await app.firstWindow()
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(3000)

  // Collect ALL console output
  const logs: string[] = []
  const errors: string[] = []
  page.on('console', (msg) => {
    const text = `[${msg.type()}] ${msg.text()}`
    logs.push(text)
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (e) => errors.push(`PAGE_ERROR: ${e.message}`))

  // 1. Navigate to knowledge page
  await page.evaluate(() => { window.location.hash = '#/knowledge' })
  await page.waitForTimeout(2000)
  console.log('=== Step 1: Knowledge page loaded ===')
  console.log('Body text preview:', (await page.textContent('body'))?.substring(0, 300))

  // 2. Try to create a KB via IPC directly (bypass UI to test backend)
  console.log('=== Step 2: Creating KB via IPC ===')
  const createResult = await page.evaluate(async () => {
    try {
      const kb = await (window as any).api.invoke['kb:create']({
        name: 'Test KB',
        model: 'text-embedding-3-small',
        dimensions: 1536
      })
      return { success: true, kb }
    } catch (e: any) {
      return { success: false, error: e.message || String(e) }
    }
  })
  console.log('KB create result:', JSON.stringify(createResult, null, 2))

  if (createResult.success && createResult.kb) {
    // 3. Try to add a file item
    console.log('=== Step 3: Adding file to KB ===')
    const addResult = await page.evaluate(async (kbId: string) => {
      try {
        // Use a simple text file for testing
        const item = await (window as any).api.invoke['kb:addItem'](
          kbId, 'file', '/tmp/test-kb-file.txt'
        )
        return { success: true, item }
      } catch (e: any) {
        return { success: false, error: e.message || String(e) }
      }
    }, createResult.kb.id)
    console.log('Add file result:', JSON.stringify(addResult, null, 2))

    // Wait for processing
    await page.waitForTimeout(5000)

    // 4. Check item status
    console.log('=== Step 4: Checking item status ===')
    if (addResult.success && addResult.item) {
      const statusResult = await page.evaluate(async (args: {baseId: string, itemId: string}) => {
        try {
          const status = await (window as any).api.invoke['kb:getStatus'](args.baseId, args.itemId)
          return { success: true, status }
        } catch (e: any) {
          return { success: false, error: e.message || String(e) }
        }
      }, { baseId: createResult.kb.id, itemId: addResult.item.id })
      console.log('Status result:', JSON.stringify(statusResult, null, 2))
    }
  }

  // 5. Print all collected errors
  console.log('=== Collected errors ===')
  for (const e of errors) {
    console.log('ERROR:', e)
  }
  console.log('=== Collected logs (last 20) ===')
  for (const l of logs.slice(-20)) {
    console.log(l)
  }

  await app.close()
})
