# chicCanva

chicCanva è una mini app di composizione per cartelloni, scritte, schede e materiale didattico. Chicca, la piccola insegnante, è la mascotte del progetto.

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

Su Chrome, Edge e Android il pulsante apre il prompt nativo. Su iPhone/iPad mostra la procedura Safari **Condividi → Aggiungi alla schermata Home**. La struttura dell'app funziona offline dopo il primo caricamento; funzioni online come Puter, font non ancora scaricati e modelli AI continuano a richiedere rete.

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

## Funzioni speciali

La funzione Una lettera/gruppo per pagina può creare un progetto nuovo, aggiungere pagine al progetto aperto o rimpiazzarlo. Applica adattamento, simboli, apostrofo e Smart emoticon.

Con Gruppi espliciti, `^` definisce la suddivisione. `questa^è una^prova` crea tre pagine con `questa`, `è una` e `prova`; le opzioni incompatibili vengono disabilitate.

## Immagini e AI

- Upload da file o URL, crop non distruttivo, ridimensionamento, rotazione e asset serializzati nel JSON.
- Duplica e converti in B/N con regolazione continua da resa netta “al tratto” a scala di grigi soft.
- Duplica e rendi outline con estrazione Sobel locale dei contorni e sensibilità regolabile; non usa servizi o modelli AI.
- Prepara disegno da colorare con AI usa la selezione come riferimento, apre il widget Puter e preimposta GPT Image 2, qualità low, stile Pagina da colorare e prompt. La richiesta parte soltanto quando l’utente preme Genera.
- Generazione Puter con provider, modello, qualità, formato, dieci preset di stile e immagine di riferimento opzionale da file, URL o canvas.
- Rimozione sfondo uniforme locale per disegni e lineart.
- Rimozione AI locale con IMG.LY: modelli piccolo, medio e grande, CPU o WebGPU con ripiego CPU, spinner, avanzamento ed effetto scansione.
- IMG.LY e il runtime ONNX sono incorporati nell'HTML; il browser scarica da `staticimgly.com` soltanto il modello scelto e lo conserva nella cache. Questo elimina l'import dinamico da `esm.sh` che veniva bloccato nel prototipo precedente.
- La rimozione crea una copia e conserva sempre l'immagine originale.

## Canvas ed esportazione

- Zoom, Fit, pulsanti `+`/`−`, manina e Ctrl + rotella.
- Griglia e snap indipendenti, marquee selection, crop ed export regione PNG.
- Copia, incolla, duplica, elimina, ordine livelli e menu contestuale.
- Esporta PDF dalla barra apre la scelta fra pagina corrente e tutte le pagine del progetto.
- JSON autosufficiente con asset e storico annulla/ripristina opzionale.

## Sidebar, guida e mobile

Ogni sezione della sidebar è richiudibile. Espandi singolarmente è attivo al primo avvio e mantiene aperto solo il widget in uso. I comandi in alto aprono o chiudono tutto e disattivano questa modalità. I collegamenti Pagina, Speciali, Testo, Font, Emoji, Immagini, AI ed Export aprono la sezione corretta prima di raggiungerla.

La guida integrata è pensata per l'utente finale e usa le stesse icone e scorciatoie dell'interfaccia. Su schermi piccoli la sidebar diventa un pannello sovrapposto, la toolbar scorre orizzontalmente e i controlli per riordinare le pagine restano utilizzabili senza trascinamento.

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

- 41 controlli funzionali v7 nel browser, tutti superati.
- 250 ID UI univoci e nessun riferimento DOM mancante.
- Sintassi valida per tutti i blocchi JavaScript.
- Build finale uguale alla sorgente generata e nessuna dipendenza dall'API Fontsource all'avvio.
