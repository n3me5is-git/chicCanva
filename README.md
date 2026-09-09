# chicCanva

chicCanva è una mini app di composizione per cartelloni, scritte, schede e materiale didattico. Chicca, la piccola insegnante, è la mascotte del progetto.

L'editor finale è un unico file HTML. Lo stesso file può essere aperto direttamente con funzioni limitate, servito dal launcher Windows per abilitare le funzioni HTTP oppure pubblicato su un dominio HTTPS e installato come PWA. Il progetto sorgente resta modulare per rendere modifiche, test e documentazione gestibili.

## Avvio rapido

| Scenario | Cosa aprire | Note |
|---|---|---|
| Uso immediato senza server | `chicCanva.html` | Editor e funzioni locali; i widget che richiedono HTTP sono disabilitati. |
| Windows con funzioni complete | `build/chicCanva/chicCanva_server.bat` | Avvia `http://localhost:8000/`; usa solo PowerShell/.NET. |
| Hosting e installazione PWA | contenuto di `build/chicCanva-pwa/` | Richiede un dominio pubblico HTTPS. |
| Sviluppo | file modulari in `development/` | Non modificare direttamente gli HTML generati. |

## Build finale

La cartella `build/chicCanva/` contiene soltanto:

- `chicCanva.html`: l'app completa in un unico file HTML, con CSS, JavaScript, cataloghi e runtime incorporati.
- `chicCanva_server.bat`: server locale Windows basato solo su PowerShell e .NET già presenti nel sistema.

Il BAT apre `http://localhost:8000/`. Non richiede Python, Node, npm o installazioni. L'HTML si può aprire direttamente per l'editor e le funzioni locali; le sezioni che richiedono HTTP vengono disabilitate e mostrano il messaggio previsto.

## Build PWA per dominio

La cartella `build/chicCanva-pwa/` è pronta da pubblicare insieme su un dominio HTTPS:

- `index.html`: la stessa app completa e autosufficiente.
- `chicCanva.webmanifest`: nome, colori, avvio standalone e icone.
- `chicCanva-sw.js`: cache della struttura dell'app e delle risorse grafiche/font già richieste.
- `chiccanva-192.png` e `chiccanva-512.png`: icone installabili con Chicca.

Carica il contenuto della cartella mantenendo i cinque file nello stesso percorso. Il pulsante **Installa** compare soltanto su un vero dominio HTTPS. L'app non collega il manifest e non registra il service worker da `file://`, localhost, indirizzi IP, domini `.local` o reti private; il launcher locale continua quindi a comportarsi come prima.

La build pubblicabile include nome applicazione, descrizione, metadati Open Graph/Twitter con URL HTTPS assoluti, favicon incorporata e icona PWA da 512 px per le anteprime quando il link viene condiviso. Il dominio predefinito è `https://chiccanva.testthis.one/`; per un altro dominio esegui la build impostando `CHICCANVA_PUBLIC_URL` sul suo URL pubblico HTTPS. Il piè di pagina della sidebar collega il repository ufficiale. Su Chrome, Edge e Android il pulsante compatto apre il prompt nativo. Su iPhone/iPad mostra la procedura Safari **Condividi → Aggiungi alla schermata Home**. La struttura dell'app funziona offline dopo il primo caricamento; funzioni online come Puter, font non ancora scaricati e modelli AI continuano a richiedere rete. Ogni build usa una cache con versione propria e, quando è disponibile un aggiornamento, mostra un comando esplicito per applicarlo senza lasciare la PWA bloccata su una copia precedente.

## Architettura e sorgenti

`development/chic-v6-baseline.html` è la base integrata storica. `development/build-workspace.py` la compone con i moduli correnti:

- `workspace*`: progetti, pagine, gruppi, macro e navigazione;
- `enhancements*`: toolbar, sidebar e interazioni generali;
- `image-effects*`: B/N, outline, chroma key e pipetta;
- `final-upgrades*`: export unificato, immagini da URL/appunti e integrazioni Puter;
- `runtime-upgrades*`: pinch con pan simultaneo, stato account/login Puter e protezione delle azioni Puter;
- `search-translation.js`: dizionario didattico locale e traduzione opzionale con Gemma tramite Puter;
- `shapes*`: galleria vettoriale, modalità disegno isolata e modifica dei punti;
- `pdf-import*` e `development/vendor/pdf*`: interfaccia e motore PDF.js incorporato per convertire PDF locali in pagine PNG;
- `clipart*`: explorer Openclipart;
- `pwa*`: installazione, aggiornamenti e service worker;
- `pending.js`: persistenza, cronologia, OpenMoji e strategie mobile del remover;
- `build-guide.py`: fonte strutturata della guida italiana.

