# Mind the Gap — how it works

One page that explains the product as a piece of motion design, and ends by
putting you inside it.

Open `index.html`. It needs no server and makes no network request: data,
coastline, typefaces and code are all in the file.

## The piece

The brief asks for a site that feels like *an ever-refining resolution of curated
information, like zooming in from space to a single atom*. The intro is that
sentence, played once. A single field of about two thousand points (a thousand
on a phone) re-forms eight times as you descend, and each formation is captioned the way a museum captions
an object: a number, a title, two or three sentences, a tombstone line.

| # | Scene | What the field does | What it says |
| --- | --- | --- | --- |
| 00 | Cosmos | Undifferentiated stars; the wordmark assembles | The art world, at every resolution |
| 01 | The gap | Two swarms form, with nothing between them | Artists and collectors cannot see each other |
| 02 | The atlas | The points become a dot map of the world; 105 institutions ignite | First, we map the field |
| 03 | Regional editions | The world dims; two regions are framed | Opportunities are bound to place |
| 04 | The collector layer | The whole map returns in the collectors' colour; routes arc between cities | Collectors are not bound by borders |
| 05 | The bridge | The swarms return and the logo's gap bar spans them | The index is the bridge |
| 06 | Resolution | Everything streams from one vanishing point; night turns to day | Curation is resolution |
| 07 | Arrival | A still ring, the institutions set into it like stones | Enter the world of art curation |

Pressing **Enter** does not load another page. The ring flies apart into the
world map, real coastlines resolve under the dots, the institutions settle on
their actual coordinates, and the interface fades in around them: search, filters,
pan and zoom, and three doors to the Israel edition, the United States edition
and the world index.

Colour carries meaning throughout. Ink is artists and the land itself, the cool
blue is collectors and the industry, amber is whatever the index lights up. The
piece starts in the dark of space and ends in the white of a lit gallery, and it
does not follow the visitor's light or dark setting, because the change of light
is the story.

## Watching it

- **Scroll**, at your own pace. Scenes are scrubbed by scroll position, eased so
  a mouse wheel's steps read as one movement.
- **Play** runs the whole descent as a film in about 78 seconds, paced for
  reading. It never starts by itself. Pause is always in the top bar, and any
  scroll of your own takes over at once.
- **Skip intro** goes straight to the atlas. **Replay** brings the intro back.
- The chapter rail on the side jumps to any scene.
- **EN / עב** switches language in place, including inside the atlas.

## Built from the data, not written about it

Every number on the page is counted at build time from the same datasets the
world index and the editions are built from, so the copy cannot drift:

```
institutions 105 (63 museums, 22 galleries, 20 biennials) in 30 countries
commissions  79  = world 64 + US 10 + IL 9, de-duplicated
residencies  83  = world 65 + US 12 + IL 9, de-duplicated
```

The exhibits beside the captions are real entries: the search finds the Zeitz
Museum in Cape Town and pulses it on the map, and the two opportunity cards are a
real Mifal HaPais open call and Times Square Arts' *Midnight Moment*.

The build refuses to produce a page when the data and the copy disagree. It
stops if the English and Hebrew strings have different keys, if the copy asks
for a number that is not counted, if an institution lacks a field or has
coordinates off the globe, or if a place has been added without a Hebrew name
for its city and country.

### What is illustrative

- **The collector routes in scene 04 are a picture, not a measurement.** They
  join real art cities to show collecting crossing borders. The caption says so.
- Scale readings in scene 06 (10²¹ m down to 10⁻⁹ m) are the same named bands the
  world index's resolution dial uses.

### Counting choices

- Hong Kong is counted under China, as the source dataset frames it
  ("China (Hong Kong SAR)"), so "30 countries" means countries.
- Institutions that appear in an edition and in the world list are counted once
  and keep their edition.
- Outside the Israel edition the data is English only. In Hebrew, cities and
  countries are named from `src/places-he.json`; institution names keep their
  own script, as they do in Hebrew print, and descriptive notes are left out
  rather than shown in English.

## How it is made

One `<canvas>`, no libraries.

- **Formations.** Each scene is a function `(particle, out)` that says where a
  particle belongs and how it looks. The engine tweens between two of them, with
  each particle leaving a little after the last and travelling on a slight arc.
  Where the order of arrival means something it is authored: the map builds in
  reading direction, institutions ignite last, the bridge shoots across from the
  reading start.
