from pathlib import Path
import os,re,shutil,subprocess,hashlib,sys,json,base64,time
from datetime import date
root=Path(__file__).resolve().parent.parent;dev=root/'development'
def write_bytes_retry(path,data,attempts=8):
 for attempt in range(attempts):
  try:path.write_bytes(data);return
  except OSError:
   if attempt+1==attempts:raise
   time.sleep(.15*(attempt+1))
version=json.loads((dev/'version.json').read_text(encoding='utf-8'))['version']
build_date=date.today().isoformat()
public_url=os.environ.get('CHICCANVA_PUBLIC_URL','https://chiccanva.testthis.one/').strip().rstrip('/')+'/'
assert re.fullmatch(r'https://[^\s]+/',public_url), 'CHICCANVA_PUBLIC_URL deve essere un URL HTTPS pubblico'
share_image_name='chiccanva-share.jpg'
share_image_url=public_url+share_image_name+'?v='+version
subprocess.run([sys.executable,str(dev/'build-guide.py')],cwd=root,check=True)
subprocess.run([sys.executable,str(dev/'build-guide-en.py')],cwd=root,check=True)
subprocess.run([sys.executable,str(dev/'build-docs.py')],cwd=root,check=True)
s=(dev/'chic-v6-baseline.html').read_text(encoding='utf-8')
s=s.replace('<title>chicCanva — editor outline multi-page</title>','<title>chicCanva · Piccole idee, grandi progetti</title>',1)
share_icon_b64=base64.b64encode((dev/'pwa/chiccanva-192.png').read_bytes()).decode('ascii')
share_meta='''<meta name="application-name" content="chicCanva">
<meta name="description" content="chicCanva è un editor grafico con funzioni AI per creare schede, cartelloni, illustrazioni e lavori creativi e didattici.">
<meta name="author" content="chicCanva contributors">
<meta name="theme-color" content="#298879">
<meta name="googlebot" content="noindex,nofollow,noarchive">
<meta name="bingbot" content="noindex,nofollow,noarchive">
<link rel="canonical" href="__PUBLIC_URL__">
<meta property="og:type" content="website">
<meta property="og:url" content="__PUBLIC_URL__">
<meta property="og:locale" content="it_IT">
<meta property="og:locale:alternate" content="en_GB">
<meta property="og:site_name" content="chicCanva">
<meta property="og:title" content="chicCanva · Piccole idee, grandi progetti">
<meta property="og:description" content="Editor grafico con funzioni AI per creare schede, cartelloni, illustrazioni e lavori creativi e didattici.">
<meta property="og:image" content="__SHARE_IMAGE_URL__">
<meta property="og:image:url" content="__SHARE_IMAGE_URL__">
<meta property="og:image:secure_url" content="__SHARE_IMAGE_URL__">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Chicca, la mascotte insegnante di chicCanva">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="chicCanva · Piccole idee, grandi progetti">
<meta name="twitter:description" content="Editor grafico con funzioni AI per creare schede, cartelloni, illustrazioni e lavori creativi e didattici.">
<meta name="twitter:image" content="__SHARE_IMAGE_URL__">
<link rel="icon" type="image/png" sizes="192x192" href="data:image/png;base64,'''+share_icon_b64+'''">
<link rel="apple-touch-icon" sizes="192x192" href="chiccanva-192.png">'''
share_meta=share_meta.replace('__PUBLIC_URL__',public_url).replace('__SHARE_IMAGE_URL__',share_image_url)
s=s.replace('<meta name="description" content="Editor single-page HTML per testi outlined, OpenMoji, immagini, crop, pagine custom, PDF e asset serializzati.">',share_meta,1)
# Select the locale before first paint. The full translator is embedded near the
# end of the document, so the body stays hidden only until that synchronous
# first translation has run.
language_bootstrap="""<script data-i18n-bootstrap>(function(){var k='chiccanva.language.v1',v=null;try{v=localStorage.getItem(k)}catch(e){}if(v!=='it'&&v!=='en'){var a=[];try{a=a.concat(Array.isArray(navigator.languages)?navigator.languages:[],navigator.language||'',navigator.userLanguage||'',Intl.DateTimeFormat().resolvedOptions().locale||'')}catch(e){a.push(navigator.language||'')}v=a.some(function(x){x=String(x||'').toLowerCase();return x==='it'||x.indexOf('it-')===0})?'it':'en'}document.documentElement.lang=v;document.documentElement.classList.add('i18n-boot');document.documentElement.style.visibility='hidden';setTimeout(function(){document.documentElement.classList.remove('i18n-boot');document.documentElement.style.removeProperty('visibility')},6000);})();</script>"""
s=s.replace('</head>',language_bootstrap+'\n</head>',1)
pdfjs=(dev/'vendor/pdf.min.js').read_text(encoding='utf-8')
assert '</script' not in pdfjs.lower(), 'PDF.js contiene una chiusura script non incorporabile'
s=s.replace('</head>','<script>'+pdfjs+'</script>\n</head>',1)
pending_start=s.index('// Workspace persistence, undo/redo and the complete emoji browser.')
pending_end=s.index("init().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});",pending_start)
s=s[:pending_start]+(dev/'pending.js').read_text(encoding='utf-8').strip()+'\n'+s[pending_end:]
pending_ui=(dev/'pending-ui.html').read_text(encoding='utf-8')
for dialog_id in ('memoryDialog','urlDialog','settingsDialog'):
 source=re.search(r'<dialog id="'+dialog_id+r'"[\s\S]*?</dialog>',pending_ui);assert source,dialog_id
 target=re.search(r'<dialog id="'+dialog_id+r'"[\s\S]*?</dialog>',s);assert target,dialog_id
 s=s[:target.start()]+source.group(0)+s[target.end():]
