# Tenkmonitor: AI-oorhandiging

**Laas opgedateer:** 13 Junie 2026  
**Primêre werklêer:** `nft/tenk-monitor-ux.html`  
**Taal van die toepassing en kommunikasie:** Afrikaans, tensy Riaan anders vra

## 1. Doel van die toepassing

Die Tenkmonitor is 'n praktiese NFT-hidroponika Coach vir Riaan. Dit moet nie net
lesings stoor nie; dit moet met een oogopslag wys:

- hoe elke tenk vaar;
- watter tenk eerste aandag nodig het;
- presies wat verkeerd is;
- wat die gebruiker volgende moet doen;
- waar om verder in die data in te boor;
- hoe groei, oes, verkope en koste met mekaar verband hou.

Die toepassing is tans 'n groot, selfstandige HTML-prototipe met ingeboude CSS en
JavaScript. Dit word direk as 'n plaaslike lêer oopgemaak:

`file:///C:/Users/riaan/OneDrive/Desktop/Agent/nft/tenk-monitor-ux.html`

## 2. Belangrike produkbesluite

Hierdie besluite is saam met Riaan geneem. Moenie dit sonder bespreking omkeer nie.

1. **Die Coach se fokus kom eerste.** Die daaglikse plan is sekondêr.
2. **Alle groeiende tenks moet as aktief beskou word.** 'n Tenk is nie “af” bloot
   omdat dit nie tans gekliek is nie.
3. **Die stelseloorsig moet die hele prentjie wys.** Probleme en diagnoses moet
   langs elke tenk sigbaar wees en gebruikers moet daarna kan inboor.
4. **Elke tenk het sy eie gesondheidspunt.** Die swakste tenk se punt en diagnose
   kry prominensie.
5. **Gesondheidspunte moet verduidelikbaar wees.** Die gebruiker kan by elke tenk
   oopmaak hoe sy punt bereken is.
6. **Regstellings moet aandag trek, maar nie die hele blad oorheers nie.**
7. **Wanneer “Regstel” gekies word**, moet die probleemtenk duidelik uitgelig word.
8. **Klik op 'n probleem** moet die relevante geskiedenis wys, met 'n duidelike
   terugroete na die tenk se regstelling.
9. **Alle probleme van 'n tenk moet gewys word**, nie net die eerste probleem nie.
10. **'n Risiko is nie outomaties 'n probleem nie.** Byvoorbeeld: Pythium-risiko
    moet nie rooi wees indien die waardes nie werklik 'n probleem aandui nie.
11. **Die Coach-wenk moet dinamies wees**, nie elke dag dieselfde nie.
12. **Coach-gereedskap moet volgens werklike probleme aanbeveel word.**
13. **Oes en verkope is verskillende rekords.** Produksie en inkomste moet apart
    aangeteken en vertoon word.
14. **Leer moet prakties wees.** Formele toetse is uitgestel en kan later deel van
    die aparte leerdermodule word.
15. **Die koppelvlak moet maklik leesbaar wees.** Liggroen of liggrys teks op wit
    agtergronde is nie aanvaarbaar nie.

## 3. Huidige tegniese struktuur

### Hooflêers

| Lêer | Rol |
|---|---|
| `nft/tenk-monitor-ux.html` | Aktiewe UX-prototipe waaraan tans gewerk word |
| `nft/tenk-monitor.html` | Ouer/ander monitorweergawe; moenie outomaties sinkroniseer nie |
| `nft/tenk-monitor-leerder.html` | Aparte leerdermodule; toekomstige toetse hoort hier |
| `nft/Images/nft-coach-reference.png` | Man-in-die-hoed Coach-prent |
| `nft/bemesting.md` | NFT-bemestingskonteks, maar baie waardes is nog `Onbekend` |
| `nft/monitering.md` | NFT-moniteringskonteks, maar baie waardes is nog `Onbekend` |

### Databerging en sinkronisering

- Plaaslike sleutel: `localStorage['nft_tenk_data']`
- Koste het ook 'n aparte sleutel: `localStorage['nft_koste']`
- Taal: `localStorage['groeiwys_lang']`
- Geldeenheid: `localStorage['groeiwys_geld']`
- Firebase Realtime Database:
  `https://nft-monitor-a5c0f-default-rtdb.firebaseio.com/tenk.json`
- `loadDataRemote()` vergelyk plaaslike en Firebase `_ts`-tydstempels.
- `saveData(d)` stoor plaaslik en probeer daarna die volledige data na Firebase stuur.

**Belangrike risiko:** Firebase is tans direk uit kliëntkode toeganklik. Hersien
sekuriteitsreëls voordat die toepassing wyd gebruik of gepubliseer word.

