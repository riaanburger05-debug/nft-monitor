const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat, ImageRun,
  convertInchesToTwip, UnderlineType
} = require('docx');
const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\riaan\\OneDrive\\Desktop\\Agent\\nft\\GroeiGids';
const IMG  = 'C:\\Users\\riaan\\OneDrive\\Desktop\\Agent\\nft\\Images';

// A4: 11906 x 16838 DXA, marges: 720 DXA (0.5 inch) elke kant
const PW = 11906;
const PH = 16838;
const ML = 720; const MR = 720; const MT = 720; const MB = 720;
const CW = PW - ML - MR; // 10466 DXA inhoudbreedte

// ── KLEURE ──────────────────────────────────────────────────
const GROEN   = '1B5E20';
const LIG_G   = 'E8F5E9';
const BLOU    = '1565C0';
const LIG_B   = 'E3F2FD';
const ROOI    = 'C62828';
const LIG_R   = 'FFEBEE';
const GEEL    = 'E65100';
const LIG_Y   = 'FFF8E1';
const GRYS    = '546E7A';
const LIG_GY  = 'F5F5F5';
const WIT     = 'FFFFFF';
const DONKER  = '263238';

// ── HULPFUNKSIES ────────────────────────────────────────────
function sysHd(tekst, kleur = GROEN) {
  return new Paragraph({
    spacing: { before: 320, after: 160 },
    children: [new TextRun({
      text: tekst, font: 'Arial', size: 28, bold: true, color: kleur
    })]
  });
}
function sub(tekst, kleur = DONKER) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [new TextRun({
      text: tekst, font: 'Arial', size: 24, bold: true, color: kleur
    })]
  });
}
function para(tekst, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    ...opts,
    children: [new TextRun({
      text: tekst, font: 'Arial', size: 22, color: DONKER, ...opts.run
    })]
  });
}
function vet(tekst) {
  return new TextRun({ text: tekst, font: 'Arial', size: 22, bold: true, color: DONKER });
}
function kursief(tekst) {
  return new TextRun({ text: tekst, font: 'Arial', size: 22, italics: true, color: GRYS });
}
function bullet(tekst, vet_deel = '') {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    numbering: { reference: 'bullets', level: 0 },
    children: [
      vet_deel ? new TextRun({ text: vet_deel, font: 'Arial', size: 22, bold: true, color: DONKER }) : null,
      new TextRun({ text: vet_deel ? ' ' + tekst : tekst, font: 'Arial', size: 22, color: DONKER })
    ].filter(Boolean)
  });
}
function kolom_ry(selle, agtergronde = []) {
  return new TableRow({
    children: selle.map((t, i) => new TableCell({
      width: { size: Math.floor(CW / selle.length), type: WidthType.DXA },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      shading: agtergronde[i] ? { fill: agtergronde[i], type: ShadingType.CLEAR } : undefined,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      },
      children: typeof t === 'string'
        ? [new Paragraph({ children: [new TextRun({ text: t, font: 'Arial', size: 20, color: DONKER })] })]
        : t
    }))
  });
}
function hooftabel(kolomme, rye) {
  const breedte = Math.floor(CW / kolomme.length);
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: kolomme.map(() => breedte),
    rows: [
      new TableRow({
        tableHeader: true,
        children: kolomme.map(k => new TableCell({
          width: { size: breedte, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          shading: { fill: GROEN, type: ShadingType.CLEAR },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: '388E3C' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: '388E3C' },
            left: { style: BorderStyle.SINGLE, size: 1, color: '388E3C' },
            right: { style: BorderStyle.SINGLE, size: 1, color: '388E3C' },
          },
          children: [new Paragraph({ children: [new TextRun({ text: k, font: 'Arial', size: 18, bold: true, color: WIT })] })]
        }))
      }),
      ...rye.map((ry, idx) => new TableRow({
        children: ry.map((sel, i) => new TableCell({
          width: { size: breedte, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          shading: { fill: idx % 2 === 0 ? WIT : 'F5F5F5', type: ShadingType.CLEAR },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0' },
          },
          children: [new Paragraph({ children: [new TextRun({ text: sel, font: 'Arial', size: 20, color: DONKER, bold: i === 0 })] })]
        }))
      }))
    ]
  });
}
function infoBlok(tekst, kleur = LIG_G, randKleur = 'A5D6A7') {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: randKleur } },
    shading: { fill: kleur, type: ShadingType.CLEAR },
    indent: { left: 200 },
    children: [new TextRun({ text: tekst, font: 'Arial', size: 22, color: DONKER })]
  });
}
function hoofstukTitel(nr, titel, subtitel) {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      spacing: { before: 400, after: 100 },
      shading: { fill: GROEN, type: ShadingType.CLEAR },
      indent: { left: 200 },
      children: [new TextRun({ text: `HOOFSTUK ${nr}`, font: 'Arial', size: 20, bold: true, color: 'A5D6A7', allCaps: true, characterSpacing: 200 })]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 0, after: 100 },
      children: [new TextRun({ text: titel, font: 'Arial', size: 48, bold: true, color: '1b3a1b' })]
    }),
    new Paragraph({
      spacing: { before: 0, after: 300 },
      children: [new TextRun({ text: subtitel, font: 'Arial', size: 24, color: GRYS, italics: true })]
    }),
  ];
}
function afdelingsHoof(tekst) {
  return new Paragraph({
    spacing: { before: 280, after: 140 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GROEN } },
    children: [new TextRun({ text: tekst.toUpperCase(), font: 'Arial', size: 20, bold: true, color: GROEN, characterSpacing: 150 })]
  });
}
function spasie(n = 1) {
  return new Paragraph({ spacing: { before: 100 * n, after: 100 * n }, children: [new TextRun({ text: '' })] });
}
function img(naam, breedte = 400, hoogte = 250) {
  const pad = path.join(IMG, naam);
  if (!fs.existsSync(pad)) return null;
  const data = fs.readFileSync(pad);
  const ext = naam.split('.').pop().toLowerCase();
  const tipe = ext === 'jpg' ? 'jpeg' : ext;
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120 },
    children: [new ImageRun({ type: tipe, data, transformation: { width: breedte, height: hoogte }, altText: { title: naam, description: naam, name: naam } })]
  });
}

// ── VOET EN KOPBALK ─────────────────────────────────────────
function voetbalk(hoofstukNaam) {
  return new Footer({
    children: [new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: GROEN } },
      tabStops: [{ type: 'right', position: CW + ML }],
      children: [
        new TextRun({ text: 'NFT A-Raam Handleiding  |  ', font: 'Arial', size: 18, color: GRYS }),
        new TextRun({ text: hoofstukNaam, font: 'Arial', size: 18, color: GROEN }),
        new TextRun({ text: '\t', font: 'Arial', size: 18 }),
        new TextRun({ text: 'Bladsy ', font: 'Arial', size: 18, color: GRYS }),
        new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 18, color: GRYS }),
      ]
    })]
  });
}

// ════════════════════════════════════════════════════════════
// DOKUMENT INHOUD
// ════════════════════════════════════════════════════════════

const seksies = [];

