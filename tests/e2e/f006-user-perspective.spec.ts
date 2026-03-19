import { test, _electron } from '@playwright/test'

test('F006 — 사용자가 보는 화면 그대로 캡처', async () => {
  const app = await _electron.launch({ args: ['out/main/index.js'] })
  const page = await app.firstWindow()
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(3000)

  // 모든 콘솔 출력 캡처
  page.on('console', (msg) => console.log(`[${msg.type()}]`, msg.text()))
  page.on('pageerror', (e) => console.log('[PAGE_ERROR]', e.message))

  // 1. Knowledge 페이지 이동
  await page.evaluate(() => { window.location.hash = '#/knowledge' })
  await page.waitForTimeout(2000)

  // 사용자가 보는 화면 전체 텍스트
  console.log('\n=== 1. Knowledge 페이지 진입 ===')
  console.log('화면 텍스트:', (await page.textContent('body'))?.replace(/\s+/g, ' ').substring(0, 500))

  // 2. KB 생성 (IPC로 — UI 팝업은 Playwright로 조작 어려움)
  console.log('\n=== 2. KB 생성 ===')
  await page.evaluate(async () => {
    await (window as any).api.invoke['kb:create']({
      name: 'Test PDF KB',
      model: 'text-embedding-3-small',
      dimensions: 1536
    })
  })
  // hydrate로 store 갱신
  await page.evaluate(async () => {
    const bases = await (window as any).api.invoke['kb:getAll']()
    console.log('KB 목록:', JSON.stringify(bases?.map((b: any) => ({ id: b.id, name: b.name }))))
  })
  await page.waitForTimeout(1000)

  // 3. 페이지 다시 로드해서 hydrate 트리거
  await page.evaluate(() => { window.location.hash = '#/' })
  await page.waitForTimeout(500)
  await page.evaluate(() => { window.location.hash = '#/knowledge' })
  await page.waitForTimeout(2000)

  console.log('\n=== 3. KB 생성 후 페이지 ===')
  const afterCreate = (await page.textContent('body'))?.replace(/\s+/g, ' ')
  console.log('화면 텍스트:', afterCreate?.substring(0, 800))

  // KB가 선택되었는지 확인 (Files/Notes/Directories 탭이 보이는지)
  const hasTabs = afterCreate?.includes('Files') || afterCreate?.includes('Notes')
  console.log('Content 탭 보임:', hasTabs)

  // 4. 파일 추가 시도
  console.log('\n=== 4. 파일 추가 ===')
  const bases = await page.evaluate(() => (window as any).api.invoke['kb:getAll']())
  if (bases && bases.length > 0) {
    const baseId = bases[bases.length - 1].id
    console.log('대상 KB:', bases[bases.length - 1].name, baseId)

    // txt 파일 추가
    const txtResult = await page.evaluate(async (id: string) => {
      try {
        const item = await (window as any).api.invoke['kb:addItem'](id, 'file', '/tmp/test-kb-file.txt')
        return { ok: true, item: { id: item.id, status: item.processingStatus } }
      } catch (e: any) {
        return { ok: false, error: e.message }
      }
    }, baseId)
    console.log('txt 추가:', JSON.stringify(txtResult))

    // 5초 대기 후 상태 확인
    await page.waitForTimeout(5000)

    const statuses = await page.evaluate(async (id: string) => {
      const all = await (window as any).api.invoke['kb:getAll']()
      const kb = all?.find((b: any) => b.id === id)
      return kb?.items?.map((i: any) => ({
        type: i.type,
        status: i.processingStatus,
        progress: i.processingProgress,
        error: i.processingError?.substring(0, 200)
      }))
    }, baseId)
    console.log('\n=== 5. 처리 결과 ===')
    console.log('아이템 상태:', JSON.stringify(statuses, null, 2))
  }

  // 6. 채팅 페이지에서 KB 버튼 확인
  console.log('\n=== 6. 채팅 KB 버튼 ===')
  await page.evaluate(() => { window.location.hash = '#/chat' })
  await page.waitForTimeout(2000)

  // input 영역의 버튼 수와 내용
  const inputButtons = await page.evaluate(() => {
    const inputArea = document.querySelector('.border-t.border-border')
    if (!inputArea) return { found: false }
    const buttons = inputArea.querySelectorAll('button')
    return {
      found: true,
      count: buttons.length,
      titles: Array.from(buttons).map(b => b.getAttribute('title') || b.textContent?.trim() || '(no title)')
    }
  })
  console.log('Input 버튼:', JSON.stringify(inputButtons))

  // 7. Settings > Memory 확인
  console.log('\n=== 7. Memory 설정 ===')
  await page.evaluate(() => { window.location.hash = '#/settings/memory' })
  await page.waitForTimeout(2000)
  const memoryText = (await page.textContent('body'))?.replace(/\s+/g, ' ')
  console.log('Memory 페이지:', memoryText?.substring(0, 300))

  await app.close()
})
