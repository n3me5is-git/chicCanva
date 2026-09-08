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
function cropBoxFromHelper(target,rect){
 const oldW=target.width,oldH=target.height,oldCropX=target.cropX||0,oldCropY=target.cropY||0,inv=fabric.util.invertTransform(target.calcTransformMatrix()),points=rect.getCoords().map(point=>fabric.util.transformPoint(point,inv));
 const minX=Math.max(-oldW/2,Math.min(...points.map(point=>point.x))),maxX=Math.min(oldW/2,Math.max(...points.map(point=>point.x))),minY=Math.max(-oldH/2,Math.min(...points.map(point=>point.y))),maxY=Math.min(oldH/2,Math.max(...points.map(point=>point.y)));
 if(maxX-minX<2||maxY-minY<2)return null;
 const width=maxX-minX,height=maxY-minY,centerLocal=new fabric.Point((minX+maxX)/2,(minY+maxY)/2);
 return{cropX:oldCropX+minX+oldW/2,cropY:oldCropY+minY+oldH/2,width,height,center:fabric.util.transformPoint(centerLocal,target.calcTransformMatrix()),displayWidth:rect.getScaledWidth(),displayHeight:rect.getScaledHeight()}
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
 const rect=new fabric.Rect({left:target.getCenterPoint().x,top:target.getCenterPoint().y,width:target.width*.82,height:target.height*.82,scaleX:target.scaleX,scaleY:target.scaleY,angle:target.angle||0,originX:'center',originY:'center',fill:'rgba(41,136,121,.06)',stroke:'#298879',strokeWidth:2/Math.max(.2,Math.abs(target.scaleX||1)),strokeUniform:true,strokeDashArray:[8,5],transparentCorners:false,cornerColor:'#298879',lockRotation:true});
 rect.excludeProject=true;rect.objectType='crop-helper';
 const before={opacity:target.opacity,evented:target.evented,selectable:target.selectable};
 cropSession={target,rect,ghost,focus,before};
 const syncPreview=()=>{const box=cropBoxFromHelper(target,rect);if(!box){focus.visible=false;canvas.requestRenderAll();return}focus.set({visible:true,cropX:box.cropX,cropY:box.cropY,width:box.width,height:box.height,left:box.center.x,top:box.center.y,scaleX:box.displayWidth/box.width,scaleY:box.displayHeight/box.height});focus.setCoords();canvas.requestRenderAll()};
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
 removeCropWorkspace(session);target.set({cropX:box.cropX,cropY:box.cropY,width:box.width,height:box.height,left:box.center.x,top:box.center.y,scaleX:box.displayWidth/box.width,scaleY:box.displayHeight/box.height,opacity:before.opacity,evented:before.evented,selectable:before.selectable});cropSession=null;$('cropActions').classList.add('hidden');$('cropTool').classList.remove('active');target.setCoords();canvas.setActiveObject(target);canvas.requestRenderAll();saveActivePage();toast('Crop applicato · sorgente originale preservato')
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
