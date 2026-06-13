$ErrorActionPreference = "Stop"

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$mainFile = Join-Path $projectDir "tenk-monitor-ux.html"
$coachImage = Join-Path $projectDir "Images\nft-coach-reference.png"
$port = 8080

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Green
Write-Host " GroeiGids NFT Coach - Nuwe Laptop Begin"
Write-Host "=====================================================" -ForegroundColor Green
Write-Host ""

$missing = @()
if (-not (Test-Path -LiteralPath $mainFile)) { $missing += "tenk-monitor-ux.html" }
if (-not (Test-Path -LiteralPath $coachImage)) { $missing += "Images\nft-coach-reference.png" }

if ($missing.Count -gt 0) {
    Write-Host "Hierdie belangrike leers ontbreek:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "Wag vir OneDrive om klaar te sinkroniseer en probeer weer."
    exit 1
}

$python = $null
$pythonArgs = @()

$pyLauncher = Get-Command py.exe -ErrorAction SilentlyContinue
if ($pyLauncher) {
    $python = $pyLauncher.Source
    $pythonArgs = @("-3")
}

if (-not $python) {
    $pythonCommand = Get-Command python.exe -ErrorAction SilentlyContinue
    if ($pythonCommand) {
        $python = $pythonCommand.Source
    }
}

if (-not $python) {
    $codexPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
    if (Test-Path -LiteralPath $codexPython) {
        $python = $codexPython
    }
}

if (-not $python) {
    Write-Host "Python is nie gevind nie." -ForegroundColor Yellow
    Write-Host "Installeer Python vanaf https://www.python.org/downloads/"
    Write-Host "Merk 'Add Python to PATH' tydens installasie."
    exit 1
}

$ip = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
        $_.IPAddress -notlike "127.*" -and
        $_.IPAddress -notlike "169.254*" -and
        $_.InterfaceAlias -notmatch "Loopback|Bluetooth|Virtual|WSL"
    } |
    Sort-Object InterfaceMetric |
    Select-Object -First 1 -ExpandProperty IPAddress

if (-not $ip) {
    $ip = "JOU-LAPTOP-IP"
}

$localUrl = "http://localhost:$port/tenk-monitor-ux.html"
$phoneUrl = "http://${ip}:$port/tenk-monitor-ux.html"

Write-Host "Projek: $projectDir"
Write-Host ""
Write-Host "Op hierdie laptop:" -ForegroundColor Cyan
Write-Host "  $localUrl"
Write-Host ""
Write-Host "Op jou foon, op dieselfde Wi-Fi:" -ForegroundColor Cyan
Write-Host "  $phoneUrl"
Write-Host ""
Write-Host "Hou hierdie venster oop. Druk Ctrl+C om die bediener te stop."
Write-Host "As Windows Firewall vra, laat toegang op Private networks toe."
Write-Host ""

Set-Location -LiteralPath $projectDir
& $python @pythonArgs -m http.server $port --bind 0.0.0.0
