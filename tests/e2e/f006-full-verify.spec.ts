import { test, expect, _electron } from '@playwright/test'

test('F006 전체 플로우: KB 생성 → 파일 추가 → embedding → 검색', async () => {
  // 사용자의 실제 환경(API key 포함)으로 앱 실행
  const app = await _electron.launch({ args: ['out/main/index.js'] })
  const page = await app.firstWindow()
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(4000)

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('[ERROR]', msg.text())
  })
  page.on('pageerror', (e) => console.log('[PAGE_ERROR]', e.message))

  // --- Step 1: KB 생성 ---
  console.log('\n=== Step 1: KB 생성 ===')
  const kb = await page.evaluate(async () => {
    try {
      return await (window as any).api.invoke['kb:create']({
        name: 'Verify Test KB',
        model: 'text-embedding-3-small',
        dimensions: 1536
      })
    } catch (e: any) {
      return { __error: e.message }
    }
  })

  if ((kb as any).__error) {
    console.log('KB 생성 실패:', (kb as any).__error)
    await app.close()
    return
  }
  console.log('KB 생성 성공:', kb.name, kb.id)

  // --- Step 2: txt 파일 추가 ---
  console.log('\n=== Step 2: 파일 추가 ===')
  const item = await page.evaluate(async (baseId: string) => {
    try {
      return await (window as any).api.invoke['kb:addItem'](baseId, 'file', '/tmp/test-kb-file.txt')
    } catch (e: any) {
      return { __error: e.message }
    }
  }, kb.id)

  if ((item as any).__error) {
    console.log('파일 추가 실패:', (item as any).__error)
    await app.close()
    return
  }
  console.log('파일 추가됨:', item.id, 'status:', item.processingStatus)

  // --- Step 3: 처리 완료 대기 (최대 30초) ---
  console.log('\n=== Step 3: 처리 대기 (최대 30초) ===')
  let finalStatus = 'processing'
  let finalError = ''
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(2000)
    const status = await page.evaluate(async (args: {baseId: string, itemId: string}) => {
      try {
        return await (window as any).api.invoke['kb:getStatus'](args.baseId, args.itemId)
      } catch (e: any) {
        return { status: 'error', error: e.message }
      }
    }, { baseId: kb.id, itemId: item.id })

    finalStatus = status.status
    finalError = status.error || ''
    console.log(`  ${(i+1)*2}s: status=${status.status} progress=${status.progress}% ${status.error ? 'error=' + status.error.substring(0, 100) : ''}`)

    if (status.status === 'completed' || status.status === 'failed') break
  }

  if (finalStatus === 'failed') {
    console.log('\n❌ 파일 처리 실패:', finalError)
    // 정리
    await page.evaluate(async (id: string) => {
      await (window as any).api.invoke['kb:delete'](id)
    }, kb.id)
    await app.close()
    expect(finalStatus).toBe('completed') // fail the test with clear message
    return
  }

  if (finalStatus === 'completed') {
    console.log('\n✅ 파일 처리 완료!')

    // --- Step 4: 검색 ---
    console.log('\n=== Step 4: KB 검색 ===')
    const searchResults = await page.evaluate(async (baseId: string) => {
      try {
        return await (window as any).api.invoke['kb:search']({
          baseId,
          query: 'TypeScript React',
          limit: 5
        })
      } catch (e: any) {
        return { __error: e.message }
      }
    }, kb.id)

    if ((searchResults as any).__error) {
      console.log('검색 실패:', (searchResults as any).__error)
    } else if (Array.isArray(searchResults)) {
      console.log(`검색 결과: ${searchResults.length}건`)
      for (const r of searchResults.slice(0, 3)) {
        console.log(`  [score=${r.score?.toFixed(3)}] ${r.content?.substring(0, 80)}...`)
      }
    }
  }

  // --- 정리 ---
  console.log('\n=== 정리 ===')
  await page.evaluate(async (id: string) => {
    try { await (window as any).api.invoke['kb:delete'](id) } catch {}
  }, kb.id)
  console.log('테스트 KB 삭제 완료')

  await app.close()

  expect(finalStatus).toBe('completed')
})
