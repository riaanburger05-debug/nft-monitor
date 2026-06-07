import os, time
from playwright.sync_api import sync_playwright

BASE = r"C:\Users\riaan\OneDrive\Desktop\Agent\nft\GroeiGids"

leer = "handleiding-ec-ph-tds.html"
url = "file:///" + os.path.join(BASE, leer).replace("\\", "/")

with sync_playwright() as p:
    browser = p.chromium.launch()
    pg = browser.new_page(viewport={"width": 794, "height": 1123})
    pg.goto(url, wait_until="networkidle", timeout=60000)
    time.sleep(2)
    elemente = pg.query_selector_all(".page, .page1, .page2")
    print(f"\nH1 bladsy hoogtes:\n")
    for i, el in enumerate(elemente):
        bbox = el.bounding_box()
        h = int(bbox['height'])
        verskil = 1123 - h
        if verskil > 20:
            status = f"  ← {verskil}px LEEG"
        elif h > 1130:
            status = f"  ← +{h-1123}px TE LANK"
        else:
            status = "  ✓ Pas"
        print(f"  Bladsy {i+1}: {h}px{status}")
    browser.close()
