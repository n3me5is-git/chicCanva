from pathlib import Path
p=Path('development/workspace.js');s=p.read_text(encoding='utf-8')
start=s.index('function migrateSnapshot(');end=s.index('function migrateProject(',start)
s=s[:start]+"function migrateSnapshot(snap){const result=cloneData(snap);if(!result.state.workspaceCustom)throw new Error('Usa un progetto chicCanva v7');result.state.mode='custom';result.pages.whole=[];result.pages.single=[];return result}\n"+s[end:]
s=s.replace("function migrateProject(input){validateProject(input);", "function migrateProject(input){validateProject(input);if(input.version!==7)throw new Error('Formato richiesto: chicCanva v7');")
s=s.replace('migrateSnapshot','normalizeCustomSnapshot').replace('migrateProject','normalizeCustomProject')
p.write_text(s,encoding='utf-8')
