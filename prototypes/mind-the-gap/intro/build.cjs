/* Build the Mind the Gap intro: one self-contained page from src/.
 *
 *   node build.cjs                      -> ./index.html
 *   node build.cjs --artifact --out=F   -> F, body-only, with links laid out for
 *                                          a published multi-page artifact
 *
 * Everything the page says in numbers is counted here from the same datasets
 * the world index and the editions are built from, so the copy cannot drift
 * from the data.
 */
const fs = require('fs');
const path = require('path');
const HERE = __dirname;
const ROOT = path.join(HERE, '..');
const { fontFaceCss, STACKS } = require('../shared/fonts/fonts.cjs');

const argv = process.argv.slice(2);
const ARTIFACT = argv.includes('--artifact');
const outArg = (argv.find((a) => a.startsWith('--out=')) || '').slice(6);
const OUT = outArg || path.join(HERE, 'index.html');

const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const json = (...p) => JSON.parse(read(...p));
const src = (f) => read(HERE, 'src', f);

/* ---------- institutions: the one dataset, as the atlas needs it ---------- */
const DATASET = require('../build/dataset.cjs');
const { REGIONS, COUNTRY_EDITIONS, DIRECTORY } = require('../shared/regions.cjs');
const il = json(ROOT, 'editions', 'build', 'locales', 'il.json');
const us = json(ROOT, 'editions', 'build', 'locales', 'us.json');

/* Hong Kong is counted, and shown, as the source frames it: under China. */
const places = DATASET.places.map((p) => ({
  n: p.name, c: p.city, k: p.country === 'Hong Kong' ? 'China' : p.country, t: p.type, o: p.note,
  ...(p.he ? { nh: p.he.name, ch: p.he.city, kh: p.he.country, oh: p.he.note } : {}),
  lon: p.lon, lat: p.lat, ...(p.edition ? { ed: p.edition } : {}),
}));

/* Outside the Israel edition the data is English only. The atlas still has to
   read as Hebrew, so cities and countries are named from a small dictionary;
   institution names keep their own script, as they do in Hebrew print. */
const HE = json(HERE, 'src', 'places-he.json');
const untranslated = new Set();
for (const p of places) {
  if (p.ch && p.kh) continue;
  p.ch = HE.cities[p.c]; p.kh = HE.countries[p.k];
  if (!p.ch) untranslated.add('city "' + p.c + '"');
  if (!p.kh) untranslated.add('country "' + p.k + '"');
}
if (untranslated.size) throw new Error('places-he.json has no Hebrew for: ' + [...untranslated].join(', '));

for (const p of places) {
  if (!p.n || !p.c || !p.k || !p.t) throw new Error('incomplete place: ' + JSON.stringify(p));
  if (!(p.lat >= -90 && p.lat <= 90 && p.lon >= -180 && p.lon <= 180)) throw new Error('bad coordinates: ' + p.n);
  p.lon = +p.lon.toFixed(4); p.lat = +p.lat.toFixed(4);
}
/* Grouped by kind, then west to east. On the arrival ring this turns the
   institutions into three arcs whose lengths are the real proportions. */
const ORDER = { Museum: 0, Gallery: 1, Biennial: 2 };
places.sort((a, b) => ORDER[a.t] - ORDER[b.t] || a.lon - b.lon);

/* ---------- counts ---------- */
const byType = (t) => places.filter((p) => p.t === t).length;
const inRegion = (list, r) => list.filter((x) => x.region === r.name).length;
const N = {
  N: places.length, M: byType('Museum'), G: byType('Gallery'), B: byType('Biennial'),
  K: new Set(places.map((p) => p.k)).size,
  /* the listings every page shares, plus Israel's, which exist in Hebrew only */
  C: DATASET.commissions.length + il.commissions.length,
  R: DATASET.residencies.length + il.residencies.length,
  ILC: il.commissions.length, ILR: il.residencies.length,
  USC: us.commissions.length, USR: us.residencies.length,
  WC: DATASET.commissions.length, WR: DATASET.residencies.length,
  RG: REGIONS.length, CE: COUNTRY_EDITIONS.length,
};

