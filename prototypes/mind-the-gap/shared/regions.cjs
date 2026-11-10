/* The six regions of Mind the Gap, and which region each country belongs to.
 *
 * One definition for every page: the world index filters by it, each regional
 * edition is cut from it, and the intro lights the map with it. Listed west to
 * east, which is also the order the doors are shown in.
 *
 * A region here is an editorial grouping for finding opportunities, not a
 * geopolitical claim. Where a country could sit in two (Türkiye, Russia,
 * Egypt, Iran, the Caucasus) it sits where an artist would most likely look
 * for it.
 */
const REGIONS = [
  { id: 'americas', code: 'AM', name: 'Americas', he: 'יבשת אמריקה',
    eyebrow: 'One index for the art world of the Americas',
    bounds: [-168, -56, -34, 72], label: [-150, 8] },
  { id: 'europe', code: 'EU', name: 'Europe', he: 'אירופה',
    eyebrow: 'One index for the European art world',
    bounds: [-25, 34, 45, 71], label: [4, 75] },
  { id: 'africa', code: 'AF', name: 'Africa', he: 'אפריקה',
    eyebrow: 'One index for the African art world',
    bounds: [-18, -35, 52, 38], label: [-14, -22] },
  { id: 'middle-east', code: 'ME', name: 'Middle East', he: 'המזרח התיכון',
    eyebrow: 'One index for the art world of the Middle East',
    bounds: [33, 12, 63.5, 40], label: [64, 9] },
  { id: 'asia', code: 'AS', name: 'Asia', he: 'אסיה',
    eyebrow: 'One index for the Asian art world',
    bounds: [60, -11, 150, 55], label: [160, 28] },
  { id: 'oceania', code: 'OC', name: 'Oceania', he: 'אוקיאניה',
    eyebrow: 'One index for the art world of Oceania',
    bounds: [110, -48, 180, -5], label: [150, -52], core: [113, -44, 154, -10] },
];

/* `bounds` is [west, south, east, north], the frame that holds the region;
   `label` is a point of open water beside it where its name can sit. A region's
   own atlas opens on its institutions, widened to `core` where that would
   otherwise cut a continent in half. */

/* Countries that have an edition of their own, in their own language. Each
   sits inside a region, and its listings are that region's listings for the
   country. */
const COUNTRY_EDITIONS = [
  { id: 'us', code: 'US', name: 'United States', he: 'ארצות הברית', lang: 'en', langName: 'English', region: 'americas', country: 'United States',
    bounds: [-125.5, 24.3, -66.5, 49.6] },
  { id: 'il', code: 'IL', name: 'Israel', he: 'ישראל', lang: 'he', langName: 'Hebrew', region: 'middle-east', country: 'Israel',
    bounds: [34.2, 29.4, 35.9, 33.4] },
];

/* Every edition in the order a menu lists them: each region, west to east,
   followed by the country editions inside it. */
const DIRECTORY = [].concat(...REGIONS.map((r) => [{ ...r, kind: 'region', lang: 'en' }]
  .concat(COUNTRY_EDITIONS.filter((c) => c.region === r.id).map((c) => ({ ...c, kind: 'country' })))));

const COUNTRY_REGION = {
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
  'Cyprus': 'Europe', 'Georgia': 'Europe', 'Armenia': 'Europe', 'Azerbaijan': 'Europe',

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

/* One spelling per country, whatever the research pass wrote. */
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
function regionOf(country) { return COUNTRY_REGION[normCountry(country)] || 'Other'; }
const byName = (name) => REGIONS.find((r) => r.name === name);
const byId = (id) => REGIONS.find((r) => r.id === id);

module.exports = { REGIONS, COUNTRY_EDITIONS, DIRECTORY, COUNTRY_REGION, normCountry, regionOf, byName, byId };
