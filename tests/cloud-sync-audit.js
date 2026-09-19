// Runs inside the composed app closure, with isolated browser storage and an in-memory MEGA tree.
async function runCloudSyncAudit(){
 const results=[],check=(name,passed,details='')=>results.push({name,passed:!!passed,details});
 const originalNow=Date.now;let now=2000000000000,failName='',events=[],root,home;
 const makeFolder=(name,parent)=>{
  const folder={name,nodeId:uid('fixture'),directory:true,parent,children:[],
   find(name,deep=false){return this.children.find(node=>node.name===name)||(deep?this.children.filter(node=>node.directory).map(node=>node.find(name,true)).find(Boolean):undefined)},
   async mkdir(name){return makeFolder(name,this)},
   async delete(){events.push('delete:'+name);if(parent)parent.children=parent.children.filter(node=>node!==folder)},
   upload({name},bytes){return{complete:(async()=>{
    events.push('upload:'+name);if(name===failName)throw Error('Injected upload failure: '+name);
    const node={name,nodeId:uid('fixture'),parent:folder,bytes:new Uint8Array(bytes),async downloadBuffer(){return this.bytes},async delete(){events.push('delete:'+name);folder.children=folder.children.filter(item=>item!==node)}};
    folder.children.push(node);return node;
   })()}}
  };parent?.children.push(folder);return folder;
 };
 const data=value=>({version:7,workspace:{version:1,activeId:'alpha',projects:[{id:'alpha',name:'Alpha',payload:{version:7,value,history:{entries:[{value}],cursor:0}}},{id:'beta',name:'Beta',payload:{version:7,value}}]}});
 const session=()=>home.find('.synch')?.find('shared');
 const manifest=()=>session()?.find('current.json');
 const reset=()=>{
  stopCloudSyncWatcher();$('cloudConflictDialog').close();events=[];failName='';now+=10000;
  root=makeFolder('Cloud Drive');home=makeFolder(CLOUD_ROOT_NAME,root);cloudRoot=home;
  cloudStorage={root,status:'ready',async reload(){},};cloudMeta={backupInstanceId:'backup',syncSessionId:'shared',writerId:'writer-z',lastRevision:0,lastBackupAt:0,lastSyncAt:0,lastSyncHash:'',syncSuspended:false};
  preferences.cloudSync=true;preferences.cloudBackup=false;preferences.cloudHideSyncBadge=false;cloudLocalDirty=true;cloudSyncBusy=false;
 };
 try{
  localStorage.clear();await init();preferences.autosave=false;clearTimeout(autosaveTimer);Date.now=()=>now;
  reset();await cloudSyncWorkspace(JSON.stringify(data('first')),'2026-09-19T10:00:00Z');
  let current=await cloudJson(manifest()),revision=session().find(current.folder),snapshot=await cloudCurrentSnapshot();
  check('complete publication and recovery',revision.find('alpha.json')&&revision.find('beta.json')&&snapshot.project.workspace.projects[0].payload.history.entries[0].value==='first'&&!cloudSyncBusy&&!cloudLocalDirty);
  check('manifest published after all payload files',events.indexOf('upload:current.json')>events.indexOf('upload:workspace.json'));
  const firstManifest=manifest(),firstRevision=revision;
  now+=1000;failName='beta.json';let rejected=false;try{await cloudSyncWorkspace(JSON.stringify(data('failed-project')),'later')}catch(error){rejected=true}
  check('project upload failure preserves published data',rejected&&manifest()===firstManifest&&session().children.includes(firstRevision)&&!cloudSyncBusy);
  now+=1000;failName='current.json';rejected=false;try{await cloudSyncWorkspace(JSON.stringify(data('failed-index')),'later')}catch(error){rejected=true}
  check('manifest upload failure preserves published data',rejected&&manifest()===firstManifest&&(await cloudCurrentSnapshot()).project.workspace.projects[0].payload.value==='first'&&!cloudSyncBusy);
  now+=1000;failName='';events=[];await cloudSyncWorkspace(JSON.stringify(data('second')),'later');
  check('successful revision replaces old data only after publication',!session().children.includes(firstRevision)&&events.indexOf('upload:current.json')<events.indexOf('delete:'+firstRevision.name));
  now+=1000;events=[];await cloudSyncWorkspace(JSON.stringify(data('second')),'same-content');
  check('unchanged content does not upload another revision',!events.some(item=>item==='upload:workspace.json'),events.join(', '));
  const realSetTimeout=window.setTimeout;let scheduledDelay;
  try{window.setTimeout=(callback,delay)=>{scheduledDelay=delay;return 0};chicCloudAutosaveCommitted({payload:JSON.stringify(data('next')),saved:'next'});check('sync-only mode respects ten minutes between successful uploads',scheduledDelay>CLOUD_UPLOAD_INTERVAL-10000&&scheduledDelay<=CLOUD_UPLOAD_INTERVAL,'scheduled after '+scheduledDelay+' ms')}
  finally{window.setTimeout=realSetTimeout;cloudPendingSnapshot=null;cloudBackupTimer=0}

  reset();await cloudSyncWorkspace(JSON.stringify(data('remote')),'remote');cloudMeta.writerId='writer-other';cloudMeta.lastRevision=0;await pollCloudSync();
  check('polling suspends a stale client and opens the conflict dialog',preferences.cloudSync&&cloudMeta.syncSuspended&&$('cloudConflictDialog').open);
  let reloaded='not-called';const realApply=applyCloudSnapshot;applyCloudSnapshot=async value=>{reloaded=value};
  try{$('cloudConflictReload').click();await Promise.resolve();await Promise.resolve();check('Reload from Cloud receives the current snapshot after suspension',!!reloaded?.project,JSON.stringify(reloaded))}finally{applyCloudSnapshot=realApply}
  $('cloudConflictLocal').click();check('Continue locally closes the dialog and keeps the warning visible',!$('cloudConflictDialog').open&&!$('cloudOutOfSyncBadge').classList.contains('hidden'));
  cloudLocalDirty=false;syncCloudUi();check('out-of-sync warning survives UI refresh without local edits',!$('cloudOutOfSyncBadge').classList.contains('hidden'));

  reset();await cloudSyncWorkspace(JSON.stringify(data('winner')),'winner');const winner=manifest();now+=1000;cloudMeta.writerId='writer-a';cloudMeta.lastRevision=0;
  await cloudSyncWorkspace(JSON.stringify(data('stale')),'stale');
  check('a later client cannot displace the first active writer',manifest()===winner&&cloudMeta.syncSuspended,(await cloudJson(manifest())).writerId);
  reset();cloudMeta.writerId='writer-a';await cloudSyncWorkspace(JSON.stringify(data('winner')),'winner');const firstAlphabetical=manifest();now+=1000;cloudMeta.writerId='writer-z';cloudMeta.lastRevision=0;await cloudSyncWorkspace(JSON.stringify(data('stale')),'stale');
  check('a competing writer with a later alphabetical ID is blocked',manifest()===firstAlphabetical&&cloudMeta.syncSuspended);
  reset();const lockBase=await ensureCloudFolder(home,CLOUD_SYNC_NAME),lockSession=await ensureCloudFolder(lockBase,'shared');cloudMeta.writerId='writer-first';const firstLock=await cloudClaimLease(lockSession,0);cloudMeta.writerId='writer-second';const blockedLock=await cloudClaimLease(cloudSyncSession(),0);now+=CLOUD_LEASE_MS+1;const recoveredLock=await cloudClaimLease(cloudSyncSession(),0);
  check('temporary lock blocks a second writer but an abandoned lock expires',firstLock&&!blockedLock&&recoveredLock);
  reset();await cloudSyncWorkspace(JSON.stringify(data('winner')),'winner');const expiredWinner=manifest();now+=CLOUD_LEASE_MS+1;cloudMeta.writerId='writer-late';cloudMeta.lastRevision=0;
  await cloudSyncWorkspace(JSON.stringify(data('stale')),'stale');
  check('a stale client cannot overwrite a newer revision after lease expiry',manifest()===expiredWinner&&cloudMeta.syncSuspended,(await cloudJson(manifest())).writerId);

  reset();await cloudSyncWorkspace(JSON.stringify(data('published')),'first');failName='current.json';
  try{await cloudSyncWorkspace(JSON.stringify(data('unpublished')),'second')}catch(error){}
  snapshot=await cloudCurrentSnapshot();check('same-millisecond failed publication leaves the old payload intact',snapshot.project.workspace.projects[0].payload.value==='published',snapshot.project.workspace.projects[0].payload.value);

  reset();const warnings=[],realWarn=console.warn;console.warn=(...args)=>warnings.push(args.map(String).join(' '));try{await pollCloudSync()}finally{console.warn=realWarn}
  check('empty cloud is handled without an exception',warnings.length===0,warnings.join('\n'));
  await cloudSyncWorkspace(JSON.stringify(data('discoverable')),'saved');cloudMeta.syncSessionId='new-browser';cloudMeta.lastRevision=0;
  check('a fresh browser can discover an existing cloud session',!!await cloudCurrentSnapshot());
  cloudMeta.lastSyncAt=123;cloudMeta.lastSyncHash='old';cloudMeta.syncSuspended=true;await clearCloudArea(CLOUD_SYNC_NAME);check('clearing Synch detaches local metadata for a clean next upload',!home.find(CLOUD_SYNC_NAME)&&cloudMeta.lastRevision===0&&cloudMeta.lastSyncAt===0&&!cloudMeta.lastSyncHash&&!cloudMeta.syncSuspended);
  const backupArea=await ensureCloudFolder(home,CLOUD_BACKUP_NAME);cloudLastPayloadHash='backup-hash';cloudMeta.lastBackupAt=123;await clearCloudArea(CLOUD_BACKUP_NAME);check('clearing backups resets deduplication metadata',!home.find(CLOUD_BACKUP_NAME)&&!cloudLastPayloadHash&&cloudMeta.lastBackupAt===0);
  await cloudSyncWorkspace(JSON.stringify(data('discoverable')),'saved');cloudMeta.syncSessionId='new-browser';cloudMeta.lastRevision=0;
  cloudMeta.syncSessionId='shared';preferences.cloudSync=true;showCloudConflict();
  // The runner sends an actual Escape key after receiving the report.
  window.cloudSyncAuditResults=results;
 }catch(error){results.push({name:'audit execution',passed:false,details:error.stack});window.cloudSyncAuditResults=results}
 finally{Date.now=originalNow;stopCloudSyncWatcher()}
}
runCloudSyncAudit();