/* ---------- real entries for the exhibits ---------- */
const searchIdx = places.findIndex((p) => /zeitz/i.test(p.n));
const ilCard = il.commissions.find((c) => c.access === 'open call' && /הפיס/.test(c.org));
const usCard = us.commissions.find((c) => c.name === 'Midnight Moment');
if (searchIdx < 0 || !ilCard || !usCard) throw new Error('an exhibit sample is missing from the data');
const DATA = {
  places,
  /* the six regions: where each one's name sits on the map, and its frame */
  regions: REGIONS.map((r) => ({ id: r.id, n: r.name, h: r.he, l: r.label, b: r.bounds })),
  countries: COUNTRY_EDITIONS.map((c) => ({ id: c.id, b: c.bounds })),
  grid: read(ROOT, 'shared', 'region-grid.txt').trim(),
  sample: {
    searchIdx,
    il: { name: ilCard.name, org: ilCard.org },
    us: { name: usCard.name, org: usCard.org + ' — ' + usCard.city },
  },
};

/* ---------- copy ---------- */
const STR = json(HERE, 'src', 'strings.json');
const keysEn = Object.keys(STR.en).sort(), keysHe = Object.keys(STR.he).sort();
if (keysEn.join() !== keysHe.join()) {
  const miss = keysEn.filter((k) => !(k in STR.he)).concat(keysHe.filter((k) => !(k in STR.en)));
  throw new Error('strings.json: en and he differ on: ' + miss.join(', '));
}
const fill = (v) => typeof v !== 'string' ? v : v.replace(/\{([A-Z]+)\}/g, (m, k) => {
  if (!(k in N)) throw new Error('unknown number in copy: ' + m);
  return String(N[k]);
});

/* ---------- the doors ---------- */
/* One for the world index and one for every edition, in the order the menus
   use: each region, then any country edition inside it. A region's name and
   numbers are not written in strings.json; they come from the data. */
const LINKS = ARTIFACT
  ? { world: 'world/index.html', editions: 'editions/', project: 'project/index.html' }
  : { world: '../index.html', editions: '../editions/', project: '../project/index.html' };
const hrefOf = (id) => (LINKS[id] || LINKS.editions + id + '/index.html') + '#via-intro';
const COUNTRY_KEY = { il: 'IL', us: 'US' };
for (const lang of Object.keys(STR)) {
  const meta = STR[lang].doorRegionMeta;
  for (const r of REGIONS) {
    STR[lang]['door_' + r.id] = lang === 'he' ? r.he : r.name;
    STR[lang]['door_' + r.id + '_m'] = meta
      .replace('{c}', inRegion(DATASET.commissions, r)).replace('{r}', inRegion(DATASET.residencies, r));
  }
  delete STR[lang].doorRegionMeta;
}
/* hreflang says which language the page behind a door is written in, and the
   door shows it whenever that is not the language you are reading */
const door = (cls, href, key, metaKey, attrs) => '<a class="door ' + cls + '" href="' + href + '"' + (attrs || ' hreflang="en"') + '>'
  + '<b data-i18n="' + key + '">{{' + key + '}}</b><span data-i18n="' + metaKey + '">{{' + metaKey + '}}</span></a>';
/* The project's door hangs under the world index's: the plan, the decks and
   the campaign, in English. It opens no part of the map, so it frames nothing. */
const DOORS = [
  door('door--world', hrefOf('world'), 'doorWorld', 'doorWorldMeta'),
  door('door--project', hrefOf('project'), 'doorProject', 'doorProjectMeta', ' hreflang="en" style="--col:1"'),
].concat(DIRECTORY.map((d) => {
  const frame = ' hreflang="' + d.lang + '" data-frame="' + d.bounds.join(',') + '"';   // the frame is what the map shows while you point at the door
  if (d.kind === 'region') return door('door--region', hrefOf(d.id), 'door_' + d.id, 'door_' + d.id + '_m', frame);
  /* a country edition hangs under its region: column 1 is the world index */
  const col = 2 + REGIONS.findIndex((r) => r.id === d.region), K = COUNTRY_KEY[d.id];
  return door('door--country', hrefOf(d.id), 'door' + K, 'door' + K + 'Meta', frame + ' style="--col:' + col + '"');
})).join('\n        ');

