// Memory-conscious editing, image diagnostics and interaction safeguards.
const RESOLUTION_FACTORS=[.25,1/3,.5,2,3,4],RESOLUTION_LABELS=['¼×','⅓×','½×','2×','3×','4×'],AUTOSAVE_GENERATION_PREFIX='workspace-generation-';
let autosaveRevision=0,lastSavedRevision=-1,memoryUpdateTimer=0,resolutionTarget=null,regionInteractionState=null,longPressTimer=0,longPressStart=null;

function cloneProjectWithoutAssetStrings(payload){
 const assets=payload?.assets||{},shell={...payload,assets:{}};
 const result=cloneData(shell);result.assets=Object.fromEntries(Object.entries(assets).map(([id,asset])=>[id,{...asset,meta:asset.meta?{...asset.meta}:asset.meta}]));return result
}
normalizeImportedAssets=async function(input){
 const assets=Object.fromEntries(Object.entries(input||{}).map(([id,asset])=>[id,{...asset,meta:asset.meta?{...asset.meta}:asset.meta}]));
 for(const asset of Object.values(assets)){if(!asset.mime?.includes('svg')&&!asset.dataUrl?.startsWith('data:image/svg+xml'))continue;for(const key of ['dataUrl','originalDataUrl']){const url=asset[key];if(!url)continue;try{const xml=new DOMParser().parseFromString(await(await fetch(url)).text(),'image/svg+xml'),root=xml.documentElement;if(xml.querySelector('parsererror')||root.hasAttribute('width')&&root.hasAttribute('height'))continue;const box=(root.getAttribute('viewBox')||'0 0 72 72').split(/[ ,]+/).map(Number);root.setAttribute('width',String(box[2]||72));root.setAttribute('height',String(box[3]||72));root.setAttribute('xmlns','http://www.w3.org/2000/svg');asset[key]=await dataUrlFromBlob(new Blob([new XMLSerializer().serializeToString(root)],{type:'image/svg+xml'}))}catch(error){console.warn('SVG import',error)}}}
 return assets
};
normalizeCustomSnapshot=function(snap){const result=cloneProjectWithoutAssetStrings(snap);if(!result.state.workspaceCustom)throw new Error('Usa un progetto chicCanva v7');result.state.mode='custom';result.pages.whole=[];result.pages.single=[];return result};
normalizeCustomProject=function(input){validateProject(input);if(input.version!==7)throw new Error('Formato richiesto: chicCanva v7');const p=normalizeCustomSnapshot(input);p.version=7;delete p.workspace;if(p.history)p.history.entries=p.history.entries.map(entry=>{const copy=cloneData(entry);copy.state.workspaceCustom=true;copy.state.mode='custom';copy.pages.whole=[];copy.pages.single=[];return copy});return p};
function projectSnapshotForWorkspace(includeHistory=true){
 const p=v6FullPayload(includeHistory);p.version=7;p.name=activeProject()?.name||'Progetto';p.state.workspaceCustom=true;p.state.documentFields=documentFields();return cloneProjectWithoutAssetStrings(p)
}
// Keep one active-project representation in serialized workspaces. Old saves remain readable.
currentDocument=function(includeHistory=true){return projectSnapshotForWorkspace(includeHistory)};
storeActiveDocument=function(){if(!workspaceReady||projectSwitching||historyRestoring||loadingPage)return;const record=activeProject();if(record)record.payload=projectSnapshotForWorkspace(true)};
fullPayload=function(includeHistory=preferences.history){
 const p=projectSnapshotForWorkspace(includeHistory);
 if(workspaceReady){
  const current=activeProject();if(current&&!projectSwitching&&!historyRestoring)current.payload=p;
  p.workspace={version:1,activeId:activeProjectId,serial:projectSerial,activeUsesRoot:true,projects:projects.map(record=>record.id===activeProjectId?{id:record.id,name:record.name,lastExport:record.lastExport??null,payloadRef:'root'}:{id:record.id,name:record.name,lastExport:record.lastExport??null,payload:record.payload})}
 }
 return p
};
const memoryOptimizedDecode=decodeMemory;
decodeMemory=function(text){
 const p=memoryOptimizedDecode(text),ws=p.workspace;
 if(ws?.activeUsesRoot&&Array.isArray(ws.projects)){
  const root={...p};delete root.workspace;
  for(const record of ws.projects)if(record.payloadRef==='root'){record.payload=root;delete record.payloadRef}
 }
 for(const record of ws?.projects||[])for(const asset of Object.values(record.payload?.assets||{}))asset.originalDataUrl??=asset.dataUrl;
 return p
};
decodeStoredSnapshot=async function(record,fallbackSaved){
 if(!record)return null;if(record.generation){const generation=await dbOperation('readonly',store=>store.get(record.generation));if(!generation||generation===record)return null;return decodeStoredSnapshot(generation,record.saved||fallbackSaved)}const saved=record.saved||fallbackSaved,projectText=typeof record==='string'?record:record.project;if(!projectText)return null;
 const project=decodeMemory(projectText);validateProject(project);return{saved:saved||new Date().toISOString(),project}
};
saveStableSnapshot=async function(payload,saved){
 const current=await dbOperation('readonly',store=>store.get(AUTOSAVE_CURRENT)).catch(()=>null),generation=AUTOSAVE_GENERATION_PREFIX+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),previousGeneration=current?.generation||null;
 await dbOperation('readwrite',store=>{store.put({version:3,saved,project:payload},generation);if(current)store.put(current,AUTOSAVE_PREVIOUS);return store.put({version:3,saved,generation},AUTOSAVE_CURRENT)});
 await dbOperation('readwrite',store=>{const cursor=store.openCursor();cursor.onsuccess=()=>{const item=cursor.result;if(!item)return;const key=String(item.key);if(key.startsWith(AUTOSAVE_GENERATION_PREFIX)&&key!==generation&&key!==previousGeneration)item.delete();item.continue()}}).catch(()=>{})
};
scheduleAutosave=function(){if(!historyReady||historyRestoring||!preferences.autosave)return;autosaveRevision++;markAutosaveDirty();clearTimeout(autosaveTimer);autosaveTimer=setTimeout(persistProject,1200)};
persistProject=function(){
 clearTimeout(autosaveTimer);if(!historyReady||historyRestoring||actionDepth||loadingPage||!preferences.autosave||cropSession)return storageQueue;
 const revision=autosaveRevision;if(revision===lastSavedRevision)return storageQueue;
 const epoch=memoryEpoch,payload=encodeMemory(fullPayload(true)),saved=new Date().toISOString();markAutosaveDirty();
 storageQueue=storageQueue.catch(()=>{}).then(async()=>{if(epoch!==memoryEpoch||!preferences.autosave)return;try{await saveStableSnapshot(payload,saved);if(epoch!==memoryEpoch||!preferences.autosave)return;localStorage.setItem(MEMORY_KEY,JSON.stringify({version:2,saved,database:true,record:AUTOSAVE_CURRENT}));localStorage.removeItem(AUTOSAVE_DIRTY_KEY);lastSavedRevision=revision;lastSavedPayload='';memoryMessage('Salvato alle '+new Date(saved).toLocaleTimeString('it-IT')+' · database protetto del browser');scheduleMemoryUpdate()}catch(error){console.warn(error);memoryMessage('Autosalvataggio NON riuscito: spazio esaurito o memoria bloccata. Esporta il JSON per conservare il lavoro.')}});return storageQueue
};
flushBeforeLeave=function(){
 if(!historyReady||!preferences.autosave)return true;if(actionDepth||loadingPage||historyRestoring||cropSession){markAutosaveDirty();return false}commitHistory();if(autosaveRevision===lastSavedRevision)return true;
 markAutosaveDirty();const payload=encodeMemory(fullPayload(true));if(payload.length<1500000)try{const saved=new Date().toISOString();localStorage.setItem(MEMORY_KEY,JSON.stringify({version:2,saved,project:payload,pendingDatabase:true}));lastSavedRevision=autosaveRevision;persistProject();return true}catch(error){}persistProject();return false
};

