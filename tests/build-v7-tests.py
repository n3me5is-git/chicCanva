from pathlib import Path
import time
root=Path(__file__).resolve().parent.parent
s=(root/'chicCanva.html').read_text(encoding='utf-8')
test=(root/'tests/v7-tests.js').read_text(encoding='utf-8')
s=s.replace("init().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});",test)
target=root/'tests/v7-test.html'
for attempt in range(8):
 try:target.write_text(s,encoding='utf-8');break
 except OSError:
  if attempt==7:raise
  time.sleep(.15*(attempt+1))
