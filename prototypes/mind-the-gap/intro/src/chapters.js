/* chapters.js — what the scroll position means: which wall label is up, how
   far each exhibit has played, the light in the room, and the way in. */

var chEls = [].slice.call(document.querySelectorAll(".ch"));
var cvl = {};
["A", "B", "Gap", "Index", "IL", "US"].forEach(function (k) { cvl[k] = document.getElementById("lbl" + k); });
var tickerEl = document.getElementById("ticker"), tkBand = document.getElementById("tkBand"), tkScale = document.getElementById("tkScale");
var exTyped = document.getElementById("exTyped"), exResult = document.getElementById("exResult");
var exIL = document.getElementById("exIL"), exUS = document.getElementById("exUS"), exApply = document.getElementById("exApply");
var exLis = [].slice.call(document.querySelectorAll("#exProblems li"));
var railEl = document.getElementById("rail"), progressEl = document.getElementById("progress");
var skipBtn = document.getElementById("skipBtn"), replayBtn = document.getElementById("replayBtn"), enterBtn = document.getElementById("enterBtn");
var langBtns = [].slice.call(document.querySelectorAll(".lang button"));

var SCALES = [21, 6, 3, 1, 0, -2, -9];                // metres, as powers of ten
var SEARCH_WORD = "zeitz";
var playBtn = document.getElementById("playBtn"), barPlay = document.getElementById("barPlay");
var lastBand = -1, lastTone = -1, lastCi = -1, enterAnim = null;
var AUTO_SECONDS = 78;                             // the whole descent, played at reading pace

/* ---------- language ---------- */
function applyLang(lang, persist) {
  if (!STR[lang]) lang = "en";
  S.lang = lang; S.dir = lang === "he" ? "rtl" : "ltr";
  root.lang = lang; root.dir = S.dir;
  [].forEach.call(document.querySelectorAll("[data-i18n]"), function (el) { el.textContent = T(el.getAttribute("data-i18n")); });
  qEl.placeholder = T("searchPh"); qEl.setAttribute("aria-label", T("searchPh"));
  document.getElementById("zi").setAttribute("aria-label", T("zoomIn"));
  document.getElementById("zo").setAttribute("aria-label", T("zoomOut"));
  document.getElementById("zr").setAttribute("aria-label", T("zoomReset"));
  document.getElementById("langGroup").setAttribute("aria-label", T("langLabel"));
  railEl.setAttribute("aria-label", T("railLabel"));
  barPlay.setAttribute("aria-label", T(auto ? "pause" : "play"));
  playBtn.lastChild.textContent = T(auto ? "pause" : "play");
  if (S.mode === "app") cv.setAttribute("aria-label", T("mapLabel"));
  langBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang)); });
  buildRail(); fillExhibits(); buildChips(); updateHud(); placeLabels();
  lastBand = -1; AT.dirty = true;
  if (AT.focus >= 0) showTip(AT.focus);
  if (persist) { try { localStorage.setItem("mtg-lang", lang); } catch (e) {} }
}

/* the exhibits show real entries from the index, each in its own language */
function fillExhibits() {
  var s = DATA.sample, pl = PL[s.searchIdx];
  document.getElementById("exName").textContent = pl.n;
  document.getElementById("exSub").textContent = placeCity(pl) + " · " + typeLabel(pl.t);
  document.getElementById("exILName").textContent = s.il.name;
  document.getElementById("exILOrg").textContent = s.il.org;
  document.getElementById("exUSName").textContent = s.us.name;
  document.getElementById("exUSOrg").textContent = s.us.org;
}

