// Puter account accounting and local image-price estimates.
// The live APIs are deliberately isolated here: estimates never block editing.
const PUTER_CREDITS_PER_USD=2000;
const PUTER_IMAGE_PRICING_SCHEMA=2;
const PUTER_IMAGE_PRICING_CACHE_KEY='chiccanva.puter-image-pricing.v1';
const PUTER_IMAGE_ACTUAL_CACHE_KEY='chiccanva.puter-image-actual-cost.v1';
const PUTER_IMAGE_PRICING_TTL_MS=30*24*60*60*1000;
const PUTER_IMAGE_PRICING_URL='https://api.puter.com/puterai/image/models/details';
const PUTER_IMAGE_PRICING_FALLBACK=Object.freeze({
 creditsPerUSD:PUTER_CREDITS_PER_USD,
 models:{
  'openai/gpt-image-2.5-flare':{kind:'openai-token-image',textInputPer1M:5,imageInputPer1M:8,imageOutputPer1M:30},
  'openai/gpt-image-2.5-sunburst':{kind:'openai-token-image',textInputPer1M:5,imageInputPer1M:8,imageOutputPer1M:30},
  'openai/gpt-image-2':{kind:'openai-token-image',textInputPer1M:5,imageInputPer1M:8,imageOutputPer1M:30},
  'x-ai/grok-imagine-image':{kind:'per-image-tier',outputUsd:{'1k':.02,'2k':.02},referenceUsd:.002},
  'x-ai/grok-imagine-image-quality':{kind:'per-image-tier',outputUsd:{'1k':.05,'2k':.07},referenceUsd:.01},
  'byteplus/seedream-5-0-lite-260128':{kind:'per-image',outputUsd:.035},
  'google/gemini-3.1-flash-lite-image':{kind:'gemini-token-image',textInputPer1M:.25,textOutputPer1M:1.5,imageOutputPer1M:30,outputTokensByTier:{'1k':1120}}
 }
});
let puterImagePricing=structuredClone(PUTER_IMAGE_PRICING_FALLBACK),puterPricingMeta={source:'incorporato',fetchedAt:0,stale:false};

