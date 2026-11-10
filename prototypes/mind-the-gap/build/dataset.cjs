/* The one dataset: every verified commission, residency and institution,
 * merged, de-duplicated and normalised once, for whichever page needs it.
 *
 *   const DATA = require('./dataset.cjs');
 *   DATA.commissions / DATA.residencies / DATA.places / DATA.connect
 *
 * The world index is all of it, a regional edition is the part in its region,
 * and a country edition is the part in its country, in that country's
 * language. Adding a listing means adding it to a file in data/, or to a
 * country edition's locale file.
 */
const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, 'data');
const R = (f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
const exists = (f) => fs.existsSync(path.join(DATA_DIR, f));
const { normCountry, regionOf } = require('../shared/regions.cjs');

/* ---- restore diacritics the research pass stripped ---- */
const DIACRITICS = [
  [/\bMaret Anne Sara\b/g, 'Máret Ánne Sara'],
  [/\bAndra Ursuta\b/g, 'Andra Ursuța'],
  [/\bTuan Andrew Nguyen\b/g, 'Tuan Andrew Nguyễn'],
  [/\bDak'?art\b/gi, "Dak'Art"],
  [/\bSao Paulo\b/g, 'São Paulo'],
  [/\bMuseo Tamayo\b/g, 'Museo Tamayo'],
  [/\bReina Sofia\b/g, 'Reina Sofía'],
  [/\bCite internationale des arts\b/gi, 'Cité internationale des arts'],
  [/\bKunstlerhaus Bethanien\b/g, 'Künstlerhaus Bethanien'],
  [/\bTurkiye\b/g, 'Türkiye'],
];
function fixText(v) {
  if (typeof v !== 'string') return v;
  let s = v;
  for (const [re, to] of DIACRITICS) s = s.replace(re, to);
  return s;
}
function deepFix(o) {
  if (Array.isArray(o)) return o.map(deepFix);
  if (o && typeof o === 'object') {
    const out = {};
    for (const k of Object.keys(o)) out[k] = deepFix(o[k]);
    return out;
  }
  return fixText(o);
}

/* ---- load ---- */
const base = {
  commissions: R('d-commissions.json').items,
  residencies: R('d-residencies.json').items,
  museums: R('d-museums.json').items,
  galleries: R('d-galleries.json').items,
  connect: R('d-connect.json'),
};

/* Later research passes each live in their own file, so it stays clear what
   was checked when: d-added (August 2026, worldwide), d-global (November
   2026, Europe, the Middle East and Oceania). */
let addedC = [], addedR = [], addedP = [];
for (const f of ['d-added.json', 'd-global.json']) {
  if (!exists(f)) continue;
  const a = R(f);
  /* the November pass could not open the pages it cites, and a page that
     shows its listings has to say so */
  const mark = (x) => f === 'd-global.json' ? { ...x, unopened: true } : x;
  addedC = addedC.concat((a.commissions || []).map(mark));
  addedR = addedR.concat((a.residencies || []).map(mark));
  addedP = addedP.concat((a.places || []).map(mark));
}
if (exists('d-claims.json')) base.connect = R('d-claims.json');

/* Country editions are part of the same index, so they are read here too.
   The United States edition is in English and shares this schema, so its
   listings join the rest. Israel's are written in Hebrew and stay in its
   edition, but its institutions carry English names and are mapped everywhere. */
const edition = (id) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'editions', 'build', 'locales', id + '.json'), 'utf8'));
const us = edition('us'), il = edition('il');
const tag = (id) => (x) => ({ ...x, edition: id });
const ilPlaces = il.places.map((p) => ({
  name: p.nameEn, city: p.cityEn, country: 'Israel', lat: p.lat, lon: p.lon, type: p.type, note: p.noteEn,
  edition: 'il', he: { name: p.name, city: p.city, country: p.country, note: p.note },
}));

