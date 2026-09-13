// Direct text editing keeps the selected object's top-left anchor stable.
let textEditSession=null,textEditSuspendedControls=[];
function directEditableText(){const objects=selectionObjects().filter(object=>!object.excludeProject);return objects.length===1&&objects[0].objectType==='text'?objects[0]:null}
function setTextInsertionControlsDisabled(disabled){
 if(disabled){const fitAxis=$('fitAxis'),generated=$('generatedOptions'),smartRow=$('smartEmoji')?.closest('label'),targets=[$('rebuildTextBtn'),$('fitTextBtn'),$('splitTextRow'),fitAxis,fitAxis?.previousElementSibling,fitAxis?.nextElementSibling,$('orientationSeg'),$('orientationSeg')?.previousElementSibling,...document.querySelectorAll('[data-symbol-options]'),$('singleOptions'),...([...generated?.children||[]].filter(element=>element!==smartRow))].filter(Boolean);textEditSuspendedControls=[...new Set(targets)].map(element=>({element,hidden:element.hidden,disabled:'disabled'in element?element.disabled:null}));for(const{element}of textEditSuspendedControls){element.hidden=true;element.classList.add('text-edit-disabled');if('disabled'in element)element.disabled=true}}
 else{for(const{element,hidden,disabled:wasDisabled}of textEditSuspendedControls){element.hidden=hidden;element.classList.remove('text-edit-disabled');if(wasDisabled!==null)element.disabled=wasDisabled}textEditSuspendedControls=[]}
}
function refreshTextEditTrigger(){const object=directEditableText(),button=$('editSelectedTextBtn');if(!button)return;if(textEditSession&&!canvas.contains(textEditSession.object))finishTextEdit(false);button.classList.toggle('hidden',!object||!!textEditSession)}
function beginTextEdit(){
 const object=directEditableText();if(!object)return;
 const bounds=object.getBoundingRect(true,true),topLeft=object.getPointByOrigin('left','top');textEditSession={object,projectId:object.projectId,width:bounds.width,height:bounds.height,topLeft,scaleX:object.scaleX,scaleY:object.scaleY};
 $('textInput').value=object.text||'';$('textEditOptions').classList.remove('hidden');$('editSelectedTextBtn').classList.add('hidden');$('buildTextBtn').textContent='Aggiorna testo';setTextInsertionControlsDisabled(true);$('textInput').focus();$('textInput').select()
}
function finishTextEdit(restoreInput=true){textEditSession=null;$('textEditOptions')?.classList.add('hidden');$('buildTextBtn').textContent='Aggiungi testo';setTextInsertionControlsDisabled(false);if(restoreInput)$('textInput').value=state.text||'';refreshTextEditTrigger()}
function styleTextTree(object,source){
 const visit=item=>{if(item.objectType==='text'||item.type==='text'){item.set({fontFamily:source.fontFamily,fontSize:source.fontSize,fontWeight:source.fontWeight,fill:source.fill,stroke:source.stroke,strokeWidth:source.strokeWidth,charSpacing:source.charSpacing,lineHeight:source.lineHeight,textAlign:source.textAlign,paintFirst:'stroke',objectCaching:false});item.outlineMode=source.outlineMode}for(const child of item.getObjects?.()||[])visit(child)};visit(object)
}
async function updateEditedText(){
 const session=textEditSession;if(!session||!canvas.contains(session.object)){finishTextEdit();return}const old=session.object,raw=$('textInput').value,text=$('uppercaseText').checked?raw.toLocaleUpperCase('it-IT'):raw;if(!text.trim())return toast('Inserisci il nuovo testo');
 const constraint=$('textEditConstraint').value,keepAspect=$('textEditKeepAspect').checked,source={fontFamily:old.fontFamily,fontSize:old.fontSize,fontWeight:old.fontWeight,fill:old.fill,stroke:old.stroke,strokeWidth:old.strokeWidth,charSpacing:old.charSpacing,lineHeight:old.lineHeight,textAlign:old.textAlign,outlineMode:old.outlineMode};let result=old;
 commitHistory();
 if($('smartEmoji').checked&&graphemes(text).some(isEmoji)){result=await tokenObject(text,canvas);styleTextTree(result,source);canvas.remove(old);result.projectId=session.projectId}else{old.set({text});old.initDimensions?.();old.set({scaleX:session.scaleX,scaleY:session.scaleY});old.dirty=true}
 result.setCoords();let bounds=result.getBoundingRect(true,true),sx=result.scaleX,sy=result.scaleY;
 if(constraint==='width'){const factor=session.width/Math.max(1,bounds.width);sx*=factor;if(keepAspect)sy*=factor}
 else if(constraint==='height'){const factor=session.height/Math.max(1,bounds.height);sy*=factor;if(keepAspect)sx*=factor}
 else if(constraint==='both'){if(keepAspect){const factor=Math.min(session.width/Math.max(1,bounds.width),session.height/Math.max(1,bounds.height));sx*=factor;sy*=factor}else{sx*=session.width/Math.max(1,bounds.width);sy*=session.height/Math.max(1,bounds.height)}}
 result.set({scaleX:sx,scaleY:sy});result.setPositionByOrigin(session.topLeft,'left','top');result.setCoords();canvas.setActiveObject(result);canvas.requestRenderAll();saveActivePage();scheduleCommit();scheduleAutosave();state.text=raw;finishTextEdit(false);$('textInput').value=raw;selectionChanged();toast('Testo aggiornato')
}
function setupTextEditing(){
 $('editSelectedTextBtn').onclick=beginTextEdit;$('cancelTextEdit').onclick=()=>finishTextEdit();$('textEditConstraint').onchange=()=>{$('textEditKeepAspect').disabled=$('textEditConstraint').value==='none'};
 const originalAdd=$('buildTextBtn').onclick;$('buildTextBtn').onclick=()=>textEditSession?updateEditedText().catch(error=>toast(error.message)):originalAdd?.();
 canvas.on('selection:created',refreshTextEditTrigger);canvas.on('selection:updated',refreshTextEditTrigger);canvas.on('selection:cleared',refreshTextEditTrigger);canvas.on('object:modified',refreshTextEditTrigger);refreshTextEditTrigger()
}
const textEditingBaseInit=init;init=async function(){await textEditingBaseInit();setupTextEditing()};