/* ---------- rail ---------- */
function buildRail() {
  railEl.innerHTML = SC.map(function (s, i) {
    return '<button type="button" data-i="' + i + '"' + (i === S.ci ? ' aria-current="true"' : "") +
      "><span>" + esc(T("r" + i)) + "</span><i></i></button>";
  }).join("");
}
function scrollToScene(i) {
  setAuto(false);
  var max = root.scrollHeight - window.innerHeight, sc = SC[i];
  var p = i === 0 ? 0 : (i === SC.length - 1 ? 1 : sc.a + (sc.b - sc.a) * 0.7);   // land where the scene has settled
  window.scrollTo({ top: p * max, behavior: reduce ? "auto" : "smooth" });
}
railEl.addEventListener("click", function (e) {
  var b = e.target.closest("button[data-i]");
  if (b) scrollToScene(+b.getAttribute("data-i"));
});

/* ---------- labels that sit on the canvas ---------- */
function pos(el, x, y) { el.style.left = Math.round(x) + "px"; el.style.top = Math.round(y) + "px"; }
function placeLabels() {
  var yTop = box.y - box.sig * SWARM_R * 0.9 - 6;
  var lead = S.dir === "rtl" ? 1 : -1;               // artists stand at the reading start
  pos(cvl.A, box.x + lead * box.w * 0.27, yTop); pos(cvl.B, box.x - lead * box.w * 0.27, yTop);
  pos(cvl.Gap, box.x, box.y - 16); pos(cvl.Index, box.x, box.y - Math.max(18, box.sig * 0.34));
  var c = cam, b; cam = storyCam;
  b = regionBox(0); pos(cvl.IL, (b.x0 + b.x1) / 2, b.y0 - 7);
  b = regionBox(1); pos(cvl.US, (b.x0 + b.x1) / 2, b.y0 - 7);
  cam = c;
}

/* ---------- cached DOM writes: the loop runs every frame, the DOM should not ---------- */
function setOp(el, v) { var q = Math.round(v * 100); if (el._o === q) return; el._o = q; el.style.opacity = q / 100; }
function setIn(el, on) { if (el._in === on) return; el._in = on; el.classList.toggle("in", on); }
function setCh(el, v, ty) {
  var q = Math.round(v * 100), y = Math.round(ty * 2) / 2, key = q + "|" + y;
  if (el._k === key) return; el._k = key;
  el.style.opacity = q / 100;
  el.style.transform = y ? "translateY(" + y + "px)" : "";
  el.style.pointerEvents = q > 60 ? "auto" : "none";
}
function roll(el) { if (reduce) return; el.classList.remove("roll"); void el.offsetWidth; el.classList.add("roll"); }

function applyTone() {
  var q = Math.round(S.tone * 100);
  if (q === lastTone) return; lastTone = q;
  var t = q / 100;
  root.style.setProperty("--bg-live", "rgb(" + [0, 1, 2].map(function (i) { return Math.round(lerp(BG_NIGHT[i], BG_DAY[i], t)); }).join(",") + ")");
  var tone = t > 0.5 ? "day" : "night";
  if (root.getAttribute("data-tone") !== tone) root.setAttribute("data-tone", tone);
}

/* how far an exhibit has played: it starts once its scene has formed */
function prog(i) { return S.ci === i ? clamp((S.t - 0.36) / 0.44, 0, 1) : (S.ci > i ? 1 : 0); }

