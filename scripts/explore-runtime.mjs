// Runtime Exploration Script for Cherry Studio
// Uses Playwright _electron.launch() to explore the Electron app

import { _electron as electron } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const CHERRY_DIR = '/Users/coolhero/Develop/cherry-studio';
const OUTPUT_DIR = '/Users/coolhero/Develop/angdu-studio/specs/reverse-spec';
const VISUAL_DIR = join(OUTPUT_DIR, 'visual-references');

mkdirSync(VISUAL_DIR, { recursive: true });

async function main() {
  console.log('Launching Cherry Studio via electron.launch()...');

  const electronApp = await electron.launch({
    executablePath: join(CHERRY_DIR, 'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'),
    args: [join(CHERRY_DIR, 'out/main/index.js')],
    cwd: CHERRY_DIR,
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
  });

  console.log('Waiting for first window...');
  const page = await electronApp.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000);

  const results = {
    timestamp: new Date().toISOString(),
    screens: [],
    globalObservations: {},
  };

  // Phase A — Initial Landing
  console.log('Phase A: Capturing initial landing...');
  try {
    const title = await page.title();
    const url = await page.url();

    // Get page structure via evaluate (skip accessibility.snapshot())
    const pageInfo = await page.evaluate(() => {
      const body = document.body;
      const rootEl = document.getElementById('root') || document.getElementById('app');

      // Get CSS custom properties
      const cssVars = {};
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText === ':root' || rule.selectorText === ':root, :host') {
              const style = rule.style;
              for (let i = 0; i < style.length; i++) {
                const prop = style[i];
                if (prop.startsWith('--')) {
                  cssVars[prop] = style.getPropertyValue(prop).trim();
                }
              }
            }
          }
        } catch (e) { /* cross-origin */ }
      }

      // Get computed styles for landmark elements
      const landmarks = {};
      for (const tag of ['header', 'nav', 'main', 'aside', 'footer']) {
        const el = document.querySelector(tag);
        if (el) {
          const cs = getComputedStyle(el);
          landmarks[tag] = {
            background: cs.backgroundColor,
            color: cs.color,
            padding: cs.padding,
            fontFamily: cs.fontFamily,
          };
        }
      }

      // Body typography
      const bodyStyle = getComputedStyle(body);
      const typography = {
        fontFamily: bodyStyle.fontFamily,
        fontSize: bodyStyle.fontSize,
        lineHeight: bodyStyle.lineHeight,
        color: bodyStyle.color,
        backgroundColor: bodyStyle.backgroundColor,
      };

      // Find navigation items - multiple strategies
      const navItems = [];
      // Strategy 1: sidebar links
      document.querySelectorAll('[class*="sidebar"] a, [class*="Sidebar"] a').forEach(a => {
        navItems.push({ text: a.textContent?.trim()?.slice(0, 50), href: a.getAttribute('href'), source: 'sidebar' });
      });
      // Strategy 2: nav role
      document.querySelectorAll('[role="navigation"] a, nav a').forEach(a => {
        navItems.push({ text: a.textContent?.trim()?.slice(0, 50), href: a.getAttribute('href'), source: 'nav' });
      });
      // Strategy 3: tabs
      document.querySelectorAll('[role="tab"], [role="tablist"] > *').forEach(el => {
        navItems.push({ text: el.textContent?.trim()?.slice(0, 50), href: el.getAttribute('href') || '', source: 'tab' });
      });

      // DOM tree overview
      const domStructure = [];
      const walk = (el, depth) => {
        if (depth > 3) return;
        const tag = el.tagName?.toLowerCase();
        const cls = el.className?.toString()?.slice(0, 80);
        const id = el.id;
        const role = el.getAttribute?.('role');
        if (tag && (id || cls || role)) {
          domStructure.push({ depth, tag, id, cls, role, childCount: el.children?.length || 0 });
        }
        if (depth < 3) {
          for (const child of (el.children || [])) {
            walk(child, depth + 1);
          }
        }
      };
      if (rootEl) walk(rootEl, 0);

      return {
        title: document.title,
        hash: window.location.hash,
        hasRoot: !!rootEl,
        bodyClasses: body.className?.slice(0, 200),
        cssVars,
        landmarks,
        typography,
        navItems: navItems.filter(n => n.text).slice(0, 30),
        domStructure: domStructure.slice(0, 50),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      };
    });

    // Take screenshot
    await page.screenshot({ path: join(VISUAL_DIR, 'main-window.png'), fullPage: false });
    console.log('  Screenshot captured: main-window.png');

    results.globalObservations = { title, url, pageInfo };
    results.screens.push({ name: 'main-window', route: url, title, pageInfo });

    // Phase B — Navigation Discovery
    console.log('Phase B: Discovering navigation...');

    // Phase C — Screen-by-Screen Survey (explore via hash routes)
    console.log('Phase C: Screen-by-screen survey...');
    const hashRoutes = [
      { hash: '/', name: 'home' },
      { hash: '/settings', name: 'settings' },
      { hash: '/store', name: 'store' },
      { hash: '/translate', name: 'translate' },
      { hash: '/files', name: 'files' },
      { hash: '/notes', name: 'notes' },
      { hash: '/knowledge', name: 'knowledge' },
      { hash: '/apps', name: 'apps' },
      { hash: '/code', name: 'code' },
      { hash: '/paintings', name: 'paintings' },
      { hash: '/launchpad', name: 'launchpad' },
    ];

    for (const { hash, name } of hashRoutes) {
      try {
        console.log(`  Exploring #${hash}...`);
        await page.evaluate((h) => { window.location.hash = h; }, hash);
        await page.waitForTimeout(2000);

        const screenInfo = await page.evaluate(() => {
          const body = document.body;
          // Count interactive elements
          const inputs = document.querySelectorAll('input, textarea, select');
          const buttons = document.querySelectorAll('button');
          const tables = document.querySelectorAll('table');
          const lists = document.querySelectorAll('ul, ol');
          const imgs = document.querySelectorAll('img');

          // Get main content area info
          const mainArea = document.querySelector('[class*="content"], [class*="Content"], [class*="page"], [class*="Page"], main');
          const mainClasses = mainArea?.className?.toString()?.slice(0, 200) || 'N/A';

          // Get headings
          const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
            level: h.tagName,
            text: h.textContent?.trim()?.slice(0, 80),
          })).slice(0, 10);

          // Get visible text sections
          const domSummary = [];
          const root = document.getElementById('root') || document.getElementById('app');
          if (root) {
            const walk = (el, depth) => {
              if (depth > 2) return;
              const tag = el.tagName?.toLowerCase();
              const cls = el.className?.toString()?.slice(0, 100);
              const id = el.id;
              if (tag && (id || cls)) {
                domSummary.push({ depth, tag, id: id || '', cls: cls || '', children: el.children?.length || 0 });
              }
              if (depth < 2) {
                for (const child of Array.from(el.children || []).slice(0, 10)) {
                  walk(child, depth + 1);
                }
              }
            };
            walk(root, 0);
          }

          return {
            hash: window.location.hash,
            title: document.title,
            mainClasses,
            inputCount: inputs.length,
            buttonCount: buttons.length,
            tableCount: tables.length,
            listCount: lists.length,
            imgCount: imgs.length,
            headings,
            domSummary: domSummary.slice(0, 30),
          };
        });

        await page.screenshot({ path: join(VISUAL_DIR, `${name}.png`), fullPage: false });
        console.log(`    Screenshot: ${name}.png`);

        results.screens.push({ name, route: `#${hash}`, info: screenInfo });
      } catch (e) {
        console.log(`    Error exploring #${hash}: ${e.message}`);
        results.screens.push({ name, route: `#${hash}`, error: e.message });
      }
    }

    // Settings sub-pages exploration
    console.log('Phase D: Exploring settings sub-pages...');
    const settingsSubPages = [
      '/settings/provider', '/settings/model', '/settings/assistant',
      '/settings/display', '/settings/general', '/settings/shortcut',
      '/settings/data', '/settings/about',
    ];

    for (const sp of settingsSubPages) {
      try {
        await page.evaluate((h) => { window.location.hash = h; }, sp);
        await page.waitForTimeout(1500);
        const spName = sp.replace('/settings/', 'settings-');
        await page.screenshot({ path: join(VISUAL_DIR, `${spName}.png`), fullPage: false });
        console.log(`    Screenshot: ${spName}.png`);

        const spInfo = await page.evaluate(() => ({
          hash: window.location.hash,
          inputCount: document.querySelectorAll('input, textarea, select').length,
          buttonCount: document.querySelectorAll('button').length,
          headings: Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => h.textContent?.trim()?.slice(0, 60)).slice(0, 15),
        }));
        results.screens.push({ name: spName, route: `#${sp}`, info: spInfo });
      } catch (e) {
        console.log(`    Error: ${e.message}`);
      }
    }

  } catch (err) {
    console.error('Exploration error:', err.message);
    results.error = err.message;
  }

  // Write results
  writeFileSync(
    join(OUTPUT_DIR, 'runtime-exploration-raw.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('Results written to runtime-exploration-raw.json');

  // Cleanup
  console.log('Closing app...');
  await electronApp.close();
  console.log('Done!');
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
