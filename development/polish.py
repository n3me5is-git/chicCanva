from pathlib import Path
import re,shutil
p=Path('OutlineLab_v5.html');s=p.read_text(encoding='utf-8')
s=s.replace('<script src="https://js.puter.com/v2/"></script>','<script async src="https://js.puter.com/v2/"></script>')
s=s.replace("let zoomMode='fit'", "let pageLoadId=0;let zoomMode='fit'")
s=s.replace('async function loadPage(page){if(!page)return;loadingPage=true;', 'async function loadPage(page){if(!page)return;const request=++pageLoadId;loadingPage=true;')
s=s.replace('for(const d of page.objects||[])await instantiateObject(d);loadingPage=false;', 'for(const d of page.objects||[]){const obj=await instantiateObject(d);if(request!==pageLoadId){if(obj)canvas.remove(obj);return}}loadingPage=false;')
s=s.replace('if(cropSession?.target===o)o.opacity=cropSession.before.opacity;','')
s=s.replace('opacity:o.opacity,flipX:o.flipX', 'opacity:cropSession?.target===o?cropSession.before.opacity:o.opacity,flipX:o.flipX')
s=s.replace('if(Number.isFinite(d.width))', 'if(Number.isFinite(d.width)&&d.width>0)').replace('if(Number.isFinite(d.height))', 'if(Number.isFinite(d.height)&&d.height>0)')
s=s.replace('const res=await fetch(url);if(!res.ok)', 'const res=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!res.ok)')
# The drawer remains scrollable on phones; toolbar buttons have accessible names.
s=s.replace('title="Aumenta zoom"', 'title="Aumenta zoom (anche Ctrl + rotella)"')
s=s.replace('state.assets=p.assets||{};ensurePages();', "state.assets=p.assets||{};for(const asset of Object.values(state.assets)){if(asset.mime?.includes('svg')){try{const xml=new DOMParser().parseFromString(await(await fetch(asset.dataUrl)).text(),'image/svg+xml'),root=xml.documentElement,vb=(root.getAttribute('viewBox')||'0 0 72 72').split(/[ ,]+/).map(Number);root.setAttribute('width',String(vb[2]||72));root.setAttribute('height',String(vb[3]||72));asset.dataUrl=await dataUrlFromBlob(new Blob([new XMLSerializer().serializeToString(root)],{type:'image/svg+xml'}))}catch(e){console.warn('SVG import',e)}}}scaleBaseline=null;ensurePages();")
# Display attribution in the single distributed file.
s=s.replace('<div class="toast" id="toast"></div>', '<div class="toast" id="toast" role="status" aria-live="polite"></div>')
s=s.replace('Progetti compatibili v4 · pagine, oggetti e asset incorporati.', 'Progetti compatibili v4 · pagine, oggetti e asset incorporati.')
s=s.replace('</aside>', '<details class="license"><summary>Librerie e licenze</summary><p>Fabric.js 5.3.0 e jsPDF 2.5.1: MIT. ONNX Runtime Web 1.21.0: MIT. IMG.LY background-removal 1.7.0: AGPL-3.0; modulo incorporato con import del runtime locale e un solo thread CPU. <a href="https://github.com/imgly/background-removal-js" target="_blank" rel="noopener">Sorgente e licenza IMG.LY</a>. Il codice dei moduli è incorporato in questo HTML. OpenMoji 17: CC BY-SA 4.0, HfG Schwäbisch Gmünd e collaboratori. Font: licenze individuali dei rispettivi autori, tramite Fontsource/Google Fonts.</p></details></aside>')
p.write_text(s,encoding='utf-8')
shutil.copy2(p,Path('build/OutlineLab_v5')/p.name)
Path('check.js').write_text(re.findall(r'<script>([\s\S]*?)</script>',s)[-1],encoding='utf-8')
