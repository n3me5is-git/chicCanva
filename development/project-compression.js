// Portable lossless GZIP project files. Plain JSON remains fully supported.
const CHIC_GZIP_MIME='application/gzip';
function gzipSupported(){return typeof CompressionStream==='function'&&typeof DecompressionStream==='function'}
async function gzipBlob(blob){return new Blob([await new Response(blob.stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()],{type:CHIC_GZIP_MIME})}
async function gunzipFile(file){const bytes=new Uint8Array(await file.slice(0,2).arrayBuffer());if(bytes[0]!==0x1f||bytes[1]!==0x8b)return file;const plain=await new Response(file.stream().pipeThrough(new DecompressionStream('gzip'))).blob();return new File([plain],file.name.replace(/\.gz$/i,''),{type:'application/json'})}
async function prepareProjectExportArtifact(record){const artifact=projectExportArtifact(record);if(!preferences.exportJsonCompressed||!gzipSupported())return artifact;return{...artifact,fileName:artifact.fileName+'.gz',blob:await gzipBlob(artifact.blob)}}
const compressedImportJsonFile=importJsonFile;
importJsonFile=async function(file){return compressedImportJsonFile(await gunzipFile(file))};
const compressedExportProjectRecord=exportProjectRecord;
exportProjectRecord=async function(record){if(!preferences.exportJsonCompressed||!gzipSupported())return compressedExportProjectRecord(record);const artifact=await prepareProjectExportArtifact(record);download(artifact.fileName,artifact.blob);markProjectExported(record);return artifact.payload};
const compressedReadPreferences=readPreferences;
readPreferences=function(){compressedReadPreferences();try{const saved=JSON.parse(localStorage.getItem(PREF_KEY)||'{}');preferences.exportJsonCompressed=saved.exportJsonCompressed!==false}catch(error){preferences.exportJsonCompressed=true}};
const compressedBindWorkspace=bindWorkspace;
bindWorkspace=function(){compressedBindWorkspace();const control=$('exportJsonCompressed');$('jsonFile').accept='application/json,application/gzip,.json,.json.gz,.gz';control.checked=preferences.exportJsonCompressed!==false;control.disabled=!gzipSupported();control.onchange=()=>{preferences.exportJsonCompressed=control.checked;writePreferences()}};