function collectAssetIdsFromObjects(objects,ids){for(const object of objects||[]){if(object.assetId)ids.add(object.assetId);const backup=object.colorizerBackup;if(backup?.baseAssetId)ids.add(backup.baseAssetId);if(backup?.sourceDescriptors)collectAssetIdsFromObjects(backup.sourceDescriptors,ids);if(object.children)collectAssetIdsFromObjects(object.children,ids)}}
function expandDerivedAssetDependencies(ids,assets){const pending=[...ids],seen=new Set();while(pending.length){const id=pending.pop();if(seen.has(id))continue;seen.add(id);const meta=assets?.[id]?.meta?.colorizer,before=ids.size;if(meta?.baseAssetId)ids.add(meta.baseAssetId);if(meta?.sourceDescriptors)collectAssetIdsFromObjects(meta.sourceDescriptors,ids);if(ids.size!==before)for(const value of ids)if(!seen.has(value))pending.push(value)}return ids}
function collectPayloadAssetIds(payload,includeHistory=true){const ids=new Set();for(const pages of Object.values(payload?.pages||{}))for(const page of pages)collectAssetIdsFromObjects(page.objects,ids);if(includeHistory)for(const entry of payload?.history?.entries||[])for(const pages of Object.values(entry.pages||{}))for(const page of pages)collectAssetIdsFromObjects(page.objects,ids);return expandDerivedAssetDependencies(ids,payload?.assets)}
function prunePayloadAssets(payload){if(!payload?.assets)return 0;const keep=collectPayloadAssetIds(payload,true);let removed=0;for(const id of Object.keys(payload.assets))if(!keep.has(id)){delete payload.assets[id];removed++}return removed}
function pruneUnreachableAssets(){
 if(typeof colorizerSession!=='undefined'&&colorizerSession?.busy)return 0;
 saveActivePage();let removed=0;const current=activeProject();if(current){const keep=new Set();for(const pages of Object.values(state.pages))for(const page of pages)collectAssetIdsFromObjects(page.objects,keep);for(const entry of historyEntries)for(const pages of Object.values(entry.pages||{}))for(const page of pages)collectAssetIdsFromObjects(page.objects,keep);if(typeof colorizerSession!=='undefined'&&colorizerSession){if(colorizerSession.object?.assetId)keep.add(colorizerSession.object.assetId);if(colorizerSession.pendingAssetId)keep.add(colorizerSession.pendingAssetId);if(colorizerSession.meta?.baseAssetId)keep.add(colorizerSession.meta.baseAssetId);collectAssetIdsFromObjects(colorizerSession.meta?.sourceDescriptors,keep)}expandDerivedAssetDependencies(keep,state.assets);for(const id of Object.keys(state.assets))if(!keep.has(id)){delete state.assets[id];removed++}current.payload=projectSnapshotForWorkspace(true)}
 for(const record of projects)if(record!==current)removed+=prunePayloadAssets(record.payload);updateAssetCount();scheduleMemoryUpdate();return removed
}
const memoryTrimHistory=trimHistory;trimHistory=function(){const before=historyEntries.length;memoryTrimHistory();if(historyEntries.length<before)setTimeout(pruneUnreachableAssets,0)};
const memoryCommitHistory=commitHistory;commitHistory=function(){const truncated=historyCursor<historyEntries.length-1;memoryCommitHistory();if(truncated)setTimeout(pruneUnreachableAssets,0)};
const memoryCloseProject=closeProject;closeProject=async function(...args){const result=await memoryCloseProject(...args);pruneUnreachableAssets();autosaveRevision++;markAutosaveDirty();await persistProject();return result};
const memoryDeletePage=deleteCustomPage;deleteCustomPage=function(...args){const result=memoryDeletePage(...args);setTimeout(pruneUnreachableAssets,450);return result};

