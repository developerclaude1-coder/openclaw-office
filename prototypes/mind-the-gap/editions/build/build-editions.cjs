/* Build the Israel and US editions of Mind the Gap from locale data + coastlines. */
const fs = require('fs');
const path = require('path');
const HERE = __dirname;
const OUT = path.join(HERE, '..');

/* Each edition ships its own coastline, clipped to its region and encoded at a
   precision that holds up at country zoom. Israel is small, so it gets Natural
   Earth 10m at 1/200 degree; the US box is far larger, so 50m at 1/100 is
   plenty and much lighter. See clip-region.cjs. */
const LAND_FOR = {
  il: 'land-il.txt',
  us: 'land-us.txt',
};
const TPL = fs.readFileSync(path.join(HERE, 'edition.template.html'), 'utf8');
const ASOF = process.argv[2] || 'November 2026';

/* Type stacks per locale. The Figma spec names the licensed faces
   (Canela / Suisse Int'l, Frank Ruhl Libre / Heebo for Hebrew); the HTML
   build uses system equivalents so the page stays self-contained with no
   webfont request and no silent fallback. */
const TYPE = {
  en: {
    serif: `ui-serif,"Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif`,
    sans: `system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif`,
  },
  he: {
    serif: `"Frank Ruhl Libre","Narkisim","Times New Roman",ui-serif,Georgia,serif`,
    sans: `"Heebo","Assistant","Arial Hebrew","Noto Sans Hebrew",system-ui,-apple-system,Arial,sans-serif`,
  },
};

/* Scale-band names for the resolution instrument, per locale. `short` is the
   dial tick, `full` the HUD readout. Hebrew gets Hebrew bands — the dial also
   runs right-to-left there, so the cosmos end sits under the reading start. */
const BAND_NAMES = {
  he: [
    { short: 'יקום', full: 'יקום' },
    { short: 'אזור', full: 'אזור' },
    { short: 'עיר', full: 'עיר' },
    { short: 'מוסד', full: 'מוסד' },
    { short: 'אמן', full: 'אמן' },
    { short: 'יצירה', full: 'יצירה' },
    { short: 'חומר', full: 'חומר' },
  ],
  en: [
    { short: 'COSM', full: 'COSMOS' },
    { short: 'REGI', full: 'REGION' },
    { short: 'CITY', full: 'CITY' },
    { short: 'INST', full: 'INSTITUTION' },
    { short: 'ARTI', full: 'ARTIST' },
    { short: 'WORK', full: 'WORK' },
    { short: 'MATT', full: 'MATTER' },
  ],
};

/* The instrument's scale-band captions, per locale. */
const BAND_CAPS = {
  he: [
    'כל השדה — כל הסצנות בבת אחת.',
    'מרכזי אמנות והנתיבים ביניהם.',
    'רובעי גלריות והאנשים שנעים ביניהם.',
    'מוזיאון, הקירות שלו, התוכנית שלו.',
    'סטודיו אחד — פרקטיקה שמתגבשת.',
    'יצירה אחת, מול האור.',
    'פיגמנט, בד, מחווה — עד לאטום.',
  ],
  en: [
    'The whole field — every scene, at once.',
    'Art capitals and the routes between them.',
    'Gallery districts and the people who move between them.',
    'A museum, its walls, its programme.',
    'One studio — a practice taking shape.',
    'A single work, held to the light.',
    'Pigment, canvas, gesture — down to the atom.',
  ],
};

function build(id) {
  const L = JSON.parse(fs.readFileSync(path.join(HERE, 'locales', id + '.json'), 'utf8'));
  L.bandCaps = BAND_CAPS[L.lang];
  L.bandNames = BAND_NAMES[L.lang];

  const T = L.strings;
  const title = L.lang === 'he'
    ? 'מיינד ד׳ה גאפ — ' + T.brandSub
    : 'Mind the Gap — ' + T.brandSub;

  let html = TPL
    .replace(/__LANG__/g, L.lang)
    .replace(/__DIR__/g, L.dir)
    .replace(/__TITLE__/g, title)
    .replace(/__DESC__/g, T.heroLede)
    .replace(/__EDITION__/g, L.name)
    .replace(/__EDITION_CODE__/g, id.toUpperCase())
    .replace(/__ALT_HREF__/g, L.altEdition.href)
    .replace(/__ALT_LABEL__/g, L.altEdition.label)
    .replace(/__SERIF__/g, TYPE[L.lang].serif)
    .replace(/__SANS__/g, TYPE[L.lang].sans)
    .replace(/__ASOF__/g, ASOF);

  // string placeholders __S_key__
  html = html.replace(/__S_([A-Za-z0-9_]+)__/g, (m, k) => {
    if (!(k in T)) throw new Error(`[${id}] missing string: ${k}`);
    return String(T[k]).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  });

  const land = fs.readFileSync(path.join(HERE, LAND_FOR[id]), 'utf8').trim();
  html = html.replace('__LOCALE__', JSON.stringify(L)).replace('__LAND__', land);

  const leftover = html.match(/__[A-Z_]+__/g);
  if (leftover) throw new Error(`[${id}] unreplaced placeholders: ${[...new Set(leftover)].join(', ')}`);

  const dir = path.join(OUT, id);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'index.html');
  fs.writeFileSync(file, html);

  const acc = {};
  L.commissions.forEach((c) => { acc[c.access] = (acc[c.access] || 0) + 1; });
  const types = {};
  L.places.forEach((p) => { types[p.type] = (types[p.type] || 0) + 1; });
  console.log(
    `${id.toUpperCase()}  ${L.dir.toUpperCase()}/${L.lang}  ` +
    `places=${L.places.length} ${JSON.stringify(types)}  ` +
    `commissions=${L.commissions.length} ${JSON.stringify(acc)}  ` +
    `residencies=${L.residencies.length}  ${(html.length / 1024).toFixed(0)}KB  -> ${path.relative(OUT, file)}`
  );
}

['il', 'us'].forEach(build);
console.log('as of:', ASOF);
