/* Assemble the Mind the Gap page from verified data + Natural Earth coastlines. */
const fs = require('fs');
const path = require('path');
const HERE = __dirname;
const DATA_DIR = path.join(HERE, 'data');
const R = (f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
const exists = (f) => fs.existsSync(path.join(DATA_DIR, f));

/* ---- region mapping so residencies can be filtered by where they are ---- */
const REGION = {
  'United States': 'Americas', 'Canada': 'Americas', 'Mexico': 'Americas', 'Brazil': 'Americas',
  'Argentina': 'Americas', 'Colombia': 'Americas', 'Peru': 'Americas', 'Chile': 'Americas',
  'Costa Rica': 'Americas', 'Puerto Rico': 'Americas', 'Cuba': 'Americas', 'Jamaica': 'Americas',
  'Uruguay': 'Americas', 'Ecuador': 'Americas', 'Guatemala': 'Americas', 'Trinidad and Tobago': 'Americas',

  'United Kingdom': 'Europe', 'Netherlands': 'Europe', 'France': 'Europe', 'Germany': 'Europe',
  'Spain': 'Europe', 'Italy': 'Europe', 'Portugal': 'Europe', 'Greece': 'Europe', 'Austria': 'Europe',
  'Switzerland': 'Europe', 'Belgium': 'Europe', 'Ireland': 'Europe', 'Norway': 'Europe',
  'Sweden': 'Europe', 'Denmark': 'Europe', 'Finland': 'Europe', 'Iceland': 'Europe',
  'Poland': 'Europe', 'Czechia': 'Europe', 'Lithuania': 'Europe', 'Latvia': 'Europe',
  'Estonia': 'Europe', 'Hungary': 'Europe', 'Romania': 'Europe', 'Bulgaria': 'Europe',
  'Croatia': 'Europe', 'Serbia': 'Europe', 'Slovenia': 'Europe', 'Slovakia': 'Europe',
  'Ukraine': 'Europe', 'Russia': 'Europe', 'Turkey': 'Europe', 'Türkiye': 'Europe',

  'South Africa': 'Africa', 'Senegal': 'Africa', 'Nigeria': 'Africa', 'Ghana': 'Africa',
  'Kenya': 'Africa', 'Uganda': 'Africa', 'Tanzania': 'Africa', 'Egypt': 'Africa',
  'Morocco': 'Africa', 'Ethiopia': 'Africa', 'Zimbabwe': 'Africa', 'Mozambique': 'Africa',
  'Ivory Coast': 'Africa', "Côte d'Ivoire": 'Africa', 'Rwanda': 'Africa', 'Benin': 'Africa',

  'China': 'Asia', 'Japan': 'Asia', 'South Korea': 'Asia', 'Taiwan': 'Asia',
  'Hong Kong': 'Asia', 'Singapore': 'Asia', 'Indonesia': 'Asia', 'Malaysia': 'Asia',
  'Thailand': 'Asia', 'Vietnam': 'Asia', 'Philippines': 'Asia', 'Cambodia': 'Asia',
  'India': 'Asia', 'Pakistan': 'Asia', 'Bangladesh': 'Asia', 'Sri Lanka': 'Asia', 'Nepal': 'Asia',

  'United Arab Emirates': 'Middle East', 'Saudi Arabia': 'Middle East', 'Qatar': 'Middle East',
  'Lebanon': 'Middle East', 'Jordan': 'Middle East', 'Iran': 'Middle East', 'Israel': 'Middle East',
  'Palestine': 'Middle East', 'Kuwait': 'Middle East', 'Oman': 'Middle East', 'Bahrain': 'Middle East',

  'Australia': 'Oceania', 'New Zealand': 'Oceania', 'Fiji': 'Oceania', 'Samoa': 'Oceania',

  'Cameroon': 'Africa', 'Mali': 'Africa', 'Madagascar': 'Africa',
  'Democratic Republic of the Congo': 'Africa', 'Republic of the Congo': 'Africa',
  'Haiti': 'Americas', 'Barbados': 'Americas', 'Aruba': 'Americas', 'Bolivia': 'Americas',
  'Paraguay': 'Americas', 'Panama': 'Americas', 'Nicaragua': 'Americas', 'Honduras': 'Americas',
  'Bahamas': 'Americas', 'Curaçao': 'Americas',
};
function normCountry(c) {
  if (!c) return '';
  let s = String(c).trim();
  s = s.replace(/\s*\(.*?\)\s*$/, '').trim();          // "United Kingdom (Scotland)" -> "United Kingdom"
  if (/^Hong Kong/i.test(s) || /Hong Kong SAR/i.test(s)) return 'Hong Kong';
  if (/^China\b/i.test(s) && /Hong Kong/i.test(c)) return 'Hong Kong';
  if (s === 'USA' || s === 'US') return 'United States';
  if (s === 'UK') return 'United Kingdom';
  if (s === 'Czech Republic') return 'Czechia';
  if (/^Aotearoa/i.test(s)) return 'New Zealand';
  if (s === 'DRC' || s === 'DR Congo') return 'Democratic Republic of the Congo';
  if (s === 'Turkiye') return 'Türkiye';
  return s;
}
function regionOf(country) {
  const c = normCountry(country);
  return REGION[c] || 'Other';
}

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

let addedC = [], addedR = [];
if (exists('d-added.json')) {
  const a = R('d-added.json');
  addedC = a.commissions || [];
  addedR = a.residencies || [];
}
if (exists('d-claims.json')) base.connect = R('d-claims.json');

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

let commissions = merge(base.commissions, addedC).map((c) => ({
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

let residencies = merge(base.residencies, addedR).map((r) => ({
  ...r,
  country: normCountry(r.country),
  region: regionOf(r.country),
}));

const places = merge(base.museums, base.galleries)
  .filter((p) => typeof p.lat === 'number' && typeof p.lon === 'number'
    && p.lat >= -90 && p.lat <= 90 && p.lon >= -180 && p.lon <= 180)
  .map((p) => ({
    name: p.name, city: p.city, country: normCountry(p.country),
    lat: +p.lat.toFixed(4), lon: +p.lon.toFixed(4), type: p.type, note: p.note,
  }));

/* stable, meaningful ordering */
const ORDER = { 'open call': 0, registry: 1, mixed: 2, invitation: 3 };
commissions.sort((a, b) => (ORDER[a.access] ?? 9) - (ORDER[b.access] ?? 9) || a.name.localeCompare(b.name));
residencies.sort((a, b) => a.region.localeCompare(b.region) || a.name.localeCompare(b.name));

const DATA = deepFix({
  commissions, residencies, places,
  connect: {
    artistNeeds: base.connect.artistNeeds || [],
    collectorNeeds: base.connect.collectorNeeds || [],
    gapFacts: base.connect.gapFacts || [],
  },
});

/* ---- inject ---- */
const land = fs.readFileSync(path.join(HERE, 'land-fine.txt'), 'utf8').trim();
const asOf = process.argv[2] || 'August 2026';
let html = fs.readFileSync(path.join(HERE, 'page.template.html'), 'utf8');
html = html.replace('__DATA__', JSON.stringify(DATA))
           .replace('__LAND__', land)
           .replace('__ASOF__', asOf);

const out = process.argv[3] || path.join(HERE, '..', 'index.html');
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
