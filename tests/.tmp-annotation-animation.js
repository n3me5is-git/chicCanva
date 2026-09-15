const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto('http://127.0.0.1:8765/chicCanva.html?annotation-animation=1');
  await page.locator('#aiReferenceFile').setInputFiles('tests/test-photo.png');
  await page.locator('#openAiAnnotation').click();
  await page.waitForFunction(() => document.querySelector('#aiAnnotationDialog').open);
  await page.locator('[data-ai-annotation-tool="point"]').click();
  const canvas = page.locator('#aiAnnotationCanvas');
  const box = await canvas.boundingBox();
  const read = () => page.evaluate(() => {
    const panel = document.querySelector('#aiAnnotationCommentPanel').getBoundingClientRect();
    const stage = document.querySelector('#aiAnnotationStage').getBoundingClientRect();
    return { panelTop: panel.top, stageX: stage.x, stageY: stage.y, dialogScroll: document.querySelector('#aiAnnotationDialog').scrollTop, workspaceScroll: document.querySelector('#aiAnnotationWorkspace').scrollTop, transform: getComputedStyle(document.querySelector('#aiAnnotationCommentPanel')).transform };
  });
  const before = await read();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  const samples = [await read()];
  for (const delay of [50, 70, 90, 140]) { await page.waitForTimeout(delay); samples.push(await read()); }
  const all = [before, ...samples];
  if (all.some(value => Math.abs(value.stageX - before.stageX) > .5 || Math.abs(value.stageY - before.stageY) > .5 || value.dialogScroll !== 0 || value.workspaceScroll !== 0)) throw new Error('Canvas or modal scrolled while opening comment panel');
  const tops = samples.map(value => value.panelTop);
  if (tops.some((value, index) => index && value > tops[index - 1] + .75)) throw new Error(`Panel did not rise monotonically: ${tops.join(', ')}`);
  if (tops[0] - tops.at(-1) < 20) throw new Error(`Panel did not animate over distance: ${tops.join(', ')}`);
  console.log(JSON.stringify({ before, samples }));
  await browser.close();
  process.exit(0);
})().catch(error => { console.error(error); process.exit(1); });
