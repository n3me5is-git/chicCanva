from pathlib import Path
p=Path('development/pending.js');s=p.read_text(encoding='utf-8')
helper="""async function normalizeImportedAssets(input){const assets=cloneData(input||{});for(const asset of Object.values(assets)){if(!asset.mime?.includes('svg')&&!asset.dataUrl?.startsWith('data:image/svg+xml'))continue;for(const key of ['dataUrl','originalDataUrl']){const url=asset[key];if(!url)continue;try{const xml=new DOMParser().parseFromString(await(await fetch(url)).text(),'image/svg+xml'),root=xml.documentElement;if(xml.querySelector('parsererror'))continue;const box=(root.getAttribute('viewBox')||'0 0 72 72').split(/[ ,]+/).map(Number);if(root.hasAttribute('width')&&root.hasAttribute('height'))continue;root.setAttribute('width',String(box[2]||72));root.setAttribute('height',String(box[3]||72));root.setAttribute('xmlns','http://www.w3.org/2000/svg');asset[key]=await dataUrlFromBlob(new Blob([new XMLSerializer().serializeToString(xml)],{type:'image/svg+xml'}))}catch(e){console.warn('SVG import',e)}}}return assets}
"""
s=s.replace('async function adoptProject(',helper+'async function adoptProject(',1)
s=s.replace('await restoreSnapshot(p,cloneData(p.assets||{}));','await restoreSnapshot(p,await normalizeImportedAssets(p.assets));')
p.write_text(s,encoding='utf-8')
