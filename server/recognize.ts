/**
 * Visual Dictionary — reference recognition proxy (phase 1).
 *
 * ⚠️  This file is NOT part of the frontend build. It lives outside `src/` so it
 *     is excluded from `tsc` / Vite, and it depends on `@anthropic-ai/sdk`, which
 *     is not a project dependency. It is a runnable reference for the backend the
 *     frontend's `ApiProvider` talks to (see
 *     `src/components/dictionary/recognition/provider.ts`).
 *
 * Run it (out of tree):
 *   npm i @anthropic-ai/sdk
 *   export ANTHROPIC_API_KEY=sk-ant-...
 *   npx tsx server/recognize.ts            # listens on :8787
 *   # then build the app with VITE_DICTIONARY_API_URL=http://localhost:8787
 *
 * Contract: POST /recognize  { image?: base64, query?: string }
 *   → 200 { status: "ready", entry: DictionaryEntryData }
 *   → 200 { status: "not_found" }
 *
 * `DictionaryEntryData` is the wire shape validated client-side by
 * `parseDictionaryEntryData` — the model is constrained to emit exactly it via
 * structured output, so the browser always receives a renderable object.
 *
 * This implements pipeline stages 1–4 from VISUAL-DICTIONARY-AI-BACKEND.md
 * (recognise → search → fetch → assemble). Stage 5 (illustration) is handled
 * client-side by the generic renderer; the identity cache (dedup) is left as a
 * TODO — wire it in front of `runPipeline` keyed by the recognised identity.
 */

import { createServer } from "node:http";
// eslint-disable-next-line import/no-unresolved -- optional dep, install to run
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-8"; // vision + 1M context + structured output
const PORT = Number(process.env.PORT ?? 8787);

const client = new Anthropic(); // reads ANTHROPIC_API_KEY / ant profile

/** JSON Schema mirror of `DictionaryEntryData` — the guaranteed output shape. */
const ENTRY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["id", "name", "category", "summary", "aliases", "parts", "citations"],
  properties: {
    id: { type: "string", description: "slug, e.g. 'trek-fx-3' or a canonical object slug" },
    name: { type: "string" },
    category: { type: "string" },
    summary: { type: "string", description: "one-paragraph overview" },
    aliases: { type: "array", items: { type: "string" } },
    parts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "name", "function", "hotspot"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          function: { type: "string" },
          material: { type: "string" },
          hotspot: {
            type: "object",
            additionalProperties: false,
            required: ["x", "y"],
            // Coordinates live in the generic 0 0 400 260 viewBox.
            properties: { x: { type: "number" }, y: { type: "number" } },
          },
        },
      },
    },
    citations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "title", "source", "url"],
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          source: { type: "string" },
          url: { type: "string" },
        },
      },
    },
    repair: {
      type: "object",
      additionalProperties: false,
      properties: {
        manualUrl: { type: "string" },
        tutorials: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "title", "source", "kind", "url"],
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              source: { type: "string" },
              kind: { type: "string", enum: ["video", "article"] },
              url: { type: "string" },
            },
          },
        },
        commonFaults: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "symptom", "cause", "fix", "difficulty"],
            properties: {
              id: { type: "string" },
              symptom: { type: "string" },
              cause: { type: "string" },
              fix: { type: "string" },
              difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
            },
          },
        },
      },
    },
  },
} as const;

const SYSTEM = `You are the reconstruction engine for a visual dictionary of man-made objects.
Given a photo or an object name, identify the object and assemble an accurate,
sourced entry. Place part hotspots within a 400×260 coordinate space so they sit
over where the part would appear on a generic front view. Prefer information you
can attribute to a real source (manuals, manufacturer docs, teardown sites,
encyclopedias) and cite it. Every part needs a clear, plain-language function.`;

interface RecognizeBody {
  image?: string;
  query?: string;
}

async function runPipeline(body: RecognizeBody): Promise<unknown | null> {
  const userContent: Anthropic.ContentBlockParam[] = [];
  if (body.image) {
    userContent.push({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: body.image },
    });
    userContent.push({ type: "text", text: "Identify this object and build its dictionary entry." });
  } else if (body.query) {
    userContent.push({ type: "text", text: `Build the dictionary entry for: ${body.query}` });
  } else {
    return null;
  }

  // Stages 1–4: the model recognises, searches the web for manuals/labels/
  // patents, fetches the best sources, and emits the validated entry shape.
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    tools: [
      { type: "web_search_20260209", name: "web_search" },
      { type: "web_fetch_20260209", name: "web_fetch" },
    ],
    output_config: { format: { type: "json_schema", schema: ENTRY_SCHEMA } },
    messages: [{ role: "user", content: userContent }],
  });

  if (res.stop_reason === "refusal") return null; // dual-use object declined
  const text = res.content.find((b): b is Anthropic.TextBlock => b.type === "text")?.text;
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

createServer((req, res) => {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-headers", "content-type");
  if (req.method === "OPTIONS") return res.writeHead(204).end();
  if (req.method !== "POST" || !req.url?.endsWith("/recognize")) {
    return res.writeHead(404).end();
  }

  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", async () => {
    let entry: unknown | null = null;
    try {
      entry = await runPipeline(JSON.parse(raw || "{}") as RecognizeBody);
    } catch (err) {
      console.error("recognize failed:", err);
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(entry ? { status: "ready", entry } : { status: "not_found" }));
  });
}).listen(PORT, () => console.log(`visual-dictionary recognize proxy → http://localhost:${PORT}`));
