/* engine.js — the stage: layout, the particle field, and morphing between
   formations. Every formation is a function (particle, out) that says where a
   particle belongs and how it looks; the engine tweens between two of them. */

var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var root = document.documentElement;
var scroller = document.getElementById("scroller");
var stage = document.getElementById("stage");
var cv = document.getElementById("cv");
var ctx = cv.getContext("2d");
var TAU = Math.PI * 2;

var W = 0, H = 0, DPR = 1, portrait = false;
var box = { x: 0, y: 0, w: 0, h: 0, sig: 0, zb: 0 };   // the exhibit zone; zb is where the wall label starts
var ring = { x: 0, y: 0, r: 0, out: 0 };           // the aperture you press to enter
var storyCam = { s: 1, lon0: 0, lat0: 13, sx: 0, sy: 0 };
var appCam = { s: 1, lon0: 0, lat0: 13, sx: 0, sy: 0 };
var cam = storyCam;                                // whichever camera the map is using now

var time = 0, tunnelPhase = 0, tunnelSpeed = 0, tunnelPocket = 0;
var auto = null;                                   // set while the piece is playing itself
var pointer = { x: 0.5, y: 0.5 };
var S = { mode: "story", pRaw: 0, p: 0, ci: 0, t: 0, tone: 0, over: null, lang: "en", dir: "ltr" };

var P = [], RINGS = [], gridStep = 3, MARKERS = 0;