function dataUrlByteLength(url){if(typeof url!=='string')return 0;const comma=url.indexOf(',');if(comma<0)return new Blob([url]).size;const head=url.slice(0,comma),body=url.slice(comma+1);if(/;base64/i.test(head))return Math.max(0,Math.floor(body.length*3/4)-(body.endsWith('==')?2:body.endsWith('=')?1:0));try{return new Blob([decodeURIComponent(body)]).size}catch(error){return new Blob([body]).size}}
function formatBytes(bytes){if(!Number.isFinite(bytes))return'—';const units=['B','KB','MB','GB'];let value=Math.max(0,bytes),unit=0;while(value>=1024&&unit<units.length-1){value/=1024;unit++}return(value>=100||unit===0?value.toFixed(0):value>=10?value.toFixed(1):value.toFixed(2))+' '+units[unit]}
function imageElementSize(image){const element=image?.getElement?.()||image?._element;return{width:element?.naturalWidth||element?.videoWidth||element?.width||0,height:element?.naturalHeight||element?.videoHeight||element?.height||0}}
function updateSelectedImageInfo(){
 const image=selectedImage(),empty=$('imageInspectorEmpty'),data=$('imageInspectorData'),button=$('changeResolutionBtn');if(!image){empty.classList.remove('hidden');data.classList.add('hidden');button.classList.add('hidden');return}
 const asset=state.assets[image.assetId],size=imageElementSize(image),cropWidth=Math.min(size.width-(image.cropX||0),image.width||size.width),cropHeight=Math.min(size.height-(image.cropY||0),image.height||size.height),printWidth=Math.abs((image.width||cropWidth)*(image.scaleX||1))/PX_PER_MM,printHeight=Math.abs((image.height||cropHeight)*(image.scaleY||1))/PX_PER_MM,dpiX=cropWidth/Math.max(.001,printWidth/25.4),dpiY=cropHeight/Math.max(.001,printHeight/25.4),dpi=Math.min(dpiX,dpiY);
 if(asset){asset.meta??={};asset.meta.pixelWidth=size.width;asset.meta.pixelHeight=size.height;asset.meta.encodedBytes=dataUrlByteLength(asset.dataUrl)}
 $('imagePixelSize').textContent=size.width.toLocaleString('it-IT')+' × '+size.height.toLocaleString('it-IT')+' px';$('imageCropSize').textContent=Math.round(cropWidth).toLocaleString('it-IT')+' × '+Math.round(cropHeight).toLocaleString('it-IT')+' px';$('imageEncodedSize').textContent=formatBytes(asset?.meta?.encodedBytes||dataUrlByteLength(asset?.dataUrl));$('imageRamSize').textContent='~ '+formatBytes(size.width*size.height*4);$('imagePrintSize').textContent=printWidth.toFixed(1)+' × '+printHeight.toFixed(1)+' mm';$('imagePrintDpi').textContent=Math.round(dpi)+' DPI'+(dpi<150?' · bassa':dpi<250?' · discreta':' · buona');empty.classList.add('hidden');data.classList.remove('hidden');button.classList.remove('hidden')
}
function scheduleMemoryUpdate(){clearTimeout(memoryUpdateTimer);memoryUpdateTimer=setTimeout(updateMemoryFootprint,250)}
async function updateMemoryFootprint(){
 const all=new Map();for(const record of projects)for(const [id,asset] of Object.entries(record.payload?.assets||{}))all.set(record.id+':'+id,asset);for(const [id,asset] of Object.entries(state.assets||{}))all.set((activeProjectId||'active')+':'+id,asset);let bytes=0;for(const asset of all.values())bytes+=asset.meta?.encodedBytes||dataUrlByteLength(asset.dataUrl);
 const activeAssets=new Set();let decoded=0;const inspectObject=object=>{for(const child of object?.getObjects?.()||object?.children||[])inspectObject(child);if(!object?.assetId||activeAssets.has(object.assetId))return;const size=imageElementSize(object);if(size.width&&size.height){activeAssets.add(object.assetId);decoded+=size.width*size.height*4}};for(const object of canvas?.getObjects?.()||[])inspectObject(object);
 let storage='non disponibile';try{const estimate=await navigator.storage?.estimate?.();if(estimate)storage=formatBytes(estimate.usage)+' / '+formatBytes(estimate.quota)}catch(error){}
 const node=$('memoryFootprint');if(node)node.innerHTML='<strong>Carico chicCanva</strong><br>Asset nei progetti: '+formatBytes(bytes)+' · bitmap pagina attiva: ~'+formatBytes(decoded)+'<br>Spazio browser: '+storage
}

