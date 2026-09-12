// Puter account accounting and local image-price estimates.
// The live APIs are deliberately isolated here: estimates never block editing.
const PUTER_CREDITS_PER_USD=2000;
const PUTER_IMAGE_PRICING_CACHE_KEY='chiccanva.puter-image-pricing.v1';
const PUTER_IMAGE_PRICING_TTL_MS=30*24*60*60*1000;
const PUTER_IMAGE_PRICING_URL='https://api.puter.com/puterai/image/models/details';
const PUTER_IMAGE_PRICING_FALLBACK=Object.freeze({
 creditsPerUSD:PUTER_CREDITS_PER_USD,
 models:{
  'openai/gpt-image-2.5-flare':{kind:'openai-token-image',textInputPer1M:5,imageInputPer1M:8,imageOutputPer1M:30,qualityMultiplier:{low:1,medium:9.01,high:35.88}},
  'openai/gpt-image-2':{kind:'openai-token-image',textInputPer1M:5,imageInputPer1M:8,imageOutputPer1M:30,qualityMultiplier:{low:1,medium:9.01}},
  'x-ai/grok-imagine-image':{kind:'per-image-tier',outputUsd:{'1k':.02,'2k':.02},referenceUsd:.002},
  'x-ai/grok-imagine-image-quality':{kind:'per-image-tier',outputUsd:{'1k':.05,'2k':.07},referenceUsd:.01},
  'byteplus/seedream-5-0-lite-260128':{kind:'per-image',outputUsd:.035,referenceUsd:.00875},
  'google/gemini-3.1-flash-lite-image':{kind:'gemini-token-image',textInputPer1M:.25,textOutputPer1M:1.5,imageOutputPer1M:30,outputTokensByTier:{'1k':1120}}
 }
});
let puterImagePricing=structuredClone(PUTER_IMAGE_PRICING_FALLBACK),puterPricingMeta={source:'incorporato',fetchedAt:0,stale:false};

