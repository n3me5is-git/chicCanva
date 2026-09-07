@echo off
setlocal
cd /d "%~dp0"
title chicCanva - Server locale
set "PORT=8000"
set "HTML=chicCanva.html"
echo chicCanva: http://localhost:%PORT%/
echo Chiudi questa finestra per fermare il server.
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
 "$root=Get-Location; $file=Join-Path $root '%HTML%'; if(!(Test-Path -LiteralPath $file)){Write-Host 'HTML non trovato'; exit 1};" ^
 "$listener=New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:%PORT%/');" ^
 "try{$listener.Start()}catch{Write-Host 'Porta occupata o non disponibile. Chiudi il vecchio server e riprova.'; exit 1};" ^
 "Start-Process 'http://localhost:%PORT%/';" ^
 "try{while($listener.IsListening){$ctx=$listener.GetContext(); $res=$ctx.Response;" ^
 "try{if($ctx.Request.HttpMethod -ne 'GET'){$res.StatusCode=405}else{if($ctx.Request.Url.LocalPath -in @('/','/index.html','/%HTML%')){$bytes=[IO.File]::ReadAllBytes($file);$res.ContentType='text/html; charset=utf-8';$res.Headers['Cache-Control']='no-cache';$res.ContentLength64=$bytes.Length;$res.OutputStream.Write($bytes,0,$bytes.Length)}else{$res.StatusCode=404}}}finally{$res.Close()}}}finally{$listener.Stop()}"
pause
endlocal
