/* Build every edition of Mind the Gap: the six regions, cut from the shared
   dataset, and the country editions written in their own locale files. */
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
/* A region is too large for that: it carries the world coastline the intro
   uses, and the page draws it as a curve so it stays soft when zoomed in. */
const LAND_WORLD = path.join(HERE, '..', '..', 'shared', 'land-world-50.txt');
/* the page is kept as three files, markup, stylesheet and script, and put together here */
const part = (f) => fs.readFileSync(path.join(HERE, f), 'utf8');
const TPL = part('edition.template.html')
  .replace('/*__CSS__*/', () => part('edition.css').replace(/\n$/, ''))
  .replace('/*__JS__*/', () => part('edition.js').replace(/\n$/, ''));
const { fontFaceCss, STACKS } = require('../../shared/fonts/fonts.cjs');
const { DIRECTORY } = require('../../shared/regions.cjs');
const { regionLocale, REGION_IDS } = require('./regions.cjs');

/*   node build-editions.cjs ["November 2026"]            -> ../<edition>/index.html, eight of them
 *   node build-editions.cjs --artifact --out=DIR         -> DIR/<edition>/index.html, linked for a
 *                                                           published multi-page artifact */
const argv = process.argv.slice(2);
const ARTIFACT = argv.includes('--artifact');
const outArg = (argv.find((a) => a.startsWith('--out=')) || '').slice(6);
const OUT_DIR = outArg || OUT;
const ASOF = argv.find((a) => !a.startsWith('--')) || 'November 2026';

/* Where the other pages live, seen from <edition>/index.html. In the repo the
   intro sits beside the editions; published, the intro is the root page and
   the world index moves under world/. */
const LINKS = ARTIFACT
  ? { intro: '../../index.html', world: '../../world/index.html' }
  : { intro: '../../intro/index.html', world: '../../index.html' };
/* the project and support pages sit at the top level in both layouts */
Object.assign(LINKS, { project: '../../project/index.html', support: '../../support/index.html' });

/* One type system across the intro and every edition: Frank Ruhl Libre,
   Heebo and JetBrains Mono, embedded in the page so nothing is fetched and
   nothing falls back by accident. Both faces cover Latin and Hebrew, so the
   two editions are set in the same voice. See shared/fonts. */
const HEBREW = /[\u0590-\u05FF]/;

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

/* ---------- the way between editions ---------- */
const escHtml = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hrefTo = (to) => to === 'world' ? LINKS.world : to === 'intro' ? LINKS.intro : '../' + to + '/index.html';

/* Every edition, listed the same way in the menu and in the footer. A page
   written in another language than the one you are reading says so. */
function editionLinks(currentId, L) {
  const he = L.lang === 'he';
  const other = (lang) => lang === L.lang ? '' : ' <span class="ed-lang">' + (lang === 'he' ? 'עברית' : 'EN') + '</span>';
  const rows = [{ to: 'world', cls: 'world', label: L.strings.footWorld, lang: 'en' }]
    .concat(DIRECTORY.map((d) => ({ to: d.id, cls: d.kind, label: he ? d.he : d.name, lang: d.lang })));
  return rows.map((r) => '<a class="' + r.cls + '" href="' + hrefTo(r.to) + '"'
    + (r.to === currentId ? ' aria-current="page"' : '') + '>' + '<span>' + escHtml(r.label) + '</span>' + other(r.lang) + '</a>').join('');
}

function build(id) {
  const region = REGION_IDS.includes(id);
  const L = region ? regionLocale(id) : JSON.parse(fs.readFileSync(path.join(HERE, 'locales', id + '.json'), 'utf8'));
  L.bandCaps = BAND_CAPS[L.lang];
  for (const way of ['down', 'up']) L.doors[way] = L.doors[way].map(({ to, ...d }) => ({ ...d, href: hrefTo(to) }));

  /* The collector layer is global: artists and opportunities are gated by
     nationality and residency, a collector's problems are not. Every edition
     shares the same collector content and the same global market facts, and
     only genuinely jurisdiction-bound facts (the resale right, how public
     commissioning is funded) come from the locale. */
  const G = JSON.parse(fs.readFileSync(path.join(HERE, 'locales', '_collector-global.json'), 'utf8'));
  const pick = (entry) => ({ ...entry[L.lang], confidence: entry.confidence, sourceUrl: entry.sourceUrl });
  L.collectorNeeds = G.collectorNeeds.map(pick);
  L.gapFacts = G.gapFactsGlobal.map(pick).concat(
    (L.jurisdictionFacts || []).map((j) => ({ ...j, local: true }))
  );
  L.globalCollectorCount = G.collectorNeeds.length;
  L.localFactCount = (L.jurisdictionFacts || []).length;
  L.bandNames = BAND_NAMES[L.lang];

  const T = L.strings;
  const title = L.title || (L.lang === 'he'
    ? 'מיינד ד׳ה גאפ — ' + T.brandSub
    : 'Mind the Gap — ' + T.brandSub);
  const links = editionLinks(id, L);

  let html = TPL
    .replace(/__LANG__/g, L.lang)
    .replace(/__DIR__/g, L.dir)
    .replace(/__TITLE__/g, title)
    .replace(/__DESC__/g, T.heroLede)
    .replace(/__EDITION__/g, L.name)
    .replace(/__EDITION_NAME__/g, (DIRECTORY.find((d) => d.id === id) || {})[L.lang === 'he' ? 'he' : 'name'] || L.name)
    .replace(/__EDITION_CODE__/g, L.code || id.toUpperCase())
    .replace(/__EDITION_LINKS__/g, () => links)
    .replace(/__SERIF__/g, STACKS.serif)
    .replace(/__SANS__/g, STACKS.sans)
    .replace(/__MONO__/g, STACKS.mono)
    .replace(/__HREF_INTRO__/g, LINKS.intro)
    .replace(/__HREF_WORLD__/g, LINKS.world)
    .replace(/__HREF_PROJECT__/g, LINKS.project)
    .replace(/__HREF_SUPPORT__/g, LINKS.support)
    /* those two pages are in English; a page in another language says so, as
       its edition menu does. Filled before the strings, which it sits against. */
    .replace(/__EN_TAG__/g, L.lang === 'en' ? '' : ' <span class="ed-lang">EN</span>')
    .replace(/__ASOF__/g, ASOF);

  // string placeholders __S_key__
  html = html.replace(/__S_([A-Za-z0-9_]+)__/g, (m, k) => {
    if (!(k in T)) throw new Error(`[${id}] missing string: ${k}`);
    return String(T[k]).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  });

  /* cityEn / noteEn exist for the intro's world atlas; this page never reads them */
  L.places = L.places.map(({ cityEn, noteEn, ...p }) => p);

  const land = fs.readFileSync(LAND_FOR[id] ? path.join(HERE, LAND_FOR[id]) : LAND_WORLD, 'utf8').trim();
  html = html.replace('__LOCALE__', () => JSON.stringify(L)).replace('__LAND__', () => land);
  /* the Hebrew subsets are only shipped to a page that has Hebrew on it */
  html = html.replace('/*__FONTS__*/', () => fontFaceCss({ latin: true, hebrew: HEBREW.test(html) }));

  const leftover = html.match(/__[A-Z_]+__/g);
  if (leftover) throw new Error(`[${id}] unreplaced placeholders: ${[...new Set(leftover)].join(', ')}`);

  const dir = path.join(OUT_DIR, id);
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

REGION_IDS.concat(['il', 'us']).forEach(build);
console.log('as of:', ASOF);
