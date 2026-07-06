import { dictionaryEntries } from "../data";
import { matchEntry, recognizeFromFileName } from "../lib/match";
import type { DictionaryEntry } from "../types";
import { GenericIllustration } from "./generic-illustration";
import { type DictionaryEntryData, parseDictionaryEntryData } from "./schema";

/**
 * Resolves a photo or a typed query to a full {@link DictionaryEntry}. The mock
 * implementation uses the offline sample library; the API implementation calls
 * the recognition proxy (see `server/recognize.ts`) and validates its response.
 * Selection is driven by `VITE_DICTIONARY_API_URL` — this is the single seam
 * between the demo and a real vision backend.
 */
export interface RecognitionProvider {
  /** Resolve an uploaded image to an entry, or null if unrecognised. */
  recognizeImage(file: File): Promise<DictionaryEntry | null>;
  /** Resolve a typed name query to an entry, or null if not found. */
  lookup(query: string): Promise<DictionaryEntry | null>;
  /** Whether this provider talks to a real backend (vs. the offline library). */
  readonly isLive: boolean;
}

/** Attach a client-side illustration to a validated wire entry. */
function hydrateEntry(data: DictionaryEntryData): DictionaryEntry {
  return { ...data, viewBox: "0 0 400 260", Illustration: GenericIllustration };
}

class MockProvider implements RecognitionProvider {
  readonly isLive = false;

  async recognizeImage(file: File): Promise<DictionaryEntry | null> {
    return recognizeFromFileName(file.name, dictionaryEntries);
  }

  async lookup(query: string): Promise<DictionaryEntry | null> {
    return matchEntry(query, dictionaryEntries);
  }
}

class ApiProvider implements RecognitionProvider {
  readonly isLive = true;

  constructor(private readonly baseUrl: string) {}

  async recognizeImage(file: File): Promise<DictionaryEntry | null> {
    const image = await fileToBase64(file);
    return this.post({ image });
  }

  async lookup(query: string): Promise<DictionaryEntry | null> {
    return this.post({ query });
  }

  private async post(body: Record<string, unknown>): Promise<DictionaryEntry | null> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl.replace(/\/$/, "")}/recognize`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      return null;
    }
    if (!res.ok) return null;
    const json: unknown = await res.json().catch(() => null);
    const entry = (json as { entry?: unknown } | null)?.entry;
    const data = parseDictionaryEntryData(entry);
    return data ? hydrateEntry(data) : null;
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      // Strip the data:...;base64, prefix — send the raw base64 payload.
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const apiUrl = import.meta.env.VITE_DICTIONARY_API_URL;

/** The active recognition provider for this build. */
export const recognitionProvider: RecognitionProvider = apiUrl
  ? new ApiProvider(apiUrl)
  : new MockProvider();
