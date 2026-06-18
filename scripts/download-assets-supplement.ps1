# Supplemental downloads for failed assets + brand colors reference

$Root = Split-Path -Parent $PSScriptRoot
$Logos = Join-Path $Root "assets\logos"
$Brand = Join-Path $Root "assets\brand"
$Docs = Join-Path $Root "docs"

function Download-File {
    param([string]$Url, [string]$OutPath)
    $dir = Split-Path $OutPath -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    try {
        Invoke-WebRequest -Uri $Url -OutFile $OutPath -UseBasicParsing -Headers @{
            "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            "Accept" = "image/*,*/*"
        }
        $size = (Get-Item $OutPath).Length
        Write-Host "OK  $OutPath ($size bytes)"
        return $true
    } catch {
        Write-Warning "FAIL $Url : $($_.Exception.Message)"
        return $false
    }
}

Write-Host "=== HYPERLIQUID (fallback sources) ===" -ForegroundColor Cyan
Download-File "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Hyperliquid_Logo.png/320px-Hyperliquid_Logo.png" (Join-Path $Logos "platforms\hyperliquid-logo.png")
Download-File "https://app.hyperliquid.xyz/coins/HYPE.svg" (Join-Path $Logos "platforms\hyperliquid-hype.svg")
Download-File "https://app.hyperliquid.xyz/favicon.ico" (Join-Path $Brand "hyperliquid-favicon.ico")

Write-Host "=== FAILED COINGECKO (retry with user-agent) ===" -ForegroundColor Cyan
$retry = @{
    "coinbase.png" = "https://assets.coingecko.com/coins/images/9958/large/Coinbase_Logo_2024.png"
    "blackrock-ibit.png" = "https://assets.coingecko.com/coins/images/52971/large/ibit.png"
    "megaeth.png" = "https://assets.coingecko.com/coins/images/55058/large/megaeth.jpg"
    "dusk.png" = "https://assets.coingecko.com/coins/images/521/large/dusk-network.png"
    "pump-fun.png" = "https://assets.coingecko.com/coins/images/36180/large/pump.png"
    "eigenlayer.png" = "https://assets.coingecko.com/coins/images/37474/large/eigenlayer.png"
}
foreach ($k in $retry.Keys) {
    Download-File $retry[$k] (Join-Path $Logos "tokens\$k")
}

Write-Host "=== MORE ECOSYSTEM LOGOS ===" -ForegroundColor Cyan
$more = @{
    "polymarket-token.png" = "https://assets.coingecko.com/coins/images/38089/large/polymarket.png"
    "zcash-official.png" = "https://z.cash/img/zcash-logo.png"
    "dtcc.png" = "https://www.dtcc.com/-/media/Images/DTCC/Logos/dtcc-logo.png"
    "coinbase-official.svg" = "https://www.coinbase.com/assets/coinbase-logo-1-1.svg"
    "x-twitter-logo.svg" = "https://upload.wikimedia.org/wikipedia/commons/5/5a/X_icon_2.svg"
    "pump-fun-site.png" = "https://pump.fun/logo.png"
    "jito.png" = "https://assets.coingecko.com/coins/images/33149/large/jito.png"
    "marinade.png" = "https://assets.coingecko.com/coins/images/23480/large/marinade.png"
    "venice-vvv.png" = "https://assets.coingecko.com/coins/images/54062/large/venice.jpg"
    "space-and-time.png" = "https://assets.coingecko.com/coins/images/35424/large/space-and-time.jpg"
}
foreach ($k in $more.Keys) {
    Download-File $more[$k] (Join-Path $Logos "tokens\$k")
}

Write-Host "=== SOLANA OFFICIAL (GitHub mirror) ===" -ForegroundColor Cyan
Download-File "https://raw.githubusercontent.com/solana-labs/branding/master/Solana%20Logomark%20-%20Color.svg" (Join-Path $Logos "official\solana-logomark-color.svg")
Download-File "https://raw.githubusercontent.com/solana-labs/branding/master/Solana%20Lockup%20-%20Color.svg" (Join-Path $Logos "official\solana-lockup-color.svg")

Write-Host "=== USDC OFFICIAL ===" -ForegroundColor Cyan
Download-File "https://www.usdc.com/logo/usdc-logo-color.svg" (Join-Path $Logos "official\usdc-logo-color.svg")
Download-File "https://www.circle.com/hubfs/usdc/USDC_Logo.svg" (Join-Path $Logos "official\usdc-circle.svg")

Write-Host "=== ONDO ===" -ForegroundColor Cyan
Download-File "https://assets.coingecko.com/coins/images/26580/large/ONDO.png" (Join-Path $Logos "platforms\ondo-large.png")

