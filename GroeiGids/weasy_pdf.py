"""
GroeiGids — WeasyPrint PDF Generator
Konsistente lettertipes, ordentlike bladsy-oorgange
"""
import os, sys
os.environ["PATH"] = r"C:\Program Files\GTK3-Runtime Win64\bin;" + os.environ["PATH"]

from weasyprint import HTML, CSS
from pypdf import PdfWriter, PdfReader
import io

BASE   = r"C:\Users\riaan\OneDrive\Desktop\Agent\nft\GroeiGids"

# Lêers om te verwerk (verander hierdie lys as jy meer wil byvoeg)
LEERS = [
    "groeigids-voorblad.html",
    "handleiding-ec-ph-tds.html",
]
OUTPUT = os.path.join(BASE, "GroeiGids_Toets.pdf")

# Globale CSS wat WeasyPrint gebruik om uitleg te standaardiseer
GLOBALE_CSS = CSS(string="""
    @font-face {
        font-family: 'Montserrat';
        src: local('Arial');
    }
    @font-face {
        font-family: 'Inter';
        src: local('Arial');
    }

    @page {
        size: A4 portrait;
        margin: 0;
    }

    html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        font-size: 11pt !important;
        font-family: Arial, sans-serif !important;
        -weasy-color-adjust: exact;
    }

    /* Elke .page div = een A4 bladsy */
    .page, .page1, .page2 {
        width: 210mm !important;
        min-height: 297mm !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        page-break-after: always !important;
        break-after: page !important;
        position: relative !important;
        overflow: visible !important;
        background: white !important;
    }

    /* Inhoud vloei oor na volgende bladsy as dit te lank is */
    .page-body, .content {
        overflow: visible !important;
    }

    /* Voetbalk */
    .book-footer, .book-ftr {
        position: absolute !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
    }

    /* Konsistente lettertipe groottes */
    p, li, td, th, div {
        font-size: 11pt;
        line-height: 1.5;
    }
    h1 { font-size: 18pt !important; }
    h2 { font-size: 15pt !important; }
    h3 { font-size: 13pt !important; }
    h4 { font-size: 12pt !important; }

    /* Omslag */
    .cover-bg, .cover {
        min-height: 297mm !important;
        overflow: visible !important;
    }

    /* Prente pas in breedte */
    img {
        max-width: 100% !important;
        height: auto !important;
    }
""")

def leer_na_pdf(html_leer):
    html_pad = os.path.join(BASE, html_leer)
    url = "file:///" + html_pad.replace("\\", "/")
    print(f"  Verwerk: {html_leer} ...", end="", flush=True)
    try:
        doc = HTML(filename=html_pad)
        pdf_bytes = doc.write_pdf(
            stylesheets=[GLOBALE_CSS],
            presentational_hints=True,
        )
        print(f" ✓ ({len(pdf_bytes)//1024} KB)")
        return pdf_bytes
    except Exception as e:
        print(f" ✗ FOUT: {e}")
        return None

print("\n" + "="*50)
print("  GroeiGids — WeasyPrint PDF Generator")
print("="*50 + "\n")

writer = PdfWriter()
totaal = 0

for leer in LEERS:
    pdf_bytes = leer_na_pdf(leer)
    if pdf_bytes:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        bl = len(reader.pages)
        totaal += bl
        for page in reader.pages:
            writer.add_page(page)

with open(OUTPUT, "wb") as f:
    writer.write(f)

grootte = os.path.getsize(OUTPUT) // 1024
print(f"\nKLAAR! {totaal} bladsye, {grootte} KB")
print(f"Leer: {OUTPUT}\n")
