const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://127.0.0.1:8765/chicCanva.html?annotation-performance=1');
  await page.waitForFunction(() => typeof workspaceReady !== 'undefined' && workspaceReady);
  const sample = async () => page.evaluate(async () => {
    const button = document.querySelector('#rotateTool');
    const menu = document.querySelector('#rotationMenu');
    const menuSamples = [];
    for (let index = 0; index < 40; index++) {
      menu.classList.add('hidden');
      const start = performance.now();
      button.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 50, clientY: 50 }));
      menuSamples.push(performance.now() - start);
    }
    menu.classList.add('hidden');
    const frameStart = performance.now();
    await new Promise(resolve => { let frames = 0; const tick = () => ++frames === 30 ? resolve() : requestAnimationFrame(tick); requestAnimationFrame(tick); });
    return { menuAverageMs: menuSamples.reduce((a, b) => a + b, 0) / menuSamples.length, thirtyFramesMs: performance.now() - frameStart };
  });
  const before = await sample();
  await page.locator('#aiReferenceFile').setInputFiles('tests/test-photo.png');
  await page.locator('#openAiAnnotation').click();
  await page.waitForFunction(() => document.querySelector('#aiAnnotationDialog').open);
  const opened = await page.evaluate(() => ({ width: document.querySelector('#aiAnnotationCanvas').width, height: document.querySelector('#aiAnnotationCanvas').height }));
  await page.locator('#cancelAiAnnotations').click();
  const released = await page.evaluate(() => ({ width: document.querySelector('#aiAnnotationCanvas').width, height: document.querySelector('#aiAnnotationCanvas').height, image: aiAnnotationImage, frame: aiAnnotationFrame }));
  const after = await sample();
  if (released.width !== 1 || released.height !== 1 || released.image !== null || released.frame !== 0) throw new Error('Annotation canvas resources were not released');
  if (after.menuAverageMs > Math.max(4, before.menuAverageMs * 5 + 1)) throw new Error(`Main menu regressed: ${before.menuAverageMs} -> ${after.menuAverageMs}`);
  console.log(JSON.stringify({ before, opened, released, after }));
  await browser.close();
  process.exit(0);
})().catch(error => { console.error(error); process.exit(1); });
