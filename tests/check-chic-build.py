from pathlib import Path
import re,json,struct,hashlib
root=Path(__file__).resolve().parent.parent
s=(root/'chicCanva.html').read_text(encoding='utf-8')
assert 'black-forest-labs/FLUX.1-schnell' not in s, 'vecchio fallback Flux presente nella build'
for expected_model in ('byteplus/seedream-5-0-lite-260128','google/gemini-3.1-flash-lite-image'):
 assert expected_model in s, f'modello Puter mancante: {expected_model}'
for hidden_model in ('rundiffusion/juggernaut-lightning-flux','hidream-ai/hidream-i1-fast','hidream-ai/hidream-i1-dev','qwen/qwen-image'):
 assert hidden_model not in s, f'modello Puter non funzionante ancora visibile: {hidden_model}'
scripts=re.findall(r'<script>([\s\S]*?)</script>',s)
body=s[s.index('\n<body>'):s.rindex('<script>')]
ids=re.findall(r'\bid="([^"]+)"',body)
refs=re.findall(r"\$\('([^']+)'\)",scripts[-1])
assert len(ids)==len(set(ids)), 'Duplicate IDs'
assert not set(refs)-set(ids), set(refs)-set(ids)
for name in ['chicCanva.html','chicCanva_server.bat']:
 assert (root/name).read_bytes()==(root/'build/chicCanva'/name).read_bytes()
assert len(list((root/'build/chicCanva').iterdir()))==2
bat=(root/'chicCanva_server.bat').read_text(encoding='utf-8')
assert '/__chiccanva_image_proxy' in bat and '/__chiccanva_openclipart_search' in bat and 'Test-PublicUri' in bat and '12582912' in bat
assert 'api.fontsource.org' not in s
assert "puter.auth.getMonthlyUsage()" in s and 'allowanceInfo' in s and 'puterUsageBar' in ids
assert {'puterAccountType','puterMonthlyAllowance','puterTopupCredits','puterAppUsage','aiPricingRefresh','aiPricingStatus'}.issubset(ids)
assert 'getDetailedAppUsage(puter.auth.appID)' in s and 'usage.allowanceUsed' in s and 'addons?.purchasedCredits' in s and 'consumedPurchaseCredits' in s
assert 'PUTER_IMAGE_PRICING_TTL_MS=30*24*60*60*1000' in s and 'api.puter.com/puterai/image/models/details' in s
assert 'openclipart.org/search/' in s and 'parseOpenclipartResults' in s and 'clipartCard' in ids
assert 'api.mymemory.translated.net/get' not in s and 'SEARCH_IT_EN' in s and 'translateClipartLocally' in s and 'google/gemma-4-31b-it' in s and 'clipartTranslate' in ids
assert 'translateEmojiKeyword' in s and 'updateEmojiSearch' in s
pwa=root/'build/chicCanva-pwa'
expected={'index.html','chiccanva.css','fabric.js','jspdf.js','chiccanva-pdf.js','chiccanva-app.js','chicCanva.webmanifest','chicCanva-en.webmanifest','chicCanva-sw.js','chiccanva-192.png','chiccanva-512.png','chiccanva-share.png','chiccanva-share.jpg','robots.txt','_headers'}
assert {p.name for p in pwa.iterdir()}==expected
pwa_html=(pwa/'index.html').read_text(encoding='utf-8')
assert len(pwa_html.encode('utf-8'))<500000 and '<style' not in pwa_html
assert all(f'src="{name}?v=' in pwa_html and '" defer' in pwa_html for name in ['fabric.js','jspdf.js','chiccanva-pdf.js','chiccanva-app.js'])
assert 'href="chiccanva.css?v=' in pwa_html
sw=(pwa/'chicCanva-sw.js').read_text(encoding='utf-8')
build_id=re.search(r"const BUILD_ID='([a-f0-9]{16})'",sw).group(1)
assert '__BUILD_ID__' not in sw and all('?v='+build_id in value for value in re.findall(r'(?:src|href)="([^"]+\?v=[a-f0-9]{16})"',pwa_html) if any(name in value for name in ['chiccanva.css','fabric.js','jspdf.js','chiccanva-pdf.js','chiccanva-app.js']))
assert 'shellNavigation(request)' in sw and "fetch(request,{cache:'no-store'" in sw and 'event.waitUntil(refreshNavigation(request))' not in sw
manifest=json.loads((pwa/'chicCanva.webmanifest').read_text(encoding='utf-8'))
assert manifest['start_url']=='./' and manifest['scope']=='./' and manifest['display']=='standalone'
assert {'192x192','512x512'}=={icon['sizes'] for icon in manifest['icons']}
manifest_en=json.loads((pwa/'chicCanva-en.webmanifest').read_text(encoding='utf-8'))
assert manifest_en['lang']=='en' and 'Small ideas, big projects' in manifest_en['name'] and manifest_en['icons']==manifest['icons']
for size in (192,512):
 data=(pwa/f'chiccanva-{size}.png').read_bytes();assert data[:8]==b'\x89PNG\r\n\x1a\n'
 width,height=struct.unpack('>II',data[16:24]);assert (width,height)==(size,size)
