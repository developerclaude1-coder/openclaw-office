/* scenes.js — the eight formations the field moves through, and the few
   drawn marks (a measure, rings, routes) that belong to individual scenes.

   Colour carries meaning across the whole piece:
     ink   = artists, and the land itself
     cool  = collectors and the industry
     amber = what the index lights up                                         */

function starPos(p, o) {
  var sway = reduce ? 0 : Math.sin(time * 0.07 * (0.4 + p.depth) + p.tw) * 16 * p.depth;
  o.x = p.u1 * W + sway + (0.5 - pointer.x) * 26 * p.depth;   // deeper stars shift more: parallax
  o.y = p.u2 * H + (0.5 - pointer.y) * 16 * p.depth;
}

/* 00 — cosmos: the whole field, undifferentiated */
function F_star(p, o) {
  starPos(p, o);
  o.c = p.u3 < 0.05 ? AMBER : (p.u3 < 0.1 ? COOL : INK);
  o.a = 0.2 + 0.62 * p.depth; o.s = 0.7 + 1.5 * p.depth; o.tw = 1;
}

/* 01 — the gap: two swarms and nothing between them */
function F_gap(p, o) {
  if (p.kind !== 2 && p.u4 < 0.12) {                // a few stay behind as distant stars
    starPos(p, o); o.c = INK; o.a = 0.1 + 0.2 * p.depth; o.s = 0.7 + p.depth; o.tw = 1; return;
  }
  var side = p.kind === 2 ? 1 : p.side;             // institutions belong with the industry
  var breathe = reduce ? 0 : Math.sin(time * 0.5 + p.tw) * 1.4;
  o.x = box.x + (side ? 1 : -1) * (S.dir === "rtl" ? -1 : 1) * box.w * 0.27 + p.g1 * box.sig + breathe;
  o.y = box.y + p.g2 * box.sig * 0.9;
  o.c = side ? COOL : INK;
  o.a = p.kind === 2 ? 0.95 : 0.55 + 0.35 * p.depth; o.s = p.kind === 2 ? 2.2 : 1.1 + p.depth * 1.1;
}

/* 02 — the atlas: land as a dot map, every real institution a point of light */
function F_map(p, o) {
  if (p.kind === 0) { project(p.lon, p.lat, o); o.c = INK; o.a = 0.56; o.s = clamp(gridStep * cam.s * 0.36, 1.1, 2.6); }
  else if (p.kind === 1) { starPos(p, o); o.c = INK; o.a = 0.06 + 0.1 * p.depth; o.s = 0.6 + p.depth * 0.8; o.tw = 1; }
  else { project(p.lon, p.lat, o); o.c = TYPE_COL[p.type]; o.a = 1; o.s = 3.2; o.g = thinFor(cam.s, "all")[p.mi]; }
}

function inUS(lon, lat) {                           // contiguous states, near enough for a dot map
  if (lat < 25.5 || lat > 49 || lon < -125 || lon > -67) return false;
  if (lat < 32.5 && (lon < -106 || lon > -80)) return false;
  if (lat > 45.5 && lon > -83 && lon < -71.5) return false;
  return true;
}

/* 03 — regions: the world dims and two editions light up */
function F_regions(p, o) {
  F_map(p, o);
  if (p.kind === 0) {
    if (inUS(p.lon, p.lat)) { o.c = AMBER; o.a = 0.85; } else o.a = 0.17;
  } else if (p.kind === 2) {
    if (p.ed !== "il" && p.ed !== "us") { o.a = 0.2; o.s = 2.2; o.g = 0; }
  }
}

/* 04 — collectors: the whole map again, in the collectors' colour */
function F_collect(p, o) {
  F_map(p, o);
  if (p.kind === 0) { o.c = COOL; o.a = 0.42; }
  else if (p.kind === 2) { o.a = 0.9; o.s = 2.8; o.g *= 0.5; }
}

