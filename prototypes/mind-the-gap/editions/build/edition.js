(function(){
"use strict";
var L = __LOCALE__;
var LAND = "__LAND__";
var T = L.strings;
var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
var root = document.documentElement;
var RTL = L.dir === "rtl";
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function host(u){try{return new URL(u).hostname.replace(/^www\./,"");}catch(e){return "source";}}

/* ---------- theme ---------- */
function isDark(){var a=root.getAttribute("data-theme");
  return a?a==="dark":matchMedia("(prefers-color-scheme: dark)").matches;}
if(!isDark())document.getElementById("themeBtn").textContent="◑";
document.getElementById("themeBtn").addEventListener("click",function(){
  var n=isDark()?"light":"dark"; root.setAttribute("data-theme",n);
  this.textContent=n==="dark"?"◐":"◑"; drawAtlas();
});

/* ---------- between editions ---------- */
/* The menu closes like a menu: on a click elsewhere, and on Escape. */
var edMenu=document.getElementById("edMenu");
document.addEventListener("click",function(e){if(edMenu.open&&!edMenu.contains(e.target))edMenu.open=false;});
document.addEventListener("keydown",function(e){
  if(e.key==="Escape"&&edMenu.open){edMenu.open=false;edMenu.querySelector("summary").focus();}});
/* A tone chosen here, or arrived in, goes along to the next edition. */
document.addEventListener("click",function(e){
  var a=e.target.closest&&e.target.closest(".ed-list a,.foot-editions a,a.way,a.xpage");
  var tone=root.getAttribute("data-theme");
  if(a&&tone&&a.getAttribute("href").charAt(0)!=="#")a.hash="via-"+tone;
});
function wayRows(list,noteKey){return list.map(function(d){
  return '<a class="way" href="'+esc(d.href)+'"><b>'+esc(d.title)+"</b><span>"+esc(d[noteKey]||d.note||"")+
    "</span><i>→</i></a>";}).join("");}
document.getElementById("commDown").innerHTML=wayRows(L.doors.down,"commissions");
document.getElementById("resDown").innerHTML=wayRows(L.doors.down,"residencies");
["commUp","resUp"].forEach(function(id){
  document.getElementById(id).innerHTML="<h4>"+esc(T.wayFurther)+"</h4>"+wayRows(L.doors.up,"note");});

/* ---------- nav stuck ---------- */
var nav=document.getElementById("nav");
addEventListener("scroll",function(){ nav.classList.toggle("stuck", scrollY>24); },{passive:true});

/* ---------- hero wordmark: staggered entrance ---------- */
var wm=document.getElementById("wordmark");
/* Build the wordmark as whole words of per-letter spans, so the headline can
   wrap between words but never inside one, and each letter can still stagger. */
(function(){
  var delay=0;
  function word(text){
    var w=document.createElement("span");
    w.className="word";
    text.split("").forEach(function(ch){
      var s=document.createElement("span");
      s.textContent=ch;
      s.style.opacity=0; s.style.transform="translateY(.4em)";
      s.style.transition="opacity var(--dur-slow) var(--ease-out) "+delay+"ms,"+
                         "transform var(--dur-slow) var(--ease-spring) "+delay+"ms";
      delay+=40; w.appendChild(s);
    });
    wm.appendChild(w);
  }
  word("MIND"); word("THE");
  var brk=document.createElement("span"); brk.className="wm-break"; wm.appendChild(brk);
  var bar=document.createElement("span");
  bar.className="gapbar";
  bar.style.transform="scaleX(0)";
  bar.style.transition="transform var(--dur-slow) var(--ease-out) "+delay+"ms";
  delay+=80; wm.appendChild(bar);
  word("GAP");
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    wm.querySelectorAll(".gapbar").forEach(function(b){b.style.transform="scaleX(1)";});
    wm.querySelectorAll(".word span").forEach(function(s){s.style.opacity=1;s.style.transform="none";});
  });});
})();

/* ---------- counter count-up ---------- */
var openCount = L.commissions.filter(function(c){
  return c.access==="open call"||c.access==="registry"||c.access==="mixed";}).length + L.residencies.length;
var cEl=document.getElementById("counter");
if(reduce){ cEl.textContent=openCount; }
else{
  var t0=null;
  (function tick(ts){ if(!t0)t0=ts; var p=Math.min(1,(ts-t0)/1400);
    cEl.textContent=Math.round(openCount*(1-Math.pow(1-p,3)));
    if(p<1) requestAnimationFrame(tick); })(performance.now());
}

