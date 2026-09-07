from pathlib import Path
p=Path('development/pending.js');s=p.read_text(encoding='utf-8')
s=s.replace("urlTarget='image';", "urlTarget='image',lastSavedPayload='';")
s=s.replace("memoryMessage('Salvato alle '+new Date(saved)","lastSavedPayload=payload;memoryMessage('Salvato alle '+new Date(saved)")
s=s.replace("preferences.autosave=false;memoryEpoch++;bgCacheEpoch++;", "preferences.autosave=false;lastSavedPayload='';memoryEpoch++;bgCacheEpoch++;")
marker="function scheduleAutosave(){"
extra="""function flushBeforeLeave(){if(!historyReady||!preferences.autosave)return true;if(actionDepth||loadingPage||historyRestoring)return false;if(cropSession)return false;commitHistory();const payload=encodeMemory(fullPayload(true));if(payload===lastSavedPayload)return true;if(payload.length>=1800000){persistProject();return false}try{localStorage.setItem(MEMORY_KEY,JSON.stringify({version:1,saved:new Date().toISOString(),project:payload}));memoryEpoch++;lastSavedPayload=payload;return true}catch(e){persistProject();return false}}
"""
assert marker in s;s=s.replace(marker,extra+marker,1)
s=s.replace("window.addEventListener('pagehide',()=>{commitHistory();persistProject()});", "window.addEventListener('pagehide',()=>{flushBeforeLeave()});window.addEventListener('beforeunload',e=>{if(!flushBeforeLeave()){e.preventDefault();e.returnValue=''}});")
p.write_text(s,encoding='utf-8')
p=Path('development/build-pending.py');s=p.read_text(encoding='utf-8')
marker="# Patch only the embedded"
extra="""# Extend the existing in-app guide inside this same HTML.
help_text='<section><h3>Memoria, annulla e ripristina</h3><p>Usa ↶ Annulla (Ctrl+Z) e ↷ Ripristina (Ctrl+Maiusc+Z o Ctrl+Y). Nel pulsante Memoria puoi impostare da 1 a 100 passi, includere/importare lo storico nei JSON e attivare l’autosalvataggio. Dopo un refresh scegli Riprendi progetto oppure Nuovo progetto. Cancella dati salvati rimuove anche i modelli AI e disattiva l’autosalvataggio; il canvas aperto resta intatto.</p><h3>Emoji, URL e sfondo AI</h3><p>Esplora tutte le OpenMoji tramite categorie e Mostra altre. La ricerca è globale. Colore e spessore valgono per le prossime emoji outlined; Applica selezione aggiorna quelle selezionate. Da URL carica un’immagine nel canvas o come riferimento AI: il sito deve consentire CORS. Per lo sfondo scegli modello piccolo, medio o grande e CPU/WebGPU. I modelli vengono memorizzati nel browser dopo il primo download; la scansione e lo spinner indicano l’elaborazione. L’originale è sempre conservato.</p></section>'
m=re.search(r'<[^>]+id="closeHelp"[^>]*>',s)
assert m
# Insert content in the guide before its final close-button area, keeping the existing layout.
guide_start=s.index('id="helpLayer"')
guide_end=s.index('id="objectMenu"',guide_start) if 'id="objectMenu"' in s[guide_start:] else -1
# The heading provides a stable anchor within the guide itself.
heading=s.find('<h2',guide_start)
if heading!=-1:
 heading_end=s.index('</h2>',heading)+5
 s=s[:heading_end]+help_text+s[heading_end:]
"""
assert marker in s;s=s.replace(marker,extra+'\n'+marker,1);p.write_text(s,encoding='utf-8')