// ── VOORBLAD ────────────────────────────────────────────────
seksies.push({
  properties: {
    page: { size: { width: PW, height: PH }, margin: { top: 2880, bottom: 1440, left: ML, right: MR } }
  },
  footers: { default: voetbalk('Voorblad') },
  children: [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 100 },
      children: [new TextRun({ text: 'GROEI', font: 'Arial', size: 72, bold: true, color: GROEN }),
                 new TextRun({ text: 'WYS', font: 'Arial', size: 72, bold: true, color: GEEL })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 },
      children: [new TextRun({ text: 'Hidroponies vir Skole', font: 'Arial', size: 28, color: GRYS, italics: true })] }),
    spasie(3),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 },
      children: [new TextRun({ text: 'NFT A-RAAM STELSEL', font: 'Arial', size: 24, bold: true, color: GRYS, allCaps: true, characterSpacing: 300 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 400 },
      children: [new TextRun({ text: 'GroeiGids', font: 'Arial', size: 96, bold: true, color: '1b3a1b' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 },
      children: [new TextRun({ text: 'DIE VOLLEDIGE HANDLEIDING', font: 'Arial', size: 28, bold: true, color: GROEN, allCaps: true, characterSpacing: 200 })] }),
    spasie(4),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 80 },
      children: [new TextRun({ text: 'Opgestel en saamgestel deur', font: 'Arial', size: 22, color: GRYS })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 },
      children: [new TextRun({ text: 'Riaan Burger', font: 'Arial', size: 28, bold: true, color: DONKER })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 },
      children: [new TextRun({ text: 'GroeiWys — Hidroponies vir Skole', font: 'Arial', size: 22, color: GRYS })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 },
      children: [new TextRun({ text: 'Noord-Vrystaat · 2026', font: 'Arial', size: 22, color: GRYS })] }),
  ]
});

// ── VOORWOORD ───────────────────────────────────────────────
seksies.push({
  properties: {
    page: { size: { width: PW, height: PH }, margin: { top: MT, bottom: MB, left: ML, right: MR } }
  },
  footers: { default: voetbalk('Voorwoord') },
  children: [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 0, after: 200 },
      children: [new TextRun({ text: 'Voorwoord', font: 'Arial', size: 40, bold: true, color: GROEN })] }),
    sysHd('Welkom by die GroeiGids!'),
    para('Jy hou tans ‘n handleiding wat jou gaan leer hoe om kos te kweek sonder grond — reg in die klaskamer, skoolgrond of jou tuiste. Dit klink miskien na towery, maar dit is pure wetenskap. Hierdie metode, wat ons NFT hidroponies noem, word reg oor die wêreld gebruik om gesonde groente te kweek — vinniger, skoner en meer doeltreffend as tradisionele tuinmaak.'),
    spasie(),
    para('Ons glo dat jy die vermoë het om meer te doen as net kos te kweek. Jy kan ‘n probleem help oplos. In baie gemeenskappe is vars groente duur of moeilik bekombaar. Met hierdie stelsel kan jy deel wees van die oplossing — en terselfdertyd een van die belangrikste vaardighede van die toekoms aanleer.'),
    spasie(),
    para('Hierdie gids is geskryf sodat enigeen dit kan verstaan — of jy nou Graad 8 of Graad 12 is. Jy hoef nie ‘n wetenskaps-wenner te wees nie. Jy moet net nuuskierig wees, bereid wees om te leer, en nie bang wees om jou hande nat te maak nie — letterlik!'),
    spasie(),
    afdelingsHoof('Hoe gebruik jy hierdie gids?'),
    bullet('NFT inleiding, basiese metings: EC, pH en TDS', 'Hoofstuk 1 —'),
    bullet('Stelsel opstelling stap-vir-stap', 'Hoofstuk 2 —'),
    bullet('Ken jou gewasse en wanneer om te plant', 'Hoofstuk 3 —'),
    bullet('Wat jy altyd moet — en nooit mag — doen', 'Hoofstuk 4 —'),
    bullet('Hou jou logboek elke dag by', 'Hoofstuk 5 —'),
    bullet('Los probleme op sodra dit voorkom', 'Hoofstuk 6 —'),
    spasie(),
    infoBlok('Die logboek in Hoofstuk 5 is jou wetenskaplike dagboek. Gebruik dit elke dag. Dit is waar jy begin dink soos ‘n regte navorser — jy sien tendense, leer uit foute en vier suksesse.'),
    spasie(),
    para('As iets verkeerd gaan — en soms sal dit, want dit is deel van die leerproses — gaan Hoofstuk 6 jou help om die probleem te identifiseer en reg te stel. Moenie ontmoedig raak nie. Elke probleem is ‘n kans om te leer.'),
    spasie(2),
    new Paragraph({ spacing: { before: 200, after: 80 }, children: [new TextRun({ text: 'Ek wens jou baie pret, ‘n gesonde stelsel en ‘n goeie oes toe. 🌱', font: 'Arial', size: 24, bold: true, color: GROEN })] }),
    spasie(2),
    new Paragraph({ spacing: { before: 100, after: 40 }, children: [new TextRun({ text: 'Riaan Burger', font: 'Arial', size: 24, bold: true, color: DONKER })] }),
    para('GroeiWys — Hidroponies vir Skole'),
    para('2026'),
  ]
});

