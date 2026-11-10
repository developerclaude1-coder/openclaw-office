/* Browser checks for the intro and the pages it leads to.
 *
 *   node check.cjs                    every part
 *   node check.cjs story atlas        only the parts named: data, story, atlas, play, nojs, pages
 *   node check.cjs --shots=DIR        also save a screenshot of each scene
 *   node check.cjs story --size=390x844 --lang=he     narrow the story part to one size or language
 *
 * Needs Playwright and a Chromium it can launch. Neither is a dependency of
 * this repo: point PLAYWRIGHT_PATH at an installed copy, and CHROMIUM_PATH at
 * a browser binary, if `require('playwright')` does not resolve from here.
 *
 * These are layout and behaviour checks, not snapshots. They ask the questions
 * a careful look would: is anything clipped, does anything sit on something
 * else, does every control do what its label says.
 */
const fs = require('fs');
const path = require('path');
const HERE = __dirname;
const ROOT = path.join(HERE, '..');
const INTRO = 'file://' + (process.env.MTG_INTRO || path.join(HERE, 'index.html'));   // MTG_INTRO: check another build

let chromium;
try { ({ chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright')); }
catch (e) { console.error('Playwright not found. Set PLAYWRIGHT_PATH to an installed copy.'); process.exit(2); }

const argv = process.argv.slice(2);
const PARTS = argv.filter((a) => !a.startsWith('--'));
const flag = (k) => (argv.find((a) => a.startsWith('--' + k + '=')) || '').slice(k.length + 3);
const SHOTS = flag('shots'), ONLY_SIZE = flag('size'), ONLY_LANG = flag('lang');
const want = (p) => !PARTS.length || PARTS.includes(p);
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let failed = 0, passed = 0;
function ok(cond, msg) { if (cond) passed++; else { failed++; console.log('  FAIL ' + msg); } }
const wait = (p, ms) => p.waitForTimeout(ms);

async function open(browser, o) {
  const mobile = o.w < 700;
  const ctx = await browser.newContext({
    viewport: { width: o.w, height: o.h }, isMobile: mobile, hasTouch: mobile,
    reducedMotion: o.reduce ? 'reduce' : 'no-preference', javaScriptEnabled: o.js !== false,
    colorScheme: o.scheme || 'dark',
  });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') page.errors.push(m.text()); });
  await page.goto(o.url || INTRO);
  await wait(page, 1100);
  if (o.lang && o.lang !== 'en') { await page.evaluate((l) => window.__mtg.lang(l, false), o.lang); await wait(page, 200); }
  return { ctx, page, mobile };
}

/* ---------- story: every scene, at every size, in both languages ---------- */
const SIZES = [[1440, 900], [1920, 1080], [1280, 720], [1366, 600], [1024, 768], [844, 390], [768, 1024], [390, 844], [375, 667]];

/* Runs in the page. Returns what a visitor would see wrong in scene i. */
function inspectScene(i) {
  const R = (el) => { const r = el.getBoundingClientRect(); return { x0: r.left, y0: r.top, x1: r.right, y1: r.bottom, w: r.width }; };
  const hit = (a, b) => !(a.x1 <= b.x0 || a.x0 >= b.x1 || a.y1 <= b.y0 || a.y0 >= b.y1);
  const shown = (el) => getComputedStyle(el).display !== 'none';
  const name = (el) => el.id || String(el.className) || el.tagName;
  const out = [], W = innerWidth, H = innerHeight;
  if (document.documentElement.scrollWidth > W) out.push('page scrolls sideways');

  const ch = document.querySelector('.ch[data-ch="' + i + '"]');
  const parts = [...ch.querySelectorAll('.eyebrow,h1,h2,.body,.tomb,.sub,.exhibit,.enter,.play')].filter(shown);
  const rail = document.getElementById('rail');
  const railMarks = shown(rail) ? [...rail.querySelectorAll('button')].map((b) => {
    const label = b.querySelector('span');
    return R(+getComputedStyle(label).opacity > 0.5 ? b : b.querySelector('i'));
  }) : [];
  for (const el of parts) {
    const r = R(el); if (!r.w) continue;
    if (r.x0 < -0.5 || r.x1 > W + 0.5) out.push(name(el) + ' is cut off at the side');
    if (r.y1 > H + 0.5) out.push(name(el) + ' runs off the bottom by ' + Math.round(r.y1 - H));
    if (r.y0 < 55 && i !== 0) out.push(name(el) + ' is under the top bar');
    if (railMarks.some((m) => hit(r, m))) out.push(name(el) + ' collides with the chapter rail');
  }
  for (let a = 0; a < parts.length; a++) for (let b = a + 1; b < parts.length; b++) {
    if (parts[a].contains(parts[b]) || parts[b].contains(parts[a])) continue;
    if (hit(R(parts[a]), R(parts[b]))) out.push(name(parts[a]) + ' overlaps ' + name(parts[b]));
  }
  /* a control's text must stay inside its outline, and what is marked hidden must be */
  for (const el of document.querySelectorAll('button,a.door,.chip,.tag,.badge,.hud')) {
    if (!shown(el) || el.closest('[hidden]') || !el.getClientRects().length) continue;
    if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) out.push('text spills out of ' + name(el));
  }
  for (const el of document.querySelectorAll('[hidden]')) if (shown(el)) out.push(name(el) + ' is marked hidden but showing');

  /* names set on the map itself: none may leave the stage or sit on another */
  const names = [...document.querySelectorAll('.cvl')].filter((el) => +getComputedStyle(el).opacity > 0.5);
  for (let a = 0; a < names.length; a++) {
    const r = R(names[a]);
    if (r.x0 < -0.5 || r.x1 > W + 0.5) out.push('the map label "' + names[a].textContent + '" leaves the stage');
    for (let b = a + 1; b < names.length; b++) if (hit(r, R(names[b]))) out.push('map labels "' + names[a].textContent + '" and "' + names[b].textContent + '" overlap');
  }
  if (i === 3 && names.length !== 8) out.push('scene 3 should name six regions and two countries, and names ' + names.length);

  if (i === 7) {                                    // the headline and the stats must stay clear of the ring
    const g = window.__mtg.geo().ring, head = R(document.querySelector('.enter-head'));
    const stats = document.querySelector('.ch--enter .tomb');
    const cy = g.y + document.getElementById('stage').getBoundingClientRect().top;   // stage → screen
    if (head.y1 > cy - g.out) out.push('the arrival headline reaches into the ring');
    if (shown(stats) && R(stats).y0 < cy + g.out) out.push('the arrival stats reach into the ring');
  }
  return out;
}

async function story(browser) {
  console.log('story — 8 scenes × ' + SIZES.length + ' sizes × 2 languages, plus reduced motion');
  let runs = [];
  for (const [w, h] of SIZES) for (const lang of ['en', 'he']) runs.push({ w, h, lang });
  runs.push({ w: 1440, h: 900, lang: 'en', reduce: true }, { w: 390, h: 844, lang: 'he', reduce: true });
  runs = runs.filter((o) => (!ONLY_SIZE || ONLY_SIZE === o.w + 'x' + o.h) && (!ONLY_LANG || ONLY_LANG === o.lang));
  for (const o of runs) {
    const { ctx, page } = await open(browser, o);
    const tag = o.w + '×' + o.h + ' ' + o.lang + (o.reduce ? ' reduced-motion' : '');
    ok(await page.evaluate(() => document.documentElement.dir) === (o.lang === 'he' ? 'rtl' : 'ltr'), tag + ': direction follows the language');
    for (let i = 0; i < 8; i++) {
      const t = i === 0 ? 0 : i === 7 ? 1 : i === 6 ? 0.5 : 0.72;   // settled, exhibit played
      await page.evaluate(([i, t]) => window.__mtg.scene(i, t), [i, t]);
      await wait(page, 500);
      const problems = await page.evaluate(inspectScene, i);
      ok(problems.length === 0, tag + ' scene ' + i + ': ' + problems.join('; '));
      if (SHOTS && !o.reduce) await page.screenshot({ path: path.join(SHOTS, `story-${o.w}x${o.h}-${o.lang}-s${i}.png`) });
    }
    ok(page.errors.length === 0, tag + ': script errors: ' + page.errors.slice(0, 2).join(' | '));
    await ctx.close();
  }
}

/* ---------- atlas: the way in, and everything the live map does ---------- */
async function atlas(browser) {
  console.log('atlas — the Enter transition and the live map');
  for (const o of [{ w: 1440, h: 900, lang: 'en' }, { w: 1440, h: 900, lang: 'he' }, { w: 390, h: 844, lang: 'en' }, { w: 844, h: 390, lang: 'en' }, { w: 1440, h: 900, lang: 'en', reduce: true }]) {
    const { ctx, page, mobile } = await open(browser, o);
    const tag = o.w + '×' + o.h + ' ' + o.lang + (o.reduce ? ' reduced-motion' : '') + ': ';
    const st = () => page.evaluate(() => {
      const m = window.__mtg, tip = document.getElementById('tip');
      return {
        mode: m.S.mode, tone: m.S.tone, zoom: +(m.cam.s / m.AT.fit).toFixed(2), lon0: m.cam.lon0, scrollY: Math.round(scrollY),
        on: document.getElementById('app').classList.contains('on'), hud: document.querySelector('.hud').textContent.replace(/\s+/g, ' '),
        tip: +getComputedStyle(tip).opacity > 0.5 ? tip.querySelector('.t').textContent : null,
        canPan: (innerWidth / 2) / m.cam.s < 180, wide: document.documentElement.scrollWidth > innerWidth,
      };
    });

    await page.evaluate(() => window.__mtg.scene(7, 1)); await wait(page, 700);
    await page.click('#enterBtn'); await wait(page, 2900);
    let s = await st();
    ok(s.mode === 'app' && s.on && s.tone === 1, tag + 'Enter arrives in the atlas, in the day tone');
    ok(!s.wide && s.scrollY === 0, tag + 'the atlas does not scroll');
    const total = await page.evaluate(() => window.__mtg.places.length);
    ok(s.hud.includes(' ' + total + ' ') || mobile, tag + 'the readout counts every institution (' + s.hud + ')');
    ok((await page.$$eval('[hidden]', (els) => els.filter((e) => getComputedStyle(e).display !== 'none').length)) === 0, tag + 'nothing hidden is showing');

    const clash = await page.evaluate(() => {
      const box = (els) => { els = els.filter((e) => getComputedStyle(e).display !== 'none'); if (!els.length) return null; const r = els.map((e) => e.getBoundingClientRect()); return { x0: Math.min(...r.map((q) => q.left)), y0: Math.min(...r.map((q) => q.top)), x1: Math.max(...r.map((q) => q.right)), y1: Math.max(...r.map((q) => q.bottom)) }; };
      const one = (sel) => { const b = box([...document.querySelectorAll(sel)]); if (b) b.n = sel; return b; };
      const doors = one('.door'), shelf = document.querySelector('.doors').getBoundingClientRect();
      if (doors) { doors.x0 = Math.max(shelf.left, doors.x0); doors.x1 = Math.min(shelf.right, doors.x1); }   // the shelf scrolls
      const parts = ['.bar-tools', '.mark', '.search', '.chips', '.app-foot', '.zoom'].map(one).concat([doors]).filter(Boolean), out = [];
      for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
        const a = parts[i], b = parts[j];
        if (!(a.x1 <= b.x0 + 0.5 || a.x0 >= b.x1 - 0.5 || a.y1 <= b.y0 + 0.5 || a.y0 >= b.y1 - 0.5)) out.push(a.n + ' on ' + b.n);
      }
      return out;
    });
    ok(clash.length === 0, tag + 'interface parts collide: ' + clash.join(', '));
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `atlas-${o.w}x${o.h}-${o.lang}.png`) });

    await page.fill('#q', 'tate'); await wait(page, 150);
    const first = await page.$eval('#qr', (e) => (e.querySelector('button[data-i]') || e).textContent);
    ok(/^Tate/.test(first), tag + 'search ranks a name above a country ("tate" → ' + first.slice(0, 24) + ')');
    await page.keyboard.press('Enter'); await wait(page, 1300);
    s = await st();
    ok(s.zoom > 10 && /tate/i.test(s.tip || ''), tag + 'choosing a result flies there and names it (' + s.zoom + '×, ' + s.tip + ')');
    await page.fill('#q', 'zzzz'); await wait(page, 120);
    ok(await page.$eval('#qr', (e) => e.textContent.length > 0 && !e.querySelector('button[data-i]')), tag + 'search says so when nothing matches');
    await page.keyboard.press('Escape'); await page.fill('#q', '');

    await page.click('#zr'); await wait(page, 1100);
    s = await st(); ok(Math.abs(s.zoom - 1) < 0.01 && s.tip === null, tag + 'reset returns to the whole view');
    await page.click('#zi'); await wait(page, 1050);
    ok(Math.abs((await st()).zoom - 1.8) < 0.05, tag + 'zoom in steps to 1.8×');
    if (!mobile) {
      const before = await st();
      await page.mouse.move(o.w / 2, o.h * 0.55); await page.mouse.down(); await page.mouse.move(o.w / 2 - 160, o.h * 0.55 + 30, { steps: 6 }); await page.mouse.up();
      await wait(page, 120); s = await st();
      /* a window much wider than the map already shows the whole world: nowhere to pan until you zoom */
      ok(before.canPan ? s.lon0 > before.lon0 + 5 : s.lon0 === before.lon0, tag + 'dragging pans the map when there is somewhere to go');
      await page.mouse.move(o.w / 2, o.h / 2); await page.mouse.wheel(0, -600); await wait(page, 200);
      const z = await st(); ok(z.zoom > s.zoom * 1.5 && z.scrollY === 0, tag + 'the wheel zooms the map, not the page');
    }
    await page.click('#zr'); await wait(page, 1100);

    await page.click('.chip[data-v="Gallery"]'); await wait(page, 150);
    const galleries = await page.evaluate(() => window.__mtg.places.filter((p) => p.t === 'Gallery').length);
    s = await st();
    ok(galleries > 0 && galleries < total && (s.hud.includes(' ' + galleries + ' ') || mobile) && await page.evaluate(() => window.__mtg.AT.filter === 'Gallery'), tag + 'the gallery filter is applied (' + s.hud + ')');
    await page.click('.chip[data-v="all"]');

    const pt = await page.evaluate(() => {
      const m = window.__mtg, pl = m.places.find((x) => /zeitz/i.test(x.n)), r = document.getElementById('cv').getBoundingClientRect();
      return { x: r.left + m.cam.sx + (pl.lon - m.cam.lon0) * m.cam.s, y: r.top + m.cam.sy - (pl.lat - m.cam.lat0) * m.cam.s };
    });
    if (mobile) await page.touchscreen.tap(pt.x, pt.y); else await page.mouse.move(pt.x, pt.y);
    await wait(page, 250);
    ok(/zeitz/i.test((await st()).tip || ''), tag + 'pointing at an institution names it');
    if (!mobile) await page.mouse.move(30, o.h * 0.6);

    await page.click('#aboutBtn'); await wait(page, 120);
    ok(await page.$eval('#about', (e) => !e.hidden && e.textContent.length > 80), tag + 'the data note opens');
    await page.click('#aboutBtn');

    const doors = await page.$$eval('.door', (els) => els.map((e) => {
      const r = e.getBoundingClientRect();
      return { href: e.getAttribute('href'), cls: e.className, col: e.style.getPropertyValue('--col'), x: Math.round(r.left), y: Math.round(r.top), frame: e.getAttribute('data-frame'), lang: e.getAttribute('hreflang') };
    }));
    ok(doors.length === 9 && doors.every((d) => fs.existsSync(path.resolve(HERE, d.href.split('#')[0]))), tag + 'all nine doors lead somewhere');
    const regions = doors.filter((d) => /door--region/.test(d.cls)), countries = doors.filter((d) => /door--country/.test(d.cls));
    ok(regions.length === 6 && countries.length === 2 && /door--world/.test(doors[0].cls), tag + 'there is a door for the world, for each of six regions and for each country edition');
    ok(doors.filter((d) => d.lang === 'he').length === 1, tag + 'the one door that opens onto Hebrew says so');
    if (o.w > 1100) {
      /* on the wide shelf a country hangs directly under the region it belongs to */
      const { COUNTRY_EDITIONS } = require('../shared/regions.cjs');
      const under = COUNTRY_EDITIONS.every((c) => {
        const own = doors.find((d) => d.href.includes('/' + c.id + '/')), parent = doors.find((d) => d.href.includes('/' + c.region + '/'));
        return own && parent && /door--country/.test(own.cls) && own.x === parent.x && own.y > parent.y;
      });
      ok(under, tag + 'each country edition hangs under the region it belongs to');
      await page.hover('.door--region >> nth=2'); await wait(page, 150);
      const framed = await page.evaluate(() => String(window.__mtg.AT.frame));
      ok(framed === regions[2].frame, tag + 'pointing at a region door frames that region on the map (' + framed + ')');
      await page.mouse.move(o.w / 2, o.h * 0.4); await wait(page, 150);
      ok(await page.evaluate(() => window.__mtg.AT.frame === null), tag + 'and the frame goes when the pointer leaves');
    }

    const other = o.lang === 'he' ? 'en' : 'he';
    await page.click('.lang button[data-lang="' + other + '"]'); await wait(page, 250);
    ok(await page.evaluate(() => document.documentElement.dir) === (other === 'he' ? 'rtl' : 'ltr'), tag + 'the language switches in place');

    await page.click('#replayBtn'); await wait(page, 500);
    s = await st(); ok(s.mode === 'story' && !s.on && s.scrollY === 0, tag + 'replay returns to the first scene');
    await page.click('#skipBtn'); await wait(page, 2900);
    ok((await st()).mode === 'app', tag + 'skip goes straight in');
    ok(page.errors.length === 0, tag + 'script errors: ' + page.errors.slice(0, 2).join(' | '));
    await ctx.close();
  }
  const { ctx, page } = await open(browser, { w: 1440, h: 900, url: INTRO + '#enter' });
  ok(await page.evaluate(() => window.__mtg.S.ci === 7), '#enter opens on the arrival scene');
  await ctx.close();
}

