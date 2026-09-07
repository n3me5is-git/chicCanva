from pathlib import Path
root=Path(__file__).resolve().parent.parent
s=(root/'chicCanva.html').read_text(encoding='utf-8')
test=(root/'tests/v7-tests.js').read_text(encoding='utf-8')
s=s.replace("init().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});",test)
(root/'tests/v7-test.html').write_text(s,encoding='utf-8')
