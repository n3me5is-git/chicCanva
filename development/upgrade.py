from pathlib import Path
import re
p=Path('OutlineLab_v4.html')
s=p.read_text(encoding='utf-8')
def rep(a,b):
 global s
 assert a in s,a[:100]
 s=s.replace(a,b)
def fn(name,code):
 global s
 pattern=r'(?:async )?function '+name+r'\([^\n]*?(?=(?:async )?function |\n)'
 s,n=re.subn(pattern,lambda m:code+'\n',s,count=1)
 assert n,name
rep('OutlineLab v4','OutlineLab v5')
rep('</style>', '''
.stage-wrap{display:block;padding:0;overflow:auto;touch-action:pan-x pan-y}.stage-space{position:relative;min-width:100%;min-height:100%}.canvas-shell{position:absolute;border:0;transform:none!important;margin:0!important}.toolbar>*{flex-shrink:0}.toolbar select{width:100px}.preview{position:fixed;inset:0;z-index:80;background:var(--bg);overflow:auto;padding:16px}.preview-head{position:sticky;top:0;background:var(--bg);padding:10px;z-index:1;display:flex;align-items:center;gap:12px}.preview-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,var(--thumb,200px)),1fr));gap:20px;padding:15px}.preview-page{background:white;border:1px solid var(--line);border-radius:10px;padding:10px;min-height:200px;cursor:pointer}.preview-page img{width:100%;height:auto;display:block}.preview-page span{display:block;padding:8px;font-size:12px}.stage-wrap.panning{cursor:grab}.stage-wrap.panning .upper-canvas{cursor:grab!important}.mobile-help{display:none}
@media(max-width:720px){.app{height:100dvh;min-height:0;overflow:hidden}.layout{display:grid;grid-template-columns:minmax(0,1fr);overflow:hidden;position:relative}.workspace{min-height:0}.sidebar{position:absolute;right:0;top:0;bottom:0;width:min(92vw,380px);z-index:30;overflow:auto;box-shadow:-8px 0 30px #0003}.topbar{position:static;padding:6px}.brand strong{font-size:13px}.mark{display:none}.modebar{padding:6px;gap:5px}.tabs{max-width:100%;overflow:auto}.tabs button{font-size:11px;padding:7px}.page-nav{width:100%}.page-nav select{max-width:none}.actions .btn{font-size:11px}.toolbar{padding:6px}.mobile-help{display:block}}
</style>''')
rep('<div class="canvas-shell" id="canvasShell">','<div class="stage-space" id="stageSpace"><div class="canvas-shell" id="canvasShell">')
rep('<canvas id="editorCanvas"></canvas></div>','<canvas id="editorCanvas"></canvas></div></div>')
rep('<span class="tool-label">Strumenti</span>','''<button class="iconbtn" id="panTool" title="Manina: trascina per spostare la vista">✋</button><button class="iconbtn" id="zoomOut" title="Riduci zoom">−</button><select id="zoomSelect" aria-label="Zoom"><option value="fit">Fit pagina</option><option value="0.25">25%</option><option value="0.5">50%</option><option value="0.75">75%</option><option value="1">100%</option><option value="1.5">150%</option><option value="2">200%</option><option value="4">400%</option></select><button class="iconbtn" id="zoomIn" title="Aumenta zoom">+</button><button class="btn" id="previewBtn">▦ Preview</button>''')
rep('class="iconbtn" id="deleteTool" title="Elimina selezione">⌫','class="btn danger" id="deleteTool" title="Elimina selezione (CANC)">⌫ Elimina')
rep('Testo & impaginazione','Aggiungi testo')
rep('Rigenera la modalità frase o lettera/pagina senza toccare le pagine custom.','<span id="textModeHelp">Inserisci testo nella modalità corrente.</span>')
rep('Genera / aggiorna','Aggiungi testo')
rep('<label class="check"><input type="checkbox" id="smartEmoji"', '''<label class="check hidden" id="splitTextRow"><input type="checkbox" id="splitText"><span>Separa in singole lettere / emoji</span></label>
        <label class="small">Adattamento proporzionale · margine 8%</label><select id="fitAxis"><option value="contain">Contieni nella pagina</option><option value="width">Riempi larghezza</option><option value="height">Riempi altezza</option></select><div class="help">Larghezza / altezza possono far uscire il contenuto dall’altro lato.</div>
        <div id="generatedOptions"><label class="check"><input type="checkbox" id="smartEmoji"''')
