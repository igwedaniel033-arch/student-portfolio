<#
compress_images.ps1
Converts PNG social assets to compressed JPEGs for smaller uploads.
Usage: Right-click -> Run with PowerShell, or run from PowerShell 7.
#>

param(
    [string]$Folder = "$PSScriptRoot",
    [int]$Quality = 82
)

Write-Host "Folder: $Folder`nQuality: $Quality"

Add-Type -AssemblyName System.Drawing

$pngs = @('Nehemiah-1080x1080.png','Nehemiah-1200x630.png','Nehemiah-1024x1024.png','Nehemiah-study.png') | ForEach-Object { Join-Path $Folder $_ } | Where-Object { Test-Path $_ }
if(-not $pngs){ Write-Host 'No PNG files found in folder.'; exit 0 }

function Get-JpegEncoder {
    $encoders = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()
    return $encoders | Where-Object { $_.MimeType -eq 'image/jpeg' }
}

$encoder = Get-JpegEncoder
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$qualityParam = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int]$Quality)
$encoderParams.Param[0] = $qualityParam

foreach($png in $pngs){
    try{
        $img = [System.Drawing.Image]::FromFile($png)
        $jpgPath = [IO.Path]::ChangeExtension($png, '.jpg')
        $img.Save($jpgPath, $encoder, $encoderParams)
        $img.Dispose()
        Write-Host "Saved: $jpgPath"
    } catch {
        Write-Warning "Failed to convert $png : $_"
    }
}

Write-Host 'Done.'
