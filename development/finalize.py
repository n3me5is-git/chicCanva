from pathlib import Path
import json,re
p=Path('OutlineLab_v5.html');s=p.read_text(encoding='utf-8')
# Keep the active selection while serializing world coordinates.
s=s.replace('canvas.discardActiveObject();currentPage.objects=canvas.getObjects().map(serializeObject).filter(Boolean);updateAssetCount()',"const active=canvas.getActiveObject(),members=active?.type==='activeSelection'?[...active.getObjects()]:null;canvas.discardActiveObject();currentPage.objects=canvas.getObjects().map(serializeObject).filter(Boolean);if(members?.length)canvas.setActiveObject(new fabric.ActiveSelection(members,{canvas}));else if(active)canvas.setActiveObject(active);updateAssetCount()")
# Wait for stylesheet completion before measuring any font.
s=s.replace("document.head.appendChild(link);loadedFonts.add(name);fontLinks.set(name,link)","const ready=new Promise(resolve=>{link.onload=resolve;link.onerror=resolve;setTimeout(resolve,6000)});document.head.appendChild(link);loadedFonts.add(name);fontLinks.set(name,ready)")
s=s.replace('if(document.fonts?.load){try{', 'await fontLinks.get(name);if(document.fonts?.load){try{')
# Treat a phrase as text runs separated by actual emoji graphemes.
a=s.index('const tokens=split?');b=s.index(';for(const token of tokens)',a)
s=s[:a]+"const tokens=[];for(const g of graphemes(line)){if(split||(state.smartEmoji&&isEmoji(g))||!tokens.length||(state.smartEmoji&&isEmoji(tokens[tokens.length-1])))tokens.push(g);else tokens[tokens.length-1]+=g}"+s[b:]
# Embed official libraries and runtime. The background module uses a pinned, embedded ORT CPU runtime.
for url,file in [('https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js','fabric.min.js'),('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','jspdf.min.js')]:
 s=s.replace(f'<script src="{url}"></script>','<script>'+Path(file).read_text(encoding='utf-8').replace('</script','<\\/script')+'</script>')
bg=Path('bg-index.mjs').read_text(encoding='utf-8').replace('import("onnxruntime-web/webgpu")','import(globalThis.__outlineOrtUrl)').replace('import("onnxruntime-web")','import(globalThis.__outlineOrtUrl)').replace('ort2.env.wasm.numThreads = maxNumThreads();','ort2.env.wasm.numThreads = 1;')
ort=Path('ort.bundle.min.mjs').read_text(encoding='utf-8')
code="let backgroundModulePromise;async function loadBackgroundModule(){if(!backgroundModulePromise){globalThis.__outlineOrtUrl=URL.createObjectURL(new Blob(["+json.dumps(ort)+"],{type:'text/javascript'}));const url=URL.createObjectURL(new Blob(["+json.dumps(bg)+"],{type:'text/javascript'}));backgroundModulePromise=import(url).catch(e=>{backgroundModulePromise=null;throw e})}return backgroundModulePromise}"
s=re.sub(r'async function loadBackgroundModule\(\).*?(?=\nfunction setPan)',lambda m:code,s,flags=re.S)
s=s.replace('proxyToWorker:false,progress:',"proxyToWorker:false,model:'isnet_quint8',device:'cpu',progress:")
s=s.replace('ERR_BLOCKED_BY_CLIENT indica un blocco del browser/estensione: consenti esm.sh, cdn.jsdelivr.net e staticimgly.com per questa app e riprova.','Il codice è incorporato; per il download del modello verifica che staticimgly.com sia consentito nel browser.')
s=s.replace('Background removal usa @imgly/background-removal nel browser (AGPL-3.0). Il primo utilizzo scarica il modello.','IMG.LY + ONNX incorporati (AGPL-3.0 / MIT). Elaborazione locale CPU. Il primo utilizzo scarica circa 60 MB di modello e runtime da staticimgly.com; serve il launcher. Nessuna immagine viene inviata a un servizio.')
s=s.replace('init();\n})();',"init().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});\n})();")
p.write_text(s,encoding='utf-8')
scripts=re.findall(r'<script>([\s\S]*?)</script>',s)
Path('check.js').write_text(scripts[-1],encoding='utf-8')
ids=re.findall(r'\bid="([^"]+)"',s[s.index('<body>'):]); refs=re.findall(r"\$\('([^']+)'\)",scripts[-1]); print('Duplicate IDs:',[i for i in set(ids) if ids.count(i)>1]);print('Missing IDs:',sorted(set(refs)-set(ids)))