La build incorpora Fabric.js, jsPDF, PDF.js con worker, cataloghi font/OpenMoji e runtime IMG.LY/ONNX nell'HTML. I file grandi o variabili, come font scelti, SVG OpenMoji, modelli di segmentazione e servizi Puter/Openclipart, vengono richiesti quando servono. Lo stato modificabile usa descrittori di pagina e oggetto più un registro asset serializzato come Data URL.

Il flusso runtime è descritto nei dettagli in [Architettura tecnica](docs/TECHNICAL_ARCHITECTURE.md) e [Funzioni e processi](docs/FEATURES_AND_PROCESSES.md).

## Modificare e generare le build

Per sviluppare servono Python 3 e, preferibilmente, Node.js per il controllo sintattico degli script incorporati. Non esiste un passaggio `npm install`.

1. Modifica i moduli in `development/`, mai direttamente `chicCanva.html` o le copie in `build/`.
2. Aggiorna `development/build-guide.py`, la documentazione tecnica pertinente e i test quando cambia un comportamento.
3. Dalla root esegui:

```powershell
python development/build-workspace.py
python tests/build-v7-tests.py
python tests/check-chic-build.py
git diff --check
```

`build-workspace.py` legge la versione da `development/version.json`, genera automaticamente la data della build, incorpora PDF.js e il worker nel singolo HTML, rigenera la guida interna e la guida HTML autonoma, compone l'app, controlla con Node ogni blocco JavaScript inline quando Node è disponibile, aggiorna entrambe le distribuzioni e inserisce nel service worker un ID derivato dallo SHA-256 dell'HTML. Le tre copie dell'HTML devono risultare identiche byte per byte. La release corrente è **1.3.1**; per una nuova release modifica una sola volta `development/version.json` e ricostruisci.

La suite browser è `tests/v7-test.html`: servila via HTTP e usa un parametro nuovo, per esempio `?run=14`, per evitare vecchie cache. Il risultato deve terminare con `ALL V7 CHECKS COMPLETE`. Il flusso completo è in [Development workflow](docs/DEVELOPMENT_WORKFLOW.md).

## Hosting

Per il deploy copia insieme i cinque file di `build/chicCanva-pwa/`. Servi `index.html` come HTML, il manifest come `application/manifest+json` e il service worker come JavaScript. È consigliato forzare la rivalidazione di `chicCanva-sw.js`; una copia vecchia trattenuta dal CDN può ritardare l'aggiornamento della PWA.

Il service worker deve rimanere nello stesso percorso dell'app per conservarne lo scope. Una Content Security Policy rigida deve consentire script/stili inline o usare hash generati, Blob Worker, Data/Blob image, Puter, provider font, OpenMoji, Openclipart e `staticimgly.com`. Le istruzioni operative complete sono in [Deploy](docs/DEPLOYMENT.md).

## Spazio di lavoro

- Un'unica modalità di pagina custom con formato, orientamento e nome indipendenti.
- Più progetti aperti in schede. Importa JSON apre sempre un nuovo progetto.
- Nuovo progetto, rinomina rapida con doppio clic/F2/menu contestuale, chiusura con avviso, esportazione rapida prima della chiusura e autosalvataggio di tutte le schede aperte.
- Pagine rinominabili rapidamente dal navigatore e dalla preview; riordino tramite trascinamento e frecce.
- Il pulsante `+` accanto al navigatore inserisce una pagina dopo quella attiva, con lo stesso formato.
- Preview regolabile con pagine verticali e orizzontali alla stessa scala del lato lungo.

## Testo, font ed emoji

