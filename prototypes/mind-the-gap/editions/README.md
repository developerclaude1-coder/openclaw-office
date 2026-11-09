# Mind the Gap — regional editions

Two motion-ready editions of the Mind the Gap layout, benchmarked against
[nala.art](https://nala.art/home):

| Edition | Language | Direction | File |
| --- | --- | --- | --- |
| **Israel** | Hebrew | RTL | `il/index.html` |
| **United States** | English | LTR | `us/index.html` |

Open either file directly in a browser. No build step, no server, no network
request — each edition is a single self-contained file.

## What was taken from the reference, and what beats it

NALA is an art *discovery and marketplace* platform: taste-matching buyers to
artworks. Its strengths are a refined Canela/Suisse Int'l type pairing, a warm
off-white ground with a theme switch, audience-segmented entry (Artists / Art
Lovers / Interior Designers), a live activity counter, a full-bleed artwork
marquee and a press row. Those moves are matched here.

Where these editions go further:

- **NALA has almost no motion.** Here the hero wordmark staggers in letter by
  letter, the opportunity counter counts up, the marquee runs, sections reveal
  on scroll, and the atlas flies from world scale to the edition's region the
  first time it enters the viewport.
- **NALA leaves the right half of its hero empty.** That space holds the
  resolution instrument — a live canvas you drive with a dial.
- **NALA covers only buying.** These editions index the infrastructure NALA has
  no layer for: public commissions, residencies, and the institutions
  themselves — with a *You can apply* filter, because whether an open call
  actually exists is the question listings usually bury.
- **NALA justifies its body text** and runs long measures. Here the measure is
  capped near 60 characters and set ragged.

## Motion specification

All motion is driven by CSS custom properties at the top of each file, so this
table and the build cannot drift apart — change a token and both change.

| Token | Value | Applies to |
| --- | --- | --- |
| `--dur-micro` | 160ms | hover, focus, chip toggles, tooltip |
| `--dur-base` | 420ms | card lift, nav blur, reveal transforms |
| `--dur-slow` | 900ms | hero wordmark, scroll reveals, map fly |
| `--dur-marquee` | 68s | institution strip loop |
| `--ease-out` | `cubic-bezier(.22,.61,.36,1)` | most entrances |
| `--ease-in-out` | `cubic-bezier(.65,.05,.36,1)` | reversible states |
| `--ease-spring` | `cubic-bezier(.34,1.3,.64,1)` | wordmark letters, gap bar |
| `--stagger` | 70ms | per-item delay within a revealed group |

Named sequences:

1. **Hero entrance** — letters rise 0.4em and fade, 40ms apart; the gap bar then
   wipes out horizontally (`scaleX`, origin follows reading direction); the
   counter counts to its value over 1400ms on an ease-out cubic.
2. **Scroll reveal** — 20px rise + fade over `--dur-slow`, fired on the first
   visible pixel (`threshold: 0`, `rootMargin: -40px`) so tall card grids can
   never be stranded invisible.
3. **Atlas fly** — on first view, 900ms ease-out cubic from world scale to the
   edition's region. Search selection flies to a single institution at city
   scale over the same curve.
4. **Marquee** — linear, infinite, paused on hover, reversed under RTL.

Everything above is disabled under `prefers-reduced-motion: reduce`, which
collapses all durations to ~0 and renders every revealed block immediately.

## Right-to-left

The Hebrew edition is genuinely mirrored, not merely translated:

- Layout uses logical properties (`margin-inline`, `inset-inline`,
  `border-inline-start`) throughout, so one stylesheet serves both directions.
- The resolution dial runs right-to-left, so the cosmos end sits under the
  reading start, and the track fill direction flips with it.
- Scale bands are Hebrew (יקום → חומר), not transliterated.
- The Latin wordmark and nav mark are explicitly `dir="ltr"` so they do not
  scramble inside the RTL flow, while still wrapping by word.
- Map labels anchor on the correct side of their marker.
- The map itself is **not** mirrored — geography stays north-up, east-right.

## The data

Every institution, residency and commission is real and was researched against
primary sources. Each card carries a source link and a confidence marker where
a detail could not be fully confirmed.

**All 51 coordinates were verified deterministically**, not by a language model:
each was point-in-polygon tested against Natural Earth national boundaries and
had to resolve to its stated country. 17/17 Israel and 34/34 US passed.

| | Israel | United States |
| --- | --- | --- |
| Museums | 10 | 23 |
| Galleries | 5 | 5 |
| Biennials / fairs | 2 | 6 |
| Commissions | 4 | 10 |
| Residencies | 6 | 12 |

No dated deadlines appear anywhere, deliberately — application windows move every
year and a wrong date actively harms an artist, so cards describe the cycle.

### Known limitations

- Israeli commercial gallery coordinates are **approximate to the district**
  (Kiryat HaMelacha, Jaffa) and are marked `low` confidence in the data.
- Israel's commissioning landscape has no percent-for-art equivalent to index,
  so its commissions list is short and leans on biennial open calls.
- Figures in funding notes reflect the cycle they were published for.

## Rebuilding

```bash
cd build
node build-editions.cjs "November 2026"   # writes ../il/index.html and ../us/index.html
```

Content lives in `build/locales/{il,us}.json` — strings, data and map framing.
The build fails loudly on a missing translation key or an unreplaced
placeholder, so a half-translated edition cannot ship.

### Coastlines

Each edition ships its own coastline clipped to its region, because these maps
zoom to country scale where the global prototype's 0.1° encoding reads as
visible blockiness:

| Edition | Source | Tolerance | Precision | Size |
| --- | --- | --- | --- | --- |
| Israel | Natural Earth 10m | 0.03° | 1/200° | 64 KB |
| US | Natural Earth 50m | 0.03° | 1/100° | 46 KB |

Regenerate with `clip-region.cjs <source.geojson> <out> <minLon> <minLat> <maxLon> <maxLat> <tol> <precision>`.
Natural Earth data is public domain.

## Typography

The HTML uses system stacks so each edition stays self-contained with no webfont
request and no silent fallback. The Figma file specifies the licensed faces the
design is drawn for:

| Role | Latin | Hebrew |
| --- | --- | --- |
| Display / serif | Canela | Frank Ruhl Libre |
| Body / sans | Suisse Int'l | Heebo |
| Index / mono | system monospace | system monospace |

The three voices carry meaning: serif is art and the human, mono is the industry
and the index, sans is the connective tissue between them — the gap being minded.
