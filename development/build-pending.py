from pathlib import Path
import re,json,shutil
root=Path(__file__).resolve().parent.parent
dev=root/'development'
s=(dev/'chic-v5-baseline.html').read_text(encoding='utf-8')
def replace(old,new):
 global s
 assert old in s,old[:100]
 s=s.replace(old,new,1)
replace('\n</style>', '\n'+(dev/'pending.css').read_text(encoding='utf-8')+'\n</style>')
replace('\n<body>', '\n<body>\n'+(dev/'pending-ui.html').read_text(encoding='utf-8'))
replace('<button class="btn" id="applyEmojiInk"','<button class="btn" id="applyEmojiInk"') if '<button class="btn" id="applyEmojiInk"' in s else None
# Insert fields using the actual element boundaries, without altering embedded library strings.
def before_id(id,markup):
 global s
 m=re.search(r'<[a-zA-Z][^>]*\bid="'+id+r'"[^>]*>',s)
 assert m,id
 s=s[:m.start()]+markup+s[m.start():]
before_id('emojiGrid','<select id="emojiCategory" aria-label="Categoria emoji"><option value="relevant">Più rilevanti</option><option value="all">Tutte le emoji</option></select><div id="emojiCount" class="emoji-count" aria-live="polite"></div>')
before_id('applyEmojiInk','<label class="small" for="emojiStroke">Spessore contorno <span id="emojiStrokeValue">1×</span></label><input id="emojiStroke" type="range" min="0.5" max="3" step="0.1" value="1" title="Spessore delle OpenMoji outlined; premi Applica per aggiornare la selezione">')
replace('Applica colore alle emoji selezionate','Applica colore e spessore') if 'Applica colore alle emoji selezionate' in s else None
before_id('uploadImageBtn','<button class="btn" id="imageFromUrl" title="Carica un’immagine tramite il suo indirizzo web">Da URL</button>')
before_id('attachAiReference','<button class="btn" id="referenceFromUrl" title="Allega un’immagine di riferimento tramite URL">Riferimento da URL</button>')
before_id('removeBgBtn','<div id="bgAiOptions"><label>Modello AI<select id="bgModel"><option value="isnet_quint8">Piccolo · 44 MB · rapido</option><option value="isnet_fp16">Medio · 88 MB · bilanciato</option><option value="isnet">Grande · 176 MB · precisione completa</option></select></label><label>Elaborazione<select id="bgDevice"><option value="auto">Automatica · preferisci WebGPU</option><option value="cpu">CPU · compatibilità</option><option value="gpu">GPU · WebGPU con ripiego CPU</option></select></label><p id="bgCacheStatus" class="help">Modello e runtime vengono salvati nel browser dopo il primo download. L’avvio richiede comunque il caricamento in memoria. La cache può essere rimossa dal browser se lo spazio scarseggia.</p></div>')
before_id('helpBtn','<button class="btn" id="undoBtn" title="Annulla · Ctrl+Z" disabled>↶ Annulla</button><button class="btn" id="redoBtn" title="Ripristina · Ctrl+Maiusc+Z / Ctrl+Y" disabled>↷ Ripristina</button><span id="historyStatus" aria-live="polite"></span><button class="btn" id="settingsBtn" title="Autosalvataggio, cronologia e cache dei modelli">Memoria</button>')
sidebar=re.search(r'<aside[^>]*id="sidebar"[^>]*>',s)
assert sidebar
s=s[:sidebar.end()]+'<section class="card mobile-memory"><div class="card-b"><div class="row"><button class="btn" id="mobileUndo" disabled>↶ Annulla</button><button class="btn" id="mobileRedo" disabled>↷ Ripristina</button><button class="btn" id="mobileSettings">Memoria</button></div></div></section>'+s[sidebar.end():]
s=s.replace('Elaborazione locale CPU. Il primo utilizzo scarica circa 60 MB di modello e runtime da staticimgly.com; serve il launcher.', 'Elaborazione locale CPU o WebGPU. Il primo utilizzo scarica il modello scelto più 12–23 MB di runtime da staticimgly.com; serve il launcher.')
# Extend the existing in-app guide inside this same HTML.
help_text='<section><h3>Memoria, annulla e ripristina</h3><p>Usa ↶ Annulla (Ctrl+Z) e ↷ Ripristina (Ctrl+Maiusc+Z o Ctrl+Y). Nel pulsante Memoria puoi impostare da 1 a 100 passi, includere/importare lo storico nei JSON e attivare l’autosalvataggio. Dopo un refresh scegli Riprendi progetto oppure Nuovo progetto. Cancella dati salvati rimuove anche i modelli AI e disattiva l’autosalvataggio; il canvas aperto resta intatto.</p><h3>Emoji, URL e sfondo AI</h3><p>Esplora tutte le OpenMoji tramite categorie e Mostra altre. La ricerca è globale. Colore e spessore valgono per le prossime emoji outlined; Applica selezione aggiorna quelle selezionate. Da URL carica un’immagine nel canvas o come riferimento AI: il sito deve consentire CORS. Per lo sfondo scegli modello piccolo, medio o grande e CPU/WebGPU. I modelli vengono memorizzati nel browser dopo il primo download; la scansione e lo spinner indicano l’elaborazione. L’originale è sempre conservato.</p></section>'
m=re.search(r'<[^>]+id="closeHelp"[^>]*>',s)
assert m
# Insert content in the guide before its final close-button area, keeping the existing layout.
guide_start=s.index('id="helpLayer"')
guide_end=s.index('id="objectMenu"',guide_start) if 'id="objectMenu"' in s[guide_start:] else -1
# The heading provides a stable anchor within the guide itself.
content=s.index('<div class="help-content">',guide_start)+len('<div class="help-content">')
s=s[:content]+help_text+s[content:]

# Patch only the embedded IMG.LY module, leaving the vetted CPU integration intact.
m=re.search(r'async function loadBackgroundModule[^\n]+',s)
loader=m[0]
strings=list(re.finditer(r'new Blob\(\[("(?:\\.|[^"\\])*")\]',loader))
assert len(strings)==2,len(strings)
module_match=strings[1]
module=json.loads(module_match[1])
print('ORT imports',re.findall(r'import\([^\n]+',module)[:5])
old='ort = (await import(globalThis.__outlineOrtUrl)).default;'
assert module.count(old)==2
module=module.replace(old,'ort = (await import(globalThis.__chicGpuUrl)).default;',1)
module=module.replace('await fetch(resourceUrl)','await globalThis.__chicBgFetch(resourceUrl)').replace('await fetch(url, config.fetchArgs)','await globalThis.__chicBgFetch(url, config.fetchArgs)')
loader=loader[:module_match.start(1)]+json.dumps(module)+loader[module_match.end(1):]
gpu=json.dumps((dev/'ort.webgpu.bundle.min.mjs').read_text(encoding='utf-8'))
loader=loader.replace('if(!backgroundModulePromise){','if(!backgroundModulePromise){globalThis.__chicGpuUrl=URL.createObjectURL(new Blob(['+gpu+'],{type:"text/javascript"}));',1)
s=s[:m.start()]+loader+s[m.end():]
replace("init().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});",(dev/'pending.js').read_text(encoding='utf-8')+"\ninit().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});")
(root/'chicCanva.html').write_text(s,encoding='utf-8')
for name in ['chicCanva.html','chicCanva_server.bat']:
 shutil.copy2(root/name,root/'build/chicCanva'/name)
print('Built',len(s),'characters')
