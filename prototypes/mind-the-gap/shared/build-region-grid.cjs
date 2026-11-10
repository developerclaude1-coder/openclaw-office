/* Which region each patch of land belongs to, as a coarse grid.
 *
 * The intro lights its dot map region by region, and a dot only knows its
 * longitude and latitude. This turns national boundaries into 2-degree cells,
 * each holding the region of the country that covers most of it, so the page
 * can answer "which region is this dot in?" from about 2 KB of text.
 *
 *   node build-region-grid.cjs <ne_110m_admin_0_countries.geojson> [--show]
 *     -> region-grid.txt
 *
 * The boundary file is Natural Earth (public domain). It is 840 KB and is only
 * needed to regenerate the grid, so it is not kept in the repository.
 *
 * Format: "<cell size in degrees>|<runs>", rows from north to south, each row
 * west to east. A run is a letter and a count: a = no region, b..g = the
 * regions in the order regions.cjs lists them.
 */
const fs = require('fs');
const path = require('path');
const { REGIONS, regionOf } = require('./regions.cjs');

const args = process.argv.slice(2);
const src = args.find((a) => !a.startsWith('--'));
if (!src) throw new Error('usage: node build-region-grid.cjs <countries.geojson> [--show]');
const STEP = 2, COLS = 360 / STEP, ROWS = 180 / STEP;
const INDEX = Object.fromEntries(REGIONS.map((r, i) => [r.name, i]));

/* A country is placed by the same table the listings use. One that the table
   does not name yet is placed by where it is. */
function regionOfCountry(p) {
  for (const name of [p.NAME, p.ADMIN, p.NAME_LONG]) {
    const r = regionOf(name);
    if (r !== 'Other') return r;
  }
  if (p.SUBREGION === 'Western Asia') return 'Middle East';
  if (p.CONTINENT === 'North America' || p.CONTINENT === 'South America') return 'Americas';
  return INDEX[p.CONTINENT] === undefined ? null : p.CONTINENT;
}
/* Two countries span more than one region on a map, whatever edition their
   listings belong to: France reaches South America, Russia reaches the Pacific. */
function regionAtPoint(region, lon) {
  if (region === 'Europe' && lon < -30) return 'Americas';
  if (region === 'Europe' && lon > 60) return 'Asia';
  return region;
}

const inRing = (x, y, r) => {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const xi = r[i][0], yi = r[i][1], xj = r[j][0], yj = r[j][1];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c;
  }
  return c;
};
const polygons = [];
for (const f of JSON.parse(fs.readFileSync(src, 'utf8')).features) {
  const region = f.geometry && regionOfCountry(f.properties);
  if (!region) continue;
  for (const poly of f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates) {
    let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
    for (const [x, y] of poly[0]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    polygons.push({ region, poly, x0, y0, x1, y1 });
  }
}
function regionAt(lon, lat) {
  for (const g of polygons) {
    if (lon < g.x0 || lon > g.x1 || lat < g.y0 || lat > g.y1) continue;
    if (!inRing(lon, lat, g.poly[0])) continue;
    if (g.poly.slice(1).some((hole) => inRing(lon, lat, hole))) continue;
    return INDEX[regionAtPoint(g.region, lon)];
  }
  return -1;
}

/* each cell takes the region most of its land is in, from nine samples */
const cells = new Int8Array(COLS * ROWS).fill(-1);
const most = (tally) => tally.reduce((best, n, i) => (n > (tally[best] || 0) ? i : best), -1);
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
  const tally = REGIONS.map(() => 0);
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) {
    const k = regionAt(-180 + (c + (a + 0.5) / 3) * STEP, 90 - (r + (b + 0.5) / 3) * STEP);
    if (k >= 0) tally[k]++;
  }
  cells[r * COLS + c] = most(tally);
}
/* Coastlines and small islands fall between samples, and the dot map is cut
   from a finer coastline than these boundaries. Let each region spread two
   cells into the open sea beside it, so a dot on the shore is still claimed. */
for (let pass = 0; pass < 2; pass++) {
  const next = cells.slice();
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (cells[r * COLS + c] >= 0) continue;
    const tally = REGIONS.map(() => 0);
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const rr = r + dr, cc = (c + dc + COLS) % COLS;
      if (rr < 0 || rr >= ROWS) continue;
      const k = cells[rr * COLS + cc];
      if (k >= 0) tally[k]++;
    }
    next[r * COLS + c] = most(tally);
  }
  cells.set(next);
}

let runs = '', i = 0;
while (i < cells.length) {
  let j = i;
  while (j < cells.length && cells[j] === cells[i]) j++;
  runs += String.fromCharCode(98 + cells[i]) + (j - i);
  i = j;
}
const out = path.join(__dirname, 'region-grid.txt');
fs.writeFileSync(out, STEP + '|' + runs);

if (args.includes('--show')) {
  for (let r = 0; r < ROWS; r++) {
    let line = '';
    for (let c = 0; c < COLS; c++) line += cells[r * COLS + c] < 0 ? '·' : REGIONS[cells[r * COLS + c]].code[1];
    console.log(line);
  }
}
const count = REGIONS.map((reg, k) => reg.name + ' ' + cells.filter((v) => v === k).length);
console.log(path.basename(out) + ': ' + COLS + 'x' + ROWS + ' cells, ' + (STEP + '|' + runs).length + ' bytes · ' + count.join(', '));
