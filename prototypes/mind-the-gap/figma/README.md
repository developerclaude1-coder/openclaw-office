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

**The fix is a local plugin — no upgrade, no MCP.** The quota caps calls made
from the agent side. A plugin runs inside your own Figma client, so it has none
of that limit. `plugin/` contains one, generated from the same locale files the
site is built from:

1. Figma → **Plugins → Development → Import plugin from manifest…**
2. Pick `prototypes/mind-the-gap/figma/plugin/manifest.json`
3. Open the target file and run **Mind the Gap — build editions**

It builds, in one pass:

- a **Mind the Gap** variable collection — 16 colours, each with **Light and Dark**
  modes, correctly scoped to fills, strokes and text
- the **US / Desktop** frame (LTR) and the **Israel / Desktop (RTL)** frame, with
  real content: nav, hero, audience cards, the two-pole gap section with the
  collector side badged worldwide, commission and residency cards, and a slot
  sized for the atlas
- a **Motion spec** frame listing every token and named sequence

Hebrew needs a Hebrew-capable family, so the plugin tries Heebo, Assistant,
Rubik, Noto Sans Hebrew and Arial in order and uses the first that loads,
reporting which one it picked rather than silently falling back to boxes.

Then drag `atlas-il.svg` / `atlas-us.svg` into the atlas slot in each frame.

**Two caveats, stated plainly:**

- The plugin is syntax-checked and its embedded data is validated, but it has
  **not been executed inside Figma from here** — there is no Figma client in this
  environment. If a call fails, the error comes back in the closePlugin message.
- Your seat on the team reads **View**. Personal drafts are normally editable on
  a Starter plan, but if the file refuses edits, run the plugin in a file in
  your own drafts.

**Alternative, zero setup:** the editions are single self-contained HTML files
with no external requests — ideal input for the **html.to.design** plugin, which
imports a page as editable layers. Lower fidelity on structure than the plugin
above, but nothing to install from this repo.

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

The shipped pages embed three open-licensed faces, and the Figma file should
use the same ones so the two match:

| Role | Latin (US) | Hebrew (IL) | Meaning |
| --- | --- | --- | --- |
| Display | Frank Ruhl Libre | Frank Ruhl Libre | art, the human voice |
| Body | Heebo | Heebo | the connective tissue |
| Index | JetBrains Mono | JetBrains Mono | the industry, the index |

All three are free on Google Fonts. An earlier version of this note named
Canela and Suisse Int'l for Latin; the pages no longer use them.

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
