/* The markup of the project and support pages, rendered from content.json.
 *
 *   const R = require('./render.cjs')(context)
 *   R.project() / R.support()   -> the <main> of each page
 *   R.footer(page)              -> the shared footer
 *
 * `context` carries the copy (C), the numbers counted from the dataset (N),
 * the links laid out for where the pages are written (LINKS), and the
 * edition directory. Nothing in here reads a file.
 */
module.exports = function render({ C, N, LINKS, DIRECTORY, fill }) {
  const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const t = (s) => esc(fill(s));                 // copy with its numbers filled in, escaped
  const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const pct = (part, whole) => Math.round((part / whole) * 100) + '%';
  const out = (href, label, cls) => href
    ? '<a class="' + (cls || 'btn') + '" href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(label) + ' <span aria-hidden="true">↗</span></a>'
    : '<span class="' + (cls || 'btn') + ' btn--off" aria-disabled="true">' + esc(label) + ' · coming soon</span>';
  const inner = (href, label, cls) => '<a class="' + (cls || 'btn') + ' xpage" href="' + esc(href) + '">' + esc(label) + ' <span aria-hidden="true">→</span></a>';
  const head = (eyebrow, title, lede) => '<div class="sec-head"><p class="eyebrow"><span class="dot"></span>' + t(eyebrow) + '</p>'
    + '<h2>' + t(title) + '</h2>' + (lede ? '<p class="lede">' + t(lede) + '</p>' : '') + '</div>';
  const P = C.project, S = C.support;

  /* ---------- shared figures ---------- */

  /* A thin segmented bar: one whole, the listings, split by how sure we are of
     them. The list beside it carries every figure, so the bar has no text. */
  function confidence() {
    const parts = [['high', 'High', N.H], ['medium', 'Medium', N.M], ['low', 'Low', N.LO]];
    const label = parts.map(([, name, n]) => name + ' ' + n).join(', ');
    return '<figure class="conf"><figcaption>' + t(P.confTitle) + '</figcaption>'
      + '<div class="segbar" role="img" aria-label="' + esc(fill(P.confTitle) + ': ' + label) + '">'
      + parts.map(([k, name, n]) => '<span class="seg c-' + k + '" style="flex:' + n + ' 1 0" data-tip="'
        + esc(name + ' confidence · ' + n + ' listings · ' + pct(n, N.L)) + '"></span>').join('') + '</div>'
      + '<ul class="seglist">' + parts.map(([k, name, n]) => '<li><i class="sw c-' + k + '" aria-hidden="true"></i>'
        + name + ' <b>' + n + '</b> <span>' + pct(n, N.L) + '</span></li>').join('') + '</ul></figure>';
  }

  /* ---------- the project page ---------- */

  function documents() {
    const card = (d) => {
      const href = d.internal ? LINKS[d.internal] : C.links[d.link];
      const outline = d.outline ? '<details class="outline"><summary>What is in it</summary><ol>'
        + d.outline.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ol></details>' : '';
      return '<article class="doc' + (d.internal ? ' doc--support' : '') + '" id="doc-' + d.id + '">'
        + '<p class="kind">' + esc(d.kind) + '</p><h3>' + esc(d.title) + '</h3><p>' + t(d.body) + '</p>' + outline
        + '<div class="doc-cta">' + (d.internal ? inner(href, d.cta, 'btn btn--solid') : out(href, d.cta)) + '</div></article>';
    };
    return '<section class="sec" id="documents"><div class="wrap">' + head(P.docsEyebrow, P.docsTitle)
      + '<div class="docs">' + C.documents.map(card).join('') + '</div>'
      + '<p class="note">' + t(P.docsNote) + '</p></div></section>';
  }

  function standing() {
    const tiles = [['Listings', N.L], ['Institutions', N.P], ['Countries', N.K], ['Editions', N.E]];
    const rows = C.today.map((r) => '<tr><th scope="row">' + esc(r.part) + '</th><td>' + t(r.today) + '</td><td>' + t(r.next) + '</td></tr>').join('');
    return '<section class="sec" id="now"><div class="wrap">' + head(P.nowEyebrow, P.nowTitle, P.nowLede)
      + '<div class="tiles">' + tiles.map(([l, v]) => '<div class="tile"><span>' + l + '</span><b>' + v + '</b></div>').join('') + '</div>'
      + confidence()
      + '<table class="compare"><thead><tr><th scope="col"><span class="vh">Part</span></th><th scope="col">' + t(P.nowTableToday)
      + '</th><th scope="col">' + t(P.nowTableNext) + '</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>';
  }

  /* the phases a workstream runs through, shown beside its name when there is more than one */
  const span = (w) => w.span || (w.phases[0] === w.phases[1] ? '' : w.phases[0] + '–' + w.phases[1]);
  function roadmap() {
    const total = C.phases[C.phases.length - 1].months[1];
    /* the timeline: one hue, four blocks as wide as their months, each a link to its phase */
    const blocks = C.phases.map((ph) => {
      const len = ph.months[1] - ph.months[0] + 1;
      const tip = 'Phase ' + ph.n + ' · ' + ph.name + ' · months ' + ph.months[0] + '–' + ph.months[1] + ' · ' + len + ' months';
      return '<a class="tblock" href="#phase-' + ph.n + '" style="flex:' + len + ' 1 0" data-tip="' + esc(tip) + '" aria-label="' + esc(tip) + '">'
        + '<span class="lbl" data-full="' + esc(ph.n + ' · ' + ph.name) + '">' + ph.n + '</span></a>';
    }).join('');
    const ends = [0].concat(C.phases.map((ph) => ph.months[1]));
    const ticks = ends.map((m) => '<span style="left:' + (m / total * 100).toFixed(2) + '%">' + m + '</span>').join('');
    const items = (list, n, who) => list.filter((w) => w.phases[0] === n).map((w) => '<li><b>' + esc(w.name) + '</b>'
      + (span(w) ? ' <span class="span">Phases ' + esc(span(w)) + '</span>' : '') + '<p>' + t(w.what) + '</p>'
      + (who && w.who ? '<p class="who">' + esc(w.who) + '</p>' : '') + '</li>').join('');
    const phase = (ph) => '<li class="phase' + (ph.n === 1 ? ' phase--pilot' : '') + '" id="phase-' + ph.n + '">'
      + '<div class="ph-meta"><p class="ph-n">Phase ' + ph.n + ' · Months ' + ph.months[0] + '–' + ph.months[1] + '</p>'
      + '<h3>' + esc(ph.name) + (ph.where ? ' <span>' + esc(ph.where) + '</span>' : '') + '</h3><p class="ph-sum">' + t(ph.summary) + '</p>'
      + '<dl class="ph-facts"><div><dt>Team</dt><dd>' + ph.people + ' full-time · ' + esc(ph.team) + '</dd></div>'
      + '<div><dt>Cost</dt><dd>$' + ph.costM.toFixed(2) + ' million</dd></div></dl>'
      + '<div class="gate"><p class="g-h">' + t(P.gateTitle) + ' · month ' + ph.gate.month + '</p><p>' + t(ph.gate.what) + '</p>'
      + '<p class="g-t">' + t(ph.gate.target) + '</p></div></div>'
      + '<div class="ph-cols"><div><h4>' + t(P.builtTitle) + '</h4><ul>' + items(C.built, ph.n) + '</ul></div>'
      + '<div><h4>' + t(P.groundTitle) + '</h4><ul>' + items(C.ground, ph.n, true) + '</ul></div></div></li>';
    return '<section class="sec" id="roadmap"><div class="wrap">' + head(P.roadmapEyebrow, P.roadmapTitle, P.roadmapLede)
      + '<figure class="timeline"><p class="now"><span>' + t(P.timelineNow) + '</span></p>'
      + '<div class="tbar" role="group" aria-label="' + t(P.timelineLabel) + '">' + blocks + '</div>'
      + '<div class="ticks" aria-hidden="true">' + ticks + '</div><figcaption class="axis">Months</figcaption></figure>'
      + '<ol class="phases">' + C.phases.map(phase).join('') + '</ol>'
      + '<p class="note">' + t(P.gateNote) + ' ' + t(P.budgetLine) + '</p></div></section>';
  }

  function involved() {
    const card = (c) => {
      const cta = c.to ? inner(LINKS[c.to], c.cta, 'btn') : out(C.links[c.link], c.cta);
      return '<article class="way"><p class="kind">' + esc(c.who) + '</p><h3>' + esc(c.title) + '</h3><p>' + t(c.body) + '</p>'
        + '<div class="doc-cta">' + cta + '</div></article>';
    };
    const mail = C.contact.email ? '<p class="note">Or write to us: <a href="mailto:' + esc(C.contact.email) + '">' + esc(C.contact.email) + '</a></p>' : '';
    return '<section class="sec" id="involved"><div class="wrap">' + head(P.involvedEyebrow, P.involvedTitle)
      + '<div class="ways">' + C.involved.map(card).join('') + '</div>' + mail + '</div></section>';
  }

  function project() {
    return '<section class="hero" id="top"><div class="wrap"><p class="eyebrow"><span class="dot"></span>' + t(P.heroEyebrow) + ' · ' + esc(C.asOf) + '</p>'
      + '<h1>' + t(P.heroTitle) + '</h1><p class="lede">' + t(P.heroLede) + '</p>'
      + '<div class="cta"><a class="btn btn--solid" href="#documents">Open the documents <span aria-hidden="true">↓</span></a>'
      + inner(LINKS.support, 'Support the first step') + '</div></div></section>'
      + documents() + standing() + roadmap() + involved();
  }

  /* ---------- the support page ---------- */

  function donateButton(cls) {
    return C.links.gofundme
      ? '<a class="btn btn--solid donate ' + (cls || '') + '" href="' + esc(C.links.gofundme) + '" target="_blank" rel="noopener">' + t(S.donate) + ' <span aria-hidden="true">↗</span></a>'
      : '<span class="btn btn--off donate ' + (cls || '') + '" aria-disabled="true">' + t(S.soon) + '</span>';
  }

  /* A meter list: each line of Phase 0 against the whole of it. Every name and
     figure is printed, so the bars only show the proportion. */
  function split() {
    const lines = N.lines;
    return '<figure class="split"><figcaption>' + t(S.splitTitle) + '</figcaption><ul class="meters">'
      + lines.map((l) => '<li class="m" tabindex="0" data-tip="' + esc(l.name + ' · ' + usd(l.total) + ' · ' + pct(l.total, N.PH0) + ' of Phase 0') + '">'
        + '<div class="m-name"><b>' + esc(l.name) + '</b>' + (l.goal === 'first' ? ' <em class="tag">' + t(S.goalLabel) + '</em>' : '')
        + '<span>' + esc(l.detail) + '</span></div>'
        + '<div class="m-bar" aria-hidden="true"><i style="width:' + (l.total / N.PH0 * 100).toFixed(1) + '%"></i></div>'
        + '<b class="m-fig">' + usd(l.total) + '</b></li>').join('')
      + '<li class="m m--total"><div class="m-name"><b>Phase 0</b></div><div class="m-bar" aria-hidden="true"></div><b class="m-fig">' + usd(N.PH0) + '</b></li>'
      + '</ul><p class="note">' + t(S.splitNote) + '</p></figure>';
  }

  function support() {
    const tier = (x) => '<article class="tier tier--' + x.goal + '"><p class="kind">' + t(x.label) + ' · ' + (x.goal === 'first' ? usd(N.G1) : usd(N.PH0)) + '</p>'
      + '<h3>' + t(x.title) + '</h3><ul>' + x.points.map((p) => '<li>' + t(p) + '</li>').join('') + '</ul>'
      + '<p class="note">' + t(x.note) + '</p></article>';
    const faq = S.faq.slice();
    if (C.organiser.name) faq.push({ q: S.organiserQ, a: C.organiser.name + (C.organiser.place ? ', ' + C.organiser.place : '') + '.' + (C.contact.email ? ' Write to ' + C.contact.email + '.' : '') });
    const share = C.links.gofundme ? '<section class="sec" id="share"><div class="wrap narrow"><h2 class="h-sm">' + t(S.shareTitle) + '</h2>'
      + '<div class="share"><input type="text" id="shareUrl" readonly value="' + esc(C.links.gofundme) + '" aria-label="' + t(S.shareTitle) + '" />'
      + '<button type="button" class="btn" id="copyBtn" data-done="' + t(S.copied) + '" data-fallback="' + t(S.copyFallback) + '">' + t(S.copy) + '</button></div>'
      + '<p class="msg" id="copyMsg" role="status"></p></div></section>' : '';
    return '<section class="hero hero--support" id="top"><div class="wrap s-hero"><div>'
      + '<p class="eyebrow"><span class="dot"></span>' + t(S.heroEyebrow) + '</p><h1>' + t(S.heroTitle) + '</h1>'
      + '<p class="lede">' + t(S.heroLede) + '</p></div>'
      + '<aside class="goal" aria-labelledby="goalLab"><p class="g-lab" id="goalLab">' + t(S.goalLabel) + '</p>'
      + '<p class="g-fig">' + usd(N.G1) + '</p><p class="g-body">' + t(S.goalBody) + '</p>'
      + '<p class="g-full"><span>' + t(S.fullGoalLabel) + '</span> <b>' + usd(N.PH0) + '</b> · ' + t(S.fullGoalBody) + '</p>'
      + donateButton('g-btn')
      + '<p class="g-note">' + (C.links.gofundme ? t(S.donateNote) : t(S.soonNote).replace('the project page', '<a class="xpage" href="' + esc(LINKS.project) + '#involved">the project page</a>')) + '</p>'
      + '</aside></div></section>'
      + '<section class="sec" id="why"><div class="wrap">' + head(S.whyEyebrow, S.whyTitle, S.whyBody) + confidence() + '</div></section>'
      + '<section class="sec" id="goals"><div class="wrap">' + head(S.tiersEyebrow, S.tiersTitle)
      + '<div class="tiers">' + S.tiers.map(tier).join('') + '</div>' + split() + '</div></section>'
      + '<section class="sec" id="questions"><div class="wrap narrow">' + head(S.faqEyebrow, S.faqTitle)
      + '<div class="faq">' + faq.map((x) => '<details class="qa"><summary>' + t(x.q) + '</summary><p>'
        + t(x.a).replace('The project page', '<a class="xpage" href="' + esc(LINKS.project) + '#involved">The project page</a>') + '</p></details>').join('') + '</div>'
      + '<div class="cta">' + donateButton() + inner(LINKS.project, 'Read the whole plan') + '</div></div></section>'
      + share;
  }

  /* ---------- shared chrome ---------- */

  function nav(page) {
    const here = page === 'project';
    /* the last link stays when the bar narrows; on the support page, before
       there is a campaign, the way to the plan is the bar's button instead */
    const links = here
      ? [['#documents', C.foot.documents], ['#roadmap', C.foot.roadmap], ['#involved', C.foot.involved]]
      : [['#why', 'Why'], ['#goals', 'Goals'], ['#questions', 'Questions']].concat(C.links.gofundme ? [[LINKS.project, C.foot.project]] : []);
    return links.map(([h, l], i) => '<a href="' + esc(h) + '"' + (h.charAt(0) === '#' ? '' : ' class="xpage"') + (i < links.length - 1 ? ' data-opt' : '') + '>' + esc(l) + '</a>').join('')
      + '<a href="' + esc(LINKS.world) + '" class="xpage" data-opt>' + esc(C.foot.world) + '</a>';
  }
  /* The bar has room for one short button. On the support page it is the
     donate link once there is a campaign, and the way back to the plan before. */
  function navCta(page) {
    if (page === 'project') return '<a class="btn btn--solid btn--sm xpage" href="' + esc(LINKS.support) + '">' + esc(C.foot.support) + '</a>';
    return C.links.gofundme
      ? '<a class="btn btn--solid btn--sm donate" href="' + esc(C.links.gofundme) + '" target="_blank" rel="noopener">' + t(S.donateShort) + ' <span aria-hidden="true">↗</span></a>'
      : '<a class="btn btn--sm xpage" href="' + esc(LINKS.project) + '">' + esc(C.foot.project) + '</a>';
  }

  function footer(page) {
    const proj = page === 'project' ? '' : LINKS.project;
    const li = (h, l, x) => '<li><a href="' + esc(h) + '"' + (x ? ' class="xpage"' : '') + '>' + esc(l) + '</a></li>';
    const eds = DIRECTORY.map((d) => '<a class="' + d.kind + ' xpage" href="' + esc(LINKS.editions + d.id + '/index.html') + '"' + (d.lang === 'en' ? '' : ' hreflang="' + d.lang + '"') + '>'
      + esc(d.name) + (d.lang === 'en' ? '' : ' <span class="ed-lang">עברית</span>') + '</a>').join('');
    return '<footer><div class="wrap"><div class="foot-grid"><div><div class="foot-brand">Mind the Gap</div><p>' + esc(C.foot.tagline) + '</p></div>'
      + '<div><h4>' + esc(C.foot.project) + '</h4><ul>' + li(proj + '#documents', C.foot.documents, !!proj) + li(proj + '#roadmap', C.foot.roadmap, !!proj)
      + li(proj + '#involved', C.foot.involved, !!proj) + (page === 'support' ? '' : li(LINKS.support, C.foot.support, true)) + '</ul></div>'
      + '<div><h4>' + esc(C.foot.index) + '</h4><ul>' + li(LINKS.world, C.foot.world, true) + li(LINKS.intro, C.foot.how, true) + '</ul></div></div>'
      + '<nav class="foot-editions" aria-label="' + esc(C.foot.editions) + '"><h4>' + esc(C.foot.editions) + '</h4>' + eds + '</nav>'
      + '<div class="colophon"><span>' + esc(C.foot.colophon) + '</span><span>' + esc(C.asOf) + '</span></div></div></footer>';
  }

  return { project, support, nav, navCta, footer };
};
