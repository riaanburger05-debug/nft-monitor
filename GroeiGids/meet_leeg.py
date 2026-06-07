import os, time
from playwright.sync_api import sync_playwright

BASE = r"C:\Users\riaan\OneDrive\Desktop\Agent\nft\GroeiGids"
LEERS = [
    ("handleiding-ec-ph-tds.html", "H1"),
    ("handleiding-opstelling.html", "H2"),
    ("handleiding-gewasse.html", "H3"),
    ("handleiding-dos-donts.html", "H4"),
    ("handleiding-probleme.html", "H6"),
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    print("\nBladsye met leë spasie (>80px):\n")
    for leer, naam in LEERS:
        url = "file:///" + os.path.join(BASE, leer).replace("\\", "/")
        pg = browser.new_page(viewport={"width": 794, "height": 1123})
        pg.goto(url, wait_until="networkidle", timeout=60000)
        time.sleep(2)
        elemente = pg.query_selector_all(".page, .page1, .page2")
        for i, el in enumerate(elemente):
            h = int(el.bounding_box()["height"])
            leeg = 1123 - h
            if leeg > 80:
                print(f"  {naam} Bladsy {i+1}: {h}px — {leeg}px LEEG")
        pg.close()
    browser.close()
    print("\nKlaar")
