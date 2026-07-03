<#
upload_to_onedrive.ps1
Uploads a local file to your OneDrive (using Microsoft Graph PowerShell) and creates an anonymous view link.

Prerequisites:
- PowerShell (5.1 or 7+)
- You will be prompted to sign in with your Microsoft account when Connect-MgGraph runs.

Usage (interactive):
.\upload_to_onedrive.ps1 -LocalPath "C:\Users\User\OneDrive\Desktop\Church aquator\Nehemiah-study.pdf" -OneDrivePath "/Desktop/Church aquator/Nehemiah-study.pdf"

This script will:
1) Install Microsoft.Graph if missing.
2) Connect and request `Files.ReadWrite.All` scope.
3) Upload the file bytes to the specified OneDrive path (overwriting if present).
4) Create an anonymous view link and print it.
#>

param(
    [string]$LocalPath = "$PSScriptRoot\Nehemiah-study.pdf",
    [string]$OneDrivePath = "/Desktop/Church aquator/Nehemiah-study.pdf"
)

if(-not (Test-Path $LocalPath)){
    Write-Error "Local file not found: $LocalPath"
    exit 1
}

# Ensure Microsoft.Graph module
if(-not (Get-Module -ListAvailable -Name Microsoft.Graph)){
    Write-Host 'Installing Microsoft.Graph module (requires NuGet / internet)...'
    Install-Module Microsoft.Graph -Scope CurrentUser -Force -AllowClobber
}

Import-Module Microsoft.Graph

# Connect
Write-Host 'Connecting to Microsoft Graph. A browser window will open for authentication.'
Connect-MgGraph -Scopes Files.ReadWrite.All

# Read file bytes
$bytes = [System.IO.File]::ReadAllBytes($LocalPath)
$uri = "https://graph.microsoft.com/v1.0/me/drive/root:${OneDrivePath}:/content"
Write-Host "Uploading to OneDrive path: $OneDrivePath"

$response = Invoke-MgGraphRequest -Method PUT -Uri $uri -Body $bytes -ContentType 'application/octet-stream'
if(-not $response){ Write-Error 'Upload failed.'; exit 1 }

Write-Host 'Upload complete. Creating share link (anonymous view)...'
$createLinkBody = @{ type = 'view'; scope = 'anonymous' } | ConvertTo-Json
$linkResp = Invoke-MgGraphRequest -Method POST -Uri "https://graph.microsoft.com/v1.0/me/drive/root:${OneDrivePath}:/createLink" -Body $createLinkBody -ContentType 'application/json' | ConvertFrom-Json

if($linkResp -and $linkResp.link -and $linkResp.link.webUrl){
    Write-Host "Share link: $($linkResp.link.webUrl)"
} else {
    Write-Warning 'Could not create share link. You can create one via OneDrive UI.'
}

Write-Host 'Finished.'