// ── HOOFSTUK 1 ───────────────────────────────────────────────
seksies.push({
  properties: {
    page: { size: { width: PW, height: PH }, margin: { top: MT, bottom: MB, left: ML, right: MR } }
  },
  footers: { default: voetbalk('Hoofstuk 1 — NFT, EC, pH, TDS & Suurstof') },
  children: [
    ...hoofstukTitel(1, 'NFT, EC, pH, TDS & Suurstof', 'Verstaan die drie kernmetings en hoe suurstof jou wortels aan die lewe hou'),

    afdelingsHoof('Wat is ‘n NFT Hidroponiese Stelsel?'),
    sub('Hoe werk NFT?'),
    new Paragraph({ spacing: { before: 80, after: 80 }, children: [
      new TextRun({ text: 'NFT', font: 'Arial', size: 22, bold: true, color: DONKER }),
      new TextRun({ text: ' staan vir ', font: 'Arial', size: 22, color: DONKER }),
      new TextRun({ text: 'Nutrient Film Technique', font: 'Arial', size: 22, bold: true, color: DONKER }),
      new TextRun({ text: ' — Voedingstoffilm-tegniek in Afrikaans.', font: 'Arial', size: 22, color: DONKER }),
    ]}),
    para('In plaas van grond gebruik ons water wat baie stadig deur gekantelde pype vloei — so stadig dat dit net ‘n dun “film” water op die onderkant van die pyp laat.'),
    para('Die plantewortels hang in dié pype. Die onderpunt van die wortels raak die waterfilm en suig voedingstowwe op. Die boonste deel van die wortels bly in die lug en asem suurstof in.'),
    spasie(),

    sub('Wat beoog ons hiermee?'),
    bullet('Vars groente kweek by die skool — slaai, spinasie, aarbeie en mosterd'),
    bullet('Wetenskaplike vaardighede aanleer — meting, analise, logboek'),
    bullet('Verantwoordelikheid — elke leerder sorg vir ‘n kant van die stelsel'),
    bullet('Voedselsekerheid — verstaan hoe kos geproduseer word'),
    bullet('Entrepreneurskap — groente kan verkoop word aan onderwysers en ouers'),
    spasie(),

    afdelingsHoof('Voordele en Nadele van NFT'),
    hooftabel(
      ['Voordele ✅', 'Nadele ⚠️'],
      [
        ['Vinniger groei — 30–50% vinniger as in grond', 'Kragafhanklik — pomp moet 24/7 loop'],
        ['Waterbesparend — tot 90% minder water', 'Watertemperatuur krities — warm water hou minder suurstof'],
        ['Presiese beheer oor voedingstowwe', 'Siekte versprei vinnig deur dieselfde tenk'],
        ['Minder peste — geen grond = minder grondgedraagde siektes', 'Opstelkoste hoer as ‘n gewone tuin'],
        ['Ruimtebesparing — A-raam gebruik vertikale spasie', 'Kennis nodig — EC, pH en suurstof moet gereeld gemeet word'],
      ]
    ),
    spasie(),
    infoBlok('⚠️  Onthou: Die grootste gevaar in NFT is ‘n pompstoring. Sonder water-sirkulasie sterf wortels binne 30 minute. Dit is hoekom die pomp 24/7 aan moet wees.', LIG_Y, 'FFC107'),

    new Paragraph({ children: [new PageBreak()] }),
    afdelingsHoof('Die Drie Kernmetings'),

    sub('EC — Elektriese Geleidingsvermoë'),
    new Paragraph({ spacing: { before: 80, after: 80 }, children: [
      new TextRun({ text: 'EC', font: 'Arial', size: 22, bold: true, color: BLOU }),
      new TextRun({ text: ' meet die konsentrasie van voedingstowwe in die water. Hoe hoër die EC, hoe meer voedingstowwe. Gemeet in ', font: 'Arial', size: 22, color: DONKER }),
      new TextRun({ text: 'mS/cm', font: 'Arial', size: 22, bold: true, color: BLOU }),
      new TextRun({ text: '.', font: 'Arial', size: 22, color: DONKER }),
    ]}),
    bullet('Te laag: plante verhonger — geel blare, stadige groei'),
    bullet('Te hoog: brand wortels, blare droog uit, groei stop'),
    bullet('Korrek: spesifiek per gewas (sien Hoofstuk 3)'),
    spasie(),

    sub('pH — Suurgraad'),
    new Paragraph({ spacing: { before: 80, after: 80 }, children: [
      new TextRun({ text: 'pH', font: 'Arial', size: 22, bold: true, color: GROEN }),
      new TextRun({ text: ' meet hoe suur of alkalies die water is. Skaal 0–14. Neutraal = 7. Vir hidroponies: ', font: 'Arial', size: 22, color: DONKER }),
      new TextRun({ text: '5.5–7.0', font: 'Arial', size: 22, bold: true, color: GROEN }),
      new TextRun({ text: ' afhangende van gewas.', font: 'Arial', size: 22, color: DONKER }),
    ]}),
    bullet('Te hoog (alkalies): voedingstowwe word geblokkeer — plant verhonger al is EC reg'),
    bullet('Te laag (suur): wortelbrand, giftige minerale word vrygestel'),
    infoBlok('pH is die "sleutel tot die spens" — die voedingstowwe is teenwoordig (EC is reg) maar die verkeerde pH sluit die deur. Die plant verhonger terwyl kos rondom hom is.', LIG_G, '4CAF50'),
    spasie(),

    sub('TDS — Totale Opgeloste Vastestowwe'),
    new Paragraph({ spacing: { before: 80, after: 80 }, children: [
      new TextRun({ text: 'TDS', font: 'Arial', size: 22, bold: true, color: GRYS }),
      new TextRun({ text: ' meet dieselfde as EC maar in ', font: 'Arial', size: 22, color: DONKER }),
      new TextRun({ text: 'ppm (dele per miljoen)', font: 'Arial', size: 22, bold: true, color: DONKER }),
      new TextRun({ text: '. Hidroponiese boere gebruik gewoonlik EC.', font: 'Arial', size: 22, color: DONKER }),
    ]}),

    new Paragraph({ children: [new PageBreak()] }),
    afdelingsHoof('EC & pH Reekse per Gewas'),
    hooftabel(
      ['Gewas', 'Kant', 'EC (mS/cm)', 'pH', 'Tenk'],
      [
        ['🥬 Slaai', 'Raam A Kant 1', '1.2 – 1.8', '5.8 – 6.2', 'A'],
        ['🌱 Spinasie', 'Raam A Kant 2', '1.8 – 2.3', '6.0 – 7.0', 'B'],
        ['🍓 Aarbeie', 'Raam B Kant 1', '1.0 – 1.4', '5.5 – 6.0', 'C'],
        ['🌿 Mosterd Spinasie', 'Raam B Kant 2', '1.6 – 2.0', '6.0 – 6.8', 'D'],
      ]
    ),
    spasie(),

    afdelingsHoof('Suurstof in die NFT Stelsel'),
    para('Suurstof is net so belangrik as voedingstowwe. Wortels benodig suurstof vir aeroëbiese asemhaling om voedingstowwe op te neem.'),
    spasie(),
    sub('Hoe suurstof in ‘n NFT stelsel inkom:'),
    bullet('Pomp stoot water — turbulensie by inlaatpunt'),
    bullet('Waterval by inlaat — suurstof word ingemeng'),
    bullet('Dun film vloei — groot oppervlak absorbeer suurstof deurlopend'),
    bullet('Lugruimte in pyp — boonste wortels hang in suurstofryke lug'),
    bullet('Wortel absorbeer suurstof — aeroëbiese asemhaling'),
    spasie(),
    sub('Te min suurstof — oorsake:'),
    bullet('Pompstoring of kragonderbreking — stilstaande water verloor suurstof binne 2–4 uur'),
    bullet('Water te warm (>26°C) — warm water hou minder opgeloste suurstof'),
    bullet('Pype se helling te plat (<2°) — water versamel in plaas van te vloei'),
    bullet('Alge of bakterieële uitbraak — hierdie organismes verbruik suurstof'),
    spasie(),
    infoBlok('Duimreël: Hou watertemperatuur onder 22°C, handhaaf ‘n 2–3% pyp-helling, en laat die pomp deurlopend loop.', LIG_B, '90CAF9'),
    spasie(),

    afdelingsHoof('Wat Gebeur as Elkeen Verkeerd Is?'),
    hooftabel(
      ['Meting', 'Te Hoog', 'Te Laag', 'Reg stel'],
      [
        ['EC', 'Brand wortels, blare droog uit', 'Geel blare, stadige groei', 'Hoog: voeg skoon water by\nLaag: voeg voedingstof by'],
        ['pH', 'Voedingstofblokkasie, geel blare', 'Wortelbrand, giftige minerale', 'Hoog: pH-daler druppelsgewys\nLaag: pH-verhoger druppelsgewys'],
        ['TDS', 'Soos EC te hoog', 'Soos EC te laag', 'Soos EC aanpassings'],
        ['Watertemp', 'Minder suurstof, Pythium gevaar', 'Stadige groei', 'Hoog: skadu, ysblokkie\nLaag: verwarm water effens'],
      ]
    ),
  ]
});

