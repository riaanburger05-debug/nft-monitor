# GroeiGids Kombineer Script
# Voer uit in PowerShell: .\kombineer.ps1
# Dit kombineer alle hoofstukke in een drukbare HTML-lêer

$base = "C:\Users\riaan\OneDrive\Desktop\Agent\nft\GroeiGids\"

$files = @(
    "groeigids-voorblad.html",
    "handleiding-ec-ph-tds.html",
    "handleiding-opstelling.html",
    "handleiding-gewasse.html",
    "handleiding-dos-donts.html",
    "handleiding-log.html",
    "handleiding-probleme.html",
    "handleiding-aanhangsels.html",
    "handleiding-toetse.html",
    "handleiding-memorandum.html"
)

$allStyles = [System.Text.StringBuilder]::new()
$allBodies = [System.Text.StringBuilder]::new()

foreach ($fname in $files) {
    $content = Get-Content "$base$fname" -Raw -Encoding UTF8

    # Extract style blocks
    $styleMatches = [regex]::Matches($content, '(?s)<style[^>]*>(.*?)</style>')
    foreach ($m in $styleMatches) {
        $null = $allStyles.AppendLine("/* == $fname == */")
        $null = $allStyles.AppendLine($m.Groups[1].Value.Trim())
        $null = $allStyles.AppendLine()
    }

    # Extract body content
    $bodyMatch = [regex]::Match($content, '(?s)<body[^>]*>(.*?)</body>')
    if ($bodyMatch.Success) {
        $null = $allBodies.AppendLine("`n<!-- == $($fname.ToUpper()) == -->")
        $null = $allBodies.AppendLine($bodyMatch.Groups[1].Value.Trim())
    }
}

$combined = @"
<!DOCTYPE html>
<html lang="af">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GroeiGids — NFT A-Raam Stelsel — Volledige Gids</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #1a1a1a; padding: 20px 0; }

  /* ═══ BLADSY UITLEG ═══ */
  .page {
    width: 794px !important;
    max-width: 794px !important;
    min-height: 1123px !important;
    height: auto !important;
    overflow: visible !important;
    margin: 0 auto 24px auto !important;
    display: flex !important;
    flex-direction: column !important;
    position: relative !important;
  }

  /* ═══ VOETBALKIE — VERANDER VAN ABSOLUTE NA RELATIEF ═══ */
  /* Voetbalkie bly ONDER die inhoud, nie vasgesit op 1123px nie */
  .book-footer, .book-ftr {
    position: relative !important;
    bottom: auto !important;
    left: auto !important;
    right: auto !important;
    width: 100% !important;
    margin-top: auto !important;
    flex-shrink: 0 !important;
  }

  /* ═══ INHOUDSAREA GROEI OM RUIMTE TE VUL ═══ */
  .page-body, .content {
    flex: 1 !important;
    padding-bottom: 20px !important;
  }

  /* ═══ TEKS EN TABELLE ═══ */
  * { word-wrap: break-word; overflow-wrap: break-word; box-sizing: border-box; }
  table { table-layout: auto; width: 100% !important; max-width: 100% !important; }
  td, th { word-break: break-word; }
  img { max-width: 100% !important; height: auto !important; }
  svg { max-width: 100% !important; overflow: visible !important; }

  /* ═══ OMSLAG KLEURE ═══ */
  .cover-bg { background: linear-gradient(160deg,#f3f7ff 0%,#f1f8e9 60%,#ffffff 100%) !important; color: #263238 !important; min-height: 1123px !important; }
  .cover-header-bar { background: rgba(27,94,32,.08) !important; }

  /* ═══ DRUK CSS ═══ */
  @media print {
    @page { size: A4 portrait; margin: 0; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { background: #fff !important; padding: 0 !important; }
    .page {
      box-shadow: none !important;
      margin: 0 !important;
      page-break-after: always !important;
      break-after: page !important;
      width: 210mm !important;
      max-width: 210mm !important;
      min-height: 297mm !important;
      overflow: visible !important;
    }
    .print-btn-bar, .stoor-btn { display: none !important; }
  }
</style>
<style>
$($allStyles.ToString())
</style>
</head>
<body>
$($allBodies.ToString())
</body>
</html>
"@

$output = "$base\groeigids-volledig-nuut.html"
[System.IO.File]::WriteAllText($output, $combined, [System.Text.Encoding]::UTF8)

$size = [math]::Round((Get-Item $output).Length / 1KB, 1)
Write-Host "Klaar! Lêer: $output ($size KB)" -ForegroundColor Green
Write-Host "Open nou in Chrome en gebruik Ctrl+P > Save as PDF" -ForegroundColor Cyan
