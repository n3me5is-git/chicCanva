from pathlib import Path
p=Path('development/pending.js')
s=p.read_text(encoding='utf-8').replace('Autosalvataggio activé.','Autosalvataggio attivato.')
p.write_text(s,encoding='utf-8')
p=Path('development/build-pending.py')
s=p.read_text(encoding='utf-8')
s=s.replace("# Patch only the embedded", "s=s.replace('Elaborazione locale CPU. Il primo utilizzo scarica circa 60 MB di modello e runtime da staticimgly.com; serve il launcher.', 'Elaborazione locale CPU o WebGPU. Il primo utilizzo scarica il modello scelto più 12–23 MB di runtime da staticimgly.com; serve il launcher.')\n# Patch only the embedded")
p.write_text(s,encoding='utf-8')
