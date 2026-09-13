// Magnetic alignment guides and reversible aspect-ratio constraints.
let alignmentGuideObjects=[],alignmentTransform=null,alignmentPointerModifiers={shift:false,alt:false},temporaryClassicSnap=null,snapMenuLongPress=0,snapMenuLongPressStart=null;
const GUIDE_COLOR='#d52c83',GUIDE_SPACING_COLOR='#168f83';

function ensureAlignmentState(){
 state.snap=state.snap||{};
 state.guideSnap={enabled:true,page:true,objects:true,spacing:true,...(state.guideSnap||{})};
 if(typeof state.aspectLock!=='boolean')state.aspectLock=false
}
function alignmentSetting(id){
 ensureAlignmentState();
 return{id:'',classic:!!state.snap.enabled,guides:!!state.guideSnap.enabled,page:!!state.guideSnap.page,objects:!!state.guideSnap.objects,spacing:!!state.guideSnap.spacing,aspect:!!state.aspectLock}[id]
}
function setAlignmentSetting(id,value){
 ensureAlignmentState();
 if(id==='classic')state.snap.enabled=value;
 else if(id==='guides')state.guideSnap.enabled=value;
 else if(id==='page')state.guideSnap.page=value;
 else if(id==='objects')state.guideSnap.objects=value;
 else if(id==='spacing')state.guideSnap.spacing=value;
 else if(id==='aspect')state.aspectLock=value;
 syncAlignmentUi();applyGrid();scheduleAutosave?.()
}
function syncAlignmentUi(){
 ensureAlignmentState();
 const map={guideSnapEnabled:'enabled',guideSnapPage:'page',guideSnapObjects:'objects',guideSnapSpacing:'spacing'};
 for(const[id,key]of Object.entries(map))if($(id))$(id).checked=!!state.guideSnap[key];
 if($('aspectRatioLock'))$('aspectRatioLock').checked=!!state.aspectLock;
 if($('guideSnapOptions'))$('guideSnapOptions').classList.toggle('disabled',!state.guideSnap.enabled);
 if($('snapTool')){$('snapTool').classList.toggle('active',!!state.snap.enabled);$('snapTool').classList.toggle('guide-active',!!state.guideSnap.enabled);$('snapTool').setAttribute('aria-pressed',String(!!state.snap.enabled||!!state.guideSnap.enabled))}
 for(const button of document.querySelectorAll('#snapOptionsMenu [data-snap-option]'))button.setAttribute('aria-checked',String(alignmentSetting(button.dataset.snapOption)))
}

function clearAlignmentGuides(){
 if(!alignmentGuideObjects.length)return;
 for(const line of alignmentGuideObjects)if(canvas.contains(line))canvas.remove(line);
 alignmentGuideObjects=[];canvas.requestRenderAll()
}
function alignmentLine(coords,color=GUIDE_COLOR,dash=[7,5]){
 const line=new fabric.Line(coords,{stroke:color,strokeWidth:1.5,strokeUniform:true,strokeDashArray:dash,selectable:false,evented:false,excludeFromExport:true,objectCaching:false});
 line.excludeProject=true;line.objectType='alignment-guide';alignmentGuideObjects.push(line);canvas.add(line);line.bringToFront();return line
}
function objectBounds(object){const r=object.getBoundingRect(true,true);return{left:r.left,top:r.top,right:r.left+r.width,bottom:r.top+r.height,width:r.width,height:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2}}
function movingSelectionMembers(target){return new Set(target?.type==='activeSelection'?(target.getObjects?.()||[]):[target])}
function nearestGuideCandidate(current,candidates,threshold){let best=null;for(const item of candidates){const delta=item.value-current;if(Math.abs(delta)<=threshold&&(!best||Math.abs(delta)<Math.abs(best.delta)))best={...item,delta}}return best}
function effectiveGuideSnap(event){const inverted=!!(event?.altKey||alignmentPointerModifiers.alt);return !!state.guideSnap.enabled!==inverted}
function effectiveClassicSnap(event){const both=!!(event?.altKey||alignmentPointerModifiers.alt)&&!!(event?.shiftKey||alignmentPointerModifiers.shift);return both?!state.snap.enabled:!!state.snap.enabled}
function transformCorner(options,target){return String(options?.transform?.corner||alignmentTransform?.corner||target?.__corner||'br')}
function oppositeOrigin(corner){return{tl:['right','bottom'],tr:['left','bottom'],bl:['right','top'],br:['left','top'],ml:['right','center'],mr:['left','center'],mt:['center','bottom'],mb:['center','top']}[corner]||['center','center']}
function transformAnchor(target,corner){const[originX,originY]=oppositeOrigin(corner);return{originX,originY,point:target.getPointByOrigin(originX,originY)}}
function restoreTransformAnchor(target,memory){if(memory?.anchor)target.setPositionByOrigin(memory.anchor.point,memory.anchor.originX,memory.anchor.originY)}
function guideCandidateObjects(target){const selected=movingSelectionMembers(target);return canvas.getObjects().filter(object=>object!==target&&!selected.has(object)&&object.visible!==false&&object!==exportRegion&&object.objectType!=='alignment-guide'&&(!object.excludeProject||object===cropSession?.target))}