/* ---- merge + dedupe by name+city ---- */
const keyOf = (x) => (x.name || '').toLowerCase().replace(/[^a-z0-9]/g, '') + '|' + (x.city || '').toLowerCase().replace(/[^a-z0-9]/g, '');
function merge(a, b) {
  const seen = new Set(), out = [];
  for (const x of a.concat(b)) {
    const k = keyOf(x);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
}

/* An edition's entry goes first, so where a listing is in both it keeps the
   wording of its edition. */
let commissions = merge(us.commissions.map(tag('us')), base.commissions.concat(addedC)).map((c) => ({
  ...c,
  access: c.access || inferAccess(c),
  country: normCountry(c.country),
  region: regionOf(c.country),
}));
function inferAccess(c) {
  const t = ((c.cycleNote || '') + ' ' + (c.summary || '')).toLowerCase();
  if (/registry|directory|roster/.test(t)) return 'registry';
  if (/no open call|invitation only|not an open call|by nomination|curator-led|invited/.test(t)) return 'invitation';
  if (/open call|apply|submissions|applications/.test(t)) return 'open call';
  return 'mixed';
}

let residencies = merge(us.residencies.map(tag('us')), base.residencies.concat(addedR)).map((r) => ({
  ...r,
  country: normCountry(r.country),
  region: regionOf(r.country),
}));

const places = merge(ilPlaces.concat(us.places.map(tag('us'))), base.museums.concat(base.galleries, addedP))
  .filter((p) => typeof p.lat === 'number' && typeof p.lon === 'number'
    && p.lat >= -90 && p.lat <= 90 && p.lon >= -180 && p.lon <= 180)
  .map((p) => ({
    name: p.name, city: p.city, country: normCountry(p.country), region: regionOf(p.country),
    lat: +p.lat.toFixed(4), lon: +p.lon.toFixed(4), type: p.type, note: p.note,
    ...(p.edition ? { edition: p.edition } : {}), ...(p.he ? { he: p.he } : {}),
    ...(p.unopened ? { unopened: true } : {}),
  }));

/* Every listing has to land in a region, or it would be on the world index and
   on no regional edition. */
const homeless = [].concat(commissions, residencies, places).filter((x) => x.region === 'Other');
if (homeless.length) {
  throw new Error('no region for: ' + [...new Set(homeless.map((x) => x.country))].join(', ')
    + '. Add the country to COUNTRY_REGION in shared/regions.cjs.');
}

/* The hierarchy has to hold: whatever is listed in a country that has its own
   edition must be in that edition, or the region page would know more about
   the country than the country's own page does. */
const EDITION_OF = { 'United States': 'us', Israel: 'il' };
const strays = [].concat(commissions, residencies, places)
  .filter((x) => EDITION_OF[x.country] && x.edition !== EDITION_OF[x.country]);
if (strays.length) {
  throw new Error('listed in a country that has its own edition, but missing from that edition: '
    + strays.map((x) => x.name + ' (' + x.country + ')').join('; '));
}

/* stable, meaningful ordering */
const ORDER = { 'open call': 0, registry: 1, mixed: 2, invitation: 3 };
commissions.sort((a, b) => (ORDER[a.access] ?? 9) - (ORDER[b.access] ?? 9) || a.name.localeCompare(b.name));
residencies.sort((a, b) => a.region.localeCompare(b.region) || a.name.localeCompare(b.name));

const DATA = deepFix({
  commissions, residencies, places,
  editions: {
    us: { name: us.name, lang: us.lang, commissions: us.commissions.length, residencies: us.residencies.length, places: us.places.length },
    il: { name: il.name, lang: il.lang, commissions: il.commissions.length, residencies: il.residencies.length, places: il.places.length },
  },
  connect: {
    artistNeeds: base.connect.artistNeeds || [],
    collectorNeeds: base.connect.collectorNeeds || [],
    gapFacts: base.connect.gapFacts || [],
  },
});

module.exports = DATA;