function puterFinite(value){const n=Number(value);return Number.isFinite(n)?n:null}
function puterAmountToUsd(amount,unit='credits'){
 const n=puterFinite(amount);if(n===null)return null;switch(String(unit||'credits').toLowerCase()){
  case'credit':case'credits':return n/(puterImagePricing.creditsPerUSD||PUTER_CREDITS_PER_USD);
  case'microcent':case'microcents':case'usd-microcents':return n/100000000;
  case'cent':case'cents':case'usd-cents':return n/100;
  case'usd':case'dollar':case'dollars':return n;default:return null
 }
}
function puterAmountToCredits(amount,unit='credits'){const usd=puterAmountToUsd(amount,unit);return usd===null?null:usd*(puterImagePricing.creditsPerUSD||PUTER_CREDITS_PER_USD)}
function puterCreditsLabel(amount,unit='credits'){const value=puterAmountToCredits(amount,unit);return value===null?'—':Math.round(value).toLocaleString('it-IT')+' crediti'}
function puterUsdLabel(amount,unit='credits',digits=2){const value=puterAmountToUsd(amount,unit);return value===null?'—':'US$ '+value.toLocaleString('it-IT',{minimumFractionDigits:digits,maximumFractionDigits:digits})}
function puterBalanceLabel(amount,unit='credits'){return amount==null?'—':puterCreditsLabel(amount,unit)+' · '+puterUsdLabel(amount,unit,2)}
function derivePuterConsumed(monthly={}){
 const info=monthly?.allowanceInfo||{},usage=monthly?.usage||{},reported=puterFinite(usage.allowanceUsed);
 if(reported!==null)return{value:Math.max(0,reported),source:'usage.allowanceUsed',confidence:'reported'};
 const total=puterFinite(usage.total);if(total!==null)return{value:Math.max(0,total),source:'usage.total',confidence:'reported-observed'};
 const allowance=puterFinite(info.monthUsageAllowance)||0,purchased=puterFinite(info?.addons?.purchasedCredits)||0,remaining=puterFinite(info.remaining),capacity=allowance+purchased;
 if(remaining===null||remaining>capacity)return{value:null,source:remaining===null?null:'derived-capacity-mismatch',confidence:'unknown'};
 return{value:Math.max(0,capacity-remaining),source:'monthly+purchased-remaining',confidence:'derived'}
}
async function getPuterBillingSnapshot(){
 const [user,monthly]=await Promise.all([puter.auth.getUser(),puter.auth.getMonthlyUsage()]),info=monthly?.allowanceInfo||{},unit=info.unit||'credits',consumed=derivePuterConsumed(monthly);let appUsage=null;
 if(puter.auth.getDetailedAppUsage&&puter.auth.appID){try{appUsage=await puter.auth.getDetailedAppUsage(puter.auth.appID)}catch(error){console.warn('Uso Puter dell’app non disponibile',error)}}
 return{user,monthly,appUsage,unit,monthlyAllowance:puterFinite(info.monthUsageAllowance),purchasedCredits:puterFinite(info?.addons?.purchasedCredits)||0,remaining:puterFinite(info.remaining),consumed}
}
function renderPuterBilling(snapshot){
 const{user,appUsage,unit,monthlyAllowance,purchasedCredits,remaining,consumed}=snapshot,percent=consumed.value!==null&&monthlyAllowance>0?clamp(consumed.value/monthlyAllowance*100,0,100):0,box=$('puterUsage');box.classList.remove('hidden');
 $('puterUsageBar').style.width=percent+'%';box.querySelector('[role="progressbar"]')?.setAttribute('aria-valuenow',String(Math.round(percent)));
 $('puterUsageUsed').textContent='Usato '+puterBalanceLabel(consumed.value,unit);$('puterUsageRemaining').textContent='Disponibile '+puterBalanceLabel(remaining,unit);
 $('puterAccountType').textContent=user?.subscribed===true?'Subscription':'Free / senza abbonamento';$('puterMonthlyAllowance').textContent=puterBalanceLabel(monthlyAllowance,unit);$('puterTopupCredits').textContent=puterBalanceLabel(purchasedCredits,unit);
 const appTotal=puterFinite(appUsage?.total),appUnit=appUsage?.unit||unit;$('puterAppUsage').textContent=appTotal===null?'Non disponibile':puterBalanceLabel(appTotal,appUnit);
 const source=consumed.confidence==='derived'?'consumo ricavato dal saldo':'consumo comunicato da Puter';$('puterUsageDetail').textContent='La barra confronta il consumo con l’allowance mensile. Saldo generale e '+source+' · aggiornato '+new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})+'. L’uso chicCanva è una lettura separata limitata a questa app.'
}
refreshPuterUsage=async function(silent=false){
 const box=$('puterUsage');if(!box||location.protocol==='file:'){box?.classList.add('hidden');return}try{await ensurePuter();if(!window.puter?.auth?.isSignedIn||!await Promise.resolve(puter.auth.isSignedIn())){box.classList.add('hidden');return}renderPuterBilling(await getPuterBillingSnapshot())}catch(error){if(!silent){box.classList.remove('hidden');$('puterUsageDetail').textContent='Aggiornamento non riuscito: '+(error?.message||error)}}
};