// ── HOOFSTUK 2 ───────────────────────────────────────────────
seksies.push({
  properties: {
    page: { size: { width: PW, height: PH }, margin: { top: MT, bottom: MB, left: ML, right: MR } }
  },
  footers: { default: voetbalk('Hoofstuk 2 — Stelsel Opstelling') },
  children: [
    ...hoofstukTitel(2, 'Stelsel Opstelling', 'Stap-vir-stap gids: van leë raam tot eerste plant'),

    afdelingsHoof('Fase 1 — Fisiese Opstelling'),
    sub('Stap 1: Kies en berei die ligging voor'),
    bullet('Gelyk, vaste grond of ‘n stewige vloer'),
    bullet('Minstens 6 uur direkte son per dag, of naby ‘n kragbron vir groeiligte'),
    bullet('Grond moet goed gedreineer wees – geen waterpoele'),
    spasie(),
    sub('Stap 2: Stel die A-Rame op'),
    bullet('2 A-Rame (Raam A en Raam B), elk met 2 kante (Kant 1 en Kant 2)'),
    bullet('Helling: 2–3% na die afvoerkant — gebruik ‘n waterpas'),
    bullet('Maak seker die raam is stewig en beweeg nie'),
    spasie(),
    sub('Stap 3: Installeer die NFT-pype'),
    bullet('Plaas PVC NFT-pype (63 mm of 75 mm) op die raam'),
    bullet('Sny plantgate van 70 mm (slaai/mosterd) en 75 mm (aarbeie) elke 20–25 cm'),
    bullet('Gebruik ‘n gatboor — gate loop nie reg oor die pypmonding nie'),
    spasie(),
    sub('Stap 4: Koppel pype in serie'),
    bullet('Die pomp koppel aan die hoogste punt van die boonste pyp'),
    bullet('Water vloei dan deur elke pyp van bo na onder (Pyp 1 → Pyp 5)'),
    bullet('Elke pyp koppel op sy laagste punt aan die hoogste punt van die volgende'),
    bullet('Die onderste pyp koppel op sy laagste punt terug aan die tenk'),
    spasie(),
    sub('Stap 5: Installeer die pompe en stel vloeisnelheid in'),
    bullet('4 waterpomp (een per kant/tenk) — verstelbaar 1–2 liter per minuut'),
    bullet('Stel die pompvloeibeheerder of klep in: uitlaat van enige pyp = 1–2 liter/minuut'),
    bullet('1–2 L/min totaal — dieselfde meting by elke pyp'),

    new Paragraph({ children: [new PageBreak()] }),
    afdelingsHoof('Fase 2 — Water & Voedingstof'),
    sub('Stap 6: Koppel die tenks'),
    hooftabel(
      ['Tenk', 'Kant', 'Gewas', 'Pomp'],
      [
        ['Tenk A', 'Raam A Kant 1', '🥬 Slaai', 'Pomp 1'],
        ['Tenk B', 'Raam A Kant 2', '🌱 Spinasie', 'Pomp 2'],
        ['Tenk C', 'Raam B Kant 1', '🍓 Aarbeie', 'Pomp 3'],
        ['Tenk D', 'Raam B Kant 2', '🌿 Mosterd Spinasie', 'Pomp 4'],
      ]
    ),
    spasie(),
    sub('Stap 7: Vul tenks met voedingsoplossing'),
    para('Meng altyd Voedingstof A eers by water, roer goed, dan eers Voedingstof B. Meng NOOIT A en B direk saam — dit veroorsaak ‘n neerslagreaksie.'),
    spasie(),
    hooftabel(
      ['Tenk', 'Gewas', 'Skoon Water', 'Voedingstof A', 'Voedingstof B', 'Teiken EC', 'pH'],
      [
        ['Tenk A', 'Slaai', '100 L', '250 ml', '250 ml', '1.2–1.8', '5.8–6.2'],
        ['Tenk B', 'Spinasie', '100 L', '200 ml', '200 ml', '1.8–2.3', '6.0–7.0'],
        ['Tenk C', 'Aarbeie', '100 L', '320 ml', '320 ml', '1.0–1.4', '5.5–6.0'],
        ['Tenk D', 'Mosterd', '100 L', '360 ml', '360 ml', '1.6–2.0', '6.0–6.8'],
      ]
    ),
    infoBlok('Nota: Hoeveelhede is benaderd — altyd EC-meter gebruik om te bevestig. Verskillende handelsmerk voedingstowwe het verskillende konsentrasies.', LIG_B, '90CAF9'),

    new Paragraph({ children: [new PageBreak()] }),
    afdelingsHoof('Fase 3 — Saailinge Inplant'),
    sub('Stap 8: Sit saailinge in netpotte'),
    bullet('Slaai en mosterd: 50mm netpotte met perliet of klipwol'),
    bullet('Aarbeie: 75mm netpotte'),
    bullet('Die groeimedium hou die plant regop — water mag nooit die groeimedium self natmaak nie'),
    spasie(),
    sub('Stap 9: Plaas netpotte in pypgate'),
    bullet('Die pot hang vry in die pyp — dit mag nie die water raak nie'),
    bullet('Wortels groei onderdeur die pot in die dunfilm water'),
    spasie(),
    sub('Stap 10: Eerste 48 uur — konstante aandag'),
    bullet('Monitor elke 4 uur die eerste 2 dae'),
    bullet('Blare kan effens hang — dit is normaal (oorplantingskok)'),
    bullet('Nuwe groei na 48–72 uur beteken sukses'),
    spasie(),

    afdelingsHoof('Saailinggids — Wortelgereedheid'),
    hooftabel(
      ['Gewas', 'Propagasie Metode', 'Tyd', 'Min Wortellengte', 'Netpot'],
      [
        ['🥬 Slaai', 'Uit saad (rokwol/perliet)', '7–10 dae', '2–3 cm', '50mm'],
        ['🌱 Spinasie', 'Uit saad (rokwol/perliet)', '10–14 dae', '2–3 cm', '50mm'],
        ['🍓 Aarbeie', 'Stoelons (uitlopers)', 'n.v.t.', '3–5 cm', '75mm'],
        ['🌿 Mosterd', 'Uit saad (rokwol/perliet)', '5–7 dae', '2–3 cm', '50mm'],
      ]
    ),
    spasie(),
    infoBlok('❌ Moenie uitplant as wortels bruin of slymrig is nie — die saailing is siek. Begin oor met nuwe medium en saad.', LIG_R, ROOI),
    infoBlok('✅ Wortels moet WIT of crème van kleur wees en stewig uit die onderkant van die netpot hang.', LIG_G, '4CAF50'),
    spasie(),

    afdelingsHoof('Nuwe Siklus — Wat Doen Jy na ‘n Oes?'),
    para('Na elke oes moet die stelsel gereinig en herbegin word voor nuwe saailinge ingeplant word. Hierdie proses neem gewoonlik 3–5 dae.'),
    spasie(),
    hooftabel(
      ['Dag', 'Aktiwiteit'],
      [
        ['Dag 1', 'Oes alle plante. Verwyder alle netpotte en wortels. Dreineer die tenk volledig.'],
        ['Dag 1–2', 'Skrop pype en tenk. Spoel met skoon water. Ontsmet met waterstofperoksied (3%).'],
        ['Dag 2–3', 'Spoel alle chemikalië uit. Laat pype en tenk volledig droog.'],
        ['Dag 3–4', 'Vul tenk met vars water. Meng nuwe voedingstof. Kalibreer EC en pH. Sirkuleer 24 uur.'],
        ['Dag 4–5', 'Plant voorbereide saailinge. Verseker water raak nie groeimedium nie. Monitor elke 4 uur.'],
      ]
    ),
    infoBlok('💡 Pro-wenk: Begin saailinge kweek 7–14 dae voor jy beplan om die vorige oes te verwyder. So is nuwe saailinge gereed wanneer die stelsel skoon is — geen stilstandtyd nie!', LIG_G, GROEN),
  ]
});