const memorySelectionChanged=selectionChanged;selectionChanged=function(){memorySelectionChanged();updateSelectedImageInfo();scheduleMemoryUpdate()};
const memoryInstantiateObject=instantiateObject;instantiateObject=async function(d,target=canvas){const object=await memoryInstantiateObject(d,target);if(object?.assetId){const asset=state.assets[object.assetId],size=imageElementSize(object);if(asset&&size.width&&size.height){asset.meta??={};asset.meta.pixelWidth=size.width;asset.meta.pixelHeight=size.height;asset.meta.encodedBytes??=dataUrlByteLength(asset.dataUrl)}}return object};

// Page descriptors and encoded assets remain available for history/export, while
// decoded Fabric bitmaps and filter caches from the page just left are released.
// loadPage clears the old canvas synchronously before its first await, therefore
// these runtime resources can be detached without touching the new page.
function releaseFabricPageRuntime(object){
 for(const child of object?.getObjects?.()||object?.children||[])releaseFabricPageRuntime(child);
 for(const key of ['_cacheCanvas','_filteredEl']){const surface=object?.[key];if(surface?.getContext){try{surface.getContext('2d')?.clearRect(0,0,surface.width||0,surface.height||0);surface.width=surface.height=1}catch(error){}}object[key]=null}
 const element=object?.getElement?.()||object?._element;if(element?.tagName==='IMG'){try{element.removeAttribute('src');element.src=''}catch(error){}}
}
const memoryPageLoadBase=loadPage;
loadPage=async function(page){
 const retired=canvas?.getObjects?.().filter(object=>!object.excludeProject)||[];
 const pending=memoryPageLoadBase(page);
 for(const object of retired)releaseFabricPageRuntime(object);
 scheduleMemoryUpdate();
 return pending
};

