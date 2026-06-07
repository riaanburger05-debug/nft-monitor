import os, time
from playwright.sync_api import sync_playwright

BASE = r"C:\Users\riaan\OneDrive\Desktop\Agent\nft\GroeiGids"
url = "file:///" + os.path.join(BASE, "handleiding-gewasse.html").replace("\\", "/")

with sync_playwright() as p:
    browser = p.chromium.launch()
    pg = browser.new_page(viewport={"width": 794, "height": 1123})
    pg.goto(url, wait_until="networkidle", timeout=60000)
    time.sleep(2)
    kids = pg.evaluate("""() => {
        const pb = document.querySelectorAll('.page')[5].querySelector('.page-body');
        return Array.from(pb.children).map((c,i) => ({
            i, tag: c.tagName, cls: c.className.substring(0,35),
            txt: c.innerText.substring(0,40).replace(/\\n/g,' '),
            h: c.offsetHeight
        }));
    }""")
    tot = 0
    for k in kids:
        tot += k['h']
        print(f"  [{k['i']}] {k['tag']:4} {k['h']:4}px  {k['txt']}")
    print(f"\n  Totaal inhoud: {tot}px  (page-body=1217px)")
    browser.close()