function applyAlignmentGuides(options){
 const target=options.target;if(!target||target===exportRegion||loadingPage||(target.excludeProject&&target!==cropSession?.rect))return;
 const event=options.e||{},guidesOn=effectiveGuideSnap(event)&&!(event.altKey&&event.shiftKey||alignmentPointerModifiers.alt&&alignmentPointerModifiers.shift),classicOn=effectiveClassicSnap(event),spacing=Number(state.snap.spacingMm||5)*PX_PER_MM;
 if(classicOn&&temporaryClassicSnap===null&&!state.snap.enabled)target.set({left:Math.round(target.left/spacing)*spacing,top:Math.round(target.top/spacing)*spacing});
 clearAlignmentGuides();if(!guidesOn)return target.setCoords();
 target.setCoords();let bounds=objectBounds(target),dx=0,dy=0,bestX=null,bestY=null;const threshold=8/Math.max(.2,viewZoom||1),others=guideCandidateObjects(target);
 if(state.guideSnap.page){
  bestX=nearestGuideCandidate(bounds.cx,[{value:canvas.width/2,type:'page',axis:'x'}],threshold);
  bestY=nearestGuideCandidate(bounds.cy,[{value:canvas.height/2,type:'page',axis:'y'}],threshold)
 }
 if(state.guideSnap.objects&&others.length){
  const xCandidates=[],yCandidates=[];for(const object of others){const r=objectBounds(object);for(const value of [r.left,r.cx,r.right])xCandidates.push({value,type:'object',other:r,axis:'x'});for(const value of [r.top,r.cy,r.bottom])yCandidates.push({value,type:'object',other:r,axis:'y'})}
  for(const current of [bounds.left,bounds.cx,bounds.right]){const candidate=nearestGuideCandidate(current,xCandidates,threshold);if(candidate&&(!bestX||Math.abs(candidate.delta)<Math.abs(bestX.delta)))bestX=candidate}
  for(const current of [bounds.top,bounds.cy,bounds.bottom]){const candidate=nearestGuideCandidate(current,yCandidates,threshold);if(candidate&&(!bestY||Math.abs(candidate.delta)<Math.abs(bestY.delta)))bestY=candidate}
 }
 if(state.guideSnap.spacing&&others.length>1){
  const left=others.map(objectBounds).filter(r=>r.right<=bounds.left+threshold).sort((a,b)=>b.right-a.right)[0],right=others.map(objectBounds).filter(r=>r.left>=bounds.right-threshold).sort((a,b)=>a.left-b.left)[0];
  if(left&&right){const equalDelta=((right.left-bounds.right)-(bounds.left-left.right))/2;if(Math.abs(equalDelta)<=threshold&&(!bestX||Math.abs(equalDelta)<Math.abs(bestX.delta)))bestX={delta:equalDelta,type:'spacing',left,right,axis:'x'}}
  const above=others.map(objectBounds).filter(r=>r.bottom<=bounds.top+threshold).sort((a,b)=>b.bottom-a.bottom)[0],below=others.map(objectBounds).filter(r=>r.top>=bounds.bottom-threshold).sort((a,b)=>a.top-b.top)[0];
  if(above&&below){const equalDelta=((below.top-bounds.bottom)-(bounds.top-above.bottom))/2;if(Math.abs(equalDelta)<=threshold&&(!bestY||Math.abs(equalDelta)<Math.abs(bestY.delta)))bestY={delta:equalDelta,type:'spacing',above,below,axis:'y'}}
 }
 if(bestX){dx=bestX.delta;target.left+=dx}if(bestY){dy=bestY.delta;target.top+=dy}target.setCoords();bounds=objectBounds(target);
 if(bestX){if(bestX.type==='spacing'){const y=bounds.cy;alignmentLine([bestX.left.right,y,bounds.left,y],GUIDE_SPACING_COLOR,[3,4]);alignmentLine([bounds.right,y,bestX.right.left,y],GUIDE_SPACING_COLOR,[3,4])}else alignmentLine([bestX.value,0,bestX.value,canvas.height])}
 if(bestY){if(bestY.type==='spacing'){const x=bounds.cx;alignmentLine([x,bestY.above.bottom,x,bounds.top],GUIDE_SPACING_COLOR,[3,4]);alignmentLine([x,bounds.bottom,x,bestY.below.top],GUIDE_SPACING_COLOR,[3,4])}else alignmentLine([0,bestY.value,canvas.width,bestY.value])}
}

