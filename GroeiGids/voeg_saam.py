"""
GroeiGids — Voeg PDF lêers saam
Stoor elke hoofstuk eers as PDF in Chrome (Ctrl+P → Save as PDF)
Dan voer hierdie script uit om alles saam te voeg
"""
import os, glob
from pypdf import PdfWriter, PdfReader

BASE = r"C:\Users\riaan\OneDrive\Desktop\Agent\nft\GroeiGids"

# Soek alle PDF lêers in volgorde (00- tot 09-)
pdf_leers = sorted(glob.glob(os.path.join(BASE, "0*.pdf")))

if not pdf_leers:
    print("GEEN PDFs gevind nie. Stoor eers elke hoofstuk as PDF.")
    print("Soek na lêers wat begin met 00-, 01-, 02- ens.")
else:
    print(f"\n{len(pdf_leers)} PDF lêers gevind:\n")
    writer = PdfWriter()
    totaal = 0

    for pdf in pdf_leers:
        reader = PdfReader(pdf)
        bl = len(reader.pages)
        totaal += bl
        for page in reader.pages:
            writer.add_page(page)
        print(f"  + {os.path.basename(pdf)} ({bl} bladsye)")

    output = os.path.join(BASE, "GroeiGids_Volledig.pdf")
    with open(output, "wb") as f:
        writer.write(f)

    grootte = os.path.getsize(output) // (1024*1024)
    print(f"\nKLAAR! {totaal} bladsye, ~{grootte} MB")
    print(f"Gestoor: {output}\n")