- Un solo widget Aggiungi testo, con MAIUSCOLO, adattamento e inserimento come frase o come oggetti separati.
- Simboli associabili alla lettera precedente o successiva e apostrofo intelligente.
- Smart emoticon crea testo e OpenMoji separati dentro un gruppo divisibile.
- Raggruppa, dividi gruppo e splitta testo; i gruppi hanno selezione viola e supportano spostamento, scala e rotazione.
- Catalogo incorporato di 2.100 font con ricerca e categorie: cicciottelli, rotondi, squadrati, artistici, serif, sans serif, scrittura, monospazio e outline nativi.
- Anteprima separata del font corrente e della proposta del wizard. Il campione è `Outline`.
- Modalità Outline disattivabile per usare testo pieno. Colore iniziale di testo, bordi ed emoji outlined: nero.
- Catalogo completo OpenMoji con Più rilevanti, Tutte e categorie, ricerca globale, colore e spessore dei contorni outlined.
- Traduzione opzionale per Emoji e Clipart: dizionario locale prioritario sotto 500 KB e Gemma 4 31B tramite Puter soltanto per parole o frasi sconosciute quando l’account è collegato.

## Forme e disegno

- Oltre venti strumenti vettoriali: rettangoli, cerchi, poligoni, stelle, cuore, luna, frecce, fumetti, linee, spezzate e mano libera raw o levigata.
- La modalità disegno usa un cursore a croce e rende temporaneamente non interattivi gli oggetti esistenti, evitando spostamenti accidentali.
- Riempimento trasparente o colorato, contorno e spessore regolabili. Tutti i selettori colore ricevono la pipetta del canvas.
- Poligoni, stelle, fumetti e spezzate espongono vertici modificabili; tutte le forme supportano le normali operazioni di scala, stretch, rotazione, gruppo, blocco, copia ed export.
- Le forme restano vettoriali e vengono serializzate nel progetto senza creare asset raster.

## Funzioni speciali

La funzione Una lettera/gruppo per pagina può creare un progetto nuovo, aggiungere pagine al progetto aperto o rimpiazzarlo. Applica adattamento, simboli, apostrofo e Smart emoticon. **Mantieni dimensione costante** calcola una sola scala sulla frase o sul gruppo più ingombrante e la applica a tutte le pagine, centrandole come uno striscione uniforme.

Con Gruppi espliciti, `^` definisce la suddivisione. `questa^è una^prova` crea tre pagine con `questa`, `è una` e `prova`; le opzioni incompatibili vengono disabilitate.

## Immagini e AI

