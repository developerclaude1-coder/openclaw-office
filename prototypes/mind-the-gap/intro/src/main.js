/* main.js — put it together and run it */

function render() {
  var world = S.mode !== "story";
  if (S.mode === "app") {
    if (!AT.dirty) return;                          // the world only redraws when something moved
    if (AT.hover >= 0) showTip(AT.hover); else if (AT.focus >= 0) showTip(AT.focus);
    updateHud();
  }
  ctx.clearRect(0, 0, W, H);
  if (world) atlasUnder();
  var n = drawField();
  if (!world) drawExtras();
  drawMarkers(n);
  if (world) atlasOver();
  AT.dirty = false;
}

var lastNow = 0;
function frame(now) {
  var dt = Math.min(0.05, (now - (lastNow || now)) / 1000); lastNow = now;
  if (!reduce) { time += dt; tunnelPhase += dt * (0.03 + tunnelSpeed * 0.24); }
  stepAuto(dt);
  if (S.mode === "story") {
    var max = root.scrollHeight - window.innerHeight;
    S.pRaw = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
    /* ease toward the scroll position, so a wheel's steps read as one movement */
    S.p = reduce ? S.pRaw : S.p + (S.pRaw - S.p) * (1 - Math.exp(-dt * 7));
    if (Math.abs(S.pRaw - S.p) < 0.00005) S.p = S.pRaw;
    for (var i = SC.length - 1; i >= 0; i--) {
      if (S.p >= SC[i].a || i === 0) { S.ci = i; S.t = clamp((S.p - SC[i].a) / (SC[i].b - SC[i].a), 0, 1); break; }
    }
  }
  stepEnter(now); stepFly(now);
  updateChapters();
  render();
  requestAnimationFrame(frame);
}

(function init() {
  root.classList.add("js");
  RINGS = decodeLand(LAND);
  RING_MAXLAT = RINGS.map(function (r) { var m = -90; for (var j = 0; j < r.length; j++) if (r[j][1] > m) m = r[j][1]; return m; });

  /* each scene owns a share of the scroll proportional to its weight */
  var sum = 0, acc = 0;
  SC.forEach(function (s) { sum += s.w; });
  SC.forEach(function (s) { s.a = acc / sum; acc += s.w; s.b = acc / sum; });
  root.style.setProperty("--screens", (1 + sum * 0.9).toFixed(2));

  layout(); buildParticles(); camReset();

  var lang = "";
  try { lang = localStorage.getItem("mtg-lang") || ""; } catch (e) {}
  if (!lang) lang = /^he\b/i.test(navigator.language || "") ? "he" : "en";
  applyLang(lang, false);
  buildWordmark(); placeLabels();

  window.addEventListener("resize", function () {
    var zoom = appCam.s / AT.fit, lon0 = appCam.lon0, lat0 = appCam.lat0;
    layout(); placeLabels(); camReset();
    if (S.mode !== "story") { appCam.s = AT.fit * zoom; appCam.lon0 = lon0; appCam.lat0 = lat0; camClamp(); }
    AT.dirty = true;
  });
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    pointer.x = e.clientX / window.innerWidth; pointer.y = e.clientY / window.innerHeight;
  }, { passive: true });

  if (location.hash === "#enter") {                 // a link straight to the door
    var max = root.scrollHeight - window.innerHeight;
    window.scrollTo(0, max); S.pRaw = S.p = 1;
  }

  /* a small handle for driving the piece from tests */
  window.__mtg = {
    S: S, AT: AT, cam: appCam, places: PL, scenes: SC,
    goto: function (p) { var max = root.scrollHeight - window.innerHeight; window.scrollTo(0, p * max); S.pRaw = S.p = p; },
    scene: function (i, t) { var sc = SC[i]; this.goto(sc.a + (sc.b - sc.a) * (t == null ? 0.7 : t)); },
    enter: enterWorld, replay: replay, lang: applyLang, flyToPlace: goTo, play: setAuto,
    playing: function () { return auto; },
    geo: function () { return { W: W, H: H, box: box, ring: ring, portrait: portrait }; }
  };

  requestAnimationFrame(frame);
})();
