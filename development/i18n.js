// Embedded Italian/English UI localization. Italian remains the editorial source.
const LANGUAGE_STORAGE_KEY='chiccanva.language.v1';
const SUPPORTED_LANGUAGES=['it','en'];
let appLanguage=document.documentElement.lang==='it'?'it':'en',i18nApplying=false,i18nObserver=null,i18nForce=false,i18nPickerReady=false;
const TRANSLATION_PREFERENCE_KEY='chiccanva.search-translation.it.v1';
const I18N_EN=Object.fromEntries(`
Lingua\tLanguage
Italiano\tItalian
Piccole idee, grandi progetti · con Chicca\tSmall ideas, big projects · with Chicca
Ciao! Sono Chicca 👋\tHi! I'm Chicca 👋
Memoria\tStorage
Guida\tGuide
? Guida\t? Guide
Annulla\tUndo
Ripristina\tRedo
↶ Annulla\t↶ Undo
↷ Ripristina\t↷ Redo
Annulla · Ctrl+Z\tUndo · Ctrl+Z
Ripristina · Ctrl+Maiusc+Z / Ctrl+Y\tRedo · Ctrl+Shift+Z / Ctrl+Y
Esporta JSON\tExport JSON
Importa JSON\tImport JSON
Esporta PDF\tExport PDF
Chiudi pannello\tClose panel
Chiudi anteprima\tClose preview
Apri pannello\tOpen panel
Installa\tInstall
Installa chicCanva\tInstall chicCanva
Installa ora\tInstall now
Installa con il browser\tInstall with browser
Il browser non ha ancora reso disponibile il dialogo nativo: usa il menu indicato nel popup.\tThe browser has not made the native install dialog available yet; use the menu shown in the popup.
Installa l’editor in una finestra dedicata e ritrovalo tra le tue app.\tInstall the editor in its own window and find it among your apps.
Premi Installa.\tPress Install now.
Conferma la finestra proposta dal browser.\tConfirm the prompt shown by the browser.
Apri chicCanva dall’icona aggiunta al dispositivo.\tOpen chicCanva from the icon added to your device.
Su iPhone e iPad l’installazione si completa dal menu Condividi di Safari.\tOn iPhone and iPad, installation is completed from Safari’s Share menu.
Apri questa pagina in Safari.\tOpen this page in Safari.
Tocca Condividi nella barra di Safari.\tTap Share in Safari’s toolbar.
Scegli Aggiungi alla schermata Home e conferma con Aggiungi.\tChoose Add to Home Screen and confirm with Add.
Puoi aggiungere chicCanva alle app dal menu del browser.\tYou can add chicCanva to your apps from the browser menu.
In Safari apri File e scegli Aggiungi al Dock.\tIn Safari, open File and choose Add to Dock.
In Chrome o Edge apri il menu del browser e scegli Installa chicCanva.\tIn Chrome or Edge, open the browser menu and choose Install chicCanva.
Conferma per creare l’icona dell’app.\tConfirm to create the app icon.
Il browser può installare chicCanva dal proprio menu.\tThe browser can install chicCanva from its menu.
Apri il menu del browser.\tOpen the browser menu.
Scegli Installa app oppure Aggiungi alla schermata Home.\tChoose Install app or Add to Home Screen.
Se la voce non compare, apri il dominio con Chrome, Edge o un browser che supporta le PWA.\tIf the command is missing, open the domain with Chrome, Edge, or another browser that supports PWAs.
Pagina\tPage
Pagine\tPages
Speciali\tSpecial
Testo\tText
Font\tFonts
Emoji\tEmoji
Forme\tShapes
Immagini\tImages
Clipart\tClipart
Export\tExport
Esporta\tExport
Apri\tOpen
Apri Pagina\tOpen Page
Apri Speciali\tOpen Special
Apri Testo\tOpen Text
Apri Font\tOpen Fonts
Apri Emoji\tOpen Emoji
Apri Forme\tOpen Shapes
Apri Immagini\tOpen Images
Apri Clipart\tOpen Clipart
Apri AI\tOpen AI
Apri Esporta\tOpen Export
Richiudi sezioni\tCollapse sections
Espandi sezioni\tExpand sections
Espandi singolarmente\tExpand one at a time
Gestione pagina\tPage management
Funzioni e Progetti Speciali\tSpecial functions and projects
Aggiungi testo\tAdd text
Caratteri e stile\tFonts and style
Forme e disegno\tShapes and drawing
Immagini & Crop\tImages & Crop
Canvas, griglia e snap\tCanvas, grid and snapping
Esporta progetto o selezioni\tExport project or selections
Librerie, contenuti e licenze\tLibraries, content and licenses
Carico chicCanva\tchicCanva memory load
+ Progetto\t+ Project
+ Pagina\t+ Page
Progetti aperti\tOpen projects
Nuovo progetto\tNew project
Crea progetto\tCreate project
Chiudi progetto\tClose project
Nome progetto\tProject name
Nome pagina\tPage name
Nuovo nome\tNew name
Rinomina\tRename
Pagina precedente\tPrevious page
Pagina successiva\tNext page
Sposta pagina a sinistra\tMove page left
Sposta pagina a destra\tMove page right
← Prima\t← Before
Dopo →\tAfter →
Riordina\tReorder
▦ Preview\t▦ Preview
Tutte le pagine\tAll pages
Pagina corrente\tCurrent page
Solo la pagina corrente\tCurrent page only
Tutte le pagine del progetto\tAll project pages
Tutte le pagine del progetto corrente\tAll pages in the current project
Dimensione\tSize
Formato\tFormat
Orientamento\tOrientation
Verticale\tPortrait
Orizzontale\tLandscape
Quadrato\tSquare
Larghezza mm\tWidth mm
Altezza mm\tHeight mm
Applica formato\tApply format
↔ Ruota pagina\t↔ Rotate page
Duplica pagina\tDuplicate page
Elimina pagina\tDelete page
Adatta oggetti\tFit objects
Azioni pagina\tPage actions
Vuoi eliminare questa pagina?\tDelete this page?
Conferma\tConfirm
Chiudi\tClose
Annulla disegno\tCancel drawing
Fit pagina\tFit page
Riduci zoom\tZoom out
Aumenta zoom (anche Ctrl + rotella)\tZoom in (also Ctrl + wheel)
Manina: trascina per spostare la vista\tHand tool: drag to pan the view
Mostra/nascondi griglia\tShow/hide grid
Abilita/disabilita snapping\tEnable/disable snapping
Abilita/disabilita maniglia rotazione\tEnable/disable rotation handle
Selezione e selection box\tSelection and selection box
Selezione a oggetto\tTap selection mode
Avvia selezione a oggetto\tStart tap selection
Termina selezione a oggetto\tEnd tap selection
Nessuna selezione\tNo selection
Elimina selezione\tDelete selection
Elimina selezione (CANC)\tDelete selection (Delete)
Copia\tCopy
Incolla\tPaste
Duplica\tDuplicate
Copia oggetti · Ctrl+C\tCopy objects · Ctrl+C
Incolla oggetti · Ctrl+V\tPaste objects · Ctrl+V
Copia oggetti\tCopy objects
Incolla oggetti\tPaste objects
Copia immagine\tCopy image
Copia come immagine\tCopy as image
Copia negli appunti\tCopy to clipboard
Incolla immagine dagli appunti\tPaste image from clipboard
Incolla speciale: immagine dagli appunti\tPaste special: image from clipboard
Incolla speciale · immagine dagli appunti\tPaste special · image from clipboard
Raggruppa\tGroup
Raggruppa la selezione · Ctrl+G\tGroup selection · Ctrl+G
Dividi gruppo\tUngroup
Dividi il gruppo · Ctrl+Maiusc+G\tUngroup · Ctrl+Shift+G
Splitta testo\tSplit text
Splitta il testo in caratteri e gruppi\tSplit text into characters and groups
Fissa posizione\tLock position
Porta avanti\tBring forward
Porta indietro\tSend backward
Porta davanti ↑\tBring to front ↑
Porta dietro ↓\tSend to back ↓
Sposta sopra\tMove above
Sposta sotto\tMove below
Sposta in cima\tMove to top
Sposta in fondo\tMove to bottom
Sposta in cima ↑\tMove to top ↑
Sposta in fondo ↓\tMove to bottom ↓
Opzioni sposta sopra\tMove above options
Opzioni sposta sotto\tMove below options
Sposta la selezione avanti di un livello. Clic destro o pressione prolungata per altre opzioni.\tMove the selection forward by one level. Right-click or long-press for more options.
Sposta la selezione indietro di un livello. Clic destro o pressione prolungata per altre opzioni.\tMove the selection backward by one level. Right-click or long-press for more options.
Rotazione e riflessione\tRotation and flip
Azzera rotazione\tReset rotation
Ruota 90° a destra\tRotate 90° right
Ruota 90° a sinistra\tRotate 90° left
Ruota 180°\tRotate 180°
Rifletti sinistra ↔ destra\tFlip horizontally
Rifletti alto ↕ basso\tFlip vertically
Adatta selezione\tFit selection
Adatta con margine\tFit with margin
Adatta senza margine\tFit without margin
Margine adattamento (mm)\tFit margin (mm)
Azioni oggetto\tObject actions
Aggiunge una frase o singole lettere/gruppi alla pagina corrente.\tAdds a phrase or individual letters/groups to the current page.
Inserisci testo nella modalità corrente.\tEnter text for the current mode.
Tutto MAIUSCOLO\tALL UPPERCASE
Smart emoticon · usa OpenMoji\tSmart emoji · use OpenMoji
Un oggetto per lettera / gruppo di simboli\tOne object per letter / symbol group
Simboli uniti alla precedente / successiva\tSymbols joined to previous / next character
Simboli alla precedente\tSymbols joined to previous
Simboli alla successiva\tSymbols joined to next
Apostrofo intelligente\tSmart apostrophe
Adattamento\tFitting
Contieni nella pagina\tContain in page
Riempi larghezza\tFill width
Riempi altezza\tFill height
Adatta pagina\tFit page
Modifica testo oggetto\tEdit object text
Modifica dell’oggetto selezionato\tEdit selected object
Annulla modifica testo\tCancel text editing
Vincolo dimensioni\tSize constraint
Nessun vincolo\tNo constraint
Mantieni larghezza\tKeep width
Mantieni altezza\tKeep height
Mantieni larghezza e altezza\tKeep width and height
Conserva le proporzioni del testo\tPreserve text proportions
Genera pagine\tGenerate pages
Testo da distribuire sulle pagine\tText to distribute across pages
Una lettera / gruppo per pagina\tOne letter / group per page
Gruppi espliciti · separa le pagine con ^\tExplicit groups · separate pages with ^
Mantieni dimensione costante · striscione\tKeep constant size · banner
Crea nuovo progetto\tCreate new project
Aggiungi al progetto corrente\tAdd to current project
Aggiungi pagine (append)\tAppend pages
Rimpiazza tutte le pagine\tReplace all pages
Orientamento pagine A4\tA4 page orientation
Carica\tLoad
Carica immagine\tUpload image
Da URL\tFrom URL
Dal canvas\tFrom canvas
Immagine di riferimento · opzionale\tReference image · optional
Riferimento salvato\tSaved reference
Rimuovi riferimento\tRemove reference
Incolla\tPaste
＋ Allega\t＋ Attach
Importa PDF come immagini\tImport PDF as images
Pagine da importare\tPages to import
Una pagina specifica\tOne specific page
Tutte le pagine\tAll pages
Numero pagina PDF\tPDF page number
Destinazione\tDestination
Auto · segue ogni pagina PDF\tAuto · follow each PDF page
Qualità conversione per testi, forme e gruppi\tConversion quality for text, shapes and groups
Crop mode\tCrop mode
Reset crop\tReset crop
Applica crop\tApply crop
Crop immagine\tCrop image
Crop immagine selezionata\tCrop selected image
Pixel originali\tOriginal pixels
Contenuto visibile\tVisible content
Dimensione nel progetto\tProject size
RAM bitmap stimata\tEstimated bitmap RAM
Dimensione sulla pagina\tSize on page
Risoluzione di stampa\tPrint resolution
Cambia risoluzione\tChange resolution
Cambia qualità\tChange quality
Qualità PNG\tPNG quality
Colori originali\tOriginal colours
Precisione colori ridotta\tReduced colour precision
Immagine attuale:\tCurrent image:
La sostituzione riguarda solo questo oggetto.\tReplacement affects only this object.
La dimensione sulla pagina non cambia. L’upscaling tradizionale aumenta i pixel ma non crea nuovi dettagli. A 100% i colori restano invariati; valori inferiori riducono gradualmente la precisione cromatica per alleggerire il PNG, mantenendo la trasparenza.\tThe size on the page does not change. Traditional upscaling increases pixels but does not create new detail. At 100%, colours remain unchanged; lower values gradually reduce colour precision to make the PNG smaller while preserving transparency.
Sostituisci immagine\tReplace image
Trasformazioni immagine\tImage transformations
Bianco e nero\tBlack and white
Al tratto\tLine art
Bilanciato\tBalanced
Duplica e converti in B/N\tDuplicate and convert to B/W
Sensibilità contorni\tEdge sensitivity
Duplica e rendi outline\tDuplicate and make outline
Prepara disegno da colorare con AI\tPrepare AI coloring page
Rimozione sfondo\tBackground removal
Rimuovi sfondo\tRemove background
Sfondo uniforme · disegni e lineart\tSolid background · drawings and line art
AI · soggetti e fotografie\tAI · subjects and photos
Colore da rimuovere\tColor to remove
Rileva colore automaticamente dai bordi\tDetect color automatically from edges
Rimuovi il colore anche nelle aree interne chiuse\tRemove color from enclosed inner areas too
Tolleranza\tTolerance
Duplica senza background\tDuplicate without background
Modello AI\tAI model
Automatica · preferisci WebGPU\tAutomatic · prefer WebGPU
CPU · compatibilità\tCPU · compatibility
GPU · WebGPU con ripiego CPU\tGPU · WebGPU with CPU fallback
Colora digitalmente aree chiuse e dettagli.\tDigitally color enclosed areas and details.
Avvia Colorizer\tStart Colorizer
Termina\tFinish
Strumento Colorizer\tColorizer tool
Riempimento\tFill
Pennello intelligente\tSmart brush
Tipo di colore\tColor type
Colore uniforme\tSolid color
Gradiente direzionale\tLinear gradient
Gradiente radiale\tRadial gradient
Texture\tTexture
Colore\tColor
Secondo colore\tSecond color
Colore Colorizer\tColorizer color
Secondo colore Colorizer\tSecond Colorizer color
Trasparenza\tOpacity
Tolleranza area / bordi\tArea / edge tolerance
Dimensione pennello\tBrush size
Non oltrepassare i bordi\tStay inside edges
Copia risultato\tCopy result
Copia originale\tCopy original
Copia cropped\tCopy crop
Immagine originale copiata negli appunti\tOriginal image copied to clipboard
Immagine croppata copiata negli appunti\tCropped image copied to clipboard
Ripristina oggetto originale\tRestore original object
Elimina questo Colorize\tDelete this colorization
Azioni Colorizer\tColorizer actions
Scegli un oggetto e avvia la modalità.\tSelect an object and start the mode.
Forme didattiche, frecce, linee e disegno libero.\tEducational shapes, arrows, lines and freehand drawing.
Categorie forme\tShape categories
Strumenti forme\tDrawing tools
Tutte\tAll
Base\tBasic
Scuola\tSchool
Frecce\tArrows
Disegno\tDrawing
Riempimento trasparente\tTransparent fill
Colore riempimento forma\tShape fill color
Colore contorno forma\tShape outline color
Spessore contorno\tOutline width
Blocca proporzioni 1:1 durante il disegno\tLock 1:1 proportions while drawing
Modifica punti\tEdit points
Crea segmenti trascinando tra i nodi\tCreate segments by dragging between nodes
Levigatura mano liscia\tSmooth-hand smoothing
Termina tracciato\tFinish path
Duplica come immagine\tDuplicate as image
Annulla disegno\tCancel drawing
Caratteri e stile\tFonts and style
Scelta diretta\tDirect selection
Tipi di carattere\tFont types
Cerca una famiglia…\tSearch a font family…
Font impostato ·\tCurrent font ·
Anteprima proposta dal wizard\tWizard suggestion preview
Dal font attuale\tFrom current font
Disable Outline mode\tDisable Outline mode
Contorno\tOutline
Bordo\tBorder
Applica selezione\tApply to selection
Cicciottello / colorabile\tChunky / colorable
Squadrato ↔ tondo\tSquare ↔ round
Artistico\tArtistic
Arrotondato\tRounded
Tutte le emoji\tAll emoji
Più rilevanti\tMost relevant
Categoria emoji\tEmoji category
Cerca emoji\tSearch emoji
Cerca smile, cuore, cat…\tSearch smile, heart, cat…
Traduzione automatica italiano → inglese\tAutomatically translate Italian → English
Elimina traduzioni salvate\tDelete saved translations
Colore outlined\tOutline color
Generazione immagini AI · Puter\tAI image generation · Puter
Genera e inserisce l’immagine direttamente nel canvas.\tGenerates and inserts the image directly into the canvas.
Accedi con Puter\tSign in with Puter
Accedi con Puter per usare l’AI\tSign in with Puter to use AI
Account Puter\tPuter account
Cambia account\tSwitch account
Logout\tSign out
Credito Puter globale disponibile\tTotal available Puter credits
Allowance mensile\tMonthly allowance
Crediti extra / top-up\tExtra / top-up credits
Tipo account\tAccount type
Aggiorna\tRefresh
Aggiorna il consumo Puter\tRefresh Puter usage
Ricarica credito Puter\tTop up Puter credits
Prompt Library\tPrompt Library
Apri libreria prompt\tOpen Prompt Library
＋ Nuovo prompt\t＋ New prompt
Salva il prompt e lo stile correnti\tSave current prompt and style
Cerca per titolo, tag, descrizione o prompt…\tSearch title, tags, description or prompt…
Filtra per tag\tFilter by tags
Azzera filtri\tReset filters
La libreria è vuota.\tThe library is empty.
Nessun prompt corrisponde alla ricerca e ai tag selezionati.\tNo prompt matches the selected search and tags.
Rimuovi tag\tRemove tag
Immagine associata\tAttached image
Titolo e prompt sono obbligatori.\tTitle and prompt are required.
Prompt aggiornato\tPrompt updated
Prompt salvato nella libreria\tPrompt saved to the library
Prompt eliminato\tPrompt deleted
Eliminare il prompt selezionato dalla Prompt Library?\tDelete the selected prompt from the Prompt Library?
Testo del prompt copiato\tPrompt text copied
Immagine del prompt copiata\tPrompt image copied
Gli appunti non contengono testo\tThe clipboard contains no text
Testo aggiunto al prompt\tText added to the prompt
Prompt Library importata\tPrompt Library imported
Catalogo curato chicCanva aggiornato.\tCurated chicCanva catalogue updated.
Qualità e risoluzione sono indipendenti; i lati sono multipli di 16, rapporto massimo 3:1 e limite 3840 px / 8.294.400 pixel.\tQuality and resolution are independent; sides are multiples of 16, the maximum aspect ratio is 3:1, with limits of 3840 px / 8,294,400 pixels.
Gemini Flash Lite supporta i rapporti elencati e un solo livello output 1K; Puter non espone un livello qualitativo separato per questo modello.\tGemini Flash Lite supports the listed aspect ratios and a single 1K output level; Puter does not expose a separate quality level for this model.
Puter espone per Grok il livello 1K/2K, ma al momento non documenta l’inoltro dell’aspect ratio tramite txt2img().\tPuter exposes the 1K/2K level for Grok, but currently does not document forwarding the aspect ratio through txt2img().
Il modello espone soltanto le opzioni supportate dal relativo provider.\tThe model exposes only the options supported by its provider.
Proporzioni non valide.\tInvalid aspect ratio.
Risoluzione non valida.\tInvalid resolution.
OpenAI accetta proporzioni comprese tra 1:3 e 3:1.\tOpenAI accepts aspect ratios between 1:3 and 3:1.
Questa combinazione supera il lato massimo OpenAI di 3840 px.\tThis combination exceeds OpenAI’s maximum side of 3840 px.
Questa combinazione supera 8.294.400 pixel.\tThis combination exceeds 8,294,400 pixels.
Questa combinazione non raggiunge il minimo di 655.360 pixel.\tThis combination does not reach the minimum of 655,360 pixels.
Larghezza e altezza devono essere numeri interi positivi.\tWidth and height must be positive integers.
Larghezza e altezza devono essere multipli di 16 px.\tWidth and height must be multiples of 16 px.
La risoluzione personalizzata supera il lato massimo OpenAI di 3840 px.\tThe custom resolution exceeds OpenAI’s maximum side of 3840 px.
La risoluzione personalizzata supera 8.294.400 pixel.\tThe custom resolution exceeds 8,294,400 pixels.
La risoluzione personalizzata non raggiunge il minimo di 655.360 pixel.\tThe custom resolution does not reach the minimum of 655,360 pixels.
Titolo\tTitle
Breve descrizione\tShort description
Quando e perché usare questo prompt\tWhen and why to use this prompt
Scrivi e premi virgola o Invio\tType and press comma or Enter
Stile associato\tAssociated style
Salva anche l’immagine di riferimento corrente\tAlso save the current reference image
Usa questo prompt\tUse this prompt
Salva prompt\tSave prompt
Aggiorna prompt\tUpdate prompt
Copia prompt\tCopy prompt
← Torna alla lista\t← Back to list
Chiudi Prompt Library\tClose Prompt Library
Famiglia / provider\tFamily / provider
Altri modelli\tOther models
Modello\tModel
Qualità\tQuality
Aspect ratio\tAspect ratio
Risoluzione · lato corto\tResolution · short side
Risoluzione\tResolution
Inserisci larghezza e altezza personalizzate\tEnter custom width and height
Larghezza px\tWidth px
Altezza px\tHeight px
Stile illustrazione\tIllustration style
Prompt\tPrompt
Descrivi l’immagine…\tDescribe the image…
Mostra il prompt completo inviato\tShow the full prompt sent
Prompt completo inviato\tFull prompt sent
Il prompt è vuoto.\tThe prompt is empty.
Incolla testo e aggiungi al prompt\tPaste text and append to prompt
Genera con sfondo uniforme per chroma key\tGenerate with a solid chroma-key background
Duplica il contenuto generato e rimuovi lo sfondo\tDuplicate generated content and remove its background
Risoluzione inviata\tSent resolution
Genera e inserisci\tGenerate and insert
Stima Consumo\tEstimated usage
Stima Listino:\tPrice-list estimate:
Ultima Gen:\tLast Gen:
crediti\tcredits
Usato\tUsed
Disponibile\tAvailable
Usati:\tUsed:
Residui:\tRemaining:
Non disponibile\tUnavailable
Free / senza abbonamento\tFree / no subscription
testo\ttext
riferimento\treference
output non valido\tinvalid output
prompt complessivo\tfull prompt
confidenza\tconfidence
consumo ricavato dal saldo\tusage derived from the balance
consumo comunicato da Puter\tusage reported by Puter
aggiornato\tupdated
L’uso chicCanva è una lettura separata limitata a questa app.\tchicCanva usage is a separate reading limited to this app.
Output OpenAI: formula ufficiale basata su griglia qualità e dimensioni.\tOpenAI output: official quality-grid and size formula.
Riferimento: proxy a token visivi; resta autorevole il consumo misurato dopo la generazione.\tReference: visual-token proxy; the measured post-generation cost remains authoritative.
xAI: tariffa output fissa per il livello 1K/2K selezionato.\txAI: fixed output price for the selected 1K/2K tier.
Si aggiunge la tariffa ufficiale per il riferimento.\tThe official media-input fee is added.
Tariffa Puter fissa per generazione Seedream; non è pubblicato un sovrapprezzo separato per il riferimento.\tFixed Puter price per Seedream generation; no separate reference surcharge is published.
Gemini: token immagine output alla tariffa ufficiale 1K.\tGemini: output image tokens at the official 1K rate.
Riferimento stimato con le regole Google per i tile visivi.\tReference estimated with Google’s visual-tile token rules.
Stima di riserva dal prezziario incorporato.\tFallback estimate from the embedded price list.
bassa\tlow
discreta\tfair
buona\tgood
Immagine attuale:\tCurrent image:
La sostituzione riguarda solo questo oggetto.\tReplacement affects only this object.
Colori originali\tOriginal colours
Precisione colori ridotta\tReduced colour precision
Elaborazione…\tProcessing…
Qualità immagine modificata · dimensione sulla pagina invariata\tImage quality changed · size on page unchanged
Cambio qualità non riuscito:\tImage quality change failed:
Immagine originale copiata negli appunti\tOriginal image copied to clipboard
Immagine croppata copiata negli appunti\tCropped image copied to clipboard
Prezziario incorporato\tBuilt-in price list
Aggiorna prezziario\tRefresh price list
Immagine generata\tGenerated image
Ultima immagine generata con Puter\tLatest image generated with Puter
Riprova inserimento\tRetry insertion
Apri immagine grande\tOpen large image
Salva su dispositivo\tSave to device
Anteprima grande dell’immagine generata\tLarge preview of generated image
Openclipart\tOpenclipart
Clipart · Openclipart\tClipart · Openclipart
Cerca illustrazioni libere e inseriscile nei materiali.\tSearch free illustrations and add them to your materials.
PAROLA CHIAVE\tKEYWORD
child, school, elephant…\tchild, school, elephant…
Cerca\tSearch
Usa preferibilmente termini inglesi, per esempio child invece di bambino. Ogni pagina carica al massimo 12 anteprime.\tPrefer English search terms, for example child instead of bambino. Each page loads no more than 12 previews.
Usa preferibilmente termini inglesi, per esempio\tPrefer English search terms, for example
invece di bambino. Ogni pagina carica al massimo 12 anteprime.\tinstead of bambino. Each page loads no more than 12 previews.
Mostra il pulsante per inserire direttamente con Puter\tShow the button to insert directly with Puter
Anteprima clipart\tClipart preview
Usa Puter per scaricare e inserire\tUse Puter to download and insert
Scarica\tDownload
Apri\tOpen
Cosa vuoi esportare\tWhat do you want to export
Selezione nella pagina\tSelection on page
Contenuti da\tContent from
Qualità immagine\tImage quality
Qualità PNG\tPNG quality
Trasparente\tTransparent
Bianco\tWhite
Margine attorno alla selezione\tMargin around selection
Disegna o ridisegna l’area\tDraw or redraw area
Disegna area per export PNG\tDraw area for PNG export
Cancella dati salvati e modelli AI\tClear saved data and AI models
Memoria e cronologia\tStorage and history
Passi di annulla conservati (1–100)\tUndo steps kept (1–100)
Includi lo storico nel JSON esportato e importa lo storico quando presente\tInclude history in exported JSON and import it when available
Salva automaticamente in questo browser\tSave automatically in this browser
Autosalvataggio pronto.\tAutosave ready.
Riprendiamo il lavoro?\tResume your work?
Riprendi progetto\tResume project
Nuovo progetto\tNew project
Uso di chicCanva\tUsing chicCanva
Data build:\tBuild date:
Repository GitHub di chicCanva\tchicCanva GitHub repository
Autosalvataggio, cronologia e cache dei modelli\tAutosave, history and model cache
Guida a chicCanva e scorciatoie (F1)\tchicCanva guide and shortcuts (F1)
Manina: trascina la vista quando sei ingrandito. Tasto H.\tHand tool: drag the view while zoomed in. H key.
Aggiungi una pagina vuota al progetto\tAdd a blank page to the project
Mostra tutte le pagine della modalità corrente. Clicca una miniatura per modificarla.\tShow all pages in the current mode. Click a thumbnail to edit it.
Seleziona oggetti. Ctrl + clic aggiunge alla selezione; trascina sul vuoto per selezionare un’area. Tasto V.\tSelect objects. Ctrl + click adds to the selection; drag on empty space to select an area. V key.
Sblocca la maniglia di rotazione. Tasto R.\tUnlock the rotation handle. R key.
Crop non distruttivo: ritaglia l’immagine selezionata conservando l’originale.\tNon-destructive crop: crop the selected image while preserving its source.
Disegna area da esportare\tDraw export area
Mostra la griglia senza stamparla. Tasto G.\tShow the grid without printing it. G key.
Aggancia lo spostamento alla spaziatura Snap, indipendente dalla griglia.\tSnap movement to the Snap spacing independently of the grid.
Porta la selezione sopra gli altri oggetti.\tBring the selection above the other objects.
Porta la selezione sotto gli altri oggetti.\tSend the selection behind the other objects.
Crea un nuovo progetto\tCreate a new project
Aggiungi dopo la pagina attiva\tAdd after the active page
Clicca per modificare il nome della pagina\tClick to edit the page name
Trascina per ridimensionare il pannello\tDrag to resize the panel
Sezioni strumenti\tTool sections
Ogni pagina può avere testo, orientamento e dimensioni differenti.\tEach page can have different text, orientation and dimensions.
Genera pagine da un testo. Altre funzioni potranno essere aggiunte qui.\tGenerate pages from text. More special functions can be added here.
2.100 famiglie nel catalogo incorporato. Filtra, cerca o lasciati guidare dal wizard.\t2,100 families in the embedded catalog. Filter, search or use the wizard.
Libreria OpenMoji completa, colore o black/outline.\tComplete OpenMoji library in color or black/outline.
Upload, ritaglio non distruttivo e background removal opzionale.\tUpload, non-destructive cropping and optional background removal.
Collega il tuo account per generare immagini e usare i download assistiti da Puter.\tConnect your account to generate images and use Puter-assisted downloads.
Imposta gli aiuti visivi del foglio; non vengono stampati.\tSet the page’s visual aids; they are not printed.
Salva una pagina, tutte le pagine o una zona disegnata nel formato più adatto.\tSave one page, all pages or a drawn area in the most suitable format.
Centro pagina\tPage center
Bordi pagina\tPage edges
Allinea agli oggetti\tAlign to objects
Esporta JSON e chiudi\tExport JSON and close
L’operazione può essere annullata dalla cronologia finché il progetto rimane aperto.\tThe operation can be undone from history while the project remains open.
Azioni progetto\tProject actions
Apri pagina\tOpen page
Usa chicCanva come un’app sul tuo dispositivo.\tUse chicCanva as an app on your device.
Dopo la prima apertura, la struttura dell’app rimane nella cache del browser. Font, emoji e modelli AI già scaricati dipendono dalla cache e dallo spazio disponibile sul dispositivo.\tAfter the first launch, the app shell remains in the browser cache. Previously downloaded fonts, emoji and AI models depend on the available cache and device storage.
È disponibile una nuova versione di chicCanva.\tA new version of chicCanva is available.
Scegli quali pagine trasformare in immagini PNG.\tChoose which pages to turn into PNG images.
Numero pagina PDF\tPDF page number
Il PDF viene elaborato nel browser. Ogni pagina scelta diventa un PNG adattato a una nuova pagina A4.\tThe PDF is processed in the browser. Each selected page becomes a PNG fitted to a new A4 page.
Importa pagine\tImport pages
Ruota e rifletti oggetto\tRotate and flip object
Opzioni copia\tCopy options
Pagina da colorare\tColoring page
Le immagini associate possono occupare molto spazio nello storage del browser. Il progetto sul canvas non viene modificato.\tAttached images can use substantial browser storage. The project on the canvas is not changed.
Comprende il testo scritto, il preset di stile e le istruzioni automatiche attive.\tIncludes the text you wrote, the style preset and active automatic instructions.
Il risultato è disponibile, ma non è ancora stato inserito nel progetto.\tThe result is available but has not yet been inserted into the project.
Puoi riprendere il progetto salvato automaticamente oppure iniziare un progetto nuovo.\tYou can resume the automatically saved project or start a new one.
Carica immagine da URL\tLoad image from URL
Lo storico conserva anche gli oggetti e gli asset rimossi. I file esportati possono diventare più grandi. Senza questa opzione viene salvata soltanto la versione attuale.\tHistory also keeps removed objects and assets. Exported files can become larger. Without this option, only the current version is saved.
I progetti piccoli sono salvati in localStorage; quelli più grandi nel database del browser, con un riferimento in localStorage. La memoria appartiene a questo indirizzo e browser. Per trasferire il lavoro usa Esporta JSON.\tSmall projects are saved in localStorage; larger ones use the browser database with a localStorage pointer. This storage belongs to this address and browser. Use Export JSON to transfer your work.
Cancella autosalvataggio, preferenze e cache dei modelli chicCanva. Il progetto aperto resta sul canvas; l’autosalvataggio viene disattivato finché non lo riabiliti.\tClear chicCanva autosaves, preferences and model cache. The open project stays on the canvas; autosave remains disabled until you enable it again.
Zoom della vista: Fit ricentra l’intera pagina. Non modifica le dimensioni di stampa.\tView zoom: Fit recenters the whole page. It does not change print dimensions.
Elimina gli oggetti selezionati. Anche CANC.\tDelete selected objects. You can also press Delete.
Aggiunge una pagina custom vuota, con formato indipendente.\tAdd a blank custom page with its own format.
Sposta la pagina prima\tMove page earlier
Sposta la pagina dopo\tMove page later
Scala oggetti su tutte le pagine del progetto\tScale objects on all project pages
Conferma la scala attuale di tutte le pagine singole come nuova base 100%.\tConfirm the current scale on all individual pages as the new 100% baseline.
Usa il testo di Aggiungi testo\tUse the Add text content
Un carattere o gruppo per pagina.\tOne character or group per page.
Progetto aperto\tOpen project
Sul progetto aperto\tIn the open project
Il vertice superiore sinistro resta fermo. Con le proporzioni attive il testo viene scalato senza deformarlo.\tThe top-left corner stays fixed. With proportions enabled, text is scaled without distortion.
Aggiunge il testo senza cancellare gli oggetti esistenti. In modalità singola aggiunge nuove pagine.\tAdd the text without deleting existing objects. In single-page mode, it adds new pages.
Ricrea le pagine della modalità corrente sostituendone il contenuto\tRecreate the pages in the current mode and replace their content
Adatta tutti gli oggetti secondo la modalità scelta sotto. Dal menu destro puoi adattare solo la selezione.\tFit all objects using the mode selected below. From the context menu you can fit only the selection.
Orientamento A4 (frase + lettera/pagina)\tA4 orientation (phrase + letter/page)
Apostrofo intelligente: alla precedente, oppure alla successiva se è a inizio testo/dopo spazio.\tSmart apostrophe: join it to the previous character, or to the next at the start of text or after a space.
Contorni da colorare. Il colore si applica al bordo.\tColorable outlines. The color is applied to the border.
Cerca font o stile: rotondo, bambino, serif…\tSearch font or style: round, child, serif…
Usa stile\tUse style
2.100 famiglie incorporate · nessuna richiesta all’API Fontsource.\t2,100 embedded families · no Fontsource API request.
Colore e spessore del contorno\tOutline color and width
Pipetta · scegli un colore dal canvas\tEyedropper · pick a color from the canvas
Spessore delle OpenMoji outlined; premi Applica per aggiornare la selezione\tOutlined OpenMoji stroke width; press Apply to update the selection
Con la traduzione attiva premi Invio o la lente. Le parole note restano locali; Gemma tramite Puter completa i termini sconosciuti e le traduzioni riuscite vengono ricordate nel browser.\tWith translation enabled, press Enter or the magnifier. Known words stay local; Gemma through Puter completes unknown terms and successful translations are remembered in the browser.
Attività\tActivities
Oggetti\tObjects
OpenMoji © HfG Schwäbisch Gmünd / contributors · grafica CC BY-SA 4.0. Gli asset inseriti vengono serializzati nel progetto.\tOpenMoji © HfG Schwäbisch Gmünd / contributors · artwork under CC BY-SA 4.0. Inserted assets are serialized in the project.
Pagina forme precedente\tPrevious shapes page
Pagina forme successiva\tNext shapes page
Scegli una forma e trascina sul foglio. Gli oggetti esistenti restano protetti durante il disegno.\tChoose a shape and drag on the page. Existing objects remain protected while drawing.
Scegli dal canvas il colore per Colore riempimento forma\tPick the shape fill color from the canvas
Scegli dal canvas il colore per Colore contorno forma\tPick the shape outline color from the canvas
Scegli una forma o uno strumento di disegno.\tChoose a shape or drawing tool.
Carica un’immagine tramite il suo indirizzo web\tLoad an image from its web address
Informazioni immagine selezionata\tSelected image information
Seleziona un’immagine nel canvas per vedere risoluzione, memoria stimata e DPI di stampa.\tSelect an image on the canvas to see resolution, estimated memory and print DPI.
La dimensione sulla pagina non cambia. L’upscaling tradizionale aumenta i pixel ma non crea nuovi dettagli.\tThe size on the page does not change. Traditional upscaling increases pixels but does not create new detail.
Sensibilità estrazione contorni\tEdge extraction sensitivity
Estrae i contorni con un algoritmo locale e conserva l’immagine originale.\tExtracts outlines with a local algorithm and preserves the original image.
Prepara riferimento, modello e prompt. La generazione parte soltanto quando premi Genera nel widget AI.\tPrepare the reference, model and prompt. Generation starts only when you press Generate in the AI widget.
Scegli dal canvas il colore per Colore da rimuovere\tPick the color to remove from the canvas
IMG.LY + ONNX incorporati (AGPL-3.0 / MIT). Elaborazione locale CPU o WebGPU. Il primo utilizzo scarica il modello scelto più 12–23 MB di runtime da staticimgly.com; apri l’app tramite webserver. Nessuna immagine viene inviata a un servizio.\tEmbedded IMG.LY + ONNX (AGPL-3.0 / MIT). Local CPU or WebGPU processing. First use downloads the selected model plus 12–23 MB of runtime from staticimgly.com; open the app through a web server. No image is sent to a service.
Seleziona un oggetto o un gruppo.\tSelect an object or group.
Scegli dal canvas il colore per Colore Colorizer\tPick the Colorizer color from the canvas
Scegli dal canvas il colore per Secondo colore Colorizer\tPick the second Colorizer color from the canvas
Il pennello intelligente resta nell’area di colore simile e può chiudere piccole aperture prima del riempimento.\tThe smart brush stays within an area of similar color and can close small gaps before filling.
Ogni gesto del pennello è una sola modifica. Clic destro, oppure pressione prolungata, apre il comando per rimuovere l’intera colorizzazione collegata sotto il punto.\tEach brush gesture is one edit. Right-click or long-press opens the command to remove the whole connected colorization under that point.
Festività\tHolidays
Puter usa banda o quota dell’account. Senza Puter puoi aprire l’anteprima, salvare oppure copiare l’immagine dal browser e incollarla in chicCanva.\tPuter uses account bandwidth or allowance. Without Puter, you can open the preview, save it or copy the image from the browser and paste it into chicCanva.
Scrivi una parola o scegli una categoria.\tType a word or choose a category.
Funzione non disponibile da file://.\tFeature unavailable from file://.
Questa funzione usa Puter e richiede un account collegato.\tThis feature uses Puter and requires a connected account.
Il saldo generale e il consumo dell’app sono letti separatamente dall’account.\tThe overall balance and app usage are read separately from the account.
Come la pagina\tMatch page
Allega un’immagine di riferimento tramite URL\tAttach a reference image from a URL
Usa l’immagine selezionata come riferimento AI\tUse the selected image as the AI reference
Verrà inviata a Puter quando premi Genera.\tIt will be sent to Puter when you press Generate.
L’originale resta invariato; la copia ridotta viene creata soltanto per la richiesta.\tThe original remains unchanged; the reduced copy is created only for the request.
Allega una foto o un disegno; senza allegato la generazione parte dal solo testo.\tAttach a photo or drawing; without an attachment, generation starts from text only.
Allega una foto o un disegno; senza allegato la generazione funziona come prima.\tAttach a photo or drawing; without an attachment, generation works as before.
Riferimento pronto · descrivi nel prompt cosa mantenere o cambiare.\tReference ready · describe in the prompt what to keep or change.
Riferimento pronto · usa il ritaglio visibile, senza rotazione o scala del canvas.\tReference ready · using the visible crop without canvas rotation or scaling.
Questo modello non dichiara un input immagine compatibile: rimuovi il riferimento o scegli un altro modello.\tThis model does not declare a compatible image input: remove the reference or choose another model.
Per usare il riferimento seleziona OpenAI Image, Gemini o xAI. Puoi anche rimuoverlo per usare questo modello.\tTo use the reference, select OpenAI Image, Gemini, or xAI. You can also remove it to use this model.
Spunta “Salva anche l’immagine” per conservarne una copia nella libreria.\tCheck “Save the image too” to keep a copy in the library.
＋ Salva\t＋ Save
Puter usa il modello user-pays: eventuali costi/crediti sono gestiti dall’account Puter dell’utente.\tPuter uses the user-pays model: any costs or credits are managed by the user’s Puter account.
Griglia mm\tGrid mm
Sfondo\tBackground
Trascina sul foglio per delimitare la zona. Il rettangolo guida non viene esportato.\tDrag on the page to define the area. The guide rectangle is not exported.
Esporta tutte le pagine in PDF\tExport all pages as PDF
Copia l’immagine esportata negli appunti\tCopy the exported image to the clipboard
Il JSON conserva il progetto modificabile; PDF e immagini producono file pronti da condividere o stampare.\tJSON preserves the editable project; PDF and images produce files ready to share or print.
Rimuove il crop senza deformare l’immagine\tRemove the crop without distorting the image
Usa come riferimento AI\tUse as AI reference
Ruota e rifletti\tRotate and flip
Elimina\tDelete
Snap classico\tClassic snapping
Snap a linee guida\tGuide snapping
Equispaziatura\tEven spacing
Blocca proporzioni\tLock proportions
Rotazione a scatti\tRotation step
Blocca proporzioni nel resize e crop\tLock proportions while resizing and cropping
Maiusc inverte il blocco proporzioni. Durante lo spostamento Alt inverte le guide; Maiusc + Alt esclude le guide e inverte lo snap classico.\tShift reverses proportion locking. While moving, Alt reverses guides; Shift + Alt excludes guides and reverses classic snapping.
ADATTAMENTO PROPORZIONALE · MARGINE 8%\tPROPORTIONAL FIT · 8% MARGIN
Larghezza / altezza possono far uscire il contenuto dall’altro lato.\tWidth / height may extend the content beyond the opposite edge.
Smart emoticon: le emoji Unicode nel testo vengono renderizzate come OpenMoji e trattate come singoli caratteri.\tSmart emoji: Unicode emoji in text are rendered as OpenMoji and treated as single characters.
le emoji Unicode nel testo vengono renderizzate come OpenMoji e trattate come singoli caratteri.\tUnicode emoji in text are rendered as OpenMoji and treated as single characters.
caratteri pieni\tfilled characters
Anteprima immediata mentre cambi il valore. Conferma per fissare la nuova base.\tLive preview while you change the value. Confirm to set the new baseline.
Ogni gruppo viene adattato separatamente.\tEach group is fitted separately.
Usa\tUse
Caricamento\tLoading
Font attivo:\tActive font:
Nessun carattere: prova un’altra categoria o ricerca.\tNo fonts found: try another category or search.
Nessuna emoji trovata.\tNo emoji found.
Caricamento catalogo OpenMoji…\tLoading OpenMoji catalogue…
Allineamento oggetti\tAlign to objects
CATEGORIA\tCATEGORY
Funzione\tFunction
Orientamento A4\tA4 orientation
Maiusc\tShift
database protetto del browser\tprotected browser database
inverte il blocco proporzioni. Durante lo spostamento\treverses proportion locking. While moving,
inverte le guide;\treverses guides;
esclude le guide e inverte lo snap classico.\texcludes guides and reverses classic snapping.
Tutti\tAll
Cicciottelli\tChunky
Rotondi\tRounded
Squadrati\tSquare
Artistici\tArtistic
Serif\tSerif
Sans serif\tSans serif
Scrittura\tHandwriting
Monospazio\tMonospace
Outline nativi\tNative outlines
Cerca font o stile: rotondo, bambino, serif…\tSearch fonts or styles: rounded, child, serif…
Rettangolo\tRectangle
Rettangolo arrotondato\tRounded rectangle
Arrotondato\tRounded
Ovale\tOval
Cerchio\tCircle
Triangolo\tTriangle
Rombo\tDiamond
Pentagono\tPentagon
Esagono\tHexagon
Stella\tStar
Stella 8\t8-point star
Stella a 8 punte\t8-point star
Cuore\tHeart
Luna\tMoon
Sole\tSun
Nuvola\tCloud
Casa\tHouse
Libro\tBook
Pergamena\tScroll
Segnalibro\tBookmark
Etichetta\tTag
Scudo\tShield
Spunta\tCheck mark
Croce\tCross
Più\tPlus
Graffa\tBrace
Nastro\tRibbon
Puzzle\tPuzzle
Lampadina\tLight bulb
Freccia\tArrow
Freccia outline\tOutline arrow
Doppia freccia\tDouble arrow
Freccia su e giù\tUp and down arrow
Fumetto\tCallout
Fumetto pensiero\tThought bubble
Segmento\tLine segment
Linea con freccia\tArrow line
Linea con doppia freccia\tDouble arrow line
Spezzata\tPolyline
Poligono\tPolygon
Mano libera liscia\tSmooth freehand
Mano libera raw\tRaw freehand
Mela\tApple
Matita\tPencil
Righello\tRuler
Cappello diploma\tGraduation cap
Certificato\tCertificate
Quaderno\tNotebook
Lavagna\tBlackboard
Globo\tGlobe
Beuta\tFlask
Lente\tMagnifier
Orologio\tClock
Calendario\tCalendar
Fiore\tFlower
Albero\tTree
Corona\tCrown
Medaglia\tMedal
Distintivo\tBadge
Biglietto\tTicket
Pesce\tFish
Farfalla\tButterfly
Orma\tPaw print
Piccolo · 44 MB · rapido\tSmall · 44 MB · fast
Medio · 88 MB · bilanciato\tMedium · 88 MB · balanced
Grande · 176 MB · precisione completa\tLarge · 176 MB · full precision
Elaborazione\tProcessing
Il modello viene caricato dalla cache in un processo isolato e rimosso dalla RAM al termine.\tThe model is loaded from cache in an isolated process and removed from RAM when finished.
Modalità mobile: modello piccolo in un processo isolato; al termine la RAM viene liberata e i file restano nella cache.\tMobile mode: the small model runs in an isolated process; RAM is released when finished and files remain cached.
1× · leggera\t1× · light
2× · consigliata\t2× · recommended
3× · alta\t3× · high
4× · molto alta\t4× · very high
Nessuna · ricerca libera\tNone · free search
Bambini\tChildren
Animali\tAnimals
Alfabeto\tAlphabet
Numeri\tNumbers
Scienze\tScience
Natura\tNature
Trasporti\tTransport
Cibo\tFood
Musica\tMusic
Meteo\tWeather
Emozioni\tEmotions
Free / senza abbonamento\tFree / no subscription
Minima valida\tMinimum valid
≈ 0,8K lato corto\t≈ 0.8K short side
1K lato corto\t1K short side
1,5K lato corto\t1.5K short side
2K lato corto\t2K short side
Da prompt\tFrom prompt
96 dpi · bozza\t96 dpi · draft
150 dpi · standard\t150 dpi · standard
200 dpi · nitido\t200 dpi · sharp
300 dpi · stampa\t300 dpi · print
Disegna un’area da esportare in PNG, con margine e trasparenza.\tDraw an area to export as PNG, with margin and transparency.
Il modello viene caricato dalla cache in un processo isolato e rimosso dalla RAM al termine.\tThe model is loaded from cache in an isolated process and removed from RAM when finished.
L’originale resta invariato; la copia ridotta esiste solo durante la richiesta.\tThe original remains unchanged; the reduced copy exists only during the request.
Richiama istruzioni ricorrenti, stili e riferimenti conservati nel browser.\tReuse recurring instructions, styles, and references stored in the browser.
La barra mostra il saldo globale residuo rispetto alla capacità nota (allowance + top-up). Puter scala prima l’allowance mensile, poi i crediti acquistati.\tThe bar shows the total remaining balance against known capacity (allowance + top-up). Puter uses the monthly allowance first, then purchased credits.
Licenze, contenuti e crediti\tLicenses, content and credits
Progetti aperti\tOpen projects
Calcolo memoria e spazio browser…\tCalculating memory and browser storage…
Prompt riutilizzabili salvati nello storage del browser.\tReusable prompts saved in browser storage.
Adattamento proporzionale · margine 8%\tProportional fit · 8% margin
Applica\tApply
Formato\tFormat
Snap mm\tSnap mm
Numero pagina PDF\tPDF page number
Login, cambio account e logout da Puter sono gestibili nella sezione Generazione immagini AI della sidebar.\tPuter sign-in, account switching, and sign-out are managed in the AI image generation section of the sidebar.
Output previsto 1024 × 1024 px. Qualità e risoluzione sono indipendenti; i lati sono multipli di 16, rapporto massimo 3:1 e limite 3840 px / 8.294.400 pixel.\tExpected output 1024 × 1024 px. Quality and resolution are independent; sides are multiples of 16, the maximum aspect ratio is 3:1, and the limits are 3840 px / 8,294,400 pixels.
Modello e runtime vengono salvati nel browser dopo il primo download. L’avvio richiede comunque il caricamento in memoria. La cache può essere rimossa dal browser se lo spazio scarseggia.\tThe model and runtime are saved in the browser after the first download. Startup still requires loading them into memory. The browser may remove the cache when storage is low.
2,100 famiglie incorporate · nessuna richiesta all’API Fontsource.\t2,100 embedded families · no Fontsource API request.
Snap, guide e proporzioni\tSnapping, guides, and proportions
Scegli dal canvas il colore per strokeColor\tPick the text colour from the canvas
Scegli dal canvas il colore per emojiInk\tPick the emoji colour from the canvas
Cronologia modifiche\tEdit history
Apri in nuova scheda\tOpen in new tab
Indirizzo dell’immagine\tImage address
Usa Puter per scaricare l’immagine\tUse Puter to download the image
Per usare il caricamento tramite Puter effettua il login nella sezione Generazione immagini AI · Puter.\tTo load through Puter, sign in from the AI image generation · Puter section.
Vai al login\tGo to sign-in
Il caricamento diretto è gratuito ma alcuni siti lo bloccano. Puter usa banda o quota dell’account. Puoi anche copiare l’immagine dal sito e usare Incolla immagine dagli appunti.\tDirect loading is free, but some sites block it. Puter uses account bandwidth or allowance. You can also copy the image from the site and use Paste image from clipboard.
Come usarla senza Puter\tHow to use it without Puter
Puoi salvarla sul dispositivo. In alternativa apri l’immagine grande, usa il comando del browser Copia immagine, torna in chicCanva e premi Ctrl+V oppure Incolla speciale.\tYou can save it to your device. Alternatively, open the large image, use the browser’s Copy image command, return to chicCanva, and press Ctrl+V or Paste special.
Per inserire tramite Puter effettua il login nella sezione Generazione immagini AI · Puter.\tTo insert through Puter, sign in from the AI image generation · Puter section.
Accesso Puter richiesto\tPuter sign-in required
Fattore di scala\tScale factor
Qualità / compressione PNG\tPNG quality / compression
Tag\tTags
Fabric.js 5.1.0 e jsPDF 2.5.1: MIT. PDF.js 3.11.174: Apache License 2.0, Mozilla e contributori. ONNX Runtime Web 1.21.0: MIT e relative notice. IMG.LY background-removal 1.7.0: AGPL-3.0;\tFabric.js 5.1.0 and jsPDF 2.5.1: MIT. PDF.js 3.11.174: Apache License 2.0, Mozilla and contributors. ONNX Runtime Web 1.21.0: MIT and related notices. IMG.LY background-removal 1.7.0: AGPL-3.0;
sorgente e licenza\tsource and license
. OpenMoji 17: grafica CC BY-SA 4.0, HfG Schwäbisch Gmünd e collaboratori; codice OpenMoji LGPL-3.0 dove applicabile. Le opere pubblicate su Openclipart sono indicate dal progetto come pubblico dominio/CC0 1.0. Puter.js e i servizi Puter, inclusa la traduzione opzionale con Gemma 4 31B, seguono le rispettive licenze e condizioni del servizio. Fontsource, Google Fonts e ogni famiglia tipografica conservano la propria licenza.\t. OpenMoji 17: artwork under CC BY-SA 4.0, HfG Schwäbisch Gmünd and contributors; OpenMoji code under LGPL-3.0 where applicable. Works published on Openclipart are identified by the project as public domain/CC0 1.0. Puter.js and Puter services, including optional translation with Gemma 4 31B, follow their respective licences and terms of service. Fontsource, Google Fonts, and each font family retain their own licence.
Il caricamento diretto è gratuito ma alcuni siti lo bloccano. Puter usa banda o quota dell’account. Puoi anche copiare l’immagine dal sito e usare\tDirect loading is free, but some sites block it. Puter uses account bandwidth or allowance. You can also copy the image from the site and use
Puoi salvarla sul dispositivo. In alternativa apri l’immagine grande, usa il comando del browser\tYou can save it to your device. Alternatively, open the large image and use the browser’s
, torna in chicCanva e premi Ctrl+V oppure Incolla speciale.\tcommand, then return to chicCanva and press Ctrl+V or Paste special.
Quadrata · 210×210\tSquare · 210×210
Faccine ed emozioni\tSmileys and emotions
Persone e corpo\tPeople and body
Componenti e varianti\tComponents and variants
Animali e natura\tAnimals and nature
Cibo e bevande\tFood and drink
Viaggi e luoghi\tTravel and places
Simboli\tSymbols
Bandiere\tFlags
Extra OpenMoji\tExtra OpenMoji
Extra Unicode\tExtra Unicode
Contorni spessi\tBold outlines
Contorni delicati\tDelicate outlines
Fumetto a colori\tColour comic
Clipart educativa\tEducational clipart
Pastello\tPastel
Geometrico\tGeometric
Acquerello semplice\tSimple watercolour
Accedi a Puter per la traduzione AI\tSign in to Puter for AI translation
← Precedente\t← Previous
Successiva →\tNext →
Pensiero\tThought bubble
Freccia piena\tSolid arrow
Doppia piena\tSolid double arrow
Su / giù\tUp / down
Linea freccia\tArrow line
Linea doppia\tDouble arrow line
Mano liscia\tSmooth freehand
Mano raw\tRaw freehand
Rigenera\tRegenerate
Righe\tStripes
Pois\tDots
Quadretti\tChecks
Griglia\tGrid
Onde\tWaves
Coriandoli\tConfetti
Tratteggio\tHatching
Mattoncini\tBricks
Zig zag\tZigzag
Rombi\tDiamonds
Nido d’ape\tHoneycomb
Codette\tSprinkles
Stelline\tLittle stars
Scaglie\tScales
Tessuto\tFabric
Annota immagine di riferimento\tAnnotate reference image
Modifica annotazioni\tEdit annotations
Disponibile con i modelli GPT Image 2.5. Consigliato Sunburst, più preciso per modifiche mirate.\tAvailable with GPT Image 2.5 models. Sunburst is recommended for more precise targeted edits.
Passa a Sunburst\tSwitch to Sunburst
Indica le aree da modificare e descrivi ogni intervento.\tMark the areas to edit and describe each change.
Strumenti di annotazione\tAnnotation tools
Seleziona\tSelect
Rettangolo\tRectangle
Ovale\tOval
Punto\tPoint
Trascina per creare un marker. Con Seleziona puoi spostarlo o ridimensionarlo dalla maniglia.\tDrag to create a marker. With Select you can move it or resize it from the handle.
Nessuna annotazione.\tNo annotations.
Descrivi la modifica per questa area…\tDescribe the change for this area…
Elimina marker\tDelete marker
Riduci zoom\tZoom out
Aumenta zoom\tZoom in
Adatta\tFit
Elimina annotazioni\tDelete annotations
Salva annotazioni\tSave annotations
Chiudi senza salvare\tClose without saving
Apri l’editor delle annotazioni\tOpen the annotation editor
Le annotazioni sono disponibili solo con i modelli GPT Image 2.5.\tAnnotations are available only with GPT Image 2.5 models.
Seleziona marker\tSelect marker
Marker rettangolare\tRectangle marker
Marker ovale\tOval marker
Spot numerato\tNumbered spot
Elimina annotazione selezionata; clic destro o pressione lunga per eliminarle tutte\tDelete selected annotation; right-click or long-press to delete all
Elimina annotazione selezionata\tDelete selected annotation
Commenti annotazioni\tAnnotation comments
Commenti\tComments
Chiudi pannello commenti\tClose comments panel
Apri o chiudi i commenti\tOpen or close comments
Tutte le annotazioni\tAll annotations
Nessun commento\tNo comment
Elimina tutte le annotazioni\tDelete all annotations
2 riferimenti\t2 references
Annotazioni salvate\tAnnotations saved
Annotazioni eliminate\tAnnotations deleted
CANC\tDelete
`.trim().split('\n').filter(Boolean).map(line=>{const i=line.indexOf('\t');return[line.slice(0,i),line.slice(i+1)]}));

