import os, time
from playwright.sync_api import sync_playwright

BASE = r"C:\Users\riaan\OneDrive\Desktop\Agent\nft\GroeiGids"
LEERS = [
    "handleiding-ec-ph-tds.html",
    "handleiding-opstelling.html",
    "handleiding-gewasse.html",
    "handleiding-dos-donts.html",
    "handleiding-log.html",
    "handleiding-probleme.html",
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    for leer in LEERS:
        url = "file:///" + os.path.join(BASE, leer).replace("\\", "/")
        pg = browser.new_page(viewport={"width": 794, "height": 1123})
        pg.goto(url, wait_until="networkidle", timeout=60000)
        time.sleep(2)
        elemente = pg.query_selector_all(".page, .page1, .page2")
        for i, el in enumerate(elemente):
            bbox = el.bounding_box()
            h = int(bbox['height'])
            status = "TE LANK!" if h > 1130 else "OK"
            if h > 1130:
                print(f"  {status}: {leer} Bladsy {i+1} = {h}px (+{h-1123}px)")
        pg.close()
    browser.close()
print("Klaar")