function aspectConstraintEnabled(options){const shift=!!(options?.e?.shiftKey||alignmentPointerModifiers.shift);return !!state.aspectLock!==shift}
function rememberAlignmentTransform(options){
 const target=options?.target,transform=options?.transform;if(!target||!transform)return;
 const corner=transform.corner||target.__corner||'br';alignmentTransform={target,scaleX:Number(transform.original?.scaleX??target.scaleX)||1,scaleY:Number(transform.original?.scaleY??target.scaleY)||1,action:transform.action||'',corner,anchor:transformAnchor(target,corner),original:{left:target.left,top:target.top,scaleX:target.scaleX,scaleY:target.scaleY,angle:target.angle,skewX:target.skewX,skewY:target.skewY,flipX:target.flipX,flipY:target.flipY}}
}
function constrainAspectRatio(options){
 const target=options.target;if(!target||!aspectConstraintEnabled(options))return;let memory=alignmentTransform;if(!memory||memory.target!==target){memory={target,scaleX:target.scaleX||1,scaleY:target.scaleY||1,action:options.transform?.action||'',corner:options.transform?.corner||target.__corner||''};alignmentTransform=memory}
 const fx=Math.abs((target.scaleX||1)/memory.scaleX),fy=Math.abs((target.scaleY||1)/memory.scaleY),action=String(options.transform?.action||memory.action||''),corner=String(options.transform?.corner||memory.corner||'');let factor;
 if(/x$/i.test(action)||['ml','mr'].includes(corner))factor=fx;else if(/y$/i.test(action)||['mt','mb'].includes(corner))factor=fy;else factor=Math.abs(Math.log(Math.max(fx,.0001)))>=Math.abs(Math.log(Math.max(fy,.0001)))?fx:fy;
 target.set({scaleX:Math.sign(target.scaleX||memory.scaleX)*Math.abs(memory.scaleX)*factor,scaleY:Math.sign(target.scaleY||memory.scaleY)*Math.abs(memory.scaleY)*factor});restoreTransformAnchor(target,memory);target.setCoords();if(target===cropSession?.rect)cropSession.syncPreview?.()
}