def rep(a,b):
 global s
 assert a in s,a[:100]
 s=s.replace(a,b,1)
def before(id,markup):
 global s
 m=re.search(r'<[a-zA-Z][^>]*\bid="'+id+r'"[^>]*>',s);assert m,id
 s=s[:m.start()]+markup+s[m.start():]
rep('\n</style>','\n'+(dev/'workspace.css').read_text(encoding='utf-8')+'\n'+(dev/'enhancements.css').read_text(encoding='utf-8')+'\n'+(dev/'image-effects.css').read_text(encoding='utf-8')+'\n'+(dev/'ai-generation.css').read_text(encoding='utf-8')+'\n'+(dev/'ai-annotations.css').read_text(encoding='utf-8')+'\n'+(dev/'prompt-library.css').read_text(encoding='utf-8')+'\n'+(dev/'final-upgrades.css').read_text(encoding='utf-8')+'\n'+(dev/'file-sharing.css').read_text(encoding='utf-8')+'\n'+(dev/'cloud-storage.css').read_text(encoding='utf-8')+'\n'+(dev/'clipart.css').read_text(encoding='utf-8')+'\n'+(dev/'shapes.css').read_text(encoding='utf-8')+'\n'+(dev/'interaction-upgrades.css').read_text(encoding='utf-8')+'\n'+(dev/'colorizer.css').read_text(encoding='utf-8')+'\n'+(dev/'pwa.css').read_text(encoding='utf-8')+'\n'+(dev/'runtime-upgrades.css').read_text(encoding='utf-8')+'\n'+(dev/'pdf-import.css').read_text(encoding='utf-8')+'\n'+(dev/'memory-optimizations.css').read_text(encoding='utf-8')+'\n</style>')
rep('\n</style>','\n'+(dev/'alignment-guides.css').read_text(encoding='utf-8')+'\n</style>')
rep('\n</style>','\n'+(dev/'guide-manual.css').read_text(encoding='utf-8')+'\n</style>')
rep('\n</style>','\n'+(dev/'text-editing.css').read_text(encoding='utf-8')+'\n</style>')
rep('\n</style>','\n'+(dev/'i18n.css').read_text(encoding='utf-8')+'\n</style>')
rep('\n<body>','\n<body>\n'+(dev/'workspace-ui.html').read_text(encoding='utf-8')+'\n'+(dev/'pwa-ui.html').read_text(encoding='utf-8')+'\n'+(dev/'pdf-import.html').read_text(encoding='utf-8')+'\n'+(dev/'interaction-ui.html').read_text(encoding='utf-8')+'\n'+(dev/'prompt-library.html').read_text(encoding='utf-8')+'\n'+(dev/'file-sharing.html').read_text(encoding='utf-8')+'\n'+(dev/'cloud-storage-dialogs.html').read_text(encoding='utf-8')+'\n'+(dev/'raw-ai-prompt.html').read_text(encoding='utf-8')+'\n'+(dev/'ai-result-fallback.html').read_text(encoding='utf-8')+'\n'+(dev/'ai-annotations.html').read_text(encoding='utf-8'))
rep('\n<body>','\n<body>\n'+(dev/'alignment-guides-ui.html').read_text(encoding='utf-8'))
rep('<aside class="sidebar" id="sidebar">','<aside class="sidebar" id="sidebar"><div class="sidebar-controls"><button class="btn" id="collapseSections">Richiudi sezioni</button><button class="btn" id="expandSections">Espandi sezioni</button><label class="check"><input id="singleSection" type="checkbox" checked>Espandi singolarmente</label></div>'+(dev/'clipart-ui.html').read_text(encoding='utf-8')+(dev/'shapes-ui.html').read_text(encoding='utf-8')+(dev/'colorizer-ui.html').read_text(encoding='utf-8'))
rep('<div class="tabs"><button class="active" data-mode="whole">Frase su pagina</button><button data-mode="single">1 lettera/gruppo</button><button data-mode="custom">Multi custom page</button></div>','<div class="project-strip"><div id="projectTabs" class="project-tabs" role="tablist" aria-label="Progetti aperti"></div><button class="btn" id="newProjectBtn" title="Crea un nuovo progetto">+ Progetto</button></div>')
before('previewBtn','<button class="btn" id="quickAddPage" title="Aggiungi una pagina vuota al progetto">+ Pagina</button>')
before('deleteTool','<button class="iconbtn" id="copyTool" title="Copia oggetti · Ctrl+C"></button><button class="iconbtn" id="pasteTool" title="Incolla oggetti · Ctrl+V"></button><button class="iconbtn" id="groupTool" title="Raggruppa la selezione · Ctrl+G">⊞</button><button class="iconbtn" id="ungroupTool" title="Dividi il gruppo · Ctrl+Maiusc+G">⊟</button><button class="iconbtn" id="splitTool" title="Splitta il testo in caratteri e gruppi">✂</button>')
before('deleteTool','<button class="iconbtn" id="pasteImageTool" title="Incolla speciale · immagine dagli appunti" aria-label="Incolla speciale: immagine dagli appunti"></button>')
before('applyCropBtn','<button class="btn" id="resetCropActiveBtn" title="Rimuove il crop senza deformare l’immagine">Reset crop</button>')
nav_next=re.search(r'<button class="iconbtn" id="nextPage"[^>]*>.*?</button>',s);assert nav_next
s=s[:nav_next.end()]+'<button class="iconbtn" id="quickAddNav" title="Aggiungi dopo la pagina attiva">＋</button>'+s[nav_next.end():]
before('fontMode','<div class="font-fixed-preview"><small>Font impostato · <strong id="currentFontName"></strong></small><div id="currentFontSample" class="sample">Outline</div></div>')
before('textInput',(dev/'text-edit-ui.html').read_text(encoding='utf-8'))
rep('Tutto MAIUSCOLO <small>· per i nuovi testi</small>','Tutto MAIUSCOLO')
before('wizardResultName','<div class="font-fixed-preview"><small>Anteprima proposta dal wizard</small><div id="wizardFontSample" class="sample">Outline</div></div>')
before('emojiCategory','<label class="check emoji-translate-option"><input id="emojiTranslate" type="checkbox" checked>Traduzione automatica italiano → inglese</label><p class="help">Con la traduzione attiva premi Invio o la lente. Le parole note restano locali; Gemma tramite Puter completa i termini sconosciuti e le traduzioni riuscite vengono ricordate nel browser.</p><p class="help puter-translation-hint" data-puter-translation-hint>Senza accesso Puter la traduzione usa solo il dizionario incorporato e le traduzioni già memorizzate. <button type="button" class="text-link" data-puter-login-link>Accedi a Puter per la traduzione AI</button></p><p class="help translation-cache-control" data-translation-cache-control><button type="button" class="text-link" id="clearEmojiTranslations">Elimina traduzioni salvate</button></p>')
rep('<input class="field" id="emojiSearch" placeholder="Cerca smile, cuore, cat…" style="margin-top:8px">','<div class="emoji-search-row"><input class="field" id="emojiSearch" type="search" placeholder="Cerca smile, cuore, cat…"><button class="btn accent emoji-search-submit" id="emojiSearchBtn" type="button" title="Cerca emoji" aria-label="Cerca emoji"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m15.5 15.5 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div>')
before('helpBtn','<button class="btn hidden" id="installPwaBtn" title="Installa chicCanva su questo dispositivo" aria-label="Installa chicCanva"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 16v3h14v-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Installa</span></button>')
before('helpBtn',(dev/'i18n-ui.html').read_text(encoding='utf-8'))
mobile_memory='<section class="card mobile-memory"><div class="card-b"><div class="row">'
rep(mobile_memory,'<section class="card mobile-memory"><div class="card-b">'+(dev/'i18n-mobile-ui.html').read_text(encoding='utf-8')+'<div class="row">')
rep('<label class="small">Simboli uniti alla precedente / successiva</label>','<label class="small" data-symbol-options>Simboli uniti alla precedente / successiva</label>')
rep('<div class="grid2"><input class="field" id="symbolsPrev"','<div class="grid2" data-symbol-options><input class="field" id="symbolsPrev"')
rep('<label class="check"><input type="checkbox" id="smartApostrophe"','<label class="check" data-symbol-options><input type="checkbox" id="smartApostrophe"')
rep('<span>Separa in singole lettere / emoji</span>','<span>Un oggetto per lettera / gruppo di simboli</span>')
rep('<button class="btn" id="imageFromUrl" title="Carica un’immagine tramite il suo indirizzo web">Da URL</button><button class="btn accent" id="uploadImageBtn" style="width:100%">Carica immagine</button>','<div class="row image-source-actions"><button class="btn" id="imageFromUrl" title="Carica un’immagine tramite il suo indirizzo web">Da URL</button><button class="btn accent" id="uploadImageBtn">Carica immagine</button></div><button class="btn paste-image-button" id="pasteImageCanvasBtn">Incolla immagine dagli appunti</button>')
rep('<div class="row" style="margin-top:8px"><button class="btn grow" id="startCropBtn">Crop mode</button>','<button class="btn pdf-import-button" id="importPdfBtn">Importa PDF come immagini</button><input id="pdfFile" type="file" accept="application/pdf,.pdf" hidden>'+(dev/'memory-ui.html').read_text(encoding='utf-8')+'<div class="row" style="margin-top:8px"><button class="btn grow" id="startCropBtn">Crop mode</button>')
rep('<label class="small">Immagine di riferimento · opzionale</label><div class="row"><button class="btn" id="referenceFromUrl" title="Allega un’immagine di riferimento tramite URL">Riferimento da URL</button><button class="btn grow" id="attachAiReference">＋ Allega immagine</button><button class="btn" id="useCanvasReference" title="Usa l’immagine selezionata come riferimento AI">Dal canvas</button></div>','<label class="small">Immagine di riferimento · opzionale</label><div class="row reference-source-actions"><button class="btn" id="referenceFromUrl" title="Allega un’immagine di riferimento tramite URL">Da URL</button><button class="btn grow" id="attachAiReference">＋ Allega</button><button class="btn" id="pasteAiReferenceBtn">Incolla</button><button class="btn" id="useCanvasReference" title="Usa l’immagine selezionata come riferimento AI">Dal canvas</button></div>')
rep('<label class="small">Provider</label><select id="aiProvider"><option value="openai-image-generation">OpenAI Image</option><option value="gemini">Gemini</option><option value="xai">xAI</option><option value="together">Together</option><option value="replicate-image-generation">Replicate</option></select>','<label class="small">Famiglia / provider</label><select id="aiProvider"><option value="openai-image-generation">OpenAI Image</option><option value="xai">xAI</option><option value="other">Altri modelli</option></select>')
rep('<label class="small">Modello</label><div class="row"><select class="grow" id="aiModel"></select><button class="btn" id="refreshAiModels">Aggiorna</button></div>','<label class="small">Modello</label><select id="aiModel"></select><button class="hidden" id="refreshAiModels" type="button" tabindex="-1" aria-hidden="true">Aggiorna</button>')
rep('<div class="grid2"><div><label class="small">Qualità</label><select id="aiQuality"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option><option value="auto">Auto</option><option value="1K">1K</option><option value="2K">2K</option><option value="4K">4K</option></select></div><div><label class="small">Aspect ratio</label><select id="aiRatio"><option>1:1</option><option>4:3</option><option>3:4</option><option>16:9</option><option>9:16</option></select></div></div>','<div class="ai-output-primary"><div><label class="small">Qualità</label><select id="aiQuality"></select></div><div><label class="small">Aspect ratio</label><select id="aiRatio"><option>1:1</option><option>4:3</option><option>3:4</option><option>16:9</option><option>9:16</option></select></div></div><div id="aiResolutionWrap" class="ai-resolution-row hidden"><label class="small" id="aiResolutionLabel">Risoluzione · lato corto</label><select id="aiResolution"></select></div><label id="aiCustomResolutionWrap" class="check hidden ai-custom-resolution"><input id="aiCustomResolution" type="checkbox">Inserisci larghezza e altezza personalizzate</label><div id="aiCustomResolutionFields" class="ai-custom-resolution-fields hidden"><label><span>Larghezza px</span><input class="field" id="aiCustomWidth" type="number" min="16" max="3840" step="16" value="1024"></label><label><span>Altezza px</span><input class="field" id="aiCustomHeight" type="number" min="16" max="3840" step="16" value="1024"></label></div><p class="help ai-output-warning hidden" id="aiOutputWarning" role="status"></p><p class="help" id="aiOutputHelp">Qualità e risoluzione vengono mostrate separatamente solo quando il provider le espone come parametri distinti.</p>')
rep('<div id="aiReferencePreview" class="reference-preview hidden"><img id="aiReferenceImg" alt="Immagine di riferimento"><div class="grow"><strong id="aiReferenceName"></strong><div class="help">Verrà inviata a Puter quando premi Genera.</div></div><button id="clearAiReference" class="iconbtn" title="Rimuovi riferimento">×</button></div>','<div id="aiReferencePreview" class="reference-preview hidden"><img id="aiReferenceImg" alt="Immagine di riferimento"><div class="grow"><strong id="aiReferenceName"></strong><div class="help">Verrà inviata a Puter quando premi Genera.</div></div><button id="clearAiReference" class="iconbtn" title="Rimuovi riferimento">×</button></div><div id="aiReferenceScalePanel" class="ai-reference-scale hidden"><div class="range-label"><span>Risoluzione inviata</span><strong id="aiReferenceScaleLabel">1×</strong></div><input id="aiReferenceScale" type="range" min="0" max="5" step="1" value="3" list="aiReferenceScaleTicks"><datalist id="aiReferenceScaleTicks"><option value="0" label="0,25×"></option><option value="1" label="0,5×"></option><option value="2" label="0,75×"></option><option value="3" label="1×"></option><option value="4" label="2×"></option><option value="5" label="3×"></option></datalist><div class="range-ends"><span>0,25×</span><span>0,5×</span><span>0,75×</span><span>1×</span><span>2×</span><span>3×</span></div><p class="help" id="aiReferenceScaleInfo">L’originale resta invariato; la copia scalata viene creata soltanto per la richiesta.</p></div>'+(dev/'ai-annotations-ui.html').read_text(encoding='utf-8'))
rep('<div id="puterControls">',(dev/'puter-auth.html').read_text(encoding='utf-8')+'<div id="puterControls">'+(dev/'puter-usage.html').read_text(encoding='utf-8'))
rep('<dialog id="urlDialog" class="chic-dialog"><h2 id="urlTitle">Carica immagine da URL</h2><label>Indirizzo dell’immagine<input type="url" id="imageUrlInput" placeholder="https://…/immagine.png"></label><p class="help">Usa il link diretto a un’immagine. Il sito deve consentire il caricamento da altre origini (CORS). Se non lo consente, scarica l’immagine e caricala da file.</p>','<dialog id="urlDialog" class="chic-dialog"><h2 id="urlTitle">Carica immagine da URL</h2><label>Indirizzo dell’immagine<input type="url" id="imageUrlInput" placeholder="https://…/immagine.png"></label><label class="check puter-url-option"><input id="imageUrlUsePuter" type="checkbox">Usa Puter per scaricare l’immagine</label><p class="help puter-login-hint" data-puter-login-hint>Per usare il caricamento tramite Puter effettua il login nella sezione Generazione immagini AI · Puter. <button type="button" class="text-link" data-puter-login-link>Vai al login</button></p><p class="help">Il caricamento diretto è gratuito ma alcuni siti lo bloccano. Puter usa banda o quota dell’account. Puoi anche copiare l’immagine dal sito e usare <strong>Incolla immagine dagli appunti</strong>.</p>')
rep('<label class="small">Rimozione sfondo</label>',(dev/'image-effects.html').read_text(encoding='utf-8')+'<div class="background-box"><label class="small">Rimozione sfondo</label>')
bg_status=re.search(r'<div class="status" id="removeBgStatus">.*?</div>',s);assert bg_status
s=s[:bg_status.end()]+'</div>'+s[bg_status.end():]
rep('id="customCardTitle">Pagina custom','id="customCardTitle">Gestione pagina')
rep("strokeColor:'#e43b48'","strokeColor:'#000000'")
rep('id="strokeColor" value="#e43b48"','id="strokeColor" value="#000000"')
rep('<input id="bgColor" type="color" value="#ffffff" title="Colore da rimuovere">','<input id="bgColor" type="color" value="#ffffff" title="Colore da rimuovere"><label class="check bg-auto-color"><input id="bgAutoColor" type="checkbox">Rileva colore automaticamente dai bordi</label>')
rep('<input id="bgEverywhere" type="checkbox">','<input id="bgEverywhere" type="checkbox" checked>')
rep('<div><label class="small">Griglia mm</label><input class="field" id="gridSpacing" type="number" min="1" max="100" step="1" value="10"></div><div><label class="small">Snap mm</label><input class="field" id="snapSpacing" type="number" min="0.5" max="100" step="0.5" value="5"></div>','<div><label class="small">Griglia mm</label><input class="field" id="gridSpacing" type="number" min="1" max="50" step="1" value="10"></div><div><label class="small">Snap mm</label><input class="field" id="snapSpacing" type="number" min="1" max="50" step="1" value="5"></div><div><label class="small">Rotazione a scatti</label><div class="rotation-step-field"><input class="field" id="snapRotationStep" type="number" min="1" max="90" step="1" value="10"><span>°</span></div></div><div class="fit-margin-setting"><label class="small" for="fitMarginMm">Margine adattamento (mm)</label><input class="field" id="fitMarginMm" type="number" min="0" max="100" step="1" value="15"></div>')
rep('<button data-action="duplicate" role="menuitem">','<button data-action="copy" role="menuitem">Copia <span>Ctrl C</span></button><button data-action="paste" role="menuitem">Incolla <span>Ctrl V</span></button><button data-action="group" role="menuitem">Raggruppa <span>Ctrl G</span></button><button data-action="ungroup" role="menuitem">Dividi gruppo <span>Ctrl ⇧ G</span></button><button data-action="split" role="menuitem">Splitta testo</button><button id="objectLockAction" data-action="lock" role="menuitem">Fissa posizione</button><button data-action="duplicate" role="menuitem">')
rep('<div class="preview hidden" id="previewPanel">',(dev/'workspace-special.html').read_text(encoding='utf-8')+'<div class="preview hidden" id="previewPanel">')
rep('<button class="btn" id="closePreview">Chiudi</button>','<div class="preview-reorder"><button class="btn" id="previewReorder">Riordina</button><button class="btn" id="previewMoveLeft" title="Sposta pagina a sinistra">←</button><button class="btn" id="previewMoveRight" title="Sposta pagina a destra">→</button></div><button class="iconbtn" id="closePreview" title="Chiudi anteprima" aria-label="Chiudi anteprima">×</button>')
rep('<label class="small">Nome pagina</label>','<div class="page-reorder"><button class="btn" id="pageMoveLeft" title="Sposta la pagina prima">← Prima</button><button class="btn" id="pageMoveRight" title="Sposta la pagina dopo">Dopo →</button></div><label class="small">Nome pagina</label>')
rep('<label class="small">Stile illustrazione</label><select id="aiStyle"></select><label class="small">Prompt</label><textarea id="aiPrompt"',(dev/'prompt-library-launch.html').read_text(encoding='utf-8')+'<label class="small">Stile illustrazione</label><select id="aiStyle"></select><label class="small">Prompt</label><textarea id="aiPrompt"')
rep('</textarea>\n          <button class="btn accent" id="generateAiBtn"','</textarea><button class="text-link ai-raw-prompt-link" id="showRawAiPrompt" type="button">Mostra il prompt completo inviato</button><button class="btn ai-paste-prompt" id="pasteAiPromptBtn" type="button">Incolla testo e aggiungi al prompt</button><label class="check ai-postprocess"><input id="aiChromaKey" type="checkbox">Genera con sfondo uniforme per chroma key</label><label class="check ai-postprocess"><input id="aiRemoveBackground" type="checkbox">Duplica il contenuto generato e rimuovi lo sfondo</label>\n          <button class="btn accent" id="generateAiBtn"')
rep('<button class="btn accent" id="generateAiBtn" style="width:100%">Genera e inserisci</button>','<div class="ai-cost-estimate" id="aiCostEstimate" aria-live="polite"><div class="ai-cost-main"><strong>Stima Consumo</strong><span id="aiCostEstimateValue">~ calcolo…</span></div><small class="ai-last-generation hidden" id="aiLastGeneration"></small><small class="estimate-detail" id="aiCostEstimateDetail"></small><div class="ai-pricing-meta"><span id="aiPricingStatus">Prezziario incorporato</span><button type="button" class="text-link" id="aiPricingRefresh">Aggiorna prezziario</button></div></div><button class="btn accent" id="generateAiBtn" style="width:100%">Genera e inserisci</button>')
rep("together:['black-forest-labs/FLUX.1-schnell-Free','black-forest-labs/FLUX.1-schnell']","together:[]")
assert 'black-forest-labs/FLUX.1-schnell' not in s, 'Il vecchio fallback Together/Flux non deve entrare nella build'
canvas_card=re.search(r'<section class="card">\s*<div class="card-h"><div><div class="card-title">Canvas, griglia & export immagine</div>[\s\S]*?</section>',s);assert canvas_card
canvas_markup=canvas_card.group(0)
canvas_markup=canvas_markup.replace('Canvas, griglia & export immagine','Canvas, griglia e snap').replace('Griglia e snapping sono indipendenti. L’export regione può avere margine e trasparenza.','Imposta gli aiuti visivi del foglio; non vengono stampati.')
canvas_markup=re.sub(r'\s*<label class="small">Export cropped image</label>[\s\S]*?<div class="status">Selection box:.*?</div>','',canvas_markup)
guide_settings='<div class="guide-snap-settings"><label class="check"><input id="guideSnapEnabled" type="checkbox" checked>Snap a linee guida</label><div class="guide-snap-options" id="guideSnapOptions"><label class="check"><input id="guideSnapPage" type="checkbox" checked>Centro pagina</label><label class="check"><input id="guideSnapEdges" type="checkbox" checked>Bordi pagina</label><label class="check"><input id="guideSnapObjects" type="checkbox" checked>Allineamento oggetti</label><label class="check"><input id="guideSnapSpacing" type="checkbox" checked>Equispaziatura</label></div><label class="check"><input id="aspectRatioLock" type="checkbox">Blocca proporzioni nel resize e crop</label><p class="help"><kbd>Maiusc</kbd> inverte il blocco proporzioni. Durante lo spostamento <kbd>Alt</kbd> inverte le guide; <kbd>Maiusc</kbd> + <kbd>Alt</kbd> esclude le guide e inverte lo snap classico.</p></div>'
canvas_markup=canvas_markup.replace('</div>\n    </section>',guide_settings+'</div>\n    </section>')
s=s[:canvas_card.start()]+canvas_markup+s[canvas_card.end():]
project_card=re.search(r'<section class="card">\s*<div class="card-h"><div><div class="card-title">Progetto & PDF</div>[\s\S]*?</section>',s);assert project_card
s=s[:project_card.start()]+(dev/'cloud-storage.html').read_text(encoding='utf-8')+(dev/'export-center.html').read_text(encoding='utf-8')+s[project_card.end():]
rep('<label class="check"><input type="radio" name="pdfScope" value="current" checked>Solo la pagina corrente</label><label class="check"><input type="radio" name="pdfScope" value="set">Tutte le pagine del progetto corrente</label>','<div class="pdf-dialog-options"><label class="check"><input type="radio" name="pdfScope" value="current" checked>Solo la pagina corrente</label><label class="check"><input type="radio" name="pdfScope" value="set">Tutte le pagine del progetto corrente</label></div>')
# Keep the existing asynchronous runtime and rendering features; replace the application entry point.
pdf_import=(dev/'pdf-import.js').read_text(encoding='utf-8')
pdf_worker=base64.b64encode((dev/'vendor/pdf.worker.min.js').read_bytes()).decode('ascii')
pdf_import="const PDF_WORKER_BASE64='"+pdf_worker+"';\n"+pdf_import
transfer_vendor=(dev/'vendor/chic-transfer-vendor.js').read_text(encoding='utf-8');assert '</script' not in transfer_vendor.lower(), 'Il bundle P2P contiene una chiusura script non incorporabile'
mega_vendor=(dev/'vendor/megajs-1.3.10.js').read_text(encoding='utf-8');assert '</script' not in mega_vendor.lower(), 'Il bundle MEGAJS contiene una chiusura script non incorporabile'
rep("init().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});",(dev/'chic-fonts.js').read_text(encoding='utf-8')+'\n'+(dev/'workspace.js').read_text(encoding='utf-8')+'\n'+(dev/'enhancements.js').read_text(encoding='utf-8')+'\n'+(dev/'image-effects.js').read_text(encoding='utf-8')+'\n'+(dev/'ai-generation.js').read_text(encoding='utf-8')+'\n'+(dev/'ai-annotations.js').read_text(encoding='utf-8')+'\n'+(dev/'prompt-library.js').read_text(encoding='utf-8')+'\n'+(dev/'final-upgrades.js').read_text(encoding='utf-8')+'\n'+(dev/'crop-upgrades.js').read_text(encoding='utf-8')+'\n'+(dev/'clipart.js').read_text(encoding='utf-8')+'\n'+(dev/'puter-billing.js').read_text(encoding='utf-8')+'\n'+(dev/'pwa.js').read_text(encoding='utf-8')+'\n'+(dev/'runtime-upgrades.js').read_text(encoding='utf-8')+'\n'+(dev/'search-translation.js').read_text(encoding='utf-8')+'\n'+(dev/'memory-optimizations.js').read_text(encoding='utf-8')+'\n'+(dev/'shapes.js').read_text(encoding='utf-8')+'\n'+(dev/'interaction-upgrades.js').read_text(encoding='utf-8')+'\n'+(dev/'colorizer.js').read_text(encoding='utf-8')+'\n'+pdf_import+'\n'+transfer_vendor+'\nglobalThis.ChicTransferVendor=ChicTransferVendor;\n'+(dev/'file-sharing.js').read_text(encoding='utf-8')+'\n'+mega_vendor+'\n'+(dev/'cloud-storage.js').read_text(encoding='utf-8')+"\ninit().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});")
rep("init().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});",(dev/'alignment-guides.js').read_text(encoding='utf-8')+"\ninit().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});")
rep("init().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});",(dev/'text-editing.js').read_text(encoding='utf-8')+"\ninit().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});")
help_en_json=json.dumps((dev/'help-v7-en.html').read_text(encoding='utf-8'),ensure_ascii=False)
i18n_script='globalThis.CHICCANVA_HELP_EN='+help_en_json+';\n'+(dev/'i18n.js').read_text(encoding='utf-8')
rep("init().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});",i18n_script+"\ninit().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});")
# Remove obsolete mode explanations from the guide.
s=s.replace('<h3>1. Scegli come lavorare</h3>', '<h3>1. Progetti e funzioni speciali</h3>')
start=s.index('<h3>1. Progetti e funzioni speciali</h3>');end=s.index('<h3>2. Trova il carattere giusto</h3>',start)
s=s[:start]+'<h3>1. Progetti e funzioni speciali</h3><p>Ogni scheda è un progetto indipendente con pagine di formato libero. + Progetto chiede conferma; Apri JSON crea una nuova scheda. Chiudendo una scheda puoi esportarla subito e viene rimossa dall’autosalvataggio. Tutti i progetti aperti vengono recuperati insieme al refresh.</p><p>Aggiungi testo inserisce una frase oppure un oggetto per lettera/gruppo. Le opzioni dei simboli e dell’apostrofo compaiono quando scegli i singoli caratteri. Funzioni e Progetti Speciali genera una lettera/gruppo per pagina: di default crea un nuovo progetto; sul progetto aperto puoi aggiungere pagine oppure rimpiazzarle con conferma.</p><p>Copia e Incolla (Ctrl+C / Ctrl+V) funzionano anche tra pagine e progetti aperti usando gli appunti interni all’app. Il menu destro comprende entrambe le funzioni. Il font attuale e quello proposto dal wizard hanno anteprime separate. Il PDF in alto chiede pagina corrente oppure tutte le pagine del progetto.</p>'+s[end:]
s=s.replace('Importa anche i precedenti progetti OutlineLab.','Il formato progetto è chicCanva v7.')
s=s.replace('pagina attuale, modalità corrente o tutte le modalità','pagina attuale o tutte le pagine del progetto')
s=s.replace('Progetti compatibili v4 · pagine, oggetti e asset incorporati.','Progetti chicCanva v7 · pagine, oggetti, asset e storico opzionale.')
# The guide is for users: replace the old technical/error narrative completely.
guide=re.search(r'<div class="help-content">[\s\S]*?</div></section></div>',s);assert guide
s=s[:guide.start()]+'<div class="help-content">'+(dev/'help-v7.html').read_text(encoding='utf-8')+'</div></section></div>'+s[guide.end():]
s=s.replace('serve il launcher','apri l’app tramite webserver').replace('Serve il launcher','Apri l’app tramite webserver').replace('dal launcher','tramite webserver').replace('Il launcher','Il webserver')
s=s.replace('Piccole idee, grandi scoperte · con Chicca','Piccole idee, grandi progetti · con Chicca')
rep("else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)&&canvas.getActiveObject()&&!cropSession){","else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)&&canvas.getActiveObject()&&!canvas.getActiveObject().chicLocked&&!cropSession){")
license=re.search(r'<details class="license"><summary>Librerie e licenze</summary><p>.*?</p></details>',s,re.S);assert license
license_html='''<div id="memoryFootprint" class="memory-footprint"><strong>Carico chicCanva</strong><br>Calcolo memoria e spazio browser…</div><div class="app-footer-meta"><p class="app-repository"><a href="https://github.com/n3me5is-git/chicCanva" target="_blank" rel="noopener noreferrer">Repository GitHub di chicCanva</a></p><div class="app-build-info">chicCanva <strong id="appVersion">v'''+version+'''</strong><br>Data build: <time id="appBuildDate" datetime="'''+build_date+'''">'''+build_date+'''</time></div></div><details class="license"><summary>Librerie, contenuti e licenze</summary><p>Fabric.js 5.1.0 e jsPDF 2.5.1: MIT. PDF.js 3.11.174: Apache License 2.0, Mozilla e contributori. MEGAJS 1.3.10: MIT, client non ufficiale per MEGA. Trystero 0.25.3, @trystero-p2p/core 0.25.3, @trystero-p2p/nostr 0.25.3 e @noble/secp256k1 3.2.0: MIT. Nayuki QR Code Generator 1.8.0: MIT. jsQR 1.4.0: Apache License 2.0. ONNX Runtime Web 1.21.0: MIT e relative notice. IMG.LY background-removal 1.7.0: AGPL-3.0; <a href="https://github.com/imgly/background-removal-js" target="_blank" rel="noopener">sorgente e licenza</a>. OpenMoji 17: grafica CC BY-SA 4.0, HfG Schwäbisch Gmünd e collaboratori; codice OpenMoji LGPL-3.0 dove applicabile. Le opere pubblicate su Openclipart sono indicate dal progetto come pubblico dominio/CC0 1.0. Puter.js e i servizi Puter, inclusa la traduzione opzionale con Gemma 4 31B, seguono le rispettive licenze e condizioni del servizio. Fontsource, Google Fonts e ogni famiglia tipografica conservano la propria licenza.</p></details>'''
s=s[:license.start()]+license_html+s[license.end():]

