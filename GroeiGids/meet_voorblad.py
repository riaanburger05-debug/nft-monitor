import os, time
from playwright.sync_api import sync_playwright

BASE = r"C:\Users\riaan\OneDrive\Desktop\Agent\nft\GroeiGids"
url = "file:///" + os.path.join(BASE, "groeigids-voorblad.html").replace("\\", "/")

with sync_playwright() as p:
    browser = p.chromium.launch()
    pg = browser.new_page(viewport={"width": 794, "height": 1123})
    pg.goto(url, wait_until="networkidle", timeout=60000)
    time.sleep(2)
    elemente = pg.query_selector_all(".page, .page1, .page2")
    print(f"\nVoorblad ({len(elemente)} bladsye):\n")
    for i, el in enumerate(elemente):
        h = int(el.bounding_box()["height"])
        verskil = 1123 - h
        if h > 1130:
            status = f"  ← +{h-1123}px TE LANK"
        elif verskil > 80:
            status = f"  ← {verskil}px LEEG"
        else:
            status = "  ✓ Pas"
        print(f"  Bladsy {i+1}: {h}px{status}")
    browser.close()