/* ---------- play: the piece runs itself, and gives way when asked ---------- */
async function play(browser) {
  console.log('play — watching it as a film');
  for (const o of [{ w: 1440, h: 900 }, { w: 390, h: 844 }, { w: 360, h: 740 }]) {
    const { ctx, page, mobile } = await open(browser, o);
    const tag = o.w + '×' + o.h + ': ';
    const st = () => page.evaluate(() => ({ raw: window.__mtg.S.pRaw, ci: window.__mtg.S.ci, playing: !!window.__mtg.playing(), mode: window.__mtg.S.mode, pressed: document.getElementById('barPlay').getAttribute('aria-pressed') }));
    await wait(page, 1300);
    let s = await st(); ok(!s.playing && s.raw === 0, tag + 'nothing moves until asked');
    const bar = await page.evaluate(() => { const m = document.getElementById('mark').getBoundingClientRect(), t = document.querySelector('.bar-tools').getBoundingClientRect(); return t.left - m.right >= 8 && t.right <= innerWidth; });
    ok(bar, tag + 'the top bar fits');
    await page.click('#playBtn'); await wait(page, 2000);
    s = await st(); ok(s.playing && s.pressed === 'true' && s.raw > 0.018 && s.raw < 0.034, tag + 'play starts, at reading pace (' + s.raw.toFixed(3) + ' after 2s)');
    await page.click('#barPlay'); const a = await st(); await wait(page, 500); const b = await st();
    ok(!b.playing && Math.abs(b.raw - a.raw) < 0.002, tag + 'pause holds still');
    await page.click('#barPlay'); await wait(page, 400);
    ok((await st()).playing, tag + 'play resumes');
    if (mobile) await page.evaluate(() => window.dispatchEvent(new Event('touchmove'))); else { await page.mouse.move(o.w / 2, o.h / 2); await page.mouse.wheel(0, 300); }
    await wait(page, 300);
    ok(!(await st()).playing, tag + 'your own scroll takes over');
    await page.evaluate(() => { window.__mtg.goto(0.985); window.__mtg.play(true); }); await wait(page, 2600);
    s = await st(); ok(!s.playing && s.ci === 7 && s.raw > 0.999, tag + 'the film ends on the Enter scene and stops');
    await page.click('#barPlay'); await wait(page, 700);
    s = await st(); ok(s.playing && s.raw < 0.05, tag + 'play at the end starts over');
    await page.click('#skipBtn'); await wait(page, 2900);
    s = await st(); ok(s.mode === 'app' && !s.playing, tag + 'skip while playing enters, with playback off');
    const tools = await page.$$eval('.bar-tools > *', (els) => els.filter((e) => getComputedStyle(e).display !== 'none').map((e) => e.id));
    ok(tools.join() === 'langGroup,replayBtn', tag + 'inside the atlas the bar offers language and replay only (' + tools.join() + ')');
    ok(page.errors.length === 0, tag + 'script errors: ' + page.errors.slice(0, 2).join(' | '));
    await ctx.close();
  }
}

