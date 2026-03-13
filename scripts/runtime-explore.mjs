import { _electron } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const CHERRY_DIR = '/Users/coolhero/Develop/cherry-studio';
const OUTPUT_DIR = '/Users/coolhero/Develop/angdu-studio/specs/reverse-spec';
const VISUAL_DIR = join(OUTPUT_DIR, 'visual-references');
const MAX_SCREENS = 20;
const SCREEN_TIMEOUT = 10000;

mkdirSync(VISUAL_DIR, { recursive: true });

const results = {
  screens: [],
  navItems: [],
  globalPatterns: {},
  errors: []
};

async function explore() {
  console.log('Launching Electron app...');

  const electronApp = await _electron.launch({
    executablePath: join(CHERRY_DIR, 'node_modules/.bin/electron'),
    args: [join(CHERRY_DIR, 'out/main/index.js')],
    cwd: CHERRY_DIR,
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  });

  console.log('Electron app launched, waiting for first window...');

  const window = await electronApp.firstWindow();
  await window.waitForLoadState('domcontentloaded');
  console.log('First window loaded');

  // Wait for app to settle
  await window.waitForTimeout(5000);

  // Console error collection
  const consoleErrors = [];
  window.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Phase A — Initial Landing
  console.log('Phase A: Initial Landing...');
  const title = await window.title();
  const url = await window.url();
  console.log(`Title: ${title}, URL: ${url}`);

  // Get accessibility snapshot
  let snapshot;
  try {
    snapshot = await window.accessibility.snapshot();
    results.globalPatterns.initialSnapshot = snapshot ?
      JSON.stringify(snapshot, null, 2).substring(0, 5000) : 'No snapshot available';
  } catch (e) {
    console.log('Accessibility snapshot failed:', e.message);
    results.globalPatterns.initialSnapshot = 'Failed: ' + e.message;
  }

  // Take initial screenshot
  await window.screenshot({ path: join(VISUAL_DIR, 'initial-landing.png'), fullPage: false });
  console.log('Initial screenshot captured');

  // Get page structure via DOM analysis
  const pageStructure = await window.evaluate(() => {
    const getElInfo = (el) => ({
      tag: el.tagName?.toLowerCase(),
      id: el.id || undefined,
      className: (el.className && typeof el.className === 'string') ?
        el.className.split(' ').filter(c => c && !c.startsWith('css-')).slice(0, 5).join(' ') : undefined,
      role: el.getAttribute?.('role') || undefined,
      text: el.textContent?.trim()?.substring(0, 100) || undefined,
      childCount: el.children?.length || 0
    });

    // Get nav elements
    const navEls = document.querySelectorAll('nav, [role="navigation"], [role="menubar"], [role="tablist"]');
    const navItems = [];
    navEls.forEach(nav => {
      const links = nav.querySelectorAll('a, button, [role="menuitem"], [role="tab"]');
      links.forEach(link => {
        navItems.push({
          text: link.textContent?.trim()?.substring(0, 50),
          href: link.getAttribute('href'),
          role: link.getAttribute('role'),
          tag: link.tagName?.toLowerCase()
        });
      });
    });

    // Get sidebar items
    const sidebarEls = document.querySelectorAll('[class*="sidebar"], [class*="Sidebar"], aside, [role="complementary"]');
    const sidebarItems = [];
    sidebarEls.forEach(sidebar => {
      const items = sidebar.querySelectorAll('a, button, [role="menuitem"], [role="treeitem"]');
      items.forEach(item => {
        sidebarItems.push({
          text: item.textContent?.trim()?.substring(0, 50),
          href: item.getAttribute('href'),
          tag: item.tagName?.toLowerCase()
        });
      });
    });

    // Get main layout
    const bodyChildren = Array.from(document.body.children).map(getElInfo);
    const appRoot = document.getElementById('root') || document.getElementById('app');
    const appChildren = appRoot ? Array.from(appRoot.children).map(getElInfo) : [];

    // Get all links
    const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
      href: a.href,
      text: a.textContent?.trim()?.substring(0, 50)
    })).filter(l => l.href && !l.href.startsWith('http'));

    // Get all buttons
    const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.textContent?.trim()?.substring(0, 50),
      className: b.className?.substring?.(0, 100)
    })).filter(b => b.text);

    // Get form elements
    const inputs = Array.from(document.querySelectorAll('input, textarea, select')).map(i => ({
      type: i.type,
      placeholder: i.placeholder,
      name: i.name,
      id: i.id
    }));

    // Check for modals/dialogs
    const modals = document.querySelectorAll('[role="dialog"], [class*="modal"], [class*="Modal"], .ant-modal');

    return {
      title: document.title,
      bodyChildren,
      appChildren,
      navItems,
      sidebarItems,
      links: links.slice(0, 30),
      buttons: buttons.slice(0, 30),
      inputs: inputs.slice(0, 20),
      modalCount: modals.length,
      documentHeight: document.documentElement.scrollHeight,
      documentWidth: document.documentElement.scrollWidth,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    };
  });

  results.globalPatterns.pageStructure = pageStructure;
  results.navItems = pageStructure.navItems;

  console.log(`Nav items: ${pageStructure.navItems.length}`);
  console.log(`Sidebar items: ${pageStructure.sidebarItems.length}`);
  console.log(`Buttons: ${pageStructure.buttons.length}`);
  console.log(`Links: ${pageStructure.links.length}`);

  // Phase B — Navigation Discovery
  console.log('\nPhase B: Navigation Discovery...');

  // Try to find React Router routes or hash routes
  const routeInfo = await window.evaluate(() => {
    // Check hash
    const hash = window.location.hash;
    // Check for React Router
    const routerLinks = Array.from(document.querySelectorAll('[data-discover], a[href^="/"], a[href^="#"]'));
    return {
      currentHash: hash,
      currentPath: window.location.pathname,
      routerLinks: routerLinks.map(l => ({
        href: l.getAttribute('href'),
        text: l.textContent?.trim()?.substring(0, 50)
      })).slice(0, 20)
    };
  });

  results.globalPatterns.routeInfo = routeInfo;
  console.log(`Current URL hash: ${routeInfo.currentHash}`);
  console.log(`Router links found: ${routeInfo.routerLinks.length}`);

  // Phase C — Screen-by-Screen Survey
  console.log('\nPhase C: Screen-by-Screen Survey...');

  // Record initial screen
  results.screens.push({
    name: 'main-chat',
    route: routeInfo.currentHash || '/',
    title: pageStructure.title,
    layout: 'sidebar+content',
    elements: {
      navItems: pageStructure.navItems.length,
      sidebarItems: pageStructure.sidebarItems.length,
      buttons: pageStructure.buttons.slice(0, 10),
      inputs: pageStructure.inputs,
      links: pageStructure.links.slice(0, 10)
    },
    dimensions: {
      width: pageStructure.windowWidth,
      height: pageStructure.windowHeight
    }
  });

  // Try clicking sidebar/nav items to discover screens
  // First, let's check what clickable sidebar items exist
  const clickTargets = await window.evaluate(() => {
    const targets = [];
    // Look for sidebar nav items
    const sidebar = document.querySelector('[class*="sidebar"], [class*="Sidebar"], aside, [class*="nav"]');
    if (sidebar) {
      const clickable = sidebar.querySelectorAll('a, button, [role="menuitem"], [role="tab"], [data-testid]');
      clickable.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          targets.push({
            index: i,
            text: el.textContent?.trim()?.substring(0, 50),
            tag: el.tagName?.toLowerCase(),
            href: el.getAttribute('href'),
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2,
            width: rect.width,
            height: rect.height
          });
        }
      });
    }

    // Also look for tab elements
    const tabs = document.querySelectorAll('[role="tab"], .ant-tabs-tab');
    tabs.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        targets.push({
          index: targets.length,
          text: el.textContent?.trim()?.substring(0, 50),
          tag: 'tab',
          x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2
        });
      }
    });

    // Look for main navigation icons (common in Electron apps)
    const iconBtns = document.querySelectorAll('[class*="icon"], [class*="Icon"], svg');
    const parentBtns = new Set();
    iconBtns.forEach(icon => {
      const parent = icon.closest('a, button, [role="button"]');
      if (parent && !parentBtns.has(parent)) {
        parentBtns.add(parent);
        const rect = parent.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && rect.width < 100) {
          targets.push({
            index: targets.length,
            text: parent.getAttribute('title') || parent.getAttribute('aria-label') || parent.textContent?.trim()?.substring(0, 30),
            tag: 'icon-button',
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2
          });
        }
      }
    });

    return targets.slice(0, 30);
  });

  console.log(`Found ${clickTargets.length} clickable targets`);

  // Try navigating to different screens by clicking sidebar items
  let screenCount = 1;
  const visited = new Set(['main-chat']);

  for (const target of clickTargets.slice(0, MAX_SCREENS - 1)) {
    if (!target.text || visited.has(target.text)) continue;

    try {
      console.log(`  Exploring: ${target.text} (${target.tag})`);

      // Click the target
      await window.mouse.click(target.x, target.y);
      await window.waitForTimeout(2000);

      // Capture the new state
      const newState = await window.evaluate(() => {
        const hash = window.location.hash;
        const buttons = Array.from(document.querySelectorAll('button')).map(b =>
          b.textContent?.trim()?.substring(0, 50)
        ).filter(Boolean).slice(0, 10);
        const inputs = Array.from(document.querySelectorAll('input, textarea, select')).map(i => ({
          type: i.type, placeholder: i.placeholder, name: i.name
        })).slice(0, 10);
        const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h =>
          h.textContent?.trim()?.substring(0, 50)
        ).filter(Boolean).slice(0, 5);
        const tables = document.querySelectorAll('table, [class*="table"], [class*="Table"]');
        const lists = document.querySelectorAll('ul, ol, [role="list"], [role="listbox"]');
        const forms = document.querySelectorAll('form');

        return {
          hash, buttons, inputs, headings,
          tableCount: tables.length,
          listCount: lists.length,
          formCount: forms.length
        };
      });

      // Take screenshot
      const screenName = target.text.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 30);
      if (!visited.has(screenName)) {
        await window.screenshot({
          path: join(VISUAL_DIR, `screen-${screenName}.png`),
          fullPage: false
        });

        results.screens.push({
          name: screenName,
          route: newState.hash || target.href || target.text,
          title: target.text,
          layout: 'TBD',
          elements: {
            headings: newState.headings,
            buttons: newState.buttons,
            inputs: newState.inputs,
            tableCount: newState.tableCount,
            listCount: newState.listCount,
            formCount: newState.formCount
          }
        });

        visited.add(screenName);
        screenCount++;
        console.log(`    Captured screen #${screenCount}: ${screenName}`);
      }
    } catch (e) {
      console.log(`    Error exploring ${target.text}: ${e.message}`);
      results.errors.push({ target: target.text, error: e.message });
    }

    if (screenCount >= MAX_SCREENS) break;
  }

  // Phase D — Key Flow Identification
  console.log('\nPhase D: Key Flow Identification...');

  // Go back to main view
  try {
    // Try pressing Escape to close any open dialogs/modals
    await window.keyboard.press('Escape');
    await window.waitForTimeout(1000);
  } catch (e) {
    // ignore
  }

  // Capture final state
  results.globalPatterns.consoleErrors = consoleErrors.slice(0, 20);
  results.globalPatterns.totalScreensExplored = screenCount;

  // Style token extraction
  console.log('\nExtracting style tokens...');
  const styleTokens = await window.evaluate(() => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    // Get CSS custom properties from :root
    const customProps = {};
    const sheets = document.styleSheets;
    try {
      for (const sheet of sheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText === ':root' || rule.selectorText === ':root, :host') {
              const style = rule.style;
              for (let i = 0; i < style.length; i++) {
                const prop = style[i];
                if (prop.startsWith('--')) {
                  customProps[prop] = style.getPropertyValue(prop).trim();
                }
              }
            }
          }
        } catch (e) {
          // Cross-origin stylesheets
        }
      }
    } catch (e) {
      // ignore
    }

    // Get computed styles from landmark elements
    const landmarks = {};
    ['body', 'header', 'nav', 'main', 'aside', 'footer'].forEach(tag => {
      const el = document.querySelector(tag);
      if (el) {
        const s = getComputedStyle(el);
        landmarks[tag] = {
          background: s.backgroundColor,
          color: s.color,
          fontFamily: s.fontFamily,
          fontSize: s.fontSize,
          padding: s.padding
        };
      }
    });

    // Body typography
    const bodyStyle = getComputedStyle(document.body);
    const typography = {
      fontFamily: bodyStyle.fontFamily,
      fontSize: bodyStyle.fontSize,
      lineHeight: bodyStyle.lineHeight,
      color: bodyStyle.color,
      backgroundColor: bodyStyle.backgroundColor
    };

    return { customProps, landmarks, typography };
  });

  results.globalPatterns.styleTokens = styleTokens;
  console.log(`Custom properties: ${Object.keys(styleTokens.customProps).length}`);

  // Write results
  writeFileSync(join(OUTPUT_DIR, 'runtime-exploration-raw.json'), JSON.stringify(results, null, 2));
  console.log('\nResults written to runtime-exploration-raw.json');
  console.log(`Total screens explored: ${screenCount}`);
  console.log(`Console errors: ${consoleErrors.length}`);

  // Close app
  await electronApp.close();
  console.log('Electron app closed');
}

explore().catch(e => {
  console.error('Exploration failed:', e);
  writeFileSync(join(OUTPUT_DIR, 'runtime-exploration-raw.json'), JSON.stringify({
    ...results,
    fatalError: e.message
  }, null, 2));
  process.exit(1);
});
