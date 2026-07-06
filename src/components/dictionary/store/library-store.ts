import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DictionaryEntry } from "../types";

/** A lightweight, serialisable snapshot of an entry saved to the user's device. */
export interface SavedItem {
  id: string;
  name: string;
  category: string;
  savedAt: number;
}

interface LibraryState {
  items: SavedItem[];
  /** Save an entry to the personal library (no-op if already saved). */
  save: (entry: DictionaryEntry) => void;
  /** Remove a saved entry by id. */
  remove: (id: string) => void;
  /** Whether an entry id is already in the personal library. */
  has: (id: string) => boolean;
}

/**
 * The user's personal, on-device Visual Dictionary — "everything on my phone".
 * Persisted to localStorage so scanned objects survive reloads. This is the
 * private counterpart to the shared collective library (`dictionaryEntries`).
 */
export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      items: [],
      save: (entry) =>
        set((state) => {
          if (state.items.some((item) => item.id === entry.id)) {
            return state;
          }
          const saved: SavedItem = {
            id: entry.id,
            name: entry.name,
            category: entry.category,
            savedAt: Date.now(),
          };
          return { items: [saved, ...state.items] };
        }),
      remove: (id) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      has: (id) => get().items.some((item) => item.id === id),
    }),
    { name: "openclaw-dictionary-library" },
  ),
);
