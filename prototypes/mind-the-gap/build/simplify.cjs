const fs = require('fs');
const gj = JSON.parse(fs.readFileSync('land.json','utf8'));

// perpendicular distance simplification (Douglas-Peucker)
function dp(pts, tol){
  if(pts.length < 3) return pts;
  let maxD = -1, idx = 0;
  const [ax,ay] = pts[0], [bx,by] = pts[pts.length-1];
  const dx = bx-ax, dy = by-ay;
  const den = Math.hypot(dx,dy) || 1;
  for(let i=1;i<pts.length-1;i++){
    const [px,py] = pts[i];
    const d = Math.abs(dy*px - dx*py + bx*ay - by*ax)/den;
    if(d > maxD){ maxD = d; idx = i; }
  }
  if(maxD > tol){
    const l = dp(pts.slice(0, idx+1), tol);
    const r = dp(pts.slice(idx), tol);
    return l.slice(0,-1).concat(r);
  }
  return [pts[0], pts[pts.length-1]];
}

// A closed ring degenerates DP (first==last makes a zero-length baseline),
// so split it at the vertex farthest from the start and simplify each half.
function dpRing(ring, tol){
  let pts = ring.slice();
  if(pts.length > 1){
    const a = pts[0], b = pts[pts.length-1];
    if(a[0]===b[0] && a[1]===b[1]) pts = pts.slice(0,-1);
  }
  if(pts.length < 4) return ring;
  let far = 0, fd = -1;
  for(let i=1;i<pts.length;i++){
    const d = Math.hypot(pts[i][0]-pts[0][0], pts[i][1]-pts[0][1]);
    if(d > fd){ fd = d; far = i; }
  }
  const h1 = dp(pts.slice(0, far+1), tol);
  const h2 = dp(pts.slice(far).concat([pts[0]]), tol);
  const out = h1.slice(0,-1).concat(h2);
  return out;
}

function ringArea(pts){ // rough deg^2 shoelace
  let a=0;
  for(let i=0,j=pts.length-1;i<pts.length;j=i++){
    a += (pts[j][0]+pts[i][0])*(pts[j][1]-pts[i][1]);
  }
  return Math.abs(a/2);
}

const TOL = 0.35;      // degrees
const MIN_AREA = 6;    // deg^2 — drops small islands
let rings = [];
for(const f of gj.features){
  const g = f.geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  for(const poly of polys){
    const outer = poly[0];                      // outer ring only
    if(ringArea(outer) < MIN_AREA) continue;
    let s = dpRing(outer, TOL).map(p => [Math.round(p[0]*10)/10, Math.round(p[1]*10)/10]);
    // drop consecutive duplicates after quantization
    s = s.filter((p,i)=> i===0 || p[0]!==s[i-1][0] || p[1]!==s[i-1][1]);
    if(s.length >= 4 && ringArea(s) >= MIN_AREA) rings.push(s);
  }
}
rings.sort((a,b)=> ringArea(b)-ringArea(a));

// delta-encode to a compact string: rings separated by ';', points by ' ', delta*10 as ints in base36
function enc(rings){
  return rings.map(r=>{
    let px=0, py=0, out=[];
    for(const [lon,lat] of r){
      const x = Math.round(lon*10), y = Math.round(lat*10);
      out.push((x-px).toString(36) + ',' + (y-py).toString(36));
      px=x; py=y;
    }
    return out.join(' ');
  }).join(';');
}
const encoded = enc(rings);
const pts = rings.reduce((n,r)=>n+r.length,0);
fs.writeFileSync('land-encoded.txt', encoded);
console.log('rings:', rings.length, 'points:', pts, 'encoded bytes:', encoded.length);
