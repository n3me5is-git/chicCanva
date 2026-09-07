from pathlib import Path
import re,json,struct
root=Path(__file__).resolve().parent.parent
s=(root/'chicCanva.html').read_text(encoding='utf-8')
scripts=re.findall(r'<script>([\s\S]*?)</script>',s)
body=s[s.index('<body>'):s.rindex('<script>')]
ids=re.findall(r'\bid="([^"]+)"',body)
refs=re.findall(r"\$\('([^']+)'\)",scripts[-1])
assert len(ids)==len(set(ids)), 'Duplicate IDs'
assert not set(refs)-set(ids), set(refs)-set(ids)
for name in ['chicCanva.html','chicCanva_server.bat']:
 assert (root/name).read_bytes()==(root/'build/chicCanva'/name).read_bytes()
assert len(list((root/'build/chicCanva').iterdir()))==2
assert 'api.fontsource.org' not in s
pwa=root/'build/chicCanva-pwa'
expected={'index.html','chicCanva.webmanifest','chicCanva-sw.js','chiccanva-192.png','chiccanva-512.png'}
assert {p.name for p in pwa.iterdir()}==expected
assert (pwa/'index.html').read_bytes()==(root/'chicCanva.html').read_bytes()
manifest=json.loads((pwa/'chicCanva.webmanifest').read_text(encoding='utf-8'))
assert manifest['start_url']=='./' and manifest['scope']=='./' and manifest['display']=='standalone'
assert {'192x192','512x512'}=={icon['sizes'] for icon in manifest['icons']}
for size in (192,512):
 data=(pwa/f'chiccanva-{size}.png').read_bytes();assert data[:8]==b'\x89PNG\r\n\x1a\n'
 width,height=struct.unpack('>II',data[16:24]);assert (width,height)==(size,size)
assert "protocol!=='https:'" in s and "navigator.serviceWorker.register('./chicCanva-sw.js'" in s
print(f'{len(ids)} unique IDs; all references present; local build matches; PWA bundle and icons valid; no Fontsource API dependency.')