function puterFinite(value){if(value===null||value===undefined||value==='')return null;const n=Number(value);return Number.isFinite(n)?n:null}
function puterAmountToUsd(amount,unit='credits'){
 const n=puterFinite(amount);if(n===null)return null;switch(String(unit||'credits').toLowerCase()){
  case'credit':case'credits':return n/(puterImagePricing.creditsPerUSD||PUTER_CREDITS_PER_USD);
  case'microcent':case'microcents':case'usd-microcents':return n/100000000;
  case'cent':case'cents':case'usd-cents':return n/100;
  case'usd':case'dollar':case'dollars':return n;default:return null
 }
}
function puterAmountToCredits(amount,unit='credits'){const usd=puterAmountToUsd(amount,unit);return usd===null?null:usd*(puterImagePricing.creditsPerUSD||PUTER_CREDITS_PER_USD)}
function puterCreditsSource(amount,unit='credits'){const value=puterAmountToCredits(amount,unit);return value===null?'—':Math.round(value).toLocaleString(appLocale())+' crediti'}
function puterCreditsLabel(amount,unit='credits'){return t(puterCreditsSource(amount,unit))}
function puterUsdLabel(amount,unit='credits',digits=2){const value=puterAmountToUsd(amount,unit);return value===null?'—':'US$ '+value.toLocaleString(typeof appLocale==='function'?appLocale():'it-IT',{minimumFractionDigits:digits,maximumFractionDigits:digits})}
function puterBalanceSource(amount,unit='credits'){return amount==null?'—':puterCreditsSource(amount,unit)+' · '+puterUsdLabel(amount,unit,2)}
function puterBalanceLabel(amount,unit='credits'){return t(puterBalanceSource(amount,unit))}
function derivePuterConsumed(monthly={}){
 const info=monthly?.allowanceInfo||{},usage=monthly?.usage||{},allowanceUsed=puterFinite(usage.allowanceUsed),purchaseUsed=puterFinite(info?.addons?.consumedPurchaseCredits);
 if(allowanceUsed!==null&&purchaseUsed!==null)return{value:Math.max(0,allowanceUsed)+Math.max(0,purchaseUsed),source:'usage.allowanceUsed+addons.consumedPurchaseCredits',confidence:'reported-components'};
 const total=puterFinite(usage.total);if(total!==null)return{value:Math.max(0,total),source:'usage.total',confidence:'reported-observed'};
 if(allowanceUsed!==null)return{value:Math.max(0,allowanceUsed),source:'usage.allowanceUsed',confidence:'reported-allowance-only'};
 const allowance=puterFinite(info.monthUsageAllowance)||0,purchased=puterFinite(info?.addons?.purchasedCredits)||0,remaining=puterFinite(info.remaining),capacity=allowance+purchased;
 if(remaining===null||remaining>capacity)return{value:null,source:remaining===null?null:'derived-capacity-mismatch',confidence:'unknown'};
 return{value:Math.max(0,capacity-remaining),source:'monthly+purchased-remaining',confidence:'derived'}
}
async function getPuterBillingSnapshot(){
 const [user,monthly]=await Promise.all([puter.auth.getUser(),puter.auth.getMonthlyUsage()]),info=monthly?.allowanceInfo||{},unit=info.unit||'credits',consumed=derivePuterConsumed(monthly),monthlyAllowance=puterFinite(info.monthUsageAllowance),allowanceUsed=puterFinite(monthly?.usage?.allowanceUsed),purchasedCredits=puterFinite(info?.addons?.purchasedCredits)||0,purchasedUsed=puterFinite(info?.addons?.consumedPurchaseCredits),monthlyRemaining=monthlyAllowance===null?null:Math.max(0,monthlyAllowance-Math.max(0,allowanceUsed||0)),purchasedRemaining=Math.max(0,purchasedCredits-Math.max(0,purchasedUsed||0)),derivedRemaining=(monthlyRemaining===null?0:monthlyRemaining)+purchasedRemaining,reportedRemaining=puterFinite(info.remaining);let appUsage=null;
 if(puter.auth.getDetailedAppUsage&&puter.auth.appID){try{appUsage=await puter.auth.getDetailedAppUsage(puter.auth.appID)}catch(error){console.warn('Uso Puter dell’app non disponibile',error)}}
 const hasComponentBalance=monthlyAllowance!==null||purchasedCredits>0||allowanceUsed!==null||purchasedUsed!==null;
 return{user,monthly,appUsage,unit,monthlyAllowance,allowanceUsed,purchasedCredits,purchasedUsed,monthlyRemaining,purchasedRemaining,remaining:reportedRemaining!==null?reportedRemaining:(hasComponentBalance?derivedRemaining:null),reportedRemaining,consumed}
}
function renderPuterBilling(snapshot){
 const{user,appUsage,unit,monthlyAllowance,allowanceUsed,purchasedCredits,purchasedUsed,monthlyRemaining,purchasedRemaining,remaining,consumed}=snapshot,knownCapacity=Math.max(0,(monthlyAllowance||0)+(purchasedCredits||0)),percent=remaining!==null&&knownCapacity>0?clamp(remaining/knownCapacity*100,0,100):0,box=$('puterUsage');box.classList.remove('hidden');
 $('puterUsageBar').style.width=percent+'%';box.querySelector('[role="progressbar"]')?.setAttribute('aria-valuenow',String(Math.round(percent)));
 setLocalizedTextParts($('puterUsageUsed'),'Usato',' ',puterBalanceSource(consumed.value,unit));setLocalizedTextParts($('puterUsageRemaining'),'Disponibile',' '+Math.round(percent)+'% · ',puterBalanceSource(remaining,unit));
 setLocalizedText($('puterAccountType'),user?.subscribed===true?'Subscription':'Free / senza abbonamento');const renderBreakdown=(element,total,used,left)=>{const strong=document.createElement('strong'),detail=document.createElement('span');setLocalizedText(strong,puterBalanceSource(total,unit));setLocalizedTextParts(detail,'Usati:',' ',puterCreditsSource(used,unit),' · ','Residui:',' ',puterCreditsSource(left,unit));element.replaceChildren(strong,detail)};renderBreakdown($('puterMonthlyAllowance'),monthlyAllowance,allowanceUsed,monthlyRemaining);renderBreakdown($('puterTopupCredits'),purchasedCredits,purchasedUsed,purchasedRemaining);
 const appTotal=puterFinite(appUsage?.total),appUnit=appUsage?.unit||unit;if(appTotal===null)setLocalizedText($('puterAppUsage'),'Non disponibile');else $('puterAppUsage').textContent=puterBalanceLabel(appTotal,appUnit);
 const source=consumed.confidence==='derived'?'consumo ricavato dal saldo':'consumo comunicato da Puter',time=new Date().toLocaleTimeString(appLocale(),{hour:'2-digit',minute:'2-digit'});setLocalizedTextParts($('puterUsageDetail'),'La barra mostra il saldo globale residuo rispetto alla capacità nota (allowance + top-up). Puter scala prima l’allowance mensile, poi i crediti acquistati.',' ',source,' · ','aggiornato',' '+time+'. ','L’uso chicCanva è una lettura separata limitata a questa app.')
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
function readPuterPricingCache(){try{const value=JSON.parse(localStorage.getItem(PUTER_IMAGE_PRICING_CACHE_KEY)||'null');return value?.schemaVersion===PUTER_IMAGE_PRICING_SCHEMA&&value.db&&puterFinite(value.fetchedAt)!==null?value:null}catch{return null}}
function writePuterPricingCache(db){const value={schemaVersion:PUTER_IMAGE_PRICING_SCHEMA,fetchedAt:Date.now(),sourceUrl:PUTER_IMAGE_PRICING_URL,db};localStorage.setItem(PUTER_IMAGE_PRICING_CACHE_KEY,JSON.stringify(value));return value}
function renderPuterPricingStatus(extra=''){const el=$('aiPricingStatus');if(!el)return;const date=puterPricingMeta.fetchedAt?new Date(puterPricingMeta.fetchedAt).toLocaleDateString('it-IT'):'';el.textContent=extra||(puterPricingMeta.source==='live'?'Prezzi Puter aggiornati '+date:puterPricingMeta.source==='cache'?'Prezzi Puter salvati '+date:'Prezziario incorporato')}
async function fetchPuterPricing(){const response=await fetch(PUTER_IMAGE_PRICING_URL,{headers:{Accept:'application/json'}});if(!response.ok)throw new Error('HTTP '+response.status);const type=response.headers.get('content-type')||'';if(!type.includes('json'))throw new Error('Risposta prezziario non JSON');return applyLivePuterPricing(PUTER_IMAGE_PRICING_FALLBACK,await response.json())}
async function loadPuterImagePricing({force=false}={}){
 const cached=readPuterPricingCache(),fresh=cached&&Date.now()-cached.fetchedAt<PUTER_IMAGE_PRICING_TTL_MS;if(cached){puterImagePricing=cached.db;puterPricingMeta={source:'cache',fetchedAt:cached.fetchedAt,stale:!fresh}}else{puterImagePricing=structuredClone(PUTER_IMAGE_PRICING_FALLBACK);puterPricingMeta={source:'incorporato',fetchedAt:0,stale:false}}
 renderPuterPricingStatus();updateAiEstimate?.();if(!force&&(fresh||location.protocol==='file:'))return puterImagePricing;
 try{const db=await fetchPuterPricing(),saved=writePuterPricingCache(db);puterImagePricing=db;puterPricingMeta={source:'live',fetchedAt:saved.fetchedAt,stale:false};renderPuterPricingStatus();updateAiEstimate?.();return db}catch(error){console.warn('Aggiornamento prezziario Puter non riuscito',error);renderPuterPricingStatus(cached?'Prezzi salvati conservati · aggiornamento non riuscito':'Prezzi incorporati · aggiornamento non riuscito');return puterImagePricing}
}
function resetPuterPricingMemory(){localStorage.removeItem(PUTER_IMAGE_PRICING_CACHE_KEY);puterImagePricing=structuredClone(PUTER_IMAGE_PRICING_FALLBACK);puterPricingMeta={source:'incorporato',fetchedAt:0,stale:false};renderPuterPricingStatus();updateAiEstimate?.()}

function puterActualCostCache(){try{return JSON.parse(localStorage.getItem(PUTER_IMAGE_ACTUAL_CACHE_KEY)||'{}')||{}}catch{return{}}}
function aiEstimateSignature(q=aiEstimateBreakdown()){
 const d=q.dimensions||{},reference=q.ref?'ref-'+aiReferenceFactor():'no-ref';return[q.profile.model,q.quality,d.width+'x'+d.height,q.ratio,reference].join('|')
}
function detailedAppUsageCredits(value){const total=puterFinite(value?.total);return total===null?null:puterAmountToCredits(total,value?.unit||'credits')}
async function readPuterAppUsageCredits(){if(!window.puter?.auth?.getDetailedAppUsage||!puter.auth.appID)return null;return detailedAppUsageCredits(await puter.auth.getDetailedAppUsage(puter.auth.appID))}
async function recordPuterGenerationUsage(before,signature){
 if(before===null||!signature)return;let after=null;for(const delay of [0,900,1800]){if(delay)await new Promise(resolve=>setTimeout(resolve,delay));try{after=await readPuterAppUsageCredits()}catch{}if(after!==null&&after>before)break}const credits=after===null?null:after-before;if(!(credits>0))return;
 const cache=puterActualCostCache();cache[signature]={credits,usd:credits/(puterImagePricing.creditsPerUSD||PUTER_CREDITS_PER_USD),at:Date.now()};const entries=Object.entries(cache).sort((a,b)=>b[1].at-a[1].at).slice(0,100);localStorage.setItem(PUTER_IMAGE_ACTUAL_CACHE_KEY,JSON.stringify(Object.fromEntries(entries)));updateAiEstimate();refreshPuterUsage?.(true)
}

aiEquivalentCredits=function(usd){return Number(usd||0)*(puterImagePricing.creditsPerUSD||PUTER_CREDITS_PER_USD)};
aiUsdText=function(value){return 'US$ '+Number(value||0).toLocaleString(typeof appLocale==='function'?appLocale():'it-IT',{minimumFractionDigits:3,maximumFractionDigits:3})};
function aiCreditSource(value){return Math.round(aiEquivalentCredits(value)).toLocaleString(appLocale())+' crediti'}
aiCreditText=function(value){return t(aiCreditSource(value))};
aiEstimateBreakdown=function(){
 const profile=aiProfile(),spec=puterImagePricing.models[profile.model]||PUTER_IMAGE_PRICING_FALLBACK.models[profile.model],quality=$('aiQuality')?.value||profile.defaultQuality,prompt=aiFullPrompt(true),tokens=Math.max(1,Math.ceil(prompt.length/3.7)),ref=state.aiReference,factor=aiReferenceFactor(),ratio=aiSelectedRatio(),dimensions=aiResolutionDimensions(profile,ratio),w=Math.max(1,dimensions.width||1024),h=Math.max(1,dimensions.height||1024),tier=String($('aiResolution')?.value||'1k').toLowerCase();let outputUsd=0,promptUsd=0,referenceUsd=0,confidence='medium';
 if(spec?.kind==='openai-token-image'){const calculated=aiOpenAiOutputEstimate(profile,quality,{width:w,height:h});outputUsd=calculated.tokens*spec.imageOutputPer1M/1e6;promptUsd=tokens*spec.textInputPer1M/1e6;if(ref){const rw=Math.max(1,Math.round((ref.width||0)*factor)),rh=Math.max(1,Math.round((ref.height||0)*factor));referenceUsd=aiOpenAiReferenceProxyTokens(rw,rh)*spec.imageInputPer1M/1e6}confidence=referenceUsd?'medium':calculated.confidence}
 else if(spec?.kind==='per-image-tier'){outputUsd=spec.outputUsd?.[tier]??spec.outputUsd?.['1k']??profile.usd;referenceUsd=ref?(spec.referenceUsd||0):0;confidence='high'}
 else if(spec?.kind==='per-image'){outputUsd=spec.outputUsd||profile.usd;referenceUsd=0;confidence='high'}
 else if(spec?.kind==='gemini-token-image'){const outputTokens=spec.outputTokensByTier?.[tier]||spec.outputTokensByTier?.['1k']||1120;outputUsd=outputTokens*spec.imageOutputPer1M/1e6;promptUsd=tokens*spec.textInputPer1M/1e6;if(ref){const rw=Math.max(1,Math.round((ref.width||0)*factor)),rh=Math.max(1,Math.round((ref.height||0)*factor)),tiles=Math.max(1,Math.ceil(rw/768)*Math.ceil(rh/768));referenceUsd=tiles*258*spec.textInputPer1M/1e6}confidence='medium'}
 else{outputUsd=profile.qualityUsd?.[quality]||profile.usd;confidence='low'}
 return{profile,spec,quality,prompt,tokens,ref,factor,ratio,dimensions,outputUsd,promptUsd,referenceUsd,usd:outputUsd+promptUsd+referenceUsd,confidence}
};
function aiEstimateMethodText(q){const kind=q.spec?.kind;if(kind==='openai-token-image')return t('Output OpenAI: formula ufficiale basata su griglia qualità e dimensioni.')+(q.ref?' '+t('Riferimento: proxy a token visivi; resta autorevole il consumo misurato dopo la generazione.'):'');if(kind==='per-image-tier')return t('xAI: tariffa output fissa per il livello 1K/2K selezionato.')+(q.ref?' '+t('Si aggiunge la tariffa ufficiale per il riferimento.'):'');if(kind==='per-image')return t('Tariffa Puter fissa per generazione Seedream; non è pubblicato un sovrapprezzo separato per il riferimento.');if(kind==='gemini-token-image')return t('Gemini: token immagine output alla tariffa ufficiale 1K.')+(q.ref?' '+t('Riferimento stimato con le regole Google per i tile visivi.'):'');return t('Stima di riserva dal prezziario incorporato.')}
updateAiEstimate=function(){
 const box=$('aiCostEstimate');if(!box)return;const q=aiEstimateBreakdown(),dimensions=q.dimensions,parts=['output ~'+aiCreditText(q.outputUsd)];if(q.promptUsd)parts.push(t('testo')+' ~'+aiCreditText(q.promptUsd));if(q.referenceUsd)parts.push(t('riferimento')+' ~'+aiCreditText(q.referenceUsd));let details=dimensions.valid===false?t('output non valido'):'output ~'+dimensions.width+' × '+dimensions.height+' px · '+t('prompt complessivo')+' ~'+q.tokens+' token';if(q.ref){const w=Math.max(1,Math.round((q.ref.width||0)*q.factor)),h=Math.max(1,Math.round((q.ref.height||0)*q.factor));details+=' · '+t('riferimento')+' '+w+' × '+h+' px'}
 const listCredits='~ '+aiCreditText(q.usd),listUsd=aiUsdText(q.usd),actual=$('aiLastGeneration'),last=puterActualCostCache()[aiEstimateSignature(q)],value=$('aiCostEstimateValue'),mainline=document.createElement('span'),usd=document.createElement('span');mainline.className='ai-estimate-mainline';usd.className='ai-estimate-usd';if(last){const lastCredits=Math.round(last.credits).toLocaleString(appLocale())+' crediti';setLocalizedTextParts(mainline,'Ultima Gen:',' ',lastCredits);usd.textContent=aiUsdText(last.usd)}else{setLocalizedTextParts(mainline,'Stima Listino:',' ','~ ',aiCreditSource(q.usd));usd.textContent=listUsd}value.replaceChildren(mainline,usd);$('aiCostEstimateDetail').replaceChildren(document.createTextNode(parts.join(' · ')),document.createElement('br'),document.createTextNode(details+' · '+t('confidenza')+' '+q.confidence),document.createElement('br'),document.createTextNode(aiEstimateMethodText(q)));if(actual){actual.classList.toggle('hidden',!last);if(last)setLocalizedTextParts(actual,'Stima Listino:',' ','~ ',aiCreditSource(q.usd),' · ',listUsd);else actual.textContent=''}
};

const puterBillingBaseClearAllMemory=clearAllMemory;
clearAllMemory=async function(){await puterBillingBaseClearAllMemory();localStorage.removeItem(PUTER_IMAGE_ACTUAL_CACHE_KEY);resetPuterPricingMemory()};
const puterBillingBaseInit=init;
init=async function(){await puterBillingBaseInit();const refresh=$('aiPricingRefresh');if(refresh)refresh.onclick=async()=>{refresh.disabled=true;$('aiPricingStatus').setAttribute('aria-busy','true');try{await loadPuterImagePricing({force:true});toast('Prezziario Puter aggiornato')}finally{refresh.disabled=false;$('aiPricingStatus').removeAttribute('aria-busy')}};renderPuterPricingStatus();loadPuterImagePricing().catch(console.warn)};
