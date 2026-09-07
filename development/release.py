from pathlib import Path
import re,shutil
p=Path('OutlineLab_v5.html');s=p.read_text(encoding='utf-8')
s=s.replace('.toolbar select{width:100px}', '.toolbar select{width:112px}.toolbar{flex-wrap:wrap;overflow-x:visible}@media(max-width:720px){.toolbar{flex-wrap:nowrap;overflow-x:auto}}')
s=s.replace("function changeGeneratedOrientation(orientation){saveActivePage();", "function changeGeneratedOrientation(orientation){saveActivePage();zoomMode='fit';scaleBaseline=null;$('singleScale').value=100;")
s=s.replace("function applyCustomPageDims(){", "function applyCustomPageDims(){zoomMode='fit';")
s=s.replace("function fitObjectsOnCurrent(){canvas.discardActiveObject();", "function fitObjectsOnCurrent(){scaleBaseline=null;$('singleScale').value=100;canvas.discardActiveObject();")
s=s.replace("$('toggleSidebarBtn').onclick=()=>{state.sidebar.open", "$('toggleSidebarBtn').onclick=()=>{zoomMode='fit';state.sidebar.open")
s=s.replace('state.sidebar.width=w;document.documentElement', "zoomMode='fit';state.sidebar.width=w;document.documentElement")
# Render at the display resolution when zooming, without changing project coordinates.
s=s.replace("function bindUpgrades(){if(matchMedia", "function bindUpgrades(){canvas.getRetinaScaling=()=>canvas.enableRetinaScaling?Math.max(1,Math.min((window.devicePixelRatio||1)*Math.max(1,viewZoom),Math.sqrt(24000000/Math.max(1,canvas.width*canvas.height)))):1;canvas._isRetinaScaling=()=>canvas.enableRetinaScaling&&canvas.getRetinaScaling()>1;if(matchMedia")
# Retain the original regenerate operation alongside additive insertion.
s=s.replace('<button class="btn" id="fitTextBtn">', '<button class="btn" id="rebuildTextBtn" title="Ricrea le pagine della modalità corrente sostituendone il contenuto">Rigenera</button><button class="btn" id="fitTextBtn">')
s=s.replace("$('splitTextRow').classList.toggle('hidden',!custom);", "$('splitTextRow').classList.toggle('hidden',!custom);$('rebuildTextBtn').classList.toggle('hidden',custom);")
s=s.replace("$('panTool').onclick=()=>setPan(!panMode);", "$('rebuildTextBtn').onclick=async()=>{if(loadingPage)return;if(!confirm('Rigenerare tutte le pagine di questa modalità? Il loro contenuto verrà sostituito. Le altre modalità restano invariate.'))return;saveActivePage();const [w,h]=pageSizeA4();state.pages[state.mode]=[makePage(state.mode==='whole'?'Frase completa':'Pagina 1',w,h,state.mode)];state.pageIndex[state.mode]=0;await loadPage(currentPageByState());await addTextUnified()};$('panTool').onclick=()=>setPan(!panMode);")
# Disable destructive controls while crop helpers are active; do not serialize preview opacity.
s=s.replace("function serializeObject(o){if(o===exportRegion", "function serializeObject(o){if(cropSession?.target===o)o.opacity=cropSession.before.opacity;if(o===exportRegion")
# Export filenames identify the new app while retaining compatible v4 project schema.
s=s.replace("'OutlineLab_v4.pdf'", "'OutlineLab_v5.pdf'").replace("'OutlineLab_project_v4.json'", "'OutlineLab_project_v5.json'")
s=s.replace('JSON v4 include pagine, oggetti e asset come Data URL.', 'Progetti compatibili v4 · pagine, oggetti e asset incorporati.')
s=s.replace('serve il launcher. Nessuna immagine', 'serve il launcher. Nessuna immagine')
s=s.replace("const p=currentPage,text=$('customText').value", "const p=currentPage,text=$('textInput').value")
p.write_text(s,encoding='utf-8')
build=Path('build/OutlineLab_v5');build.mkdir(parents=True,exist_ok=True)
shutil.copy2(p,build/p.name)
shutil.copy2('OutlineLab_v5_server.bat',build/'OutlineLab_v5_server.bat')
scripts=re.findall(r'<script>([\s\S]*?)</script>',s)
Path('check.js').write_text(scripts[-1],encoding='utf-8')
# Extract the actual PowerShell command from the BAT for syntax and HTTP testing.
bat=Path('OutlineLab_v5_server.bat').read_text();parts=[]
for line in bat.splitlines():
 if line.startswith(' "'):parts.append(line.strip().removesuffix(' ^')[1:-1])
ps='\n'.join(parts).replace('%HTML%','OutlineLab_v5.html').replace('%PORT%','8002').replace("Start-Process 'http://localhost:8002/';",'')
Path('test-launcher.ps1').write_text(ps,encoding='utf-8')
print('Build:',build.resolve());print('HTML bytes:',p.stat().st_size)