function puterPricingCostToUsd(value,unit){const n=puterFinite(value);if(n===null||n<=0)return null;const normalized=String(unit||'').toLowerCase();return normalized==='usd-cents'||normalized==='cents'?n/100:normalized==='usd'?n:normalized.includes('microcent')?n/100000000:null}
function puterPricingRows(value,rows=[],hint=''){if(Array.isArray(value)){for(const item of value)puterPricingRows(item,rows,hint)}else if(value&&typeof value==='object'){if(value.puterId||value.model||value.id||value.costs)rows.push({...value,__keyHint:hint});for(const[key,child]of Object.entries(value))if(child&&typeof child==='object')puterPricingRows(child,rows,key)}return rows}
function applyLivePuterPricing(base,payload){
 const next=structuredClone(base),wanted=new Set(Object.keys(next.models)),rows=puterPricingRows(payload),seen=new Set();
 for(const row of rows){const candidates=[row.puterId,row.model,row.id,row.__keyHint].filter(Boolean).map(String),id=[...wanted].find(model=>candidates.some(value=>value===model||value.endsWith(':'+model)));if(!id||seen.has(id)||!row.costs||typeof row.costs!=='object')continue;const spec=next.models[id],costs=row.costs,unit=row.costs_currency||row.costUnit||row.currency;let valid=false;
  const assign=(key,value)=>{const usd=puterPricingCostToUsd(value,unit);if(usd!==null){spec[key]=usd;valid=true}};
  if(spec.kind==='openai-token-image'){assign('textInputPer1M',costs.text_input);assign('imageInputPer1M',costs.image_input);assign('imageOutputPer1M',costs.image_output)}
  else if(spec.kind==='per-image-tier'){spec.outputUsd=spec.outputUsd||{};for(const tier of ['1k','2k']){const usd=puterPricingCostToUsd(costs['output:'+tier],unit);if(usd!==null){spec.outputUsd[tier]=usd;valid=true}}assign('referenceUsd',costs.media_input)}
  else if(spec.kind==='per-image')assign('outputUsd',costs['per-image']);
  else if(spec.kind==='gemini-token-image'){assign('textInputPer1M',costs.input);assign('textOutputPer1M',costs.output);assign('imageOutputPer1M',costs.output_image);const headline=puterPricingCostToUsd(costs['1K:1x1'],unit);if(headline!==null){spec.headline1kUsd=headline;valid=true}}
  if(valid)seen.add(id)
 }
 if(!seen.size)throw new Error('Il catalogo non contiene prezzi riconosciuti per i modelli attivi');return next
}
function readPuterPricingCache(){try{const value=JSON.parse(localStorage.getItem(PUTER_IMAGE_PRICING_CACHE_KEY)||'null');return value&&value.db&&puterFinite(value.fetchedAt)!==null?value:null}catch{return null}}
function writePuterPricingCache(db){const value={schemaVersion:1,fetchedAt:Date.now(),sourceUrl:PUTER_IMAGE_PRICING_URL,db};localStorage.setItem(PUTER_IMAGE_PRICING_CACHE_KEY,JSON.stringify(value));return value}
function renderPuterPricingStatus(extra=''){const el=$('aiPricingStatus');if(!el)return;const date=puterPricingMeta.fetchedAt?new Date(puterPricingMeta.fetchedAt).toLocaleDateString('it-IT'):'';el.textContent=extra||(puterPricingMeta.source==='live'?'Prezzi Puter aggiornati '+date:puterPricingMeta.source==='cache'?'Prezzi Puter salvati '+date:'Prezziario incorporato')}
async function fetchPuterPricing(){const response=await fetch(PUTER_IMAGE_PRICING_URL,{headers:{Accept:'application/json'}});if(!response.ok)throw new Error('HTTP '+response.status);const type=response.headers.get('content-type')||'';if(!type.includes('json'))throw new Error('Risposta prezziario non JSON');return applyLivePuterPricing(PUTER_IMAGE_PRICING_FALLBACK,await response.json())}
async function loadPuterImagePricing({force=false}={}){
 const cached=readPuterPricingCache(),fresh=cached&&Date.now()-cached.fetchedAt<PUTER_IMAGE_PRICING_TTL_MS;if(cached){puterImagePricing=cached.db;puterPricingMeta={source:'cache',fetchedAt:cached.fetchedAt,stale:!fresh}}else{puterImagePricing=structuredClone(PUTER_IMAGE_PRICING_FALLBACK);puterPricingMeta={source:'incorporato',fetchedAt:0,stale:false}}
 renderPuterPricingStatus();updateAiEstimate?.();if(!force&&(fresh||location.protocol==='file:'))return puterImagePricing;
 try{const db=await fetchPuterPricing(),saved=writePuterPricingCache(db);puterImagePricing=db;puterPricingMeta={source:'live',fetchedAt:saved.fetchedAt,stale:false};renderPuterPricingStatus();updateAiEstimate?.();return db}catch(error){console.warn('Aggiornamento prezziario Puter non riuscito',error);renderPuterPricingStatus(cached?'Prezzi salvati conservati · aggiornamento non riuscito':'Prezzi incorporati · aggiornamento non riuscito');return puterImagePricing}
}
function resetPuterPricingMemory(){localStorage.removeItem(PUTER_IMAGE_PRICING_CACHE_KEY);puterImagePricing=structuredClone(PUTER_IMAGE_PRICING_FALLBACK);puterPricingMeta={source:'incorporato',fetchedAt:0,stale:false};renderPuterPricingStatus();updateAiEstimate?.()}

