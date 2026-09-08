// PWA support is activated only on a real HTTPS domain. The local launcher and file:// stay ordinary web pages.
let deferredPwaInstall=null,pwaRegistration=null,pwaReloading=false;
function pwaDomainAllowed(loc=location){
 const protocol=String(loc.protocol||'').toLowerCase(),host=String(loc.hostname||'').toLowerCase().replace(/^\[|\]$/g,'');
 if(protocol!=='https:'||!host||!host.includes('.'))return false;
 if(host==='localhost'||host.endsWith('.localhost')||host.endsWith('.local')||host.endsWith('.lan')||host.endsWith('.internal')||host.endsWith('.home.arpa'))return false;
 if(host==='::1'||host.includes(':')||/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host))return false;
 return true;
}
function pwaStandalone(){return matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: window-controls-overlay)').matches||navigator.standalone===true}
function pwaPlatform(){const ua=navigator.userAgent||'',touchMac=navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1;if(/iphone|ipad|ipod/i.test(ua)||touchMac)return'ios';if(/android/i.test(ua))return'android';if(/macintosh|mac os x/i.test(ua))return'mac';return'desktop'}
function setPwaInstallVisible(visible){const button=$('installPwaBtn');if(button)button.classList.toggle('hidden',!visible)}
function fillPwaSteps(items){const list=$('pwaInstallSteps');list.replaceChildren(...items.map(item=>{const li=document.createElement('li');li.textContent=item;return li}))}
function showPwaInstructions(){
 const platform=pwaPlatform(),confirm=$('pwaInstallConfirm');confirm.classList.toggle('hidden',!deferredPwaInstall);
 if(deferredPwaInstall){$('pwaInstallLead').textContent='Installa l’editor in una finestra dedicata e ritrovalo tra le tue app.';fillPwaSteps(['Premi Installa.','Conferma la finestra proposta dal browser.','Apri chicCanva dall’icona aggiunta al dispositivo.'])}
 else if(platform==='ios'){$('pwaInstallLead').textContent='Su iPhone e iPad l’installazione si completa dal menu Condividi di Safari.';fillPwaSteps(['Apri questa pagina in Safari.','Tocca Condividi nella barra di Safari.','Scegli Aggiungi alla schermata Home e conferma con Aggiungi.'])}
 else if(platform==='mac'){$('pwaInstallLead').textContent='Puoi aggiungere chicCanva alle app dal menu del browser.';fillPwaSteps(['In Safari apri File e scegli Aggiungi al Dock.','In Chrome o Edge apri il menu del browser e scegli Installa chicCanva.','Conferma per creare l’icona dell’app.'])}
 else{$('pwaInstallLead').textContent='Il browser può installare chicCanva dal proprio menu.';fillPwaSteps(['Apri il menu del browser.','Scegli Installa app oppure Aggiungi alla schermata Home.','Se la voce non compare, apri il dominio con Chrome, Edge o un browser che supporta le PWA.'])}
 $('pwaInstallDialog').showModal();
}
async function promptPwaInstall(){
 if(!deferredPwaInstall){showPwaInstructions();return}
 const promptEvent=deferredPwaInstall;deferredPwaInstall=null;setPwaInstallVisible(false);
 try{await promptEvent.prompt();const choice=await promptEvent.userChoice;if(choice?.outcome==='accepted')toast('chicCanva è stata aggiunta alle app');else if(!pwaStandalone())setPwaInstallVisible(true)}catch(error){console.error(error);setPwaInstallVisible(true);showPwaInstructions()}
}
function injectPwaMetadata(){
 if(!document.querySelector('link[rel="manifest"]')){const manifest=document.createElement('link');manifest.rel='manifest';manifest.href='./chicCanva.webmanifest';document.head.append(manifest)}
 if(!document.querySelector('link[rel="apple-touch-icon"]')){const apple=document.createElement('link');apple.rel='apple-touch-icon';apple.href='./chiccanva-192.png';document.head.append(apple)}
 const metas=[['theme-color','#298879'],['apple-mobile-web-app-capable','yes'],['apple-mobile-web-app-status-bar-style','default'],['apple-mobile-web-app-title','chicCanva']];
 for(const[name,content]of metas){if(document.head.querySelector('meta[name="'+name+'"]'))continue;const meta=document.createElement('meta');meta.name=name;meta.content=content;document.head.append(meta)}
 if($('pwaDialogIcon'))$('pwaDialogIcon').src='./chiccanva-192.png';
}
async function setupDomainPwa(){
 const allowed=pwaDomainAllowed();document.documentElement.dataset.pwa=allowed?'domain':'off';
 if(!allowed){setPwaInstallVisible(false);return}
 injectPwaMetadata();const standalone=pwaStandalone();setPwaInstallVisible(!standalone);
 if(!standalone)window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredPwaInstall=event;setPwaInstallVisible(true)});
 if(!standalone)window.addEventListener('appinstalled',()=>{deferredPwaInstall=null;setPwaInstallVisible(false);$('pwaInstallDialog')?.close();toast('chicCanva installata: la trovi tra le tue app')});
 if('serviceWorker'in navigator){try{pwaRegistration=await navigator.serviceWorker.register('./chicCanva-sw.js',{scope:'./'});const offerUpdate=()=>{if(pwaRegistration.waiting&&navigator.serviceWorker.controller)$('pwaUpdateBar')?.classList.remove('hidden')};offerUpdate();pwaRegistration.addEventListener('updatefound',()=>{const worker=pwaRegistration.installing;if(worker)worker.addEventListener('statechange',()=>{if(worker.state==='installed')offerUpdate()})});navigator.serviceWorker.addEventListener('controllerchange',()=>{if(pwaReloading)location.reload()})}catch(error){console.error('Registrazione PWA non riuscita',error)}}
}
if($('installPwaBtn'))$('installPwaBtn').onclick=()=>deferredPwaInstall?promptPwaInstall():showPwaInstructions();
if($('pwaInstallConfirm'))$('pwaInstallConfirm').onclick=()=>{$('pwaInstallDialog').close();promptPwaInstall()};
if($('pwaInstallCancel'))$('pwaInstallCancel').onclick=()=>$('pwaInstallDialog').close();
if($('pwaUpdateNow'))$('pwaUpdateNow').onclick=()=>{const worker=pwaRegistration?.waiting;if(worker){pwaReloading=true;$('pwaUpdateNow').disabled=true;worker.postMessage({type:'SKIP_WAITING'})}else location.reload()};
if($('pwaUpdateLater'))$('pwaUpdateLater').onclick=()=>$('pwaUpdateBar').classList.add('hidden');
setupDomainPwa();
