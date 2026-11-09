/* atlas.js — the world you arrive in. The dot map stays, real coastlines
   resolve underneath it, and the institutions become things you can reach:
   pan, zoom, pinch, search and filter. */

var AT = { alpha: 0, mk: 0, hover: -1, focus: -1, filter: "all", dirty: true, anim: null, fit: 1 };
var PL = DATA.places;
var appEl = document.getElementById("app"), tipEl = document.getElementById("tip");
var qEl = document.getElementById("q"), qrEl = document.getElementById("qr"), chipsEl = document.getElementById("chips");
var mzEl = document.getElementById("mz"), mbEl = document.getElementById("mb"), mcEl = document.getElementById("mc");
var hintEl = document.getElementById("hint");
var RING_MAXLAT = [];

function T(k) { return STR[S.lang][k]; }
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}
/* institutions carry Hebrew fields only where they exist; fall back to English */
function placeName(pl) { return S.lang === "he" && pl.nh ? pl.nh : pl.n; }
function placeCity(pl) { return S.lang === "he" && pl.ch ? pl.ch : pl.c; }
function placeCountry(pl) { return S.lang === "he" && pl.kh ? pl.kh : pl.k; }
function placeNote(pl) { return (S.lang === "he" ? pl.oh : pl.o) || ""; }
function placeWhere(pl) { var c = placeCity(pl), k = placeCountry(pl); return c === k ? c : c + ", " + k; }
function typeLabel(t) { return T(t === "Museum" ? "tMuseum" : t === "Gallery" ? "tGallery" : "tBiennial"); }
function visible(pl) { return AT.filter === "all" || pl.t === AT.filter; }

/* the field's final formation: the dot map under the live camera */
function F_app(p, o) {
  if (p.kind === 0) {
    project(p.lon, p.lat, o); o.c = INK;
    o.a = 0.26 * clamp(1.7 - (appCam.s / AT.fit) * 0.5, 0, 1);   // dots give way to coastlines as you zoom
    o.s = clamp(gridStep * cam.s * 0.3, 1, 2.4);
  } else if (p.kind === 1) { starPos(p, o); o.c = INK; o.a = 0; o.s = 1; }
  else { project(p.lon, p.lat, o); o.c = TYPE_COL[p.type]; o.a = 1 - AT.mk; o.s = 3.4; o.g = 0.6 * thinFor(cam.s, "all")[p.mi]; }
}

/* ---------- camera ---------- */
/* The map keeps clear of the interface: the search row above, the shelf of
   doors and the readout below. On a wide window the whole world fits. On a tall
   one it would shrink to a ribbon, so there it fills the height instead and you
   pan across it, opening on Europe, Africa and the Middle East. */