aiEquivalentCredits=function(usd){return Number(usd||0)*(puterImagePricing.creditsPerUSD||PUTER_CREDITS_PER_USD)};
aiUsdText=function(value){return 'US$ '+Number(value||0).toLocaleString('it-IT',{minimumFractionDigits:3,maximumFractionDigits:3})};
aiCreditText=function(value){return Math.round(aiEquivalentCredits(value)).toLocaleString('it-IT')+' crediti'};
aiEstimateBreakdown=function(){
 const profile=aiProfile(),spec=puterImagePricing.models[profile.model]||PUTER_IMAGE_PRICING_FALLBACK.models[profile.model],quality=$('aiQuality')?.value||profile.defaultQuality,prompt=aiFullPrompt(true),tokens=Math.max(1,Math.ceil(prompt.length/3.7)),ref=state.aiReference,factor=aiReferenceFactor(),ratio=aiSelectedRatio(),dimensions=aiResolutionDimensions(profile,ratio),w=Math.max(1,dimensions.width||1024),h=Math.max(1,dimensions.height||1024),tier=String($('aiResolution')?.value||'1k').toLowerCase();let outputUsd=0,promptUsd=0,referenceUsd=0,confidence='medium';
 if(spec?.kind==='openai-token-image'){const calculated=aiOpenAiOutputEstimate(profile,quality,{width:w,height:h});outputUsd=calculated.tokens*spec.imageOutputPer1M/1e6;promptUsd=tokens*spec.textInputPer1M/1e6;if(ref){const rw=Math.max(1,Math.round((ref.width||0)*factor)),rh=Math.max(1,Math.round((ref.height||0)*factor)),inputTokens=20+32*rw*rh/1e6;referenceUsd=inputTokens*spec.imageInputPer1M/1e6*1.15}confidence='medium'}
 else if(spec?.kind==='per-image-tier'){outputUsd=spec.outputUsd?.[tier]??spec.outputUsd?.['1k']??profile.usd;referenceUsd=ref?(spec.referenceUsd||0):0;confidence='high'}
 else if(spec?.kind==='per-image'){outputUsd=spec.outputUsd||profile.usd;referenceUsd=ref?(spec.referenceUsd||0):0;confidence=ref?'medium':'high'}
 else if(spec?.kind==='gemini-token-image'){const outputTokens=spec.outputTokensByTier?.[tier]||spec.outputTokensByTier?.['1k']||1120;outputUsd=outputTokens*spec.imageOutputPer1M/1e6;promptUsd=tokens*spec.textInputPer1M/1e6;if(ref){const rw=Math.max(1,Math.round((ref.width||0)*factor)),rh=Math.max(1,Math.round((ref.height||0)*factor)),tiles=Math.max(1,Math.ceil(rw/768)*Math.ceil(rh/768));referenceUsd=tiles*258*spec.textInputPer1M/1e6}confidence='medium'}
 else{outputUsd=profile.qualityUsd?.[quality]||profile.usd;confidence='low'}
 return{profile,quality,prompt,tokens,ref,factor,ratio,dimensions,outputUsd,promptUsd,referenceUsd,usd:outputUsd+promptUsd+referenceUsd,confidence}
};
updateAiEstimate=function(){
 const box=$('aiCostEstimate');if(!box)return;const q=aiEstimateBreakdown(),dimensions=q.dimensions,parts=['output ~'+aiCreditText(q.outputUsd)];if(q.promptUsd)parts.push('testo ~'+aiCreditText(q.promptUsd));if(q.referenceUsd)parts.push('riferimento ~'+aiCreditText(q.referenceUsd));let details=dimensions.valid===false?'output non valido':'output ~'+dimensions.width+' × '+dimensions.height+' px · prompt complessivo ~'+q.tokens+' token';if(q.ref){const w=Math.max(1,Math.round((q.ref.width||0)*q.factor)),h=Math.max(1,Math.round((q.ref.height||0)*q.factor));details+=' · riferimento '+w+' × '+h+' px'}
 box.innerHTML='<strong>Stima consumo Puter</strong><span>~ '+aiCreditText(q.usd)+' · '+aiUsdText(q.usd)+'<small class="estimate-detail">'+parts.join(' · ')+'<br>'+details+' · confidenza '+q.confidence+'</small></span>'
};

const puterBillingBaseClearAllMemory=clearAllMemory;
clearAllMemory=async function(){await puterBillingBaseClearAllMemory();resetPuterPricingMemory()};
const puterBillingBaseInit=init;
init=async function(){await puterBillingBaseInit();const refresh=$('aiPricingRefresh');if(refresh)refresh.onclick=async()=>{refresh.disabled=true;$('aiPricingStatus').setAttribute('aria-busy','true');try{await loadPuterImagePricing({force:true});toast('Prezziario Puter aggiornato')}finally{refresh.disabled=false;$('aiPricingStatus').removeAttribute('aria-busy')}};renderPuterPricingStatus();loadPuterImagePricing().catch(console.warn)};
