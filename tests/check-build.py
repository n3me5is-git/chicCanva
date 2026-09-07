from pathlib import Path
import re,hashlib
root=Path(__file__).resolve().parent.parent
s=(root/'OutlineLab_v5.html').read_text(encoding='utf-8')
script=re.findall(r'<script>([\s\S]*?)</script>',s)[-1]
ids=re.findall(r'\bid="([^"]+)"',s[s.index('<body>'):s.rindex('<script>')])
refs=re.findall(r"\$\('([^']+)'\)",script)
assert len(ids)==len(set(ids)), 'Duplicate IDs'
assert not set(refs)-set(ids),set(refs)-set(ids)
assert (root/'OutlineLab_v5.html').read_bytes()==(root/'build/OutlineLab_v5/OutlineLab_v5.html').read_bytes()
assert sorted(p.suffix for p in (root/'build/OutlineLab_v5').iterdir())==['.bat','.html']
print(f'{len(ids)} unique IDs; all DOM references present; build matches source; only HTML and BAT in build.')
(root/'development/check.js').write_text(script,encoding='utf-8')