/* 05 — the bridge: the two swarms return, and the logo's gap bar spans them */
function isBar(p) { return p.kind !== 2 && p.u5 < 0.22; }
function F_bridge(p, o) {
  if (isBar(p)) {
    o.x = box.x + (p.u1 * 2 - 1) * (box.w * 0.27 - box.sig * 0.35);
    o.y = box.y + (p.u2 - 0.5) * Math.max(5, box.sig * 0.16);
    o.c = AMBER; o.a = 0.95; o.s = 1.7; return;
  }
  F_gap(p, o);
}

/* 06 — resolution: everything streams out of one vanishing point */
function F_tunnel(p, o) {
  var f = (p.rad0 + tunnelPhase) % 1;
  var r = (0.02 + f * f) * Math.sqrt(W * W + H * H) * 0.62;
  o.x = W / 2 + Math.cos(p.theta) * r; o.y = box.y + Math.sin(p.theta) * r;
  o.c = p.u3 < 0.1 ? AMBER : (p.u3 < 0.2 ? COOL : INK);
  o.a = Math.min(1, f * 1.4) * 0.9; o.s = 0.6 + f * 2.4;
  o.st = f * f * (6 + tunnelSpeed * 90);
  o.a *= 0.3 + 0.7 * smooth(34, 84, o.y);           // thin out behind the top bar
  if (tunnelPocket > 0.01) {                        // and leave a pocket of dark for the wall label to be read in
    var u = S.dir === "rtl" ? 1 - o.x / W : o.x / W;
    o.a *= 1 - 0.9 * tunnelPocket * smooth(box.zb - 90, box.zb + 6, o.y) * (portrait ? 1 : 1 - smooth(0.42, 0.6, u));
  }
}

/* 07 — arrival: a still ring, the institutions set into it like stones */
function F_ring(p, o) {
  var rot = time * 0.03, th, R;
  if (p.kind === 2) { th = p.mi / MARKERS * TAU - Math.PI / 2 + rot * 0.5; R = ring.r * 0.8; o.c = TYPE_COL[p.type]; o.a = 1; o.s = 3; o.g = 0.5; }
  else if (p.u5 < 0.7) { th = p.theta + rot; R = ring.r * (1 + (p.u1 - 0.5) * 0.03); o.c = p.u3 < 0.16 ? AMBER : INK; o.a = 0.75; o.s = 1.3; }
  else { th = p.theta - rot * 0.6; R = ring.r * (1.2 + (p.u1 - 0.5) * 0.05); o.c = INK; o.a = 0.22; o.s = 1; }
  o.x = ring.x + Math.cos(th) * R; o.y = ring.y + Math.sin(th) * R;
}

/* ---------- per-particle delays, where the order of arrival means something ---------- */
function D_sweep(p) {                               // the map builds in reading direction
  if (p.kind === 0) { var u = (p.lon + 180) / 360; if (S.dir === "rtl") u = 1 - u; return 0.05 + 0.6 * u + p.delay * 0.1; }
  if (p.kind === 2) return 0.62 + p.delay * 0.38;   // institutions ignite last
  return p.delay;
}
function D_bridge(p) {                              // the bar shoots across from the reading start
  if (isBar(p)) return 0.3 + 0.7 * (S.dir === "rtl" ? 1 - p.u1 : p.u1);
  return p.delay * 0.35;
}

var SC = [
  { id: "cosmos", w: 0.9, form: F_star },
  { id: "gap", w: 1.2, form: F_gap },
  { id: "atlas", w: 1.3, form: F_map, delay: D_sweep },
  { id: "regions", w: 1.2, form: F_regions },
  { id: "collectors", w: 1.2, form: F_collect },
  { id: "bridge", w: 1.2, form: F_bridge, delay: D_bridge },
  { id: "resolution", w: 1.4, form: F_tunnel },
  { id: "enter", w: 0.9, form: F_ring }
];

/* how present a scene's own marks are: in once it has formed, out as the next begins */
function sceneW(i) {
  if (S.mode !== "story") return 0;
  if (S.ci === i) return i === 0 ? 1 : smooth(0.3, 0.46, S.t);
  if (S.ci === i + 1) return 1 - smooth(0, 0.1, S.t);
  return 0;
}