for (const lang of Object.keys(STR)) for (const k of Object.keys(STR[lang])) STR[lang][k] = fill(STR[lang][k]);

/* ---------- assemble ---------- */
const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/* U+2028 and U+2029 are valid in JSON but end a line inside a script, so they
   are escaped along with '<'. Built with fromCharCode so this source never
   contains the raw characters itself. */
const LS = String.fromCharCode(0x2028), PS = String.fromCharCode(0x2029);
const safeJson = (o) => JSON.stringify(o).replace(/</g, '\\u003c')
  .split(LS).join('\\u2028').split(PS).join('\\u2029');

const SOURCES = ['engine.js', 'scenes.js', 'atlas.js', 'chapters.js', 'main.js'];
const css = (src('styles.css') + '\n' + src('app.css'))
  .replace('__SERIF__', STACKS.serif).replace('__SANS__', STACKS.sans).replace('__MONO__', STACKS.mono);
const LAND = read(ROOT, 'shared', 'land-world-50.txt').trim();
const js = '(function(){"use strict";\n' +
  'var DATA=' + safeJson(DATA) + ';\nvar STR=' + safeJson(STR) + ';\nvar LAND="' + LAND + '";\n' +
  SOURCES.map(src).join('\n') + '\n})();';

let html = src('index.template.html')
  .replace('<!--__DOORS__-->', () => DOORS)
  .replace(/\{\{([A-Za-z0-9_-]+)\}\}/g, (m, k) => {
    if (!(k in STR.en)) throw new Error('template uses an unknown string: ' + k);
    return escHtml(STR.en[k]);                      // English is the resting state; the script swaps it
  })
  .replace('/*__FONTS__*/', () => fontFaceCss())
  .replace('/*__CSS__*/', () => css)
  .replace('/*__JS__*/', () => js);

const left = html.match(/__[A-Z_]{3,}__|\{\{[A-Za-z0-9_-]+\}\}/g);
if (left) throw new Error('unreplaced placeholders: ' + [...new Set(left)].join(', '));

if (ARTIFACT) {
  /* A published artifact supplies its own document shell, so ship the title,
     the style and the body only. */
  const title = html.match(/<title>[\s\S]*?<\/title>/)[0];
  const style = html.slice(html.indexOf('<style>'), html.indexOf('</style>') + 8);
  const body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
  html = title + '\n<meta name="claude:viewport-fit-sides" content="cover">\n' + style + '\n' + body.trim() + '\n';
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);

/* ---------- report ---------- */
const lines = (f) => src(f).split('\n').length;
const over = SOURCES.concat(['styles.css', 'app.css', 'index.template.html']).filter((f) => lines(f) > 500);
console.log('institutions ' + N.N + ' (' + N.M + ' museums, ' + N.G + ' galleries, ' + N.B + ' biennials) in ' + N.K + ' countries');
console.log('commissions  ' + N.C + '  = ' + N.WC + ' in the shared dataset + ' + N.ILC + ' in the Israel edition');
console.log('residencies  ' + N.R + '  = ' + N.WR + ' in the shared dataset + ' + N.ILR + ' in the Israel edition');
console.log('regions      ' + REGIONS.map((r) => r.code + ' ' + inRegion(DATASET.commissions, r) + '/' + inRegion(DATASET.residencies, r) + '/' + inRegion(DATASET.places, r)).join('  '));
console.log('strings      ' + keysEn.length + ' keys, en/he in step');
console.log('source lines ' + SOURCES.concat(['styles.css', 'app.css']).map((f) => f + ':' + lines(f)).join('  '));
if (over.length) console.log('WARNING over 500 lines: ' + over.join(', '));
console.log((ARTIFACT ? 'artifact  ' : 'page      ') + path.relative(ROOT, OUT) + '  ' + (html.length / 1024).toFixed(0) + ' KB');