- Upload da file, appunti o URL, crop non distruttivo con anteprima traslucida dell’intera sorgente, reset senza deformazioni, ridimensionamento, rotazione e asset serializzati nel JSON.
- Il riquadro dell’immagine selezionata mostra pixel originali/visibili, peso compresso, RAM bitmap stimata, dimensione sul foglio e DPI effettivi. **Cambia risoluzione** sostituisce quell’oggetto a ¼×, ⅓×, ½×, 2×, 3× o 4×, mantenendo dimensione fisica, posizione e crop.
- Importazione PDF completamente locale: pagina specifica o tutte, nuovo progetto o append, pagine A4 con orientamento automatico/verticale/orizzontale e PNG a qualità 1×–3×.
- Il dialogo URL usa il fetch diretto per impostazione predefinita. **Usa Puter per scaricare l’immagine** abilita esplicitamente `puter.net.fetch()` per i siti che bloccano CORS; il traffico usa banda/quota dell’account Puter secondo il modello user-pays. Se il relay WebSocket Puter non risponde su localhost, il BAT aggiornato ripiega sul proprio downloader PowerShell, limitato alle immagini pubbliche e a 12 MB. La stessa scelta vale per i riferimenti AI.
- Le immagini copiate da browser o altre applicazioni possono essere incollate dal widget Immagini, dal widget Riferimento AI, dalla toolbar Incolla speciale o con Ctrl+V quando il browser consente l’accesso agli appunti.
- Duplica e converti in B/N con regolazione continua da resa netta “al tratto” a scala di grigi soft.
- Duplica e rendi outline con estrazione Sobel locale dei contorni e sensibilità regolabile; non usa servizi o modelli AI.
- Prepara disegno da colorare con AI usa la selezione come riferimento, apre il widget Puter e preimposta GPT Image 2, qualità low, stile Pagina da colorare e prompt. La richiesta parte soltanto quando l’utente preme Genera.
- Generazione Puter con provider, modello, qualità, formato, dieci preset di stile e immagine di riferimento opzionale da file, URL o canvas.
- Il widget AI nasconde i controlli finché l’utente non accede a Puter. Mostra account connesso, cambio account e logout; tutte le opzioni di fetch Puter richiamano lo stesso modale di accesso se la sessione manca.
- Quando l’utente è già collegato, il widget AI legge `puter.auth.getMonthlyUsage()` e mostra credito mensile usato e disponibile per chicCanva. I valori sono quelli restituiti da Puter, limitati alle chiamate dell’app, e vengono aggiornati dopo generazioni e download Puter.
- Il widget **Clipart** cerca nelle pagine pubbliche di Openclipart senza API key né catalogo incorporato. Offre keyword, categorie didattiche, paginazione, traduzione italiano→inglese opzionale tramite dizionario locale e Gemma Puter, anteprima grande, download reale e inserimento esplicito tramite Puter. Se il browser blocca la ricerca, il launcher aggiornato usa un endpoint locale limitato a Openclipart.
- La generazione AI può richiedere uno sfondo uniforme da chroma key: chicCanva aggiunge al prompt istruzioni per scegliere un colore distante da quelli del soggetto e per evitare texture, ombre e sfumature.
- La checkbox post elaborazione può conservare il risultato AI e crearne automaticamente un duplicato con sfondo rimosso.
- Rimozione sfondo uniforme locale per disegni e lineart, con rilevamento automatico del colore dominante sul bordo e rimozione predefinita anche delle aree interne. Una pipetta accanto a ogni selettore colore permette di campionare direttamente da qualunque oggetto visibile nel canvas.
- Rimozione AI locale con IMG.LY: modelli piccolo, medio e grande, CPU o WebGPU con ripiego CPU, spinner, avanzamento ed effetto scansione. L’elaborazione usa un worker temporaneo anche su desktop: al termine sessione e tensori vengono rimossi dalla RAM, mentre i file del modello restano nella cache del browser. Su mobile chicCanva forza inoltre il modello piccolo e riduce soltanto gli input eccessivi.
- IMG.LY e il runtime ONNX sono incorporati nell'HTML; il browser scarica da `staticimgly.com` soltanto il modello scelto e lo conserva nella cache. Questo elimina l'import dinamico da `esm.sh` che veniva bloccato nel prototipo precedente.
- La rimozione crea una copia e conserva sempre l'immagine originale.

## Canvas ed esportazione

- Zoom, Fit, pulsanti `+`/`−`, manina, Ctrl + rotella e pinch a due dita con pan simultaneo.
- Griglia e snap indipendenti, marquee selection, crop ed export di una regione in PDF, PNG o JPG.
- Copia, incolla, duplica, elimina, ordine livelli e menu contestuale. **Fissa posizione**, disponibile nel menu destro o tramite pressione lunga su touch, blocca movimento, scala e rotazione e viene conservato nel progetto.
- Lo strumento area di export disabilita temporaneamente l’interazione con gli oggetti, quindi il rettangolo può iniziare anche sopra una fotografia senza trascinarla.
- Esporta PDF dalla barra apre la scelta fra pagina corrente e tutte le pagine del progetto.
- Il centro **Esporta progetto o selezioni** produce PDF, una pagina PNG/JPG, una selezione oppure uno ZIP client-side con tutte le pagine e nomi file ripuliti.
- JSON autosufficiente con asset e storico annulla/ripristina opzionale.

## Sidebar, guida e mobile

Ogni sezione della sidebar è richiudibile e all'avvio tutte le sezioni sono chiuse. Espandi singolarmente è attivo per impostazione predefinita e mantiene aperto solo il widget in uso. I comandi in alto aprono o chiudono tutto e disattivano questa modalità. I collegamenti Pagina, Speciali, Testo, Font, Emoji, Forme, Immagini, AI ed Export aprono la sezione corretta prima di raggiungerla.

