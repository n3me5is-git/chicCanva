from pathlib import Path
import re
folder=Path(__file__).resolve().parent
s=(folder.parent/'OutlineLab_v5.html').read_text(encoding='utf-8')
s=s.replace("init().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});",(folder/'tests.js').read_text(encoding='utf-8'))
(folder/'test.html').write_text(s,encoding='utf-8')
