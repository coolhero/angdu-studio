import { _electron } from '@playwright/test';

async function explore() {
  console.log('Launching Electron app...');

  const electronApp = await _electron.launch({
    executablePath: '/Users/coolhero/Develop/cherry-studio/node_modules/.pnpm/electron@40.8.0/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron',
    args: ['/Users/coolhero/Develop/cherry-studio/out/main/index.js'],
    cwd: '/Users/coolhero/Develop/cherry-studio',
    env: {
      ...process.env,
      NODE_ENV: 'development',
    }
  });

  console.log('Getting first window...');
  const page = await electronApp.firstWindow();
  await page.waitForTimeout(5000);

  console.log('=== PHASE A: Initial Landing ===');
  const title = await page.title();
  console.log(`Page title: ${title}`);

  // Get page structure via DOM
  const structure = await page.evaluate(() => {
    function getTree(el, depth = 0) {
      if (depth > 4 || !el) return null;
      const id = el.id ? `#${el.id}` : '';
      const rawCls = typeof el.className === 'string' ? el.className : '';
      const cls = rawCls.split(' ').filter(c => c && !c.startsWith('css-') && c.length < 40).slice(0, 3).join('.');
      const tag = `${el.tagName.toLowerCase()}${id}${cls ? '.'+cls : ''}`;
      const text = el.childNodes.length === 1 && el.childNodes[0].nodeType === 3 ? el.textContent?.trim()?.substring(0, 30) : undefined;
      const children = Array.from(el.children).slice(0, 15).map(c => getTree(c, depth + 1)).filter(Boolean);
      return { tag, text, role: el.getAttribute('role') || undefined, children: children.length > 0 ? children : undefined };
    }
    return getTree(document.getElementById('root') || document.body);
  });
  console.log('DOM Structure:');
  console.log(JSON.stringify(structure, null, 2).substring(0, 8000));

  // Navigation discovery
  console.log('\n=== PHASE B: Navigation Discovery ===');
  const navInfo = await page.evaluate(() => {
    // Find sidebar/nav items with hash links
    const allLinks = Array.from(document.querySelectorAll('a[href], [data-testid], [class*="sidebar"] *, [class*="Sidebar"] *'))
      .filter(el => el.textContent?.trim())
      .map(el => ({
        text: el.textContent?.trim()?.substring(0, 50),
        href: el.getAttribute('href') || '',
        tag: el.tagName,
        cls: (typeof el.className === 'string' ? el.className : '').substring(0, 80)
      }))
      .filter(l => l.text.length > 0 && l.text.length < 50);

    // Find clickable nav-like elements
    const navButtons = Array.from(document.querySelectorAll('button, [role="tab"], [role="menuitem"], [class*="menu-item"], [class*="MenuItem"]'))
      .filter(el => el.textContent?.trim())
      .map(el => ({
        text: el.textContent?.trim()?.substring(0, 50),
        tag: el.tagName,
        cls: (typeof el.className === 'string' ? el.className : '').substring(0, 80)
      }));

    return {
      links: allLinks.slice(0, 20),
      navButtons: navButtons.slice(0, 20)
    };
  });
  console.log('Links:', JSON.stringify(navInfo.links, null, 2));
  console.log('Nav buttons:', JSON.stringify(navInfo.navButtons, null, 2));

  // Window info
  console.log('\n=== Window Info ===');
  const windowInfo = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    location: window.location.href,
    hash: window.location.hash
  }));
  console.log(JSON.stringify(windowInfo, null, 2));

  // Get CSS custom properties & body styles
  console.log('\n=== Style Tokens ===');
  const styles = await page.evaluate(() => {
    const vars = {};
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText === ':root' || rule.selectorText === 'html') {
            for (const prop of rule.style) {
              if (prop.startsWith('--')) {
                vars[prop] = rule.style.getPropertyValue(prop).trim();
              }
            }
          }
        }
      } catch(e) {}
    }
    const bodyStyle = getComputedStyle(document.body);
    vars['_body_bg'] = bodyStyle.backgroundColor;
    vars['_body_color'] = bodyStyle.color;
    vars['_body_font'] = bodyStyle.fontFamily;
    vars['_body_fontSize'] = bodyStyle.fontSize;

    // Landmark styles
    const landmarks = {};
    for (const sel of ['header', 'nav', 'main', 'aside', 'footer', '[class*="sidebar"]', '[class*="Sidebar"]']) {
      const el = document.querySelector(sel);
      if (el) {
        const s = getComputedStyle(el);
        landmarks[sel] = {
          bg: s.backgroundColor,
          color: s.color,
          width: s.width,
          height: s.height,
          padding: s.padding
        };
      }
    }
    return { cssVars: Object.fromEntries(Object.entries(vars).slice(0, 60)), landmarks };
  });
  console.log('CSS Vars:', JSON.stringify(styles.cssVars, null, 2));
  console.log('Landmarks:', JSON.stringify(styles.landmarks, null, 2));

  // Screenshot the main page
  console.log('\n=== Screenshots ===');
  const fs = await import('fs');
  const dir = '/Users/coolhero/Develop/angdu-studio/specs/reverse-spec/visual-references';
  fs.mkdirSync(dir, { recursive: true });

  await page.screenshot({ path: `${dir}/home.png`, fullPage: false });
  console.log('Captured: home.png');

  // Navigate to each major route and capture
  console.log('\n=== PHASE C: Screen Survey ===');
  const routes = [
    { path: '#/', name: 'home' },
    { path: '#/settings', name: 'settings' },
    { path: '#/store', name: 'store' },
    { path: '#/files', name: 'files' },
    { path: '#/notes', name: 'notes' },
    { path: '#/knowledge', name: 'knowledge' },
    { path: '#/paintings', name: 'paintings' },
    { path: '#/translate', name: 'translate' },
    { path: '#/code', name: 'code' },
    { path: '#/apps', name: 'apps' },
    { path: '#/launchpad', name: 'launchpad' }
  ];

  for (const route of routes) {
    try {
      await page.evaluate((hash) => { window.location.hash = hash; }, route.path);
      await page.waitForTimeout(2000);

      const pageInfo = await page.evaluate(() => {
        const root = document.getElementById('root');
        const body = root || document.body;

        // Identify key UI elements
        const buttons = body.querySelectorAll('button').length;
        const inputs = body.querySelectorAll('input, textarea, select').length;
        const tables = body.querySelectorAll('table').length;
        const lists = body.querySelectorAll('[class*="list"], [class*="List"], ul, ol').length;
        const modals = body.querySelectorAll('[class*="modal"], [class*="Modal"], [role="dialog"]').length;
        const editors = body.querySelectorAll('[class*="editor"], [class*="Editor"], [contenteditable]').length;

        // Layout detection
        const sidebar = body.querySelector('[class*="sidebar"], [class*="Sidebar"], aside');
        const hasSidebar = !!sidebar;
        const header = body.querySelector('header, [class*="header"], [class*="Header"]');
        const hasHeader = !!header;

        // Text content sampling
        const headings = Array.from(body.querySelectorAll('h1, h2, h3')).map(h => h.textContent?.trim()?.substring(0, 50)).slice(0, 5);

        return { buttons, inputs, tables, lists, modals, editors, hasSidebar, hasHeader, headings, hash: window.location.hash };
      });

      await page.screenshot({ path: `${dir}/${route.name}.png`, fullPage: false });

      console.log(`\nRoute: ${route.path} → ${route.name}`);
      console.log(`  Hash: ${pageInfo.hash}`);
      console.log(`  Layout: ${pageInfo.hasSidebar ? 'sidebar+content' : 'full-width'}${pageInfo.hasHeader ? ' +header' : ''}`);
      console.log(`  Buttons: ${pageInfo.buttons}, Inputs: ${pageInfo.inputs}, Tables: ${pageInfo.tables}, Lists: ${pageInfo.lists}`);
      console.log(`  Editors: ${pageInfo.editors}, Modals: ${pageInfo.modals}`);
      console.log(`  Headings: ${JSON.stringify(pageInfo.headings)}`);
      console.log(`  Screenshot: ${route.name}.png`);
    } catch(e) {
      console.log(`Route ${route.path}: ERROR - ${e.message?.substring(0, 200)}`);
    }
  }

  // Settings sub-pages
  console.log('\n=== Settings Sub-pages ===');
  await page.evaluate(() => { window.location.hash = '#/settings'; });
  await page.waitForTimeout(2000);

  const settingsNav = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('[class*="menu-item"], [class*="MenuItem"], [class*="settings"] a, [class*="Settings"] a, [class*="nav-item"], [class*="NavItem"]'))
      .filter(el => el.textContent?.trim())
      .map(el => ({
        text: el.textContent?.trim()?.substring(0, 50),
        href: el.getAttribute('href') || ''
      }));
    return items.slice(0, 20);
  });
  console.log('Settings nav items:', JSON.stringify(settingsNav, null, 2));

  console.log('\n=== Console Errors ===');
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text()?.substring(0, 200));
  });
  await page.waitForTimeout(1000);
  console.log(`Errors captured: ${errors.length}`);

  console.log('\n=== DONE ===');
  await electronApp.close();
}

explore().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
