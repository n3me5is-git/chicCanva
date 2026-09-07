from pathlib import Path
p=Path('OutlineLab_v5.html');s=p.read_text(encoding='utf-8')
s=s.replace("state.mode='whole';await addTextUnified()","state.mode='whole';await loadPage(state.pages.whole[0]);await addTextUnified()")
s=s.replace("const srcBlob=await (await fetch(asset.dataUrl)).blob();", "const raster=document.createElement('canvas'),source=new Image();source.src=asset.dataUrl;await source.decode();raster.width=source.naturalWidth;raster.height=source.naturalHeight;raster.getContext('2d').drawImage(source,0,0);const srcBlob=await new Promise((resolve,reject)=>raster.toBlob(b=>b?resolve(b):reject(new Error('Conversione immagine fallita')),'image/png'));")
p.write_text(s,encoding='utf-8')
