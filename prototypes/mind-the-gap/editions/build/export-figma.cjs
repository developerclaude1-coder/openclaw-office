/* Export Figma-importable assets from the built editions.
 *
 * 1. tokens.json  — W3C-style design tokens parsed straight out of the
 *    stylesheet, so the Figma variables and the shipped CSS cannot drift.
 * 2. atlas-<edition>.svg — the map as editable vector paths, which Figma
 *    imports as real layers (unlike a screenshot).
 */
const fs = require('fs');
const path = require('path');
const HERE = __dirname;
const OUT = path.join(HERE, '..', '..', 'figma');
fs.mkdirSync(OUT, { recursive: true });

const TPL = fs.readFileSync(path.join(HERE, 'edition.css'), 'utf8');

/* ---------- 1. tokens ---------- */
function block(selector) {
  // grab the declarations of a given :root rule
  const i = TPL.indexOf(selector);
  if (i < 0) throw new Error('missing selector ' + selector);
  const open = TPL.indexOf('{', i);
  const close = TPL.indexOf('}', open);
  const out = {};
  for (const line of TPL.slice(open + 1, close).split(';')) {
    const m = line.match(/--([a-z0-9-]+)\s*:\s*([^;]+)/i);
    if (m) out[m[1].trim()] = m[2].trim();
  }
  return out;
}
const base = block(':root{');
const light = block(':root[data-theme="light"]');
const dark = block(':root[data-theme="dark"]');

const COLOR_KEYS = ['paper','surface','surface-2','ink','muted','faint','line','line-strong',
  'signal','signal-soft','cool','cool-soft','violet','violet-soft','ocean','land'];
const MOTION_KEYS = ['dur-micro','dur-base','dur-slow','dur-marquee','ease-out','ease-in-out','ease-spring','stagger'];

const colorTokens = {};
for (const k of COLOR_KEYS) {
  colorTokens[k] = {
    $type: 'color',
    $value: { light: light[k] || base[k], dark: dark[k] || base[k] },
    $description: 'Mode-aware. Create as a Figma variable with Light and Dark modes.',
  };
}
const motionTokens = {};
for (const k of MOTION_KEYS) {
  motionTokens[k] = {
    $type: k.startsWith('ease') ? 'cubicBezier' : 'duration',
    $value: base[k],
  };
}

const tokens = {
  $description:
    'Mind the Gap — design tokens, parsed directly from editions/build/edition.css. ' +
    'Regenerate with `node export-figma.cjs`; do not hand-edit.',
  color: colorTokens,
  motion: motionTokens,
  typography: {
    display: { $type: 'fontFamily', $value: { latin: 'Canela', hebrew: 'Frank Ruhl Libre' },
      $description: 'Serif. The art, the human voice. HTML falls back to a system serif stack.' },
    body: { $type: 'fontFamily', $value: { latin: "Suisse Int'l", hebrew: 'Heebo' },
      $description: 'Sans. The connective tissue between the two sides.' },
    index: { $type: 'fontFamily', $value: { latin: 'system monospace', hebrew: 'system monospace' },
      $description: 'Mono. The industry and the index.' },
    scale: {
      wordmark: { $value: 'clamp(3.2rem, 9.5vw, 7.4rem)', $description: 'weight 800, tracking -0.045em' },
      h2: { $value: 'clamp(1.9rem, 4vw, 3rem)', $description: 'serif 600' },
      lede: { $value: 'clamp(1.02rem, 1.4vw, 1.2rem)', $description: 'max 60ch' },
      body: { $value: '16px / 1.6' },
      meta: { $value: '0.64rem', $description: 'mono, uppercase, tracking 0.12em' },
    },
  },
  layout: {
    maxWidth: { $type: 'dimension', $value: '1240px' },
    gutter: { $type: 'dimension', $value: 'clamp(20px, 5vw, 72px)' },
    radius: { $type: 'dimension', $value: '12px' },
  },
};
fs.writeFileSync(path.join(OUT, 'tokens.json'), JSON.stringify(tokens, null, 2));

/* ---------- 2. atlas as editable SVG ---------- */
function decode(enc) {
  const bar = enc.indexOf('|');
  const prec = bar > 0 ? parseInt(enc.slice(0, bar), 10) : 10;
  const body = bar > 0 ? enc.slice(bar + 1) : enc;
  return body.split(';').map((r) => {
    let px = 0, py = 0;
    return r.split(' ').map((p) => {
      const a = p.split(',');
      px += parseInt(a[0], 36); py += parseInt(a[1], 36);
      return [px / prec, py / prec];
    });
  });
}
const COLORS = { Museum: '#A35E09', Gallery: '#2A6076', Biennial: '#6D4596' };

function atlasSvg(id) {
  const L = JSON.parse(fs.readFileSync(path.join(HERE, 'locales', id + '.json'), 'utf8'));
  const rings = decode(fs.readFileSync(path.join(HERE, 'land-' + id + '.txt'), 'utf8').trim());
  const W = 1240, H = 620;
  const v = L.mapView;
  const mw = W * v.zoom, mh = (W / 2) * v.zoom;
  const cx = (v.lon + 180) / 360, cy = (90 - v.lat) / 180;
  const proj = (lon, lat) => [
    ((lon + 180) / 360 - cx) * mw + W / 2,
    ((90 - lat) / 180 - cy) * mh + H / 2,
  ];
  const inView = (x, y) => x > -2000 && x < W + 2000 && y > -2000 && y < H + 2000;

  const paths = rings.map((r) => {
    let d = '', any = false;
    r.forEach((p, i) => {
      const [x, y] = proj(p[0], p[1]);
      if (inView(x, y)) any = true;
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    });
    return any ? `<path d="${d}Z"/>` : '';
  }).filter(Boolean).join('\n      ');

  const pts = L.places.map((p) => {
    const [x, y] = proj(p.lon, p.lat);
    if (x < -40 || x > W + 40 || y < -40 || y > H + 40) return '';
    const c = COLORS[p.type] || COLORS.Museum;
    const safe = String(p.name).replace(/[&<>"]/g, (ch) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
    return `<g id="${safe}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="${c}"/></g>`;
  }).filter(Boolean).join('\n      ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#E6E2DA"/>
  <g id="land" fill="#FCFBF8" stroke="rgba(18,18,16,0.24)" stroke-width="0.9">
      ${paths}
  </g>
  <g id="institutions">
      ${pts}
  </g>
</svg>`;
  fs.writeFileSync(path.join(OUT, 'atlas-' + id + '.svg'), svg);
  return { id, rings: rings.length, plotted: (pts.match(/<g id=/g) || []).length, kb: (svg.length / 1024).toFixed(0) };
}

const stats = ['il', 'us'].map(atlasSvg);
console.log('tokens.json:', Object.keys(colorTokens).length, 'colors,',
  Object.keys(motionTokens).length, 'motion tokens');
stats.forEach((s) => console.log(`atlas-${s.id}.svg: ${s.rings} land rings, ${s.plotted} institutions, ${s.kb}KB`));
console.log('written to', path.relative(path.join(HERE, '..', '..'), OUT));