### Vereenvoudigde tenk-datastruktuur

```js
{
  _ts: 123456789,
  t1: {
    active: true,
    crop: "slaai",
    plantDate: "2026-06-01",
    aantalPlante: 20,
    tenkVolume: 100,
    readings: [{
      date: "2026-06-13",
      session: "Nm",
      seisoen: "...",
      ec: 1.8,
      ph: 6.2,
      tds: 900,
      temp: 20,
      tempLug: 24,
      vloei: 1.5,
      orp: 250,
      kwaliteitWaarskuwings: []
    }],
    fotos: {},
    oesrekords: [],
    verkope: []
  }
}
```

## 4. Wat reeds geïmplementeer is

### Dashboard en Coach

- Dinamiese begroeting: goeiemôre, goeiemiddag of goeienaand volgens tyd.
- Die klein robot-ikone is vervang met die man-in-die-hoed Coach-prent.
- Die Coach-paneel is vereenvoudig sodat die prent nie oor teks lê nie.
- “Coach” as nuttelose navigasieknoppie is verwyder/herwerk.
- “Coach-gereedskap” word op rekenaar gewys; “Meer” word op kleiner skerms gebruik.
- Die stelseloorsig lys alle groeiende tenks, swakste eerste.
- Diagnose en bevindinge is altyd in die stelseloorsig sigbaar.
- Die swakste tenk se naam, gesondheidspunt en diagnose word prominent gewys.
- Gewasvordering wys alle groeiende tenks, nie net die gekose tenk nie.
- Die Coach-wenk verander volgens die belangrikste probleem of volgens die dag.
- Die Coach-plan word uit werklike tenkdata gebou deur `bouCoachPlan()`.
- Gepaste gereedskap word aanbeveel deur `bouCoachGereedskap()`.

### Gesondheid per tenk

Funksie: `berekenTenkGesondheid(tankNo, td)`

Die punt begin by 100 en kan tans punte verloor vir:

- waardes buite die gewas se teikenreeks;
- ontbrekende ORP;
- ontbrekende vloei;
- ou lesings;
- moontlike meetfoute;
- dieselfde kernwaarde wat drie lesings agtereenvolgens buite teiken is.

Elke tenk in **Gesondheid per tenk** kan oopgemaak word om sy eie aftrekkings te
wys. Die swakste tenk se hoofmeter het ook 'n “Hoe is die punt bereken?”-afdeling.

### Lesings en data-gehalte

- Alle probleme van die tenk word binne die tenkkaart gewys.
- Klikbare probleme open die relevante parameter se geskiedenis.
- `kontroleerLesingKwaliteit(lesing, vorige)` waarsku voor stoor wanneer:
  - 'n waarde onwaarskynlik lyk;
  - EC en TDS se verhouding vreemd lyk;
  - EC meer as 50% verander;
  - pH meer as 1.5 verander;
  - watertemperatuur meer as 8 °C verander.
- Die gebruiker kan steeds doelbewus die lesing stoor.
- Verdagte lesings kry `kwaliteitWaarskuwings` vir latere verduideliking.
- Bestaande lesings kan gewysig of verwyder word.
- Die aksieknoppie sê duidelik “Wysig / Verwyder”.

### Regstel en geskiedenis

- `beginRegstel()` neem die gebruiker na die relevante tenk.
- Die probleemtenk flikker kortliks en word uitgelig.
- Klik op 'n spesifieke probleem open sy geskiedeniskolom.
- Die relevante geskiedeniskolom word uitgelig.
- Daar is 'n terugknoppie na die oorspronklike tenkregstelling.
- ORP-geskiedenis is klikbaar vir al die tenks.
- Geskiedenisrye wys duidelik dat besonderhede beskikbaar is.

### Grafieke

- Grafieke is vir die ligte kleurskema leesbaarder gemaak.
- Vloei en ORP het aanbevole/teikenbande.
- Vloei-teiken: 1–2 L/min.
- ORP-teiken: minstens 200 mV.

### Oes en verkope

- Die gebruiker kan 'n spesifieke tenk kies.
- Oes en verkope het aparte aksies.
- Oesrekords bly in `oesrekords`.
- Nuwe verkooprekords word in `verkope` gestoor met datum, gram, prys per kg,
  randwaarde, koper en nota.
- 'n Aparte verkoopsregister wys nuwe verkope.
- Ou oesrekords wat reeds 'n `randWaarde` bevat, word steeds as ou
  gekombineerde oes/verkooprekords in die verkoopsregister gewys om dataverlies
  te voorkom.

### Groei, Leer en navigasie