/* ---------- resolution instrument ---------- */
var BANDS=L.bandNames;
var CAPS=L.bandCaps||["","","","","","",""];
var dial=document.getElementById("dial"),hudBand=document.getElementById("hudBand"),
    hudCap=document.getElementById("hudCap"),dialLabels=document.getElementById("dialLabels");
BANDS.forEach(function(b,i){var s=document.createElement("span");s.textContent=b.short;s.dataset.i=i;dialLabels.appendChild(s);});
var dlEls=dialLabels.querySelectorAll("span");
function updHud(v){
  var i=Math.max(0,Math.min(6,Math.round(v/100*6)));
  hudBand.textContent=BANDS[i].full; hudCap.textContent=CAPS[i]||"";
  dial.style.setProperty("--fill",v+"%");
  dlEls.forEach(function(e){e.classList.toggle("on",+e.dataset.i===i);});
}
var cv=document.getElementById("field"),ctx=cv.getContext("2d");
var W=0,H=0,DPR=Math.min(devicePixelRatio||1,2),stars=[],zoom=.42,zt=.42,autoT=0,touched=false;
function pal(){var c=getComputedStyle(root);return{
  sig:c.getPropertyValue("--signal").trim(),cool:c.getPropertyValue("--cool").trim(),
  ink:c.getPropertyValue("--ink").trim(),dark:isDark()};}
function rf(){W=cv.clientWidth;H=cv.clientHeight;cv.width=W*DPR|0;cv.height=H*DPR|0;ctx.setTransform(DPR,0,0,DPR,0,0);}
function seed(){stars=[];for(var i=0;i<380;i++)stars.push({x:Math.random()*2-1,y:Math.random()*2-1,
  z:Math.random(),c:Math.random(),r:.4+Math.random()*1.4});}
function drawField(){
  var p=pal();ctx.clearRect(0,0,W,H);var cx=W/2,cy=H/2;
  zoom+=(zt-zoom)*.06;
  ctx.save();ctx.globalAlpha=p.dark?.12:.2;ctx.strokeStyle=p.cool;
  for(var g=1;g<=4;g++){ctx.beginPath();ctx.arc(cx,cy,Math.min(W,H)*.1*g*(.7+zoom*.9),0,6.2832);ctx.stroke();}
  ctx.restore();
  for(var i=0;i<stars.length;i++){var s=stars[i];s.z-=.0016+zoom*.006;
    if(s.z<=.02){s.z=1;s.x=Math.random()*2-1;s.y=Math.random()*2-1;s.c=Math.random();}
    var k=(.4+zoom*1.4)/s.z,px=cx+s.x*k*(W*.5),py=cy+s.y*k*(H*.5);
    if(px<-20||px>W+20||py<-20||py>H+20)continue;
    var sz=s.r*(.5+(1-s.z)*2.1)*(.6+zoom),a=Math.min(1,(1-s.z)*1.3);
    ctx.globalAlpha=a*(p.dark?.9:.55);
    ctx.fillStyle=s.c<.7?p.ink:(s.c<.9?p.sig:p.cool);
    ctx.beginPath();ctx.arc(px,py,Math.max(.3,sz),0,6.2832);ctx.fill();}
  ctx.globalAlpha=.5+zoom*.4;ctx.strokeStyle=p.sig;ctx.lineWidth=1.1;
  var ap=18+(1-zoom)*40;ctx.beginPath();ctx.arc(cx,cy,ap,0,6.2832);ctx.stroke();
  ctx.globalAlpha=.6;[[0,-1],[0,1],[-1,0],[1,0]].forEach(function(d){ctx.beginPath();
    ctx.moveTo(cx+d[0]*(ap+4),cy+d[1]*(ap+4));ctx.lineTo(cx+d[0]*(ap+11),cy+d[1]*(ap+11));ctx.stroke();});
  ctx.globalAlpha=1;
}
function loop(){ if(autoT<1&&!touched){autoT+=.004;var v=8+autoT*40;dial.value=v;zt=v/100;updHud(v);}
  drawField();requestAnimationFrame(loop);}
