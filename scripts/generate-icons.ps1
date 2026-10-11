Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\Roy sulton\.gemini\antigravity\brain\1c59f722-51d6-483a-8fd3-ee2a4d460928\.user_uploaded\media_1791684556116.jpg"

if (-not (Test-Path $sourcePath)) {
    Write-Error "Source image not found at $sourcePath"
    exit 1
}

$sourceImg = [System.Drawing.Image]::FromFile($sourcePath)

function Resize-Image {
    param(
        [System.Drawing.Image]$img,
        [int]$width,
        [int]$height,
        [string]$outputPath,
        [int]$padPercent = 0
    )
    
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
    $destImage = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    $graphics = [System.Drawing.Graphics]::FromImage($destImage)
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)
    
    if ($padPercent -gt 0) {
        $padW = [int]($width * $padPercent / 100)
        $padH = [int]($height * $padPercent / 100)
        $targetRect = New-Object System.Drawing.Rectangle($padW, $padH, ($width - (2 * $padW)), ($height - (2 * $padH)))
        $graphics.DrawImage($img, $targetRect)
    } else {
        $graphics.DrawImage($img, $destRect)
    }
    
    $graphics.Dispose()
    
    $dir = [System.IO.Path]::GetDirectoryName($outputPath)
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    $destImage.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destImage.Dispose()
    Write-Host "Saved: $outputPath ($width x $height)"
}

# 1. Generate Web Assets (public/)
Resize-Image $sourceImg 512 512 "public\app-icon.png"
Resize-Image $sourceImg 512 512 "public\icon-512.png"
Resize-Image $sourceImg 192 192 "public\icon-192.png"
Resize-Image $sourceImg 64 64 "public\favicon.png"
Resize-Image $sourceImg 32 32 "public\favicon-32.png"

# 2. Generate Android Mipmap Icons
$androidRes = "android\app\src\main\res"

# Densities and sizes:
# mdpi: 48x48 (fg: 108x108)
# hdpi: 72x72 (fg: 162x162)
# xhdpi: 96x96 (fg: 216x216)
# xxhdpi: 144x144 (fg: 324x324)
# xxxhdpi: 192x192 (fg: 432x432)

$densities = @(
    @{ Name = "mipmap-mdpi"; Size = 48; FgSize = 108 },
    @{ Name = "mipmap-hdpi"; Size = 72; FgSize = 162 },
    @{ Name = "mipmap-xhdpi"; Size = 96; FgSize = 216 },
    @{ Name = "mipmap-xxhdpi"; Size = 144; FgSize = 324 },
    @{ Name = "mipmap-xxxhdpi"; Size = 192; FgSize = 432 }
)

foreach ($d in $densities) {
    $folder = Join-Path $androidRes $d.Name
    
    # Standard launcher icon
    Resize-Image $sourceImg $d.Size $d.Size (Join-Path $folder "ic_launcher.png")
    
    # Round launcher icon
    Resize-Image $sourceImg $d.Size $d.Size (Join-Path $folder "ic_launcher_round.png")
    
    # Adaptive foreground (scaled with ~15% padding so Android circle mask won't crop the squircle edges)
    Resize-Image $sourceImg $d.FgSize $d.FgSize (Join-Path $folder "ic_launcher_foreground.png") 12
}

$sourceImg.Dispose()
Write-Host "All icons generated successfully!"
