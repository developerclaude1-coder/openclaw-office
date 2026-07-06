import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DictionaryEntry, WarrantyRecord } from "../types";

/** A lightweight, serialisable snapshot of an entry saved to the user's device. */
export interface SavedItem {
  id: string;
  name: string;
  category: string;
  savedAt: number;
  /** Personal warranty details for this specific unit, if the user filled them in. */
  warranty?: WarrantyRecord;
}

interface LibraryState {
  items: SavedItem[];
  /** Save an entry to the personal library (no-op if already saved). */
  save: (entry: DictionaryEntry) => void;
  /** Remove a saved entry by id. */
  remove: (id: string) => void;
  /** Whether an entry id is already in the personal library. */
  has: (id: string) => boolean;
  /**
   * Attach/merge warranty details to an item, saving the entry first if it is
   * not yet in the personal library.
   */
  setWarranty: (entry: DictionaryEntry, warranty: WarrantyRecord) => void;
  /** Read the warranty record for a saved item, if any. */
  getWarranty: (id: string) => WarrantyRecord | undefined;
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
      setWarranty: (entry, warranty) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === entry.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === entry.id
                  ? { ...item, warranty: { ...item.warranty, ...warranty } }
                  : item,
              ),
            };
          }
          const saved: SavedItem = {
            id: entry.id,
            name: entry.name,
            category: entry.category,
            savedAt: Date.now(),
            warranty,
          };
          return { items: [saved, ...state.items] };
        }),
      getWarranty: (id) => get().items.find((item) => item.id === id)?.warranty,
    }),
    { name: "openclaw-dictionary-library" },
  ),
);