- Groei-foto's is onder “Groei-foto's” gekonsolideer.
- Duplikaat “Leer” en “Hulpbronne” is verwyder.
- Duplikaat “Coach-gereedskap” en “Meer” is vir skermgrootte gekonsolideer.
- Praktiese Leer-inhoud word dinamies volgens die swakste tenk se probleem gebou
  deur `bouLeerPraktyk()`.
- Leer gee 'n verduideliking en 'n praktiese aksie, sonder 'n toets.

### Leesbaarheid en uitleg

- Hoofkleurskema is na 'n hoër-kontras ligte tema aangepas.
- Swak kontraste op die Doseer-blad is reggestel.
- Belangrike probleme gebruik warm waarskuwingskleure.
- Normale/gesonde inligting word nie onnodig rooi vertoon nie.
- Die gesondheidsmeter se proporsies is verbeter.

## 5. Belangrike funksies in `tenk-monitor-ux.html`

| Funksie | Doel |
|---|---|
| `loadDataRemote()` | Laai plaaslik/Firebase en kies nuutste data |
| `saveData(d)` | Stoor plaaslik en sinkroniseer na Firebase |
| `buildTankCards()` | Bou lesingstenkkaarte |
| `analyze()` | Valideer, stoor en ontleed nuwe lesings |
| `kontroleerLesingKwaliteit()` | Merk moontlike meetfoute |
| `checkTendense()` | Ontleed onlangse tendense |
| `checkWaarskuwings()` | Bou waarskuwings |
| `renderHistory()` | Bou geskiedenis en aksies |
| `openParamHistory()` | Open spesifieke parameter se geskiedenis |
| `beginRegstel()` | Begin probleemregstelling vir 'n tenk |
| `renderAllCharts()` | Bou alle grafieke |
| `doseerLaaiTenk()` | Laai 'n tenk in die Doseerrekenaar |
| `bouOes()` | Bou oes-, verkope- en wins/verlies-oorsig |
| `wysTekenVerkoop()` / `bevestigVerkoop()` | Nuwe aparte verkoopvloei |
| `berekenTenkGesondheid()` | Bereken verduidelikbare tenkgesondheid |
| `bouCoachPlan()` | Bou data-gedrewe daaglikse plan |
| `bouCoachGereedskap()` | Kies relevante Coach-gereedskap |
| `renderUxHome()` | Bou die huidige dashboard |
| `bouLeerPraktyk()` | Bou praktiese, probleemspesifieke Leer-inhoud |
| `showPage()` | Enkelblad-navigasie |

## 6. Wat volgende gedoen moet word

### Hoë prioriteit

1. **Bevestig agronomiese teikenwaardes en gesondheidsformule.**
   - Die `CROPS`-waardes, ORP-teiken, vloei-teiken en aftrekkings is nuttige
     werkwaardes, maar moet deur 'n NFT/hidroponika-kundige bevestig word.
   - Moenie die gesondheidspunt as 'n mediese of wetenskaplik gevalideerde
     risiko-indeks voorstel voordat dit bevestig is nie.

2. **Verfyn die aparte verkoopsregister.**
   - Voeg wysig en verwyder vir verkooprekords by.
   - Wys beskikbare geoesde voorraad teenoor verkoopte voorraad.
   - Waarsku indien meer verkoop word as wat geoes is.
   - Besluit hoe ou gekombineerde oes/verkooprekords gemigreer moet word.

3. **Verbeter data-gehalte-terugvoer.**
   - Wys `kwaliteitWaarskuwings` ook in geskiedenis, nie net in die
     gesondheidspunt nie.
   - Laat die gebruiker 'n waarskuwing as “bevestig korrek” merk.
   - Voeg meter-kalibrasie-datums by.

4. **Maak die Coach-plan voltooiingsbewus.**
   - Stoor watter take vandag voltooi is.
   - Heropen take wanneer 'n nuwe probleem ontstaan.
   - Wys net die belangrikste 3–5 take om oorlading te voorkom.

5. **Voltooi visuele en mobiele QA.**
   - Toets elke blad op rekenaar en foon.
   - Kontroleer lang Afrikaanse teks, modale en knoppies.
   - Kontroleer dat geen prente oor teks lê nie.

### Medium prioriteit

6. **Bou 'n duidelike probleemlog.**
   - Datum, probleem, waarskynlike oorsaak, aksie, opvolglesing en status.
   - Koppel dit aan Coach-plan en geskiedenis.

7. **Verbeter wins/verlies.**
   - Bereken inkomste uit die aparte `verkope`-data.
   - Verdeel koste beter per tenk en siklus.
   - Wys wins per gewas, tenk en siklus.

8. **Voeg data-uitvoer en rugsteun by.**
   - CSV/Excel-uitvoer vir lesings, oes en verkope.
   - JSON-rugsteun en herstel.
   - Duidelike waarskuwing voordat data oorskryf word.

