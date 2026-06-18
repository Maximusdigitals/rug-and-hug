# Rug or Hug - Asset Downloader
# Downloads official brand assets and token logos for game accuracy

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $PSScriptRoot
$Logos = Join-Path $Root "assets\logos"
$Brand = Join-Path $Root "assets\brand"
$Icons = Join-Path $Root "assets\icons"

function Download-File {
    param(
        [string]$Url,
        [string]$OutPath,
        [hashtable]$Headers = @{}
    )
    $dir = Split-Path $OutPath -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    try {
        $params = @{
            Uri = $Url
            OutFile = $OutPath
            UseBasicParsing = $true
        }
        if ($Headers.Count -gt 0) { $params.Headers = $Headers }
        Invoke-WebRequest @params
        $size = (Get-Item $OutPath).Length
        if ($size -lt 100) {
            Write-Warning "Suspiciously small: $OutPath ($size bytes)"
            return $false
        }
        Write-Host "OK  $OutPath ($size bytes)"
        return $true
    } catch {
        Write-Warning "FAIL $Url -> $OutPath : $($_.Exception.Message)"
        return $false
    }
}

Write-Host "`n=== OFFICIAL BRAND PACKS ===" -ForegroundColor Cyan

# Polymarket official brand packs
Download-File "https://polymarket-upload.s3.us-east-2.amazonaws.com/polymarket-logos.zip" (Join-Path $Brand "polymarket-logos.zip")
Download-File "https://polymarket-upload.s3.us-east-2.amazonaws.com/pm-logos-and-fonts.zip" (Join-Path $Brand "polymarket-full-brand.zip")
Download-File "https://polymarket-upload.s3.us-east-2.amazonaws.com/pm-inter.zip" (Join-Path $Brand "polymarket-inter-font.zip")

# Polymarket direct PNGs from brand page
$pmLogos = @{
    "polymarket-logo-blue.png" = "https://polymarket.com/images/brand/logo-blue.png"
    "polymarket-logo-black.png" = "https://polymarket.com/images/brand/logo-black.png"
    "polymarket-icon-blue.png" = "https://polymarket.com/images/brand/icon-blue.png"
    "polymarket-icon-white.png" = "https://polymarket.com/images/brand/icon-white.png"
    "polymarket-icon-black.png" = "https://polymarket.com/images/brand/icon-black.png"
}
foreach ($k in $pmLogos.Keys) {
    Download-File $pmLogos[$k] (Join-Path $Logos "platforms\$k")
}

Write-Host "`n=== HYPERLIQUID OFFICIAL BRAND KIT (GitBook) ===" -ForegroundColor Cyan

$hlBase = "https://hyperliquid.gitbook.io/hyperliquid-docs"
$hlFiles = @(
    "T8NeIiN5pb727AmbFfAu",
    "T0FDh3K3AlAAmMMZTwrQ",
    "fdqkV3HguYG0A47dGZSL",
    "WXEVWQzUEBzsLA9cPPF8",
    "u0i3k0bbzyOl4AvBWeF5",
    "ycNNyLuiLRKdxseGpQWb",
    "2TNqF9iYtJX18xLXdUcf"
)
foreach ($id in $hlFiles) {
    Download-File "$hlBase/files/$id" (Join-Path $Brand "hyperliquid\$id")
    Download-File "https://gitbook-x-prod.appspot.com/spaces/yUdp569E6w18GdfqlGvJ/files/$id" (Join-Path $Brand "hyperliquid\gitbook-cdn-$id")
}

Write-Host "`n=== CIRCLE / USDC OFFICIAL ===" -ForegroundColor Cyan

$circleAssets = @{
    "circle-logo.avif" = "https://cdn.prod.website-files.com/67116d0daddc92483c812e88/67116d0daddc92483c812f72_Circle%20Logo.avif"
    "solana-chain.svg" = "https://cdn.prod.website-files.com/67116d0daddc92483c812e88/67116d0daddc92483c812fd2_Solana.svg"
    "ethereum-chain.svg" = "https://cdn.prod.website-files.com/67116d0daddc92483c812e88/67116d0daddc92483c812fca_Ethereum.svg"
    "hyperevm-chain.svg" = "https://cdn.prod.website-files.com/67116d0daddc92483c812e88/68cd9561f7d0629fddae6ded_hyperEVM-black-sq.svg"
}
foreach ($k in $circleAssets.Keys) {
    Download-File $circleAssets[$k] (Join-Path $Logos "official\$k")
}

Write-Host "`n=== TOKEN LOGOS (CoinGecko CDN - high quality) ===" -ForegroundColor Cyan