# Use the active UI locale for dates and numbers generated at runtime. The i18n
# layer supplies appLocale(); function declarations are available throughout the
# complete generated application script.
s=s.replace(".toLocaleString('it-IT'", ".toLocaleString(appLocale()")
s=s.replace(".toLocaleTimeString('it-IT'", ".toLocaleTimeString(appLocale()")
s=s.replace(".toLocaleDateString('it-IT'", ".toLocaleDateString(appLocale()")
s=s.replace(".toLocaleUpperCase('it-IT'", ".toLocaleUpperCase(appLocale()")
s=s.replace(".toLocaleLowerCase('it-IT'", ".toLocaleLowerCase(appLocale()")
s=s.replace("new Intl.NumberFormat('it-IT'", "new Intl.NumberFormat(appLocale()")
s=s.replace("new Intl.DateTimeFormat('it-IT'", "new Intl.DateTimeFormat(appLocale()")

# A malformed inline script makes the whole single-file application unusable.
# Validate every inline block before publishing the root and final-build copies.
node=shutil.which('node')
if node and os.environ.get('CHICCANVA_SKIP_NODE_CHECK')!='1':
 for index,match in enumerate(re.finditer(r'<script(?:\s[^>]*)?>([\s\S]*?)</script>',s,re.I)):
  script=match.group(1)
  if not script.strip():continue
  check=subprocess.run([node,'--check','-'],input=script,capture_output=True,text=True,encoding='utf-8')
  if check.returncode:
   raise RuntimeError(f'JavaScript inline {index} non valido:\n'+check.stderr)