// ── HOOFSTUK 3 ───────────────────────────────────────────────
seksies.push({
  properties: {
    page: { size: { width: PW, height: PH }, margin: { top: MT, bottom: MB, left: ML, right: MR } }
  },
  footers: { default: voetbalk('Hoofstuk 3 — Gewasse & Parameters') },
  children: [
    ...hoofstukTitel(3, 'Gewasse & Parameters', 'Ken jou gewasse — EC, pH, groeisiklus en seisoene'),

    afdelingsHoof('🥬 Slaai — Raam A Kant 1 (Tenk A, Pomp 1)'),
    hooftabel(
      ['Parameter', 'Waarde'],
      [
        ['EC (mS/cm)', '1.2 – 1.8'],
        ['pH', '5.8 – 6.2'],
        ['TDS (ppm)', '600 – 900'],
        ['Watertemperatuur', '18 – 22°C'],
        ['Groeityd', '28 – 35 dae'],
        ['Oesmetode', 'Sny buitenste blare, laat hart staan vir hergroei'],
      ]
    ),
    spasie(),
    bullet('Vinnigste groeiende gewas in die stelsel'),
    bullet('Saadskiet by temperature bo 25°C — plant in koeler seisoene'),
    bullet('Tipe: Ysbergkop, Butterhead, Romaine'),
    spasie(),

    afdelingsHoof('🌱 Spinasie — Raam A Kant 2 (Tenk B, Pomp 2)'),
    hooftabel(
      ['Parameter', 'Waarde'],
      [
        ['EC (mS/cm)', '1.8 – 2.3'],
        ['pH', '6.0 – 7.0'],
        ['TDS (ppm)', '900 – 1 150'],
        ['Watertemperatuur', '18 – 22°C'],
        ['Groeityd', '35 – 45 dae'],
        ['Oesmetode', 'Sny buitenste blare — plant bly produktief vir 6–8 weke'],
      ]
    ),
    spasie(),
    bullet('Oes voordat blom begin, anders word smaak bitter'),
    bullet('Benodig hoër EC as slaai'),
    spasie(),

    new Paragraph({ children: [new PageBreak()] }),
    afdelingsHoof('🍓 Aarbeie — Raam B Kant 1 (Tenk C, Pomp 3)'),
    hooftabel(
      ['Parameter', 'Waarde'],
      [
        ['EC (mS/cm)', '1.0 – 1.4'],
        ['pH', '5.5 – 6.0'],
        ['TDS (ppm)', '500 – 700'],
        ['Watertemperatuur', '18 – 22°C'],
        ['Groeityd', '60 – 90 dae'],
        ['Inplanting', 'Stoelons (uitlopers) — NIE uit saad nie'],
        ['Oesmetode', 'Sny steel 1 cm bo vrug — moenie trek nie'],
      ]
    ),
    spasie(),
    bullet('Laagste EC van al die gewasse'),
    bullet('Plant stoelons in April–Julie vir lente/somer-oes'),
    bullet('Oes Oktober–Desember'),
    spasie(),

    afdelingsHoof('🌿 Mosterd Spinasie — Raam B Kant 2 (Tenk D, Pomp 4)'),
    hooftabel(
      ['Parameter', 'Waarde'],
      [
        ['EC (mS/cm)', '1.6 – 2.0'],
        ['pH', '6.0 – 6.8'],
        ['TDS (ppm)', '800 – 1 000'],
        ['Watertemperatuur', '18 – 22°C'],
        ['Groeityd', '30 – 40 dae'],
        ['Oesmetode', 'Sny buitenste blare — plant bly produktief vir 8–10 weke'],
      ]
    ),
    spasie(),
    bullet('Skerp/peperagtige smaak by hitte — plant in koeler seisoene'),
    spasie(),

    new Paragraph({ children: [new PageBreak()] }),
    afdelingsHoof('Seisoenskalender — Noord-Vrystaat'),
    para('Die Noord-Vrystaat het warm somers (35–38°C) en koue winters. Blaargroente saadskiet in die hitte.'),
    spasie(),
    hooftabel(
      ['Gewas', 'Jan', 'Feb', 'Mrt–Sep', 'Okt', 'Nov–Des'],
      [
        ['Slaai', '❌ Warm', '~ Hitte', '✅ Plant', '~ Hitte', '❌ Warm'],
        ['Spinasie', '❌ Warm', '❌ Warm', '✅ Plant', '❌ Warm', '❌ Warm'],
        ['Aarbeie', '🟦 Oes', '❌ Warm', '✅ Plant (Apr–Jul)', '🟦 Oes', '🟦 Oes'],
        ['Mosterd', '❌ Warm', '~ Hitte', '✅ Plant', '~ Hitte', '❌ Warm'],
      ]
    ),
    spasie(),
    hooftabel(
      ['Kwartaal', 'Maande', 'Aanbeveling'],
      [
        ['Kwartaal 1', 'Jan–Mrt', '❌ Te warm vir blaargroente. Wag tot Maart, of gebruik skadudoek (30–50%).'],
        ['Kwartaal 2', 'Apr–Jun', '✅ Ideaal: slaai, spinasie, mosterd. Plant aarbeie stoelons (Apr–Mei).'],
        ['Kwartaal 3', 'Jul–Sep', '✅ Ideaal: alle blaargroente. Beste seisoen vir skoolprojekte.'],
        ['Kwartaal 4', 'Okt–Nov', '~ Moontlik: slaai (vroeg Okt). Aarbeie oes (Okt–Nov). Temperatuur styg.'],
      ]
    ),
    infoBlok('NFT-stelsels kan die seisoen verleng met skadudoek (30–50%) en koue water (onder 22°C). Sonder hierdie beheer sal plante vinnig saadskiet. Vir skoolprojekte: Begin altyd aan die begin van Kwartaal 2 of 3.', LIG_G, GROEN),
    spasie(),

    afdelingsHoof('Bykomende Gewasse — Toekomstige Uitbreidings'),
    hooftabel(
      ['Gewas', 'EC (mS/cm)', 'pH', 'Groeityd', 'Temp (°C)', 'Nota'],
      [
        ['Basilikum', '1.0–1.6', '5.5–6.5', '25–35 dae', '20–25', 'Oes voor blom'],
        ['Kruisement (Mint)', '2.0–2.4', '5.5–6.5', '30–40 dae', '18–24', 'Baie aggressief — hou apart'],
        ['Koljander (Dhania)', '1.2–1.8', '6.0–7.0', '30–40 dae', '18–24', 'Saadskiet vinnig in hitte'],
        ['Pietersielie', '0.8–1.8', '5.5–6.5', '40–50 dae', '18–24', 'Stadige ontkieming (14–21 dae)'],
        ['Pakchoi (Bok Choy)', '1.5–2.5', '6.0–7.0', '30–45 dae', '18–24', 'Soortgelyk aan slaai'],
        ['Blaarkool (Kale)', '1.25–1.5', '5.5–6.5', '40–55 dae', '15–24', 'Koue-bestand, goeie winter'],
        ['Rocket (Arugula)', '0.8–1.6', '6.0–7.0', '25–35 dae', '15–22', 'Effens peperagtige smaak'],
      ]
    ),
  ]
});

