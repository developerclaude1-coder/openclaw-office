/* Build a high-precision regional coastline for one edition.
 *
 * The global prototype encodes the world at 0.1-degree precision — about 11 km,
 * invisible at world scale. These editions sit at country scale, where 11 km
 * steps read as visible blockiness, so each edition gets its own set clipped to
 * a generous bounding box and encoded at higher precision.
 *
 * Format: "<precision>|<ring>;<ring>..." where each ring is space-separated
 * "<dx>,<dy>" base-36 deltas of (coord * precision).
 *
 *   node clip-region.cjs <source.geojson> <out.txt> <minLon> <minLat> <maxLon> <maxLat> <tol> <precision>
 */
const fs = require('fs');

const [src, out, minLon, minLat, maxLon, maxLat, tolArg, precArg] = process.argv.slice(2);
const BB = { x0: +minLon, y0: +minLat, x1: +maxLon, y1: +maxLat };
const TOL = +tolArg;
const PREC = +precArg;

const gj = JSON.parse(fs.readFileSync(src, 'utf8'));

function dp(pts, tol) {
  if (pts.length < 3) return pts;
  let maxD = -1, idx = 0;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const dx = bx - ax, dy = by - ay;
  const den = Math.hypot(dx, dy) || 1;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i];
    const d = Math.abs(dy * px - dx * py + bx * ay - by * ax) / den;
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD > tol) return dp(pts.slice(0, idx + 1), tol).slice(0, -1).concat(dp(pts.slice(idx), tol));
  return [pts[0], pts[pts.length - 1]];
}
// A closed ring has a zero-length baseline, so split it before simplifying.
function dpRing(ring, tol) {
  let pts = ring.slice();
  const a = pts[0], b = pts[pts.length - 1];
  if (a[0] === b[0] && a[1] === b[1]) pts = pts.slice(0, -1);
  if (pts.length < 4) return ring;
  let far = 0, fd = -1;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]);
    if (d > fd) { fd = d; far = i; }
  }
  return dp(pts.slice(0, far + 1), tol).slice(0, -1).concat(dp(pts.slice(far).concat([pts[0]]), tol));
}
const intersects = (r) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of r) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return !(x1 < BB.x0 || x0 > BB.x1 || y1 < BB.y0 || y0 > BB.y1);
};
// Clip generously: keep vertices a little outside the box so coastlines that
// leave and re-enter the frame still close correctly.
const PAD = 2;
const clip = (r) => r.filter(([x, y]) =>
  x >= BB.x0 - PAD && x <= BB.x1 + PAD && y >= BB.y0 - PAD && y <= BB.y1 + PAD);

let rings = [];
for (const f of gj.features) {
  const g = f.geometry; if (!g) continue;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  for (const poly of polys) {
    const outer = poly[0];
    if (!intersects(outer)) continue;
    let s = dpRing(outer, TOL).map(p => [
      Math.round(p[0] * PREC) / PREC,
      Math.round(p[1] * PREC) / PREC,
    ]);
    s = s.filter((p, i) => i === 0 || p[0] !== s[i - 1][0] || p[1] !== s[i - 1][1]);
    if (s.length >= 4) rings.push(s);
  }
}

const encoded = PREC + '|' + rings.map(r => {
  let px = 0, py = 0;
  return r.map(([lon, lat]) => {
    const x = Math.round(lon * PREC), y = Math.round(lat * PREC);
    const t = (x - px).toString(36) + ',' + (y - py).toString(36);
    px = x; py = y; return t;
  }).join(' ');
}).join(';');

fs.writeFileSync(out, encoded);
console.log(`${out}: rings=${rings.length} points=${rings.reduce((n, r) => n + r.length, 0)} ` +
            `precision=1/${PREC}deg bytes=${encoded.length} (${(encoded.length / 1024).toFixed(0)}KB)`);
