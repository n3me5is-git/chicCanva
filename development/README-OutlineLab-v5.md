# OutlineLab v5

La versione pronta da usare è in **build/OutlineLab_v5/**:

- **OutlineLab_v5.html**: tutta l'app in un solo file, circa 1,4 MB.
- **OutlineLab_v5_server.bat**: launcher Windows, usa solo PowerShell/.NET già presenti in Windows. Nessun Python, Node, npm o installazione richiesta.

Aprire il BAT per usare http://localhost:8000/. Chiudere prima un eventuale vecchio server sulla stessa porta. Il server serve solo l'HTML; non richiede cartelle di asset. Il browser viene aperto dopo l'avvio del listener. Chiudere la finestra del BAT ferma il server.

È possibile aprire direttamente l'HTML. L'editor, immagini locali, crop, rimozione di uno sfondo uniforme, import/export e PDF non richiedono un webserver. Cataloghi, font non ancora caricati e OpenMoji richiedono rete. Puter e rimozione AI dello sfondo richiedono il webserver. Le librerie Fabric.js, jsPDF, IMG.LY e ONNX sono incorporate nell'HTML; Puter, cataloghi/font e modelli sono risorse online. Single HTML non significa che tutti i servizi e modelli siano disponibili offline.

## Modifiche

- Un solo widget Aggiungi testo per le tre modalità. In custom: frase unica oppure lettere/emoji separate. Il nuovo testo si aggiunge agli oggetti esistenti; nella modalità singola vengono aggiunte nuove pagine. Rigenera mantiene disponibile la ricostruzione dell'intera modalità, con conferma esplicita della sostituzione.
- Adattamento proporzionale: contieni, larghezza oppure altezza; margine 8%. Le due modalità per asse possono eccedere l'altro asse. Nessun limite artificiale di ingrandimento a 3×. Il testo viene misurato dopo il caricamento del font.
- Scala batch aggiornata immediatamente, anche sulla pagina aperta. Conferma fissa la nuova base al 100%. Testi senza cache raster di oggetto; rendering della vista adeguato allo zoom, entro un limite di memoria.
- Pagina centrata nello spazio disponibile, pannello ridimensionabile/richiudibile, zoom Fit/percentuali/+/−/Ctrl+rotella e manina. Orientamento e formato custom aggiornano subito la vista; cambi di orientamento o pannello ripristinano Fit.
- Preview multipagina a griglia, dimensioni regolabili, caricamento delle anteprime durante lo scorrimento; clic su una miniatura per aprire la pagina.
- OpenMoji con dimensioni SVG esplicite; normalizzazione anche degli asset SVG importati. Selezioni multiple salvate in coordinate corrette, comprese le trasformazioni.
- Pulsante Elimina visibile nella toolbar, CANC invariato. Su desktop la toolbar va a capo; su mobile scorre lateralmente. Pannello mobile sovrapposto richiudibile, chiuso all'avvio.
- Puter mantenuto; aggiunti Da prompt e dieci preset. Non sono state eseguite generazioni AI a pagamento durante la verifica.
- Crop non distruttivo, export PNG/PDF, griglia, snap, immagini e JSON compatibili v4 mantenuti.

## Rimozione dello sfondo

**AI · soggetti e fotografie:** IMG.LY 1.7.0 e ONNX Runtime 1.21.0 incorporati nell'HTML. Non viene più scaricato il modulo da esm.sh, che risultava bloccato nel browser. Modello quantizzato su CPU, un thread: non richiede SharedArrayBuffer o intestazioni COOP/COEP che potrebbero interferire con Puter. Al primo utilizzo scarica circa **56 MB** da staticimgly.com. Nessuna immagine viene inviata a servizi esterni. SVG e altri formati vengono convertiti in PNG prima dell'elaborazione. Crea una copia conservando originale, posizione relativa, rotazione e crop.

**Sfondo uniforme · disegni e lineart:** alternativa incorporata senza modello o rete. Selezionare il colore dello sfondo e la tolleranza; inizialmente viene eliminata solo l'area collegata ai bordi. Una checkbox permette di eliminare lo stesso colore anche all'interno delle forme. Adatta per disegni outlined per cui la segmentazione fotografica potrebbe cancellare il soggetto.

`ERR_BLOCKED_BY_CLIENT` indica una risorsa bloccata dal client (per esempio un'estensione/filtro). Il vecchio launcher non era la causa di quel blocco: gli header CORS del server locale non cambiano le risposte dei CDN. Il nuovo launcher serve il nuovo nome file. Un server precedente può servire lo stesso HTML aggiornandone il percorso.

Se staticimgly.com è bloccato, il modello AI non può essere scaricato: autorizzare quel dominio per l'app oppure usare Sfondo uniforme. Il messaggio Puter sul tentativo di impostare Origin proviene dall'SDK; il launcher non prova a impostare quell'header di richiesta.

## Verifiche

23 controlli eseguiti nel browser Chromium dell'app:

- testo iniziale ed emoji; fit larghezza; scala immediata e persistente;
- orientamento e caricamenti concorrenti senza duplicati;
- custom come frase o singoli caratteri; selezioni multiple e serializzazione;
- dimensioni SVG, crop ruotato e reset;
- rimozione sfondo uniforme, conservazione originale, foreground e trasparenza;
- export PNG con dimensioni corrette;
- rimozione AI su fotografia pubblica scikit-image/NASA con verifica dei pixel opachi e trasparenti;
- JSON con asset e roundtrip; centratura e foglio contenuto nel viewport.

Verificati visivamente preview multipagina e layout mobile 390×844. Sintassi JavaScript valida; nessun ID duplicato o riferimento DOM mancante. Verificato il comando PowerShell del BAT con risposta HTTP 200 e MIME text/html UTF-8. L'apertura diretta file:// non è stata verificata dal browser automatico perché la sua policy blocca gli URL file; il codice mantiene tale modalità. Il test mobile è un viewport simulato, non una prova su dispositivo fisico.

I file v4 originali sono conservati. La cartella build contiene esclusivamente HTML e BAT.

## Licenze e sviluppo

Fabric.js/jsPDF/ONNX: MIT. IMG.LY: AGPL-3.0; sorgente del modulo incorporato con import del runtime locale e un thread. OpenMoji: CC BY-SA 4.0, HfG Schwäbisch Gmünd e collaboratori. Font: licenze dei rispettivi autori. Attribuzioni disponibili anche nell'app. Riferimento: https://github.com/imgly/background-removal-js.

Il file HTML alla radice è la sorgente completa della versione distribuita. Gli script di migrazione e i download intermedi in development documentano il lavoro; non sono dipendenze dell'app. I test sono in tests; il generatore crea una copia strumentata dell'HTML, da servire localmente solo per lo sviluppo.
