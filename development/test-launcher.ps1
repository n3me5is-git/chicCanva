$root=Get-Location; $file=Join-Path $root 'OutlineLab_v5.html'; if(!(Test-Path -LiteralPath $file)){Write-Host 'HTML non trovato'; exit 1};
$listener=New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:8002/');
try{$listener.Start()}catch{Write-Host 'Porta occupata o non disponibile. Chiudi il vecchio server e riprova.'; exit 1};

try{while($listener.IsListening){$ctx=$listener.GetContext(); $res=$ctx.Response;
try{if($ctx.Request.HttpMethod -ne 'GET'){$res.StatusCode=405}else{if($ctx.Request.Url.LocalPath -in @('/','/index.html','/OutlineLab_v5.html')){$bytes=[IO.File]::ReadAllBytes($file);$res.ContentType='text/html; charset=utf-8';$res.Headers['Cache-Control']='no-cache';$res.ContentLength64=$bytes.Length;$res.OutputStream.Write($bytes,0,$bytes.Length)}else{$res.StatusCode=404}}}finally{$res.Close()}}}finally{$listener.Stop()}