dial.addEventListener("input",function(){touched=true;zt=+dial.value/100;updHud(dial.value);});
rf();seed();updHud(dial.value);zt=+dial.value/100;
if(reduce){zoom=zt=.5;drawField();}else loop();
addEventListener("resize",function(){rf();if(reduce)drawField();});

/* ---------- marquee ---------- */
var mk=[];
L.places.slice(0,10).forEach(function(p){mk.push([T.legendMuseum==="מוזיאון"?"מוסד":"INDEX",p.name+" · "+p.city]);});
L.commissions.filter(function(c){return c.access==="open call";}).slice(0,4)
  .forEach(function(c){mk.push(["OPEN",c.name+" · "+c.city]);});
var mh=mk.map(function(m){return "<span><b>"+esc(m[0])+"</b> "+esc(m[1])+"</span>";}).join("<i>◆</i>");
document.getElementById("marquee").innerHTML=mh+"<i>◆</i>"+mh;

/* ---------- audience ---------- */
document.getElementById("audience").innerHTML=[
  {t:T.audArtist,d:T.audArtistDesc},{t:T.audCollector,d:T.audCollectorDesc},
  {t:T.audInstitution,d:T.audInstitutionDesc}
].map(function(a){return '<article class="aud-card"><h3>'+esc(a.t)+"</h3><p>"+esc(a.d)+
  '</p><a class="go" href="#join">'+esc(T.signUp)+' <span>→</span></a></article>';}).join("");

/* ---------- connect ---------- */
function li(arr,k){return arr.map(function(x){
  return "<li><div><strong>"+esc(x[k])+"</strong><span>"+esc(x.detail)+"</span></div></li>";}).join("");}
document.getElementById("artistNeeds").innerHTML=li(L.artistNeeds,"point");
document.getElementById("collectorNeeds").innerHTML=li(L.collectorNeeds,"point");
document.getElementById("gapFacts").innerHTML=L.gapFacts.map(function(f){
  return '<div class="fact'+(f.local?" local":"")+'"><h4>'+esc(f.fact)+"</h4><p>"+esc(f.detail)+"</p>"+
    '<div class="scope">'+esc(f.local?T.scopeLocal:T.scopeGlobal)+"</div></div>";}).join("");

