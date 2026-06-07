"""
GroeiGids PDF Generator — Finale Weergawe
Elke bladsy word as skermskoot geneem op sy WERKLIKE grootte
Dan op 'n wit A4-agtergrond geplak sonder krimp of rek
"""
import os, io, time
from playwright.sync_api import sync_playwright
from PIL import Image

BASE   = r"C:\Users\riaan\OneDrive\Desktop\Agent\nft\GroeiGids"
OUTPUT = os.path.join(BASE, "GroeiGids_Volledig.pdf")

# A4 by 2x skaal = 1588 x 2245 pixels (skerp maar nie te groot)
SKAAL   = 2
A4_W    = 794 * SKAAL   # 1588px
A4_H    = 1123 * SKAAL  # 2246px

LEERS = [
    "groeigids-voorblad.html",
    "handleiding-ec-ph-tds.html",
    "handleiding-opstelling.html",
    "handleiding-gewasse.html",
    "handleiding-dos-donts.html",
    "handleiding-log.html",
    "handleiding-probleme.html",
    "handleiding-aanhangsels.html",
    "handleiding-toetse.html",
    "handleiding-memorandum.html",
]

def stel_css_in(pg):
    """Verwyder skadu, marges — versteek voetbalkies sodat hulle nie halfpad verskyn nie"""
    pg.add_style_tag(content="""
        html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
        .page, .page1, .page2 {
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
        }
        /* Versteek voetbalkies — hulle verskyn halfpad op bladsye as inhoud te lank is */
        .book-footer, .book-ftr {
            display: none !important;
        }
        /* Gee inhoud genoeg onderste spasie sodat dit nie afgesny lyk nie */
        .page-body, .content {
            padding-bottom: 20px !important;
        }
    """)

def skermskoot_na_a4(skermskoot_bytes, a4_w, a4_h):
    """Plaas skermskoot op 'n wit A4-agtergrond — GEEN krimp of rek"""
    img = Image.open(io.BytesIO(skermskoot_bytes)).convert("RGB")
    w, h = img.size

    # As bladsy korter is as A4: plak bo-aan op wit agtergrond
    # As bladsy langer is as A4: verdeel oor meerdere A4-bladsye
    bladsye = []
    y_pos = 0
    while y_pos < h:
        sny_h = min(a4_h, h - y_pos)
        stuk = img.crop((0, y_pos, w, y_pos + sny_h))
        y_pos += a4_h

        # Plaas op wit A4 agtergrond
        agtergrond = Image.new("RGB", (a4_w, a4_h), (255, 255, 255))
        # Sentreer horisontaal as nodig
        x_offset = max(0, (a4_w - w) // 2)
        agtergrond.paste(stuk, (x_offset, 0))
        bladsye.append(agtergrond)

    return bladsye

def leer_na_beelde(browser, leer):
    url = "file:///" + os.path.join(BASE, leer).replace("\\", "/")
    alle_beelde = []

    pg = browser.new_page(
        viewport={"width": 794, "height": 1123},
        device_scale_factor=SKAAL,
    )
    try:
        pg.goto(url, wait_until="networkidle", timeout=60000)
        time.sleep(3)  # Wag vir Google Fonts
        stel_css_in(pg)
        time.sleep(0.5)

        # Kry alle .page divs
        elemente = pg.query_selector_all(".page, .page1, .page2")
        print(f"  {leer}: {len(elemente)} bladsye", end="", flush=True)

        for el in elemente:
            try:
                skermskoot = el.screenshot(type="png")
                a4_bladsye = skermskoot_na_a4(skermskoot, A4_W, A4_H)
                alle_beelde.extend(a4_bladsye)
            except Exception as e:
                print(f"\n    Bladsy fout: {e}", end="")

        print(f" → {len(alle_beelde)} A4-bladsye ✓")

    except Exception as e:
        print(f" FOUT: {e}")
    finally:
        pg.close()

    return alle_beelde

print("\n" + "="*56)
print("  GroeiGids PDF Generator — Finale Weergawe")
print("="*56 + "\n")

alle_bladsye = []

with sync_playwright() as p:
    browser = p.chromium.launch()
    for leer in LEERS:
        beelde = leer_na_beelde(browser, leer)
        alle_bladsye.extend(beelde)
    browser.close()

print(f"\nStoor {len(alle_bladsye)} bladsye as PDF ...")

if alle_bladsye:
    eerste = alle_bladsye[0]
    alle_bladsye[0].save(
        OUTPUT,
        format="PDF",
        save_all=True,
        append_images=alle_bladsye[1:],
        resolution=192  # 2x = 192 DPI — goeie drukgehalte
    )
    mb = os.path.getsize(OUTPUT) // (1024 * 1024)
    print(f"\nKLAAR!")
    print(f"  Bladsye:  {len(alle_bladsye)}")
    print(f"  Grootte:  ~{mb} MB")
    print(f"  Leer:     {OUTPUT}\n")