- **One projection.** The dot map in the story and the live atlas at the end are
  the same equirectangular projection through two cameras, which is why entering
  is a camera move rather than a cut.
- **Every institution is its own particle.** The 105 points of light in scene 02
  are the same 105 you can click after entering.
- **Clusters do not burn out.** A dozen institutions share a few pixels in New
  York, so each halo is thinned by how many neighbours overlap it at the current
  zoom.
- **The coastline stays a line.** It is Natural Earth 50m, 56 KB for the whole
  world. Drawn as straight segments it breaks into facets when you zoom, so each
  ring is drawn as a curve through the midpoints of its sides: identical at
  world scale, soft when close.

### Layouts

| Window | Arrangement |
| --- | --- |
| Landscape | Exhibit above, wall label below it, exhibit card beside the label |
| Portrait (phones, tablets upright) | Exhibit in the top two fifths, label and card stacked beneath; the wordmark stacks; the atlas fills the height and you pan across it |
| Shallow (a phone on its side) | Each scene keeps its title and loses its paragraph; the shelf of doors shrinks to names |

In Hebrew the whole composition mirrors, not just the text: artists stand at the
reading start, the bridge crosses from right to left, the map builds from the
right, and map labels sit to the left of their markers.

### When motion or scripting is off

- **Reduced motion:** scenes cut instead of tweening, nothing twinkles or
  drifts, and the fly-to in the atlas becomes a jump. Nothing is removed.
- **No scripting:** the page is a plain, complete document. All seven chapters
  read in order, and the three doors are offered as ordinary links.

## Files

```
intro/
  index.html              the built page (generated)
  build.cjs               assembles it from src/ and the shared datasets
  check.cjs               browser checks (see below)
  src/
    index.template.html   markup
    styles.css            tokens, type, the story's layout
    app.css               the atlas interface
    strings.json          all copy, English and Hebrew
    places-he.json        Hebrew names for cities and countries
    engine.js             layout, particles, morphing between formations
    scenes.js             the eight formations and their drawn marks
    atlas.js              the live map: camera, drawing, pointer, search
    chapters.js           what scroll position means; play; the way in
    main.js               the frame loop and start-up
shared/
  fonts/                  the typefaces every page embeds
  land-world-50.txt       world coastline, Natural Earth 50m
```

## Rebuilding

```bash
node build.cjs                          # writes ./index.html
node build.cjs --artifact --out=FILE    # body-only, linked for a published multi-page artifact
```

The same `--artifact` flag exists on `../build/build.cjs` and
`../editions/build/build-editions.cjs`. It only changes where the pages expect
to find each other.

## Checking it

```bash
node check.cjs                                  # everything, about four minutes
node check.cjs story atlas                      # just the parts named
node check.cjs story --size=390x844 --lang=he   # one window size, one language
node check.cjs --shots=DIR                      # and save a screenshot of every scene
```

Needs Playwright and a Chromium; set `PLAYWRIGHT_PATH` and `CHROMIUM_PATH` if
they are not on the default resolution path. They are not dependencies of this
repository.

The checks are behaviour and layout checks rather than image snapshots. Each was
confirmed able to fail: reintroducing an oversized wordmark, a squeezed button
label, or a headline that reaches into the arrival ring turns the run red.

| Part | What it asks |
| --- | --- |
| `story` | In all 8 scenes, at 9 window sizes, in both languages and with reduced motion: is any text clipped, under the bar, on top of other text or on the rail? Does any control's label spill out of its outline? |
| `atlas` | Does Enter arrive? Do search, ranking, fly-to, zoom, pan, wheel, filters, tooltips, the data note, the doors, the language switch, replay and skip each do what they say? Does any part of the interface sit on another? |
| `play` | Does anything move before it is asked to? Does play run at reading pace, pause, resume, yield to scrolling, stop at the end, and restart from there? |
| `nojs` | With scripting off, is every chapter readable and are the doors still offered? |
| `pages` | Do the world index and both editions use the shared typefaces, arrive in the light tone when entered from the intro, resolve all their links, and stay inside a phone's width? |