/* ---------- nojs: with scripting off it is still a whole page ---------- */
async function nojs(browser) {
  console.log('nojs — the page without scripting');
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const { ctx, page } = await open(browser, { w, h, js: false });
    const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    const titles = ['Two sides', 'First, we map', 'bound to place', 'not bound by borders', 'index is the bridge', 'Curation is resolution', 'Enter the world'];
    ok(titles.every((t) => text.includes(t)), w + '×' + h + ': every chapter is readable');
    const doorNames = await page.$$eval('.door', (els) => els.filter((e) => e.getClientRects().length).map((e) => e.querySelector('b').textContent));
    ok(doorNames.length === 9 && ['World index', 'Europe', 'Middle East', 'Israel'].every((n) => doorNames.includes(n)), w + '×' + h + ': every door is still offered (' + doorNames.length + ')');
    ok(!/Skip intro|scroll to descend|Play the intro/i.test(text), w + '×' + h + ': no controls that need scripting are shown');
    ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), w + '×' + h + ': no sideways scroll');
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `nojs-${w}.png`), fullPage: true });
    await ctx.close();
  }
}

/* ---------- data: the numbers agree with each other before any page is opened ---------- */
function data() {
  console.log('data — one dataset, cut by region and by country');
  const D = require('../build/dataset.cjs');
  const { REGIONS, COUNTRY_EDITIONS, regionOf } = require('../shared/regions.cjs');
  const lists = [['commissions', D.commissions], ['residencies', D.residencies], ['institutions', D.places]];
  for (const [kind, list] of lists) {
    const stray = list.filter((x) => !REGIONS.some((r) => r.name === x.region));
    ok(stray.length === 0, 'every one of the ' + kind + ' is in a region (' + stray.map((x) => x.name + ', ' + x.country).join('; ') + ')');
    ok(REGIONS.reduce((n, r) => n + list.filter((x) => x.region === r.name).length, 0) === list.length, 'the six regions add up to the world for ' + kind);
    ok(REGIONS.every((r) => list.some((x) => x.region === r.name)), 'no region is empty of ' + kind);
  }
  const frame = (name) => REGIONS.find((r) => r.name === name).bounds;
  const outside = D.places.filter((p) => { const f = frame(p.region); return p.lon < f[0] || p.lon > f[2] || p.lat < f[1] || p.lat > f[3]; });
  ok(outside.length === 0, 'every institution lies inside the frame of its region (' + outside.map((p) => p.name).join('; ') + ')');

  /* the grid the intro tints the map with must put each institution in the region it is listed under */
  const enc = fs.readFileSync(path.join(ROOT, 'shared', 'region-grid.txt'), 'utf8').trim(), step = +enc.split('|')[0], cols = 360 / step, cells = [];
  enc.split('|')[1].replace(/([a-z])(\d+)/g, (m, v, n) => { for (let i = +n; i > 0; i--) cells.push(v.charCodeAt(0) - 98); });
  ok(cells.length === cols * (180 / step), 'the region grid is whole (' + cells.length + ' cells)');
  const tinted = (p) => cells[Math.floor((90 - p.lat) / step) * cols + Math.floor((p.lon + 180) / step)];
  const mistinted = D.places.filter((p) => REGIONS[tinted(p)] === undefined || REGIONS[tinted(p)].name !== p.region);
  ok(mistinted.length === 0, 'the map lights every institution in its own region (' + mistinted.map((p) => p.name + ' → ' + (REGIONS[tinted(p)] || {}).name).join('; ') + ')');

  for (const c of COUNTRY_EDITIONS) {
    const L = require('../editions/build/locales/' + c.id + '.json'), region = REGIONS.find((r) => r.id === c.region);
    ok(regionOf(c.country) === region.name, c.name + ' is filed under ' + region.name);
    ok(L.places.every((p) => D.places.some((q) => q.name === (p.nameEn || p.name) && q.region === region.name)), 'every institution of the ' + c.name + ' edition is on the ' + region.name + ' map');
    if (c.lang !== 'en') continue;                 // a Hebrew listing cannot also be an English one
    for (const kind of ['commissions', 'residencies']) {
      const inRegion = D[kind].filter((x) => x.country === c.country).map((x) => x.name).sort().join('|');
      ok(inRegion === L[kind].map((x) => x.name).sort().join('|'), 'the ' + region.name + ' edition and the ' + c.name + ' edition list the same ' + c.name + ' ' + kind);
    }
  }
  ok([].concat(D.commissions, D.residencies).every((x) => !(x.unopened && x.confidence === 'high')), 'no listing read through a search engine alone is rated high');
}

