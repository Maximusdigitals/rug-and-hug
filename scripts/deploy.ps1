# Rug or Hug — one-shot deploy to GitHub + Cloudflare Pages
$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

Write-Host "`n=== Rug or Hug Deploy ===" -ForegroundColor Cyan

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "Installing GitHub CLI..." -ForegroundColor Yellow
  winget install --id GitHub.cli -e --accept-source-agreements --accept-package-agreements
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

$auth = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "`nLog into GitHub in the browser window..." -ForegroundColor Yellow
  gh auth login --hostname github.com --git-protocol https --web
}

Write-Host "`nCreating public repo and pushing..." -ForegroundColor Green
gh repo create rug-or-hug --public --source . --remote origin --push --description "Rug or Hug — mobile crypto mini-game"

Write-Host "`nDone! Next:" -ForegroundColor Green
Write-Host "1. Open https://dash.cloudflare.com" 
Write-Host "2. Workers & Pages -> Create -> Pages -> Connect to Git"
Write-Host "3. Pick rug-or-hug | Build command: (empty) | Output: /"
Write-Host "4. Your game will be at https://rug-or-hug.pages.dev`n"