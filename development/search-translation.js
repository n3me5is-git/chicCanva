// Compact Italian -> English vocabulary for icon, emoji and classroom searches.
// Known words stay entirely local; Gemma is used only for unknown words or phrases.
const SEARCH_TRANSLATION_MODEL='google/gemma-4-31b-it';
const SEARCH_IT_EN=Object.freeze(Object.fromEntries(`
il\t
lo\t
la\t
i\t
gli\t
le\t
un\t
uno\t
una\t
di\t
del\t
della\t
dei\t
delle\t
da\t
a\t
in\t
su\t
per\t
tra\t
fra\t
con\twith
senza\twithout
e\tand
o\tor
albero\ttree
alberi\ttrees
acqua\twater
alfabeto\talphabet
amico\tfriend
amica\tfriend
amici\tfriends
amicizia\tfriendship
amore\tlove
animale\tanimal
animali\tanimals
ape\tbee
api\tbees
aquila\teagle
arcobaleno\trainbow
asinello\tdonkey
asino\tdonkey
balena\twhale
bruco\tcaterpillar
cammello\tcamel
cane\tdog
cani\tdogs
canguro\tkangaroo
capra\tgoat
cavallo\thorse
cavalli\thorses
cervo\tdeer
cicala\tcicada
cigno\tswan
civetta\towl
coccinella\tladybug
coccodrillo\tcrocodile
coniglio\trabbit
conigli\trabbits
delfino\tdolphin
dinosauro\tdinosaur
elefante\telephant
farfalla\tbutterfly
farfalle\tbutterflies
fenicottero\tflamingo
formica\tant
gallina\then
gallo\trooster
gatto\tcat
gatti\tcats
giraffa\tgiraffe
gufo\towl
ippopotamo\thippopotamus
leone\tlion
leoni\tlions
lupo\twolf
maiale\tpig
mucca\tcow
orso\tbear
panda\tpanda
papera\tduck
pecora\tsheep
pesce\tfish
pesci\tfish
pinguino\tpenguin
polpo\toctopus
pulcino\tchick
ragno\tspider
rana\tfrog
rinoceronte\trhinoceros
scoiattolo\tsquirrel
serpente\tsnake
squalo\tshark
tartaruga\tturtle
tigre\ttiger
topo\tmouse
uccello\tbird
uccelli\tbirds
zebra\tzebra
zoo\tzoo
bambino\tchild
bambina\tgirl
bambini\tchildren
bambine\tgirls
ragazzo\tboy
ragazza\tgirl
ragazzi\tchildren
neonato\tbaby
bebe\tbaby
famiglia\tfamily
mamma\tmother
madre\tmother
papa\tfather
padre\tfather
nonna\tgrandmother
nonno\tgrandfather
fratello\tbrother
sorella\tsister
persona\tperson
persone\tpeople
uomo\tman
donna\twoman
insegnante\tteacher
maestra\tteacher
maestro\tteacher
alunno\tstudent
alunna\tstudent
alunni\tstudents
studente\tstudent
studentessa\tstudent
scuola\tschool
classe\tclassroom
aula\tclassroom
asilo\tkindergarten
materna\tpreschool
elementare\telementary school
universita\tuniversity
biblioteca\tlibrary
laboratorio\tlaboratory
banco\tschool desk
lavagna\tblackboard
lavagna bianca\twhiteboard
libro\tbook
libri\tbooks
quaderno\tnotebook
quaderni\tnotebooks
matita\tpencil
matite\tpencils
penna\tpen
penne\tpens
pennarello\tmarker
pennarelli\tmarkers
pastello\tcrayon
pastelli\tcrayons
gomma\teraser
righello\truler
forbici\tscissors
colla\tglue
astuccio\tpencil case
zaino\tbackpack
cartella\tschool bag
foglio\tsheet of paper
fogli\tpaper sheets
carta\tpaper
compasso\tcompass
calcolatrice\tcalculator
microscopio\tmicroscope
provette\ttest tubes
diploma\tdiploma
certificato\tcertificate
lezione\tlesson
compiti\thomework
studio\tstudying
studiare\tstudy
leggere\tread
legge\treading
lettura\treading
scrivere\twrite
scrittura\twriting
disegnare\tdraw
disegno\tdrawing
colorare\tcoloring
colorabile\tcoloring page
imparare\tlearn
impara\tlearning
giocare\tplay
gioco\ttoy
giochi\ttoys
educazione\teducation
educativo\teducational
didattica\tteaching
matematica\tmath
geometria\tgeometry
scienza\tscience
scienze\tscience
storia\thistory
geografia\tgeography
italiano\tItalian language
inglese\tEnglish language
musica\tmusic
arte\tart
tecnologia\ttechnology
numero\tnumber
numeri\tnumbers
lettera\tletter
lettere\tletters
parola\tword
parole\twords
frase\tsentence
vocale\tvowel
vocali\tvowels
consonante\tconsonant
consonanti\tconsonants
abaco\tabacus
addizione\taddition
sottrazione\tsubtraction
moltiplicazione\tmultiplication
divisione\tdivision
frazione\tfraction
tabelline\tmultiplication table
calendario\tcalendar
orologio\tclock
mappa\tmap
globo\tglobe
bandiera\tflag
premio\taward
medaglia\tmedal
trofeo\ttrophy
cuore\theart
cuori\thearts
felice\thappy
felicita\thappiness
triste\tsad
tristezza\tsadness
arrabbiato\tangry
rabbia\tanger
paura\tfear
spaventato\tscared
sorpreso\tsurprised
sorpresa\tsurprise
calmo\tcalm
stanco\ttired
malato\tsick
innamorato\tin love
ridere\tlaughing
piangere\tcrying
sorriso\tsmile
sorridente\tsmiling
abbraccio\thug
bacio\tkiss
ciao\twaving
saluto\twaving
applauso\tclapping
pollice\tthumb
mano\thand
mani\thands
dito\tfinger
occhio\teye
occhi\teyes
orecchio\tear
naso\tnose
bocca\tmouth
dente\ttooth
denti\tteeth
viso\tface
faccia\tface
testa\thead
capelli\thair
braccio\tarm
gamba\tleg
piede\tfoot
piedi\tfeet
corpo\tbody
cervello\tbrain
rosso\tred
rossa\tred
blu\tblue
azzurro\tlight blue
verde\tgreen
giallo\tyellow
arancione\torange
viola\tpurple
rosa\tpink
marrone\tbrown
nero\tblack
nera\tblack
bianco\twhite
bianca\twhite
grigio\tgray
colori\tcolors
colorato\tcolorful
chiaro\tlight
scuro\tdark
cerchio\tcircle
quadrato\tsquare
rettangolo\trectangle
triangolo\ttriangle
ovale\toval
rombo\tdiamond
stella\tstar
stelle\tstars
pentagono\tpentagon
esagono\thexagon
ottagono\toctagon
freccia\tarrow
linea\tline
curva\tcurve
spirale\tspiral
simbolo\tsymbol
simboli\tsymbols
segno\tsign
spunta\tcheck mark
croce\tcross
domanda\tquestion
esclamazione\texclamation
idea\tidea
lampadina\tlight bulb
sole\tsun
luna\tmoon
terra\tearth
pianeta\tplanet
stella cadente\tshooting star
nuvola\tcloud
nuvole\tclouds
pioggia\train
neve\tsnow
temporale\tstorm
fulmine\tlightning
vento\twind
meteo\tweather
montagna\tmountain
mare\tsea
spiaggia\tbeach
fiume\triver
lago\tlake
bosco\tforest
natura\tnature
fiore\tflower
fiori\tflowers
foglia\tleaf
foglie\tleaves
pianta\tplant
erba\tgrass
fungo\tmushroom
frutta\tfruit
verdura\tvegetables
mela\tapple
pera\tpear
banana\tbanana
arancia\torange fruit
limone\tlemon
fragola\tstrawberry
ciliegia\tcherry
anguria\twatermelon
uva\tgrapes
carota\tcarrot
pomodoro\ttomato
pane\tbread
latte\tmilk
acqua\twater
succo\tjuice
torta\tcake
gelato\tice cream
caramella\tcandy
pizza\tpizza
colazione\tbreakfast
pranzo\tlunch
cena\tdinner
forchetta\tfork
cucchiaio\tspoon
coltello\tknife
piatto\tplate
bicchiere\tglass
casa\thouse
castello\tcastle
porta\tdoor
finestra\twindow
letto\tbed
sedia\tchair
tavolo\ttable
lampada\tlamp
telefono\tphone
computer\tcomputer
stampante\tprinter
macchina fotografica\tcamera
foto\tphoto
televisore\ttelevision
chiave\tkey
regalo\tgift
palloncino\tballoon
palloncini\tballoons
festa\tparty
compleanno\tbirthday
natale\tChristmas
pasqua\tEaster
halloween\tHalloween
carnevale\tcarnival
befana\tEpiphany witch
cuore san valentino\tValentine heart
automobile\tcar
auto\tcar
macchina\tcar
autobus\tbus
scuolabus\tschool bus
treno\ttrain
aereo\tairplane
elicottero\thelicopter
nave\tship
barca\tboat
bicicletta\tbicycle
moto\tmotorcycle
camion\ttruck
trattore\ttractor
ambulanza\tambulance
vigili del fuoco\tfire truck
semaforo\ttraffic light
strada\troad
sport\tsports
calcio\tsoccer
pallone\tball
basket\tbasketball
tennis\ttennis
nuoto\tswimming
corsa\trunning
danza\tdancing
ballo\tdancing
yoga\tyoga
chitarra\tguitar
pianoforte\tpiano
violino\tviolin
tamburo\tdrum
nota\tmusical note
note\tmusical notes
robot\trobot
razzo\trocket
astronauta\tastronaut
magia\tmagic
fata\tfairy
unicorno\tunicorn
principessa\tprincess
principe\tprince
pirata\tpirate
supereroe\tsuperhero
mostro\tmonster
fantasma\tghost
drago\tdragon
corona\tcrown
occhiali\tglasses
ombrello\tumbrella
borsa\tbag
vestito\tdress
maglietta\tt-shirt
scarpa\tshoe
scarpe\tshoes
inverno\twinter
primavera\tspring
estate\tsummer
autunno\tautumn
mattina\tmorning
sera\tevening
notte\tnight
giorno\tday
settimana\tweek
mese\tmonth
anno\tyear
`.trim().split('\n').map(line=>{const [it,en='']=line.split('\t');return[it,en]})));

