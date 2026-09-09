// Non-destructive crop workspace: a translucent full-source preview surrounds
// the sharp selected region. Reset restores source geometry without stretching.
function cropSourceGeometry(image){
 const element=image.getElement?.()||image._element,asset=state.assets[image.assetId],sourceWidth=Number(asset?.meta?.sourceWidth)||Number(element?.naturalWidth)||Number(element?.videoWidth)||Number(element?.width)||Number(image.width),sourceHeight=Number(asset?.meta?.sourceHeight)||Number(element?.naturalHeight)||Number(element?.videoHeight)||Number(element?.height)||Number(image.height),cropX=Number(image.cropX)||0,cropY=Number(image.cropY)||0,width=Number(image.width)||sourceWidth,height=Number(image.height)||sourceHeight;
 return{element,sourceWidth,sourceHeight,cropX,cropY,width,height}
}
function fullSourceCenter(image,geometry=cropSourceGeometry(image)){
 const currentCenter=image.getCenterPoint(),matrix=image.calcTransformMatrix(),dx=geometry.sourceWidth/2-(geometry.cropX+geometry.width/2),dy=geometry.sourceHeight/2-(geometry.cropY+geometry.height/2);
 return new fabric.Point(currentCenter.x+matrix[0]*dx+matrix[2]*dy,currentCenter.y+matrix[1]*dx+matrix[3]*dy)
}
function cropHelperCorners(rect){
 const matrix=rect.calcTransformMatrix(),halfWidth=(Number(rect.width)||0)/2,halfHeight=(Number(rect.height)||0)/2;
 return[
  new fabric.Point(-halfWidth,-halfHeight),new fabric.Point(halfWidth,-halfHeight),
  new fabric.Point(halfWidth,halfHeight),new fabric.Point(-halfWidth,halfHeight)
 ].map(point=>fabric.util.transformPoint(point,matrix))
}
function cropBoxFromHelper(target,rect){
 const session=cropSession,geometry=session?.geometry||cropSourceGeometry(target),reference=session?.ghost;if(!reference)return null;
 // Use the helper's content box, not Fabric's stroked control bounds. The latter
 // includes the dashed UI stroke and made a repeated crop start slightly smaller.
 const inverse=fabric.util.invertTransform(reference.calcTransformMatrix()),points=cropHelperCorners(rect).map(point=>fabric.util.transformPoint(point,inverse)),rawMinX=Math.min(...points.map(point=>point.x)),rawMaxX=Math.max(...points.map(point=>point.x)),rawMinY=Math.min(...points.map(point=>point.y)),rawMaxY=Math.max(...points.map(point=>point.y)),width=clamp(rawMaxX-rawMinX,2,geometry.sourceWidth),height=clamp(rawMaxY-rawMinY,2,geometry.sourceHeight),centerX=clamp((rawMinX+rawMaxX)/2,-geometry.sourceWidth/2+width/2,geometry.sourceWidth/2-width/2),centerY=clamp((rawMinY+rawMaxY)/2,-geometry.sourceHeight/2+height/2,geometry.sourceHeight/2-height/2),center=fabric.util.transformPoint(new fabric.Point(centerX,centerY),reference.calcTransformMatrix()),cropX=centerX-width/2+geometry.sourceWidth/2,cropY=centerY-height/2+geometry.sourceHeight/2,constrained=Math.abs(width-(rawMaxX-rawMinX))>.01||Math.abs(height-(rawMaxY-rawMinY))>.01||Math.abs(centerX-(rawMinX+rawMaxX)/2)>.01||Math.abs(centerY-(rawMinY+rawMaxY)/2)>.01;
 return{cropX,cropY,width,height,center,displayWidth:width*Math.abs(target.scaleX||1),displayHeight:height*Math.abs(target.scaleY||1),constrained}
}
function constrainCropHelper(session,box){
 if(!box||!box.constrained||session.constraining)return;session.constraining=true;session.rect.set({left:box.center.x,top:box.center.y,width:box.width,height:box.height,scaleX:Math.abs(session.target.scaleX||1),scaleY:Math.abs(session.target.scaleY||1),angle:session.target.angle||0,skewX:session.target.skewX||0,skewY:session.target.skewY||0});session.rect.setCoords();session.constraining=false
}
function removeCropWorkspace(session){
 for(const object of [session.rect,session.focus,session.ghost])if(object)canvas.remove(object)
}
function makeCropPreviewImage(element,options){
 const preview=new fabric.Image(element,{originX:'center',originY:'center',evented:false,selectable:false,excludeFromExport:true,...options});
 preview.excludeProject=true;preview.objectType='crop-preview';return preview
}
startCrop=function(){
 if(cropSession){cancelCrop();return}
 const target=selectedImage();if(!target){toast('Seleziona prima un’immagine');return}
 const geometry=cropSourceGeometry(target);if(!geometry.element||!geometry.sourceWidth||!geometry.sourceHeight){toast('Sorgente immagine non disponibile');return}
 const center=fullSourceCenter(target,geometry),common={angle:target.angle||0,flipX:!!target.flipX,flipY:!!target.flipY,skewX:target.skewX||0,skewY:target.skewY||0};
 const ghost=makeCropPreviewImage(geometry.element,{...common,left:center.x,top:center.y,width:geometry.sourceWidth,height:geometry.sourceHeight,cropX:0,cropY:0,scaleX:target.scaleX,scaleY:target.scaleY,opacity:.24});
 const focus=makeCropPreviewImage(geometry.element,{...common,left:target.getCenterPoint().x,top:target.getCenterPoint().y,width:geometry.width,height:geometry.height,cropX:geometry.cropX,cropY:geometry.cropY,scaleX:target.scaleX,scaleY:target.scaleY,opacity:target.opacity??1});
 const touch=typeof canvasTouchUiActive==='function'&&canvasTouchUiActive(),profile=touchControlProfile(touch);
 const rect=new fabric.Rect({left:target.getCenterPoint().x,top:target.getCenterPoint().y,width:target.width,height:target.height,scaleX:Math.abs(target.scaleX||1),scaleY:Math.abs(target.scaleY||1),angle:target.angle||0,originX:'center',originY:'center',fill:'rgba(41,136,121,.06)',stroke:'#298879',strokeWidth:(touch?3:2)/Math.max(.2,Math.abs(target.scaleX||1)),strokeUniform:true,strokeDashArray:touch?[10,6]:[8,5],transparentCorners:false,cornerStyle:'circle',cornerColor:'#298879',cornerSize:touch?20:profile.cornerSize,touchCornerSize:touch?44:profile.touchCornerSize,padding:profile.padding,borderScaleFactor:touch?1.8:1,lockRotation:true});
 rect.excludeProject=true;rect.objectType='crop-helper';
 const before={opacity:target.opacity,evented:target.evented,selectable:target.selectable};
 cropSession={target,rect,ghost,focus,before,geometry,constraining:false};
 const syncPreview=()=>{const box=cropBoxFromHelper(target,rect);if(!box){focus.visible=false;canvas.requestRenderAll();return}constrainCropHelper(cropSession,box);focus.set({visible:true,cropX:box.cropX,cropY:box.cropY,width:box.width,height:box.height,left:box.center.x,top:box.center.y,scaleX:box.displayWidth/box.width,scaleY:box.displayHeight/box.height});focus.setCoords();canvas.requestRenderAll()};
 cropSession.syncPreview=syncPreview;rect.on('moving',syncPreview);rect.on('scaling',syncPreview);rect.on('modified',syncPreview);
 target.set({opacity:0,evented:false,selectable:false});canvas.add(ghost,focus,rect);syncPreview();canvas.setActiveObject(rect);$('cropActions').classList.remove('hidden');$('cropTool').classList.add('active');canvas.requestRenderAll()
};
cancelCrop=function(){
 if(!cropSession)return;
 const session=cropSession,{target,before}=session;removeCropWorkspace(session);target.set(before);cropSession=null;$('cropActions').classList.add('hidden');$('cropTool').classList.remove('active');canvas.setActiveObject(target);target.setCoords();canvas.requestRenderAll()
};
applyCrop=function(){
 if(!cropSession)return;
 const session=cropSession,{target,rect,before}=session,box=cropBoxFromHelper(target,rect);if(!box){toast('Area crop troppo piccola');return}
 removeCropWorkspace(session);target.set({cropX:box.cropX,cropY:box.cropY,width:box.width,height:box.height,left:box.center.x,top:box.center.y,scaleX:target.scaleX,scaleY:target.scaleY,opacity:before.opacity,evented:before.evented,selectable:before.selectable});cropSession=null;$('cropActions').classList.add('hidden');$('cropTool').classList.remove('active');target.setCoords();canvas.setActiveObject(target);canvas.requestRenderAll();saveActivePage();toast('Crop applicato · sorgente originale preservato')
};
resetCrop=withHistory(async function(){
 const image=selectedImage();if(!image){toast('Seleziona un’immagine');return}
 const geometry=cropSourceGeometry(image);if(!geometry.sourceWidth||!geometry.sourceHeight)return;
 const center=fullSourceCenter(image,geometry),scaleX=image.scaleX,scaleY=image.scaleY;
 image.set({cropX:0,cropY:0,width:geometry.sourceWidth,height:geometry.sourceHeight,scaleX,scaleY});image.setPositionByOrigin(center,'center','center');image.setCoords();canvas.requestRenderAll();saveActivePage();toast('Crop ripristinato senza deformare l’immagine')
});
function resetActiveCrop(){
 if(!cropSession)return;
 const target=cropSession.target;cancelCrop();canvas.setActiveObject(target);return resetCrop()
}

$('resetCropActiveBtn').onclick=resetActiveCrop;
