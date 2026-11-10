/* A regional edition is not written by hand. It is the part of the dataset
 * that lies in the region, shown through the English edition's interface.
 *
 *   regionLocale('europe') -> the same shape as locales/us.json
 */
const DATA = require('../../build/dataset.cjs');
const { REGIONS, COUNTRY_EDITIONS } = require('../../shared/regions.cjs');
const BASE = require('./locales/us.json');

const THE = { americas: 'the Americas', 'middle-east': 'the Middle East' };
const the = (r) => THE[r.id] || r.name;
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);
const canApply = (c) => c.access !== 'invitation';

/* The atlas opens on where the institutions actually are, not on the whole
   region: Oceania's frame would otherwise be mostly Pacific. */
function frameOf(places, r) {
  if (!places.length) return r.bounds;
  let [w, s, e, n] = r.core ? [r.core[0], r.core[1], r.core[2], r.core[3]] : [180, 90, -180, -90];
  for (const p of places) {
    w = Math.min(w, p.lon); e = Math.max(e, p.lon);
    s = Math.min(s, p.lat); n = Math.max(n, p.lat);
  }
  const px = Math.max(4, (e - w) * 0.12), py = Math.max(3, (n - s) * 0.14);
  return [w - px, s - py, e + px, n + py].map((v) => +v.toFixed(1));
}

/* Take one from each country in turn, so the first screenful of anything
   built from this list is not all one city. */
function interleave(places) {
  const by = new Map();
  for (const p of places) by.set(p.country, (by.get(p.country) || []).concat(p));
  const queues = [...by.values()].sort((a, b) => b.length - a.length);
  const out = [];
  while (queues.some((q) => q.length)) for (const q of queues) if (q.length) out.push(q.shift());
  return out;
}

function regionLocale(id) {
  const r = REGIONS.find((x) => x.id === id);
  if (!r) throw new Error('unknown region: ' + id);
  const inRegion = (x) => x.region === r.name;
  const unopened = [].concat(DATA.commissions, DATA.residencies, DATA.places).some((x) => inRegion(x) && x.unopened);
  const commissions = DATA.commissions.filter(inRegion).map(({ region, edition, unopened, ...c }) => c);
  const residencies = DATA.residencies.filter(inRegion).map(({ region, edition, unopened, ...x }) => x);
  const places = interleave(DATA.places.filter(inRegion))
    .map((p) => ({ name: p.name, city: p.city, country: p.country, lat: p.lat, lon: p.lon, type: p.type, note: p.note }));
  const countries = new Set([].concat(commissions, residencies, places).map((x) => x.country));
  const open = commissions.filter(canApply).length, closed = commissions.length - open;

  /* A country edition inside this region. Where it shares the page's language
     its listings are already here; where it does not, they are only there. */
  const children = COUNTRY_EDITIONS.filter((c) => c.region === id).map((c) => {
    const n = DATA.editions[c.id], same = c.lang === 'en';
    const note = (count, one, many) => same
      ? count + ' of these ' + many + ', on a page of their own'
      : plural(count, one + ' is', many + ' are') + ' listed there and not here';
    return {
      to: c.id,
      title: same ? c.name + ' edition' : c.name + ' edition, in ' + c.langName,
      commissions: note(n.commissions, 'commission', 'commissions'),
      residencies: note(n.residencies, 'residency', 'residencies'),
    };
  });

  return {
    id, kind: 'region', code: r.code, name: r.name, lang: 'en', dir: 'ltr',
    title: 'Mind the Gap — ' + r.name,
    mapView: { bounds: frameOf(places, r) },
    showCountry: true,
    strings: {
      ...BASE.strings,
      brandSub: 'The art world index · ' + r.name,
      heroEyebrow: r.eyebrow,
      heroLede: 'Public commissions, residencies and the museums, galleries and biennials of ' + the(r) + ': '
        + plural(commissions.length, 'commission', 'commissions') + ', '
        + plural(residencies.length, 'residency', 'residencies') + ' and '
        + plural(places.length, 'institution', 'institutions') + ' in '
        + plural(countries.size, 'country', 'countries') + ', each linked to the source it was checked against.',
      scopeLocal: r.name,
      disclaimer: BASE.strings.disclaimer + (unopened
        ? ' Listings added or re-checked in November 2026 were read from the organisers’ own pages as quoted by a search'
          + ' engine, without opening the pages themselves, so none of them is rated above medium.'
        : ''),
    },
    places, commissions, residencies,
    /* what the market hides is much the same everywhere; the one point about
       United States law is only said where it applies */
    artistNeeds: DATA.connect.artistNeeds.filter((n) => id === 'americas' || !/United States/.test(n.point))
      .map(({ point, detail }) => ({ point, detail })),
    /* Two things that are true of this edition itself, counted from it. */
    jurisdictionFacts: [
      {
        fact: open + ' of the ' + commissions.length + ' commissions here take applications',
        detail: closed
          ? 'The other ' + closed + (closed === 1 ? ' is' : ' are') + ' by invitation or nomination. '
            + (closed === 1 ? 'It is' : 'They are') + ' listed so that you know '
            + (closed === 1 ? 'it exists and who commissions it' : 'they exist and who commissions them')
            + ', not because you can apply.'
          : 'Each one is an open call, a registry you can join, or a mix of open and invited routes.',
      },
      {
        fact: plural(countries.size, 'country', 'countries') + ' so far',
        detail: 'This edition is a first cut, not a census. A country that is missing from it has not been '
          + 'researched yet, which is not the same as having nothing to offer.',
      },
    ],
    doors: {
      down: children,
      up: [{ to: 'world', title: 'World index', note: 'Every region, on one page' }],
    },
  };
}

module.exports = { regionLocale, REGION_IDS: REGIONS.map((r) => r.id) };
