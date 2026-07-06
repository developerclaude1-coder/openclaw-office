# Visual Dictionary — AI Backend Design

> Status: **Design / not yet built.** The shipped app runs entirely on an
> offline mock library (`src/components/dictionary/`). This document describes
> the real recognition → search → reconstruction pipeline that replaces the
> mock, and how the two-library model maps onto it.

## 1. Goal

Photograph any man-made object → get an illustrated, labelled parts diagram,
how-it's-made notes, repair guides, and cited sources. "A Wikipedia for things
made by hand." Every reconstructed object is reused (the shared library);
each user also keeps a personal, on-device copy.

The frontend already renders the target output — `PartsDiagram` (labelled +
exploded), `RepairPanel`, `WarrantyCard`, `CitationsList` — from a single typed
object, `DictionaryEntry` (`src/components/dictionary/types.ts`). **The backend's
job is to produce a valid `DictionaryEntry` JSON for an object it has never seen
before.** That is the entire contract.

## 2. The seam (mock → real)

Recognition is isolated to one file today:

```
src/components/dictionary/lib/match.ts   → matchEntry() / recognizeFromFileName()
```

Swapping to real AI means replacing that lookup with a call to a backend
endpoint that returns a `DictionaryEntry`. Nothing in the UI changes. Concretely:

```
POST /api/recognize      { image: <base64|fileId>, depth?: "standard"|"deep" }
   → 200 { status: "ready",     entry: DictionaryEntry }      // cache hit
   → 202 { status: "generating", jobId, partial?: {...} }     // cache miss, streaming
GET  /api/entry/:id      → DictionaryEntry                    // shared-library fetch
GET  /api/jobs/:jobId    → { status, entry? }                 // poll / SSE for generation
```

A browser can't hold an Anthropic API key, so this **must** be a small server
(or edge function) proxy. The frontend never talks to the model directly.

## 3. Pipeline

Per new object, the backend runs a five-stage pipeline. All model calls use the
Anthropic API (`@anthropic-ai/sdk`), model `claude-opus-4-8` (vision + 1M
context; `claude-haiku-4-5` is a cheaper option for the recognition-only stage).

```
 photo
   │  ① Recognise (vision)          claude-opus-4-8, image input
   ▼
 identity  { object, category, make?, model?, confidence }
   │  ─── cache lookup by identity ───► HIT → return stored DictionaryEntry (done)
   │  MISS
   ▼
   │  ② Search  (server tool)       web_search_20260209 — manuals, part labels,
   │                                 patents, teardown/repair sites
   ▼
 candidate sources (URLs)
   │  ③ Fetch   (server tool)       web_fetch_20260209 — pull the best sources
   ▼
 source documents
   │  ④ Extract & assemble          structured output → DictionaryEntry JSON
   │       (parts + hotspots, how-it's-made, repair, citations)
   ▼
 DictionaryEntry (unillustrated)
   │  ⑤ Illustrate                  see §5 — the genuinely hard stage
   ▼
 DictionaryEntry (complete) ──► persist to shared library ──► return to client
```

### Stage 1 — Recognise
Vision call. Return a compact identity object, not prose. Prompt for
make/model when a nameplate/logo is visible (it usually is on manufactured
goods) — that identity is the cache key.

### Stage 2 — Search
`web_search_20260209` (dynamic filtering; Opus 4.8). Bias the query toward
official manuals, spare-part catalogues, patents (rich for "how it's made"),
and teardown sites (iFixit, Park Tool, manufacturer support). Do **not** also
declare `code_execution` — dynamic filtering runs it under the hood.

### Stage 3 — Fetch
`web_fetch_20260209` pulls the highest-value URLs surfaced in stage 2 (web
fetch only retrieves URLs already present in the conversation). Enable
`citations: {enabled: true}` on fetched documents so quoted facts carry source
spans — these become the entry's `citations`.

### Stage 4 — Extract & assemble
One structured-output call that emits the `DictionaryEntry` shape directly:

```ts
const res = await client.messages.parse({
  model: "claude-opus-4-8",
  max_tokens: 16000,
  thinking: { type: "adaptive" },
  output_config: { format: zodOutputFormat(DictionaryEntrySchema) },
  system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
  messages: [/* identity + fetched sources */],
});
// res.parsed_output → DictionaryEntry (parts, functions, materials, hotspots,
//                     repair.commonFaults, citations)
```