// ── HOOFSTUK 4 ───────────────────────────────────────────────
seksies.push({
  properties: {
    page: { size: { width: PW, height: PH }, margin: { top: MT, bottom: MB, left: ML, right: MR } }
  },
  footers: { default: voetbalk('Hoofstuk 4 — Moets & Moenies') },
  children: [
    ...hoofstukTitel(4, 'Moets & Moenies', 'n Praktiese veldgids vir ‘n gesonde NFT A-Raam hidroponiese stelsel'),

    afdelingsHoof('⚠️ Die 3 Reëls Wat Jy Nie Mag Breek Nie'),
    sub('⚠️ Kritieke Reël 1: Die Pomp Moet 24/7 Loop'),
    para('Sonder water-sirkulasie sterf wortels binne 30 minute. Die pomp is die hart van die stelsel. As die pomp stop, het jy minder as ‘n halfuur om te reageer.'),
    bullet('Gebruik altyd ‘n UPS (noodkragbron) of alternatiewe kragbron'),
    bullet('By kragonderbreking: gooi onmiddellik 5–10 L water deur elke pyp met ‘n emmer'),
    bullet('Herstel krag so vinnig as moontlik'),
    spasie(),
    sub('⚠️ Kritieke Reël 2: Een Verandering op ‘n Slag'),
    para('Pas EC ÓF pH aan — nooit albei gelyktydig nie. Wag 30 minute en meet weer voor die volgende aanpassing.'),
    spasie(),
    sub('⚠️ Kritieke Reël 3: Kante se Water Mag Nooit Meng Nie'),
    para('Elke kant het sy eie tenk en resep. As water meng, sal alle vier gewasse verkeerde voedingstowwe kry. Hou alle verbindings waterdig.'),

    new Paragraph({ children: [new PageBreak()] }),
    afdelingsHoof('✅ Wat Jy Altyd Moet Doen (6 Reëls)'),
    bullet('Pomp 24/7 aan hou'),
    bullet('Pype op 2–3% helling hou'),
    bullet('Net een aanpassing op ‘n slag (EC óf pH)'),
    bullet('Watertemperatuur onder 24°C hou'),
    bullet('Tenke altyd toegemaak hou (verhoed alge en temperatuurstygings)'),
    bullet('Logboek elke dag invul'),
    spasie(),

    afdelingsHoof('❌ Wat Jy Nooit Mag Doen Nie (6 Reëls)'),
    bullet('Wortels volledig onder water laat lê (NFT = dunfilm, nie diep tenk nie)'),
    bullet('Afvoer laat blokkeer deur wortels (kontroleer weekliks)'),
    bullet('Verkeerde gewasse in stelsel plant'),
    bullet('Kante se water laat meng'),
    bullet('Plant sonder skoon stelsel'),
    bullet('Pomp afskakel as jy weggaan'),
    spasie(),

    afdelingsHoof('📋 Oggend Kontrolelys'),
    para('Elke oggend voor skool: 5 minute om die stelsel te kontroleer.'),
    hooftabel(
      ['Kontrole', 'Wat om te soek', 'Aksie as probleem'],
      [
        ['☐ Alle pompe loop?', 'Klink na stromende water', 'Herstel krag, gooi water deur pype'],
        ['☐ EC gemeet?', 'Binne reeks per gewas', 'Bo: voeg skoon water by. Onder: voeg voedingstof by'],
        ['☐ pH gemeet?', 'Binne reeks per gewas', 'Bo: pH-daler. Onder: pH-verhoger'],
        ['☐ Watertemperatuur?', 'Onder 24°C', 'Skadu, ysblokkie in tenk, dek tenk'],
        ['☐ Lekkasies?', 'Dröe vloer rondom stelsel', 'Identifiseer bron, herstel verbinding'],
        ['☐ Plante gesond?', 'Geen geel/verwelkte blare', 'Hoofstuk 6 vir diagnose'],
        ['☐ Logboek invul', 'Alle metings aangeteken', 'Datum, kant, EC, pH, temp, status'],
      ]
    ),
  ]
});