function resizeGuideValues(target){const valuesX=[],valuesY=[];if(state.guideSnap.page){valuesX.push({value:canvas.width/2,type:'page'});valuesY.push({value:canvas.height/2,type:'page'})}if(state.guideSnap.objects)for(const object of guideCandidateObjects(target)){const r=objectBounds(object);for(const value of [r.left,r.cx,r.right])valuesX.push({value,type:'object'});for(const value of [r.top,r.cy,r.bottom])valuesY.push({value,type:'object'})}return{valuesX,valuesY}}
function scalingDraggedPoint(bounds,corner){return{x:corner.includes('l')?bounds.left:corner.includes('r')?bounds.right:bounds.cx,y:corner.includes('t')?bounds.top:corner.includes('b')?bounds.bottom:bounds.cy}}
function applyResizeSnapping(options){
 const target=options?.target;if(!target||target===exportRegion||loadingPage||(target.excludeProject&&target!==cropSession?.rect))return;
 const event=options.e||{},classicOn=effectiveClassicSnap(event),guidesOn=effectiveGuideSnap(event)&&!(event.altKey&&event.shiftKey||alignmentPointerModifiers.alt&&alignmentPointerModifiers.shift);if(!classicOn&&!guidesOn){clearAlignmentGuides();return}
 let memory=alignmentTransform;if(!memory||memory.target!==target){rememberAlignmentTransform(options);memory=alignmentTransform}if(!memory)return;
 target.setCoords();const corner=transformCorner(options,target),bounds=objectBounds(target),drag=scalingDraggedPoint(bounds,corner),threshold=8/Math.max(.2,viewZoom||1),spacing=Math.max(1,Number(state.snap.spacingMm||5)*PX_PER_MM),candidates=resizeGuideValues(target);let snapX=null,snapY=null;
 if(classicOn){if(corner.includes('l')||corner.includes('r'))snapX={value:Math.round(drag.x/spacing)*spacing,type:'classic',delta:Math.round(drag.x/spacing)*spacing-drag.x};if(corner.includes('t')||corner.includes('b'))snapY={value:Math.round(drag.y/spacing)*spacing,type:'classic',delta:Math.round(drag.y/spacing)*spacing-drag.y}}
 if(guidesOn){if(corner.includes('l')||corner.includes('r')){const hit=nearestGuideCandidate(drag.x,candidates.valuesX,threshold);if(hit&&(!snapX||Math.abs(hit.delta)<Math.abs(snapX.delta)))snapX=hit}if(corner.includes('t')||corner.includes('b')){const hit=nearestGuideCandidate(drag.y,candidates.valuesY,threshold);if(hit&&(!snapY||Math.abs(hit.delta)<Math.abs(snapY.delta)))snapY=hit}}
 if(!snapX&&!snapY){clearAlignmentGuides();return}
 const lock=aspectConstraintEnabled(options),old=objectBounds(target),nextWidth=Math.max(2,old.width+(corner.includes('l')?-Number(snapX?.delta||0):Number(snapX?.delta||0))),nextHeight=Math.max(2,old.height+(corner.includes('t')?-Number(snapY?.delta||0):Number(snapY?.delta||0)));
 if(lock){let factor;if(snapX&&snapY)factor=Math.abs(nextWidth/old.width-1)>=Math.abs(nextHeight/old.height-1)?nextWidth/old.width:nextHeight/old.height;else factor=snapX?nextWidth/old.width:nextHeight/old.height;target.set({scaleX:target.scaleX*factor,scaleY:target.scaleY*factor})}else target.set({scaleX:snapX?target.scaleX*nextWidth/old.width:target.scaleX,scaleY:snapY?target.scaleY*nextHeight/old.height:target.scaleY});
 restoreTransformAnchor(target,memory);target.setCoords();clearAlignmentGuides();if(guidesOn){if(snapX&&snapX.type!=='classic')alignmentLine([snapX.value,0,snapX.value,canvas.height]);if(snapY&&snapY.type!=='classic')alignmentLine([0,snapY.value,canvas.width,snapY.value])}if(target===cropSession?.rect)cropSession.syncPreview?.()
}
function cancelActiveTransform(){const memory=alignmentTransform,target=memory?.target;if(!target)return false;target.set(memory.original);target.setCoords();if(target===cropSession?.rect)cropSession.syncPreview?.();canvas._currentTransform=null;canvas.discardActiveObject();canvas.setActiveObject(target);canvas.requestRenderAll();alignmentTransform=null;clearAlignmentGuides();return true}