elif not node:
 print('Avviso: Node non trovato; controllo sintattico JavaScript non eseguito.')
else:
 print('Controllo sintattico Node omesso tramite CHICCANVA_SKIP_NODE_CHECK.')

(root/'chicCanva.html').write_text(s,encoding='utf-8')
# CopyFile2 may fail on Windows while a browser has the generated HTML memory
# mapped. Writing the bytes in place remains safe and lets iterative builds update
# the distribution even when its previous version is open for testing.
for name in ['chicCanva.html','chicCanva_server.bat']:
 write_bytes_retry(root/'build/chicCanva'/name,(root/name).read_bytes())
pwa_build=root/'build/chicCanva-pwa';pwa_build.mkdir(parents=True,exist_ok=True)
# The hosted PWA keeps the exact same generated application, but externalizes the
# large inline payloads. Crawlers receive the title and Open Graph metadata in a
# small initial document, while the desktop/server distribution remains monolithic.
pwa_html=s
# Keep the monolithic download self-contained. In the hosted PWA, use the same
# generated guide screenshots as cacheable files so the crawler-facing index
# remains small and the illustrated guide is still available offline.
guide_asset_names=sorted(path.name for path in (dev/'guide-assets').glob('*.png'))
for name in guide_asset_names:
 image_bytes=(dev/'guide-assets'/name).read_bytes()
 embedded='data:image/png;base64,'+base64.b64encode(image_bytes).decode('ascii')
 pwa_html=pwa_html.replace(embedded,'guide-assets/'+name)