var HOME = { lon: 0, lat: 13 }, MAX_ZOOM = 64, FLY_ZOOM = 20;
function camFit() {
  var squat = !portrait && H < 520;                 // a phone on its side
  var top = W <= 820 ? 150 : 104, bottom = squat ? 104 : 150, free = Math.max(120, H - top - bottom);
  AT.fit = Math.min(W / 360, free / 140);
  if (portrait) AT.fit = clamp(free / 140, W / 360, W / 360 * 3.2);
  HOME.lon = AT.fit > W / 360 + 0.001 ? 18 : 0;
  appCam.sx = W / 2; appCam.sy = top + free / 2;
  return AT.fit;
}
function camReset() { appCam.s = camFit(); appCam.lon0 = HOME.lon; appCam.lat0 = HOME.lat; camClamp(); }
function camClamp() {
  var c = appCam; c.s = clamp(c.s, AT.fit, AT.fit * MAX_ZOOM);
  var hx = (W / 2) / c.s, hy = (H / 2) / c.s;
  c.lon0 = hx >= 180 ? 0 : clamp(c.lon0, -180 + hx, 180 - hx);
  c.lat0 = hy >= 70 ? 13 : clamp(c.lat0, -57 + hy, 83 - hy);
}
function zoomAt(px, py, s2) {                       // keep the point under the cursor where it is
  var c = appCam, lon = c.lon0 + (px - c.sx) / c.s, lat = c.lat0 - (py - c.sy) / c.s;
  c.s = clamp(s2, AT.fit, AT.fit * MAX_ZOOM);
  c.lon0 = lon - (px - c.sx) / c.s; c.lat0 = lat + (py - c.sy) / c.s;
  camClamp(); AT.dirty = true;
}
function flyTo(lon, lat, s, cb) {
  var c = appCam;
  if (reduce) { c.s = s; c.lon0 = lon; c.lat0 = lat; camClamp(); AT.dirty = true; if (cb) cb(); return; }
  AT.anim = { t0: performance.now(), dur: 900, from: { s: c.s, lon0: c.lon0, lat0: c.lat0 }, to: { s: s, lon0: lon, lat0: lat }, cb: cb };
}
function stepFly(now) {
  var an = AT.anim; if (!an) return;
  var k = clamp((now - an.t0) / an.dur, 0, 1), e = easeOut(k), c = appCam;
  c.s = Math.exp(lerp(Math.log(an.from.s), Math.log(an.to.s), e));   // zoom reads evenly in log space
  c.lon0 = lerp(an.from.lon0, an.to.lon0, e); c.lat0 = lerp(an.from.lat0, an.to.lat0, e);
  camClamp(); AT.dirty = true;
  if (k >= 1) { AT.anim = null; if (an.cb) an.cb(); }
}

