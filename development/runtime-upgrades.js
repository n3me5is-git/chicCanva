// Touch viewport gestures, Puter account controls, and gated Puter actions.
let puterAuthBusy=false;
let canvasTouchGestureBlockedState=false,canvasTouchGestureSuppressUntil=0;
function canvasTouchGestureBlocked(){return canvasTouchGestureBlockedState||Date.now()<canvasTouchGestureSuppressUntil}
function announceCanvasPinchStart(){if(canvasTouchGestureBlockedState)return;canvasTouchGestureBlockedState=true;if(typeof cancelActiveTransform==='function')cancelActiveTransform();document.dispatchEvent(new CustomEvent('chiccanvas:pinchstart'))}
function canvasTouchUiActive(){return innerWidth<=1024&&((typeof matchMedia==='function'&&matchMedia('(pointer: coarse)').matches)||navigator.maxTouchPoints>0)}
function touchControlProfile(active=canvasTouchUiActive()){return active?{cornerSize:18,touchCornerSize:40,borderScaleFactor:1.6,padding:3}:{cornerSize:13,touchCornerSize:24,borderScaleFactor:1,padding:0}}
function applyTouchControlProfile(object){if(!object||!canvasTouchUiActive())return object;const profile=touchControlProfile(true);object.set({cornerSize:profile.cornerSize,touchCornerSize:profile.touchCornerSize,padding:Math.max(Number(object.padding)||0,profile.padding),transparentCorners:false,cornerStyle:'circle',borderScaleFactor:Math.max(Number(object.borderScaleFactor)||1,profile.borderScaleFactor)});return object}
function setupTouchCanvasControls(){
 if(!canvasTouchUiActive())return;
 Object.assign(fabric.Object.prototype,touchControlProfile(true),{transparentCorners:false,cornerStyle:'circle'});
 canvas.selectionLineWidth=2;canvas.selectionDashArray=[7,4];canvas.getObjects().forEach(applyTouchControlProfile);
 canvas.on('object:added',event=>applyTouchControlProfile(event.target));
}
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
function canvasRenderScale(logicalWidth,logicalHeight){const pixels=canvasTouchUiActive()?5000000:10000000,dpr=Math.max(1,window.devicePixelRatio||1),wanted=dpr*Math.max(1,viewZoom);return Math.max(1,Math.min(wanted,Math.sqrt(pixels/Math.max(1,logicalWidth*logicalHeight))))}
function applySettledCanvasRaster(logicalWidth,logicalHeight,force=false){
 if(!canvas.__chicRetinaPatched){canvas.__chicRetinaPatched=true;canvas.__chicRenderScale=1;canvas.getRetinaScaling=()=>canvas.enableRetinaScaling?canvas.__chicRenderScale:1;canvas._isRetinaScaling=()=>canvas.enableRetinaScaling&&canvas.getRetinaScaling()>1;canvas._initRetinaScaling=function(){const ratio=this.getRetinaScaling(),resize=(element,context)=>{if(!element||!context)return;element.setAttribute('width',Math.round(this.width*ratio));element.setAttribute('height',Math.round(this.height*ratio));context.scale(ratio,ratio)};resize(this.lowerCanvasEl,this.contextContainer);resize(this.upperCanvasEl,this.contextTop)}}
 const scale=canvasRenderScale(logicalWidth,logicalHeight),changed=Math.abs((canvas.__chicRenderScale||1)-scale)>.04;
 canvas.__chicRenderScale=scale;
 if(force||changed||canvas.getWidth()!==logicalWidth||canvas.getHeight()!==logicalHeight){canvas.setDimensions({width:logicalWidth,height:logicalHeight});const expectedWidth=Math.round(logicalWidth*scale),expectedHeight=Math.round(logicalHeight*scale);if((canvas.lowerCanvasEl.width!==expectedWidth||canvas.lowerCanvasEl.height!==expectedHeight)&&canvas._initRetinaScaling)canvas._initRetinaScaling()}
}
let sidebarViewportFrame=0,sidebarViewportOptions=null,sidebarResizeZoomMode=null,canvasViewportTransitionDepth=0,canvasViewportTransitionZoomMode=null,canvasViewportTransitionFrame=0,canvasViewportTransitionTimer=0,canvasViewportTransitionForceRaster=false,canvasViewportLastWidth=0,canvasViewportLastHeight=0;
function canvasFitZoom(){
 if(!currentPage)return null;const wrap=$('stageWrap'),logicalWidth=currentPage.widthMm*PX_PER_MM,logicalHeight=currentPage.heightMm*PX_PER_MM;
 return zoomMode==='fit'?Math.min((wrap.clientWidth-48)/logicalWidth,(wrap.clientHeight-64)/logicalHeight):Number(zoomMode)
}
function applySidebarViewportPreview(){
 sidebarViewportFrame=0;if(!sidebarViewportOptions||!currentPage)return;const options=sidebarViewportOptions;sidebarViewportOptions=null;layoutCanvasViewport(canvasFitZoom(),options)
}
function beginCanvasViewportTransition(){
 if(canvasViewportTransitionDepth++===0){canvasViewportTransitionForceRaster=true;canvasViewportTransitionZoomMode=zoomMode;clearTimeout(canvasViewportTransitionTimer);canvasViewportTransitionTimer=0;if(canvasViewportTransitionFrame){cancelAnimationFrame(canvasViewportTransitionFrame);canvasViewportTransitionFrame=0}$('stageWrap')?.classList.add('viewport-settling')}
}
function settleCanvasViewportTransition(){
 canvasViewportTransitionFrame=0;if(canvasViewportTransitionDepth||!currentPage)return;const preserved=canvasViewportTransitionZoomMode??zoomMode,forceRaster=canvasViewportTransitionForceRaster;canvasViewportTransitionZoomMode=null;canvasViewportTransitionForceRaster=false;zoomMode=preserved;$('stageWrap')?.classList.remove('viewport-settling');fitStageZoom({forceRaster,preserve:false})
}
function scheduleCanvasViewportLayout(){
 if(!currentPage)return;const wrap=$('stageWrap');if(!canvasViewportTransitionDepth&&!canvasViewportTransitionForceRaster&&wrap.clientWidth===canvasViewportLastWidth&&wrap.clientHeight===canvasViewportLastHeight)return;if(canvasViewportTransitionZoomMode===null)canvasViewportTransitionZoomMode=zoomMode;zoomMode=canvasViewportTransitionZoomMode;
 if(canvasViewportTransitionDepth){fitStageZoom({light:true,preserve:false});return}
 if(canvasViewportTransitionFrame){cancelAnimationFrame(canvasViewportTransitionFrame);canvasViewportTransitionFrame=0}clearTimeout(canvasViewportTransitionTimer);
 fitStageZoom({light:true,preserve:false});canvasViewportTransitionTimer=setTimeout(()=>{canvasViewportTransitionTimer=0;canvasViewportTransitionFrame=requestAnimationFrame(()=>{canvasViewportTransitionFrame=requestAnimationFrame(settleCanvasViewportTransition)})},50)
}
function finishCanvasViewportTransition(){
 if(canvasViewportTransitionDepth<=0)return;canvasViewportTransitionDepth--;if(!canvasViewportTransitionDepth)scheduleCanvasViewportLayout()
}
const stableViewportSetZoom=setZoom;setZoom=function(value){canvasViewportTransitionZoomMode=value;const result=stableViewportSetZoom(value);if(!canvasViewportTransitionDepth)canvasViewportTransitionZoomMode=null;return result};
function layoutCanvasViewport(nextZoom,{light=false,preserve=true,forceRaster=false}={}){
 if(!currentPage)return;const wrap=$('stageWrap'),space=$('stageSpace'),shell=$('canvasShell'),logicalWidth=Math.round(currentPage.widthMm*PX_PER_MM),logicalHeight=Math.round(currentPage.heightMm*PX_PER_MM),anchor=preserve&&zoomMode!=='fit'?canvasViewportAnchor():null;
 viewZoom=clamp(nextZoom,.05,6);const displayWidth=logicalWidth*viewZoom,displayHeight=logicalHeight*viewZoom,isFit=zoomMode==='fit',padX=isFit?24:Math.max(96,wrap.clientWidth),padY=isFit?32:Math.max(96,wrap.clientHeight),spaceWidth=isFit?Math.max(wrap.clientWidth,displayWidth+padX*2):displayWidth+padX*2,spaceHeight=isFit?Math.max(wrap.clientHeight,displayHeight+padY*2):displayHeight+padY*2,left=isFit?(spaceWidth-displayWidth)/2:padX,top=isFit?(spaceHeight-displayHeight)/2:padY;
 if(light){const settled=Math.max(.001,canvas.__chicCssZoom||viewZoom),ratio=viewZoom/settled;shell.style.setProperty('--pinch-scale',String(ratio));Object.assign(shell.style,{left:left+'px',top:top+'px'});space.style.width=spaceWidth+'px';space.style.height=spaceHeight+'px'}else{applySettledCanvasRaster(logicalWidth,logicalHeight,forceRaster);canvas.__chicCssZoom=viewZoom;shell.style.setProperty('--pinch-scale','1');canvas.setDimensions({width:displayWidth+'px',height:displayHeight+'px'},{cssOnly:true});space.style.width=spaceWidth+'px';space.style.height=spaceHeight+'px';Object.assign(shell.style,{width:displayWidth+'px',height:displayHeight+'px',left:left+'px',top:top+'px'});applyGrid()}
 updateZoomControl();
 if(isFit){wrap.scrollLeft=0;wrap.scrollTop=0}else if(anchor){wrap.scrollLeft=left+anchor.x*viewZoom-wrap.clientWidth/2;wrap.scrollTop=top+anchor.y*viewZoom-wrap.clientHeight/2}
 if(!light){canvasViewportLastWidth=wrap.clientWidth;canvasViewportLastHeight=wrap.clientHeight;canvas.calcOffset();canvas.getObjects().forEach(object=>object.setCoords?.());exportRegion?.setCoords?.();cropSession?.rect?.setCoords?.();canvas.requestRenderAll()}
}
fitStageZoom=function(options={}){
 if(!currentPage)return;
 if(canvasViewportTransitionDepth&&!options.forceRaster){if(canvasViewportTransitionZoomMode!==null)zoomMode=canvasViewportTransitionZoomMode;layoutCanvasViewport(canvasFitZoom(),{...options,light:true,preserve:false});return}
 if(resizingSidebar&&!options.forceRaster){sidebarViewportOptions={...options,light:true,preserve:false};if(!sidebarViewportFrame)sidebarViewportFrame=requestAnimationFrame(applySidebarViewportPreview);return}
 layoutCanvasViewport(canvasFitZoom(),options)
};
function bindStableSidebarResize(){
 const resizer=$('resizer'),wrap=$('stageWrap'),toolbar=document.querySelector('.workspace>.toolbar'),sidebarToggle=$('toggleSidebarBtn');if(!resizer||!wrap)return;
 if(sidebarToggle?.onclick){const toggleSidebar=sidebarToggle.onclick;sidebarToggle.onclick=function(...args){const preservedZoomMode=zoomMode,result=toggleSidebar.apply(this,args);zoomMode=preservedZoomMode;updateZoomControl();return result}}
 resizer.addEventListener('pointerdown',()=>{sidebarResizeZoomMode=zoomMode;wrap.classList.add('sidebar-resizing')});
 window.addEventListener('pointermove',()=>{if(!wrap.classList.contains('sidebar-resizing')||sidebarResizeZoomMode===null)return;zoomMode=sidebarResizeZoomMode;fitStageZoom()});
 const settle=()=>{if(!wrap.classList.contains('sidebar-resizing'))return;resizingSidebar=false;wrap.classList.remove('sidebar-resizing');if(sidebarViewportFrame){cancelAnimationFrame(sidebarViewportFrame);sidebarViewportFrame=0}sidebarViewportOptions=null;if(sidebarResizeZoomMode!==null)zoomMode=sidebarResizeZoomMode;sidebarResizeZoomMode=null;fitStageZoom({forceRaster:true,preserve:false})};
 window.addEventListener('pointerup',settle);window.addEventListener('pointercancel',settle);window.addEventListener('blur',settle);resizer.addEventListener('lostpointercapture',settle);
 toolbar?.addEventListener('wheel',event=>{if(event.ctrlKey||event.metaKey||toolbar.scrollWidth<=toolbar.clientWidth)return;const delta=Math.abs(event.deltaY)>=Math.abs(event.deltaX)?event.deltaY:event.deltaX;if(!delta)return;const before=toolbar.scrollLeft;toolbar.scrollLeft+=delta;if(toolbar.scrollLeft!==before)event.preventDefault()},{passive:false})
}
function pinchViewport(start,pointA,pointB){const distance=Math.max(1,Math.hypot(pointB.x-pointA.x,pointB.y-pointA.y)),mid={x:(pointA.x+pointB.x)/2,y:(pointA.y+pointB.y)/2};return{zoom:clamp(start.zoom*distance/start.distance,.05,6),mid}}
function bindPinchZoom(){
 const wrap=$('stageWrap'),touches=new Map();let pinch=null,raf=0,latest=null,blocked=false,previousInteraction=null,selectionBeforeGesture=null;
 const point=event=>({x:event.clientX,y:event.clientY});const pair=()=>[...touches.values()].slice(0,2);const distance=(a,b)=>Math.max(1,Math.hypot(b.x-a.x,b.y-a.y));const midpoint=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
 const shellOffset=()=>({x:parseFloat($('canvasShell').style.left)||0,y:parseFloat($('canvasShell').style.top)||0});
 const activeObjects=()=>{const active=canvas.getActiveObject();return active?(active.type==='activeSelection'?active.getObjects().slice():[active]):[]};
 const restoreSelection=()=>{canvas.discardActiveObject();const objects=(selectionBeforeGesture||[]).filter(object=>canvas.getObjects().includes(object));if(objects.length===1)canvas.setActiveObject(objects[0]);else if(objects.length>1)canvas.setActiveObject(new fabric.ActiveSelection(objects,{canvas}));selectionBeforeGesture=null};
 const swallow=event=>{event.preventDefault();event.stopImmediatePropagation()};
 const begin=()=>{const [a,b]=pair(),mid=midpoint(a,b),rect=wrap.getBoundingClientRect(),shell=shellOffset();pinch={zoom:viewZoom,distance:distance(a,b),localX:(wrap.scrollLeft+mid.x-rect.left-shell.x)/viewZoom,localY:(wrap.scrollTop+mid.y-rect.top-shell.y)/viewZoom};blocked=true;previousInteraction={skip:canvas.skipTargetFind,selection:canvas.selection};announceCanvasPinchStart();canvas._currentTransform=null;canvas.discardActiveObject();canvas.skipTargetFind=true;canvas.selection=false;canvas.requestRenderAll();wrap.classList.add('pinching')};
 const apply=()=>{raf=0;if(!pinch||!latest)return;const view=pinchViewport(pinch,latest[0],latest[1]),rect=wrap.getBoundingClientRect();zoomMode=String(view.zoom);fitStageZoom({light:true,preserve:false});const shell=shellOffset();wrap.scrollLeft=shell.x+pinch.localX*view.zoom-(view.mid.x-rect.left);wrap.scrollTop=shell.y+pinch.localY*view.zoom-(view.mid.y-rect.top);latest=null};
 wrap.addEventListener('pointerdown',event=>{if(event.pointerType!=='touch')return;if(!touches.size)selectionBeforeGesture=activeObjects();touches.set(event.pointerId,point(event));if(touches.size===2){swallow(event);begin();try{wrap.setPointerCapture(event.pointerId)}catch(error){}}else if(blocked)swallow(event)},true);
 wrap.addEventListener('pointermove',event=>{if(event.pointerType!=='touch'||!touches.has(event.pointerId))return;touches.set(event.pointerId,point(event));if(pinch&&touches.size>=2){swallow(event);latest=pair();if(!raf)raf=requestAnimationFrame(apply)}else if(blocked)swallow(event)},true);
 const finish=event=>{if(event.pointerType!=='touch')return;const wasBlocked=blocked;if(wasBlocked)swallow(event);touches.delete(event.pointerId);if(pinch&&touches.size<2){if(raf){cancelAnimationFrame(raf);apply()}pinch=null}if(wasBlocked&&touches.size===0){wrap.classList.remove('pinching');canvas.skipTargetFind=previousInteraction?.skip??panMode;canvas.selection=previousInteraction?.selection??(!panMode&&state.selectionMode);previousInteraction=null;restoreSelection();fitStageZoom({forceRaster:true});canvasTouchGestureSuppressUntil=Date.now()+350;canvasTouchGestureBlockedState=false;blocked=false;canvas.requestRenderAll();document.dispatchEvent(new CustomEvent('chiccanvas:pinchend'))}else if(!wasBlocked&&touches.size===0)selectionBeforeGesture=null};
 wrap.addEventListener('pointerup',finish,true);wrap.addEventListener('pointercancel',finish,true);wrap.style.touchAction='none'
 wrap.addEventListener('click',event=>{if(Date.now()<canvasTouchGestureSuppressUntil)swallow(event)},true)
}
const runtimeBaseInit=init;init=async function(){await runtimeBaseInit();setupTouchCanvasControls();bindPuterAuth();bindPinchZoom();bindStableSidebarResize()};