/* ---------- cards ---------- */
function conf(c){return c==="high"?"":'<span class="conf">◍ '+esc(c)+" "+esc(T.confidence)+"</span>";}
function src(u){return u?'<a href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(host(u))+" ↗</a>":"";}
var ACC={"open call":"cool","registry":"cool","mixed":"ghost","invitation":"ghost"};
function place(x){return esc(x.city)+(L.showCountry&&x.country?", "+esc(x.country):"");}
function commCard(c){
  return '<article class="card"><div class="card-top"><span class="tag">'+esc(c.category)+"</span>"+
    '<span class="tag '+(ACC[c.access]||"ghost")+'">'+esc(c.access)+"</span></div>"+
    "<h3>"+esc(c.name)+'</h3><div class="where">'+esc(c.org)+" — "+place(c)+"</div>"+
    "<p>"+esc(c.summary)+"</p><dl><div><dt>"+esc(T.dtFunding)+"</dt><dd>"+esc(c.budgetNote)+"</dd></div>"+
    "<div><dt>"+esc(T.dtOpens)+"</dt><dd>"+esc(c.cycleNote)+"</dd></div></dl>"+
    '<div class="foot">'+conf(c.confidence)+src(c.sourceUrl)+"</div></article>";
}
function resCard(r){
  return '<article class="card"><div class="card-top"><span class="tag cool">'+esc(T.tagResidency)+"</span></div>"+
    "<h3>"+esc(r.name)+'</h3><div class="where">'+place(r)+"</div><p>"+esc(r.summary)+"</p>"+
    "<dl><div><dt>"+esc(T.dtLength)+"</dt><dd>"+esc(r.duration)+"</dd></div>"+
    "<div><dt>"+esc(T.dtProvides)+"</dt><dd>"+esc(r.funding)+"</dd></div>"+
    "<div><dt>"+esc(T.dtFor)+"</dt><dd>"+esc(r.disciplines)+"</dd></div>"+
    "<div><dt>"+esc(T.dtApplying)+"</dt><dd>"+esc(r.applicationNote)+"</dd></div></dl>"+
    '<div class="foot">'+conf(r.confidence)+src(r.sourceUrl)+"</div></article>";
}
function chips(hostEl,defs,cb){
  hostEl.innerHTML=defs.map(function(d,i){return '<button class="chip" data-v="'+esc(d.v)+
    '" aria-pressed="'+(i===0)+'">'+esc(d.label)+"</button>";}).join("")+'<span class="count"></span>';
  hostEl.querySelectorAll(".chip").forEach(function(ch){ch.addEventListener("click",function(){
    hostEl.querySelectorAll(".chip").forEach(function(c){c.setAttribute("aria-pressed","false");});
    ch.setAttribute("aria-pressed","true");cb(ch.dataset.v);});});
}
var commGrid=document.getElementById("commGrid"),commChips=document.getElementById("commChips");
function renderComm(v){
  var list=L.commissions.filter(function(c){
    if(v==="all")return true;
    if(v==="openable")return c.access==="open call"||c.access==="registry"||c.access==="mixed";
    return c.category===v;});
  commGrid.innerHTML=list.map(commCard).join("");
  commChips.querySelector(".count").textContent=list.length+" / "+L.commissions.length;
}
var cats=[];L.commissions.forEach(function(c){if(cats.indexOf(c.category)<0)cats.push(c.category);});
chips(commChips,[{v:"all",label:T.filterAll},{v:"openable",label:T.filterApply}]
  .concat(cats.map(function(c){return{v:c,label:c};})),renderComm);
renderComm("all");
document.getElementById("resGrid").innerHTML=L.residencies.map(resCard).join("");

/* ---------- ATLAS ---------- */
var PREC=10;
var RINGS=(function(){
  /* "<precision>|<ring>;<ring>" — precision is the divisor for the delta ints,
     so an edition can ship finer geometry than the global 0.1-degree set. */
  var bar=LAND.indexOf("|"), body=LAND;
  if(bar>0){ PREC=parseInt(LAND.slice(0,bar),10)||10; body=LAND.slice(bar+1); }
  return body.split(";").map(function(r){var px=0,py=0;
    return r.split(" ").map(function(p){var a=p.split(",");
      px+=parseInt(a[0],36);py+=parseInt(a[1],36);return [px/PREC,py/PREC];});});
})();
/* The world coastline a region carries is good to about 11 km. Drawn as a
   curve through the midpoints of its sides it is the same shape at regional
   scale and stays a soft line, not facets, when you fly in to a city. */
var CURVED=PREC<=10;
var P=L.places,CLR={};
(function(){var c=getComputedStyle(root);})();
function colorFor(t){var c=getComputedStyle(root);
  return t==="Museum"?c.getPropertyValue("--signal").trim():
         t==="Gallery"?c.getPropertyValue("--cool").trim():c.getPropertyValue("--violet").trim();}
var atlas=document.getElementById("atlas"),actx=atlas.getContext("2d");
var tip=document.getElementById("mapTip"),mz=document.getElementById("mapZ"),mb=document.getElementById("mapBand");
var aW=0,aH=0,view={z:1,cx:.5,cy:.5},hover=-1,focusI=-1,filt="all";
function aR(){aW=atlas.clientWidth;aH=atlas.clientHeight;atlas.width=aW*DPR|0;atlas.height=aH*DPR|0;
  actx.setTransform(DPR,0,0,DPR,0,0);}
function mw(){return aW*view.z;} function mhh(){return (aW/2)*view.z;}
function proj(lon,lat){return [((lon+180)/360-view.cx)*mw()+aW/2,((90-lat)/180-view.cy)*mhh()+aH/2];}
function clamp(){view.z=Math.max(1,Math.min(2000,view.z));
  var hx=(aW/2)/mw(),hy=(aH/2)/mhh();
  view.cx=hx>=.5?.5:Math.max(hx,Math.min(1-hx,view.cx));
  view.cy=hy>=.5?.5:Math.max(hy,Math.min(1-hy,view.cy));}
/* Name the band by how much of the globe is actually on screen, not by the raw
   zoom number — a country fills the frame at a very different zoom in Israel
   than in the United States, but both are "region" scale to a reader. */
function degreesVisible(){return 360/view.z;}
function band(){var d=degreesVisible();
  return d>150?T.bandWorld : d>4?T.bandRegion : d>0.4?T.bandCity : T.bandStreet;}
function vis(p){return filt==="all"||p.type===filt;}
function drawAtlas(){
  clamp();var c=getComputedStyle(root);
  actx.clearRect(0,0,aW,aH);
  actx.fillStyle=c.getPropertyValue("--ocean").trim();actx.fillRect(0,0,aW,aH);
  actx.strokeStyle=c.getPropertyValue("--line").trim();actx.lineWidth=1;
  for(var lo=-180;lo<=180;lo+=30){var a=proj(lo,90),b=proj(lo,-90);
    actx.beginPath();actx.moveTo(a[0],a[1]);actx.lineTo(b[0],b[1]);actx.stroke();}
  for(var la=-60;la<=60;la+=30){var d=proj(-180,la),e=proj(180,la);
    actx.beginPath();actx.moveTo(d[0],d[1]);actx.lineTo(e[0],e[1]);actx.stroke();}
  actx.fillStyle=c.getPropertyValue("--land").trim();
  actx.strokeStyle=c.getPropertyValue("--line-strong").trim();actx.lineWidth=.9;
  RINGS.forEach(function(r){actx.beginPath();
    var m=r.length-1,i,p;                       // rings are closed: the last point repeats the first
    if(CURVED&&m>=3){
      var a=proj(r[m-1][0],r[m-1][1]),b=proj(r[0][0],r[0][1]);
      actx.moveTo((a[0]+b[0])/2,(a[1]+b[1])/2);
      for(i=1;i<=m;i++){p=proj(r[i===m?0:i][0],r[i===m?0:i][1]);
        actx.quadraticCurveTo(b[0],b[1],(b[0]+p[0])/2,(b[1]+p[1])/2);b=p;}
    } else for(i=0;i<r.length;i++){p=proj(r[i][0],r[i][1]);i?actx.lineTo(p[0],p[1]):actx.moveTo(p[0],p[1]);}
    actx.closePath();actx.fill();actx.stroke();});
  var labelQueue=[];
  P.forEach(function(p,i){ if(!vis(p))return;
    var s=proj(p.lon,p.lat);
    if(s[0]<-40||s[0]>aW+40||s[1]<-40||s[1]>aH+40)return;
    var col=colorFor(p.type),f=(i===hover||i===focusI),r=f?6:3.6;
    var g=actx.createRadialGradient(s[0],s[1],0,s[0],s[1],r*4);
    g.addColorStop(0,col);g.addColorStop(1,"transparent");
    actx.globalAlpha=f?.55:.3;actx.fillStyle=g;
    actx.beginPath();actx.arc(s[0],s[1],r*4,0,6.2832);actx.fill();
    actx.globalAlpha=1;actx.fillStyle=col;
    actx.beginPath();actx.arc(s[0],s[1],r,0,6.2832);actx.fill();
    if(f){actx.strokeStyle=col;actx.globalAlpha=.85;actx.lineWidth=1.5;
      actx.beginPath();actx.arc(s[0],s[1],r+6,0,6.2832);actx.stroke();actx.globalAlpha=1;}
    if(degreesVisible()<12) labelQueue.push({p:p,s:s,hot:f});
  });
  /* Institution labels, drawn last so they sit above every marker. Dense
     clusters (Tel Aviv, Chelsea) would otherwise overprint into mush, so a
     label is dropped when its box hits one already placed. A hovered or
     flown-to label always wins and is placed first. */
  if(labelQueue.length){
    actx.font='500 11px '+c.getPropertyValue("--sans").trim();
    actx.textBaseline="middle";
    var placed=[];
    labelQueue.sort(function(a,b){return (b.hot?1:0)-(a.hot?1:0);});
    labelQueue.forEach(function(q){
      var w=actx.measureText(q.p.name).width, h=13;
      var x=RTL ? q.s[0]-9-w : q.s[0]+9, y=q.s[1];
      var box={x0:x-2,y0:y-h/2,x1:x+w+2,y1:y+h/2};
      for(var i=0;i<placed.length;i++){var o=placed[i];
        if(!(box.x1<o.x0||box.x0>o.x1||box.y1<o.y0||box.y0>o.y1))return;}
      placed.push(box);
      actx.globalAlpha=q.hot?1:.9;
      actx.fillStyle=c.getPropertyValue("--paper").trim();
      actx.fillText(q.p.name,x+0.6,y+0.6);
      actx.fillStyle=c.getPropertyValue("--ink").trim();
      actx.fillText(q.p.name,x,y);
      actx.globalAlpha=1;
    });
    actx.textBaseline="alphabetic";
  }
  mz.textContent=view.z.toFixed(1);mb.textContent=band();
}
function pick(x,y){var b=-1,bd=15;P.forEach(function(p,i){if(!vis(p))return;
  var s=proj(p.lon,p.lat),d=Math.hypot(s[0]-x,s[1]-y);if(d<bd){bd=d;b=i;}});return b;}
function showTip(i){var p=P[i],s=proj(p.lon,p.lat);
  tip.querySelector(".t").textContent=p.name;
  tip.querySelector(".s").innerHTML='<i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'
    +colorFor(p.type)+';margin-inline-end:.4em"></i>'+place(p)+" · "+esc(p.type);
  tip.querySelector(".n").textContent=p.note||"";
  tip.style.left=s[0]+"px";tip.style.top=s[1]+"px";tip.style.opacity="1";}
var drag=false,lx=0,ly=0;
atlas.addEventListener("mousedown",function(e){drag=true;lx=e.clientX;ly=e.clientY;atlas.classList.add("dragging");});
addEventListener("mouseup",function(){drag=false;atlas.classList.remove("dragging");});
atlas.addEventListener("mousemove",function(e){
  var rc=atlas.getBoundingClientRect(),x=e.clientX-rc.left,y=e.clientY-rc.top;
  if(drag){view.cx-=(e.clientX-lx)/mw();view.cy-=(e.clientY-ly)/mhh();lx=e.clientX;ly=e.clientY;
    tip.style.opacity="0";drawAtlas();return;}
  var h=pick(x,y); if(h!==hover){hover=h;drawAtlas();}
  if(h>=0)showTip(h);else tip.style.opacity="0";});
atlas.addEventListener("mouseleave",function(){hover=-1;tip.style.opacity="0";drawAtlas();});
atlas.addEventListener("wheel",function(e){e.preventDefault();
  var rc=atlas.getBoundingClientRect(),x=e.clientX-rc.left,y=e.clientY-rc.top;
  var nx=view.cx+(x-aW/2)/mw(),ny=view.cy+(y-aH/2)/mhh();
  view.z*=(e.deltaY<0?1.18:1/1.18);clamp();
  view.cx=nx-(x-aW/2)/mw();view.cy=ny-(y-aH/2)/mhh();drawAtlas();},{passive:false});
document.getElementById("zIn").onclick=function(){view.z*=1.6;clamp();drawAtlas();};
document.getElementById("zOut").onclick=function(){view.z/=1.6;clamp();drawAtlas();};
document.getElementById("zReset").onclick=function(){flyToView(home(),true);};
/* An edition opens either on a view chosen by hand, or on a frame
   [west, south, east, north] fitted to whatever shape the map is right now. */
function home(){var v=L.mapView,b=v.bounds; if(!b)return v;
  return {lon:(b[0]+b[2])/2,lat:(b[1]+b[3])/2,
    zoom:Math.max(1,Math.min(360/(b[2]-b[0]),360*aH/(aW*(b[3]-b[1]))))};}
function setView(v){view.z=v.zoom;view.cx=(v.lon+180)/360;view.cy=(90-v.lat)/180;clamp();drawAtlas();}
function flyToView(target,instant){
  focusI=-1;tip.style.opacity="0";
  if(instant||reduce){setView(target);return;}
  var s={z:view.z,cx:view.cx,cy:view.cy},t0=null;
  var tz=target.zoom,tcx=(target.lon+180)/360,tcy=(90-target.lat)/180;
  (function step(ts){ if(!t0)t0=ts; var p=Math.min(1,(ts-t0)/900);
    var e=1-Math.pow(1-p,3);
    view.z=s.z+(tz-s.z)*e; view.cx=s.cx+(tcx-s.cx)*e; view.cy=s.cy+(tcy-s.cy)*e;
    clamp();drawAtlas(); if(p<1)requestAnimationFrame(step); })(performance.now());
}
function flyToPlace(i){var p=P[i];
  var s={z:view.z,cx:view.cx,cy:view.cy},t0=null,tz=300,tcx=(p.lon+180)/360,tcy=(90-p.lat)/180;
  if(reduce){view.z=tz;view.cx=tcx;view.cy=tcy;focusI=i;clamp();drawAtlas();showTip(i);return;}
  (function step(ts){ if(!t0)t0=ts; var q=Math.min(1,(ts-t0)/900),e=1-Math.pow(1-q,3);
    view.z=s.z+(tz-s.z)*e;view.cx=s.cx+(tcx-s.cx)*e;view.cy=s.cy+(tcy-s.cy)*e;
    clamp();drawAtlas(); if(q<1)requestAnimationFrame(step); else {focusI=i;drawAtlas();showTip(i);} })(performance.now());
}
chips(document.getElementById("mapChips"),[{v:"all",label:T.filterAll},{v:"Museum",label:T.filterMuseum},
  {v:"Gallery",label:T.filterGallery},{v:"Biennial",label:T.filterBiennial}],
  function(v){filt=v;hover=-1;focusI=-1;tip.style.opacity="0";drawAtlas();count();});
function count(){var n=P.filter(vis).length;
  document.getElementById("mapCount").textContent=n+" "+T.plotted;
  document.getElementById("mapChips").querySelector(".count").textContent=n+" / "+P.length;}
var si=document.getElementById("mapSearch"),sb=document.getElementById("sresults");
function closeS(){sb.classList.remove("on");sb.innerHTML="";si.setAttribute("aria-expanded","false");}
si.addEventListener("input",function(){
  var q=si.value.trim().toLowerCase(); if(!q){closeS();return;}
  var hits=[];P.forEach(function(p,i){
    if(((p.name||"")+" "+(p.nameEn||"")+" "+p.city+" "+p.country).toLowerCase().indexOf(q)>=0)hits.push(i);});
  if(!hits.length){sb.innerHTML='<button type="button" disabled style="color:var(--faint)">'+esc(T.noMatch)+"</button>";
    sb.classList.add("on");return;}
  sb.innerHTML=hits.slice(0,8).map(function(i){var p=P[i];
    return '<button type="button" role="option" data-i="'+i+'">'+esc(p.name)+
      '<span class="sub">'+place(p)+" · "+esc(p.type)+"</span></button>";}).join("");
  sb.classList.add("on");si.setAttribute("aria-expanded","true");
  sb.querySelectorAll("button[data-i]").forEach(function(b){
    b.addEventListener("click",function(){flyToPlace(+b.dataset.i);closeS();si.value=P[+b.dataset.i].name;});});
});
si.addEventListener("keydown",function(e){ if(e.key==="Escape")closeS();
  if(e.key==="Enter"){var f=sb.querySelector("button[data-i]");if(f){e.preventDefault();f.click();}}});
document.addEventListener("click",function(e){if(!sb.contains(e.target)&&e.target!==si)closeS();});
addEventListener("resize",function(){aR();drawAtlas();});
/* map labels are drawn on a canvas, which will not repaint itself when the typeface arrives */
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(drawAtlas);
aR();setView({lon:0,lat:20,zoom:1});count();

/* first time the atlas scrolls into view, fly from world to the edition's region */
var flown=false;
if("IntersectionObserver" in window){
  new IntersectionObserver(function(en,o){ en.forEach(function(x){
    if(x.isIntersecting&&!flown){flown=true;flyToView(home());o.disconnect();} });},{threshold:.25})
  .observe(document.querySelector(".map-shell"));
} else { setView(home()); }

/* ---------- reveals (stagger) ---------- */
if("IntersectionObserver" in window && !reduce){
  var io=new IntersectionObserver(function(en){ en.forEach(function(x,i){
    if(x.isIntersecting){ x.target.style.transitionDelay=(i*parseInt(getComputedStyle(root).getPropertyValue("--stagger"))||0)+"ms";
      x.target.classList.add("in"); io.unobserve(x.target); } });},
    {threshold:0,rootMargin:"0px 0px -40px 0px"});
  document.querySelectorAll(".rv").forEach(function(e){io.observe(e);});
} else document.querySelectorAll(".rv").forEach(function(e){e.classList.add("in");});

/* ---------- join ---------- */
var f=document.getElementById("joinForm"),em=document.getElementById("joinEmail"),mg=document.getElementById("joinMsg");
f.addEventListener("submit",function(e){e.preventDefault();
  var v=(em.value||"").trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){mg.style.color="var(--signal)";mg.textContent=T.joinErr;return;}
  mg.style.color="var(--cool)";mg.textContent=T.joinOk;em.value="";});
})();