/* ---------- drawing ---------- */
function atlasUnder() {                             // real coastlines, resolving in under the dots
  if (AT.alpha < 0.01) return;
  var c = cam;
  ctx.globalAlpha = AT.alpha; ctx.fillStyle = "#FFFFFF"; ctx.strokeStyle = "rgba(18,18,16,.3)"; ctx.lineWidth = 0.9;
  for (var i = 0; i < RINGS.length; i++) {
    if (RING_MAXLAT[i] < -59) continue;             // the dot map stops short of Antarctica; so does this
    /* Each ring is drawn as a curve through the midpoints of its sides. At
       world scale that is indistinguishable from the polygon; zoomed far in,
       the coast stays a soft line instead of breaking into facets. */
    var r = RINGS[i], m = r.length - 1;             // rings are closed: the last point repeats the first
    if (m < 3) continue;
    var px = c.sx + (r[m - 1][0] - c.lon0) * c.s, py = c.sy - (r[m - 1][1] - c.lat0) * c.s;
    var x = c.sx + (r[0][0] - c.lon0) * c.s, y = c.sy - (r[0][1] - c.lat0) * c.s;
    ctx.beginPath(); ctx.moveTo((px + x) / 2, (py + y) / 2);
    for (var j = 1; j <= m; j++) {
      var k = j === m ? 0 : j;
      var nx = c.sx + (r[k][0] - c.lon0) * c.s, ny = c.sy - (r[k][1] - c.lat0) * c.s;
      ctx.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2);
      x = nx; y = ny;
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function atlasOver() {
  if (AT.mk < 0.01) return;
  var showLabels = W / cam.s < 75, queue = [], thin = thinFor(cam.s, AT.filter);
  for (var i = 0; i < PL.length; i++) {
    var pl = PL[i];
    if (!visible(pl)) continue;
    project(pl.lon, pl.lat, tmp);
    if (tmp.x < -40 || tmp.x > W + 40 || tmp.y < -40 || tmp.y > H + 40) continue;
    var hot = i === AT.hover || i === AT.focus, ci = TYPE_COL[pl.t], r = hot ? 6 : 3.8, col = colStr(ci, ci, 1);
    ctx.globalAlpha = AT.mk * (hot ? 0.9 : 0.6 * thin[i]);
    ctx.drawImage(glow(ci), tmp.x - r * 3.4, tmp.y - r * 3.4, r * 6.8, r * 6.8);
    ctx.globalAlpha = AT.mk; ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(tmp.x, tmp.y, r, 0, TAU); ctx.fill();
    if (hot) { ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(tmp.x, tmp.y, r + 5.5, 0, TAU); ctx.stroke(); }
    if (showLabels) queue.push({ i: i, x: tmp.x, y: tmp.y, hot: hot });
  }
  if (queue.length) {
    /* Names, drawn last. Dense districts would overprint into mush, so a name
       is dropped when its box meets one already placed; hovered names go first. */
    var rtl = S.dir === "rtl", placed = [];
    ctx.font = '500 11.5px "Heebo",system-ui,sans-serif'; ctx.textBaseline = "middle";
    ctx.textAlign = "left"; ctx.lineJoin = "round";
    queue.sort(function (a, b) { return (b.hot ? 1 : 0) - (a.hot ? 1 : 0); });
    queue.forEach(function (q) {
      var name = placeName(PL[q.i]), w = ctx.measureText(name).width;
      var x = rtl ? q.x - 10 - w : q.x + 10, b = { x0: x - 3, y0: q.y - 8, x1: x + w + 3, y1: q.y + 8 };
      for (var k = 0; k < placed.length; k++) {
        var o = placed[k];
        if (!(b.x1 < o.x0 || b.x0 > o.x1 || b.y1 < o.y0 || b.y0 > o.y1)) return;
      }
      placed.push(b);
      if (q.i === tipFor) return;                   // the open tooltip already names it; keep the space, skip the text
      ctx.globalAlpha = AT.mk;
      ctx.strokeStyle = "rgba(250,248,245,.92)"; ctx.lineWidth = 3; ctx.strokeText(name, x, q.y);
      ctx.fillStyle = "#121210"; ctx.fillText(name, x, q.y);
    });
    ctx.textBaseline = "alphabetic";
  }
  ctx.globalAlpha = 1;
}

/* ---------- tooltip, readout ---------- */
function pick(x, y, rad) {
  var best = -1, bd = rad;
  for (var i = 0; i < PL.length; i++) {
    if (!visible(PL[i])) continue;
    project(PL[i].lon, PL[i].lat, tmp);
    var d = Math.sqrt((tmp.x - x) * (tmp.x - x) + (tmp.y - y) * (tmp.y - y));
    if (d < bd) { bd = d; best = i; }
  }
  return best;
}
var tipFor = -1;                                    // whose tooltip is open; its map label is then redundant
function showTip(i) {
  var pl = PL[i]; project(pl.lon, pl.lat, tmp);
  if (tipFor !== i) { tipFor = i; AT.dirty = true; }
  tipEl.querySelector(".t").textContent = placeName(pl);
  tipEl.querySelector(".s").textContent = placeWhere(pl) + " · " + typeLabel(pl.t);
  tipEl.querySelector(".n").textContent = placeNote(pl);
  tipEl.style.left = clamp(tmp.x, 140, Math.max(140, W - 140)) + "px"; tipEl.style.top = tmp.y + "px";
  tipEl.style.transform = tmp.y < 210 ? "translate(-50%,18px)" : "translate(-50%,calc(-100% - 16px))";
  tipEl.style.opacity = 1;
}
function hideTip() { tipEl.style.opacity = 0; if (tipFor !== -1) { tipFor = -1; AT.dirty = true; } }
function updateHud() {
  var d = W / cam.s, n = 0;
  for (var i = 0; i < PL.length; i++) if (visible(PL[i])) n++;
  mzEl.textContent = (appCam.s / AT.fit).toFixed(1) + "×";
  mbEl.textContent = T(d > 150 ? "bandWorld" : d > 12 ? "bandRegion" : "bandCity");
  mcEl.textContent = n + " " + T("plotted");
}

/* ---------- pointer: drag to pan, pinch or wheel to zoom, tap to select ---------- */
var ptrs = {}, dragFrom = null, pinch = null, moved = 0;
function ptrList() { return Object.keys(ptrs).map(function (k) { return ptrs[k]; }); }
function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

cv.addEventListener("pointerdown", function (e) {
  if (S.mode !== "app") return;
  try { cv.setPointerCapture(e.pointerId); } catch (err) {}
  ptrs[e.pointerId] = local(e);
  hintEl.classList.add("gone");
  var l = ptrList(); moved = 0; AT.anim = null;
  if (l.length === 1) { dragFrom = l[0]; cv.classList.add("dragging"); }
  else if (l.length === 2) { dragFrom = null; pinch = { d: Math.hypot(l[0].x - l[1].x, l[0].y - l[1].y), s: appCam.s }; }
});
cv.addEventListener("pointermove", function (e) {
  if (S.mode !== "app") return;
  var pt = local(e);
  if (ptrs[e.pointerId]) {
    var prev = ptrs[e.pointerId]; ptrs[e.pointerId] = pt;
    var l = ptrList();
    if (pinch && l.length === 2) {
      var d = Math.hypot(l[0].x - l[1].x, l[0].y - l[1].y);
      zoomAt((l[0].x + l[1].x) / 2, (l[0].y + l[1].y) / 2, pinch.s * d / pinch.d); moved = 99;
    } else if (dragFrom) {
      var dx = pt.x - prev.x, dy = pt.y - prev.y;
      moved += Math.abs(dx) + Math.abs(dy);
      appCam.lon0 -= dx / appCam.s; appCam.lat0 += dy / appCam.s;
      camClamp(); AT.dirty = true;
    }
    return;
  }
  if (e.pointerType === "mouse") {
    var h = pick(pt.x, pt.y, 14);
    if (h !== AT.hover) { AT.hover = h; AT.dirty = true; }
    if (h >= 0) showTip(h); else if (AT.focus >= 0) showTip(AT.focus); else hideTip();
  }
});
function ptrEnd(e) {
  if (!ptrs[e.pointerId]) return;
  var pt = ptrs[e.pointerId]; delete ptrs[e.pointerId];
  var l = ptrList();
  if (l.length < 2) pinch = null;
  if (l.length === 0) {
    cv.classList.remove("dragging"); dragFrom = null;
    if (moved < 6 && e.type === "pointerup") {      // a tap, not a drag
      var h = pick(pt.x, pt.y, e.pointerType === "mouse" ? 14 : 24);
      AT.focus = h; AT.dirty = true;
      if (h >= 0) showTip(h); else hideTip();
    }
  } else dragFrom = l[0];
}
cv.addEventListener("pointerup", ptrEnd);
cv.addEventListener("pointercancel", ptrEnd);
cv.addEventListener("pointerleave", function (e) {
  if (S.mode !== "app" || e.pointerType !== "mouse" || ptrs[e.pointerId]) return;
  if (AT.hover !== -1) { AT.hover = -1; AT.dirty = true; }
  if (AT.focus < 0) hideTip();
});
cv.addEventListener("wheel", function (e) {
  if (S.mode !== "app") return;                     // while the story is playing, the wheel scrolls it
  e.preventDefault(); hintEl.classList.add("gone");
  var pt = local(e); AT.anim = null;
  zoomAt(pt.x, pt.y, appCam.s * Math.exp(-e.deltaY * 0.0016));
}, { passive: false });
cv.addEventListener("dblclick", function (e) {
  if (S.mode !== "app") return;
  var pt = local(e), c = appCam;
  flyTo(c.lon0 + (pt.x - c.sx) / c.s * 0.5, c.lat0 - (pt.y - c.sy) / c.s * 0.5, c.s * 2);
});

document.getElementById("zi").addEventListener("click", function () { flyTo(appCam.lon0, appCam.lat0, appCam.s * 1.8); });
document.getElementById("zo").addEventListener("click", function () { flyTo(appCam.lon0, appCam.lat0, Math.max(AT.fit, appCam.s / 1.8)); });
document.getElementById("zr").addEventListener("click", function () {
  AT.focus = -1; hideTip(); flyTo(HOME.lon, HOME.lat, AT.fit);
});

/* ---------- search and filters ---------- */
function closeSearch() { qrEl.classList.remove("on"); qrEl.innerHTML = ""; qEl.setAttribute("aria-expanded", "false"); }
function goTo(i) {
  var pl = PL[i];
  if (!visible(pl)) { AT.filter = "all"; buildChips(); }
  AT.focus = -1; hideTip();
  flyTo(pl.lon, pl.lat, Math.max(appCam.s, AT.fit * FLY_ZOOM), function () { AT.focus = i; AT.dirty = true; showTip(i); });
}
/* How well a place answers a query: its name first, then its city, then its
   country. City and country only count from the start of a word, otherwise
   "tate" would return everything in the United States. */
function rank(pl, s) {
  var names = [pl.n, pl.nh || ""], k, at;
  for (k = 0; k < 2; k++) {
    var nm = names[k].toLowerCase(); at = nm.indexOf(s);
    if (at === 0) return 0;
    if (at > 0) return /[\s(\-–־"׳״]/.test(nm.charAt(at - 1)) ? 1 : 2;
  }
  if ((" " + pl.c + " " + (pl.ch || "")).toLowerCase().indexOf(" " + s) >= 0) return 3;
  if ((" " + pl.k + " " + (pl.kh || "")).toLowerCase().indexOf(" " + s) >= 0) return 4;
  return -1;
}
qEl.addEventListener("input", function () {
  var s = qEl.value.trim().toLowerCase();
  if (!s) { closeSearch(); return; }
  var found = [];
  for (var i = 0; i < PL.length; i++) { var r = rank(PL[i], s); if (r >= 0) found.push([r, i]); }
  found.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
  var hits = found.slice(0, 8).map(function (f) { return f[1]; });
  qrEl.innerHTML = hits.length ? hits.map(function (i) {
    return '<button type="button" role="option" data-i="' + i + '">' + esc(placeName(PL[i])) +
      '<span class="sub">' + esc(placeCity(PL[i]) + " · " + typeLabel(PL[i].t)) + "</span></button>";
  }).join("") : '<button type="button" disabled>' + esc(T("noMatch")) + "</button>";
  qrEl.classList.add("on"); qEl.setAttribute("aria-expanded", "true");
});
qrEl.addEventListener("click", function (e) {
  var b = e.target.closest("button[data-i]"); if (!b) return;
  var i = +b.getAttribute("data-i");
  qEl.value = placeName(PL[i]); closeSearch(); goTo(i);
});
qEl.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeSearch();
  if (e.key === "Enter") { var f = qrEl.querySelector("button[data-i]"); if (f) { e.preventDefault(); f.click(); } }
});
document.addEventListener("click", function (e) { if (!qrEl.contains(e.target) && e.target !== qEl) closeSearch(); });

function buildChips() {
  chipsEl.innerHTML = [["all", "fAll"], ["Museum", "fMuseum"], ["Gallery", "fGallery"], ["Biennial", "fBiennial"]].map(function (d) {
    return '<button type="button" class="chip" data-v="' + d[0] + '" aria-pressed="' + (AT.filter === d[0]) + '">' + esc(T(d[1])) + "</button>";
  }).join("");
}
chipsEl.addEventListener("click", function (e) {
  var b = e.target.closest(".chip"); if (!b) return;
  AT.filter = b.getAttribute("data-v"); AT.hover = -1;
  if (AT.focus >= 0 && !visible(PL[AT.focus])) { AT.focus = -1; hideTip(); }
  buildChips(); AT.dirty = true;
});

var aboutBtn = document.getElementById("aboutBtn"), aboutEl = document.getElementById("about");
aboutBtn.addEventListener("click", function () {
  aboutEl.hidden = !aboutEl.hidden;
  aboutBtn.setAttribute("aria-expanded", String(!aboutEl.hidden));
});
