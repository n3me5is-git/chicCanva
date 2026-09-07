# chicCanva

Un piccolo laboratorio per creare materiale didattico, disegni e scritte da stampare, con **Chicca**, la piccola insegnante mascotte.

## Build pronta

La cartella **build/chicCanva/** contiene soltanto:

- `chicCanva.html`: tutta l’app in un unico HTML, circa 1,6 MB.
- `chicCanva_server.bat`: launcher Windows basato esclusivamente su PowerShell/.NET di Windows. Nessuna dipendenza Python, Node o npm.

Chiudere il vecchio server sulla porta 8000, quindi avviare il nuovo BAT. Si apre `http://localhost:8000/`. L’HTML può anche essere aperto direttamente per le funzioni locali; Puter e rimozione AI dello sfondo richiedono HTTP. Le versioni OutlineLab precedenti sono conservate nelle loro cartelle.

## Font e testi

Il catalogo Fontsource di **2.100 famiglie** è incorporato nell’HTML: non viene più richiesta l’API Fontsource all’avvio. Il wizard ha un profilo per ogni famiglia, non solo per i 21 font iniziali. I file dei singoli font vengono caricati quando servono, tramite Google Fonts e fallback jsDelivr. Il catalogo resta disponibile senza rete; scaricare un font nuovo richiede comunque connessione.

“Cicciottello” indica forme ampie, rotonde e colorabili. Non viene ricavato dal massimo peso tipografico disponibile. Le famiglie per bambini e altri stili riconoscibili hanno profili curati; le altre hanno stime da nome e categoria. È una classificazione stilistica utile, non un’analisi visiva automatica di ogni glifo. Nel catalogo attuale: 52 famiglie cicciottelle e 79 rotondeggianti, con sovrapposizioni.

La scelta diretta include Tutti, Cicciottelli, Rotondi, Squadrati, Artistici, Serif, Sans serif, Scrittura, Monospazio e Outline nativi. La ricerca accetta nomi e parole di stile, anche combinate. Il campione è **Outline**, non Aa. “Mostra altri” permette di esplorare l’intero catalogo della categoria.

**Disable Outline mode** permette testi pieni. La modifica vale per i prossimi inserimenti e per i testi selezionati quando si applica lo stile. I font nativamente outline conservano il loro disegno vuoto: per il testo pieno scegliere una famiglia standard. L’opzione **Tutto MAIUSCOLO** converte i nuovi inserimenti senza modificare quanto digitato nel box.

## OpenMoji

La variante outlined ha un selettore colore, nero di default. Il colore viene usato nelle nuove emoji, incluse quelle inserite con Smart emoticon. **Applica selezione** ricolora le OpenMoji outlined già presenti, senza spostarle o modificarne scala/crop. La variante originale a colori resta invariata. Colori e asset SVG sono conservati nel progetto.

## Immagini di riferimento per Puter

È possibile allegare un’immagine locale oppure usare l’immagine selezionata nel canvas. Anteprima e pulsante di rimozione mostrano sempre quale riferimento è attivo. Il riferimento è normalizzato in PNG (lato massimo 2048 px; file di ingresso fino a 12 MB), mantenuto localmente e inviato insieme al prompt solo premendo **Genera**.

Viene utilizzato il campo ufficiale `input_images`, con MIME esplicito. Il riferimento è abilitato per OpenAI Image, Gemini e xAI. Per gli altri provider resta disponibile la generazione senza riferimento: l’app non ignora silenziosamente un allegato su un modello non verificato. Preset e prompt dell’utente restano entrambi nella richiesta. Il riferimento corrente è incluso nel JSON del progetto.

L’SDK Puter si carica quando ci si avvicina alla sezione AI. La generazione conserva le opzioni precedenti e inserisce il risultato nella pagina da cui era stata avviata, anche se nel frattempo si cambia pagina.

Documentazione utilizzata: [puter.ai.txt2img](https://docs.puter.com/AI/txt2img/index.md).

## UI e scorciatoie

Palette verde salvia, logo vettoriale di Chicca incorporato, pulsanti e spaziatura aggiornati, accessi rapidi Testo/Font/Emoji/Immagini/AI/Export. La guida si apre da **? Guida** o F1, nello stesso HTML. Sono presenti tooltip desktop e menu con clic destro sull’oggetto.

- Ctrl + clic / Ctrl A: selezione multipla / tutti gli oggetti.
- Ctrl D: duplica selezione.
- Ctrl S: esporta progetto JSON.
- CANC: elimina selezione.
- Frecce / Shift + frecce: sposta di 1 / 10 pixel progetto.
- V: selezione; H: manina; F: vista Fit; G: griglia; R: abilita rotazione.
- Ctrl + rotella: zoom; F1: guida; Esc: chiudi menu o modalità temporanee.

Le scorciatoie di editing non interferiscono con la scrittura nei campi. Su mobile il pannello è richiudibile, la toolbar scorre e la guida è adattata allo schermo.

Rimangono disponibili le tre modalità pagina, adattamento, scala batch, preview multipagina, crop non distruttivo, griglia/snap, PDF/PNG, rimozione sfondo fotografico e uniforme, import/export con asset e compatibilità dei progetti precedenti.

## Errori segnalati

- **Fontsource / ERR_BLOCKED_BY_CLIENT:** risolto per il catalogo, che ora è incorporato e non dipende dall’API. Un filtro potrebbe ancora bloccare i download di singoli font, nuove emoji o modelli; in quel caso lo stato segnala il download fallito e il catalogo resta completo.
- **Puter / unsafe header Origin:** warning dell’SDK. chicCanva e il launcher non impostano quell’header di richiesta. Non viene nascosto o aggirato. Se la generazione funziona, il warning da solo non prova un malfunzionamento.
- **content.js / removeChild:** chicCanva non carica `content.js`. La traccia è compatibile con uno script di estensione; per confermarlo serve l’URL completo, ad esempio `chrome-extension://…`. Non sono state modificate o disabilitate estensioni e non vengono soppressi globalmente gli errori.

## Verifiche

**50 controlli browser passati**, inclusi i 23 precedenti e i nuovi controlli su catalogo completo, profili, caricamento reale del font Fredoka, filtri/ricerca, maiuscole, modalità piena, duplicazione, ricolorazione SVG, crop/Esc, frecce, riferimento Puter, salvataggio JSON e guida accessibile.

La rimozione sfondo è stata eseguita realmente su una fotografia pubblica di prova, verificando sia pixel opachi sia trasparenti. La nuova richiesta Puter con riferimento è stata controllata con una risposta simulata: **non sono state eseguite generazioni a pagamento**. La qualità effettiva dell’immagine generata resta dipendente dal modello scelto.

Verificati visivamente desktop, filtri dei font, menu con clic destro e guida a 390×844. L’apertura `file://` non è testabile dal browser automatico per la sua policy; il codice mantiene la modalità diretta. Il launcher mantiene il server PowerShell già verificato, con il nuovo nome del file. Tutte le librerie JavaScript incorporate sono incluse nel controllo sintattico.

## Sorgente e build

Il sorgente distribuibile è `chicCanva.html` alla radice. La build è una copia identica. La ricostruzione per sviluppo è in `development/chic-upgrade.py` con gli asset/testi di supporto; queste risorse **non sono richieste per eseguire la build**. `tests/build-chic-tests.py` genera l’HTML strumentato per i test locali.

Licenze delle librerie invariate: Fabric.js/jsPDF/ONNX MIT, IMG.LY AGPL-3.0, OpenMoji CC BY-SA 4.0 con attribuzione. I font hanno le rispettive licenze. La mascotte è SVG incorporato, senza download esterni.