La guida integrata è pensata per l'utente finale: comprende 54 sezioni, 16 percorsi pratici, 21 domande frequenti, indice laterale collassabile e le stesse icone e scorciatoie dell'interfaccia. Su schermi piccoli la sidebar diventa un pannello sovrapposto, la toolbar scorre orizzontalmente e i controlli per riordinare le pagine restano utilizzabili senza trascinamento. Su dispositivi touch, il pinch a due dita combina zoom e spostamento del canvas nello stesso gesto.

Su viewport mobile dotati di touch, le maniglie di selezione e crop e i vertici modificabili delle forme hanno un segno leggermente più grande e un’area di presa invisibile ancora più ampia. La configurazione desktop con mouse rimane invariata.

L'autosalvataggio usa un record stabile in IndexedDB, conserva anche l'ultima copia completa precedente e mantiene un piccolo fallback sincrono quando le dimensioni lo consentono. L’area di lavoro serializzata contiene una sola rappresentazione del progetto attivo, evita copie profonde delle stringhe Data URL durante il cambio scheda e raggruppa le modifiche ravvicinate in una scrittura ogni 1,2 secondi. Gli asset vengono eliminati quando non sono più raggiungibili da pagine o cronologia, preservando l’ultimo riferimento AI e gli appunti interni. Questo permette alla PWA installata di proporre il recupero anche dopo una chiusura forzata o quando il puntatore locale alla sessione manca. Dopo la prima interazione chicCanva richiede inoltre al browser di rendere persistente lo spazio di archiviazione, se supportato.

In fondo alla sidebar **Carico chicCanva** riporta una stima del peso compresso degli asset dei progetti aperti, delle bitmap della pagina attiva e dell’uso/quota dello spazio browser. È un indicatore operativo e non sostituisce la misura della memoria di processo del browser.

## Scorciatoie principali

- `Ctrl+C` / `Ctrl+V`: copia e incolla, anche tra pagine e progetti.
- `Ctrl+D`: duplica.
- `Ctrl+G` / `Ctrl+Maiusc+G`: raggruppa / dividi gruppo.
- `Ctrl+Z` / `Ctrl+Y`: annulla / ripristina.
- `Ctrl+S`: esporta JSON.
- `CANC`: elimina.
- `F`, `H`, `V`: Fit, manina, selezione.
- `G`, `R`: griglia, rotazione.
- `Ctrl` + rotella: zoom.
- `F1`: guida.

## Verifiche

- 97 controlli funzionali v7 nel browser, tutti superati.
- Test reale del remover IMG.LY con modello piccolo su CPU, completato creando la copia trasparente.
- 424 ID HTML univoci e nessun riferimento DOM mancante.
- Sintassi valida per tutti i blocchi JavaScript.
- Build finale uguale alla sorgente generata e nessuna dipendenza dall'API Fontsource all'avvio.

## Documentazione

La cartella [`docs/`](docs/) contiene:

- la [guida utente HTML](docs/user-guide.html), generata dalla stessa fonte incorporata nell'app;
- architettura tecnica e UI/UX;
- analisi delle funzioni e dei processi interni;
- workflow di sviluppo e rilascio;
- guida a esecuzione, hosting, PWA e rollback;
- sicurezza, privacy, dipendenze e licenze;
- definizione e direzione del progetto.

[`CONTEXT.md`](CONTEXT.md) è il passaggio di consegne condensato per un agente AI o un nuovo maintainer. Questi documenti fanno parte dell'implementazione e devono essere aggiornati insieme alle funzionalità.

## Licenza

Il codice e la documentazione originali di chicCanva sono distribuiti con licenza MIT. I componenti incorporati o richiamati mantengono le proprie licenze: in particolare Fabric.js, jsPDF e ONNX Runtime sono MIT; PDF.js è Apache-2.0; IMG.LY background removal è AGPL-3.0; la grafica OpenMoji è CC BY-SA 4.0; ogni font mantiene la licenza della propria famiglia.

La licenza MIT non sostituisce gli obblighi AGPL o CC BY-SA delle relative parti. Chi pubblica o modifica una build deve conservare attribuzioni e sorgenti richiesti. Consulta [`LICENSE`](LICENSE) e [Sicurezza, privacy e licenze](docs/SECURITY_PRIVACY_LICENSING.md).
