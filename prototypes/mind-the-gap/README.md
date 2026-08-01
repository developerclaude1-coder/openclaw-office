# Mind the Gap

A prototype for a one-stop website connecting artists and the art industry: **artists and collectors,
public commissions, artist residencies, and a live map of museums, galleries and biennials.**

The design is built around a single idea from the brief — *an ever-refining resolution of curated
information, like zooming in from space to a single atom.* That metaphor appears twice: decoratively
in the hero (a zoom instrument you drive with a resolution dial) and functionally in the Atlas, where
the same gesture actually resolves real geography down to a single gallery door.

Open `index.html` in any browser. No build step, no server, no network access required.

## What's in it

| Section | Contents |
| --- | --- |
| **Hero** | Canvas starfield driven by a `RESOLUTION` dial through named scale bands (Cosmos → Region → City → Institution → Artist → Work → Matter) |
| **The Gap** | What artists and collectors each lack, plus sourced facts about the infrastructure between them |
| **Commissions** | 64 real commissioning programmes, filterable — including a **"You can apply"** filter, because most listings bury whether an open call actually exists |
| **Residencies** | 65 real residency programmes, filterable by region, comparing duration, what is funded, and who may apply |
| **Atlas** | 58 real institutions on a true equirectangular projection — scroll to zoom, drag to pan, search to fly |

## The data is real

Every organisation, programme and residency listed was researched against primary sources and then
independently fact-checked. Nothing is placeholder content.

**Coordinates were verified deterministically, not by a language model.** Every one of the 58
institution coordinates was tested by point-in-polygon against Natural Earth national boundary data
and had to resolve to its stated country. 57 passed outright; the one exception (National Gallery
Singapore) is an artifact of Singapore being too small to appear in the 110m boundary dataset — its
coordinates are correct.

Each card links to the source it was verified against, and carries a confidence marker when a detail
could not be fully confirmed.

### Known limitations

- **No dated deadlines anywhere, by design.** Application windows move every year, and a wrong date
  actively harms an artist. Cards describe the *cycle* instead ("annual open call, typically opens in
  autumn"). Always confirm with the organisation.
- **Two regions are under-covered.** Research passes for *South Asia / Middle East* and *Southern,
  Eastern and Northern Europe* returned no usable results, so those regions are represented only by
  the entries already present in the base dataset. They are the obvious next thing to fill.
- Figures quoted in funding notes reflect the cycle they were published for and are not automatically
  current.
- `build/data/d-critique.txt` is a reviewer's report on the dataset's remaining weaknesses, kept in the
  repo deliberately rather than discarded.

## Rebuilding

`index.html` is generated. To change content, edit the JSON in `build/data/` (or the page in
`build/page.template.html`) and re-run:

```bash
cd build
node build.cjs "August 2026"     # writes ../index.html
```

The build merges and de-duplicates the datasets, maps countries to regions, normalises country names,
restores stripped diacritics, and inlines both the data and the coastline geometry.

### Coastlines

`build/land-fine.txt` is a compact encoding of world coastlines: Natural Earth 110m land polygons,
simplified with Douglas–Peucker, quantised to 0.1°, and delta-encoded in base 36. The entire world is
**9 KB** — small enough to inline, which keeps the page fully self-contained. Regenerate with
`build/simplify.cjs`.

Natural Earth data is in the public domain.

## Technical notes

- Single file, no dependencies, no external requests — safe under a strict CSP.
- Light and dark themes, both designed rather than inverted; follows the OS preference and an in-page toggle.
- Honours `prefers-reduced-motion`: animation stops, all content still renders.
- Typography is a tri-voice system that encodes meaning — serif for art and the human, monospace for
  the industry and the index, sans for the connective tissue between them.