function openResolutionDialog(){const image=selectedImage();if(!image)return;resolutionTarget=image;const size=imageElementSize(image);$('resolutionScale').value='2';$('resolutionInfo').textContent='Immagine attuale: '+size.width.toLocaleString('it-IT')+' × '+size.height.toLocaleString('it-IT')+' px · RAM bitmap ~'+formatBytes(size.width*size.height*4)+'. La sostituzione riguarda solo questo oggetto.';syncResolutionPreview();$('resolutionDialog').showModal()}
function syncResolutionPreview(){if(!resolutionTarget)return;const size=imageElementSize(resolutionTarget),index=Number($('resolutionScale').value),factor=RESOLUTION_FACTORS[index],width=Math.max(1,Math.round(size.width*factor)),height=Math.max(1,Math.round(size.height*factor));$('resolutionScaleLabel').textContent=RESOLUTION_LABELS[index];$('resolutionPreview').textContent=width.toLocaleString('it-IT')+' × '+height.toLocaleString('it-IT')+' px · ~'+formatBytes(width*height*4)+' RAM'}
async function resizeSelectedImage(){
 const image=resolutionTarget;if(!image||!canvas.getObjects().includes(image)){$('resolutionDialog').close();return}const button=$('resolutionConfirm'),label=button.textContent,index=Number($('resolutionScale').value),factor=RESOLUTION_FACTORS[index],asset=state.assets[image.assetId],size=imageElementSize(image);button.disabled=true;button.innerHTML='<span class="spinner"></span> Elaborazione…';
 try{commitHistory();const sourceBlob=await fetch(asset.dataUrl).then(response=>response.blob()),width=Math.max(1,Math.round(size.width*factor)),height=Math.max(1,Math.round(size.height*factor)),bitmap=await createImageBitmap(sourceBlob,{resizeWidth:width,resizeHeight:height,resizeQuality:'high'}),surface=document.createElement('canvas');surface.width=width;surface.height=height;const context=surface.getContext('2d',{alpha:true});context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';context.drawImage(bitmap,0,0,width,height);bitmap.close?.();const output=await new Promise((resolve,reject)=>surface.toBlob(value=>value?resolve(value):reject(new Error('Immagine scalata non creata')),'image/png'));context.clearRect(0,0,width,height);surface.width=surface.height=1;const dataUrl=await dataUrlFromBlob(output),id=uid('asset'),oldWidth=image.width,oldHeight=image.height,oldScaleX=image.scaleX,oldScaleY=image.scaleY;state.assets[id]={...asset,id,dataUrl,originalDataUrl:dataUrl,mime:'image/png',name:(asset.name||'Immagine')+' · '+RESOLUTION_LABELS[index],kind:'resized',source:'Ridimensionamento locale',meta:{...(asset.meta||{}),derivedFrom:asset.id,pixelWidth:width,pixelHeight:height,encodedBytes:output.size,resolutionFactor:factor}};const element=new Image();element.src=dataUrl;await element.decode();image.setElement(element,{width:oldWidth*factor,height:oldHeight*factor});image.set({assetId:id,cropX:(image.cropX||0)*factor,cropY:(image.cropY||0)*factor,width:oldWidth*factor,height:oldHeight*factor,scaleX:oldScaleX/factor,scaleY:oldScaleY/factor,dirty:true});image.setCoords();canvas.setActiveObject(image);canvas.requestRenderAll();saveActivePage();scheduleCommit();scheduleAutosave();updateSelectedImageInfo();scheduleMemoryUpdate();$('resolutionDialog').close();toast('Risoluzione sostituita · dimensione sulla pagina invariata')}catch(error){console.error(error);toast('Cambio risoluzione non riuscito: '+(error.message||error))}finally{button.disabled=false;button.textContent=label;resolutionTarget=null}
}

function applyObjectLock(object,locked){object.chicLocked=locked;object.set({lockMovementX:locked,lockMovementY:locked,lockScalingX:locked,lockScalingY:locked,lockRotation:locked,lockSkewingX:locked,lockSkewingY:locked,hasControls:!locked});object.setCoords();object.chicLocked?object.upperCanvasEl?.classList?.add('object-locked'):null}
const memorySerializeObject=serializeObject;serializeObject=function(object){const data=memorySerializeObject(object);if(data&&object.chicLocked)data.locked=true;return data};
const memoryInstantiateLocked=instantiateObject;instantiateObject=async function(d,target=canvas){const object=await memoryInstantiateLocked(d,target);if(object&&d.locked)applyObjectLock(object,true);return object};
function toggleSelectedLock(){const object=canvas.getActiveObject();if(!object||object.type==='activeSelection'){toast('Seleziona un solo oggetto');return}applyObjectLock(object,!object.chicLocked);canvas.requestRenderAll();saveActivePage();scheduleCommit();toast(object.chicLocked?'Posizione fissata':'Oggetto sbloccato')}
function syncLockMenu(){const object=canvas.getActiveObject(),button=$('objectLockAction'),fit=$('objectMenu')?.querySelector('[data-action="fit"]');if(button)button.textContent=object?.chicLocked?'Sblocca posizione':'Fissa posizione';if(fit)fit.disabled=!!object?.chicLocked}

const memorySetRegionMode=setRegionMode;setRegionMode=function(active){
 if(active&&!state.regionMode){regionInteractionState=canvas.getObjects().filter(object=>!object.excludeProject).map(object=>({object,selectable:object.selectable,evented:object.evented}));canvas.discardActiveObject();for(const entry of regionInteractionState)entry.object.set({selectable:false,evented:false});canvas.selection=false;canvas.skipTargetFind=true}
 memorySetRegionMode(active);
 if(!active&&regionInteractionState){canvas.skipTargetFind=false;for(const entry of regionInteractionState)if(canvas.getObjects().includes(entry.object))entry.object.set({selectable:entry.selectable,evented:entry.evented});regionInteractionState=null;canvas.selection=state.selectionMode;canvas.requestRenderAll()}
};

function showLongPressObjectMenu(event){const target=canvas.findTarget(event,true);if(!target||target.excludeProject)return;if(!selectionObjects().includes(target))canvas.setActiveObject(target);canvas.requestRenderAll();const image=!!selectedImage();document.querySelectorAll('#objectMenu [data-image]').forEach(button=>button.disabled=!image);syncLockMenu();const menu=$('objectMenu');menu.classList.remove('hidden');menu.style.left=Math.max(8,Math.min(event.clientX,innerWidth-220))+'px';menu.style.top=Math.max(8,Math.min(event.clientY,innerHeight-menu.offsetHeight-8))+'px';navigator.vibrate?.(25)}
function cancelLongPress(){clearTimeout(longPressTimer);longPressTimer=0;longPressStart=null}

// Run desktop inference in a disposable worker too: model files stay in Cache API, tensors leave RAM.
async function runBackgroundWorker(blob,device,status,model){const moduleSource=loadBackgroundModule.toString(),workerCode=`let backgroundModulePromise=null;const BG_CACHE=${JSON.stringify(BG_CACHE)};globalThis.__chicBgFetch=async function(input,options={}){const url=new URL(String(input));let cache=null;try{if('caches' in globalThis)cache=await caches.open(BG_CACHE);const hit=cache&&await cache.match(url.href);if(hit)return hit}catch(error){}const response=await fetch(input,{...options,cache:'no-store'});if(response.ok&&cache)try{await cache.put(url.href,response.clone())}catch(error){}return response};${moduleSource};self.onmessage=async event=>{try{const data=event.data,mod=await loadBackgroundModule(),output=await mod.removeBackground(new Blob([data.buffer],{type:data.mime||'image/png'}),{proxyToWorker:false,model:data.model,device:data.device,progress:(key,current,total)=>self.postMessage({type:'progress',key,current,total}),output:{format:'image/png',quality:1}}),buffer=await output.arrayBuffer();self.postMessage({type:'result',buffer,mime:output.type||'image/png'},[buffer])}catch(error){self.postMessage({type:'error',message:error?.message||String(error)})}};`,workerUrl=URL.createObjectURL(new Blob([workerCode],{type:'text/javascript'})),worker=new Worker(workerUrl),input=await blob.arrayBuffer();try{return await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('Elaborazione scaduta')),300000);worker.onmessage=event=>{const data=event.data;if(data.type==='progress'){status.textContent='AI '+(device==='gpu'?'WebGPU':'CPU')+' · '+data.key+' '+(data.total?Math.round(data.current/data.total*100)+'%':'');return}clearTimeout(timeout);data.type==='result'?resolve(new Blob([data.buffer],{type:data.mime})):reject(new Error(data.message||'Worker non riuscito'))};worker.onerror=event=>{clearTimeout(timeout);reject(new Error(event.message||'Worker non disponibile'))};worker.postMessage({buffer:input,mime:blob.type,device,model},[input])})}finally{worker.terminate();URL.revokeObjectURL(workerUrl);status.textContent='Elaborazione conclusa · modello rimosso dalla RAM e conservato nella cache.'}}
performAiBackgroundRemoval=async function(blob,status){const mobile=mobileBackgroundMode(),model=mobile?'isnet_quint8':preferences.model;let used=await selectedBgDevice(),fallback=false,out;try{out=await runBackgroundWorker(blob,used,status,model)}catch(error){if(used!=='gpu')throw error;fallback=true;used='cpu';status.textContent='WebGPU non riuscito: nuovo tentativo su CPU…';out=await runBackgroundWorker(blob,'cpu',status,model)}backgroundModulePromise=null;for(const name of ['__outlineOrtUrl','__chicGpuUrl'])if(globalThis[name]){URL.revokeObjectURL(globalThis[name]);globalThis[name]=null}return{out,used,fallback,model,mobile}}