// ── HOOFSTUK 5 ───────────────────────────────────────────────
seksies.push({
  properties: {
    page: { size: { width: PW, height: PH }, margin: { top: MT, bottom: MB, left: ML, right: MR } }
  },
  footers: { default: voetbalk('Hoofstuk 5 — Monitering Logboek') },
  children: [
    ...hoofstukTitel(5, 'Monitering Logboek', 'Daaglikse EC, pH, TDS & Temp — 2x per dag'),

    afdelingsHoof('Weeklikse Logboek — Raam A Kant 1 (Slaai)'),
    infoBlok('🗒️ FOTOKOPIEËR HIERDIE BLADSY — Een vel per week per kant', LIG_Y, 'F9A825'),
    para('Teiken: EC 1.2–1.8 mS/cm · pH 5.8–6.2 · Watertemp 18–22°C · Tenk A'),
    spasie(),
    hooftabel(
      ['Meting', 'Teiken', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Sa', 'So'],
      [
        ['EC Oggend', '1.2–1.8 mS', '', '', '', '', '', '', ''],
        ['EC Aand', '1.2–1.8 mS', '', '', '', '', '', '', ''],
        ['TDS', '600–900 ppm', '', '', '', '', '', '', ''],
        ['pH Oggend', '5.8–6.2', '', '', '', '', '', '', ''],
        ['pH Aand', '5.8–6.2', '', '', '', '', '', '', ''],
        ['Watertemp', '18–22°C', '', '', '', '', '', '', ''],
        ['Status', 'OK / Ingryp', '', '', '', '', '', '', ''],
      ]
    ),
    spasie(),

    afdelingsHoof('Weeklikse Logboek — Raam A Kant 2 (Spinasie)'),
    para('Teiken: EC 1.8–2.3 mS/cm · pH 6.0–7.0 · Watertemp 18–22°C · Tenk B'),
    hooftabel(
      ['Meting', 'Teiken', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Sa', 'So'],
      [
        ['EC Oggend', '1.8–2.3 mS', '', '', '', '', '', '', ''],
        ['EC Aand', '1.8–2.3 mS', '', '', '', '', '', '', ''],
        ['pH Oggend', '6.0–7.0', '', '', '', '', '', '', ''],
        ['pH Aand', '6.0–7.0', '', '', '', '', '', '', ''],
        ['Watertemp', '18–22°C', '', '', '', '', '', '', ''],
        ['Status', 'OK / Ingryp', '', '', '', '', '', '', ''],
      ]
    ),

    new Paragraph({ children: [new PageBreak()] }),
    afdelingsHoof('Weeklikse Logboek — Raam B Kant 1 (Aarbeie)'),
    para('Teiken: EC 1.0–1.4 mS/cm · pH 5.5–6.0 · Watertemp 18–22°C · Tenk C'),
    hooftabel(
      ['Meting', 'Teiken', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Sa', 'So'],
      [
        ['EC Oggend', '1.0–1.4 mS', '', '', '', '', '', '', ''],
        ['EC Aand', '1.0–1.4 mS', '', '', '', '', '', '', ''],
        ['pH Oggend', '5.5–6.0', '', '', '', '', '', '', ''],
        ['pH Aand', '5.5–6.0', '', '', '', '', '', '', ''],
        ['Watertemp', '18–22°C', '', '', '', '', '', '', ''],
        ['Status', 'OK / Ingryp', '', '', '', '', '', '', ''],
      ]
    ),
    spasie(),
    afdelingsHoof('Weeklikse Logboek — Raam B Kant 2 (Mosterd Spinasie)'),
    para('Teiken: EC 1.6–2.0 mS/cm · pH 6.0–6.8 · Watertemp 18–22°C · Tenk D'),
    hooftabel(
      ['Meting', 'Teiken', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Sa', 'So'],
      [
        ['EC Oggend', '1.6–2.0 mS', '', '', '', '', '', '', ''],
        ['EC Aand', '1.6–2.0 mS', '', '', '', '', '', '', ''],
        ['pH Oggend', '6.0–6.8', '', '', '', '', '', '', ''],
        ['pH Aand', '6.0–6.8', '', '', '', '', '', '', ''],
        ['Watertemp', '18–22°C', '', '', '', '', '', '', ''],
        ['Status', 'OK / Ingryp', '', '', '', '', '', '', ''],
      ]
    ),

    new Paragraph({ children: [new PageBreak()] }),
    afdelingsHoof('Maandelikse Oorsig'),
    hooftabel(
      ['Week', 'Slaai EC', 'Slaai pH', 'Spinasie EC', 'Spinasie pH', 'Aarbeie EC', 'Aarbeie pH', 'Mosterd EC', 'Mosterd pH'],
      [
        ['Week 1', '', '', '', '', '', '', '', ''],
        ['Week 2', '', '', '', '', '', '', '', ''],
        ['Week 3', '', '', '', '', '', '', '', ''],
        ['Week 4', '', '', '', '', '', '', '', ''],
        ['Gemiddeld', '', '', '', '', '', '', '', ''],
      ]
    ),
    spasie(),
    afdelingsHoof('Oesrekord'),
    hooftabel(
      ['Datum', 'Gewas', 'Kant', 'Gewig (kg)', 'Kwaliteit', 'Notas'],
      [
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['TOTAAL', '', '', '', '', ''],
      ]
    ),
  ]
});

// ── HOOFSTUK 6 ───────────────────────────────────────────────
seksies.push({
  properties: {
    page: { size: { width: PW, height: PH }, margin: { top: MT, bottom: MB, left: ML, right: MR } }
  },
  footers: { default: voetbalk('Hoofstuk 6 — Probleemoplossing') },
  children: [
    ...hoofstukTitel(6, 'Probleemoplossing', 'Diagnoseer, verstaan en herstel enige NFT-probleem'),

    afdelingsHoof('EC Probleme — Vinnige Diagnosetabel'),
    hooftabel(
      ['Wat jy sien', 'Moontlike Oorsaak', 'Onmiddellike Aksie', 'Ernst'],
      [
        ['EC te hoog (>2.2)', 'Te veel voedingstof bygevoeg', 'Voeg skoon water by', '! Monitor'],
        ['EC bale hoog (>3.0)', 'Groot voedingstof-oorlading', 'Halveer die oplossing dadelik', '⚠ Dringend'],
        ['EC te laag (<1.0)', 'Voedingstof op, te veel water bygevoeg', 'Voeg voedingstof A+B by', '! Monitor'],
        ['EC skommel (>0.5 in 24u)', 'Plante drink baie, tenk klein', 'Vergroot tenk, voeg aanvullingswater by', '! Monitor'],
        ['EC styg elke dag', 'Plante neem water op maar nie al die voedingstowwe nie', 'Vervang 25–30% tenk weekliks', 'Normaal'],
      ]
    ),
    spasie(),

    afdelingsHoof('pH Probleme — Vinnige Diagnosetabel'),
    hooftabel(
      ['Wat jy sien', 'Moontlike Oorsaak', 'Onmiddellike Aksie'],
      [
        ['pH te hoog (>6.5 vir slaai)', 'Water is alkalies, nuwe voedingstof verhoog pH', 'Voeg pH-daler druppelsgewys by'],
        ['pH te laag (<5.5)', 'Te veel pH-daler bygevoeg, sekere voedingstowwe verlaag pH', 'Voeg pH-verhoger druppelsgewys by'],
        ['pH skommel wild', 'Alge-groei in tenk, bakteriële aktiwiteit', 'Maak tenk toe, spoel stelsel'],
      ]
    ),
    spasie(),

    afdelingsHoof('Plant Simptome — Diagnoseer & Herstel'),
    hooftabel(
      ['Wat jy sien', 'Oorsaak', 'Oplossing'],
      [
        ['Geel ou blare (onderste blare)', 'Stikstoftekort — EC te laag', 'Verhoog EC met A+B voedingstof'],
        ['Pers/rooi kleur op blaarstele en onderkant', 'Fosfaattekort — pH te laag of te hoog', 'Stel pH na 6.0–6.5'],
        ['Geel blare tussen are (are bly groen)', 'Yster/mangaan tekort — pH te hoog', 'Verlaag pH na 5.8–6.2'],
        ['Bruin blaarrante', 'Kalsiumtekort of tipbrand', 'Verbeter watervloei, verlaag EC effens'],
        ['Blare hang selfs al is water reg', 'Wortelvrot (Pythium)', 'Dreineer tenk, ontsmet, herplant'],
      ]
    ),

    new Paragraph({ children: [new PageBreak()] }),
    afdelingsHoof('Stelselfoute — Diagnose & Regmaak'),
    hooftabel(
      ['Probleem', 'Oorsaak', 'Regmaak Stappe', 'Tyd tot Skade'],
      [
        ['Pomp werk nie', 'Kragonderbreking, pomp gebrekkig', '1. Kyk kragbron. 2. Skoonmaak pompfilter. 3. Vervang pomp indien nodig', '⚠ Handel binne 30 min'],
        ['Lekkasie in pyp', 'Verbinding los, pyp gebreek', '1. Identifiseer bron. 2. Sit af pomp. 3. Droog. 4. PVC seelmiddel of klamp', 'Verlies van oplossing'],
        ['Tenk loop droog', 'Lekkasie, pomp te vinnig', '1. Sit pomp af. 2. Soek lekkasie. 3. Vul tenk met nuwe oplossing', '⚠ Handel binne 30 min'],
        ['Water vloei nie deur pyp', 'Wortels blokkeer pyp, sediment', '1. Kontroleer helling (moet 2–3% wees). 2. Spoel met druk. 3. Verwyder vrot wortels', 'Geleidelik — ure'],
        ['Alge groei in tenk', 'Lig bereik die water', '1. Maak tenk volledig toe met swart plastiek. 2. Spoel stelsel. 3. Vervang oplossing', 'Dae — pH onstabiliteit'],
      ]
    ),
    spasie(),

    afdelingsHoof('🚨 Noodprosedures'),
    sub('🔴 Kragonderbreking > 2 uur'),
    bullet('Gooi onmiddellik 5–10 L water (met voedingstof) deur elke pyp — wortels begin sterf na 30 min sonder vloei'),
    bullet('Herhaal elke 5–7 minute — hou ‘n gevulde emmer by die stelsel sodat jy vinnig kan optree'),
    bullet('Dek plante met skadu-doek om verdamping te verminder en worteltemperatuur laag te hou'),
    bullet('Sodra krag terug is — pomp aan en EC/pH onmiddellik meet; inspekteer wortels vir bruin verkluring'),
    spasie(),
    sub('🔴 Wortelvrot Uitbraak'),
    bullet('Verwyder alle plante dadelik — ook oenskynlik gesonde plante is latente draers'),
    bullet('Sit pomp af, dreineer tenk volledig'),
    bullet('Spoel pype met 3% waterstofperoksied-oplossing'),
    bullet('Vul tenk met vars oplossing en begin oplaas'),
    spasie(),

    afdelingsHoof('Weeklikse Voorkomingsplan'),
    hooftabel(
      ['Daagliks', 'Weekliks', 'Maandeliks', 'Per Siklus'],
      [
        ['☐ EC, TDS & pH kontroleer\n☐ Plante visueel kyk\n☐ Pompe werk?\n☐ Lekkasies?',
         '☐ Wortels inspekteer\n☐ Tenk vlak kontroleer\n☐ Pype skoonmaak\n☐ Logboek voltooi',
         '☐ Volle tenk vervang\n☐ Filters skoonmaak\n☐ Pomp inspeksie\n☐ Voedingstof bestel',
         '☐ Pype volledig spoel\n☐ Waterstofperoksied-sterilisasie\n☐ Netpotte nuut\n☐ Stelsel inspeksie']
      ]
    ),
    spasie(),

    afdelingsHoof('Vinnige Verwysing — EC & pH per Kant'),
    hooftabel(
      ['Kant', 'Gewas', 'EC (mS/cm)', 'pH', 'Tenk', 'Pomp'],
      [
        ['Raam A Kant 1', '🥬 Slaai', '1.2 – 1.8', '5.8 – 6.2', 'A', '1'],
        ['Raam A Kant 2', '🌱 Spinasie', '1.8 – 2.3', '6.0 – 7.0', 'B', '2'],
        ['Raam B Kant 1', '🍓 Aarbeie', '1.0 – 1.4', '5.5 – 6.0', 'C', '3'],
        ['Raam B Kant 2', '🌿 Mosterd Spinasie', '1.6 – 2.0', '6.0 – 6.8', 'D', '4'],
      ]
    ),
  ]
});

// ── AANHANGSELS ─────────────────────────────────────────────
seksies.push({
  properties: {
    page: { size: { width: PW, height: PH }, margin: { top: MT, bottom: MB, left: ML, right: MR } }
  },
  footers: { default: voetbalk('Aanhangsels') },
  children: [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 0, after: 200 },
      children: [new TextRun({ text: 'Aanhangsels', font: 'Arial', size: 48, bold: true, color: '1b3a1b' })] }),

    afdelingsHoof('Aanhangsel A — Veiligheidsprotokol'),
    infoBlok('⚠️ Belangrik vir onderwysers: Hierdie protokol moet gelees en bespreek word met alle leerders voor hulle enige chemikalië hanteer.', LIG_R, ROOI),
    spasie(),
    sub('🧪 pH-Daler (Fosforsuur, ~10%) — ⚠️ SUUR — VERSIGTIG'),
    bullet('Gevaar: Brand op vel en oë. Skadelik as ingeasem.'),
    bullet('Beskermtoerusting: Veiligheidsbril + rubber handskoene + voorskoot'),
    bullet('Noodprosedure: Oë/vel: spoel 15 min met skoon water. Stel ‘n onderwyser in kennis.'),
    infoBlok('Goue Reël: Voeg suur by water — NOOIT water by suur nie. Voeg druppelsgewys by, roer na elke byvoeging.', LIG_Y, GEEL),
    spasie(),
    sub('🧫 pH-Verhoger (Kaliumhidroksied, ~5%) — ⚠️ BASIS — VERSIGTIG'),
    bullet('Gevaar: Bytend op vel en oë. Hou weg van suur.'),
    bullet('Beskermtoerusting: Veiligheidsbril + rubber handskoene + voorskoot'),
    bullet('Noodprosedure: Oë/vel: spoel 15 min met skoon water.'),
    infoBlok('Goue Reël: Voeg ook druppelsgewys by. Hou pH-daler en pH-verhoger altyd apart — meng NOOIT die twee saam nie.', LIG_Y, GEEL),
    spasie(),
    sub('🌿 Voedingstof A & B — &#9432; Laer Risiko'),
    bullet('Kan vel en oë irriteer in gekonsentreerde vorm. Moenie drink nie.'),
    bullet('Beskermtoerusting: Rubber handskoene aanbeveel'),
    bullet('Noodprosedure: Vel/oë: spoel met water.'),
    infoBlok('Goue Reël: Voeg A eers by water, roer goed, dan eers B. Meng NOOIT A en B direk saam sonder water nie.', LIG_Y, GEEL),
    spasie(),
    sub('Berging & Noodinligting'),
    bullet('Berg chemikalië in ‘n geslote, geventileerde kas — weg van sonlig en hitte'),
    bullet('Etikette altyd leesbaar — nooit in kosdrankhousies herberg nie'),
    bullet('Nasionale Noodlyn: 📞 10177 (Ambulans) / 112 (selfoon)'),

    new Paragraph({ children: [new PageBreak()] }),
    afdelingsHoof('Aanhangsel B — Glossarium'),
    hooftabel(
      ['Term', 'Engels', 'Verduideliking'],
      [
        ['NFT', 'Nutrient Film Technique', 'Voedingstoffilm-tegniek. ‘n Metode waar ‘n dun stroom voedingstofryke water deur gekantelde pype vloei. Wortels hang in dié film.'],
        ['EC', 'Electrical Conductivity', 'Elektriese geleidingsvermoë. Meet hoeveel opgeloste minerale in die water is. Gemeet in mS/cm.'],
        ['pH', 'Potential of Hydrogen', 'Skaal 0–14 wat meet hoe suur of alkalies die water is. 7 = neutraal.'],
        ['TDS', 'Total Dissolved Solids', 'Totale opgeloste vastestowwe in water. Gemeet in ppm. TDS en EC meet dieselfde ding.'],
        ['ppm', 'Parts per Million', 'Dele per miljoen. Eenheid vir TDS-metings.'],
        ['Pythium', 'Root rot fungus', 'Wortelvrot-skimmel. Groei vinnig in warm water (>22°C). Tekens: bruin, slymrige wortels.'],
        ['Stoelon', 'Runner / Stolon', 'Lang dun stingel wat ‘n moeder-aarbeieplant uitstuur. Gebruik om aarbeie te vermeerder.'],
        ['Saadskiet', 'Bolting', 'Wanneer ‘n plant onverwags blom as gevolg van hitte of lang daglengte. Slaai, spinasie en mosterd spinasie word bitter.'],
        ['Oorplantingskok', 'Transplant shock', 'Tydelike stres nadat ‘n plant verskuif is. Tekens: hangblare vir 24–72 uur. Normaal.'],
        ['Tipbrand', 'Tipburn', 'Bruin, verdroogde blaarrante op jong blare. Kalsiumtekort of swak watervloei.'],
        ['Voedingstofblokkasie', 'Nutrient lockout', 'Wanneer die pH verhoed dat die plant voedingstowwe absorbeer al is EC reg.'],
        ['Rokwol', 'Rockwool', 'Groeimiddel gemaak van gespinde rotsvesels. pH-neutraal en steriel.'],
        ['Perliet', 'Perlite', 'Uitgeblaasde vulkaniese glas. Ligte, poreuse wit korrels. Chemies inert.'],
        ['Wortelvrot', 'Root rot', 'Verrotting van plantewortels as gevolg van siekte organismes (gewoonlik Pythium).'],
        ['Alkalies', 'Alkaline / Basic', 'Water met ‘n pH bo 7. Verlaag met pH-daler (fosforsuur).'],
      ]
    ),

    new Paragraph({ children: [new PageBreak()] }),
    afdelingsHoof('Aanhangsel C — Vinnige Verwysingskaart (Lamineer)'),
    infoBlok('🗒️ Sny hierdie bladsy uit en lamineer dit — plak by die stelsel vir vinnige verwysing tydens daaglikse monitering.', LIG_G, GROEN),
    spasie(),
    hooftabel(
      ['Kant', 'Gewas', 'EC', 'pH', 'Temp', 'Tenk', 'Pomp'],
      [
        ['Raam A Kant 1', 'Slaai', '1.2–1.8', '5.8–6.2', '18–22°C', 'A', '1'],
        ['Raam A Kant 2', 'Spinasie', '1.8–2.3', '6.0–7.0', '18–22°C', 'B', '2'],
        ['Raam B Kant 1', 'Aarbeie', '1.0–1.4', '5.5–6.0', '18–22°C', 'C', '3'],
        ['Raam B Kant 2', 'Mosterd', '1.6–2.0', '6.0–6.8', '18–22°C', 'D', '4'],
      ]
    ),
    spasie(),
    hooftabel(
      ['Oggend Kontrole', 'Noodprosedure', 'Sleutelreëls'],
      [
        ['☐ Alle pompe loop?\n☐ EC meet per kant\n☐ pH meet per kant\n☐ Watertemperatuur\n☐ Lekkasies?\n☐ Plante gesond?\n☐ Logboek invul',
         'Pomp stop:\n→ Gooi 5–10L water deur elke pyp\n→ Herstel pomp binne 30 min\n\nWortelvrot:\n→ Dreineer tenk dadelik\n→ Ontsmet met H₂O₂ (3%)\n→ Kontak onderwyser',
         '⏱ Pomp: 24/7 aan\n🌡 Water: maks 24°C\n🧪 EC: een aanpassing op ‘n slag\n💧 Voedingstof: A dan B\n🔒 Tenk: altyd toe\n📅 Skoonmaak: 4–6 weke']
      ]
    ),
  ]
});

// ── BOUSTUK DOKUMENT ─────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [{
      reference: 'bullets',
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: '•',
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    }]
  },
  styles: {
    default: {
      document: { run: { font: 'Arial', size: 22 } },
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 48, bold: true, font: 'Arial', color: '1b3a1b' },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 }
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: GROEN },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 }
      },
    ]
  },
  sections: seksies
});

Packer.toBuffer(doc).then(buffer => {
  const uitset = path.join(BASE, 'GroeiGids_Volledig.docx');
  fs.writeFileSync(uitset, buffer);
  console.log(`\nKLAAR! Leer gestoor: ${uitset}`);
  console.log(`Grootte: ${(buffer.length / 1024 / 1024).toFixed(1)} MB`);
});
