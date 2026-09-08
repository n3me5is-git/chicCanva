from pathlib import Path
import os,re,shutil,subprocess,hashlib
root=Path(__file__).resolve().parent.parent;dev=root/'development'
s=(dev/'chic-v6-baseline.html').read_text(encoding='utf-8')
s=s.replace('<title>chicCanva — editor outline multi-page</title>','<title>chicCanva — mini editor didattico</title>',1)
pending_start=s.index('// Workspace persistence, undo/redo and the complete emoji browser.')
pending_end=s.index("init().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});",pending_start)
s=s[:pending_start]+(dev/'pending.js').read_text(encoding='utf-8').strip()+'\n'+s[pending_end:]
def rep(a,b):
 global s
 assert a in s,a[:100]
 s=s.replace(a,b,1)
def before(id,markup):
 global s
 m=re.search(r'<[a-zA-Z][^>]*\bid="'+id+r'"[^>]*>',s);assert m,id
 s=s[:m.start()]+markup+s[m.start():]
rep('\n</style>','\n'+(dev/'workspace.css').read_text(encoding='utf-8')+'\n'+(dev/'enhancements.css').read_text(encoding='utf-8')+'\n'+(dev/'image-effects.css').read_text(encoding='utf-8')+'\n'+(dev/'final-upgrades.css').read_text(encoding='utf-8')+'\n'+(dev/'clipart.css').read_text(encoding='utf-8')+'\n'+(dev/'pwa.css').read_text(encoding='utf-8')+'\n</style>')
rep('\n<body>','\n<body>\n'+(dev/'workspace-ui.html').read_text(encoding='utf-8')+'\n'+(dev/'pwa-ui.html').read_text(encoding='utf-8'))
rep('<aside class="sidebar" id="sidebar">','<aside class="sidebar" id="sidebar"><div class="sidebar-controls"><button class="btn" id="collapseSections">Richiudi sezioni</button><button class="btn" id="expandSections">Espandi sezioni</button><label class="check"><input id="singleSection" type="checkbox" checked>Espandi singolarmente</label></div>'+(dev/'clipart-ui.html').read_text(encoding='utf-8'))
rep('<div class="tabs"><button class="active" data-mode="whole">Frase su pagina</button><button data-mode="single">1 lettera/gruppo</button><button data-mode="custom">Multi custom page</button></div>','<div class="project-strip"><div id="projectTabs" class="project-tabs" role="tablist" aria-label="Progetti aperti"></div><button class="btn" id="newProjectBtn" title="Crea un nuovo progetto">+ Progetto</button></div>')
before('previewBtn','<button class="btn" id="quickAddPage" title="Aggiungi una pagina vuota al progetto">+ Pagina</button>')
before('deleteTool','<button class="iconbtn" id="copyTool" title="Copia oggetti · Ctrl+C"></button><button class="iconbtn" id="pasteTool" title="Incolla oggetti · Ctrl+V"></button><button class="iconbtn" id="groupTool" title="Raggruppa la selezione · Ctrl+G">⊞</button><button class="iconbtn" id="ungroupTool" title="Dividi il gruppo · Ctrl+Maiusc+G">⊟</button><button class="iconbtn" id="splitTool" title="Splitta il testo in caratteri e gruppi">✂</button>')
before('deleteTool','<button class="iconbtn" id="pasteImageTool" title="Incolla speciale · immagine dagli appunti" aria-label="Incolla speciale: immagine dagli appunti"></button>')
nav_next=re.search(r'<button class="iconbtn" id="nextPage"[^>]*>.*?</button>',s);assert nav_next
s=s[:nav_next.end()]+'<button class="iconbtn" id="quickAddNav" title="Aggiungi dopo la pagina attiva">＋</button>'+s[nav_next.end():]
before('fontMode','<div class="font-fixed-preview"><small>Font impostato · <strong id="currentFontName"></strong></small><div id="currentFontSample" class="sample">Outline</div></div>')
before('wizardResultName','<div class="font-fixed-preview"><small>Anteprima proposta dal wizard</small><div id="wizardFontSample" class="sample">Outline</div></div>')
before('helpBtn','<button class="btn hidden" id="installPwaBtn" title="Installa chicCanva su questo dispositivo" aria-label="Installa chicCanva"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 16v3h14v-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Installa</span></button>')
rep('<label class="small">Simboli uniti alla precedente / successiva</label>','<label class="small" data-symbol-options>Simboli uniti alla precedente / successiva</label>')
rep('<div class="grid2"><input class="field" id="symbolsPrev"','<div class="grid2" data-symbol-options><input class="field" id="symbolsPrev"')
rep('<label class="check"><input type="checkbox" id="smartApostrophe"','<label class="check" data-symbol-options><input type="checkbox" id="smartApostrophe"')
rep('<span>Separa in singole lettere / emoji</span>','<span>Un oggetto per lettera / gruppo di simboli</span>')
rep('<button class="btn" id="imageFromUrl" title="Carica un’immagine tramite il suo indirizzo web">Da URL</button><button class="btn accent" id="uploadImageBtn" style="width:100%">Carica immagine</button>','<div class="row image-source-actions"><button class="btn" id="imageFromUrl" title="Carica un’immagine tramite il suo indirizzo web">Da URL</button><button class="btn accent" id="uploadImageBtn">Carica immagine</button></div><button class="btn paste-image-button" id="pasteImageCanvasBtn">Incolla immagine dagli appunti</button>')
rep('<label class="small">Immagine di riferimento · opzionale</label><div class="row"><button class="btn" id="referenceFromUrl" title="Allega un’immagine di riferimento tramite URL">Riferimento da URL</button><button class="btn grow" id="attachAiReference">＋ Allega immagine</button><button class="btn" id="useCanvasReference" title="Usa l’immagine selezionata come riferimento AI">Dal canvas</button></div>','<label class="small">Immagine di riferimento · opzionale</label><div class="row reference-source-actions"><button class="btn" id="referenceFromUrl" title="Allega un’immagine di riferimento tramite URL">Da URL</button><button class="btn grow" id="attachAiReference">＋ Allega</button><button class="btn" id="pasteAiReferenceBtn">Incolla</button><button class="btn" id="useCanvasReference" title="Usa l’immagine selezionata come riferimento AI">Dal canvas</button></div>')
rep('<div id="puterControls">','<div id="puterControls">'+(dev/'puter-usage.html').read_text(encoding='utf-8'))
rep('<dialog id="urlDialog" class="chic-dialog"><h2 id="urlTitle">Carica immagine da URL</h2><label>Indirizzo dell’immagine<input type="url" id="imageUrlInput" placeholder="https://…/immagine.png"></label><p class="help">Usa il link diretto a un’immagine. Il sito deve consentire il caricamento da altre origini (CORS). Se non lo consente, scarica l’immagine e caricala da file.</p>','<dialog id="urlDialog" class="chic-dialog"><h2 id="urlTitle">Carica immagine da URL</h2><label>Indirizzo dell’immagine<input type="url" id="imageUrlInput" placeholder="https://…/immagine.png"></label><label class="check puter-url-option"><input id="imageUrlUsePuter" type="checkbox">Usa Puter per scaricare l’immagine</label><p class="help">Il caricamento diretto è gratuito ma alcuni siti lo bloccano. Se non funziona, prova Puter: usa banda o quota dell’account. Se il relay Puter non risponde su localhost, il launcher PowerShell prova automaticamente il download. Puoi anche copiare l’immagine dal sito e usare <strong>Incolla immagine dagli appunti</strong>.</p>')
rep('<label class="small">Rimozione sfondo</label>',(dev/'image-effects.html').read_text(encoding='utf-8')+'<div class="background-box"><label class="small">Rimozione sfondo</label>')
bg_status=re.search(r'<div class="status" id="removeBgStatus">.*?</div>',s);assert bg_status
s=s[:bg_status.end()]+'</div>'+s[bg_status.end():]
rep('id="customCardTitle">Pagina custom','id="customCardTitle">Gestione pagina')
rep("strokeColor:'#e43b48'","strokeColor:'#000000'")
rep('id="strokeColor" value="#e43b48"','id="strokeColor" value="#000000"')
rep('<input id="bgColor" type="color" value="#ffffff" title="Colore da rimuovere">','<input id="bgColor" type="color" value="#ffffff" title="Colore da rimuovere"><label class="check bg-auto-color"><input id="bgAutoColor" type="checkbox">Rileva colore automaticamente dai bordi</label>')
rep('<input id="bgEverywhere" type="checkbox">','<input id="bgEverywhere" type="checkbox" checked>')
rep('<button data-action="duplicate" role="menuitem">','<button data-action="copy" role="menuitem">Copia <span>Ctrl C</span></button><button data-action="paste" role="menuitem">Incolla <span>Ctrl V</span></button><button data-action="group" role="menuitem">Raggruppa <span>Ctrl G</span></button><button data-action="ungroup" role="menuitem">Dividi gruppo <span>Ctrl ⇧ G</span></button><button data-action="split" role="menuitem">Splitta testo</button><button data-action="duplicate" role="menuitem">')
rep('<div class="preview hidden" id="previewPanel">',(dev/'workspace-special.html').read_text(encoding='utf-8')+'<div class="preview hidden" id="previewPanel">')
rep('<button class="btn" id="closePreview">Chiudi</button>','<div class="preview-reorder"><button class="btn" id="previewReorder">Riordina</button><button class="btn" id="previewMoveLeft" title="Sposta pagina a sinistra">←</button><button class="btn" id="previewMoveRight" title="Sposta pagina a destra">→</button></div><button class="btn" id="closePreview">Chiudi</button>')
before('customPageName','<div class="page-reorder"><button class="btn" id="pageMoveLeft" title="Sposta la pagina prima">← Prima</button><button class="btn" id="pageMoveRight" title="Sposta la pagina dopo">Dopo →</button></div>')
rep('<label class="small">Stile illustrazione</label><select id="aiStyle"></select><label class="small">Prompt</label><textarea id="aiPrompt"','<label class="small">Stile illustrazione</label><select id="aiStyle"></select><label class="small">Prompt</label><textarea id="aiPrompt"')
rep('</textarea>\n          <button class="btn accent" id="generateAiBtn"','</textarea><label class="check ai-postprocess"><input id="aiChromaKey" type="checkbox">Genera con sfondo uniforme per chroma key</label><label class="check ai-postprocess"><input id="aiRemoveBackground" type="checkbox">Duplica il contenuto generato e rimuovi lo sfondo</label>\n          <button class="btn accent" id="generateAiBtn"')
canvas_card=re.search(r'<section class="card">\s*<div class="card-h"><div><div class="card-title">Canvas, griglia & export immagine</div>[\s\S]*?</section>',s);assert canvas_card
canvas_markup=canvas_card.group(0)
canvas_markup=canvas_markup.replace('Canvas, griglia & export immagine','Canvas, griglia e snap').replace('Griglia e snapping sono indipendenti. L’export regione può avere margine e trasparenza.','Imposta gli aiuti visivi del foglio; non vengono stampati.')
canvas_markup=re.sub(r'\s*<label class="small">Export cropped image</label>[\s\S]*?<div class="status">Selection box:.*?</div>','',canvas_markup)
s=s[:canvas_card.start()]+canvas_markup+s[canvas_card.end():]
project_card=re.search(r'<section class="card">\s*<div class="card-h"><div><div class="card-title">Progetto & PDF</div>[\s\S]*?</section>',s);assert project_card
s=s[:project_card.start()]+(dev/'export-center.html').read_text(encoding='utf-8')+s[project_card.end():]
rep('<label class="check"><input type="radio" name="pdfScope" value="current" checked>Solo la pagina corrente</label><label class="check"><input type="radio" name="pdfScope" value="set">Tutte le pagine del progetto corrente</label>','<div class="pdf-dialog-options"><label class="check"><input type="radio" name="pdfScope" value="current" checked>Solo la pagina corrente</label><label class="check"><input type="radio" name="pdfScope" value="set">Tutte le pagine del progetto corrente</label></div>')
# Keep the existing asynchronous runtime and rendering features; replace the application entry point.
rep("init().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});",(dev/'workspace.js').read_text(encoding='utf-8')+'\n'+(dev/'enhancements.js').read_text(encoding='utf-8')+'\n'+(dev/'image-effects.js').read_text(encoding='utf-8')+'\n'+(dev/'final-upgrades.js').read_text(encoding='utf-8')+'\n'+(dev/'clipart.js').read_text(encoding='utf-8')+'\n'+(dev/'pwa.js').read_text(encoding='utf-8')+"\ninit().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});")
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
for name in ['chicCanva.html','chicCanva_server.bat']:shutil.copy2(root/name,root/'build/chicCanva'/name)
pwa_build=root/'build/chicCanva-pwa';pwa_build.mkdir(parents=True,exist_ok=True)
shutil.copy2(root/'chicCanva.html',pwa_build/'index.html')
for name in ['chicCanva.webmanifest','chiccanva-192.png','chiccanva-512.png']:shutil.copy2(dev/'pwa'/name,pwa_build/name)
build_id=hashlib.sha256((root/'chicCanva.html').read_bytes()).hexdigest()[:16]
sw=(dev/'pwa'/'chicCanva-sw.js').read_text(encoding='utf-8').replace('__BUILD_ID__',build_id)
assert '__BUILD_ID__' not in sw
(pwa_build/'chicCanva-sw.js').write_text(sw,encoding='utf-8')
assert (pwa_build/'index.html').read_bytes()==(root/'chicCanva.html').read_bytes(), 'HTML PWA non sincronizzato'
assert "const BUILD_ID='"+build_id+"'" in sw, 'Versione service worker non sincronizzata'
print('Build v7:',len(s),'caratteri · PWA',build_id)
