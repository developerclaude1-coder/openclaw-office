# Mind the Gap

A prototype for a one-stop website connecting artists and the art industry: **artists and collectors,
public commissions, artist residencies, and a live map of museums, galleries and biennials.**

The design is built around a single idea from the brief — *an ever-refining resolution of curated
information, like zooming in from space to a single atom.* That metaphor appears twice: decoratively
in the hero (a zoom instrument you drive with a resolution dial) and functionally in the Atlas, where
the same gesture actually resolves real geography down to a single gallery door.

Open any page in a browser. No build step, no server, no network access required.

## Where to start

| Page | What it is |
| --- | --- |
| [`intro/`](intro/) | **Start here.** How Mind the Gap works, as a piece of motion design: eight scenes that descend from the whole field to a single work, ending inside a live atlas you can explore. English and Hebrew. |
| [`index.html`](index.html) | The world index: 92 commissions, 89 residencies, 139 institutions. |
| [`editions/`](editions/) | An edition for each of six regions (`americas`, `europe`, `africa`, `middle-east`, `asia`, `oceania`), and one for each of two countries in its own language: Israel in Hebrew and right-to-left, the United States in English. |
| [`figma/`](figma/) | A handoff package for the two country editions, kept for reference. |

The intro's last scene has a door to every one of these pages, and every page links to all the others.

## One index, cut by place

A commission or a residency is usually open to people from somewhere, so the index is cut by place.
There is one dataset, and each page is a part of it:

| Page | What it holds |
| --- | --- |
| World index | Everything written in English: the whole dataset |
| A regional edition | The part of the dataset inside that region |
| A country edition | The part inside that country, written in the country's language |

| Region | Commissions | Residencies | Institutions | Country edition inside it |
| --- | --- | --- | --- | --- |
| Americas | 30 | 27 | 43 | United States (10, 12, 34) |
| Europe | 14 | 15 | 32 | |
| Africa | 13 | 14 | 7 | |
| Middle East | 8 | 6 | 32 | Israel (9, 9, 17), in Hebrew |
| Asia | 19 | 21 | 14 | |
| Oceania | 8 | 6 | 11 | |

The United States edition is in English, so its listings are part of the Americas edition and of the
world index. Israel's commissions and residencies are written in Hebrew and exist only in the Israel
edition: the Middle East edition maps Israel's institutions and points to the Israel edition for the
rest. That is why the intro counts 101 commissions and 98 residencies where the world index lists 92
and 89.

The regions are defined once, in [`shared/regions.cjs`](shared/regions.cjs), together with which
region each country belongs to. A region here is an editorial grouping for finding opportunities, not
a geopolitical claim: where a country could sit in two, it sits where an artist would most likely
look for it. The build refuses a listing in a country that has no region, and a listing in a country
that has its own edition but is missing from that edition.

## What's in the world index

| Section | Contents |
| --- | --- |
| **Hero** | Canvas starfield driven by a `RESOLUTION` dial through named scale bands (Cosmos → Region → City → Institution → Artist → Work → Matter) |
| **The Gap** | What artists and collectors each lack, plus sourced facts about the infrastructure between them |
| **Editions** | A door to each of the eight editions, with what is behind it counted from the data |
| **Commissions** | 92 real commissioning programmes, filterable — including a **"You can apply"** filter, because most listings bury whether an open call actually exists |
| **Residencies** | 89 real residency programmes, filterable by region, comparing duration, what is funded, and who may apply |
| **Atlas** | 139 real institutions on a true equirectangular projection — scroll to zoom, drag to pan, search to fly |

## The data is real

Every organisation, programme and residency listed was researched against primary sources and then
independently fact-checked. Nothing is placeholder content.

**Coordinates were verified deterministically, not by a language model.** Every one of the 139
institution coordinates was tested by point-in-polygon against Natural Earth national boundary data
and had to resolve to its stated country. One exception (National Gallery Singapore) is an artifact
of Singapore being too small to appear in the 110m boundary dataset — its coordinates are correct.
The 34 institutions added in November 2026 passed a second, independent test as well: each lies
within 20 km of the GeoNames point for the city it names.

Each card links to the source it was verified against, and carries a confidence marker when a detail
could not be fully confirmed.

### Known limitations

- **No dated deadlines anywhere, by design.** Application windows move every year, and a wrong date
  actively harms an artist. Cards describe the *cycle* instead ("annual open call, typically opens in
  autumn"). Always confirm with the organisation.
- **The November 2026 pass could not open the pages it cites.** Europe, the Middle East and Oceania
  were thin, so 23 commissions, 19 residencies and 34 institutions were added for them, and eleven
  older listings in Asia and Oceania were re-checked. The session's network could run searches but
  not open pages, so each fact was read from the organiser's own page as a search engine quoted it.
  None of these listings is rated above `medium`, the pages that hold them say so in their data
  note, and they are kept in a file of their own (`build/data/d-global.json`) so that a later pass
  can open every source and upgrade or correct them.
- **Coverage is a first cut, not a census.** Africa has 7 institutions and the Middle East 8
  commissions. A country that is missing has not been researched yet, which is not the same as
  having nothing to offer. Each regional edition says this about itself.
- Figures quoted in funding notes reflect the cycle they were published for and are not automatically
  current.
- `build/data/d-critique.txt` is a reviewer's report on the dataset's remaining weaknesses, kept in the
  repo deliberately rather than discarded.

## Rebuilding

Every page is generated. To change content, edit the JSON in `build/data/` or a country edition's
locale file, then rebuild the three kinds of page. They all read the same dataset, so rebuild all
three:

```bash
node build/build.cjs "November 2026"             # the world index      -> index.html
node editions/build/build-editions.cjs           # the eight editions   -> editions/<id>/index.html
node intro/build.cjs                             # the intro            -> intro/index.html
node intro/check.cjs                             # then check them, in a browser
```

Each build also takes `--artifact --out=…`, which lays the links out for a published multi-page
artifact and changes nothing else.

Each kind of page is kept as markup, a stylesheet and a script, and its build puts them into one
self-contained file: `build/page.template.html`, `page.css` and `page.js` for the world index,
`editions/build/edition.template.html`, `edition.css` and `edition.js` for the editions, and
`intro/src/` for the intro.

[`build/dataset.cjs`](build/dataset.cjs) is the one place the data is assembled: it merges and
de-duplicates the research files and the country editions, gives every listing its region,
normalises country names and restores stripped diacritics. The world index, the regional editions
and the intro all `require` it, which is what keeps their numbers in step.

### Coastlines

`build/land-fine.txt` is a compact encoding of world coastlines: Natural Earth 110m land polygons,
simplified with Douglas–Peucker, quantised to 0.1°, and delta-encoded in base 36. The entire world is
**9 KB** — small enough to inline, which keeps the page fully self-contained. Regenerate with
`build/simplify.cjs`.

Natural Earth data is in the public domain.

## Technical notes

- Single file, no dependencies, no external requests.
- Light and dark themes, both designed rather than inverted; follows the OS preference and an in-page toggle.
- Honours `prefers-reduced-motion`: animation stops, all content still renders.
- Typography is a tri-voice system that encodes meaning — serif for art and the human, monospace for
  the industry and the index, sans for the connective tissue between them. The faces are Frank Ruhl
  Libre, Heebo and JetBrains Mono, embedded in the page and shared with the intro and the editions
  (see [`shared/fonts/`](shared/fonts/)).
