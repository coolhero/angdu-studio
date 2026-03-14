/**
 * verify-cherry-runtime.ts
 *
 * Launches Cherry Studio with Playwright and captures runtime defaults.
 * Outputs a markdown file with verified default values for reverse-spec patching.
 *
 * Usage:
 *   npx tsx scripts/verify-cherry-runtime.ts
 *
 * Requires:
 *   - Cherry Studio built at CHERRY_DIR (default: /Users/coolhero/Develop/cherry-studio)
 *   - @playwright/test installed
 */

import { _electron, type ElectronApplication, type Page } from '@playwright/test'
import * as path from 'path'

const CHERRY_DIR = process.env.CHERRY_DIR || '/Users/coolhero/Develop/cherry-studio'

async function main() {
  console.log('# Cherry Studio Runtime Defaults Verification')
  console.log('')
  console.log(`**Source**: ${CHERRY_DIR}`)
  console.log(`**Date**: ${new Date().toISOString().split('T')[0]}`)
  console.log('')

  // Check built output exists
  const mainEntry = path.join(CHERRY_DIR, 'out/main/index.js')

  console.log('## 1. App Launch')
  console.log('')

  const app: ElectronApplication = await _electron.launch({
    args: [mainEntry],
    cwd: CHERRY_DIR,
  })

  const page: Page = await app.firstWindow()
  await page.waitForTimeout(4000) // Wait for full render + Redux hydration

  const winSize = await page.evaluate(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }))
  console.log(`- Window size: ${winSize.w}×${winSize.h}`)
  console.log('')

  // ─── 2. Layout Mode Default ──────────────────────────────────

  console.log('## 2. Layout Mode Default')
  console.log('')

  const navbarPosition = await page.evaluate(() => {
    // Check body/html attributes
    const bodyAttr = document.body.getAttribute('navbar-position')
    const htmlAttr = document.documentElement.getAttribute('navbar-position')
    // Check any element with the attribute
    const anyEl = document.querySelector('[navbar-position]')
    const anyAttr = anyEl?.getAttribute('navbar-position')
    return { bodyAttr, htmlAttr, anyAttr }
  })
  console.log(`- body[navbar-position]: \`${navbarPosition.bodyAttr || 'not set'}\``)
  console.log(`- html[navbar-position]: \`${navbarPosition.htmlAttr || 'not set'}\``)
  console.log(`- any[navbar-position]: \`${navbarPosition.anyAttr || 'not set'}\``)

  // Check for sidebar vs tabs
  const hasSidebar = await page.$('#app-sidebar')
  const hasTabsBar = await page.evaluate(() => {
    // Look for tab-like elements at the top
    const els = document.querySelectorAll('[class*="tab"], [class*="Tab"]')
    return els.length
  })
  console.log(`- Sidebar (#app-sidebar): ${hasSidebar ? 'present' : '**not present**'}`)
  console.log(`- Tab elements: ${hasTabsBar}`)

  const effectiveMode = hasSidebar ? 'left' : 'top'
  console.log(`- **Effective default mode: \`${effectiveMode}\`**`)
  console.log('')

  // ─── 3. CSS Variables ────────────────────────────────────────

  console.log('## 3. CSS Variables (computed)')
  console.log('')

  const cssVars = await page.evaluate(() => {
    const root = document.documentElement
    const s = getComputedStyle(root)
    return {
      navbarHeight: s.getPropertyValue('--navbar-height').trim(),
      sidebarWidth: s.getPropertyValue('--sidebar-width').trim(),
      colorPrimary: s.getPropertyValue('--color-primary').trim(),
      colorBorder: s.getPropertyValue('--color-border').trim(),
      colorBackground: s.getPropertyValue('--color-background').trim(),
      listItemBorderRadius: s.getPropertyValue('--list-item-border-radius').trim(),
      assistantsWidth: s.getPropertyValue('--assistants-width').trim(),
      topicListWidth: s.getPropertyValue('--topic-list-width').trim(),
      settingsWidth: s.getPropertyValue('--settings-width').trim(),
    }
  })
  console.log('| Variable | Value |')
  console.log('|----------|-------|')
  for (const [key, val] of Object.entries(cssVars)) {
    console.log(`| --${key.replace(/([A-Z])/g, '-$1').toLowerCase()} | \`${val || 'not set'}\` |`)
  }
  console.log('')

  // ─── 4. Theme Default ────────────────────────────────────────

  console.log('## 4. Theme Default')
  console.log('')

  const themeInfo = await page.evaluate(() => {
    const html = document.documentElement
    const body = document.body
    return {
      htmlClass: html.className,
      bodyClass: body.className,
      htmlThemeAttr: html.getAttribute('theme') || html.getAttribute('data-theme'),
      bodyBgColor: getComputedStyle(body).backgroundColor,
      prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
    }
  })
  console.log(`- html class: \`${themeInfo.htmlClass || '(empty)'}\``)
  console.log(`- body class: \`${themeInfo.bodyClass || '(empty)'}\``)
  console.log(`- theme attribute: \`${themeInfo.htmlThemeAttr || 'not set'}\``)
  console.log(`- body background: \`${themeInfo.bodyBgColor}\``)
  console.log(`- prefers-color-scheme: dark: \`${themeInfo.prefersDark}\``)
  console.log('')

  // ─── 5. Layout Structure (DOM) ───────────────────────────────

  console.log('## 5. Layout Structure')
  console.log('')

  const layoutStructure = await page.evaluate(() => {
    const root = document.getElementById('root')
    if (!root) return { error: '#root not found' }

    const rootStyle = getComputedStyle(root)
    const children = Array.from(root.children).map((child) => {
      const el = child as HTMLElement
      const s = getComputedStyle(el)
      return {
        tag: el.tagName,
        id: el.id,
        className: el.className?.substring?.(0, 80) || '',
        display: s.display,
        flexDirection: s.flexDirection,
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height,
      }
    })

    return {
      rootDisplay: rootStyle.display,
      rootFlexDirection: rootStyle.flexDirection,
      rootWidth: root.getBoundingClientRect().width,
      rootHeight: root.getBoundingClientRect().height,
      children,
    }
  })

  console.log(`- #root: display=\`${layoutStructure.rootDisplay}\`, flex-direction=\`${layoutStructure.rootFlexDirection}\`, ${layoutStructure.rootWidth}×${layoutStructure.rootHeight}`)
  console.log(`- Direct children: ${layoutStructure.children?.length || 0}`)
  if (layoutStructure.children) {
    for (const child of layoutStructure.children) {
      console.log(`  - \`<${child.tag}#${child.id}>\` (${child.className.substring(0, 50)}) — ${child.width}×${child.height}, display=${child.display}, flex=${child.flexDirection}`)
    }
  }
  console.log('')

  // ─── 6. Drag Regions ─────────────────────────────────────────

  console.log('## 6. Drag Regions')
  console.log('')

  const dragRegions = await page.evaluate(() => {
    const all = document.querySelectorAll('*')
    const results: { tag: string; id: string; cls: string; x: number; y: number; w: number; h: number }[] = []
    all.forEach((el) => {
      const s = getComputedStyle(el) as unknown as Record<string, string>
      if (s['-webkit-app-region'] === 'drag') {
        const r = el.getBoundingClientRect()
        results.push({
          tag: el.tagName,
          id: (el as HTMLElement).id,
          cls: el.className?.substring?.(0, 40) || '',
          x: r.x, y: r.y, w: r.width, h: r.height,
        })
      }
    })
    return results
  })

  console.log('| Element | Position | Size |')
  console.log('|---------|----------|------|')
  for (const d of dragRegions) {
    console.log(`| ${d.tag}#${d.id} (${d.cls}) | (${d.x}, ${d.y}) | ${d.w}×${d.h} |`)
  }
  console.log('')

  // ─── 7. Redux/Store State ────────────────────────────────────

  console.log('## 7. Settings Store Defaults')
  console.log('')

  const storeDefaults = await page.evaluate(() => {
    // Try to read Redux store or localStorage
    const results: Record<string, string> = {}

    // Check localStorage keys
    const lsKeys = Object.keys(localStorage)
    for (const key of lsKeys) {
      if (key.includes('navbar') || key.includes('theme') || key.includes('sidebar') || key.includes('position') || key.includes('persist')) {
        const val = localStorage.getItem(key)
        results[`localStorage:${key}`] = val?.substring(0, 200) || ''
      }
    }

    return results
  })

  if (Object.keys(storeDefaults).length > 0) {
    console.log('| Key | Value |')
    console.log('|-----|-------|')
    for (const [key, val] of Object.entries(storeDefaults)) {
      console.log(`| ${key} | \`${val.substring(0, 100)}\` |`)
    }
  } else {
    console.log('*No relevant localStorage entries found*')
  }
  console.log('')

  // ─── Summary ─────────────────────────────────────────────────

  console.log('## Summary: Runtime-Verified Defaults')
  console.log('')
  console.log('| Setting | Code Analysis | Runtime Verified |')
  console.log('|---------|--------------|-----------------|')
  console.log(`| navbarPosition | \`left\` (assumed) | **\`${effectiveMode}\`** |`)
  console.log(`| --navbar-height | 44px | \`${cssVars.navbarHeight}\` |`)
  console.log(`| --sidebar-width | 50px | \`${cssVars.sidebarWidth}\` |`)
  console.log(`| --color-primary | #1677ff (assumed) | \`${cssVars.colorPrimary}\` |`)
  console.log('')
  console.log('> Use these values to patch `specs/reverse-spec/features/F002-navigation/pre-context.md`')
  console.log('> and update the F002 spec defaults before re-running the pipeline.')

  await app.close()
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
