async function runPendingChecks(ok){
 preferences.autosave=false;clearTimeout(autosaveTimer);await storageQueue;clearTimeout(commitTimer);
 ok('Pending controls present',!!$('emojiCategory')&&!!$('bgModel')&&!!$('historyLimit'));
 const gpuRuntime=await import(globalThis.__chicGpuUrl);ok('Embedded WebGPU runtime imports successfully',!!gpuRuntime.default.InferenceSession);
 if(!emojiData.length)await loadEmojiCatalog();
 $('emojiSearch').value='';$('emojiCategory').value='all';renderEmojiGrid();
 ok('Full OpenMoji catalog browsable',emojiData.length>4000&&emojiMatches().length===emojiData.length);
 const categories=[...new Set(emojiData.map(e=>e.group))];ok('Every OpenMoji group selectable',categories.every(g=>[...$('emojiCategory').options].some(o=>o.value===g)));
 const shown=$('emojiGrid').querySelectorAll('.emoji-btn').length;$('emojiGrid').querySelector('.emoji-more').click();ok('Emoji pagination expands results',$('emojiGrid').querySelectorAll('.emoji-btn').length>shown);
 $('emojiCategory').value='animals-nature';$('emojiSearch').value='';renderEmojiGrid();ok('Emoji category contains only matching group',emojiMatches().every(e=>e.group==='animals-nature'));
 $('emojiSearch').value='flag';renderEmojiGrid();ok('Emoji search is global across categories',emojiMatches().some(e=>e.group==='flags'));
 $('emojiSearch').value='';$('emojiCategory').value='relevant';renderEmojiGrid();ok('Relevant emojis prioritize common symbols',!emojiMatches()[0].group.startsWith('extras'));
 const svg='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" width="72" height="72"><path d="M10 10 L60 60" stroke="#000" stroke-width="2"/></svg>');
 const styled=await styleEmojiSvg(svg,'#000000','#123456',2);const xml=await(await fetch(styled)).text();ok('Emoji stroke and color applied to SVG',xml.includes('stroke-width="4"')&&xml.includes('#123456'));
 const legacyUrl='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><circle cx="36" cy="36" r="20"/></svg>');const normalized=await normalizeImportedAssets({old:{mime:'image/svg+xml',dataUrl:legacyUrl,originalDataUrl:legacyUrl}});const legacyImage=new Image();legacyImage.src=normalized.old.dataUrl;await legacyImage.decode();ok('Legacy SVG import restores intrinsic dimensions',legacyImage.naturalWidth===72&&legacyImage.naturalHeight===72);
 state.emojiStroke=2;state.emojiInk='#123456';const emojiId=await assetFromUrl(svg,{kind:'emoji',meta:{style:'black',hex:'TEST'}});await addImageAsset(emojiId,'emoji');const emoji=canvas.getActiveObject();$('emojiStroke').value=3;$('emojiInk').value='#654321';await applyEmojiInk();canvas.setActiveObject(emoji);await applyEmojiInk();const twice=await(await fetch(state.assets[emoji.assetId].dataUrl)).text();ok('Repeated emoji style does not compound stroke',twice.includes('stroke-width="6"')&&!twice.includes('stroke-width="18"'));
 // Establish a clean baseline after setup; include an image so deleted assets are exercised.
 state.emojiStroke=1;syncUiFromState();historyEntries=[historySnapshot()];historyCursor=0;historyReady=true;const initial=canvas.getObjects().length;
 canvas.setActiveObject(emoji);await duplicateSelection();commitHistory();ok('Duplicate creates one history action',historyCursor===1&&canvas.getObjects().length===initial+1);
 await travelHistory(-1);ok('Undo removes duplicate',canvas.getObjects().length===initial);
 await travelHistory(1);ok('Redo restores duplicate',canvas.getObjects().length===initial+1);
 const duplicate=canvas.getObjects().at(-1);canvas.setActiveObject(duplicate);$('deleteTool').click();commitHistory();const packed=cloneData(fullPayload(true));ok('History keeps deleted assets',packed.history.entries.length>1&&!!packed.assets[duplicate.assetId]);
 await adoptProject(packed,true);await travelHistory(-1);ok('Imported JSON supports undo',canvas.getObjects().length===initial+1);
 await travelHistory(-1);const priorLength=historyEntries.length;canvas.setActiveObject(canvas.getObjects()[0]);await duplicateSelection();commitHistory();ok('New action discards redo branch',historyCursor===historyEntries.length-1&&historyEntries.length<=priorLength);
 preferences.limit=2;for(let i=0;i<4;i++){canvas.setActiveObject(canvas.getObjects()[0]);await duplicateSelection();commitHistory()}ok('History limit enforced',historyEntries.length===3&&historyCursor===2);
 const noHistory=fullPayload(false);ok('JSON history optional',!noHistory.history);preferences.limit=30;
 await adoptProject(noHistory,false);ok('Import without history starts clean',historyEntries.length===1&&historyCursor===0);
 const preserved=canvas.getObjects().length;let invalid=false;try{await adoptProject({state:{},pages:{whole:[],single:[],custom:[{widthMm:-1,heightMm:10,objects:[]}]}},true)}catch(e){invalid=true}ok('Malformed project rejected without changing canvas',invalid&&canvas.getObjects().length===preserved);
 let rejected=0;for(const url of ['javascript:alert(1)','file:///test.png','not-a-url'])try{await fetchImageFile(url)}catch(e){rejected++}ok('URL loader rejects non-web URLs',rejected===3);
 const file=await fetchImageFile(location.origin+'/tests/test-photo.png');ok('URL loader obtains decodable image',file.type==='image/png'&&file.size>0);
 await setAiReference(file);ok('URL reference is serialized',state.aiReference.dataUrl.startsWith('data:image/png'));
 // Store a compact document in localStorage and a large document in IndexedDB.
 const backup=cloneData(fullPayload(true));await adoptProject({state:noHistory.state,pages:{whole:[makePage('Local',210,297,'whole')],single:[],custom:[]},assets:{}},false);state.aiReference=null;syncUiFromState();preferences.autosave=true;await persistProject();const small=JSON.parse(localStorage.getItem(MEMORY_KEY));ok('Small autosave uses localStorage',!!small.project&&!small.database);const memory=await readMemory();ok('Autosave can be read and restored',memory.project.pages.whole[0].name==='Local');
 $('textInput').value='Ultima modifica prima del refresh';ok('Immediate refresh flush succeeds',flushBeforeLeave());const immediate=await readMemory();ok('Refresh flush retains latest text',immediate.project.state.text==='Ultima modifica prima del refresh');ok('Unchanged flush does not create new history',flushBeforeLeave()&&encodeMemory(fullPayload(true))===lastSavedPayload);
 state.aiReference={name:'Large storage fixture',dataUrl:'data:image/png;base64,'+'A'.repeat(1900000)};syncUiFromState();await persistProject();const large=JSON.parse(localStorage.getItem(MEMORY_KEY));ok('Large project uses browser DB with localStorage pointer',large.database&&!!large.record);const largeRead=await readMemory();ok('Large autosave roundtrip retains data',largeRead.project.state.aiReference.dataUrl.length>1900000);ok('Saved large project can refresh without warning',flushBeforeLeave());
 // Dedicated cache: first request network, second cache; clear removes it.
 const originalFetch=window.fetch;let hits=0;window.fetch=async(input,options)=>String(input).includes('chic-test-cache')?(hits++,new Response('model-test',{status:200})):originalFetch(input,options);
 try{await __chicBgFetch('https://staticimgly.com/chic-test-cache');await __chicBgFetch('https://staticimgly.com/chic-test-cache');ok('Model cache prevents repeated downloads',hits===1)}finally{window.fetch=originalFetch}
 const beforeClear=canvas.getObjects().length;await clearAllMemory();ok('Clear removes autosave and model cache',!localStorage.getItem(MEMORY_KEY)&&!(await caches.keys()).includes(BG_CACHE));ok('Clear preserves canvas and disables autosave',canvas.getObjects().length===beforeClear&&!preferences.autosave);
 await adoptProject(backup,true);preferences.autosave=false;
 // Inference contract checks without spending AI credits or requiring a hardware GPU.
 const actualModule=loadBackgroundModule,actualDevice=selectedBgDevice;let calls=[],busySeen=false;
 const fixture=new Blob([await file.arrayBuffer()],{type:'image/png'});loadBackgroundModule=async()=>({removeBackground:async(blob,config)=>{calls.push(config);busySeen=$('removeBgBtn').getAttribute('aria-busy')==='true'&&$('canvasShell').classList.contains('bg-busy');if(config.device==='gpu')throw new Error('simulated GPU unavailable');return fixture}});selectedBgDevice=async()=> 'gpu';
 try{preferences.model='isnet';$('bgMethod').value='ai';const id=await assetFromUrl(location.origin+'/tests/test-photo.png',{kind:'image'});await addImageAsset(id,'image');await removeBackgroundSelected();ok('Chosen model passed and GPU retries CPU',calls.length===2&&calls.every(c=>c.model==='isnet')&&calls[0].device==='gpu'&&calls[1].device==='cpu');ok('Background removal exposes busy feedback',busySeen);ok('Spinner removed after successful fallback',!bgWorking&&!$('canvasShell').classList.contains('bg-busy')&&!$('removeBgBtn').disabled);
 loadBackgroundModule=async()=>({removeBackground:async()=>{throw new Error('simulated failure')}});selectedBgDevice=async()=> 'cpu';await removeBackgroundSelected();ok('Spinner removed on error and original retained',!bgWorking&&!$('removeBgBtn').disabled&&!!state.assets[id]);
 }finally{loadBackgroundModule=actualModule;selectedBgDevice=actualDevice;preferences.model='isnet_quint8';preferences.device='cpu';syncSettings()}
 await clearAllMemory();
}
