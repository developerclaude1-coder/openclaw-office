(function(){
  "use strict";
  var DATA = __DATA__;
  var LAND_ENC = "__LAND__";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function host(u){ try{ return new URL(u).hostname.replace(/^www\./,""); }catch(e){ return "source"; } }

  /* ---------- theme ---------- */
  var themeBtn = document.getElementById("themeBtn");
  function isDark(){
    var a = root.getAttribute("data-theme");
    return a ? a==="dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  if(!isDark()) themeBtn.textContent = "◑ Theme";
  themeBtn.addEventListener("click", function(){
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    themeBtn.textContent = (next==="dark"?"◐":"◑") + " Theme";
    if(atlas) drawAtlas();
  });

  /* A tone chosen here, or arrived in, goes along to the edition you open. */
  document.addEventListener("click", function(e){
    var a = e.target.closest && e.target.closest("a.door,.foot-editions a,a.xpage");
    var tone = root.getAttribute("data-theme");
    if(a && tone) a.hash = "via-"+tone;
  });

  /* ---------- hero instrument ---------- */
  var BANDS = [
    {name:"COSMOS", scale:"10²¹ m", cap:"The whole field — every scene, at once."},
    {name:"REGION", scale:"10⁶ m",  cap:"Art capitals and the routes between them."},
    {name:"CITY",   scale:"10³ m",  cap:"Gallery districts and the people who move between them."},
    {name:"INSTIT", scale:"10¹ m",  cap:"A museum, its walls, its programme."},
    {name:"ARTIST", scale:"10⁰ m",  cap:"One studio — a practice taking shape."},
    {name:"WORK",   scale:"10⁻² m", cap:"A single work, held to the light."},
    {name:"MATTER", scale:"10⁻⁹ m", cap:"Pigment, canvas, gesture — down to the atom."}
  ];
  var dial=document.getElementById("dial"), hudBand=document.getElementById("hudBand"),
      hudScale=document.getElementById("hudScale"), hudCap=document.getElementById("hudCap"),
      resLabels=document.getElementById("resLabels");
  BANDS.forEach(function(b,i){ var s=document.createElement("span"); s.textContent=b.name.slice(0,4);
    s.dataset.i=i; resLabels.appendChild(s); });
  var labelEls=resLabels.querySelectorAll("span");
  function updateHUD(v){
    var b=Math.max(0,Math.min(BANDS.length-1,Math.round((v/100)*(BANDS.length-1))));
    hudBand.textContent=BANDS[b].name; hudScale.textContent=BANDS[b].scale; hudCap.textContent=BANDS[b].cap;
    dial.style.setProperty("--fill", v+"%");
    labelEls.forEach(function(el){ el.classList.toggle("on", +el.dataset.i===b); });
  }
  var cv=document.getElementById("field"), ctx=cv.getContext("2d");
  var W=0,H=0,DPR=Math.min(window.devicePixelRatio||1,2), stars=[];
  function pal(){ var cs=getComputedStyle(root); return {
    amber:cs.getPropertyValue("--accent").trim(), cyan:cs.getPropertyValue("--accent-2").trim(),
    ink:cs.getPropertyValue("--ink").trim(), dark:isDark() }; }
  function resizeField(){ W=cv.clientWidth;H=cv.clientHeight;
    cv.width=Math.floor(W*DPR);cv.height=Math.floor(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0); }
  function seed(){ stars=[]; for(var i=0;i<520;i++) stars.push({
    x:Math.random()*2-1, y:Math.random()*2-1, z:Math.random(), c:Math.random(), r:.4+Math.random()*1.5 }); }
  var zoomTarget=.42, zoom=.42, autoT=0, touched=false;
  function drawField(){
    var p=pal(); ctx.clearRect(0,0,W,H);
    var cx=W/2, cy=H*.46;
    zoom += (zoomTarget-zoom)*.06;
    var speed=.0016+zoom*.006;
    ctx.save(); ctx.globalAlpha=p.dark?.10:.16; ctx.strokeStyle=p.cyan;
    for(var g=1;g<=4;g++){ ctx.beginPath();
      ctx.arc(cx,cy,(Math.min(W,H)*.11)*g*(.7+zoom*.9),0,6.2832); ctx.stroke(); }
    ctx.restore();
    for(var i=0;i<stars.length;i++){
      var s=stars[i]; s.z-=speed;
      if(s.z<=.02){ s.z=1; s.x=Math.random()*2-1; s.y=Math.random()*2-1; s.c=Math.random(); }
      var k=(.4+zoom*1.4)/s.z, px=cx+s.x*k*(W*.55), py=cy+s.y*k*(H*.55);
      if(px<-20||px>W+20||py<-20||py>H+20) continue;
      var size=s.r*(.5+(1-s.z)*2.2)*(.6+zoom), a=Math.min(1,(1-s.z)*1.3);
      var col=s.c<.72?p.ink:(s.c<.9?p.amber:p.cyan);
      ctx.globalAlpha=a*(p.dark?.9:.5); ctx.fillStyle=col;
      ctx.beginPath(); ctx.arc(px,py,Math.max(.3,size),0,6.2832); ctx.fill();
      if(zoom>.55&&size>1.2){
        var k2=(.4+zoom*1.4)/Math.min(1,s.z+.05);
        ctx.globalAlpha=a*.35; ctx.strokeStyle=col; ctx.lineWidth=Math.max(.4,size*.5);
        ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(cx+s.x*k2*(W*.55), cy+s.y*k2*(H*.55)); ctx.stroke();
      }
    }
    ctx.globalAlpha=.5+zoom*.4; ctx.strokeStyle=p.amber; ctx.lineWidth=1.2;
    var ap=22+(1-zoom)*46;
    ctx.beginPath(); ctx.arc(cx,cy,ap,0,6.2832); ctx.stroke();
    ctx.globalAlpha=.6;
    [[0,-1],[0,1],[-1,0],[1,0]].forEach(function(d){ ctx.beginPath();
      ctx.moveTo(cx+d[0]*(ap+5),cy+d[1]*(ap+5)); ctx.lineTo(cx+d[0]*(ap+13),cy+d[1]*(ap+13)); ctx.stroke(); });
    ctx.globalAlpha=1;
  }
  function fieldLoop(){
    if(autoT<1 && !touched){ autoT+=.004; var v=8+autoT*40; dial.value=v; zoomTarget=v/100; updateHUD(v); }
    drawField(); requestAnimationFrame(fieldLoop);
  }
  dial.addEventListener("input", function(){ touched=true; zoomTarget=(+dial.value)/100; updateHUD(dial.value); });
  resizeField(); seed(); updateHUD(dial.value); zoomTarget=(+dial.value)/100;
  if(reduce){ zoom=zoomTarget=.5; drawField(); } else fieldLoop();
  window.addEventListener("resize", function(){ resizeField(); if(reduce) drawField(); });

  /* ---------- ticker: real, current entries ---------- */
  var tick=[];
  DATA.commissions.filter(function(c){return c.access==="open call"||c.access==="registry";})
    .slice(0,5).forEach(function(c){ tick.push(["OPEN", c.name+" · "+c.city]); });
  DATA.residencies.slice(0,5).forEach(function(r){ tick.push(["RESIDENCY", r.name+" · "+r.city]); });
  DATA.places.filter(function(p){return p.type==="Biennial";}).slice(0,4)
    .forEach(function(b){ tick.push(["BIENNIAL", b.name+" · "+b.city]); });
  var tHTML = tick.map(function(t){ return "<span><b>"+esc(t[0])+"</b> "+esc(t[1])+"</span>"; }).join("<i>◆</i>");
  document.getElementById("ticker").innerHTML = tHTML+"<i>◆</i>"+tHTML;

  /* ---------- connect ---------- */
  function liList(arr, key){
    return arr.map(function(x){
      return "<li><div><strong>"+esc(x[key])+"</strong><span>"+esc(x.detail)+"</span></div></li>";
    }).join("");
  }
  document.getElementById("artistNeeds").innerHTML = liList(DATA.connect.artistNeeds,"point");
  document.getElementById("collectorNeeds").innerHTML = liList(DATA.connect.collectorNeeds,"point");
  document.getElementById("gapFacts").innerHTML = DATA.connect.gapFacts.map(function(f){
    return '<div class="fact"><h4>'+esc(f.fact)+"</h4><p>"+esc(f.detail)+"</p></div>";
  }).join("");

  /* ---------- cards ---------- */
  function confLabel(c){ return c==="high" ? "" : '<span class="conf">'+esc(c)+" confidence</span>"; }
  function srcLink(u){ return u ? '<a href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(host(u))+" ↗</a>" : ""; }
  var ACCESS_TAG = {"open call":"cyan","registry":"cyan","mixed":"ghost","invitation":"ghost"};

  function commCard(c){
    return '<article class="card" data-cat="'+esc(c.category)+'" data-access="'+esc(c.access||"")+'">'
      + '<div class="card-top"><span class="tag">'+esc(c.category)+"</span>"
      + (c.access ? '<span class="tag '+(ACCESS_TAG[c.access]||"ghost")+'">'+esc(c.access)+"</span>" : "")
      + "</div>"
      + "<h3>"+esc(c.name)+"</h3>"
      + '<div class="where">'+esc(c.org)+" — "+esc(c.city)+", "+esc(c.country)+"</div>"
      + "<p>"+esc(c.summary)+"</p>"
      + "<dl><div><dt>Funding</dt><dd>"+esc(c.budgetNote)+"</dd></div>"
      + "<div><dt>How it opens</dt><dd>"+esc(c.cycleNote)+"</dd></div></dl>"
      + '<div class="foot">'+confLabel(c.confidence)+srcLink(c.sourceUrl)+"</div></article>";
  }
  function resCard(r){
    return '<article class="card" data-region="'+esc(r.region||"")+'">'
      + '<div class="card-top"><span class="tag cyan">Residency</span>'
      + (r.region ? '<span class="tag ghost">'+esc(r.region)+"</span>" : "") + "</div>"
      + "<h3>"+esc(r.name)+"</h3>"
      + '<div class="where">'+esc(r.city)+", "+esc(r.country)+"</div>"
      + "<p>"+esc(r.summary)+"</p>"
      + "<dl><div><dt>Length</dt><dd>"+esc(r.duration)+"</dd></div>"
      + "<div><dt>Provides</dt><dd>"+esc(r.funding)+"</dd></div>"
      + "<div><dt>For</dt><dd>"+esc(r.disciplines)+"</dd></div>"
      + "<div><dt>Applying</dt><dd>"+esc(r.applicationNote)+"</dd></div></dl>"
      + '<div class="foot">'+confLabel(r.confidence)+srcLink(r.sourceUrl)+"</div></article>";
  }

  function buildChips(host, defs, onPick){
    host.innerHTML = defs.map(function(d,i){
      return '<button class="chip" data-v="'+esc(d.v)+'" aria-pressed="'+(i===0)+'">'+esc(d.label)+"</button>";
    }).join("") + '<span class="count"></span>';
    host.querySelectorAll(".chip").forEach(function(ch){
      ch.addEventListener("click", function(){
        host.querySelectorAll(".chip").forEach(function(c){ c.setAttribute("aria-pressed","false"); });
        ch.setAttribute("aria-pressed","true"); onPick(ch.dataset.v);
      });
    });
  }
  function setCount(host,n,total){
    var el=host.querySelector(".count");
    if(el) el.textContent = n===total ? total+" listed" : n+" of "+total;
  }

  var commGrid=document.getElementById("commGrid"), commChips=document.getElementById("commChips");
  function renderComm(v){
    var list = DATA.commissions.filter(function(c){
      if(v==="all") return true;
      if(v==="openable") return c.access==="open call"||c.access==="registry"||c.access==="mixed";
      return c.category===v;
    });
    commGrid.innerHTML = list.map(commCard).join("");
    setCount(commChips, list.length, DATA.commissions.length);
  }
  buildChips(commChips, [
    {v:"all",label:"All"},{v:"openable",label:"You can apply"},{v:"public",label:"Public art"},
    {v:"institutional",label:"Institutional"},{v:"digital",label:"Digital"},{v:"civic",label:"Civic"}
  ], renderComm);
  renderComm("all");

  var resGrid=document.getElementById("resGrid"), resChips=document.getElementById("resChips");
  var regions=[]; DATA.residencies.forEach(function(r){ if(r.region&&regions.indexOf(r.region)<0) regions.push(r.region); });
  regions.sort();
  function renderRes(v){
    var list = DATA.residencies.filter(function(r){ return v==="all" || r.region===v; });
    resGrid.innerHTML = list.map(resCard).join("");
    setCount(resChips, list.length, DATA.residencies.length);
  }
  buildChips(resChips, [{v:"all",label:"Everywhere"}].concat(regions.map(function(r){return {v:r,label:r};})), renderRes);
  renderRes("all");

  /* ---------- ATLAS ---------- */
  var RINGS = LAND_ENC.split(";").map(function(r){
    var px=0,py=0;
    return r.split(" ").map(function(p){ var a=p.split(",");
      px+=parseInt(a[0],36); py+=parseInt(a[1],36); return [px/10,py/10]; });
  });
  var PLACES = DATA.places;
  var COLORS = {Museum:"#F2A93B", Gallery:"#7FB2D9", Biennial:"#C77DFF"};
  var atlas=document.getElementById("atlas"), actx=atlas.getContext("2d");
  var mapTip=document.getElementById("mapTip"), mapZ=document.getElementById("mapZ"), mapBand=document.getElementById("mapBand");
  var aW=0,aH=0, view={z:1,cx:.5,cy:.5}, hover=-1, filter="all", focusIdx=-1;

  function aResize(){ aW=atlas.clientWidth; aH=atlas.clientHeight;
    atlas.width=Math.floor(aW*DPR); atlas.height=Math.floor(aH*DPR); actx.setTransform(DPR,0,0,DPR,0,0); }
  function mw(){ return aW*view.z; }
  function mh(){ return (aW/2)*view.z; }
  function proj(lon,lat){ return [ ((lon+180)/360-view.cx)*mw()+aW/2, ((90-lat)/180-view.cy)*mh()+aH/2 ]; }
  function clampView(){
    view.z=Math.max(1,Math.min(60,view.z));
    var hx=(aW/2)/mw(), hy=(aH/2)/mh();
    view.cx = hx>=.5 ? .5 : Math.max(hx,Math.min(1-hx,view.cx));
    view.cy = hy>=.5 ? .5 : Math.max(hy,Math.min(1-hy,view.cy));
  }
  function bandName(){ return view.z<2?"World":view.z<6?"Region":view.z<16?"City":"Street"; }
  function visible(p){ return filter==="all" || p.type===filter; }
  function drawAtlas(){
    clampView();
    var cs=getComputedStyle(root);
    var ocean=cs.getPropertyValue("--ocean").trim(), land=cs.getPropertyValue("--land").trim();
    actx.clearRect(0,0,aW,aH);
    actx.fillStyle=ocean; actx.fillRect(0,0,aW,aH);
    actx.strokeStyle=cs.getPropertyValue("--line").trim(); actx.lineWidth=1;
    for(var lo=-180;lo<=180;lo+=30){ var a=proj(lo,90),b=proj(lo,-90);
      actx.beginPath();actx.moveTo(a[0],a[1]);actx.lineTo(b[0],b[1]);actx.stroke(); }
    for(var la=-60;la<=60;la+=30){ var c=proj(-180,la),d=proj(180,la);
      actx.beginPath();actx.moveTo(c[0],c[1]);actx.lineTo(d[0],d[1]);actx.stroke(); }
    actx.fillStyle=land; actx.strokeStyle=cs.getPropertyValue("--line-strong").trim(); actx.lineWidth=.9;
    RINGS.forEach(function(r){
      actx.beginPath();
      for(var i=0;i<r.length;i++){ var p=proj(r[i][0],r[i][1]); i?actx.lineTo(p[0],p[1]):actx.moveTo(p[0],p[1]); }
      actx.closePath(); actx.fill(); actx.stroke();
    });
    PLACES.forEach(function(p,i){
      if(!visible(p)) return;
      var s=proj(p.lon,p.lat);
      if(s[0]<-40||s[0]>aW+40||s[1]<-40||s[1]>aH+40) return;
      var col=COLORS[p.type]||"#F2A93B";
      var isF = (i===hover||i===focusIdx);
      var r=(isF?6:3.6);
      var g=actx.createRadialGradient(s[0],s[1],0,s[0],s[1],r*4);
      g.addColorStop(0,col); g.addColorStop(1,"transparent");
      actx.globalAlpha=isF?.6:.32; actx.fillStyle=g;
      actx.beginPath(); actx.arc(s[0],s[1],r*4,0,6.2832); actx.fill();
      actx.globalAlpha=1; actx.fillStyle=col;
      actx.beginPath(); actx.arc(s[0],s[1],r,0,6.2832); actx.fill();
      if(isF){ actx.strokeStyle=col; actx.globalAlpha=.85; actx.lineWidth=1.5;
        actx.beginPath(); actx.arc(s[0],s[1],r+6,0,6.2832); actx.stroke(); actx.globalAlpha=1; }
      if(view.z>=5){
        actx.globalAlpha=.85; actx.fillStyle=cs.getPropertyValue("--ink").trim();
        actx.font='500 11px '+cs.getPropertyValue("--sans").trim();
        actx.fillText(p.name, s[0]+9, s[1]+3.5); actx.globalAlpha=1;
      }
    });
    mapZ.textContent=view.z.toFixed(1); mapBand.textContent=bandName();
  }
  function pick(mx,my){
    var best=-1,bd=15;
    PLACES.forEach(function(p,i){ if(!visible(p)) return;
      var s=proj(p.lon,p.lat), d=Math.hypot(s[0]-mx,s[1]-my); if(d<bd){bd=d;best=i;} });
    return best;
  }
  function showTip(i){
    var p=PLACES[i], s=proj(p.lon,p.lat);
    mapTip.querySelector(".t").textContent=p.name;
    mapTip.querySelector(".s").innerHTML='<i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'
      +COLORS[p.type]+';margin-right:.4em"></i>'+esc(p.city)+", "+esc(p.country)+" · "+esc(p.type);
    mapTip.querySelector(".n").textContent=p.note||"";
    mapTip.style.left=s[0]+"px"; mapTip.style.top=s[1]+"px"; mapTip.style.opacity="1";
  }
  var dragging=false,lx=0,ly=0;
  atlas.addEventListener("mousedown",function(e){ dragging=true;lx=e.clientX;ly=e.clientY;atlas.classList.add("dragging"); });
  window.addEventListener("mouseup",function(){ dragging=false;atlas.classList.remove("dragging"); });
  atlas.addEventListener("mousemove",function(e){
    var rc=atlas.getBoundingClientRect(), mx=e.clientX-rc.left, my=e.clientY-rc.top;
    if(dragging){ view.cx-=(e.clientX-lx)/mw(); view.cy-=(e.clientY-ly)/mh(); lx=e.clientX;ly=e.clientY;
      mapTip.style.opacity="0"; drawAtlas(); return; }
    var h=pick(mx,my);
    if(h!==hover){ hover=h; drawAtlas(); }
    if(h>=0) showTip(h); else mapTip.style.opacity="0";
  });
  atlas.addEventListener("mouseleave",function(){ hover=-1; mapTip.style.opacity="0"; drawAtlas(); });
  atlas.addEventListener("wheel",function(e){
    e.preventDefault();
    var rc=atlas.getBoundingClientRect(), mx=e.clientX-rc.left, my=e.clientY-rc.top;
    var nx=view.cx+(mx-aW/2)/mw(), ny=view.cy+(my-aH/2)/mh();
    view.z *= (e.deltaY<0?1.18:1/1.18); clampView();
    view.cx=nx-(mx-aW/2)/mw(); view.cy=ny-(my-aH/2)/mh();
    drawAtlas();
  },{passive:false});
  function zoomBy(f){ view.z*=f; clampView(); drawAtlas(); }
  document.getElementById("zIn").addEventListener("click",function(){ zoomBy(1.6); });
  document.getElementById("zOut").addEventListener("click",function(){ zoomBy(1/1.6); });
  document.getElementById("zReset").addEventListener("click",function(){
    view.z=1;view.cx=.5;view.cy=.5;focusIdx=-1;mapTip.style.opacity="0";drawAtlas(); });
  function flyTo(i){
    var p=PLACES[i];
    view.z=9; view.cx=(p.lon+180)/360; view.cy=(90-p.lat)/180; focusIdx=i;
    clampView(); drawAtlas(); showTip(i);
  }
  buildChips(document.getElementById("mapChips"), [
    {v:"all",label:"All"},{v:"Museum",label:"Museums"},{v:"Gallery",label:"Galleries"},{v:"Biennial",label:"Biennials"}
  ], function(v){ filter=v; hover=-1; focusIdx=-1; mapTip.style.opacity="0"; drawAtlas(); updateMapCount(); });
  function updateMapCount(){
    var n=PLACES.filter(visible).length;
    document.getElementById("mapCount").textContent = n+" institutions plotted";
    var el=document.getElementById("mapChips").querySelector(".count");
    if(el) el.textContent = n===PLACES.length ? PLACES.length+" total" : n+" of "+PLACES.length;
  }

  var sInput=document.getElementById("mapSearch"), sBox=document.getElementById("sresults");
  function closeSearch(){ sBox.classList.remove("on"); sBox.innerHTML=""; sInput.setAttribute("aria-expanded","false"); }
  sInput.addEventListener("input",function(){
    var q=sInput.value.trim().toLowerCase();
    if(!q){ closeSearch(); return; }
    var hits=[];
    PLACES.forEach(function(p,i){
      if((p.name+" "+p.city+" "+p.country).toLowerCase().indexOf(q)>=0) hits.push(i);
    });
    if(!hits.length){ sBox.innerHTML='<button type="button" disabled style="color:var(--faint)">No match</button>';
      sBox.classList.add("on"); return; }
    sBox.innerHTML = hits.slice(0,8).map(function(i){
      var p=PLACES[i];
      return '<button type="button" role="option" data-i="'+i+'">'+esc(p.name)
        +'<span class="sub">'+esc(p.city)+", "+esc(p.country)+" · "+esc(p.type)+"</span></button>";
    }).join("");
    sBox.classList.add("on"); sInput.setAttribute("aria-expanded","true");
    sBox.querySelectorAll("button[data-i]").forEach(function(b){
      b.addEventListener("click",function(){ flyTo(+b.dataset.i); closeSearch(); sInput.value=PLACES[+b.dataset.i].name; });
    });
  });
  sInput.addEventListener("keydown",function(e){
    if(e.key==="Escape"){ closeSearch(); }
    if(e.key==="Enter"){ var f=sBox.querySelector("button[data-i]"); if(f){ e.preventDefault(); f.click(); } }
  });
  document.addEventListener("click",function(e){ if(!sBox.contains(e.target)&&e.target!==sInput) closeSearch(); });

  window.addEventListener("resize", function(){ aResize(); drawAtlas(); });
  /* map labels are drawn on a canvas, which will not repaint itself when the typeface arrives */
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(drawAtlas);
  aResize(); drawAtlas(); updateMapCount();
  window.__flyTo=flyTo;

  /* ---------- reveal ---------- */
  if("IntersectionObserver" in window && !reduce){
    // threshold 0 + a small bottom margin: a card grid taller than the viewport
    // must still reveal as soon as its first pixel scrolls into view.
    var io=new IntersectionObserver(function(en){
      en.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add("in"); io.unobserve(x.target); } });
    },{threshold:0, rootMargin:"0px 0px -40px 0px"});
    document.querySelectorAll(".reveal").forEach(function(el){ io.observe(el); });
  } else document.querySelectorAll(".reveal").forEach(function(el){ el.classList.add("in"); });

  /* ---------- join ---------- */
  var form=document.getElementById("joinForm"), email=document.getElementById("joinEmail"), msg=document.getElementById("joinMsg");
  form.addEventListener("submit",function(e){
    e.preventDefault();
    var v=(email.value||"").trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){
      msg.style.color="var(--accent)"; msg.textContent="Enter a valid email to request access."; return;
    }
    msg.style.color="var(--accent-2)";
    msg.textContent="◇ Request received — we'll place you on the map shortly.";
    email.value="";
  });
})();
