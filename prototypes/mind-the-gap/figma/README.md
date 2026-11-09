# Figma handoff — Mind the Gap editions

## Status: the Figma file could not be built automatically

A file was created — **[Mind the Gap — Israel & US editions](https://www.figma.com/design/sylzhXUcHgOODCZuHYEszk)** —
but it is **empty**. Writing to it hit a hard limit:

```
You've reached the Figma MCP tool call limit on the Starter plan.
```

The connected account (`developerclaude1@gmail.com`) is on tier **`starter`** with a
**`View`** seat, and its MCP tool-call quota is exhausted. That is an account limit,
not something that can be worked around from here.

**Two ways to unblock it**, in order of effort:

1. **Use the plugin route — no upgrade needed.** The editions are single
   self-contained HTML files with no external requests, which is the ideal input
   for Figma's **html.to.design** plugin. Open the plugin in the Figma file, paste
   or upload `editions/il/index.html` or `editions/us/index.html`, and it imports
   the page as editable Figma layers — real text, frames and vectors, not a
   screenshot. This is the fastest way to a working Figma file today.
2. **Upgrade the Figma plan**, then say the word and I will build the file
   programmatically: token collection with Light/Dark modes, components, both
   edition frames, and the motion spec as documented frames.

Everything below is ready to drop into Figma either way.

## What's in this folder

| File | What it is | How to use it |
| --- | --- | --- |
| `tokens.json` | 16 colour tokens (Light + Dark values), 8 motion tokens, type and layout scales | Import with the **Tokens Studio** plugin to generate real Figma variables with both modes |
| `atlas-il.svg` | Israel map — 7 coastline paths, 17 institutions | Drag into Figma; imports as editable vector layers, each institution a named group |
| `atlas-us.svg` | US map — 277 coastline paths, 34 institutions | Same |

`tokens.json` is **parsed straight out of the shipped stylesheet** by
`editions/build/export-figma.cjs`, so the Figma variables and the live CSS cannot
drift. Regenerate with `node export-figma.cjs`; never hand-edit it.

## Typography to set in Figma

The HTML uses system stacks so each edition stays self-contained with no webfont
request. The Figma file should use the licensed faces the design is drawn for:

| Role | Latin (US) | Hebrew (IL) | Meaning |
| --- | --- | --- | --- |
| Display | Canela | Frank Ruhl Libre | art, the human voice |
| Body | Suisse Int'l | Heebo | the connective tissue |
| Index | system mono | system mono | the industry, the index |

Both the US wordmark and the Hebrew edition's wordmark are set in the **body**
face at weight 800, tracking −0.045em — not the display serif.

## Frames to build

Both editions are 1240px content width inside a 1440px frame.

| Frame | Sections |
| --- | --- |
| `US / Desktop` (LTR) | Nav · Hero + instrument · Marquee · The Gap (audience cards, bridge, facts) · Commissions · Residencies · Atlas · Join · Footer |
| `IL / Desktop` (RTL) | Same order, mirrored |

### Right-to-left rules for the Israel frame

These are the things that are easy to get wrong, and all of them are already
solved in the HTML:

- Mirror the whole layout — nav, hero columns, cards, footer.
- The resolution dial runs **right-to-left**: the cosmos end sits at the reading
  start (right), and the amber track fills from the right.
- Scale bands are Hebrew — יקום · אזור · עיר · מוסד · אמן · יצירה · חומר.
- The Latin wordmark **MIND THE—GAP** stays left-to-right inside the RTL layout,
  and wraps by whole word, never mid-word.
- Map labels sit on the left of their marker (the mirror of LTR).
- **Do not mirror the map itself.** Geography stays north-up, east-right.

## Motion specification

Tokens live in `tokens.json` under `motion`, and in the CSS as custom properties.

| Token | Value | Applies to |
| --- | --- | --- |
| `dur-micro` | 160ms | hover, focus, chip toggles, tooltip |
| `dur-base` | 420ms | card lift, nav blur, reveal transforms |
| `dur-slow` | 900ms | hero wordmark, scroll reveals, map fly |
| `dur-marquee` | 68s | institution strip loop |
| `ease-out` | `cubic-bezier(.22,.61,.36,1)` | entrances |
| `ease-in-out` | `cubic-bezier(.65,.05,.36,1)` | reversible states |
| `ease-spring` | `cubic-bezier(.34,1.3,.64,1)` | wordmark letters, gap bar |
| `stagger` | 70ms | per-item delay in a revealed group |

Named sequences to prototype:

1. **Hero entrance** — letters rise 0.4em and fade in, 40ms apart, on
   `ease-spring`; then the amber gap bar wipes out horizontally (`scaleX` 0→1,
   origin at the reading start); the counter counts up over 1400ms, ease-out cubic.
2. **Scroll reveal** — 20px rise plus fade over `dur-slow`, items staggered by
   `stagger`, fired on the element's first visible pixel.
3. **Atlas fly** — 900ms ease-out cubic, world scale → the edition's region, once,
   the first time the map enters view. Search selection flies to a single
   institution at city scale on the same curve.
4. **Marquee** — linear, infinite, paused on hover, direction reversed under RTL.
5. **Micro-interactions** — card lift 3px with a shadow bloom; nav underline wipes
   from the reading start; audience card grows a 2px accent rail top-down.

Every one of these collapses to ~0ms under `prefers-reduced-motion: reduce`, and
all content still renders.

## Reference

Benchmarked against [nala.art](https://nala.art/home). Matched: the refined
serif/sans pairing, warm off-white ground with a theme switch, audience-segmented
entry, live activity counter, full-bleed marquee. Exceeded: motion (the reference
has almost none), the hero's empty right half (filled with the live instrument),
and the entire commissions/residencies/institutions layer, which the reference
does not have at all.