rep('<label class="small">Batch scale · modalità una per pagina</label>','<div id="singleOptions"><label class="small">Scala tutte le pagine · rispetto alla misura attuale</label>')
rep('value="110"><span class="help">%</span><button class="btn" id="applySingleScale">Applica a tutte</button></div>','value="100"><span class="help">%</span><button class="btn" id="applySingleScale">Conferma</button></div><div class="help">Anteprima immediata mentre cambi il valore. Conferma per fissare la nuova base.</div></div></div>')
rep('<div class="card-title">Pagina custom</div>','<div class="card-title" id="customCardTitle">Pagina custom</div>')
rep('<label class="small">Scritta della pagina custom</label><textarea id="customText" placeholder="Una scritta diversa per questa pagina"></textarea>','')
rep('<button class="btn grow" id="addCustomText">Aggiungi scritta</button>','')
rep('<label class="small">Prompt</label>', '<label class="small">Stile illustrazione</label><select id="aiStyle"></select><label class="small">Prompt</label>')
rep('<div class="toast" id="toast"></div>','''<div class="preview hidden" id="previewPanel"><div class="preview-head"><strong>Tutte le pagine</strong><label>Dimensione <input id="previewSize" type="range" min="120" max="420" value="200"></label><button class="btn" id="closePreview">Chiudi</button></div><div class="preview-grid" id="previewGrid"></div></div><div class="toast" id="toast"></div>''')
# Saving is explicit at navigation/mutation boundaries: never overwrite descriptors on reload.
rep('if(!page)return;saveActivePage();loadingPage=true;', 'if(!page)return;loadingPage=true;exportRegion=null;')
rep('function saveActivePage(){if(loadingPage||!currentPage||!canvas)return;', 'function saveActivePage(){if(loadingPage||!currentPage||!canvas)return;canvas.discardActiveObject();')
rep("$('customText').value=p.meta?.text||''", "updateTextModeUI()")
rep("$('addCustomText').onclick=addCustomTextFromInput;",'')
rep("$('pageHeight').value=w};", "$('pageHeight').value=w;applyCustomPageDims()};")
rep("if(p){$('pageWidth').value=p[0];$('pageHeight').value=p[1]}","if(p){$('pageWidth').value=p[0];$('pageHeight').value=p[1];applyCustomPageDims()}")
rep("renderCustomChips();syncCustomControls()", "renderCustomChips();syncCustomControls();updateTextModeUI()")
rep("paintFirst:'stroke',charSpacing:0", "paintFirst:'stroke',objectCaching:false,charSpacing:0")
rep("paintFirst:'stroke',charSpacing:d.charSpacing", "paintFirst:'stroke',objectCaching:false,charSpacing:d.charSpacing")
fn('fitStageZoom', '''function fitStageZoom(){if(!currentPage)return;const wrap=$('stageWrap'),w=currentPage.widthMm*PX_PER_MM,h=currentPage.heightMm*PX_PER_MM;viewZoom=zoomMode==='fit'?Math.min((wrap.clientWidth-48)/w,(wrap.clientHeight-64)/h):Number(zoomMode);viewZoom=clamp(viewZoom,.05,6);canvas.setDimensions({width:Math.round(w),height:Math.round(h)});canvas.setDimensions({width:(w*viewZoom)+'px',height:(h*viewZoom)+'px'},{cssOnly:true});const sw=Math.max(wrap.clientWidth,w*viewZoom+48),sh=Math.max(wrap.clientHeight,h*viewZoom+64);$('stageSpace').style.width=sw+'px';$('stageSpace').style.height=sh+'px';Object.assign($('canvasShell').style,{width:w*viewZoom+'px',height:h*viewZoom+'px',left:(sw-w*viewZoom)/2+'px',top:(sh-h*viewZoom)/2+'px'});canvas.calcOffset();canvas.requestRenderAll();if(zoomMode==='fit'){wrap.scrollLeft=0;wrap.scrollTop=0}$('zoomSelect').value=zoomMode;if(!$('zoomSelect').value){let opt=$('zoomSelect').querySelector('[data-dynamic]');if(!opt){opt=document.createElement('option');opt.dataset.dynamic='1';$('zoomSelect').appendChild(opt)}opt.value=zoomMode;opt.textContent=Math.round(viewZoom*100)+'%';$('zoomSelect').value=zoomMode}applyGrid()}''')
rep('`${state.grid.spacingMm*PX_PER_MM}px`','`${state.grid.spacingMm*PX_PER_MM*viewZoom}px`')
fn('fitObjectsOnCurrent', '''function fitObjectsOnCurrent(){canvas.discardActiveObject();fitObjectList(canvas.getObjects().filter(o=>!o.excludeProject),canvas.width,canvas.height);canvas.requestRenderAll();saveActivePage()}''')
fn('applySingleScale', '''function applySingleScale(){previewSingleScale();scaleBaseline=null;$('singleScale').value=100;toast('Scala confermata su tutte le pagine')}''')
fn('addCustomTextFromInput', '''async function addCustomTextFromInput(){await addTextUnified()}''')
rep("$('buildTextBtn').onclick=buildGeneratedPages;", "$('buildTextBtn').onclick=()=>addTextUnified().catch(e=>{console.error(e);toast('Testo non inserito: '+e.message)});$('singleScale').oninput=previewSingleScale;")
rep("const mod=await import('https://esm.sh/@imgly/background-removal@1.7.0');", "const mod=await loadBackgroundModule();")
rep("const img=selectedImage();if(!img){toast('Seleziona un’immagine');return}const asset=state.assets[img.assetId];if(!asset)return;const st=$('removeBgStatus');", "if(location.protocol==='file:'){toast('Avvia il launcher per rimuovere lo sfondo');return}const img=selectedImage();if(!img){toast('Seleziona un’immagine');return}const asset=state.assets[img.assetId];if(!asset)return;const st=$('removeBgStatus');$('removeBgBtn').disabled=true;")
rep("clone.set({angle:img.angle});", "clone.set({angle:img.angle,cropX:img.cropX,cropY:img.cropY,width:img.width,height:img.height});clone.setCoords();")
rep("st.textContent='Errore background removal. Prova da webserver e controlla console/rete.';toast('Background removal non riuscito')}}", "st.textContent='Download o elaborazione non riusciti: '+(e.message||e)+'. ERR_BLOCKED_BY_CLIENT indica un blocco del browser/estensione: consenti esm.sh, cdn.jsdelivr.net e staticimgly.com per questa app e riprova.';toast('Background removal non riuscito')}finally{$('removeBgBtn').disabled=false}}")
rep("prompt=$('aiPrompt').value.trim()", "prompt=[$('aiPrompt').value.trim(),AI_STYLES[$('aiStyle').value]||''].filter(Boolean).join('\\n\\n')")
rep("async function init(){", "async function init(){")
rep("initCanvas();bindUi();ensurePages();", "initCanvas();bindUi();bindUpgrades();ensurePages();")
rep("await buildGeneratedPages();state.mode='single';await buildGeneratedPages();", "await addTextUnified();state.mode='single';await addTextUnified();")
# SVGs need intrinsic dimensions: OpenMoji uses viewBox only on some assets.
rep('const blob=await res.blob();const dataUrl=', "let blob=await res.blob();if(blob.type.includes('svg')||url.includes('.svg')){const xml=new DOMParser().parseFromString(await blob.text(),'image/svg+xml'),root=xml.documentElement;const vb=(root.getAttribute('viewBox')||'0 0 72 72').split(/[ ,]+/).map(Number);root.setAttribute('width',String(vb[2]||72));root.setAttribute('height',String(vb[3]||72));root.setAttribute('xmlns','http://www.w3.org/2000/svg');blob=new Blob([new XMLSerializer().serializeToString(root)],{type:'image/svg+xml'})}const dataUrl=")
extra=Path('upgrades.js').read_text(encoding='utf-8')
rep('init();\n})();',extra+'\ninit();\n})();')
Path('OutlineLab_v5.html').write_text(s,encoding='utf-8')