# Brand colors JSON for game UI accuracy
$brandColors = @{
    game = "Rug or Hug"
    updated = (Get-Date -Format "yyyy-MM-dd")
    sources = @(
        "https://hyperliquid.gitbook.io/hyperliquid-docs/brand-kit",
        "https://polymarket.com/brand",
        "https://www.circle.com/en/usdc",
        "https://solana.com/branding",
        "https://bitcoin.design"
    )
    brands = @{
        bitcoin = @{ primary = "#F7931A"; secondary = "#FFFFFF" }
        solana = @{ primary = "#9945FF"; secondary = "#14F195"; gradient = "linear-gradient(90deg, #9945FF, #14F195)" }
        hyperliquid = @{ primary = "#00D4AA"; secondary = "#0A0A0A"; note = "Teal/green accent on dark UI" }
        ethereum = @{ primary = "#627EEA"; secondary = "#FFFFFF" }
        usdc = @{ primary = "#2775CA"; secondary = "#FFFFFF" }
        polymarket = @{ primary = "#2E5CFF"; secondary = "#000000"; white = "#FFFFFF" }
        ondo = @{ primary = "#1A1A2E"; secondary = "#4ECDC4"; note = "RWA fintech palette" }
        zcash = @{ primary = "#F4B728"; secondary = "#000000" }
        fearGreed = @{ fear = "#EA3943"; neutral = "#F3D42F"; greed = "#16C784" }
        ctTerminal = @{ bg = "#0D1117"; panel = "#161B22"; green = "#3FB950"; red = "#F85149"; amber = "#D29922" }
    }
    narrativeMap = @{
        day01 = @{ level = "Gas Fee Seance"; logos = @("eth.png", "btc.png") }
        day02 = @{ level = "Solana Trench Foot"; logos = @("sol.png", "pump-fun.png", "bonk.png", "wif.png", "jupiter.png") }
        day03 = @{ level = "BTC Range Prison"; logos = @("btc.png", "blackrock-ibit.png") }
        day04 = @{ level = "Fear & Greed Exorcism"; logos = @("fear-greed-index.png") }
        day05 = @{ level = "Meme Coin Naming Committee"; logos = @("bonk.png", "wif.png") }
        day06 = @{ level = "ETF Funeral Director"; logos = @("btc.png", "blackrock-ibit.png", "coinbase.png") }
        day07 = @{ level = "Hyperliquid Baptism"; logos = @("hype.png", "hyperliquid-logo.png", "hyperevm-chain.svg") }
        day08 = @{ level = "HIP-3 Possession"; logos = @("hype.png", "usdc.png") }
        day09 = @{ level = "Tokenized Grandma"; logos = @("ondo.png", "ondo-icon.png") }
        day10 = @{ level = "Stablecoin Trust Fall"; logos = @("usdc.png", "usdt.png", "dai.png", "circle-logo.avif") }
        day11 = @{ level = "ZEC Identity Crisis"; logos = @("zec.png", "dash.png", "dusk.png") }
        day12 = @{ level = "AI Agent Union Strike"; logos = @("venice-vvv.png", "tao.png", "near.png", "render.png") }
        day13 = @{ level = "Polymarket Wedding"; logos = @("polymarket-logo-blue.png", "polymarket-icon-blue.png") }
        day14 = @{ level = "Proof of Vibes"; logos = @("sol.png", "hype.png", "ondo.png") }
        day15 = @{ level = "Pre-IPO Astronaut"; logos = @("hype.png") }
        day16 = @{ level = "Airdrop Trauma Unit"; logos = @("megaeth.png", "eigenlayer.png") }
        day17 = @{ level = "KOL Ventriloquist"; logos = @("x-twitter-logo.svg") }
        day18 = @{ level = "Narrative Whiplash"; logos = @("sol.png", "hype.png", "zec.png", "ondo.png", "venice-vvv.png") }
        day19 = @{ level = "Zach Thread Boss Fight"; logos = @("x-twitter-logo.svg") }
        day20 = @{ level = "Touch Grass"; logos = @("x-twitter-logo.svg") }
    }
}

$brandColors | ConvertTo-Json -Depth 6 | Set-Content (Join-Path $Docs "brand-colors.json") -Encoding UTF8
Write-Host "Wrote docs/brand-colors.json"

Get-ChildItem -Path (Join-Path $Root "assets") -Recurse -File | Export-Csv (Join-Path $Root "assets\manifest.csv") -NoTypeInformation
Write-Host "Updated manifest.csv"