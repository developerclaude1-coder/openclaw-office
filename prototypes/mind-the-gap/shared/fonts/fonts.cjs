/* Shared type for every Mind the Gap page.
 *
 * Emits @font-face rules with the font files inlined as data URIs, so a built
 * page carries its own type: no webfont request, no flash of fallback, and the
 * same faces whether it is opened from disk, from a PR preview or as a
 * published artifact.
 *
 *   const { fontFaceCss } = require('../shared/fonts/fonts.cjs');
 *   fontFaceCss({ latin: true, hebrew: true })   // -> CSS string
 *
 * Frank Ruhl Libre is the serif for both scripts on purpose. It is the
 * canonical Hebrew book face and ships its own Latin, so switching language
 * never switches family.
 */
const fs = require('fs');
const path = require('path');

const HEBREW = 'U+0307-0308,U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F';
const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,' +
  'U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';

const FACES = [
  { family: 'Frank Ruhl Libre', file: 'frank-ruhl-libre-latin.woff2', weight: '300 900', range: LATIN, script: 'latin', variable: true },
  { family: 'Frank Ruhl Libre', file: 'frank-ruhl-libre-hebrew.woff2', weight: '300 900', range: HEBREW, script: 'hebrew', variable: true },
  { family: 'Heebo', file: 'heebo-latin.woff2', weight: '100 900', range: LATIN, script: 'latin', variable: true },
  { family: 'Heebo', file: 'heebo-hebrew.woff2', weight: '100 900', range: HEBREW, script: 'hebrew', variable: true },
  { family: 'JetBrains Mono', file: 'jetbrains-mono-latin-400.woff2', weight: '400', range: LATIN, script: 'latin', variable: false },
];

function fontFaceCss(opts) {
  const want = Object.assign({ latin: true, hebrew: true }, opts || {});
  return FACES.filter((f) => want[f.script]).map((f) => {
    const b64 = fs.readFileSync(path.join(__dirname, f.file)).toString('base64');
    /* No format() hint: the data URI already carries font/woff2, and a hint a
       browser does not recognise makes it skip the source. Embedding once keeps
       the page from carrying every variable font twice. */
    return '@font-face{font-family:"' + f.family + '";font-style:normal;font-display:swap;' +
      'font-weight:' + f.weight + ';src:url(data:font/woff2;base64,' + b64 + ');' +
      'unicode-range:' + f.range + '}';
  }).join('\n');
}

/* Stacks, in one place, so every page names the same families in the same order. */
const STACKS = {
  serif: '"Frank Ruhl Libre","Times New Roman",ui-serif,Georgia,serif',
  sans: '"Heebo",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif',
  mono: '"JetBrains Mono","Heebo",ui-monospace,"SF Mono",Menlo,Consolas,monospace',
};

module.exports = { fontFaceCss, STACKS };
