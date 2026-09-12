Add-Type -AssemblyName System.Drawing

function New-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$radius) {
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $d = $radius * 2
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

function New-ChiccaIcon([int]$size, [string]$target) {
    $bitmap = [System.Drawing.Bitmap]::new($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $scale = $size / 512.0
    $graphics.ScaleTransform($scale, $scale)

    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#e8f3ee'))
    $accent = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#298879'))
    $hair = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#694739'))
    $skin = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#ffd9b7'))
    $paper = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#fff5d4'))
    $yellow = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#f2b84b'))
    $inkPen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#304f48'), 15)
    $inkPen.StartCap = $inkPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $bookPen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#d6b765'), 8)

    $outer = New-RoundedPath 28 28 456 456 112
    $graphics.FillPath($accent, $outer)
    $inner = New-RoundedPath 58 58 396 396 92
    $graphics.FillPath(([System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#f4fbf7'))), $inner)

    $graphics.FillEllipse($hair, 128, 72, 260, 286)
    $graphics.FillEllipse($skin, 154, 98, 208, 226)
    $graphics.FillPie($hair, 134, 64, 244, 164, 180, 180)
    $graphics.FillPolygon($hair, [System.Drawing.PointF[]]@(
        [System.Drawing.PointF]::new(145,185), [System.Drawing.PointF]::new(185,105),
        [System.Drawing.PointF]::new(239,157), [System.Drawing.PointF]::new(283,105),
        [System.Drawing.PointF]::new(366,184), [System.Drawing.PointF]::new(354,102),
        [System.Drawing.PointF]::new(157,92)
    ))

    $glassesPen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#304f48'), 12)
    $graphics.DrawEllipse($glassesPen, 175, 189, 72, 57)
    $graphics.DrawEllipse($glassesPen, 265, 189, 72, 57)
    $graphics.DrawLine($glassesPen, 247, 215, 265, 215)
    $smilePen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#304f48'), 10)
    $graphics.DrawArc($smilePen, 222, 238, 68, 48, 20, 140)

    $body = New-RoundedPath 112 320 288 156 70
    $graphics.FillPath($accent, $body)
    $graphics.FillPolygon($paper, [System.Drawing.PointF[]]@(
        [System.Drawing.PointF]::new(128,353), [System.Drawing.PointF]::new(256,380),
        [System.Drawing.PointF]::new(384,353), [System.Drawing.PointF]::new(384,454),
        [System.Drawing.PointF]::new(256,478), [System.Drawing.PointF]::new(128,454)
    ))
    $graphics.DrawPolygon($bookPen, [System.Drawing.PointF[]]@(
        [System.Drawing.PointF]::new(128,353), [System.Drawing.PointF]::new(256,380),
        [System.Drawing.PointF]::new(384,353), [System.Drawing.PointF]::new(384,454),
        [System.Drawing.PointF]::new(256,478), [System.Drawing.PointF]::new(128,454)
    ))
    $graphics.DrawLine($bookPen, 256, 380, 256, 478)
    $graphics.FillPolygon($yellow, [System.Drawing.PointF[]]@(
        [System.Drawing.PointF]::new(390,337), [System.Drawing.PointF]::new(428,228),
        [System.Drawing.PointF]::new(450,236), [System.Drawing.PointF]::new(411,345),
        [System.Drawing.PointF]::new(389,362)
    ))

    $bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
    foreach ($item in @($graphics, $bitmap, $accent, $hair, $skin, $paper, $yellow, $inkPen, $bookPen, $glassesPen, $smilePen, $outer, $inner, $body)) { if ($null -ne $item) { $item.Dispose() } }
}

$output = Join-Path $PSScriptRoot 'pwa'
New-Item -ItemType Directory -Force -Path $output | Out-Null
New-ChiccaIcon 192 (Join-Path $output 'chiccanva-192.png')
New-ChiccaIcon 512 (Join-Path $output 'chiccanva-512.png')

# Social crawlers receive a simple 1200x630 card containing only the app mark.
# Keeping text out of the bitmap avoids illegible crops on compact previews.
$source = [System.Drawing.Image]::FromFile((Join-Path $output 'chiccanva-512.png'))
$share = [System.Drawing.Bitmap]::new(1200, 630)
$shareGraphics = [System.Drawing.Graphics]::FromImage($share)
$shareGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$shareGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$shareGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$shareGraphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#edf6f2'))
$markSize = 470
$shareGraphics.DrawImage($source, [int]((1200-$markSize)/2), [int]((630-$markSize)/2), $markSize, $markSize)
$share.Save((Join-Path $output 'chiccanva-share.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$encoder = [System.Drawing.Imaging.Encoder]::Quality
$parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new($encoder, [long]90)
$share.Save((Join-Path $output 'chiccanva-share.jpg'), $jpegCodec, $parameters)
foreach ($item in @($parameters.Param[0], $parameters, $shareGraphics, $share, $source)) { if ($null -ne $item) { $item.Dispose() } }
