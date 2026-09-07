@echo off
setlocal
cd /d "%~dp0"
title OutlineLab v4 - Web Server Locale per Puter
set "PORT=8000"
set "HTML=OutlineLab_v4.html"

echo Avvio OutlineLab v4 su http://localhost:%PORT%/
echo File servito: %HTML%
echo Chiudi questa finestra per fermare il server.
start "" "http://localhost:%PORT%/"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$port=%PORT%; $html='%HTML%';" ^
  "$listener=New-Object System.Net.HttpListener;" ^
  "$listener.Prefixes.Add(('http://localhost:{0}/' -f $port));" ^
  "$listener.Start();" ^
  "Write-Host ('OutlineLab server attivo su http://localhost:{0}/' -f $port);" ^
  "while($listener.IsListening){" ^
    "$ctx=$listener.GetContext(); $req=$ctx.Request; $res=$ctx.Response;" ^
    "$res.Headers['Access-Control-Allow-Origin']='*';" ^
    "$res.Headers['Access-Control-Allow-Methods']='GET, OPTIONS';" ^
    "$res.Headers['Access-Control-Allow-Headers']='Content-Type, Authorization, Origin';" ^
    "if($req.HttpMethod -eq 'OPTIONS'){ $res.StatusCode=204; $res.Close(); continue }" ^
    "$path=$req.Url.LocalPath;" ^
    "if($path -eq '/' -or $path -eq '/index.html' -or $path -eq ('/'+$html)){ $file=Join-Path (Get-Location) $html } else { $file=Join-Path (Get-Location) $path.TrimStart('/') }" ^
    "if(Test-Path $file -PathType Leaf){" ^
      "$ext=[IO.Path]::GetExtension($file).ToLowerInvariant();" ^
      "$types=@{'.html'='text/html; charset=utf-8';'.js'='text/javascript; charset=utf-8';'.css'='text/css; charset=utf-8';'.json'='application/json; charset=utf-8';'.svg'='image/svg+xml';'.png'='image/png';'.jpg'='image/jpeg';'.jpeg'='image/jpeg';'.webp'='image/webp'};" ^
      "$bytes=[IO.File]::ReadAllBytes($file); $res.ContentLength64=$bytes.Length; $ct='application/octet-stream'; if($types.ContainsKey($ext)){ $ct=$types[$ext] }; $res.ContentType=$ct; $res.OutputStream.Write($bytes,0,$bytes.Length);" ^
    "} else { $res.StatusCode=404 }" ^
    "$res.Close();" ^
  "}"

endlocal