# CoinGecko large PNGs - standard reference for crypto projects
$tokens = @{
    "btc.png" = "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
    "eth.png" = "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
    "sol.png" = "https://assets.coingecko.com/coins/images/4128/large/solana.png"
    "hype.png" = "https://assets.coingecko.com/coins/images/50882/large/hyperliquid.jpg"
    "zec.png" = "https://assets.coingecko.com/coins/images/486/large/circle-zcash-color.png"
    "ondo.png" = "https://assets.coingecko.com/coins/images/26580/large/ONDO.png"
    "usdc.png" = "https://assets.coingecko.com/coins/images/6319/large/usdc.png"
    "usdt.png" = "https://assets.coingecko.com/coins/images/325/large/Tether.png"
    "dai.png" = "https://assets.coingecko.com/coins/images/9956/large/Badge_Dai.png"
    "near.png" = "https://assets.coingecko.com/coins/images/10365/large/near.jpg"
    "tao.png" = "https://assets.coingecko.com/coins/images/28452/large/ARUsPeNQ_400x400.jpeg"
    "render.png" = "https://assets.coingecko.com/coins/images/11636/large/rndr.png"
    "inj.png" = "https://assets.coingecko.com/coins/images/12882/large/Secondary_Symbol.png"
    "dash.png" = "https://assets.coingecko.com/coins/images/19/large/dash-logo.png"
    "dusk.png" = "https://assets.coingecko.com/coins/images/521/large/dusk-network.png"
    "megaeth.png" = "https://assets.coingecko.com/coins/images/55058/large/megaeth.jpg"
    "eigenlayer.png" = "https://assets.coingecko.com/coins/images/37474/large/eigenlayer.png"
    "pump-fun.png" = "https://assets.coingecko.com/coins/images/36180/large/pump.png"
    "jupiter.png" = "https://assets.coingecko.com/coins/images/34188/large/jup.png"
    "raydium.png" = "https://assets.coingecko.com/coins/images/13928/large/PSigc4ie_400x400.jpg"
    "bonk.png" = "https://assets.coingecko.com/coins/images/28600/large/bonk.jpg"
    "wif.png" = "https://assets.coingecko.com/coins/images/33566/large/dogwifhat.jpg"
    "coinbase.png" = "https://assets.coingecko.com/coins/images/9958/large/Coinbase_Logo_2024.png"
    "blackrock.png" = "https://assets.coingecko.com/coins/images/52971/large/ibit.png"
}
foreach ($k in $tokens.Keys) {
    Download-File $tokens[$k] (Join-Path $Logos "tokens\$k")
}

Write-Host "`n=== SOLANA OFFICIAL BRANDING ===" -ForegroundColor Cyan

$solanaAssets = @{
    "solana-gradient-logo.svg" = "https://solana.com/src/img/branding/solanaLogoMark.svg"
    "solana-logotype.svg" = "https://solana.com/src/img/branding/solanaLogotype.svg"
}
foreach ($k in $solanaAssets.Keys) {
    Download-File $solanaAssets[$k] (Join-Path $Logos "official\$k")
}

# Solana brand page fallbacks
$solanaFallbacks = @{
    "solana-logo-black.png" = "https://cryptologos.cc/logos/solana-sol-logo.png"
    "solana-logo.png" = "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png"
}
foreach ($k in $solanaFallbacks.Keys) {
    Download-File $solanaFallbacks[$k] (Join-Path $Logos "official\$k")
}

Write-Host "`n=== BITCOIN OFFICIAL ===" -ForegroundColor Cyan

$btcAssets = @{
    "bitcoin.svg" = "https://bitcoin.design/assets/images/guide/getting-started/visual-language/bitcoin-symbol.svg"
    "bitcoin-orange.png" = "https://assets.coingecko.com/coins/images/1/standard/bitcoin.png"
}
foreach ($k in $btcAssets.Keys) {
    Download-File $btcAssets[$k] (Join-Path $Logos "official\$k")
}

Write-Host "`n=== ONDO / RWA ===" -ForegroundColor Cyan

$ondoAssets = @{
    "ondo-logo.svg" = "https://ondo.finance/logo.svg"
    "ondo-icon.png" = "https://assets.coingecko.com/coins/images/26580/standard/ONDO.png"
}
foreach ($k in $ondoAssets.Keys) {
    Download-File $ondoAssets[$k] (Join-Path $Logos "platforms\$k")
}

Write-Host "`n=== UI / GAME ICONS ===" -ForegroundColor Cyan

# Simple icons for game UI (open source style)
$uiIcons = @{
    "fear-greed.svg" = "https://alternative.me/crypto/fear-and-greed-index.png"
}
# Fear & greed is PNG not svg - fix
Download-File "https://alternative.me/crypto/fear-and-greed-index.png" (Join-Path $Icons "fear-greed-index.png")

Write-Host "`n=== EXTRACT ZIP ARCHIVES ===" -ForegroundColor Cyan

Get-ChildItem $Brand -Filter "*.zip" | ForEach-Object {
    $dest = Join-Path $Brand ($_.BaseName)
    if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Force -Path $dest | Out-Null }
    try {
        Expand-Archive -Path $_.FullName -DestinationPath $dest -Force
        Write-Host "Extracted: $($_.Name) -> $dest"
    } catch {
        Write-Warning "Extract failed: $($_.Name) - $($_.Exception.Message)"
    }
}

Write-Host "`n=== DOWNLOAD MANIFEST ===" -ForegroundColor Cyan
$manifest = Get-ChildItem -Path (Join-Path $Root "assets") -Recurse -File | Select-Object FullName, Length, LastWriteTime
$manifest | Export-Csv (Join-Path $Root "assets\manifest.csv") -NoTypeInformation
Write-Host "Manifest: assets\manifest.csv ($($manifest.Count) files)"