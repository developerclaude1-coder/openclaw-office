# Visual Dictionary — recognition proxy (reference)

`recognize.ts` is a **reference implementation** of the backend the app's
`ApiProvider` talks to. It is intentionally **outside `src/`** so it is excluded
from the frontend `tsc`/Vite build and does not pull `@anthropic-ai/sdk` into the
app bundle.

## Run it

```bash
npm i @anthropic-ai/sdk        # not a project dependency
export ANTHROPIC_API_KEY=sk-ant-...   # or: ant auth login
npx tsx server/recognize.ts    # listens on :8787
```

Then build/run the frontend pointed at it:

```bash
VITE_DICTIONARY_API_URL=http://localhost:8787 pnpm dev
```

With that env var set, `recognitionProvider` becomes the live `ApiProvider`;
without it, the app uses the offline mock library. That single switch is the
only seam between the demo and a real vision backend.

## Contract

```
POST /recognize   { image?: <base64>, query?: string }
  → { status: "ready", entry: DictionaryEntryData }
  → { status: "not_found" }
```

`DictionaryEntryData` is the wire shape validated in
`src/components/dictionary/recognition/schema.ts`. The model is constrained to
emit exactly it via structured output, so the browser always receives a
renderable object. See `VISUAL-DICTIONARY-AI-BACKEND.md` for the full pipeline
and the phases still to build (identity cache/dedup, sourced illustrations,
depth levels).
