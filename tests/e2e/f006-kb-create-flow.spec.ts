import { test, expect, _electron } from '@playwright/test'

test('KB creation → auto-select → content area shows', async () => {
  const app = await _electron.launch({ args: ['out/main/index.js'] })
  const page = await app.firstWindow()
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(3000)

  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  // Navigate to knowledge
  await page.evaluate(() => { window.location.hash = '#/knowledge' })
  await page.waitForTimeout(2000)

  // Create KB via IPC
  const kb = await page.evaluate(async () => {
    try {
      const result = await (window as any).api.invoke['kb:create']({
        name: 'Auto-Select Test',
        model: 'text-embedding-3-small',
        dimensions: 1536
      })
      // Also add to store and select
      return result
    } catch (e: any) {
      return { error: e.message }
    }
  })
  console.log('KB created:', JSON.stringify(kb))

  // Wait for store update
  await page.waitForTimeout(1000)

  // Check if the KB appears in sidebar AND is selected (content area shows)
  const bodyText = await page.textContent('body')
  console.log('Body after create:', bodyText?.substring(0, 500))

  // Check that content area now shows (not "Select a knowledge base")
  const hasSelectPrompt = bodyText?.includes('Select a knowledge base')
  const hasKBName = bodyText?.includes('Auto-Select Test')
  console.log('Still shows select prompt:', hasSelectPrompt)
  console.log('Shows KB name:', hasKBName)

  // Add a txt file to test processing
  await page.evaluate(async (kbId: string) => {
    try {
      const result = await (window as any).api.invoke['kb:addItem'](kbId, 'file', '/tmp/test-kb-file.txt')
      console.log('Add file result:', JSON.stringify(result))
    } catch (e: any) {
      console.error('Add file error:', e.message)
    }
  }, kb.id)

  await page.waitForTimeout(3000)

  // Check final status
  const finalStatus = await page.evaluate(async (args: {baseId: string}) => {
    const bases = await (window as any).api.invoke['kb:getAll']()
    const base = bases?.find((b: any) => b.id === args.baseId)
    return base?.items?.map((i: any) => ({
      id: i.id,
      status: i.processingStatus,
      error: i.processingError
    }))
  }, { baseId: kb.id })
  console.log('Final item statuses:', JSON.stringify(finalStatus))

  console.log('Console errors:', errors.filter(e => !e.includes('ResizeObserver')))

  await app.close()
})