function bindMemoryOptimizations(){
 $('changeResolutionBtn').onclick=openResolutionDialog;$('resolutionScale').oninput=syncResolutionPreview;$('resolutionCancel').onclick=()=>{$('resolutionDialog').close();resolutionTarget=null};$('resolutionConfirm').onclick=resizeSelectedImage;
 const lock=$('objectLockAction');if(lock)lock.onclick=()=>{hideContext();toggleSelectedLock()};
 canvas.upperCanvasEl.addEventListener('contextmenu',()=>setTimeout(syncLockMenu,0));
 canvas.upperCanvasEl.addEventListener('pointerdown',event=>{if(event.pointerType!=='touch'||state.regionMode||cropSession)return;cancelLongPress();longPressStart={x:event.clientX,y:event.clientY,event};longPressTimer=setTimeout(()=>{const saved=longPressStart;cancelLongPress();if(saved)showLongPressObjectMenu(saved.event)},1400)},{passive:true});
 canvas.upperCanvasEl.addEventListener('pointermove',event=>{if(longPressStart&&Math.hypot(event.clientX-longPressStart.x,event.clientY-longPressStart.y)>12)cancelLongPress()},{passive:true});canvas.upperCanvasEl.addEventListener('pointerup',cancelLongPress,{passive:true});canvas.upperCanvasEl.addEventListener('pointercancel',cancelLongPress,{passive:true});$('stageWrap').addEventListener('scroll',cancelLongPress,{passive:true});
 const deleteButton=$('deleteTool'),deleteAction=deleteButton.onclick;deleteButton.onclick=event=>{deleteAction.call(deleteButton,event);setTimeout(()=>{pruneUnreachableAssets();scheduleMemoryUpdate()},450)};
 canvas.on('object:modified',()=>{updateSelectedImageInfo();scheduleMemoryUpdate()});updateSelectedImageInfo();scheduleMemoryUpdate();
 $('bgCacheStatus').textContent=mobileBackgroundMode()?'Modalità mobile: modello piccolo in un processo isolato; al termine la RAM viene liberata e i file restano nella cache.':'Il modello viene caricato dalla cache in un processo isolato e rimosso dalla RAM al termine.'
}
const memoryBaseInit=init;init=async function(){await memoryBaseInit();bindMemoryOptimizations()};