9. **Maak taalondersteuning konsekwent.**
   - Nuwe Afrikaanse teks is nog nie oral in die `i18n`-struktuur nie.
   - Vertaal eers nadat die Afrikaanse produkvloei stabiel is.

10. **Verminder tegniese skuld.**
    - Die enkel-HTML-lêer is nou baie groot.
    - Skei later CSS, data/konfigurasie en JavaScript in modules.
    - Doen dit versigtig; moenie funksionaliteit tydens die skeiding verander nie.

### Leerdermodule, later

11. **Toetse en leerderaktiwiteite hoort in `tenk-monitor-leerder.html`.**
    - Praktiese stap-vir-stap aktiwiteite.
    - Kort toetse oor EC, pH, TDS, temperatuur, vloei en ORP.
    - Onderwyser-/Coach-terugvoer.
    - Moenie formele toetse in die hoof-Tenkmonitor plaas nie.

## 7. Bekende beperkings en risiko's

- Die toepassing is nog 'n prototipe, nie 'n volwaardige produksietoepassing nie.
- Die HTML-lêer is groot en bevat ingebedde beelde/data; wysigings kan stadig wees.
- Die teikenwaardes in `CROPS` verskil op plekke van `nft/bemesting.md`.
  Die Markdown-konteks is grotendeels verouderd of `Onbekend`; bevestiging is nodig.
- Firebase-sekuriteit en multi-gebruiker-konflikte is nog nie behoorlik aangespreek nie.
- `saveData()` stuur die volledige datastruktuur met `PUT`, wat gelyktydige
  veranderinge kan oorskryf.
- Daar is geen formele outomatiese toetsstel nie.
- Browser-outomatisering kon tydens die laaste sessie nie aan die plaaslike
  Windows in-app browser koppel nie. JavaScript-sintaksis is wel nagegaan.
- Die `nft` Git-werkboom bevat bestaande/onverwante veranderings. Moenie hulle
  terugrol nie.

## 8. Hoe om veranderinge te verifieer

### Maak die toepassing oop

Open:

`C:\Users\riaan\OneDrive\Desktop\Agent\nft\tenk-monitor-ux.html`

Na 'n wysiging, druk `Ctrl+F5` om die blad volledig te herlaai.

### JavaScript-sintaksiskontrole

Gebruik vanuit `C:\Users\riaan\OneDrive\Desktop\Agent`:

```powershell
& 'C:\Users\riaan\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' -e "const fs=require('fs');const s=fs.readFileSync('nft/tenk-monitor-ux.html','utf8');const scripts=[...s.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(x=>x.trim());for(const js of scripts)new Function(js);console.log('JavaScript syntax OK');"
```

### Handmatige kernvloei-kontrole

1. Dashboard laai en wys alle groeiende tenks.
2. Elke tenk se gesondheid kan oopmaak en verduidelik sy punt.
3. “Begin dringendste” neem die gebruiker na die regte tenk.
4. Klik op elke probleem open die regte geskiedenis.
5. 'n Verdagte lesing wys 'n bevestigingswaarskuwing.
6. 'n Normale lesing stoor sonder onnodige waarskuwing.
7. Oes en verkoop kan apart aangeteken word.
8. Die verkoopsregister wys nuwe en ou versoenbare verkope.
9. Grafieke wys data en teikenbande leesbaar.
10. Leer wys 'n praktiese les volgens die huidige belangrikste probleem.

## 9. Plaaslike projekinstruksies vir die volgende AI

Lees aan die begin:

1. `my-assistant.md`
2. `onderwys/les-rooster.md`
3. `tuin/skedule.md`
4. `voerkraal/diere-data.md`

Vir Tenkmonitor-werk, lees ook:

5. `tuin/gewasse.md`
6. `nft/bemesting.md`
7. `nft/monitering.md`
8. Hierdie oorhandigingslêer

Kommunikeer in Afrikaans. Inligting wat ontbreek of nie bevestig is nie, moet as
`Onbekend` of onbevestig gemerk word. Moenie bestaande gebruikersdata of
onverwante Git-veranderinge terugrol nie.

## 10. Aanbevole eerste taak vir die volgende AI

Begin met die aparte verkoopsregister:

1. Voeg **Wysig** en **Verwyder** by elke verkoop.
2. Bereken **geoes**, **verkoop** en **beskikbaar** per tenk.
3. Waarsku wanneer die gebruiker meer probeer verkoop as beskikbare oes.
4. Verifieer die hele vloei op rekenaar en foon.

Dit is die volgende logiese stap omdat die nuwe verkoopstruktuur reeds bestaan,
maar nog nie volledig bestuurbaar of voorraadbewus is nie.
