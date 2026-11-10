(function(){
"use strict";
var root = document.documentElement;

/* ---------- theme ---------- */
var themeBtn = document.getElementById("themeBtn");
function isDark(){ var a = root.getAttribute("data-theme");
  return a ? a === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; }
function face(){ themeBtn.textContent = isDark() ? "◐" : "◑"; }
face();
themeBtn.addEventListener("click", function(){
  root.setAttribute("data-theme", isDark() ? "light" : "dark"); face();
});

/* A tone chosen here, or arrived in, goes along to the next page. A link to a
   place inside a page keeps its own anchor. */
document.addEventListener("click", function(e){
  var a = e.target.closest && e.target.closest("a.xpage");
  var tone = root.getAttribute("data-theme");
  if (a && tone && a.getAttribute("href").indexOf("#") < 0) a.hash = "via-" + tone;
});

/* ---------- nav ---------- */
var nav = document.getElementById("nav");
function stick(){ nav.classList.toggle("stuck", scrollY > 24); }
addEventListener("scroll", stick, { passive: true }); stick();

/* ---------- one tooltip for every chart mark: hover and keyboard focus alike ---------- */
var tip = document.getElementById("tip"), cur = null;
function show(el){
  cur = el; tip.textContent = el.getAttribute("data-tip"); tip.hidden = false;
  var r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
  var x = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), innerWidth - w - 8);
  var y = r.top - h - 10; if (y < 8) y = r.bottom + 10;
  tip.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y) + "px)";
}
function hide(el){ if (!el || el === cur) { tip.hidden = true; cur = null; } }
function mark(e){ return e.target.closest ? e.target.closest("[data-tip]") : null; }
document.addEventListener("pointerover", function(e){ var el = mark(e); if (el) show(el); });
document.addEventListener("pointerout", function(e){ var el = mark(e); if (el && !el.contains(e.relatedTarget)) hide(el); });
document.addEventListener("focusin", function(e){ var el = mark(e); if (el) show(el); });
document.addEventListener("focusout", function(e){ var el = mark(e); if (el) hide(el); });
addEventListener("scroll", function(){ hide(); }, { passive: true });

/* ---------- the timeline names a phase only where its name fits ---------- */
function fitLabels(){
  [].forEach.call(document.querySelectorAll(".tblock .lbl"), function(l){
    var b = l.parentNode, room = b.clientWidth - 2 * l.offsetLeft;
    var full = l.getAttribute("data-full");
    l.classList.remove("none"); l.textContent = full;
    if (l.offsetWidth > room) l.textContent = full.split(" · ")[0];
    if (l.offsetWidth > room) l.classList.add("none");
  });
}
fitLabels();
addEventListener("resize", fitLabels);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitLabels);

/* ---------- copy the campaign link ---------- */
var copy = document.getElementById("copyBtn");
if (copy) {
  var input = document.getElementById("shareUrl"), msg = document.getElementById("copyMsg");
  var fallback = function(){ input.focus(); input.select(); msg.textContent = copy.getAttribute("data-fallback"); };
  copy.addEventListener("click", function(){
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(input.value).then(function(){ msg.textContent = copy.getAttribute("data-done"); }, fallback);
      } else fallback();
    } catch (e) { fallback(); }
  });
}
})();