function normalizeSearchWord(value){return String(value).toLocaleLowerCase('it-IT').normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
const SEARCH_TRANSLATION_CACHE_KEY='chicCanva.search-translations.v1',SEARCH_TRANSLATION_CACHE_LIMIT=500;
function readSearchTranslationCache(){try{const parsed=JSON.parse(localStorage.getItem(SEARCH_TRANSLATION_CACHE_KEY)||'{}');return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{}}catch(error){return{}}}
function cachedSearchTranslation(keyword){const item=readSearchTranslationCache()[normalizeSearchWord(String(keyword).trim())];return item&&typeof item.translated==='string'&&item.translated.trim()?item.translated.trim():''}
function rememberSearchTranslation(keyword,translated){try{const key=normalizeSearchWord(String(keyword).trim()),value=String(translated).trim();if(!key||!value)return;const cache=readSearchTranslationCache();cache[key]={translated:value,saved:Date.now()};const entries=Object.entries(cache).sort((a,b)=>(b[1]?.saved||0)-(a[1]?.saved||0)).slice(0,SEARCH_TRANSLATION_CACHE_LIMIT);localStorage.setItem(SEARCH_TRANSLATION_CACHE_KEY,JSON.stringify(Object.fromEntries(entries)))}catch(error){console.warn('Cache traduzioni non disponibile',error)}}
function clearSearchTranslationCache(){try{localStorage.removeItem(SEARCH_TRANSLATION_CACHE_KEY)}catch(error){}}
function translateClipartLocally(keyword){
 const parts=String(keyword).match(/[\p{L}\p{N}]+|[^\p{L}\p{N}]+/gu)||[],unknown=[];let changed=false;
 const translated=parts.map(part=>{if(!/[\p{L}\p{N}]/u.test(part))return part;const key=normalizeSearchWord(part);if(Object.prototype.hasOwnProperty.call(SEARCH_IT_EN,key)){changed=true;return SEARCH_IT_EN[key]}if(/^\d+$/.test(key))return part;unknown.push(part);return part}).join('').replace(/\s+([,;])/g,'$1').replace(/\s+/g,' ').trim();
 return{translated:translated||String(keyword).trim(),changed,complete:unknown.length===0,unknown}
}
function normalizedPuterText(response){
 const flatten=value=>{if(Array.isArray(value))return value.map(flatten).filter(Boolean).join('\n');if(value&&typeof value==='object'){const nested=value.text??value.output_text??value.content??value.value??'';return nested===value?'':flatten(nested)}return value};
 let text=flatten(response?.message?.content??response?.message??response?.text??response?.result??response);
 text=String(text||'').replace(/<\/(?:thought|thinking|reasoning|analysis)>/gi,'$&\n')
  .replace(/<(?:thought|thinking|reasoning|analysis)\b[^>]*>[\s\S]*?<\/(?:thought|thinking|reasoning|analysis)>/gi,'\n')
  .replace(/<(?:thought|thinking|reasoning|analysis)\b[^>]*>/gi,'\n')
  .replace(/```(?:text)?|```/gi,'\n')
  .replace(/<\/?(?:final|answer|output)>/gi,'\n');
 const lines=text.split(/\r?\n/).map(line=>line.trim()).filter(Boolean),marked=[...lines].reverse().find(line=>/^(?:target|final answer|final|answer|output|translation|english)\s*:/i.test(line)),candidate=(marked||lines.at(-1)||'')
  .replace(/^(?:target|final answer|final|answer|output|translation|english)\s*:\s*/i,'')
  .replace(/^[-*]\s*/,'').replace(/^['"“”`]+|['"“”`]+$/g,'').trim();
 return /<\/?(?:thought|thinking|reasoning|analysis)\b/i.test(candidate)||candidate==='[object Object]'?'':candidate
}
async function translateSearchKeyword(keyword){
 const local=translateClipartLocally(keyword);
 if(local.complete)return{translated:local.translated,note:'dizionario locale: “'+local.translated+'”',source:'local'};
 const cached=cachedSearchTranslation(keyword);if(cached)return{translated:cached,note:'traduzione AI memorizzata: “'+cached+'”',source:'cache'};
 if(location.protocol==='file:'||typeof puterSignedIn!=='function'||!puterSignedIn())return{translated:local.translated,note:local.changed?'traduzione locale parziale: “'+local.translated+'”':'termine originale · accedi a Puter per la traduzione AI',source:'fallback'};
 try{
  await ensurePuter();
  const prompt=JSON.stringify(String(keyword).slice(0,160))+' -> translate IT to EN, output only translated text, if input EN, output the same as input. If synonyms, choose the best. Context: emoji, clipart keyword search for drawing and creative projects / educational';
  // Gemma accepts OpenRouter's nested reasoning option through Puter. Prefer
  // low reasoning for ambiguous educational search terms. If that route is not
  // available, retry through Puter's default routing without reasoning options.
  let response,route='openrouter';
  try{response=await clipartTimed(puter.ai.chat(prompt,{model:SEARCH_TRANSLATION_MODEL,provider:'openrouter',normalize:true,reasoning:{effort:'low'}}),60000)}
  catch(primaryError){
   console.warn('Traduzione Gemma OpenRouter non disponibile; provo il routing Puter predefinito',primaryError);
   route='default';response=await clipartTimed(puter.ai.chat(prompt,{model:SEARCH_TRANSLATION_MODEL,normalize:true}),60000)
  }
  let translated=normalizedPuterText(response);
  if((!translated||translated.length>240)&&route==='openrouter'){
   route='default';response=await clipartTimed(puter.ai.chat(prompt,{model:SEARCH_TRANSLATION_MODEL,normalize:true}),60000);translated=normalizedPuterText(response)
  }
  if(!translated||translated.length>240)throw new Error('Risposta di traduzione non valida');
  rememberSearchTranslation(keyword,translated);
  schedulePuterUsageRefresh?.();
  return{translated,note:'traduzione AI Puter: “'+translated+'”',source:'puter',route}
 }catch(error){console.warn('Traduzione Gemma non disponibile',error);return{translated:local.translated,note:local.changed?'Puter non disponibile · traduzione locale parziale: “'+local.translated+'”':'Traduzione AI non disponibile · termine originale',source:'fallback'}}
}
async function translateClipartKeyword(keyword){
 clipartTranslationNote='';if(!$('clipartTranslate').checked||!keyword)return keyword;
 const result=await translateSearchKeyword(keyword);clipartTranslationNote=result.note;return result.translated
}
async function translateEmojiKeyword(keyword){return translateSearchKeyword(keyword)}

function syncPuterTranslationHints(signed=typeof puterSignedIn==='function'&&puterSignedIn()){
 for(const hint of document.querySelectorAll('[data-puter-translation-hint]'))hint.classList.toggle('hidden',!!signed)
}
const translationSyncPuterFetchControls=syncPuterFetchControls;
syncPuterFetchControls=function(signed=puterSignedIn()){translationSyncPuterFetchControls(signed);syncPuterTranslationHints(signed)};
