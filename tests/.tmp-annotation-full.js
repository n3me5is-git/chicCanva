const { chromium } = require('playwright');

function assert(value, message) {
  if (!value) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  await mobile.goto('http://127.0.0.1:8765/chicCanva.html?annotation-full=1');
  await mobile.locator('#aiReferenceFile').setInputFiles('tests/test-photo.png');
  await mobile.waitForFunction(() => !document.querySelector('#aiAnnotationControls').classList.contains('hidden'));

  await mobile.evaluate(() => applyLanguage('it'));
  let language = await mobile.evaluate(() => ({
    button: document.querySelector('#openAiAnnotation').textContent.trim(),
    hint: document.querySelector('#aiAnnotationHint').textContent.trim(),
    value: document.querySelector('#aiModel').value
  }));
  assert(language.button === 'Annota immagine di riferimento', 'Italian annotation button missing');
  assert(language.hint.includes('Consigliato Sunburst'), 'Italian annotation hint missing');
  await mobile.evaluate(() => applyLanguage('en'));
  language = await mobile.evaluate(() => ({
    button: document.querySelector('#openAiAnnotation').textContent.trim(),
    hint: document.querySelector('#aiAnnotationHint').textContent.trim(),
    value: document.querySelector('#aiModel').value
  }));
  assert(language.button === 'Annotate reference image', 'English annotation button missing');
  assert(language.hint.includes('Sunburst is recommended'), 'English annotation hint missing');
  const stableModel = language.value;
  await mobile.evaluate(() => applyLanguage('it'));
  assert(await mobile.locator('#aiModel').inputValue() === stableModel, 'Language switch changed model value');

  await mobile.locator('#openAiAnnotation').focus();
  await mobile.locator('#openAiAnnotation').click();
  await mobile.waitForFunction(() => document.querySelector('#aiAnnotationDialog').open);
  const canvas = mobile.locator('#aiAnnotationCanvas');
  const box = await canvas.boundingBox();
  await mobile.locator('[data-ai-annotation-tool="rect"]').click();
  await mobile.mouse.move(box.x + box.width * .35, box.y + box.height * .35);
  await mobile.mouse.down();
  await mobile.mouse.move(box.x + box.width * .355, box.y + box.height * .355);
  await mobile.mouse.up();
  let marker = await mobile.evaluate(() => {
    const m = aiAnnotationDraft.markers[0];
    return { type: m.type, width: m.w * aiAnnotationCanvas().width * aiAnnotationView.zoom, height: m.h * aiAnnotationCanvas().height * aiAnnotationView.zoom, tool: aiAnnotationTool, panel: document.querySelector('#aiAnnotationCommentPanel').classList.contains('open') };
  });
  assert(marker.type === 'rect' && marker.width >= 71.5 && marker.height >= 51.5, 'Rectangle minimum visual size not preserved');
  assert(marker.tool === 'select' && marker.panel, 'Drawing did not return to Select/open comments');
  await mobile.locator('#aiAnnotationCommentBody textarea').fill('Rendi blu questa zona');

  await mobile.locator('[data-ai-annotation-tool="oval"]').click();
  await mobile.mouse.move(box.x + box.width * .62, box.y + box.height * .38);
  await mobile.mouse.down();
  await mobile.mouse.move(box.x + box.width * .625, box.y + box.height * .385);
  await mobile.mouse.up();
  marker = await mobile.evaluate(() => {
    const m = aiAnnotationDraft.markers[1];
    return { type: m.type, width: m.w * aiAnnotationCanvas().width * aiAnnotationView.zoom, height: m.h * aiAnnotationCanvas().height * aiAnnotationView.zoom };
  });
  assert(marker.type === 'oval' && marker.width >= 71.5 && marker.height >= 51.5, 'Oval minimum visual size not preserved');

  await mobile.locator('[data-ai-annotation-tool="point"]').click();
  await mobile.mouse.click(box.x + box.width * .5, box.y + box.height * .66);
  marker = await mobile.evaluate(() => {
    const m = aiAnnotationDraft.markers[2];
    return { type: m.type, w: m.w, h: m.h, hit: hitAiAnnotation({ x: m.x, y: m.y }).mode, tool: aiAnnotationTool };
  });
  assert(marker.type === 'point' && marker.w === 0 && marker.h === 0 && marker.hit === 'move', 'Point is not a fixed-size center-only marker');
  assert(marker.tool === 'select', 'Point insertion did not return to Select');

  await mobile.locator('#deleteSelectedAiAnnotation').click();
  let deletion = await mobile.evaluate(() => ({ count: aiAnnotationDraft.markers.length, disabled: document.querySelector('#deleteSelectedAiAnnotation').disabled, empty: document.querySelector('#deleteSelectedAiAnnotation').classList.contains('selection-empty') }));
  assert(deletion.count === 2 && !deletion.disabled && deletion.empty, 'Delete-all access disappeared after deleting selected marker');
  await mobile.locator('#deleteSelectedAiAnnotation').click({ button: 'right' });
  assert(!(await mobile.locator('#aiAnnotationDeleteMenu').evaluate(node => node.classList.contains('hidden'))), 'Delete-all context menu did not open');
  await mobile.locator('#deleteAllAiAnnotations').click();
  assert(await mobile.evaluate(() => aiAnnotationDraft.markers.length) === 0, 'Delete all did not clear draft');

  await mobile.locator('[data-ai-annotation-tool="rect"]').click();
  await mobile.evaluate(() => {
    const canvas = document.querySelector('#aiAnnotationCanvas');
    canvas.setPointerCapture = () => {};
    const r = canvas.getBoundingClientRect();
    const fire = (type, id, x, y) => canvas.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', clientX: r.left + x, clientY: r.top + y, bubbles: true, cancelable: true }));
    fire('pointerdown', 1, r.width * .3, r.height * .3);
    fire('pointerdown', 2, r.width * .7, r.height * .7);
    fire('pointermove', 1, r.width * .25, r.height * .25);
    fire('pointermove', 2, r.width * .75, r.height * .75);
    fire('pointerup', 1, r.width * .25, r.height * .25);
    fire('pointerup', 2, r.width * .75, r.height * .75);
  });
  assert(await mobile.evaluate(() => aiAnnotationDraft.markers.length) === 0, 'Pinch created an annotation');

  await mobile.locator('[data-ai-annotation-tool="oval"]').click();
  await mobile.keyboard.press('Escape');
  assert(await mobile.evaluate(() => aiAnnotationTool) === 'select', 'Escape did not return to Select');
  await mobile.locator('[data-ai-annotation-tool="point"]').click();
  await mobile.mouse.click(box.x + box.width * .5, box.y + box.height * .5);
  await mobile.locator('#cancelAiAnnotations').click();
  assert(await mobile.evaluate(() => state.aiReferenceAnnotations.markers.length) === 0, 'Close without saving changed saved annotations');
  assert(await mobile.evaluate(() => document.activeElement?.id) === 'openAiAnnotation', 'Focus was not restored to dialog opener');

  await mobile.evaluate(() => {
    document.querySelector('#aiModel').value = 'gpt-image-2';
    syncAiQualityOptions();
    syncAiOutputOptions();
    document.querySelector('#aiCustomResolution').checked = true;
    document.querySelector('#aiCustomWidth').value = '1280';
    document.querySelector('#aiCustomHeight').value = '1024';
    syncReferenceUI();
  });
  assert(await mobile.locator('#openAiAnnotation').isDisabled(), 'Annotation button remained enabled on incompatible model');
  await mobile.locator('#switchAiAnnotationSunburst').click();
  const switched = await mobile.evaluate(() => ({ model: document.querySelector('#aiModel').value, custom: document.querySelector('#aiCustomResolution').checked, width: document.querySelector('#aiCustomWidth').value, height: document.querySelector('#aiCustomHeight').value }));
  assert(switched.model === 'gpt-image-2.5-sunburst' && switched.custom && switched.width === '1280' && switched.height === '1024', 'Sunburst switch did not preserve output settings');

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'it-IT' });
  await desktop.goto('http://127.0.0.1:8765/chicCanva.html?annotation-desktop=1');
  await desktop.locator('#aiReferenceFile').setInputFiles('tests/test-photo.png');
  await desktop.locator('#openAiAnnotation').click();
  await desktop.waitForFunction(() => document.querySelector('#aiAnnotationDialog').open);
  const geometry = await desktop.evaluate(() => {
    const d = document.querySelector('#aiAnnotationDialog').getBoundingClientRect();
    const title = getComputedStyle(document.querySelector('.ai-annotation-title h2'));
    const preview = getComputedStyle(document.querySelector('#previewPanel'));
    return { x: d.x, y: d.y, right: innerWidth - d.right, bottom: innerHeight - d.bottom, radius: parseFloat(getComputedStyle(document.querySelector('#aiAnnotationDialog')).borderRadius), title: parseFloat(title.fontSize), previewInset: preview.inset };
  });
  assert(geometry.x >= 17 && geometry.y >= 17 && geometry.right >= 17 && geometry.bottom >= 17 && geometry.radius >= 17, 'Desktop annotation dialog lacks margin/rounded corners');
  assert(geometry.previewInset === '18px', 'Desktop page preview lacks modal inset');

  console.log(JSON.stringify({ language, marker, deletion, switched, geometry }));
  await browser.close();
  process.exit(0);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