guide_asset_build=pwa_build/'guide-assets'
if guide_asset_build.exists():shutil.rmtree(guide_asset_build)
guide_asset_build.mkdir(parents=True)
for name in guide_asset_names:shutil.copy2(dev/'guide-assets'/name,guide_asset_build/name)
# Keep the monolithic distribution self-contained, while the hosted PWA can use
# its same-origin icon. This shortens the crawler-facing head and avoids making a
# social crawler scan an embedded base64 icon before reaching the body.
pwa_html=re.sub(r'<link rel="icon" type="image/png" sizes="192x192" href="data:image/png;base64,[^"]+">','<link rel="icon" type="image/png" sizes="192x192" href="chiccanva-192.png">',pwa_html,count=1)
script_names=['fabric.js','jspdf.js','chiccanva-pdf.js','chiccanva-app.js']
script_blocks=[]
def externalize_script(match):
 if 'data-i18n-bootstrap' in (match.group(1) or ''):return match.group(0)
 index=len(script_blocks);script_blocks.append(match.group(2))
 assert index<len(script_names), 'Trovati più script inline del previsto'
 attrs=match.group(1) or ''
 return '<script'+attrs+' src="'+script_names[index]+'" defer></script>'
pwa_html=re.sub(r'<script(?![^>]*\bsrc\s*=)([^>]*)>([\s\S]*?)</script>',externalize_script,pwa_html,flags=re.I)
assert len(script_blocks)==len(script_names), f'Attesi {len(script_names)} script inline, trovati {len(script_blocks)}'
for name,content in zip(script_names,script_blocks):(pwa_build/name).write_text(content.strip()+'\n',encoding='utf-8')
style_blocks=[]
def externalize_style(match):
 style_blocks.append(match.group(1))
 return '<link rel="stylesheet" href="chiccanva.css">' if len(style_blocks)==1 else ''
