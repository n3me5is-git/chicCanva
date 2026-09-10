// Curated Puter image generation profiles. Prices are published per-image base
// prices from the Puter model catalog; Puter exposes usage, not a quote API.
const AI_IMAGE_PROFILES=Object.freeze([
 {id:'gpt-image-2.5-flare',group:'openai-image-generation',label:'GPT Image 2.5 Flare',provider:'openai-image-generation',model:'gpt-image-2.5-flare',qualities:['low','medium','high'],defaultQuality:'low',usd:.00588,reference:true,qualityMultipliers:{low:1,medium:4,high:16}},
 {id:'gpt-image-2',group:'openai-image-generation',label:'GPT Image 2',provider:'openai-image-generation',model:'gpt-image-2',qualities:['low','medium'],defaultQuality:'low',usd:.0059,reference:true,qualityMultipliers:{low:1,medium:4}},
 {id:'grok-imagine-image',group:'xai',label:'Grok Imagine · Standard',provider:'xai',model:'grok-imagine-image',qualities:['standard'],defaultQuality:'standard',usd:.02,reference:true},
 {id:'grok-imagine-image-quality',group:'xai',label:'Grok Imagine · Quality',provider:'xai',model:'grok-imagine-image-quality',qualities:['standard'],defaultQuality:'standard',usd:.05,reference:true},
 {id:'rundiffusion/juggernaut-lightning-flux',group:'other',label:'Juggernaut Lightning Flux',model:'rundiffusion/juggernaut-lightning-flux',qualities:['standard'],defaultQuality:'standard',usd:.0017,reference:false},
 {id:'hidream-ai/hidream-i1-fast',group:'other',label:'HiDream I1 · Fast',model:'hidream-ai/hidream-i1-fast',qualities:['standard'],defaultQuality:'standard',usd:.0032,reference:false},
 {id:'hidream-ai/hidream-i1-dev',group:'other',label:'HiDream I1 · Standard',provider:'together',model:'hidream-ai/hidream-i1-dev',qualities:['standard'],defaultQuality:'standard',usd:.0045,reference:true},
 {id:'hidream-ai/hidream-i1-dev|no-safety',group:'other',label:'HiDream I1 · No-safety (Together)',provider:'together',model:'hidream-ai/hidream-i1-dev',qualities:['standard'],defaultQuality:'standard',usd:.0045,reference:true,disableSafety:true},
 {id:'byteplus/seedream-5-0-lite-260128',group:'other',label:'Seedream 5 Lite',model:'byteplus/seedream-5-0-lite-260128',qualities:['standard'],defaultQuality:'standard',usd:.035,reference:true},
 {id:'qwen/qwen-image',group:'other',label:'Qwen Image · Standard (originale)',provider:'together',model:'qwen/qwen-image',qualities:['standard'],defaultQuality:'standard',usd:.0058,reference:true},
 {id:'qwen/qwen-image|no-safety',group:'other',label:'Qwen Image · No-safety (Together)',provider:'together',model:'qwen/qwen-image',qualities:['standard'],defaultQuality:'standard',usd:.0058,reference:true,disableSafety:true}
]);
const AI_REFERENCE_FACTORS=Object.freeze([.25,.5,.75,1]);
function aiProfile(){return AI_IMAGE_PROFILES.find(p=>p.id===$('aiModel')?.value)||AI_IMAGE_PROFILES[0]}
function aiReferenceFactor(){return AI_REFERENCE_FACTORS[clamp(Number($('aiReferenceScale')?.value??3),0,3)]||1}
function aiFullPrompt(forEstimate=false){
 let prompt=$('aiPrompt')?.value.trim()||'',style=AI_STYLES[$('aiStyle')?.value]||'';
 if(style)prompt=[prompt,style].filter(Boolean).join('\n\n');
 if(forEstimate&&$('aiChromaKey')?.checked&&typeof AI_CHROMA_INSTRUCTION==='string'&&!prompt.includes(AI_CHROMA_INSTRUCTION))prompt=[prompt,AI_CHROMA_INSTRUCTION].filter(Boolean).join('\n\n');
 return prompt
}
function aiUsdText(value){return 'US$ '+value.toLocaleString('it-IT',{minimumFractionDigits:value<.01?4:3,maximumFractionDigits:4})}
function aiCreditText(value){return Math.round(value*100000000).toLocaleString('it-IT')+' microcrediti'}
function updateAiEstimate(){
 const box=$('aiCostEstimate');if(!box)return;const profile=aiProfile(),quality=$('aiQuality')?.value||profile.defaultQuality,multiplier=profile.qualityMultipliers?.[quality]||1,usd=profile.usd*multiplier,prompt=aiFullPrompt(true),tokens=Math.max(1,Math.ceil(prompt.length/4)),ref=state.aiReference,factor=aiReferenceFactor();
 let details='prompt complessivo ~'+tokens+' token';
 if(ref){const w=Math.max(1,Math.round((ref.width||0)*factor)),h=Math.max(1,Math.round((ref.height||0)*factor));details+=' · riferimento '+w+' × '+h+' px ('+String(factor).replace('.',',')+'×)'}
 const priceKind=profile.qualityMultipliers&&quality!=='low'?'qualità stimata':'prezzo base pubblicato';
 box.innerHTML='<strong>Stima consumo Puter</strong><span>~ '+aiCreditText(usd)+' · '+aiUsdText(usd)+'<small class="estimate-detail">'+priceKind+' · '+details+(ref?' · Puter non pubblica un sovrapprezzo separato per l’input immagine':'')+'</small></span>'
}
populateAiModels=function(){
 const group=$('aiProvider').value,sel=$('aiModel'),previous=sel.value,items=AI_IMAGE_PROFILES.filter(p=>p.group===group);sel.replaceChildren();
 for(const p of items){const option=document.createElement('option');option.value=p.id;option.textContent=p.label;sel.append(option)}
 sel.value=items.some(p=>p.id===previous)?previous:items[0]?.id||AI_IMAGE_PROFILES[0].id;syncAiQualityOptions();syncReferenceUI();updateAiEstimate()
};
syncAiQualityOptions=function(){
 const profile=aiProfile(),sel=$('aiQuality'),previous=sel.value;sel.replaceChildren();
 for(const quality of profile.qualities){const option=document.createElement('option');option.value=quality;option.textContent=quality==='standard'?'Standard':quality[0].toUpperCase()+quality.slice(1);sel.append(option)}
 sel.value=profile.qualities.includes(previous)?previous:profile.defaultQuality;sel.disabled=profile.qualities.length===1;updateAiEstimate()
};
refreshAiModels=function(){populateAiModels();$('aiStatus').textContent='Catalogo curato chicCanva aggiornato.'};
referenceSupported=function(){return !!aiProfile().reference};
syncReferenceUI=function(){
 const ref=state.aiReference,profile=aiProfile(),factor=aiReferenceFactor(),scalePanel=$('aiReferenceScalePanel');$('aiReferencePreview').classList.toggle('hidden',!ref);scalePanel?.classList.toggle('hidden',!ref);
 if(ref){$('aiReferenceImg').src=ref.dataUrl;$('aiReferenceName').textContent=ref.name;const w=Math.max(1,Math.round((ref.width||0)*factor)),h=Math.max(1,Math.round((ref.height||0)*factor));$('aiReferenceScaleLabel').textContent=String(factor).replace('.',',')+'×';$('aiReferenceScaleInfo').textContent='Invio: '+w+' × '+h+' px. L’originale resta invariato; la copia ridotta esiste solo durante la richiesta.'}else $('aiReferenceImg').removeAttribute('src');
 $('aiReferenceStatus').textContent=ref&&!profile.reference?'Questo modello non dichiara un input immagine compatibile: rimuovi il riferimento o scegli un altro modello.':ref?'Riferimento pronto · descrivi nel prompt cosa mantenere o cambiare.':'Allega una foto o un disegno; senza allegato la generazione parte dal solo testo.';
 if(!$('generateAiBtn').querySelector('.spinner'))$('generateAiBtn').disabled=!!ref&&!profile.reference;updateAiEstimate()
};
async function scaledAiReference(reference,factor){
 if(!reference||factor>=.999)return reference;const image=new Image();image.src=reference.dataUrl;await image.decode();const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*factor));canvas.height=Math.max(1,Math.round(image.naturalHeight*factor));const context=canvas.getContext('2d',{alpha:true});context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';context.drawImage(image,0,0,canvas.width,canvas.height);const dataUrl=canvas.toDataURL('image/png');const result={...reference,dataUrl,mime:'image/png',width:canvas.width,height:canvas.height};canvas.width=canvas.height=1;image.src='';return result
}
function aiRequestOptions(profile,quality,ratio,reference){
 const opts={model:profile.model};if(profile.provider)opts.provider=profile.provider;
 if(profile.group==='openai-image-generation'){opts.quality=quality;opts.ratio=ratioObject(ratio)}
 else if(profile.group==='xai'){opts.quality='1k';opts.ratio=ratioObject(ratio)}
 else opts.aspect_ratio=ratio;
 if(profile.disableSafety)opts.disable_safety_checker=true;
 if(reference){opts.input_images=[reference.dataUrl];opts.input_image_mime_type=reference.mime}
 return opts
}
generateAi=async function(){
 if(location.protocol==='file:'){toast('Apri tramite webserver per Puter');return}const raw=$('aiPrompt').value.trim();if(!raw){toast('Scrivi cosa vuoi creare');return}const profile=aiProfile();if(state.aiReference&&!profile.reference){toast('Il modello scelto non supporta il riferimento');return}
 const btn=$('generateAiBtn'),status=$('aiStatus'),targetPage=currentPage,sourceReference=state.aiReference?structuredClone(state.aiReference):null;btn.disabled=true;btn.innerHTML='<span class="spinner"></span>Generazione…';
 try{await ensurePuter();const quality=$('aiQuality').value,ratio=$('aiRatio').value,prompt=aiFullPrompt(false),factor=aiReferenceFactor();status.textContent=sourceReference&&factor<1?'Preparazione della copia ridotta del riferimento…':sourceReference?'Generazione con immagine di riferimento…':'Generazione in corso…';const reference=await scaledAiReference(sourceReference,factor),opts=aiRequestOptions(profile,quality,ratio,reference);const imageResult=await puter.ai.txt2img(prompt,opts);let dataUrl=imageResult.src;if(!dataUrl.startsWith('data:')){const response=await fetch(dataUrl);if(!response.ok)throw new Error('Download immagine non riuscito');dataUrl=await dataUrlFromBlob(await response.blob())}
  const id=uid('asset');state.assets[id]={id,dataUrl,originalDataUrl:dataUrl,mime:'image/png',name:'AI '+profile.label,kind:'ai',source:'Puter txt2img',meta:{provider:profile.provider||'auto',model:profile.model,profile:profile.id,quality,ratio,prompt,referenceName:sourceReference?.name||null,referenceScale:sourceReference?factor:null,estimatedUsd:profile.usd*(profile.qualityMultipliers?.[quality]||1)}};updateAssetCount();
  if(currentPage===targetPage&&!loadingPage)await addImageAsset(id,'ai');else{const image=new Image();image.src=dataUrl;await image.decode();const scale=Math.min(1,targetPage.widthMm*PX_PER_MM*.55/image.naturalWidth,targetPage.heightMm*PX_PER_MM*.55/image.naturalHeight);targetPage.objects.push({id:uid('obj'),objectType:'ai',assetId:id,left:targetPage.widthMm*PX_PER_MM/2,top:targetPage.heightMm*PX_PER_MM/2,originX:'center',originY:'center',scaleX:scale,scaleY:scale,width:image.naturalWidth,height:image.naturalHeight,angle:0,opacity:1})}
  status.textContent='Immagine generata con '+profile.label+' e inserita in '+targetPage.name+'.'
 }catch(error){console.error(error);status.textContent='Errore Puter: '+(error?.message||error);toast('Generazione non riuscita')}finally{btn.innerHTML='Genera e inserisci';btn.disabled=false;syncReferenceUI();schedulePuterUsageRefresh?.()}
};
const baseRestoreAiFields=restoreDocumentFields;
restoreDocumentFields=function(fields={}){baseRestoreAiFields(fields);const group=AI_IMAGE_PROFILES.some(p=>p.group===$('aiProvider').value)?$('aiProvider').value:'openai-image-generation';$('aiProvider').value=group;populateAiModels();if(fields.aiModel&&AI_IMAGE_PROFILES.some(p=>p.id===fields.aiModel&&p.group===group)){$('aiModel').value=fields.aiModel;syncAiQualityOptions()}if(fields.aiQuality&&aiProfile().qualities.includes(fields.aiQuality))$('aiQuality').value=fields.aiQuality;if(fields.aiReferenceScale!=null)$('aiReferenceScale').value=fields.aiReferenceScale;syncReferenceUI()};
const aiGenerationBaseInit=init;
init=async function(){await aiGenerationBaseInit();$('aiModel').onchange=()=>{syncAiQualityOptions();syncReferenceUI();scheduleAutosave?.()};$('aiQuality').onchange=()=>{updateAiEstimate();scheduleAutosave?.()};$('aiReferenceScale').oninput=()=>syncReferenceUI();$('aiReferenceScale').onchange=()=>scheduleAutosave?.();for(const id of ['aiRatio','aiStyle','aiChromaKey'])$(id).addEventListener('change',updateAiEstimate);$('aiPrompt').addEventListener('input',updateAiEstimate);populateAiModels();updateAiEstimate()};