`DictionaryEntrySchema` is the JSON-schema mirror of `types.ts`. Structured
output guarantees the frontend gets a renderable object every time. Note the
schema constraints (no `minLength`/`maximum`, `additionalProperties: false`);
the SDK strips unsupported keywords and validates client-side.

### Stage 5 — Illustrate
See §5 — the open problem.

## 4. Two-library architecture

| | Shared (collective) | Personal (`My Library`) |
|---|---|---|
| Today | mock `dictionaryEntries[]` | `localStorage` (zustand persist) |
| Real | server DB, **content-addressed by identity** | stays client-side; optional account sync later |
| Purpose | "reconstruct once, reuse by everyone" | "kept on my phone" + warranty |

**Dedup is the cache in stage 1.** Normalise the recognised identity (e.g.
`bicycle:trek-fx-3` or a canonical-object slug when there's no make/model) into
a key; a hit short-circuits the whole pipeline. This is what makes the system
cheap at scale and is the literal implementation of "no reason to regenerate
what's already done." Warranty stays personal and private — it depends on when
*you* bought the unit, so it never belongs in the shared entry (already modelled
that way: `WarrantyRecord` lives on the saved item, not the entry).

## 5. The hard part: illustration

Stages 1–4 are well-trodden. The schematic **exploded illustration** is the
genuine research risk. The model reliably produces the *structured* part list,
functions, and hotspot coordinates; it does not reliably draw production-quality
exploded vector art. Options, roughly in order of pragmatism:

1. **Structured-only + generic renderer (ship first).** The model returns parts
   with hotspots; the frontend renders them over a category-generic silhouette
   using the existing `PartsDiagram` exploded mode. Correct labels and callouts,
   generic body. Lowest risk, works today with zero new infra.
2. **Sourced diagrams.** Reuse a real exploded diagram found in stage 2 (many
   manuals contain one) as the illustration, with the model mapping hotspots
   onto it. Best fidelity when a diagram exists; licensing must be checked.
3. **Generated line-art.** An image model renders the pencil/blueprint aesthetic
   from the reference brief. Anthropic has no image-generation model, so this
   needs a separate service and a consistency/labelling pass. Highest fidelity,
   highest cost and complexity — a later phase.
4. **Vector synthesis.** Have the model emit an SVG schematic directly. Feasible
   for simple objects, unreliable for complex ones — treat as experimental.

Recommendation: ship **(1)**, upgrade to **(2)** when a source diagram is
present, keep **(3)** as the "rotating 3D sketch" north star.

## 6. Depth levels

The "clay pot → glaze mineralogy" idea maps to the `depth` request param, which
drives the `effort` setting and how many search/fetch rounds run:

- `standard` — `effort: "medium"`, one search round. The default.
- `deep` — `effort: "high"` (or `xhigh`), extra search rounds targeting
  materials science / metallurgy / process detail, and a "further resolution"
  section appended to the entry.

## 7. Cost, latency, safety

- **Latency.** A cold reconstruction is multi-stage and slow (seconds to
  minutes). Stream a `partial` entry (identity + overview first, parts/repair
  as they resolve) via SSE or the `202 + jobId` poll; the UI already has an
  "analysing" state to hang this on.
- **Cost.** The identity cache is the primary lever — most photos of common
  objects hit an existing entry and cost one cheap vision call. Prompt-cache the
  large system prompt (`cache_control: ephemeral`) across generations.
- **Safety.** Handle `stop_reason: "refusal"` before reading content (dual-use
  objects — weapons, locks — will be declined). Treat fetched web content as
  untrusted input; never let a page redirect the extraction prompt.
- **Provenance.** Every fact should trace to a `citation`. Prefer the fetch
  stage's citation spans over unsourced model claims, and surface low-confidence
  recognitions to the user ("Is this a …?") rather than guessing silently.

## 8. Phasing

1. **Proxy + recognition + structured extraction** → real entries with generic
   illustrations (illustration option 1). This alone replaces the mock.
2. **Search + fetch + citations** → real manuals, real sources, real repair.
3. **Identity cache + shared-library DB** → dedup, "reconstruct once."
4. **Sourced / generated illustration** (options 2–3) and depth levels.
5. **Accounts + personal-library sync** across devices.