pwa_html=re.sub(r'<style(?:\s[^>]*)?>([\s\S]*?)</style>',externalize_style,pwa_html,flags=re.I)
assert len(style_blocks)==1, f'Atteso un blocco CSS inline, trovati {len(style_blocks)}'
(pwa_build/'chiccanva.css').write_text(style_blocks[0].strip()+'\n',encoding='utf-8')
for name in ['chicCanva.webmanifest','chicCanva-en.webmanifest','chiccanva-192.png','chiccanva-512.png','chiccanva-share.png','chiccanva-share.jpg']:shutil.copy2(dev/'pwa'/name,pwa_build/name)
(pwa_build/'robots.txt').write_text('User-agent: TelegramBot\nAllow: /\n\nUser-agent: WhatsApp\nAllow: /\n\nUser-agent: facebookexternalhit\nAllow: /\n\nUser-agent: Facebot\nAllow: /\n\nUser-agent: Twitterbot\nAllow: /\n\nUser-agent: LinkedInBot\nAllow: /\n\nUser-agent: Slackbot\nAllow: /\n\nUser-agent: Discordbot\nAllow: /\n\nUser-agent: Googlebot\nAllow: /\n\nUser-agent: Bingbot\nAllow: /\n\nUser-agent: *\nDisallow: /\n',encoding='utf-8')
(pwa_build/'_headers').write_text('/chiccanva-share.jpg\n  Cache-Control: public, max-age=86400\n',encoding='utf-8')
build_material=pwa_html.encode('utf-8')+b''.join((pwa_build/name).read_bytes() for name in ['chiccanva.css',*script_names])+b''.join((guide_asset_build/name).read_bytes() for name in guide_asset_names)
build_id=hashlib.sha256(build_material).hexdigest()[:16]
# Stable filenames make manual uploads simple, while the per-build query keeps a
# newly uploaded index from executing JavaScript retained by the HTTP cache or by
# the previous service worker. This prevents mixed revisions after partial/staged
# uploads and still lets the PWA precache the complete shell for offline use.
versioned_assets=['chiccanva.css',*script_names,'chicCanva.webmanifest','chicCanva-en.webmanifest']
for name in versioned_assets:
 pwa_html=pwa_html.replace('="'+name+'"','="'+name+'?v='+build_id+'"')
(pwa_build/'index.html').write_text(pwa_html,encoding='utf-8')
sw=(dev/'pwa'/'chicCanva-sw.js').read_text(encoding='utf-8').replace('__BUILD_ID__',build_id)
sw=sw.replace("'./robots.txt']","'./robots.txt',"+','.join(repr('./guide-assets/'+name) for name in guide_asset_names)+']')
for name in versioned_assets:
 sw=sw.replace("'./"+name+"'","'./"+name+"?v="+build_id+"'")
assert '__BUILD_ID__' not in sw
(pwa_build/'chicCanva-sw.js').write_text(sw,encoding='utf-8')
assert len(pwa_html.encode('utf-8'))<500000, 'Index PWA ancora troppo pesante per crawler e avvio rapido'
assert 'chiccanva-app.js' in pwa_html and 'og:image:width" content="1200' in pwa_html
assert "const BUILD_ID='"+build_id+"'" in sw, 'Versione service worker non sincronizzata'
print('Build chicCanva',version,'del',build_date,':',len(s),'caratteri · PWA',build_id)