/* logical colours; each has a night and a day value and the tone mixes them */
var INK = 0, AMBER = 1, COOL = 2, VIOLET = 3;
var NIGHT = [[237, 239, 247], [242, 169, 59], [127, 178, 217], [199, 125, 255]];
var DAY = [[18, 18, 16], [163, 94, 9], [42, 96, 118], [109, 69, 150]];
var BG_NIGHT = [10, 13, 24], BG_DAY = [250, 248, 245];
var TYPE_COL = { Museum: AMBER, Gallery: COOL, Biennial: VIOLET };

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function smooth(a, b, v) { var x = clamp((v - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }
function easeIO(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
function easeOut(x) { return 1 - Math.pow(1 - x, 3); }

/* equirectangular, through whichever camera is active */
function project(lon, lat, o) {
  o.x = cam.sx + (lon - cam.lon0) * cam.s;
  o.y = cam.sy - (lat - cam.lat0) * cam.s;
}

/* ---------- land ---------- */
function decodeLand(enc) {
  var bar = enc.indexOf("|"), prec = 10, body = enc;
  if (bar > 0 && bar < 8) { prec = parseInt(enc.slice(0, bar), 10) || 10; body = enc.slice(bar + 1); }
  return body.split(";").map(function (r) {
    var px = 0, py = 0;
    return r.split(" ").map(function (p) {
      var a = p.split(",");
      px += parseInt(a[0], 36); py += parseInt(a[1], 36);
      return [px / prec, py / prec];
    });
  });
}

/* Turn the coastline into an evenly spaced dot map. The land is rasterised
   once off-screen and a staggered grid is tested against it; the grid step is
   widened until the dots fit the particle budget, so every dot has a particle. */
function sampleLand(rings, want) {
  var RW = 1440, RH = 720, oc = document.createElement("canvas");
  oc.width = RW; oc.height = RH;
  var o = oc.getContext("2d");
  o.fillStyle = "#000";
  rings.forEach(function (r) {
    o.beginPath();
    for (var i = 0; i < r.length; i++) {
      var x = (r[i][0] + 180) / 360 * RW, y = (90 - r[i][1]) / 180 * RH;
      if (i) o.lineTo(x, y); else o.moveTo(x, y);
    }
    o.closePath(); o.fill();
  });
  var img = o.getImageData(0, 0, RW, RH).data;
  function isLand(lon, lat) {
    var x = Math.floor((lon + 180) / 360 * RW), y = Math.floor((90 - lat) / 180 * RH);
    if (x < 0 || x >= RW || y < 0 || y >= RH) return false;
    return img[(y * RW + x) * 4 + 3] > 127;
  }
  var best = [];
  for (var step = 1.5; step <= 7; step += 0.1) {
    var pts = [], row = 0;
    for (var lat = 81; lat >= -56; lat -= step * 0.9, row++) {
      var off = (row % 2) * step / 2;
      for (var lon = -179 + off; lon < 180; lon += step) if (isLand(lon, lat)) pts.push([lon, lat]);
    }
    best = pts; gridStep = step;
    if (pts.length <= want) break;
  }
  return best;
}

/* ---------- particles ---------- */
function rng(seed) {                               // deterministic, so the composition is stable
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var SWARM_R = 2.3;                                 // a swarm's radius, in units of its spread

function buildParticles() {
  var r = rng(20261109);
  var total = Math.min(window.innerWidth, window.innerHeight) < 620 ? 1050 : 2100;
  var land = sampleLand(RINGS, Math.round(total * 0.82));
  var floor = Math.exp(-SWARM_R * SWARM_R / 2);
  P = [];
  function make(kind) {
    /* A normal pair cut off at a radius by narrowing the draw rather than by
       clamping, so a swarm thins out to a round edge with nothing piled on it. */
    var gm = Math.sqrt(-2 * Math.log(floor + (1 - floor) * r())), ga = r() * TAU;
    return {
      kind: kind, lon: 0, lat: 0, type: "", ed: "", mi: 0, side: P.length % 2,
      u1: r(), u2: r(), u3: r(), u4: r(), u5: r(), g1: gm * Math.cos(ga), g2: gm * Math.sin(ga),
      theta: r() * TAU, rad0: r(), delay: r(), sw: r() * 2 - 1, tw: r() * TAU, depth: r()
    };
  }
  land.forEach(function (ll) { var p = make(0); p.lon = ll[0]; p.lat = ll[1]; P.push(p); });
  for (var i = land.length; i < total; i++) P.push(make(1));
  DATA.places.forEach(function (pl, i) {            // every real institution is its own particle
    var p = make(2); p.lon = pl.lon; p.lat = pl.lat; p.type = pl.t; p.ed = pl.ed; p.mi = i; p.side = 1;
    P.push(p);
  });
  MARKERS = DATA.places.length;
  MB = new Float32Array(MARKERS * 8);
}

/* ---------- layout ---------- */
function layout() {
  W = stage.clientWidth; H = stage.clientHeight;
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  portrait = W / H < 1.15;
  var short = !portrait && H < 520;                // a phone on its side: room for captions, not paragraphs
  /* The wall label needs a fixed amount of room whatever the window, so on a
     shallow window the exhibit gives up height rather than the words. */
  var top = portrait ? 58 : 66;
  var zoneBottom = portrait ? H * 0.41 : short ? H - 100 : Math.min(H * 0.655, H - 272);
  box.w = Math.min(W * (portrait ? 0.92 : 0.86), 1240);
  box.h = Math.max(120, zoneBottom - top - (portrait ? 10 : 22));
  box.x = W / 2; box.y = top + (zoneBottom - top) / 2; box.zb = zoneBottom;
  box.sig = Math.min(box.w * 0.075, box.h * 0.19);
  storyCam.s = Math.min(box.w / 360, box.h / 140);
  storyCam.sx = box.x; storyCam.sy = box.y;
  ring.r = portrait ? Math.min(W * 0.32, H * 0.18) : Math.min(W * 0.2, H * (short ? 0.2 : 0.225));
  ring.x = W / 2; ring.y = H * (portrait ? 0.46 : short ? 0.58 : H < 700 ? 0.55 : 0.535);
  ring.out = ring.r * 1.2 + 28;                    // the outer halo and its four ticks end here
  stage.style.setProperty("--zone-bottom", Math.round(zoneBottom) + "px");
  stage.style.setProperty("--zone-mid", Math.round(box.y) + "px");
  stage.style.setProperty("--ring-y", Math.round(ring.y) + "px");
  stage.style.setProperty("--ring-r", Math.round(ring.r) + "px");
  stage.style.setProperty("--ring-out", Math.round(ring.out) + "px");
}

/* ---------- colour ---------- */
var CC = {}, SPR = {};
function colStr(ca, cb, m) {                       // blended, tone-aware, cached
  var q = ca === cb ? 0 : Math.round(m * 8), tq = Math.round(S.tone * 16);
  var key = ca + cb * 4 + q * 16 + tq * 160, v = CC[key];
  if (v) return v;
  var t = tq / 16, f = q / 8, out = [];
  for (var i = 0; i < 3; i++) {
    out.push(Math.round(lerp(lerp(NIGHT[ca][i], DAY[ca][i], t), lerp(NIGHT[cb][i], DAY[cb][i], t), f)));
  }
  return CC[key] = "rgb(" + out.join(",") + ")";
}
function rgba(ci, a) {
  var t = S.tone;
  return "rgba(" + Math.round(lerp(NIGHT[ci][0], DAY[ci][0], t)) + "," + Math.round(lerp(NIGHT[ci][1], DAY[ci][1], t)) +
    "," + Math.round(lerp(NIGHT[ci][2], DAY[ci][2], t)) + "," + a + ")";
}
function glow(ci) {                                // a soft halo sprite, drawn instead of a gradient per marker
  var tq = Math.round(S.tone * 4), key = ci + tq * 8, s = SPR[key];
  if (s) return s;
  var t = tq / 4, c = [0, 1, 2].map(function (i) { return Math.round(lerp(NIGHT[ci][i], DAY[ci][i], t)); }).join(",");
  s = document.createElement("canvas"); s.width = s.height = 64;
  var g = s.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(" + c + ",.55)"); gr.addColorStop(1, "rgba(" + c + ",0)");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return SPR[key] = s;
}

/* Institutions cluster: a dozen share a few pixels in New York. Each halo is
   thinned by how many neighbours overlap it at a given zoom, so a busy city
   glows instead of burning out. Counted once per zoom step and filter. */
var THIN = {};
function thinFor(scale, filter) {
  var key = Math.round(Math.log(scale) * 6) + filter, t = THIN[key];
  if (t) return t;
  var pl = DATA.places, n = pl.length, reach = 12 / scale, r2 = reach * reach;
  t = new Float32Array(n);
  for (var i = 0; i < n; i++) {
    var c = 0;
    for (var j = 0; j < n; j++) {
      if (filter !== "all" && pl[j].t !== filter) continue;
      var dx = pl[i].lon - pl[j].lon, dy = pl[i].lat - pl[j].lat;
      if (dx * dx + dy * dy < r2) c++;
    }
    t[i] = Math.pow(Math.max(1, c), -0.8);
  }
  return THIN[key] = t;
}

/* ---------- the field ---------- */
function mkOut() { return { x: 0, y: 0, c: 0, a: 0, s: 1, tw: 0, g: 0, st: 0 }; }
var oa = mkOut(), ob = mkOut(), tmp = mkOut(), MB = null;

/* Draws every ordinary particle and buffers the institutions, which are drawn
   afterwards so they always sit on top. Returns how many were buffered. */
function drawField() {
  var A, B, mt, delayFn;
  if (S.over) { A = S.over.A; B = S.over.B; mt = S.over.m; delayFn = S.over.delay; }
  else {
    var sc = SC[S.ci];
    B = sc.form; A = S.ci > 0 ? SC[S.ci - 1].form : B;
    mt = S.ci > 0 ? clamp(S.t / 0.42, 0, 1) : 1;   // a scene forms in its first 42%, then holds
    delayFn = sc.delay;
    if (reduce) mt = 1;                            // reduced motion: cut, never tween
  }
  var n = P.length, mi = 0, cx = W / 2, cy = box.y;
  for (var k = 0; k < n; k++) {
    var p = P[k];
    ob.tw = 0; ob.g = 0; ob.st = 0;
    B(p, ob);
    var x = ob.x, y = ob.y, a = ob.a, s = ob.s, g = ob.g, st = ob.st, tw = ob.tw, ca = ob.c, m = 1;
    if (mt < 1) {
      var d = delayFn ? delayFn(p) : p.delay;      // each particle leaves a little after the last
      m = easeIO(clamp((mt - d * 0.5) / 0.5, 0, 1));
      if (m < 1) {
        oa.tw = 0; oa.g = 0; oa.st = 0;
        A(p, oa);
        var dx = ob.x - oa.x, dy = ob.y - oa.y, sw = Math.sin(Math.PI * m) * p.sw * 0.14;
        x = oa.x + dx * m - dy * sw; y = oa.y + dy * m + dx * sw;   // a slight arc, not a straight line
        a = oa.a + (ob.a - oa.a) * m; s = oa.s + (ob.s - oa.s) * m;
        g = oa.g + (ob.g - oa.g) * m; st = oa.st + (ob.st - oa.st) * m; tw = oa.tw + (ob.tw - oa.tw) * m;
        ca = oa.c;
      }
    }
    if (tw > 0 && !reduce) a *= 1 - tw * 0.24 * (0.5 + 0.5 * Math.sin(time * 1.7 + p.tw));
    if (a < 0.015 || x < -24 || x > W + 24 || y < -24 || y > H + 24) continue;
    if (p.kind === 2) {
      var j = mi * 8;
      MB[j] = x; MB[j + 1] = y; MB[j + 2] = a; MB[j + 3] = s; MB[j + 4] = g; MB[j + 5] = ca; MB[j + 6] = ob.c; MB[j + 7] = m;
      mi++; continue;
    }
    var col = colStr(ca, ob.c, m);
    ctx.globalAlpha = a;
    if (st > 1) {                                  // tunnel streak, trailing back toward the vanishing point
      var vx = x - cx, vy = y - cy, vl = Math.sqrt(vx * vx + vy * vy) || 1;
      ctx.strokeStyle = col; ctx.lineWidth = Math.max(0.6, s * 0.55);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - vx / vl * st, y - vy / vl * st); ctx.stroke();
    }
    ctx.fillStyle = col;
    if (s < 2) ctx.fillRect(x - s / 2, y - s / 2, s, s);
    else { ctx.beginPath(); ctx.arc(x, y, s / 2, 0, TAU); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
  return mi;
}

function drawMarkers(count) {
  for (var i = 0; i < count; i++) {
    var j = i * 8, x = MB[j], y = MB[j + 1], a = MB[j + 2], s = MB[j + 3], g = MB[j + 4];
    var ca = MB[j + 5], cb = MB[j + 6], m = MB[j + 7];
    if (g > 0.02) {
      var r = s * 3.6;
      ctx.globalAlpha = a * g;
      ctx.drawImage(glow(m < 0.5 ? ca : cb), x - r, y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = a;
    ctx.fillStyle = colStr(ca, cb, m);
    ctx.beginPath(); ctx.arc(x, y, s / 2, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
