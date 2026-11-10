/* Assemble the Mind the Gap world index from the verified dataset + Natural Earth coastlines. */
const fs = require('fs');
const path = require('path');
const HERE = __dirname;
const DATA = require('./dataset.cjs');
const { commissions, residencies, places } = DATA;

/* ---- inject ----
 *   node build.cjs ["November 2026"] [out.html]      -> ../index.html
 *   node build.cjs --artifact --out=FILE             -> FILE, linked for a published multi-page
 *                                                       artifact, where this page lives at world/
 */
const { fontFaceCss, STACKS } = require('../shared/fonts/fonts.cjs');
const argv = process.argv.slice(2);
const ARTIFACT = argv.includes('--artifact');
const positional = argv.filter((a) => !a.startsWith('--'));
const outArg = (argv.find((a) => a.startsWith('--out=')) || '').slice(6);
const LINKS = ARTIFACT
  ? { intro: '../index.html', editions: '../editions/', project: '../project/index.html', support: '../support/index.html' }
  : { intro: 'intro/index.html', editions: 'editions/', project: 'project/index.html', support: 'support/index.html' };

/* A door to every edition, with what is behind it counted from the data. */
const { DIRECTORY } = require('../shared/regions.cjs');
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);
const inside = (d) => d.kind === 'region'
  ? [commissions, residencies, places].map((list) => list.filter((x) => x.region === d.name).length)
  : [DATA.editions[d.id].commissions, DATA.editions[d.id].residencies, DATA.editions[d.id].places];
const doors = DIRECTORY.map((d) => {
  const [c, r, p] = inside(d);
  return '<a class="door ' + d.kind + '" href="' + LINKS.editions + d.id + '/index.html">'
    + '<span class="code">' + d.code + (d.kind === 'country' ? '<em>country edition' + (d.lang === 'en' ? '' : ' · ' + d.langName) + '</em>' : '') + '</span>'
    + '<b>' + esc(d.name) + '</b>'
    + '<span class="meta">' + plural(c, 'commission', 'commissions') + ' · ' + plural(r, 'residency', 'residencies')
    + ' · ' + plural(p, 'institution', 'institutions') + '</span></a>';
}).join('\n      ');
const editionLinks = DIRECTORY.map((d) => '<a class="' + d.kind + '" href="' + LINKS.editions + d.id + '/index.html">'
  + esc(d.name) + (d.lang === 'en' ? '' : ' <span class="ed-lang">עברית</span>') + '</a>').join('');

const land = fs.readFileSync(path.join(HERE, 'land-fine.txt'), 'utf8').trim();
const asOf = positional[0] || 'November 2026';
/* the page is kept as three files, markup, stylesheet and script, and put together here */
const part = (f) => fs.readFileSync(path.join(HERE, f), 'utf8');
let html = part('page.template.html')
  .replace('/*__CSS__*/', () => part('page.css').replace(/\n$/, ''))
  .replace('/*__JS__*/', () => part('page.js').replace(/\n$/, ''));
/* the page reads the listings and nothing else: the Hebrew names and the
   edition bookkeeping stay out of it */
const PAGE_DATA = {
  commissions: commissions.map(({ edition, unopened, ...c }) => c),
  residencies: residencies.map(({ edition, unopened, ...r }) => r),
  places: places.map(({ edition, he, region, unopened, ...p }) => p),
  connect: DATA.connect,
};
html = html.replace('__DATA__', () => JSON.stringify(PAGE_DATA))
           .replace('__LAND__', () => land)
           .replace('__ASOF__', asOf)
           .replace('__SERIF__', STACKS.serif).replace('__SANS__', STACKS.sans).replace('__MONO__', STACKS.mono)
           .replace(/__HREF_INTRO__/g, LINKS.intro)
           .replace(/__HREF_PROJECT__/g, LINKS.project).replace(/__HREF_SUPPORT__/g, LINKS.support)
           .replace('__EDITION_DOORS__', () => doors).replace('__EDITION_LINKS__', () => editionLinks)
           /* this page is English only, so the Hebrew subsets stay out of it */
           .replace('/*__FONTS__*/', () => fontFaceCss({ latin: true, hebrew: false }));
const left = html.match(/__[A-Z_]{3,}__/g);
if (left) throw new Error('unreplaced placeholders: ' + [...new Set(left)].join(', '));

const out = outArg || positional[1] || path.join(HERE, '..', 'index.html');
fs.writeFileSync(out, html);

const byRegion = {};
residencies.forEach((r) => { byRegion[r.region] = (byRegion[r.region] || 0) + 1; });
const cByRegion = {};
commissions.forEach((c) => { cByRegion[c.region] = (cByRegion[c.region] || 0) + 1; });
const byAccess = {};
commissions.forEach((c) => { byAccess[c.access] = (byAccess[c.access] || 0) + 1; });

console.log('commissions:', commissions.length, JSON.stringify(cByRegion));
console.log('  access   :', JSON.stringify(byAccess));
console.log('residencies:', residencies.length, JSON.stringify(byRegion));
console.log('places     :', places.length,
  JSON.stringify(places.reduce((m, p) => (m[p.type] = (m[p.type] || 0) + 1, m), {})));
console.log('connect    :', DATA.connect.artistNeeds.length + '/' + DATA.connect.collectorNeeds.length + '/' + DATA.connect.gapFacts.length);
console.log('written    :', out, (html.length / 1024).toFixed(0) + ' KB');
