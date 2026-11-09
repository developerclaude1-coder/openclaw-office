# Shared typefaces

Every Mind the Gap page embeds its type from here, as data URIs inside the
built HTML. No page requests a font, and no page falls back by accident.

| Voice | Face | Covers | File | Size |
| --- | --- | --- | --- | --- |
| Serif — art, the human | Frank Ruhl Libre (variable, 300–900) | Latin | `frank-ruhl-libre-latin.woff2` | 44 KB |
| | | Hebrew | `frank-ruhl-libre-hebrew.woff2` | 19 KB |
| Sans — the connective tissue | Heebo (variable, 100–900) | Latin | `heebo-latin.woff2` | 30 KB |
| | | Hebrew | `heebo-hebrew.woff2` | 12 KB |
| Mono — the industry, the index | JetBrains Mono (400) | Latin | `jetbrains-mono-latin-400.woff2` | 21 KB |

Frank Ruhl Libre is the serif for both scripts on purpose. It is the canonical
Hebrew book face and ships its own Latin, so switching language never switches
family. Heebo does the same job for the sans.

## Using it

```js
const { fontFaceCss, STACKS } = require('../shared/fonts/fonts.cjs');
fontFaceCss({ latin: true, hebrew: true });   // @font-face rules, fonts inlined
STACKS.serif; STACKS.sans; STACKS.mono;       // font-family values, with fallbacks
```

A build passes `hebrew: false` for a page with no Hebrew on it. The world index
does, which saves it about 40 KB.

## Source and licence

The files are the Latin and Hebrew subsets published by Fontsource, unmodified:

- `@fontsource-variable/frank-ruhl-libre` 5.3.0
- `@fontsource-variable/heebo` 5.3.0
- `@fontsource/jetbrains-mono` 5.3.0

All three families are licensed under the SIL Open Font License 1.1, which
permits embedding and redistribution. The licence texts, with each family's
copyright notice, are alongside the fonts in `OFL-*.txt`.
