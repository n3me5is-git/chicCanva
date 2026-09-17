/* Regenerate the guide screenshots from the current built application.
   Run a local server from the repository root, then:
   NODE_PATH=<playwright node_modules> node development/capture-guide-assets.js
*/
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const output = path.join(__dirname, 'guide-assets');
fs.mkdirSync(output, { recursive: true });

async function prepare(page, language) {
  await page.goto('http://127.0.0.1:8765/chicCanva.html?guide-capture=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#sidebar');
  await page.evaluate(async language => {
    document.documentElement.style.setProperty('--sideW', '560px');
    document.querySelectorAll('.card.collapsed').forEach(card => card.classList.remove('collapsed'));
    document.querySelectorAll('.card-h').forEach(header => header.setAttribute('aria-expanded', 'true'));
    if (globalThis.applyLanguage) {
      globalThis.applyLanguage(language);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    const style = document.createElement('style');
    style.textContent = '*{animation:none!important;transition:none!important;caret-color:transparent!important}.desktop-tooltip{display:none!important}';
    document.head.append(style);
  }, language);
}

async function shot(page, selector, name) {
  const locator = page.locator(selector).first();
  await locator.scrollIntoViewIfNeeded();
  await locator.screenshot({ path: path.join(output, name + '.png') });
}

async function menuBoard(page, language) {
  await page.evaluate(() => {
    document.querySelector('#guideCaptureBoard')?.remove();
    const board = document.createElement('div');
    board.id = 'guideCaptureBoard';
    board.style.cssText = 'width:920px;padding:18px;background:#e8ede7;display:grid;grid-template-columns:repeat(3,1fr);gap:14px;align-items:start';
    for (const id of ['selectionModeMenu','rotationMenu','snapOptionsMenu','copyImageMenu','moveAboveMenu','moveBelowMenu','objectMenu','projectTabMenu','pageTabMenu']) {
      const source = document.getElementById(id);
      if (!source) continue;
      const wrap = document.createElement('section');
      const title = document.createElement('strong');
      title.textContent = source.getAttribute('aria-label') || id;
      title.style.cssText = 'display:block;margin:0 0 7px;color:#173b34;font:700 13px system-ui';
      const clone = source.cloneNode(true);
      clone.removeAttribute('id');
      clone.classList.remove('hidden');
      clone.style.cssText = 'position:static!important;display:block!important;width:100%!important;min-width:0!important;max-width:none!important';
      wrap.append(title, clone);
      board.append(wrap);
    }
    document.body.append(board);
  });
  await shot(page, '#guideCaptureBoard', `${language}-context-menus`);
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const language of ['it', 'en']) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, locale: language === 'it' ? 'it-IT' : 'en-GB' });
    await page.route('https://cdn.jsdelivr.net/npm/openmoji@17.0.0/**', route => route.request().url().endsWith('openmoji.json')
      ? route.fulfill({ contentType: 'application/json', body: JSON.stringify([
          { annotation: 'teacher', tags: 'school', openmoji_tags: '', emoji: '👩‍🏫', hexcode: '1F469-200D-1F3EB', group: 'people-body', subgroups: 'person-role', order: 1 },
          { annotation: 'smiling face', tags: 'smile happy', openmoji_tags: '', emoji: '😀', hexcode: '1F600', group: 'smileys-emotion', subgroups: 'face-smiling', order: 2 },
          { annotation: 'red heart', tags: 'love', openmoji_tags: '', emoji: '❤', hexcode: '2764', group: 'smileys-emotion', subgroups: 'emotion', order: 3 },
          { annotation: 'cat', tags: 'animal', openmoji_tags: '', emoji: '🐈', hexcode: '1F408', group: 'animals-nature', subgroups: 'animal-mammal', order: 4 }
        ]) })
      : route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><circle cx="36" cy="36" r="28" fill="#f6c343" stroke="#000" stroke-width="4"/></svg>' }));
    await prepare(page, language);
    await page.evaluate(() => document.querySelectorAll('#sidebar > .card').forEach(card => card.classList.add('collapsed')));
    await page.screenshot({ path: path.join(output, `${language}-workspace.png`) });
    await page.evaluate(() => document.querySelectorAll('#sidebar > .card').forEach(card => card.classList.remove('collapsed')));
    await shot(page, '.workspace > .toolbar', `${language}-toolbar`);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(output, `${language}-mobile-workspace.png`) });
    await page.setViewportSize({ width: 1600, height: 1200 });
    await page.addStyleTag({ content: '.topbar{display:none!important}.quick-jump{position:static!important}.toast{display:none!important}' });
    await shot(page, '#customPageName >> xpath=ancestor::section[contains(@class,"card")][1]', `${language}-page-panel`);
    await shot(page, '#specialCard', `${language}-special-panel`);
    await shot(page, '#textInput', `${language}-text-field`);
    await shot(page, '#textInput >> xpath=ancestor::section[contains(@class,"card")][1]', `${language}-text-panel`);
    await shot(page, '#fontMode >> xpath=ancestor::section[contains(@class,"card")][1]', `${language}-font-panel`);
    await shot(page, '#emojiSearch >> xpath=ancestor::section[contains(@class,"card")][1]', `${language}-emoji-panel`);
    await shot(page, '#clipartCard', `${language}-clipart-panel`);
    await shot(page, '#shapesCard', `${language}-shapes-panel`);
    await shot(page, '#uploadImageBtn >> xpath=ancestor::section[contains(@class,"card")][1]', `${language}-images-panel`);
    await shot(page, '.image-effects-box', `${language}-image-effects-panel`);
    await shot(page, '.background-box', `${language}-background-panel`);
    await shot(page, '#colorizerCard', `${language}-colorizer-panel`);
    await shot(page, '#gridSpacing >> xpath=ancestor::section[contains(@class,"card")][1]', `${language}-canvas-panel`);
    await page.evaluate(() => {
      document.querySelector('#puterAuthGate')?.classList.add('hidden');
      document.querySelector('#puterAccountBar')?.classList.add('hidden');
      document.querySelector('#puterControls')?.classList.remove('hidden');
    });
    await shot(page, '#aiCard', `${language}-ai-panel`);
    await shot(page, '#exportCard', `${language}-export-panel`);
    await menuBoard(page, language);
    await page.evaluate(() => document.querySelector('#settingsDialog').showModal());
    await shot(page, '#settingsDialog', `${language}-memory-dialog`);
    await page.evaluate(() => document.querySelector('#settingsDialog').close());
    await page.click('#previewBtn');
    await shot(page, '#previewPanel', `${language}-preview-panel`);
    await page.click('#closePreview');
    await page.evaluate(() => {
      const dialog = document.querySelector('#aiAnnotationDialog');
      if (!dialog.open) dialog.showModal();
      dialog.querySelector('.ai-annotation-stage').style.minHeight = '360px';
    });
    await shot(page, '#aiAnnotationDialog .ai-annotation-shell', `${language}-annotations`);
    await page.close();
  }
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