share=(pwa/'chiccanva-share.png').read_bytes();assert share[:8]==b'\x89PNG\r\n\x1a\n'
assert struct.unpack('>II',share[16:24])==(1200,630)
share_jpg=(pwa/'chiccanva-share.jpg').read_bytes();assert share_jpg[:2]==b'\xff\xd8' and share_jpg[-2:]==b'\xff\xd9' and len(share_jpg)<128000
headers=(pwa/'_headers').read_text(encoding='utf-8');robots=(pwa/'robots.txt').read_text(encoding='utf-8')
assert 'X-Robots-Tag' not in headers and 'Cache-Control: public, max-age=86400' in headers
assert all(rule in robots for rule in ['User-agent: TelegramBot\nAllow: /','User-agent: Googlebot\nAllow: /','User-agent: Bingbot\nAllow: /','User-agent: *\nDisallow: /'])
assert "protocol!=='https:'" in s and "navigator.serviceWorker.register('./chicCanva-sw.js'" in s
assert {'deletePageDialog','pwaUpdateBar','bgAutoColor','aiChromaKey','resetCropActiveBtn','exportClipboardBtn','emojiTranslate','aiGeneratedFallback','aiGeneratedDialog','aiGeneratedRetryBtn','aiGeneratedDownloadBtn'}.issubset(ids)
assert 'AUTOSAVE_CURRENT' in s and 'runMobileBackgroundWorker' in s and 'setupCanvasColorPickers' in s
vendor=root/'development/vendor'
assert all((vendor/name).is_file() for name in ['pdf.min.js','pdf.worker.min.js','pdfjs-LICENSE.txt'])
assert len((vendor/'pdf.min.js').read_bytes())>300000 and len((vendor/'pdf.worker.min.js').read_bytes())>1000000
assert "PDFJS_VERSION='3.11.174'" in s and 'PDF_WORKER_BASE64' in s and {'importPdfBtn','pdfImportDialog','pdfImportQuality'}.issubset(ids)
expected_version=json.loads((root/'development/version.json').read_text(encoding='utf-8'))['version']
assert f'id="appVersion">v{expected_version}' in s
assert 'touchControlProfile' in s and 'touchCornerSize:40' in s and 'touchSizeX:hit' in s and 'touch?44' in s
assert 'property="og:title" content="chicCanva · Piccole idee, grandi progetti"' in s
assert 'name="twitter:card" content="summary_large_image"' in s and 'data:image/png;base64,' in s
assert 'name="robots"' not in s and 'name="googlebot" content="noindex,nofollow,noarchive"' in s and 'name="bingbot" content="noindex,nofollow,noarchive"' in s and 'property="og:image" content="https://chiccanva.testthis.one/chiccanva-share.jpg?v=' in s and 'property="og:image:type" content="image/jpeg"' in s and 'property="og:image:width" content="1200"' in s and 'property="og:url" content="https://chiccanva.testthis.one/"' in s and 'rel="canonical" href="https://chiccanva.testthis.one/"' in s
assert 'https://github.com/n3me5is-git/chicCanva' in s and '</div><details class="license">' in s
assert 'syncPuterFetchControls' in s and 'openPuterLoginSection' in s and 'data-puter-login-link' in s
assert 'cropSourceGeometry' in s and 'cropHelperCorners' in s and 'cropBoxFromHelper' in s and 'constrainCropHelper' in s
assert 'exportImageToClipboard' in s and 'writeImageBlobToClipboard' in s
assert 'layoutCanvasViewport' in s and "fitStageZoom({light:true,preserve:false})" in s and "$('resetCropActiveBtn').onclick=resetActiveCrop" in s
assert {'imageInspector','changeResolutionBtn','resolutionDialog','memoryFootprint','objectLockAction'}.issubset(ids)
assert 'pruneUnreachableAssets' in s and 'projectSnapshotForWorkspace' in s and 'activeUsesRoot:true' in s
assert 'releaseFabricPageRuntime' in s and "surface.width=surface.height=1" in s
assert 'runBackgroundWorker' in s and 'modello rimosso dalla RAM' in s
assert 'canvas.skipTargetFind=true' in s and 'showLongPressObjectMenu' in s and 'locked=true' in s
assert {'shapesCard','shapeTools','shapeEditPoints','shapeFinish'}.issubset(ids)
assert 'beginShapeMode' in s and 'objectType===\'shape\'' in s and 'Mantieni dimensione costante' in s
assert {'shapeTabs','shapePrevPage','shapeNextPage','shapeDragNodes','shapeDuplicateImage','snapRotationStep','rotationMenu','selectionModeMenu','objectTransformMenu'}.issubset(ids)
assert {'guideSnapEnabled','guideSnapPage','guideSnapObjects','guideSnapSpacing','aspectRatioLock','shapeLockSquare','snapOptionsMenu'}.issubset(ids)
assert 'applyAlignmentGuides' in s and 'constrainAspectRatio' in s and "objectType='alignment-guide'" in s and 'temporaryClassicSnap' in s
assert len(re.findall(r'data-shape="[^"]+"',body))>=40 and 'smoothTrace' in s and 'duplicateSelectionAsImage' in s and 'startSelectionTapMode' in s
assert {'colorizerCard','startColorizerBtn','restoreColorizerOriginalBtn','colorizerPaintType','colorizerSmartEdges','copyColorizedBtn','copyColorizerOriginalBtn'}.issubset(ids)
assert 'colorizerFloodFill' in s and 'colorizerBrushStamp' in s and 'expandDerivedAssetDependencies' in s and "objectType:'colorized'" in s
assert 'COLORIZER_BRUSH_ENGINE_DEFAULT=\'optimized\'' in s and 'colorizerBrush=legacy' not in s, 'unexpected literal fallback URL in generated app'
assert 'colorizerProcessBrushSamples' in s and 'colorizer-live-overlay' in s and 'setChicCanvaColorizerBrushEngine' in s
assert 'attachColorizerSurface(session);session.object.setCoords()' in s and 'rawAiPromptDialog' in ids and 'showRawAiPrompt' in ids
assert "adapter:'gemini'" in s and "opts.ratio={w:values.w,h:values.h};opts.quality='1K'" in s
assert '#colorizerCard .card-b{display:grid' not in s, 'Colorizer must not override the shared collapsed-section display rule'
docs=root/'docs'
assert {'languagePickerDesktop','languagePickerMobile'}.issubset(ids)
assert 'LANGUAGE_STORAGE_KEY' in s and 'CHICCANVA_HELP_EN' in s and 'preferredInitialLanguage' in s and "document.documentElement.lang=appLanguage" in s
assert 'data-i18n-bootstrap' in s and s.index('data-i18n-bootstrap')<s.index('\n<body>') and "document.documentElement.style.visibility='hidden'" in s and "style.removeProperty('visibility')" in s and '},6000)' in s
assert "new URL(manifest.href,location.href).search" in s
assert "setupLanguagePicker();applyLanguage(appLanguage,{persist:true,syncFeatures:false,reveal:true});await i18nBaseInit()" in s
assert 'Small ideas, big projects' in s and 'The same user guide embedded in the app' in (root/'docs/user-guide-en.html').read_text(encoding='utf-8')
expected_docs={'README.md','PROJECT.md','TECHNICAL_ARCHITECTURE.md','FEATURES_AND_PROCESSES.md','UI_UX_ARCHITECTURE.md','DEVELOPMENT_WORKFLOW.md','DEPLOYMENT.md','SECURITY_PRIVACY_LICENSING.md','PUTER_BILLING_AND_PRICING.md','user-guide.html','user-guide-en.html'}
assert expected_docs.issubset({p.name for p in docs.iterdir()})
guide=(root/'development/help-v7.html').read_text(encoding='utf-8')
assert guide in (docs/'user-guide.html').read_text(encoding='utf-8')
assert guide in s and 'build-docs.py' in (root/'development/build-workspace.py').read_text(encoding='utf-8')
assert (root/'CONTEXT.md').is_file() and (root/'LICENSE').is_file()
print(f'{len(ids)} unique IDs; all references present; local build, documentation and protected image proxy valid; PWA bundle and icons valid; no Fontsource API dependency.')
