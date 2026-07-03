<#
PowerShell helper: Install Docker Desktop (via winget if available), wait for docker, start docker compose, and seed DB.
Run as Administrator.
Usage:
  .\install-and-run-docker.ps1
  .\install-and-run-docker.ps1 -NoInstall -NoSeed
#>
param(
  [switch]$NoInstall,
  [switch]$NoSeed,
  [int]$DockerWaitSeconds = 600
)

function Write-Info($m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Err($m){ Write-Host "[ERROR] $m" -ForegroundColor Red }

# Check winget availability
$winget = Get-Command winget -ErrorAction SilentlyContinue

if (-not $NoInstall) {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    if ($winget) {
      Write-Info 'Installing Docker Desktop via winget (requires admin)...'
      try {
        Start-Process -FilePath winget -ArgumentList 'install','--id','Docker.DockerDesktop','-e','--accept-package-agreements','--accept-source-agreements' -Wait -NoNewWindow
      } catch {
        Write-Err "winget install failed: $_"
        Write-Err 'Please install Docker Desktop manually: https://www.docker.com/products/docker-desktop'
        exit 1
      }
    } else {
      Write-Err 'winget not found. Please download Docker Desktop manually: https://www.docker.com/products/docker-desktop'
      exit 1
    }
  } else {
    Write-Info 'Docker binary already present.'
  }
} else {
  Write-Info 'Skipping Docker install as requested.'
}

# Wait for docker to be responsive
$deadline = (Get-Date).AddSeconds($DockerWaitSeconds)
while ((Get-Date) -lt $deadline) {
  try {
    $v = docker --version 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Info "Docker available: $v"; break }
  } catch {}
  Write-Info 'Waiting for Docker to become available...'
  Start-Sleep -Seconds 3
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Err 'Docker command still not available. Please start Docker Desktop and try again.'
  exit 1
}

# Determine compose command (v2 vs v1)
$composeCmd = 'docker compose'
try {
  docker compose version > $null 2>&1
  if ($LASTEXITCODE -ne 0) { throw 'no' }
} catch {
  if (Get-Command docker-compose -ErrorAction SilentlyContinue) { $composeCmd = 'docker-compose' } else { Write-Err 'Neither "docker compose" nor "docker-compose" is available.'; exit 1 }
}

# Start docker-compose stack
Push-Location -Path (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent)
# move to workspace root
$root = Resolve-Path "..\"
Pop-Location

# If running from scripts folder, ensure we run compose from repo root
$repoRoot = Join-Path -Path (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent) -ChildPath '..'
$repoRoot = Resolve-Path $repoRoot
Write-Info "Using repository root: $repoRoot"
Set-Location $repoRoot

Write-Info "Starting compose stack with: $composeCmd up --build -d"
& cmd /c "$composeCmd up --build -d"
if ($LASTEXITCODE -ne 0) { Write-Err 'docker compose up failed'; exit 1 }

# Wait for backend health
Write-Info 'Waiting for backend /health (http://localhost:3000/health)'
$deadline = (Get-Date).AddSeconds(180)
$ok = $false
while ((Get-Date) -lt $deadline) {
  try {
    $r = Invoke-WebRequest -Uri 'http://localhost:3000/health' -UseBasicParsing -TimeoutSec 2
    if ($r.StatusCode -eq 200) { $ok = $true; break }
  } catch {}
  Write-Info 'backend not ready yet...'
  Start-Sleep -Seconds 2
}
if (-not $ok) { Write-Err 'Backend did not become ready in time. Check logs with "docker compose logs -f"'; exit 1 }
Write-Info 'Backend ready.'

if (-not $NoSeed) {
  Write-Info 'Seeding database (creates admin user)...'
  & cmd /c "$composeCmd exec backend npm run seed"
} else { Write-Info 'Skipping DB seed.' }

Write-Host "\nDone. Open the app at: http://localhost/" -ForegroundColor Green
Write-Host "Backend health: http://localhost:3000/health" -ForegroundColor Green

exit 0
