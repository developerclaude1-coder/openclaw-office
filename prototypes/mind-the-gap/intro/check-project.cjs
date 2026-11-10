/* The `project` part of check.cjs: the project page and the support page.
 *
 *   node check.cjs project
 *
 * The same questions the other pages are asked (tone, type, width, links),
 * then what is particular to these two: that every figure agrees with the
 * dataset and the roadmap, that the charts are drawn to scale, and that the
 * donate button does the right thing both before and after there is a
 * campaign to send people to.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

module.exports = async function project(browser, { ok, open, wait, ROOT, SHOTS }) {
  console.log('project — the plan, the decks and the campaign');
  const C = JSON.parse(fs.readFileSync(path.join(ROOT, 'project', 'build', 'content.json'), 'utf8'));
  const D = require(path.join(ROOT, 'build', 'dataset.cjs'));
  const il = require(path.join(ROOT, 'editions', 'build', 'locales', 'il.json'));
  const { DIRECTORY } = require(path.join(ROOT, 'shared', 'regions.cjs'));
  const listings = [].concat(D.commissions, il.commissions, D.residencies, il.residencies);
  const N = { L: listings.length, P: D.places.length, K: new Set(D.places.map((p) => p.country)).size, E: DIRECTORY.length };
  const conf = ['high', 'medium', 'low'].map((k) => listings.filter((x) => x.confidence === k).length);
  const P0 = C.phase0, line = (l) => 1000 * ((l.once || 0) + (l.monthly || []).reduce((a, b) => a + b, 0) * P0.months);
  const phase0 = P0.lines.reduce((a, l) => a + line(l), 0), goal1 = P0.lines.filter((l) => l.goal === 'first').reduce((a, l) => a + line(l), 0);
  const usd = (n) => '$' + n.toLocaleString('en-US');
  const LIGHT = /250, 248, 245/;

  for (const id of ['project', 'support']) {
    const file = path.join(ROOT, id, 'index.html');
    for (const [w, h] of [[1440, 900], [390, 844]]) for (const hash of ['', '#via-intro']) {
      const { ctx, page } = await open(browser, { w, h, url: 'file://' + file + hash });
      const tag = id + ' ' + w + '×' + h + (hash ? ' via the intro' : '') + ': ';
      const r = await page.evaluate(async () => {
        await document.fonts.ready;
        const box = (e) => e.getBoundingClientRect();
        return {
          theme: document.documentElement.getAttribute('data-theme'), bg: getComputedStyle(document.body).backgroundColor,
          type: ['600 20px "Frank Ruhl Libre"', '400 16px "Heebo"', '400 12px "JetBrains Mono"'].every((f) => document.fonts.check(f)),
          wide: document.documentElement.scrollWidth > innerWidth,
          links: [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((x) => !/^(#|https?:|mailto:)/.test(x)))],
          out: [...document.querySelectorAll('a[href^="http"]')].map((a) => [a.getAttribute('href'), a.target, a.rel]),
          bar: document.getElementById('nav').offsetHeight,
          docs: [...document.querySelectorAll('.doc')].map((d) => d.querySelector('.doc-cta a, .doc-cta span').getAttribute('href')),
          tiles: [...document.querySelectorAll('.tile b')].map((b) => +b.textContent),
          segs: [...document.querySelectorAll('.segbar')].map((bar) => [...bar.children].map((s) => box(s).width)),
          blocks: [...document.querySelectorAll('.tblock')].map((b) => { const l = b.querySelector('.lbl'), lb = box(l), bb = box(b);
            return { w: bb.width, fits: l.classList.contains('none') || (lb.left >= bb.left && lb.right <= bb.right + 0.5), text: l.textContent }; }),
          work: [...document.querySelectorAll('.ph-cols li > b')].map((b) => b.textContent),
          phases: document.querySelectorAll('.phase').length,
          fig: (document.querySelector('.g-fig') || {}).textContent,
          meters: [...document.querySelectorAll('.m-fig')].map((b) => +b.textContent.replace(/[$,]/g, '')),
          donate: [...document.querySelectorAll('.donate')].map((d) => d.tagName + (d.getAttribute('aria-disabled') ? ' off' : '')),
          share: !!document.getElementById('share'),
          faq: [...document.querySelectorAll('.qa summary')].map((s) => s.textContent),
        };
      });
      if (hash) { ok(r.theme === 'light' && LIGHT.test(r.bg), tag + 'arrives in the light tone'); await ctx.close(); continue; }
      ok(!LIGHT.test(r.bg), tag + 'follows the system theme when opened directly');
      ok(r.type, tag + 'is set in the shared typefaces');
      ok(!r.wide, tag + 'does not scroll sideways');
      ok(r.bar < 80, tag + 'the top bar keeps to one line (' + r.bar + 'px)');
      const missing = r.links.filter((l) => !fs.existsSync(path.resolve(path.dirname(file), l.split('#')[0])));
      ok(r.links.length >= 11 && missing.length === 0, tag + 'its links to the rest of the site resolve (' + r.links.length + ', missing: ' + missing.join(', ') + ')');
      ok(r.out.every(([href, target, rel]) => /^https:/.test(href) && target === '_blank' && /noopener/.test(rel)), tag + 'every link out opens in a new tab, with no handle back to this page');
      /* a bar drawn to scale: each part as wide as its share, give or take the 2px gaps */
      const scaled = (widths, values) => { const tw = widths.reduce((a, b) => a + b, 0), tv = values.reduce((a, b) => a + b, 0);
        return widths.length === values.length && widths.every((x, i) => Math.abs(x / tw - values[i] / tv) < 0.015); };
      ok(r.segs.length === 1 && scaled(r.segs[0], conf), tag + 'the confidence bar is drawn to scale (' + conf.join('/') + ')');

      if (id === 'project') {
        ok(r.docs.length === 4 && r.docs[0] === C.links.roadmap && r.docs[1] === C.links.investorDeck && r.docs[2] === C.links.partnersDeck
          && r.docs[3] === '../support/index.html', tag + 'the roadmap, both decks and the campaign are all in one place');
        ok(r.tiles.join() === [N.L, N.P, N.K, N.E].join(), tag + 'the headline numbers are the dataset’s (' + r.tiles.join(', ') + ')');
        ok(r.phases === 4 && scaled(r.blocks.map((b) => b.w), C.phases.map((p) => p.months[1] - p.months[0] + 1)), tag + 'the timeline gives each phase its months');
        ok(r.blocks.every((b) => b.fits), tag + 'every phase label fits inside its block (' + r.blocks.map((b) => b.text).join(' | ') + ')');
        const names = C.built.concat(C.ground).map((x) => x.name).sort();
        ok(r.work.slice().sort().join('|') === names.join('|'), tag + 'every workstream is listed once, under the phase it starts in');
        if (w > 700) {
          /* the tooltip gives way to a scroll, so let the page settle before pointing */
          await page.locator('.tblock').nth(1).scrollIntoViewIfNeeded(); await wait(page, 300);
          await page.hover('.tblock >> nth=1'); await wait(page, 120);
          ok(await page.$eval('#tip', (t) => !t.hidden && /Pilot/.test(t.textContent)), tag + 'pointing at a phase names it');
          await page.click('.tblock >> nth=2'); await wait(page, 1000);
          const y = await page.$eval('#phase-2', (e) => e.getBoundingClientRect().top);
          ok(y >= 0 && y < 200, tag + 'and choosing it goes to that phase (' + Math.round(y) + 'px from the top)');
        }
      } else {
        ok(r.fig === usd(goal1), tag + 'the first goal is the editorial lines of Phase 0 (' + r.fig + ')');
        const total = r.meters[r.meters.length - 1];
        ok(total === phase0 && Math.abs(total - C.phases[0].costM * 1e6) <= 5000 && r.meters.slice(0, -1).reduce((a, b) => a + b, 0) === total,
          tag + 'the lines add up to Phase 0, as the roadmap costs it (' + usd(total) + ')');
        ok(C.links.gofundme || (r.donate.length >= 2 && r.donate.every((d) => d === 'SPAN off') && !r.share), tag + 'with no campaign yet, nothing pretends to take a donation');
        ok(/investment/.test(r.faq[0]) && r.faq.some((q) => /tax/.test(q)) && r.faq.some((q) => /GoFundMe take/.test(q)), tag + 'it answers the questions a donor should ask first');
        await page.click('.qa summary >> nth=0'); await wait(page, 100);
        ok(await page.$eval('.qa', (d) => d.open && /not paid back/.test(d.textContent)), tag + 'and says plainly that a donation is not an investment');
      }
      ok(page.errors.length === 0, tag + 'script errors: ' + page.errors.slice(0, 2).join(' | '));
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, id + '-' + w + '.png'), fullPage: true });
      await ctx.close();
    }
  }

  /* the support page as it will be once the campaign exists */
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mtg-campaign-'));
  const url = 'https://campaign.example/mind-the-gap';
  fs.writeFileSync(path.join(tmp, 'content.json'), JSON.stringify({ ...C, links: { ...C.links, gofundme: url } }));
  execFileSync(process.execPath, [path.join(ROOT, 'project', 'build', 'build.cjs'), '--content=' + path.join(tmp, 'content.json'), '--out=' + tmp], { stdio: 'ignore' });
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const { ctx, page } = await open(browser, { w, h, url: 'file://' + path.join(tmp, 'support', 'index.html') });
    const tag = 'support with a campaign ' + w + '×' + h + ': ';
    const r = await page.evaluate(() => ({
      donate: [...document.querySelectorAll('a.donate')].map((a) => [a.getAttribute('href'), a.target, a.rel]),
      off: document.querySelectorAll('.donate[aria-disabled]').length,
      bar: document.getElementById('nav').offsetHeight, wide: document.documentElement.scrollWidth > innerWidth,
    }));
    ok(r.donate.length === 3 && r.off === 0 && r.donate.every(([href, t, rel]) => href === url && t === '_blank' && /noopener/.test(rel)), tag + 'every donate button goes to the campaign, in a new tab');
    ok(r.bar < 80 && !r.wide, tag + 'the top bar keeps to one line and nothing scrolls sideways');
    await page.click('#copyBtn'); await wait(page, 200);
    const msg = await page.$eval('#copyMsg', (m) => m.textContent);
    ok(msg === C.support.copied || msg === C.support.copyFallback, tag + 'copying the link says what happened (' + msg + ')');
    ok(page.errors.length === 0, tag + 'script errors: ' + page.errors.slice(0, 2).join(' | '));
    await ctx.close();
  }
  fs.rmSync(tmp, { recursive: true, force: true });
};
