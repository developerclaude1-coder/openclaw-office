import type { DictionaryEntry } from "../types";
import { bicycle } from "./bicycle";
import { hammer } from "./hammer";
import { watch } from "./watch";

/** All dictionary entries available to the mock recognition and search. */
export const dictionaryEntries: DictionaryEntry[] = [bicycle, watch, hammer];

export function getEntryById(id: string): DictionaryEntry | undefined {
  return dictionaryEntries.find((entry) => entry.id === id);
}
