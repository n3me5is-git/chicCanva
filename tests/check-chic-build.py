from pathlib import Path
import re,json,struct,hashlib
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
bat=(root/'chicCanva_server.bat').read_text(encoding='utf-8')
assert '/__chiccanva_image_proxy' in bat and '/__chiccanva_openclipart_search' in bat and 'Test-PublicUri' in bat and '12582912' in bat
assert 'api.fontsource.org' not in s
assert "puter.auth.getMonthlyUsage()" in s and 'allowanceInfo' in s and 'puterUsageBar' in ids
assert 'openclipart.org/search/' in s and 'parseOpenclipartResults' in s and 'clipartCard' in ids
assert 'api.mymemory.translated.net/get' in s and 'CLIPART_IT_EN' in s and 'translateClipartLocally' in s and 'clipartTranslate' in ids
pwa=root/'build/chicCanva-pwa'
expected={'index.html','chicCanva.webmanifest','chicCanva-sw.js','chiccanva-192.png','chiccanva-512.png'}
assert {p.name for p in pwa.iterdir()}==expected
assert (pwa/'index.html').read_bytes()==(root/'chicCanva.html').read_bytes()
build_id=hashlib.sha256((root/'chicCanva.html').read_bytes()).hexdigest()[:16]
sw=(pwa/'chicCanva-sw.js').read_text(encoding='utf-8')
assert '__BUILD_ID__' not in sw and "const BUILD_ID='"+build_id+"'" in sw
assert 'shellNavigation(request)' in sw and 'event.waitUntil(refreshNavigation(request))' in sw
manifest=json.loads((pwa/'chicCanva.webmanifest').read_text(encoding='utf-8'))
assert manifest['start_url']=='./' and manifest['scope']=='./' and manifest['display']=='standalone'
assert {'192x192','512x512'}=={icon['sizes'] for icon in manifest['icons']}
for size in (192,512):
 data=(pwa/f'chiccanva-{size}.png').read_bytes();assert data[:8]==b'\x89PNG\r\n\x1a\n'
 width,height=struct.unpack('>II',data[16:24]);assert (width,height)==(size,size)
assert "protocol!=='https:'" in s and "navigator.serviceWorker.register('./chicCanva-sw.js'" in s
assert {'deletePageDialog','pwaUpdateBar','bgAutoColor','aiChromaKey'}.issubset(ids)
assert 'AUTOSAVE_CURRENT' in s and 'runMobileBackgroundWorker' in s and 'setupCanvasColorPickers' in s
print(f'{len(ids)} unique IDs; all references present; local build and protected image proxy valid; PWA bundle and icons valid; no Fontsource API dependency.')