function updateChapters() {
  var story = S.mode === "story", ci = S.ci, t = S.t, i, u;
  for (i = 0; i < chEls.length; i++) {
    var v = 0, ty = 0;
    if (story) {
      if (i === ci) { v = i === 0 ? 1 : smooth(0.2, 0.36, t); ty = (1 - v) * 26; }
      else if (i === ci - 1) { v = 1 - smooth(0, 0.1, t); ty = -(1 - v) * 18; }
      /* The resolution label leaves before the room changes from night to day,
         so no text is ever caught on the mid-grey in between. */
      if (i === 6) v = ci === 6 ? v * (1 - smooth(0.62, 0.72, t)) : 0;
    }
    setCh(chEls[i], v, ty);
  }
  if (!story) return;

  u = prog(2);
  var typed = SEARCH_WORD.slice(0, Math.round(clamp(u * 1.45, 0, 1) * SEARCH_WORD.length));
  if (exTyped._t !== typed) { exTyped._t = typed; exTyped.textContent = typed; }
  setIn(exResult, u > 0.75);
  pulseIdx = ci === 2 && u > 0.75 ? DATA.sample.searchIdx : -1;

  u = prog(3); setIn(exIL, u > 0.12); setIn(exUS, u > 0.4); setIn(exApply, u > 0.72);
  u = prog(4); for (i = 0; i < exLis.length; i++) setIn(exLis[i], u > 0.1 + i * 0.15);

  tunnelSpeed = ci === 6 ? smooth(0.05, 0.72, t) : (ci === 7 ? 1 : 0);
  tunnelPocket = ci === 6 ? smooth(0.12, 0.3, t) * (1 - smooth(0.62, 0.72, t)) : 0;
  setOp(tickerEl, ci === 6 ? smooth(0.04, 0.11, t) * (1 - smooth(0.66, 0.76, t)) : 0);
  if (ci === 6) {
    var b = Math.floor(clamp((t - 0.07) / 0.59, 0, 0.9999) * 7);
    if (b !== lastBand) {
      lastBand = b; tkBand.textContent = T("bands")[b];
      tkScale.innerHTML = "10<sup>" + String(SCALES[b]).replace("-", "\u2212") + "</sup> m";
      roll(tkBand); roll(tkScale);
    }
  }

  S.tone = ci < 6 ? 0 : (ci === 6 ? smooth(0.76, 0.94, t) : 1);   // the bloom: space gives way to the gallery
  applyTone();

  var w1 = sceneW(1), w3 = sceneW(3), w5 = sceneW(5);
  setOp(cvl.A, Math.max(w1, w5)); setOp(cvl.B, Math.max(w1, w5));
  setOp(cvl.Gap, w1); setOp(cvl.Index, w5); setOp(cvl.IL, w3); setOp(cvl.US, w3);

  if (ci !== lastCi) {
    lastCi = ci;
    [].forEach.call(railEl.children, function (b, k) { if (k === ci) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
  }
  progressEl.style.transform = "scaleX(" + S.p.toFixed(4) + ")";
}

/* ---------- the title ---------- */
function buildWordmark() {
  if (reduce) return;
  var wm = document.getElementById("wordmark"), bar = wm.querySelector(".gapbar"), delay = 80;
  [].forEach.call(wm.querySelectorAll(".word"), function (w, wi) {
    var text = w.textContent; w.textContent = "";
    if (wi === 2) delay += 120;                     // GAP waits for the bar to cross
    text.split("").forEach(function (ch) {
      var s = document.createElement("span");
      s.textContent = ch; s.style.opacity = 0; s.style.transform = "translateY(.42em)";
      s.style.transition = "opacity var(--dur-slow) var(--ease-out) " + delay + "ms,transform var(--dur-slow) var(--ease-spring) " + delay + "ms";
      delay += 34; w.appendChild(s);
    });
  });
  bar.style.transform = "scaleX(0)"; bar.style.transition = "transform var(--dur-slow) var(--ease-out) 340ms";
  requestAnimationFrame(function () { requestAnimationFrame(function () {
    bar.style.transform = "scaleX(1)";
    [].forEach.call(wm.querySelectorAll(".word span"), function (s) { s.style.opacity = 1; s.style.transform = "none"; });
  }); });
}

/* ---------- playing it as a film ---------- */
/* Play scrolls the page at a steady pace, so the piece can be watched as well
   as scrolled. It only ever starts when asked, and any scroll of the visitor's
   own takes over at once. */
function setAuto(on) {
  if (on && S.mode !== "story") return;
  if (on) {
    if (S.pRaw > 0.985) { window.scrollTo(0, 0); S.pRaw = S.p = 0; }   // from the end, start again
    auto = { p: S.pRaw };
  } else auto = null;
  root.classList.toggle("playing", !!auto);
  barPlay.setAttribute("aria-pressed", String(!!auto));
  barPlay.setAttribute("aria-label", T(auto ? "pause" : "play"));
  playBtn.lastChild.textContent = T(auto ? "pause" : "play");
}
function stepAuto(dt) {
  if (!auto) return;
  auto.p = Math.min(1, auto.p + dt / AUTO_SECONDS);
  window.scrollTo(0, auto.p * (root.scrollHeight - window.innerHeight));
  if (auto.p >= 1) setAuto(false);
}
function toggleAuto() { setAuto(!auto); }
playBtn.addEventListener("click", toggleAuto);
barPlay.addEventListener("click", toggleAuto);
window.addEventListener("wheel", function () { if (auto) setAuto(false); }, { passive: true });
window.addEventListener("touchmove", function () { if (auto) setAuto(false); }, { passive: true });
window.addEventListener("keydown", function (e) {
  if (auto && /^(Arrow(Up|Down)|Page(Up|Down)|Home|End| |Spacebar)$/.test(e.key) && !/^(BUTTON|INPUT|A)$/.test(e.target.tagName)) setAuto(false);
});

/* ---------- entering ---------- */
/* From wherever the story is, the field flies out into the full map, the room
   turns to day, coastlines resolve under the dots and the institutions settle. */
function enterWorld() {
  if (S.mode !== "story") return;
  setAuto(false);
  var from = SC[S.ci].form;
  S.mode = "entering"; root.classList.add("entering");
  camReset();
  S.over = {
    A: function (p, o) { var c = cam; cam = storyCam; from(p, o); cam = c; },   // leave from the story's camera
    B: F_app, m: 0, delay: D_sweep
  };
  cam = appCam;
  enterAnim = { t0: performance.now(), dur: reduce ? 1 : 2000, tone0: S.tone };
  pulseIdx = -1;
}
function stepEnter(now) {
  if (!enterAnim) return;
  var k = clamp((now - enterAnim.t0) / enterAnim.dur, 0, 1);
  S.over.m = k;
  S.tone = lerp(enterAnim.tone0, 1, smooth(0, 0.4, k)); applyTone();
  AT.alpha = smooth(0.3, 0.85, k); AT.mk = smooth(0.62, 1, k); AT.dirty = true;
  if (k < 1) return;
  enterAnim = null;
  S.over = { A: F_app, B: F_app, m: 1 }; S.mode = "app";
  root.classList.remove("entering"); root.classList.add("in-app");
  window.scrollTo(0, 0);
  appEl.hidden = false;
  requestAnimationFrame(function () { appEl.classList.add("on"); });
  skipBtn.hidden = true; replayBtn.hidden = false; barPlay.hidden = true;
  cv.removeAttribute("aria-hidden"); cv.setAttribute("role", "img"); cv.setAttribute("aria-label", T("mapLabel"));
  updateHud();
}
function replay() {
  if (S.mode !== "app") return;
  S.mode = "story"; S.over = null; cam = storyCam;
  AT.alpha = 0; AT.mk = 0; AT.focus = -1; AT.hover = -1; AT.anim = null;
  hideTip(); closeSearch(); aboutEl.hidden = true; aboutBtn.setAttribute("aria-expanded", "false");
  appEl.classList.remove("on"); appEl.hidden = true;
  root.classList.remove("in-app");
  skipBtn.hidden = false; replayBtn.hidden = true; barPlay.hidden = false;
  cv.setAttribute("aria-hidden", "true"); cv.removeAttribute("role"); cv.removeAttribute("aria-label");
  window.scrollTo(0, 0); S.pRaw = 0; S.p = 0; lastCi = -1;
}

enterBtn.addEventListener("click", enterWorld);
enterBtn.addEventListener("focus", function () { if (S.mode === "story" && S.ci !== SC.length - 1) scrollToScene(SC.length - 1); });
skipBtn.addEventListener("click", enterWorld);
replayBtn.addEventListener("click", replay);
langBtns.forEach(function (b) { b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang"), true); }); });
document.getElementById("mark").addEventListener("click", function (e) {
  e.preventDefault();
  if (S.mode === "app") replay();
  else if (S.mode === "story") { setAuto(false); window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); }
});
