/* Build the project page and the support page from content.json.
 *
 *   node build.cjs                      -> ../index.html and ../../support/index.html
 *   node build.cjs --artifact --out=DIR -> DIR/project/index.html and DIR/support/index.html,
 *                                          linked for the published multi-page artifact
 *   node build.cjs --content=FILE ...   -> the same, from another copy of content.json
 *
 * Every number the pages state about the index is counted here from the same
 * dataset the world index and the editions are built from, and the support
 * page's goals are added up from the roadmap's own cost lines, so neither can
 * drift from its source.
 */
const fs = require('fs');
const path = require('path');
const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..');
const { fontFaceCss, STACKS } = require('../../shared/fonts/fonts.cjs');
const { DIRECTORY, REGIONS } = require('../../shared/regions.cjs');
const DATA = require('../../build/dataset.cjs');

const argv = process.argv.slice(2);
const ARTIFACT = argv.includes('--artifact');
const OUT_DIR = (argv.find((a) => a.startsWith('--out=')) || '').slice(6) || ROOT;

const read = (f) => fs.readFileSync(path.join(HERE, f), 'utf8');
/* --content=FILE builds from another copy of content.json: the checks use it
   to see the page as it will be once the campaign link is filled in */
const CONTENT = (argv.find((a) => a.startsWith('--content=')) || '').slice(10) || path.join(HERE, 'content.json');
const C = JSON.parse(fs.readFileSync(CONTENT, 'utf8'));
const il = JSON.parse(fs.readFileSync(path.join(ROOT, 'editions', 'build', 'locales', 'il.json'), 'utf8'));

/* Where the other pages are, seen from project/index.html or support/index.html.
   Both sit one folder down in either layout; only the intro and the world
   index trade places when the site is published. */
const LINKS = ARTIFACT
  ? { intro: '../index.html', world: '../world/index.html' }
  : { intro: '../intro/index.html', world: '../index.html' };
Object.assign(LINKS, { editions: '../editions/', project: '../project/index.html', support: '../support/index.html' });

/* ---------- numbers, from the data ---------- */
/* The listings every page shares, plus Israel's, which exist in Hebrew only. */
const commissions = DATA.commissions.concat(il.commissions);
const listings = commissions.concat(DATA.residencies, il.residencies);
const conf = (k) => listings.filter((x) => x.confidence === k).length;
const N = {
  L: listings.length, CC: commissions.length, RR: DATA.residencies.length + il.residencies.length,
  P: DATA.places.length, K: new Set(DATA.places.map((p) => p.country)).size,
  E: DIRECTORY.length, RG: REGIONS.length,
  H: conf('high'), M: conf('medium'), LO: conf('low'),
  UL: DATA.commissions.concat(DATA.residencies).filter((x) => x.unopened).length,
  UP: DATA.places.filter((x) => x.unopened).length,
  INV: commissions.filter((c) => c.access === 'invitation').length,
  CN: DATA.connect.collectorNeeds.length,
};
if (N.H + N.M + N.LO !== N.L) throw new Error('a listing has no confidence rating');

/* ---------- money, from the roadmap's own cost lines ---------- */
const P0 = C.phase0;
N.lines = P0.lines.map((l) => ({ ...l, total: 1000 * ((l.once || 0) + (l.monthly || []).reduce((a, b) => a + b, 0) * P0.months) }));
N.PH0 = N.lines.reduce((a, l) => a + l.total, 0);
N.G1 = N.lines.filter((l) => l.goal === 'first').reduce((a, l) => a + l.total, 0);
const phase0M = C.phases[0].costM * 1e6;
if (Math.abs(N.PH0 - phase0M) > 5000) throw new Error('Phase 0 lines add up to ' + N.PH0 + ', the roadmap says ' + phase0M);
if (!(N.G1 > 0 && N.G1 < N.PH0)) throw new Error('the first goal must be a part of Phase 0');
const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');
const MONEY = { G1: usd(N.G1), G2: usd(N.PH0), PER: usd(Math.round(N.G1 / (N.L + N.P) / 10) * 10) };

/* {X} in the copy is a number from above. An unknown one stops the build. */
const fill = (s) => String(s).replace(/\{([A-Z0-9]+)\}/g, (m, k) => {
  if (k in MONEY) return MONEY[k];
  if (typeof N[k] === 'number') return String(N[k]);
  throw new Error('unknown number in copy: ' + m);
});

/* ---------- workstreams: each one starts in a phase that exists ---------- */
for (const w of C.built.concat(C.ground)) {
  if (!C.phases.some((p) => p.n === w.phases[0]) || w.phases[1] < w.phases[0]) throw new Error('bad phases for ' + w.name);
}

/* ---------- assemble ---------- */
const R = require('./render.cjs')({ C, N, LINKS, DIRECTORY, fill });
const css = read('site.css').replace('__SERIF__', STACKS.serif).replace('__SANS__', STACKS.sans).replace('__MONO__', STACKS.mono);
const js = read('site.js');
const TPL = read('page.template.html');
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function page(id, copy, sub) {
  let html = TPL
    .replace('__TITLE__', () => esc(copy.title))
    .replace('__DESC__', () => esc(fill(copy.desc)))
    .replace('__PAGE__', id)
    .replace('__SUB__', () => esc(sub))
    .replace('__NAV__', () => R.nav(id))
    .replace('__NAV_CTA__', () => R.navCta(id))
    .replace('__MAIN__', () => R[id]())
    .replace('__FOOTER__', () => R.footer(id))
    .replace('/*__CSS__*/', () => css.replace(/\n$/, ''))
    .replace('/*__JS__*/', () => js.replace(/\n$/, ''));
  /* the only Hebrew on these pages is the edition row's language tag */
  html = html.replace('/*__FONTS__*/', () => fontFaceCss({ latin: true, hebrew: /[֐-׿]/.test(html) }));
  const left = html.match(/__[A-Z_]{3,}__|\{[A-Z0-9]+\}/g);
  if (left) throw new Error('[' + id + '] unreplaced placeholders: ' + [...new Set(left)].join(', '));
  const file = path.join(OUT_DIR, id, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  console.log(id.padEnd(8) + path.relative(process.cwd(), file) + '  ' + (html.length / 1024).toFixed(0) + ' KB');
}

page('project', C.project, 'The project');
page('support', C.support, 'Support');

const lines = (f) => read(f).split('\n').length;
const over = ['build.cjs', 'render.cjs', 'site.css', 'site.js', 'page.template.html'].filter((f) => lines(f) > 500);
console.log('listings ' + N.L + ' (' + N.H + ' high, ' + N.M + ' medium, ' + N.LO + ' low) · institutions ' + N.P + ' · countries ' + N.K);
console.log('phase 0  ' + N.lines.map((l) => l.id + ' ' + usd(l.total)).join(' · ') + '  = ' + usd(N.PH0) + '  first goal ' + MONEY.G1 + '  (' + MONEY.PER + ' a listing)');
console.log('campaign ' + (C.links.gofundme ? C.links.gofundme : 'no GoFundMe link yet: the support page says the campaign opens soon'));
if (over.length) console.log('WARNING over 500 lines: ' + over.join(', '));
