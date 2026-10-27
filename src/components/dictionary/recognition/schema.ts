import type {
  CommonFault,
  DictionaryCitation,
  DictionaryEntry,
  DictionaryPart,
  RepairInfo,
  RepairTutorial,
} from "../types";

/**
 * The wire shape of a dictionary entry as produced by the recognition backend.
 * Identical to {@link DictionaryEntry} minus `Illustration` (a React component
 * can't cross the network) and `viewBox` (the generic renderer supplies one).
 * A concrete illustration is attached client-side by the recognition provider.
 */
export type DictionaryEntryData = Omit<DictionaryEntry, "Illustration" | "viewBox">;

/* ----------------------------------------------------------- validators --- */
/* Hand-written (no schema dependency) so the wire payload is validated before
 * it is ever rendered — the frontend never trusts backend JSON blindly. */

function isString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function parsePart(v: unknown): DictionaryPart | null {
  if (!isRecord(v)) return null;
  const hotspot = v.hotspot;
  if (!isRecord(hotspot) || typeof hotspot.x !== "number" || typeof hotspot.y !== "number") {
    return null;
  }
  if (!isString(v.id) || !isString(v.name) || !isString(v.function)) return null;
  return {
    id: v.id,
    name: v.name,
    function: v.function,
    material: isString(v.material) ? v.material : undefined,
    hotspot: { x: hotspot.x, y: hotspot.y },
  };
}

function parseCitation(v: unknown): DictionaryCitation | null {
  if (!isRecord(v)) return null;
  if (!isString(v.id) || !isString(v.title) || !isString(v.source) || !isString(v.url)) return null;
  return { id: v.id, title: v.title, source: v.source, url: v.url };
}

function parseTutorial(v: unknown): RepairTutorial | null {
  if (!isRecord(v)) return null;
  if (!isString(v.id) || !isString(v.title) || !isString(v.source) || !isString(v.url)) return null;
  const kind = v.kind === "video" || v.kind === "article" ? v.kind : "article";
  return { id: v.id, title: v.title, source: v.source, url: v.url, kind };
}

function parseFault(v: unknown): CommonFault | null {
  if (!isRecord(v)) return null;
  if (!isString(v.id) || !isString(v.symptom) || !isString(v.cause) || !isString(v.fix)) return null;
  const difficulty =
    v.difficulty === "easy" || v.difficulty === "medium" || v.difficulty === "hard"
      ? v.difficulty
      : "medium";
  return { id: v.id, symptom: v.symptom, cause: v.cause, fix: v.fix, difficulty };
}

function parseRepair(v: unknown): RepairInfo | undefined {
  if (!isRecord(v)) return undefined;
  return {
    manualUrl: isString(v.manualUrl) ? v.manualUrl : undefined,
    tutorials: asArray(v.tutorials).map(parseTutorial).filter(Boolean) as RepairTutorial[],
    commonFaults: asArray(v.commonFaults).map(parseFault).filter(Boolean) as CommonFault[],
  };
}

/**
 * Validate an untrusted backend payload into a {@link DictionaryEntryData}, or
 * return null if it is malformed or missing required fields (an entry needs at
 * least one part to be renderable).
 */
export function parseDictionaryEntryData(v: unknown): DictionaryEntryData | null {
  if (!isRecord(v)) return null;
  if (!isString(v.id) || !isString(v.name) || !isString(v.category) || !isString(v.summary)) {
    return null;
  }
  const parts = asArray(v.parts).map(parsePart).filter(Boolean) as DictionaryPart[];
  if (parts.length === 0) return null;
  const citations = asArray(v.citations).map(parseCitation).filter(Boolean) as DictionaryCitation[];
  const aliases = asArray(v.aliases).filter(isString) as string[];

  return {
    id: v.id,
    name: v.name,
    category: v.category,
    summary: v.summary,
    aliases,
    parts,
    citations,
    repair: parseRepair(v.repair),
  };
}
