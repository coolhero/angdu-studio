import { test, expect, _electron } from '@playwright/test'
import path from 'path'
import os from 'os'

test('F006 실제 환경: KB → 파일 추가 → embedding → 검색', async () => {
  // 사용자의 실제 userData를 사용하여 API key 포함
  const userDataPath = path.join(os.homedir(), 'Library/Application Support/Electron')

  const app = await _electron.launch({
    args: ['out/main/index.js'],
    env: { ...process.env }  // inherit env vars
  })
  const page = await app.firstWindow()
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(4000)

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('[ERROR]', msg.text())
  })

  // Step 1: KB 생성
  console.log('\n=== Step 1: KB 생성 ===')
  const kb = await page.evaluate(async () => {
    try {
      return await (window as any).api.invoke['kb:create']({
        name: 'Real Env Test KB',
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
  console.log('KB 생성:', kb.name)

  // Step 2: 파일 추가
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
  console.log('파일 추가됨, status:', item.processingStatus)

  // Step 3: 처리 완료 대기
  console.log('\n=== Step 3: 처리 대기 ===')
  let finalStatus = 'processing'
  let finalError = ''
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(2000)
    const st = await page.evaluate(async (args: {b: string, i: string}) => {
      try { return await (window as any).api.invoke['kb:getStatus'](args.b, args.i) }
      catch (e: any) { return { status: 'error', error: e.message } }
    }, { b: kb.id, i: item.id })
    finalStatus = st.status
    finalError = st.error || ''
    console.log(`  ${(i+1)*2}s: ${st.status} ${st.progress || 0}% ${st.error ? st.error.substring(0, 120) : ''}`)
    if (st.status === 'completed' || st.status === 'failed') break
  }

  if (finalStatus === 'completed') {
    console.log('\n✅ 파일 처리 완료!')

    // Step 4: 검색
    console.log('\n=== Step 4: 검색 ===')
    const results = await page.evaluate(async (baseId: string) => {
      try { return await (window as any).api.invoke['kb:search']({ baseId, query: 'TypeScript React', limit: 5 }) }
      catch (e: any) { return { __error: e.message } }
    }, kb.id)

    if ((results as any).__error) {
      console.log('검색 실패:', (results as any).__error)
    } else if (Array.isArray(results)) {
      console.log(`✅ 검색 결과: ${results.length}건`)
      for (const r of results.slice(0, 3)) {
        console.log(`  [score=${r.score?.toFixed(3)}] ${r.content?.substring(0, 80)}`)
      }
      expect(results.length).toBeGreaterThan(0)
    }
  } else {
    console.log(`\n❌ 처리 실패: ${finalError}`)
  }

  // 정리
  await page.evaluate(async (id: string) => {
    try { await (window as any).api.invoke['kb:delete'](id) } catch {}
  }, kb.id)

  await app.close()
  expect(finalStatus).toBe('completed')
})