/* ---------- drawn marks ---------- */
/* the two editions, as bounds: [west, south, east, north] */
var REGIONS = [[34.2, 29.4, 35.9, 33.4], [-125.5, 24.3, -66.5, 49.6]];
var rb = { x0: 0, y0: 0, x1: 0, y1: 0 };
function regionBox(i) {                             // on screen; never smaller than a finger can read
  var g = REGIONS[i], pad = 5;
  project(g[0], g[3], tmp); var x0 = tmp.x, y0 = tmp.y;
  project(g[2], g[1], tmp); var x1 = tmp.x, y1 = tmp.y;
  var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  var hw = Math.max((x1 - x0) / 2 + pad, clamp(cam.s * 4.4, 11, 16)), hh = Math.max((y1 - y0) / 2 + pad, clamp(cam.s * 5.2, 13, 19));
  rb.x0 = cx - hw; rb.x1 = cx + hw; rb.y0 = cy - hh; rb.y1 = cy + hh;
  return rb;
}

/* Illustrative routes between art cities. These are a picture of collecting
   across borders, not measured flows — the wall label says so. None crosses
   the antimeridian, so no route has to wrap the map. */
var ROUTES = [
  [34.78, 32.08, -74, 40.71], [-0.12, 51.5, 3.38, 6.52], [-74, 40.71, -0.12, 51.5],
  [114.17, 22.3, -0.12, 51.5], [-46.63, -23.55, -80.2, 25.76], [139.7, 35.68, 151.2, -33.87],
  [55.3, 25.2, 72.88, 19.08], [2.35, 48.86, -17.47, 14.72], [18.42, -33.92, -0.12, 51.5],
  [126.98, 37.57, 114.17, 22.3], [-99.13, 19.43, -74, 40.71], [34.78, 32.08, 2.35, 48.86]
];

function drawMeasure(w) {                           // a dimension line across the void
  var L = box.w * 0.27 - box.sig * 1.75; if (L < 10) return;
  var y = box.y, x1 = box.x - L * w, x2 = box.x + L * w;
  ctx.strokeStyle = rgba(INK, 0.45 * w); ctx.lineWidth = 1;
  ctx.setLineDash([2, 5]); ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(x1, y - 7); ctx.lineTo(x1, y + 7); ctx.moveTo(x2, y - 7); ctx.lineTo(x2, y + 7); ctx.stroke();
}

function corners(x0, y0, x1, y1, arm) {             // a viewfinder: four corners, no sides
  ctx.beginPath();
  ctx.moveTo(x0, y0 + arm); ctx.lineTo(x0, y0); ctx.lineTo(x0 + arm, y0);
  ctx.moveTo(x1 - arm, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + arm);
  ctx.moveTo(x1, y1 - arm); ctx.lineTo(x1, y1); ctx.lineTo(x1 - arm, y1);
  ctx.moveTo(x0 + arm, y1); ctx.lineTo(x0, y1); ctx.lineTo(x0, y1 - arm);
  ctx.stroke();
}
function drawRegions(w) {
  for (var i = 0; i < REGIONS.length; i++) {
    var b = regionBox(i), arm = Math.min(13, (b.x1 - b.x0) * 0.3);
    var open = (1 - w) * 14;                        // the frame closes in on its region as it appears
    ctx.lineWidth = 1.5; ctx.strokeStyle = rgba(AMBER, 0.95 * w);
    corners(b.x0 - open, b.y0 - open, b.x1 + open, b.y1 + open, arm);
    if (reduce) continue;
    var pulse = (time * 0.4 + i * 0.5) % 1, e = pulse * 12;
    ctx.lineWidth = 1; ctx.strokeStyle = rgba(AMBER, 0.55 * w * (1 - pulse));
    corners(b.x0 - e, b.y0 - e, b.x1 + e, b.y1 + e, arm);
  }
}

