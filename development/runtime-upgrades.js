// Touch viewport gestures, Puter account controls, and gated Puter actions.
let puterAuthBusy=false;
function puterSignedIn(){try{return !!window.puter?.auth?.isSignedIn?.()}catch(error){return false}}
function puterFetchControls(){return[$('imageUrlUsePuter'),$('clipartUsePuter')].filter(Boolean)}
function syncPuterFetchControls(signed=puterSignedIn()){
 const unavailable=location.protocol==='file:'||!signed;
 for(const input of puterFetchControls()){input.disabled=unavailable;if(unavailable)input.checked=false;input.closest('label')?.classList.toggle('puter-option-disabled',unavailable)}
 const clipartButton=$('clipartInsertPuterBtn');if(clipartButton)clipartButton.disabled=unavailable;
 for(const hint of document.querySelectorAll('[data-puter-login-hint]'))hint.classList.toggle('hidden',!unavailable||location.protocol==='file:')
 renderClipartResults?.()
}
function openPuterLoginSection(source){
 const dialog=source?.closest?.('dialog');if(dialog?.open)dialog.close();
 if(!state.sidebar.open){state.sidebar.open=true;$('layout').classList.remove('side-closed');$('toggleSidebarBtn').textContent='Chiudi pannello'}
 const card=$('aiCard'),cards=[...$('sidebar').querySelectorAll(':scope > .card')].filter(item=>item.querySelector(':scope > .card-h'));
 if(preferences.accordion)cards.forEach(item=>item.classList.toggle('collapsed',item!==card));card.classList.remove('collapsed');card.querySelector(':scope > .card-h')?.setAttribute('aria-expanded','true');card.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>$('puterLoginBtn')?.focus(),350)
}
async function refreshPuterAuthUI(loadSdk=false){
 const file=location.protocol==='file:',gate=$('puterAuthGate'),account=$('puterAccountBar'),controls=$('puterControls');
 if(file){gate?.classList.add('hidden');account?.classList.add('hidden');controls?.classList.add('hidden');$('puterUsage')?.classList.add('hidden');syncPuterFetchControls(false);return false}
 if(loadSdk){try{await ensurePuter()}catch(error){gate?.classList.remove('hidden');account?.classList.add('hidden');controls?.classList.add('hidden');if($('puterAuthGateStatus'))$('puterAuthGateStatus').textContent=error.message||String(error);syncPuterFetchControls(false);return false}}
 const signed=puterSignedIn();gate?.classList.toggle('hidden',signed);account?.classList.toggle('hidden',!signed);controls?.classList.toggle('hidden',!signed);syncPuterFetchControls(signed);
 if(!signed){$('puterUsage')?.classList.add('hidden');return false}
 try{const user=await puter.auth.getUser?.();$('puterAccountName').textContent=user?.username||user?.email||'Account Puter'}catch(error){$('puterAccountName').textContent='Account Puter'}
 refreshPuterUsage?.(true);return true
}
async function performPuterLogin(options={}){
 if(puterAuthBusy)return false;puterAuthBusy=true;const status=$('puterLoginStatus');if(status)status.textContent='Apertura accesso Puter…';
 try{await ensurePuter();await puter.auth.signIn(options);const signed=await refreshPuterAuthUI(false);if(!signed)throw new Error('Accesso non completato');if(status)status.textContent='Accesso completato.';return true}
 catch(error){const message=error?.msg||error?.message||String(error);if(status)status.textContent='Accesso non completato: '+message;return false}
 finally{puterAuthBusy=false}
}
function closePuterLoginDialog(){const dialog=$('puterLoginDialog');if(dialog?.open)dialog.close()}
async function requirePuterSession(){
 if(location.protocol==='file:'){toast('Per usare la funzione apri l’app tramite webserver');return false}
 try{await ensurePuter()}catch(error){toast(error.message||String(error));return false}
 if(puterSignedIn()){await refreshPuterAuthUI(false);return true}
 syncPuterFetchControls(false);openPuterLoginSection();toast('Accedi con Puter dalla sezione AI');return false
}
function setupPuter(){const file=location.protocol==='file:';$('puterFileNotice').classList.toggle('hidden',!file);$('puterControls').classList.add('hidden');$('puterAuthGate')?.classList.toggle('hidden',file);$('puterAccountBar')?.classList.add('hidden');populateAiModels();syncAiQualityOptions();syncPuterFetchControls(false)}
function bindPuterAuth(){
 $('puterLoginBtn').onclick=async()=>{if(await performPuterLogin())await refreshPuterAuthUI(false)};
 $('puterDialogLoginBtn').onclick=async()=>{if(await performPuterLogin())closePuterLoginDialog()};$('puterDialogCancelBtn').onclick=closePuterLoginDialog;$('puterLoginDialog').oncancel=closePuterLoginDialog;
 $('puterLogoutBtn').onclick=async()=>{try{await Promise.resolve(puter.auth.signOut());await refreshPuterAuthUI(false);$('puterAuthGateStatus').textContent='Sessione chiusa. Accedi per usare nuovamente le funzioni Puter.'}catch(error){toast('Logout Puter non riuscito')}};
 $('puterSwitchAccountBtn').onclick=async()=>{if(await performPuterLogin({request_auth:true}))await refreshPuterAuthUI(false)};
 for(const link of document.querySelectorAll('[data-puter-login-link]'))link.onclick=event=>{event.preventDefault();openPuterLoginSection(event.currentTarget)};
 $('imageUrlUsePuter').addEventListener('change',()=>{if(!puterSignedIn())syncPuterFetchControls(false)});
 $('clipartUsePuter').addEventListener('change',()=>{if(!puterSignedIn())syncPuterFetchControls(false);else renderClipartResults()});
 window.addEventListener('focus',()=>refreshPuterAuthUI(false));refreshPuterAuthUI(true)
}
const puterAuthFetchImageFile=fetchImageFile;fetchImageFile=async function(address){if($('imageUrlUsePuter')?.checked&&!await requirePuterSession())throw new Error('Accesso Puter richiesto');return puterAuthFetchImageFile(address)};
const puterAuthInsertClipart=insertClipart;insertClipart=async function(item){if(!await requirePuterSession())return;return puterAuthInsertClipart(item)};
const puterAuthGenerateAi=generateAi;generateAi=async function(){if(!await requirePuterSession())return;return puterAuthGenerateAi()};
const puterAuthRefreshModels=refreshAiModels;refreshAiModels=async function(){if(!await requirePuterSession())return;return puterAuthRefreshModels()};

