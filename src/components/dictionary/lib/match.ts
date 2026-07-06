import type { DictionaryEntry } from "../types";

/**
 * Mock "AI recognition". Until a real vision backend is wired in, we resolve an
 * uploaded photo (by file name) or a typed query to a dictionary entry using
 * keyword matching, falling back to a deterministic pick so every upload
 * returns a plausible, reproducible result.
 */

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Find the best entry for a free-text query (an object name or a file name).
 * Returns null when nothing matches — the caller decides how to fall back.
 */
export function matchEntry(
  query: string,
  entries: readonly DictionaryEntry[],
): DictionaryEntry | null {
  const q = normalize(query);
  if (!q) {
    return null;
  }

  let best: DictionaryEntry | null = null;
  let bestScore = 0;

  for (const entry of entries) {
    const candidates = [entry.name, entry.id, ...entry.aliases];
    let score = 0;
    for (const candidate of candidates) {
      const c = normalize(candidate);
      if (!c) {
        continue;
      }
      // Whole query is an alias, or an alias appears inside the query
      // (e.g. file name "my_red_bike.jpg" contains "bike").
      if (q === c) {
        score = Math.max(score, 100 + c.length);
      } else if (q.includes(c) || c.includes(q)) {
        score = Math.max(score, 40 + Math.min(c.length, q.length));
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return best;
}

/**
 * Deterministically derive a stable index from an arbitrary seed string, so the
 * same file name always "recognises" as the same object without using
 * Math.random (which would flicker between renders).
 */
export function deterministicIndex(seed: string, length: number): number {
  if (length <= 0) {
    return 0;
  }
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % length;
}

/**
 * Resolve an uploaded file name to an entry: prefer a keyword match, otherwise
 * fall back to a deterministic pick so the demo always returns something.
 */
export function recognizeFromFileName(
  fileName: string,
  entries: readonly DictionaryEntry[],
): DictionaryEntry | null {
  if (entries.length === 0) {
    return null;
  }
  const matched = matchEntry(fileName, entries);
  if (matched) {
    return matched;
  }
  return entries[deterministicIndex(fileName, entries.length)];
}