/* ---------- pages: what the doors open onto ---------- */
const EDITIONS = ['americas', 'europe', 'africa', 'middle-east', 'asia', 'oceania', 'il', 'us'];
async function pages(browser) {
  console.log('pages — the world index and the ' + EDITIONS.length + ' editions');
  const LIGHT = /250, 248, 245|243, 244, 248|255, 255, 255/;

  /* what each door in the intro promises is behind it */
  const first = await open(browser, { w: 1440, h: 900 });
  const promised = {};
  for (const d of await first.page.$$eval('.door', (els) => els.map((e) => [e.getAttribute('href').split('#')[0], (e.querySelector('span').textContent.match(/\d+/g) || []).map(Number)]))) {
    promised[path.resolve(HERE, d[0])] = d[1];
  }
  await first.ctx.close();

  for (const [id, rel] of [['world', 'index.html']].concat(EDITIONS.map((e) => [e, 'editions/' + e + '/index.html']))) {
    const file = path.join(ROOT, rel);
    for (const [w, h] of [[1440, 900], [390, 844]]) for (const hash of ['', '#via-intro']) {
      const { ctx, page } = await open(browser, { w, h, url: 'file://' + file + hash });
      const tag = id + ' ' + w + '×' + h + (hash ? ' via the intro' : '') + ': ';
      const r = await page.evaluate(async () => {
        await document.fonts.ready;
        return {
          theme: document.documentElement.getAttribute('data-theme'), bg: getComputedStyle(document.body).backgroundColor,
          type: ['600 20px "Frank Ruhl Libre"', '400 16px "Heebo"', '400 12px "JetBrains Mono"'].every((f) => document.fonts.check(f)),
          wide: document.documentElement.scrollWidth > innerWidth,
          links: [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((x) => !/^(#|https?:|mailto:)/.test(x)))],
          listed: [document.querySelectorAll('#commGrid .card').length, document.querySelectorAll('#resGrid .card').length],
          menu: [...document.querySelectorAll('.ed-list a')].map((a) => a.getAttribute('aria-current') ? '*' : '.').join(''),
        };
      });
      if (hash) ok(r.theme === 'light' && LIGHT.test(r.bg), tag + 'arrives in the light tone');
      else {
        ok(!LIGHT.test(r.bg), tag + 'follows the system theme when opened directly');
        ok(r.type, tag + 'is set in the shared typefaces');
        ok(!r.wide, tag + 'does not scroll sideways');
        const missing = r.links.filter((l) => !fs.existsSync(path.resolve(path.dirname(file), l.split('#')[0])));
        ok(r.links.length >= 9 && missing.length === 0, tag + 'links to every other page, and they resolve (' + r.links.length + ' links, missing: ' + missing.join(', ') + ')');
        const want = promised[file];
        ok(want && want[0] === r.listed[0] && want[1] === r.listed[1], tag + 'holds what its door in the intro says: ' + r.listed.join(' and ') + ' listed, ' + (want || []).join(' and ') + ' promised');
        if (id !== 'world') {
          ok(r.menu.length === 10 && r.menu.split('*').length === 2, tag + 'its menu lists every edition and marks this one (' + r.menu + ')');
          await page.click('#edMenu summary'); await wait(page, 200);
          const box = await page.$eval('.ed-list', (e) => { const q = e.getBoundingClientRect(); return q.left >= 0 && q.right <= innerWidth && q.height > 100; });
          ok(box, tag + 'the menu opens inside the window');
          await page.keyboard.press('Escape'); await wait(page, 100);
          ok(await page.$eval('#edMenu', (e) => !e.open), tag + 'and Escape closes it');
        }
        ok(page.errors.length === 0, tag + 'script errors: ' + page.errors.slice(0, 2).join(' | '));
      }
      await ctx.close();
    }
  }

  /* the tone you are in travels with you from one edition to the next */
  for (const [hash, tone] of [['#via-intro', 'light'], ['#via-dark', 'dark']]) {
    const { ctx, page } = await open(browser, { w: 1440, h: 900, scheme: tone === 'dark' ? 'light' : 'dark', url: 'file://' + path.join(ROOT, 'editions/europe/index.html') + hash });
    await page.click('#edMenu summary'); await wait(page, 150);
    await Promise.all([page.waitForNavigation(), page.click('.ed-list a[href*="africa"]')]);
    await wait(page, 500);
    const there = await page.evaluate(() => [location.pathname.includes('/africa/'), document.documentElement.getAttribute('data-theme')]);
    ok(there[0] && there[1] === tone, 'moving from one edition to another keeps the ' + tone + ' tone (' + there[1] + ')');
    await ctx.close();
  }
}

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const t0 = Date.now();
  if (want('data')) data();
  if (want('story')) await story(browser);
  if (want('atlas')) await atlas(browser);
  if (want('play')) await play(browser);
  if (want('nojs')) await nojs(browser);
  if (want('pages')) await pages(browser);
  await browser.close();
  console.log('\n' + passed + ' passed, ' + failed + ' failed  (' + ((Date.now() - t0) / 1000).toFixed(0) + 's)');
  process.exit(failed ? 1 : 0);
})();