function canvasViewportAnchor(){
 const wrap=$('stageWrap'),shell=$('canvasShell'),left=parseFloat(shell.style.left)||0,top=parseFloat(shell.style.top)||0,zoom=Math.max(.001,viewZoom||1);
 return{x:(wrap.scrollLeft+wrap.clientWidth/2-left)/zoom,y:(wrap.scrollTop+wrap.clientHeight/2-top)/zoom}
}
function updateZoomControl(){
 $('zoomSelect').value=zoomMode;if(!$('zoomSelect').value){let option=$('zoomSelect').querySelector('[data-dynamic]');if(!option){option=document.createElement('option');option.dataset.dynamic='1';$('zoomSelect').append(option)}option.value=zoomMode;option.textContent=Math.round(viewZoom*100)+'%';$('zoomSelect').value=zoomMode}
}
function layoutCanvasViewport(nextZoom,{light=false,preserve=true,forceRaster=false}={}){
 if(!currentPage)return;const wrap=$('stageWrap'),space=$('stageSpace'),shell=$('canvasShell'),logicalWidth=Math.round(currentPage.widthMm*PX_PER_MM),logicalHeight=Math.round(currentPage.heightMm*PX_PER_MM),anchor=preserve&&zoomMode!=='fit'?canvasViewportAnchor():null;
 viewZoom=clamp(nextZoom,.05,6);const displayWidth=logicalWidth*viewZoom,displayHeight=logicalHeight*viewZoom,isFit=zoomMode==='fit',padX=isFit?24:Math.max(72,wrap.clientWidth*.75),padY=isFit?32:Math.max(72,wrap.clientHeight*.75),spaceWidth=isFit?Math.max(wrap.clientWidth,displayWidth+padX*2):displayWidth+padX*2,spaceHeight=isFit?Math.max(wrap.clientHeight,displayHeight+padY*2):displayHeight+padY*2,left=isFit?(spaceWidth-displayWidth)/2:padX,top=isFit?(spaceHeight-displayHeight)/2:padY;
 if(forceRaster||canvas.getWidth()!==logicalWidth||canvas.getHeight()!==logicalHeight)canvas.setDimensions({width:logicalWidth,height:logicalHeight});
 canvas.setDimensions({width:displayWidth+'px',height:displayHeight+'px'},{cssOnly:true});space.style.width=spaceWidth+'px';space.style.height=spaceHeight+'px';Object.assign(shell.style,{width:displayWidth+'px',height:displayHeight+'px',left:left+'px',top:top+'px'});applyGrid();updateZoomControl();
 if(isFit){wrap.scrollLeft=0;wrap.scrollTop=0}else if(anchor){wrap.scrollLeft=left+anchor.x*viewZoom-wrap.clientWidth/2;wrap.scrollTop=top+anchor.y*viewZoom-wrap.clientHeight/2}
 if(!light){canvas.calcOffset();canvas.requestRenderAll()}
}
fitStageZoom=function(options={}){
 if(!currentPage)return;const wrap=$('stageWrap'),logicalWidth=currentPage.widthMm*PX_PER_MM,logicalHeight=currentPage.heightMm*PX_PER_MM,nextZoom=zoomMode==='fit'?Math.min((wrap.clientWidth-48)/logicalWidth,(wrap.clientHeight-64)/logicalHeight):Number(zoomMode);layoutCanvasViewport(nextZoom,options)
};
function pinchViewport(start,pointA,pointB){const distance=Math.max(1,Math.hypot(pointB.x-pointA.x,pointB.y-pointA.y)),mid={x:(pointA.x+pointB.x)/2,y:(pointA.y+pointB.y)/2};return{zoom:clamp(start.zoom*distance/start.distance,.05,6),mid}}
function bindPinchZoom(){
 const wrap=$('stageWrap'),touches=new Map();let pinch=null,raf=0,latest=null,blocked=false,previousInteraction=null;
 const point=event=>({x:event.clientX,y:event.clientY});const pair=()=>[...touches.values()].slice(0,2);const distance=(a,b)=>Math.max(1,Math.hypot(b.x-a.x,b.y-a.y));const midpoint=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
 const shellOffset=()=>({x:parseFloat($('canvasShell').style.left)||0,y:parseFloat($('canvasShell').style.top)||0});
 const begin=()=>{const [a,b]=pair(),mid=midpoint(a,b),rect=wrap.getBoundingClientRect(),shell=shellOffset();pinch={zoom:viewZoom,distance:distance(a,b),localX:(wrap.scrollLeft+mid.x-rect.left-shell.x)/viewZoom,localY:(wrap.scrollTop+mid.y-rect.top-shell.y)/viewZoom};blocked=true;previousInteraction={skip:canvas.skipTargetFind,selection:canvas.selection};canvas.skipTargetFind=true;canvas.selection=false;wrap.classList.add('pinching')};
 const apply=()=>{raf=0;if(!pinch||!latest)return;const view=pinchViewport(pinch,latest[0],latest[1]),rect=wrap.getBoundingClientRect();zoomMode=String(view.zoom);fitStageZoom({light:true,preserve:false});const shell=shellOffset();wrap.scrollLeft=shell.x+pinch.localX*view.zoom-(view.mid.x-rect.left);wrap.scrollTop=shell.y+pinch.localY*view.zoom-(view.mid.y-rect.top);latest=null};
 wrap.addEventListener('pointerdown',event=>{if(event.pointerType!=='touch')return;touches.set(event.pointerId,point(event));if(touches.size===2){event.preventDefault();event.stopPropagation();begin();try{wrap.setPointerCapture(event.pointerId)}catch(error){}}},true);
 wrap.addEventListener('pointermove',event=>{if(event.pointerType!=='touch'||!touches.has(event.pointerId))return;touches.set(event.pointerId,point(event));if(pinch&&touches.size>=2){event.preventDefault();event.stopPropagation();latest=pair();if(!raf)raf=requestAnimationFrame(apply)}else if(blocked){event.preventDefault();event.stopPropagation()}},true);
 const finish=event=>{if(event.pointerType!=='touch')return;touches.delete(event.pointerId);if(pinch&&touches.size<2){if(raf){cancelAnimationFrame(raf);apply()}pinch=null}if(blocked&&touches.size===0){blocked=false;wrap.classList.remove('pinching');canvas.skipTargetFind=previousInteraction?.skip??panMode;canvas.selection=previousInteraction?.selection??(!panMode&&state.selectionMode);previousInteraction=null;fitStageZoom({forceRaster:true})}if(blocked){event.preventDefault();event.stopPropagation()}};
 wrap.addEventListener('pointerup',finish,true);wrap.addEventListener('pointercancel',finish,true);wrap.style.touchAction='none'
}
const runtimeBaseInit=init;init=async function(){await runtimeBaseInit();bindPuterAuth();bindPinchZoom()};