const I18N_PATTERNS=[
 [/^(\d[\d.,]*) crediti$/i,'$1 credits'],[/^Usati: (.+) · Residui: (.+)$/,'Used: $1 · Remaining: $2'],
 [/^Usato (.+)$/,'Used $1'],[/^Residuo (.+)$/,'Remaining $1'],[/^Disponibile (.+)$/,'Available $1'],
 [/^Pagina (\d+)(.*)$/,'Page $1$2'],[/^Progetto (\d+)(.*)$/,'Project $1$2'],
 [/^(\d+) pagine$/,'$1 pages'],[/^(\d+) oggetti$/,'$1 objects'],[/^(\d+) assets?$/,'$1 assets'],
 [/^Salvato alle (.+)$/,'Saved at $1'],[/^Ultimo salvataggio: (.+) · (\d+) progetti\.$/,'Last saved: $1 · $2 projects.'],[/^Ultimo salvataggio: (.+)$/,'Last saved: $1'],
 [/^Aggiornato (.+)$/,'Updated $1'],[/^Prezzi Puter aggiornati (.+)$/,'Puter prices updated $1'],[/^Prezzi Puter salvati (.+)$/,'Saved Puter prices $1'],
 [/^Stima Listino: (.+)$/,'Price-list estimate: $1'],[/^Ultima Gen: (.+)$/,'Last generation: $1'],
 [/^Font selezionato: (.+)$/,'Selected font: $1'],[/^(\d[\d.]*) famiglie incorporate(.*)$/,'$1 embedded families$2'],
 [/^Gruppo selezionato · (\d+) elementi$/,'Selected group · $1 items'],[/^Selezione multipla · (\d+) oggetti$/,'Multiple selection · $1 objects'],
 [/^Chiudi (.+)$/,'Close $1'],[/^Apri (.+)$/,'Open $1'],
 [/^Asset nei progetti: (.+) · bitmap pagina attiva: (.+)$/,'Project assets: $1 · active-page bitmap: $2'],
 [/^Spazio browser: (.+)$/,'Browser storage: $1'],
 [/^(.+) · doppio clic o clic destro per rinominare$/,'$1 · double-click or right-click to rename']
 ,[/^(\d[\d.,]*) famiglie$/,'$1 families']
 ,[/^Invio: (\d+) × (\d+) px\. L’originale resta invariato; la copia ridotta esiste solo durante la richiesta\.$/,'Sent: $1 × $2 px. The original remains unchanged; the reduced copy exists only during the request.']
 ,[/^Usati? ([\d.,]+) crediti(.*)$/i,'Used $1 credits$2']
 ,[/^Disponibile ([\d.,]+)% · ([\d.,]+) crediti(.*)$/i,'Available $1% · $2 credits$3']
 ,[/^(.*?)([\d.,]+) crediti(.*)$/i,'$1$2 credits$3']
 ,[/^Scegli dal canvas il colore per (.+)$/,'Pick $1 from the canvas']
 ,[/^(Last saved: .+ · \d+) progetti\.$/,'$1 projects.']
 ,[/^Match curato · colorabile (\d+) · forma (\d+) · artistico (\d+) · bordo suggerito (.+)\.$/,'Curated match · colorability $1 · shape $2 · artistic $3 · suggested outline $4.']
 ,[/^Mostra altri \((.+)\)$/,'Show more ($1)']
 ,[/^Mostra altre (\d+)$/,'Show $1 more']
 ,[/^(\d+) di (\d+) emoji · ricerca globale(.*)$/,'$1 of $2 emoji · global search$3']
 ,[/^(\d+) di (\d+) emoji(.*)$/,'$1 of $2 emoji$3']
 ,[/^Rimuovi tag (.+)$/,'Remove tag $1']
 ,[/^Output previsto (\d+) × (\d+) px\. Qualità e risoluzione sono indipendenti; i lati sono multipli di 16, rapporto massimo 3:1 e limite 3840 px \/ 8\.294\.400 pixel\.$/,'Expected output $1 × $2 px. Quality and resolution are independent; sides are multiples of 16, the maximum aspect ratio is 3:1, with limits of 3840 px / 8,294,400 pixels.']
 ,[/^Output previsto (\d+) × (\d+) px\. $/,'Expected output $1 × $2 px. ']
 ,[/^Invio: (\d+) × (\d+) px\. L’originale resta invariato; la copia scalata esiste solo durante la richiesta\.$/,'Sent: $1 × $2 px. The original remains unchanged; the scaled copy exists only during the request.']
 ,[/^Preparazione della copia ingrandita del riferimento…$/,'Preparing the enlarged reference copy…']
 ,[/^2 riferimenti (.+)$/,'2 references $1']
 ,[/^Commento #(\d+)$/,'Comment #$1']
 ,[/^Commento annotazione #(\d+)$/,'Annotation #$1 comment']
 ,[/^Commenti · (\d+)$/,'Comments · $1']
];
const I18N_SKIP_SELECTOR='script,style,template,textarea,input,[contenteditable="true"],[data-i18n-ignore],#projectTabs,#pageSelect,#customPageName,#pageCaption,#customPageChips,#previewGrid,#fontResults,#emojiGrid,#clipartResults,#promptLibraryItems,#promptEntryPrompt,#promptEntryTitle,#promptEntryDescription,#promptEntryTags,#aiPrompt,#textInput,#specialText';
const i18nOriginalText=new WeakMap(),i18nLastText=new WeakMap(),i18nOriginalAttrs=new WeakMap(),i18nLastAttrs=new WeakMap();
function appLocale(){return appLanguage==='it'?'it-IT':'en-GB'}
function browserPrefersItalian(languages=navigator.languages,language=navigator.language,intlLocale='',legacyLanguage=navigator.userLanguage){const candidates=[...(Array.isArray(languages)?languages:[]),language,intlLocale,legacyLanguage].filter(Boolean).map(value=>String(value).trim().toLowerCase());return candidates.some(value=>value==='it'||value.startsWith('it-'))}
function localizedProjectName(index){return(appLanguage==='it'?'Progetto ':'Project ')+index}
function localizedPageName(index){return(appLanguage==='it'?'Pagina ':'Page ')+index}
function localizedUntitledPageName(){return appLanguage==='it'?'Pagina senza nome':'Untitled page'}
function localizedCopySuffix(){return appLanguage==='it'?' copia':' copy'}
function localizedRecoveredProjectName(){return appLanguage==='it'?'Progetto recuperato':'Recovered project'}
function localizedSpecialProjectName(explicit,text){return(appLanguage==='it'?(explicit?'Gruppi':'Lettere'):(explicit?'Groups':'Letters'))+' · '+text.slice(0,35)}
function t(value){if(appLanguage!=='en'||value===null||value===undefined)return String(value??'');const source=String(value),exact=I18N_EN[source];if(exact!==undefined)return exact;for(const[pattern,replacement]of I18N_PATTERNS)if(pattern.test(source))return source.replace(pattern,replacement);return source}
function setLocalizedText(element,italianSource){if(!element)return;const source=String(italianSource??''),next=appLanguage==='en'?t(source):source;i18nApplying=true;element.textContent=next;i18nApplying=false;const node=element.firstChild;if(node?.nodeType===Node.TEXT_NODE){i18nOriginalText.set(node,source);i18nLastText.set(node,next)}return next}
function setLocalizedTextParts(element,...italianParts){if(!element)return;const parts=italianParts.map(part=>String(part??'')),source=parts.join(''),next=appLanguage==='en'?parts.map(t).join(''):source;i18nApplying=true;element.textContent=next;i18nApplying=false;const node=element.firstChild;if(node?.nodeType===Node.TEXT_NODE){i18nOriginalText.set(node,source);i18nLastText.set(node,next)}return next}
function setLocalizedAttribute(element,name,italianSource){if(!element)return;const source=String(italianSource??''),next=appLanguage==='en'?t(source):source;let originals=i18nOriginalAttrs.get(element),last=i18nLastAttrs.get(element);if(!originals){originals={};i18nOriginalAttrs.set(element,originals)}if(!last){last={};i18nLastAttrs.set(element,last)}originals[name]=source;last[name]=next;i18nApplying=true;element.setAttribute(name,next);i18nApplying=false;return next}
function localizedAttributeSource(element,name){return i18nOriginalAttrs.get(element)?.[name]??element?.getAttribute(name)??''}
function i18nSkipped(node){return node.parentElement?.closest(I18N_SKIP_SELECTOR)}
function translateTextNode(node){if(!node?.parentElement||i18nSkipped(node))return;const current=node.nodeValue;if(!i18nForce&&i18nLastText.get(node)===current)return;let source=i18nOriginalText.get(node);if(source===undefined||(!i18nForce&&current!==i18nLastText.get(node))){source=current;i18nOriginalText.set(node,source)}const leading=source.match(/^\s*/)?.[0]||'',trailing=source.match(/\s*$/)?.[0]||'',core=source.trim();if(!core)return;const next=appLanguage==='it'?source:leading+t(core)+trailing;i18nApplying=true;node.nodeValue=next;i18nLastText.set(node,next);i18nApplying=false}
function translateAttributes(element){if(element.closest?.('[data-i18n-ignore]'))return;const names=['title','aria-label','placeholder','alt','data-tip'];let originals=i18nOriginalAttrs.get(element),last=i18nLastAttrs.get(element);if(!originals){originals={};i18nOriginalAttrs.set(element,originals)}if(!last){last={};i18nLastAttrs.set(element,last)}for(const name of names){const current=element.getAttribute?.(name);if(current===null)continue;if(!(name in originals)||current!==last[name])originals[name]=current;const next=appLanguage==='it'?originals[name]:t(originals[name]);if(current!==next){i18nApplying=true;element.setAttribute(name,next);i18nApplying=false}last[name]=next}}
function translateSubtree(root=document.body){if(!root)return;if(root.nodeType===Node.TEXT_NODE){translateTextNode(root);return}if(root.nodeType!==Node.ELEMENT_NODE&&root!==document.body)return;if(root!==document.body)translateAttributes(root);for(const element of root.querySelectorAll?.('*')||[])translateAttributes(element);const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode())translateTextNode(node)}
function syncLanguagePickers(){for(const picker of document.querySelectorAll('[data-language-picker]')){const flag=picker.querySelector('[data-language-flag]');flag.classList.toggle('flag-it',appLanguage==='it');flag.classList.toggle('flag-gb',appLanguage==='en');const name=picker.querySelector('[data-language-name]');if(name)name.textContent=appLanguage==='it'?'Italiano':'English';for(const button of picker.querySelectorAll('[data-language]'))button.setAttribute('aria-checked',String(button.dataset.language===appLanguage))}}
function swapLocalizedGuide(){const content=$('helpLayer')?.querySelector('.help-content');if(!content)return;if(!globalThis.CHICCANVA_HELP_IT)globalThis.CHICCANVA_HELP_IT=content.innerHTML;const html=appLanguage==='en'?globalThis.CHICCANVA_HELP_EN:globalThis.CHICCANVA_HELP_IT;if(html&&content.innerHTML!==html){i18nApplying=true;content.innerHTML=html;i18nApplying=false}}
function syncSearchTranslationLanguage(){const italian=appLanguage==='it',saved=localStorage.getItem(TRANSLATION_PREFERENCE_KEY),preferred=saved===null?true:saved==='true';for(const id of ['emojiTranslate','clipartTranslate']){const input=$(id);if(!input)continue;input.closest('label')?.classList.toggle('hidden',!italian);input.disabled=!italian;input.checked=italian&&preferred}for(const node of document.querySelectorAll('[data-puter-translation-hint],[data-translation-cache-control]'))node.classList.toggle('language-hidden',!italian);if(typeof syncEmojiSearchMode==='function')syncEmojiSearchMode()}
function applyLanguage(language,{persist=true,syncFeatures=true,reveal=true}={}){appLanguage=SUPPORTED_LANGUAGES.includes(language)?language:'en';if(persist)localStorage.setItem(LANGUAGE_STORAGE_KEY,appLanguage);document.documentElement.lang=appLanguage;document.title=appLanguage==='it'?'chicCanva · Piccole idee, grandi progetti':'chicCanva · Small ideas, big projects';const manifest=document.querySelector('link[rel="manifest"]');if(manifest){const version=new URL(manifest.href,location.href).search;manifest.href=(appLanguage==='en'?'./chicCanva-en.webmanifest':'./chicCanva.webmanifest')+version}swapLocalizedGuide();i18nForce=true;translateSubtree(document.body);i18nForce=false;syncLanguagePickers();if(syncFeatures)syncSearchTranslationLanguage();if(typeof workspaceReady!=='undefined'&&workspaceReady){renderProjectTabs?.();localizeWorkspaceQuickJump?.();renderFontCategories?.();renderEmojiGrid?.();syncReferenceUI?.();updateAiOutputHelp?.();refreshPuterUsage?.(true);updateAiEstimate?.();renderPromptLibrary?.()}if(reveal){document.documentElement.classList.remove('i18n-boot');document.documentElement.style.removeProperty('visibility')}document.dispatchEvent(new CustomEvent('chiccanva:languagechange',{detail:{language:appLanguage,locale:appLocale()}}));return appLanguage}
function closeLanguageMenus(){for(const menu of document.querySelectorAll('.language-menu'))menu.classList.add('hidden');for(const button of document.querySelectorAll('[data-language-trigger]'))button.setAttribute('aria-expanded','false')}
function setupLanguagePicker(){if(i18nPickerReady)return;i18nPickerReady=true;for(const button of document.querySelectorAll('.quick-jump button'))button.dataset.i18nKey=button.textContent.trim();for(const picker of document.querySelectorAll('[data-language-picker]')){const trigger=picker.querySelector('[data-language-trigger]'),menu=picker.querySelector('.language-menu');trigger.onclick=event=>{event.stopPropagation();const opening=menu.classList.contains('hidden');closeLanguageMenus();menu.classList.toggle('hidden',!opening);trigger.setAttribute('aria-expanded',String(opening))};for(const button of menu.querySelectorAll('[data-language]'))button.onclick=()=>{applyLanguage(button.dataset.language);closeLanguageMenus();toast(appLanguage==='it'?'Lingua impostata: Italiano':'Language set: English')}}document.addEventListener('pointerdown',event=>{if(!event.target.closest('[data-language-picker]'))closeLanguageMenus()});for(const id of ['emojiTranslate','clipartTranslate'])$(id)?.addEventListener('change',event=>{if(appLanguage==='it')localStorage.setItem(TRANSLATION_PREFERENCE_KEY,String(event.currentTarget.checked))});i18nObserver=new MutationObserver(records=>{if(i18nApplying)return;for(const record of records){if(record.type==='characterData')translateTextNode(record.target);else if(record.type==='attributes')translateAttributes(record.target);else for(const node of record.addedNodes)translateSubtree(node)}});i18nObserver.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder','alt','data-tip']});syncLanguagePickers()}
function preferredInitialLanguage(){let saved=null;try{saved=localStorage.getItem(LANGUAGE_STORAGE_KEY)}catch(error){}if(SUPPORTED_LANGUAGES.includes(saved))return saved;let intlLocale='';try{intlLocale=Intl.DateTimeFormat().resolvedOptions().locale}catch(error){}return browserPrefersItalian(navigator.languages,navigator.language,intlLocale)?'it':'en'}
const i18nBaseInit=init;init=async function(){appLanguage=preferredInitialLanguage();setupLanguagePicker();applyLanguage(appLanguage,{persist:true,syncFeatures:false,reveal:true});await i18nBaseInit();applyLanguage(appLanguage,{persist:false,syncFeatures:true,reveal:true})};
const i18nBaseClearAllMemory=clearAllMemory;clearAllMemory=async function(){await i18nBaseClearAllMemory();localStorage.removeItem(LANGUAGE_STORAGE_KEY);localStorage.removeItem(TRANSLATION_PREFERENCE_KEY)};
globalThis.t=t;globalThis.setLocalizedText=setLocalizedText;globalThis.setLocalizedTextParts=setLocalizedTextParts;globalThis.setLocalizedAttribute=setLocalizedAttribute;globalThis.localizedAttributeSource=localizedAttributeSource;globalThis.appLocale=appLocale;globalThis.applyLanguage=applyLanguage;globalThis.browserPrefersItalian=browserPrefersItalian;globalThis.localizedProjectName=localizedProjectName;globalThis.localizedPageName=localizedPageName;