function drawRoutes(w) {
  var u = S.ci === 4 ? clamp((S.t - 0.3) / 0.5, 0, 1) : 1;
  ctx.lineWidth = 1;
  for (var i = 0; i < ROUTES.length; i++) {
    var r = ROUTES[i];
    project(r[0], r[1], tmp); var x1 = tmp.x, y1 = tmp.y;
    project(r[2], r[3], tmp); var x2 = tmp.x, y2 = tmp.y;
    var lift = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) * 0.28;
    var qx = (x1 + x2) / 2, qy = (y1 + y2) / 2 - lift;
    var f = reduce ? 1 : clamp(u * 1.7 - i * 0.055, 0, 1);
    if (f <= 0) continue;
    ctx.strokeStyle = rgba(COOL, 0.55 * w);
    ctx.beginPath();
    for (var j = 0, N = 30; j <= N; j++) {
      var t = Math.min(j / N, f), q = 1 - t;
      var x = q * q * x1 + 2 * q * t * qx + t * t * x2, y = q * q * y1 + 2 * q * t * qy + t * t * y2;
      if (j) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      if (j / N >= f) break;
    }
    ctx.stroke();
    ctx.fillStyle = rgba(COOL, 0.9 * w);
    ctx.beginPath(); ctx.arc(x1, y1, 2, 0, TAU); ctx.fill();
    if (f >= 1) {
      ctx.beginPath(); ctx.arc(x2, y2, 2, 0, TAU); ctx.fill();
      if (!reduce) {                               // something travelling the route
        var k = (time * 0.22 + i * 0.137) % 1, kq = 1 - k;
        ctx.fillStyle = rgba(INK, 0.95 * w);
        ctx.beginPath();
        ctx.arc(kq * kq * x1 + 2 * kq * k * qx + k * k * x2, kq * kq * y1 + 2 * kq * k * qy + k * k * y2, 1.9, 0, TAU);
        ctx.fill();
      }
    }
  }
}

function drawFlow(w) {                              // traffic along the bridge, both ways
  var half = box.w * 0.27 - box.sig * 0.35;
  ctx.fillStyle = rgba(INK, 0.95 * w);
  for (var i = 0; i < 8; i++) {
    var f = (time * 0.16 + i / 8) % 1; if (i % 2) f = 1 - f;
    ctx.beginPath(); ctx.arc(box.x - half + f * half * 2, box.y, 1.8, 0, TAU); ctx.fill();
  }
}

function drawRingMarks(w) {
  ctx.lineWidth = 1; ctx.strokeStyle = rgba(INK, 0.2 * w);
  ctx.beginPath(); ctx.arc(ring.x, ring.y, ring.r, 0, TAU); ctx.stroke();
  ctx.lineWidth = 1.4; ctx.strokeStyle = rgba(AMBER, 0.9 * w);
  ctx.beginPath();
  [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (d) {
    ctx.moveTo(ring.x + d[0] * (ring.out - 14), ring.y + d[1] * (ring.out - 14));
    ctx.lineTo(ring.x + d[0] * ring.out, ring.y + d[1] * ring.out);
  });
  ctx.stroke();
}

var pulseIdx = -1;                                  // an institution to ripple, set by the search exhibit
function drawPulse() {
  if (pulseIdx < 0) return;
  var pl = DATA.places[pulseIdx]; project(pl.lon, pl.lat, tmp);
  var k = reduce ? 0.5 : (time * 0.7) % 1;
  ctx.lineWidth = 1.4; ctx.strokeStyle = rgba(AMBER, 0.9 * (1 - k));
  ctx.beginPath(); ctx.arc(tmp.x, tmp.y, 7 + k * 22, 0, TAU); ctx.stroke();
  ctx.strokeStyle = rgba(AMBER, 0.9);
  ctx.beginPath(); ctx.arc(tmp.x, tmp.y, 7, 0, TAU); ctx.stroke();
}

function drawExtras() {
  var w;
  if ((w = sceneW(1)) > 0.01) drawMeasure(w);
  if (sceneW(2) > 0.5) drawPulse();
  if ((w = sceneW(3)) > 0.01) drawRegions(w);
  if ((w = sceneW(4)) > 0.01) drawRoutes(w);
  if ((w = sceneW(5)) > 0.01) drawFlow(w);
  if ((w = sceneW(7)) > 0.01) drawRingMarks(w);
}
