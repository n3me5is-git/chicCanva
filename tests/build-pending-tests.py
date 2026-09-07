from pathlib import Path
root=Path(__file__).resolve().parent.parent
folder=root/'tests'
s=(root/'chicCanva.html').read_text(encoding='utf-8')
base=(folder/'tests.js').read_text(encoding='utf-8').replace("results.push('ALL CHECKS COMPLETE')","await runChicChecks(ok);await runPendingChecks(ok);results.push('ALL CHECKS COMPLETE')")
# Run regression tests on CPU; GPU is tested separately with fallback and on available hardware.
base=base.replace('await init();', "localStorage.removeItem(MEMORY_KEY);localStorage.removeItem(PREF_KEY);await init();preferences.autosave=false;preferences.device='cpu';")
test=(folder/'chic-tests.js').read_text(encoding='utf-8')+'\n'+(folder/'pending-tests.js').read_text(encoding='utf-8')+'\n'+base
s=s.replace("init().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});",test)
(folder/'pending-test.html').write_text(s,encoding='utf-8')
