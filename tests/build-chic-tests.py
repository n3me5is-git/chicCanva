from pathlib import Path
import re
folder=Path(__file__).resolve().parent
root=folder.parent
s=(root/'chicCanva.html').read_text(encoding='utf-8')
base=(folder/'tests.js').read_text(encoding='utf-8').replace("results.push('ALL CHECKS COMPLETE')","await runChicChecks(ok);results.push('ALL CHECKS COMPLETE')")
test=(folder/'chic-tests.js').read_text(encoding='utf-8')+'\n'+base
s=s.replace("init().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});",test)
(folder/'chic-test.html').write_text(s,encoding='utf-8')
script=re.findall(r'<script>([\s\S]*?)</script>',s)[-1]
(root/'development/chic-test-check.js').write_text(script,encoding='utf-8')