function positionSnapOptionsMenu(x,y){const menu=$('snapOptionsMenu');syncAlignmentUi();menu.classList.remove('hidden');const width=menu.offsetWidth||230,height=menu.offsetHeight||280;menu.style.left=clamp(x,8,innerWidth-width-8)+'px';menu.style.top=clamp(y,8,innerHeight-height-8)+'px'}
function bindSnapOptionsMenu(){
 const button=$('snapTool'),menu=$('snapOptionsMenu');button.addEventListener('contextmenu',event=>{event.preventDefault();event.stopPropagation();positionSnapOptionsMenu(event.clientX,event.clientY)});
 menu.onclick=event=>{const option=event.target.closest('[data-snap-option]')?.dataset.snapOption;if(!option)return;setAlignmentSetting(option,!alignmentSetting(option));positionSnapOptionsMenu(parseFloat(menu.style.left)||8,parseFloat(menu.style.top)||8)};
 button.addEventListener('pointerdown',event=>{if(event.pointerType!=='touch')return;snapMenuLongPressStart={x:event.clientX,y:event.clientY};clearTimeout(snapMenuLongPress);snapMenuLongPress=setTimeout(()=>{positionSnapOptionsMenu(event.clientX,event.clientY);navigator.vibrate?.(25)},900)},{passive:true});button.addEventListener('pointermove',event=>{if(snapMenuLongPressStart&&Math.hypot(event.clientX-snapMenuLongPressStart.x,event.clientY-snapMenuLongPressStart.y)>12)clearTimeout(snapMenuLongPress)},{passive:true});for(const name of ['pointerup','pointercancel'])button.addEventListener(name,()=>{clearTimeout(snapMenuLongPress);snapMenuLongPressStart=null},{passive:true});document.addEventListener('pointerdown',event=>{if(!event.target.closest('#snapOptionsMenu,#snapTool'))menu.classList.add('hidden')})
}

function setupAlignmentGuides(){
 ensureAlignmentState();
 for(const id of ['guideSnapEnabled','guideSnapPage','guideSnapObjects','guideSnapSpacing','aspectRatioLock'])$(id).onchange=event=>setAlignmentSetting({guideSnapEnabled:'guides',guideSnapPage:'page',guideSnapObjects:'objects',guideSnapSpacing:'spacing',aspectRatioLock:'aspect'}[id],event.target.checked);
 const baseSnapClick=$('snapTool').onclick;$('snapTool').onclick=event=>{baseSnapClick?.call($('snapTool'),event);syncAlignmentUi();scheduleAutosave?.()};
 canvas.on('before:transform',rememberAlignmentTransform);canvas.on('object:scaling',options=>{constrainAspectRatio(options);applyResizeSnapping(options)});canvas.on('object:moving',applyAlignmentGuides);canvas.on('mouse:up',()=>{alignmentTransform=null;clearAlignmentGuides()});canvas.on('object:modified',clearAlignmentGuides);canvas.on('selection:cleared',clearAlignmentGuides);
 const upper=canvas.upperCanvasEl;upper.addEventListener('pointerdown',event=>{alignmentPointerModifiers={shift:event.shiftKey,alt:event.altKey};if(event.shiftKey&&event.altKey){temporaryClassicSnap=state.snap.enabled;state.snap.enabled=!state.snap.enabled}},true);const restore=()=>{if(temporaryClassicSnap!==null){state.snap.enabled=temporaryClassicSnap;temporaryClassicSnap=null;syncAlignmentUi()}alignmentPointerModifiers={shift:false,alt:false};clearAlignmentGuides()};window.addEventListener('pointerup',restore,true);window.addEventListener('pointercancel',restore,true);window.addEventListener('blur',restore);
 window.addEventListener('keydown',event=>{alignmentPointerModifiers.shift=event.shiftKey;alignmentPointerModifiers.alt=event.altKey},true);window.addEventListener('keyup',event=>{alignmentPointerModifiers.shift=event.shiftKey;alignmentPointerModifiers.alt=event.altKey},true);
 window.addEventListener('keydown',event=>{if(event.key!=='Escape')return;if(cancelActiveTransform()){event.preventDefault();event.stopImmediatePropagation();toast('Operazione annullata');return}if(shapeMode){event.preventDefault();cancelShapeDrawing();return}if(cropSession){event.preventDefault();cancelCrop();toast('Crop annullato')}},true);
 bindSnapOptionsMenu();syncAlignmentUi()
}
const alignmentSyncUi=syncUiFromState;syncUiFromState=function(){ensureAlignmentState();alignmentSyncUi();syncAlignmentUi()};
const alignmentBaseInit=init;init=async function(){await alignmentBaseInit();setupAlignmentGuides()};
