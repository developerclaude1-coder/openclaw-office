import { describe, expect, it } from "vitest";
import { dictionaryEntries } from "../data";
import { deterministicIndex, matchEntry, recognizeFromFileName } from "./match";

describe("matchEntry", () => {
  it("matches an entry by its exact name", () => {
    expect(matchEntry("bicycle", dictionaryEntries)?.id).toBe("bicycle");
    expect(matchEntry("hammer", dictionaryEntries)?.id).toBe("hammer");
  });

  it("matches by alias regardless of case and punctuation", () => {
    expect(matchEntry("BIKE", dictionaryEntries)?.id).toBe("bicycle");
    expect(matchEntry("wrist-watch", dictionaryEntries)?.id).toBe("watch");
  });

  it("matches when an alias appears inside a longer query (e.g. a file name)", () => {
    expect(matchEntry("my_red_bike_photo.jpg", dictionaryEntries)?.id).toBe("bicycle");
    expect(matchEntry("IMG_2043 claw hammer.png", dictionaryEntries)?.id).toBe("hammer");
  });

  it("returns null when nothing matches", () => {
    expect(matchEntry("banana", dictionaryEntries)).toBeNull();
    expect(matchEntry("   ", dictionaryEntries)).toBeNull();
  });

  it("prefers the longest / most specific alias when several match", () => {
    // "claw hammer" (11 chars) should beat the bare "hammer" alias.
    expect(matchEntry("claw hammer", dictionaryEntries)?.id).toBe("hammer");
  });
});

describe("deterministicIndex", () => {
  it("is stable for the same seed", () => {
    expect(deterministicIndex("photo.jpg", 3)).toBe(deterministicIndex("photo.jpg", 3));
  });

  it("stays within bounds and handles empty ranges", () => {
    for (const seed of ["a", "abcdef", "IMG_9999.heic", ""]) {
      const idx = deterministicIndex(seed, dictionaryEntries.length);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(dictionaryEntries.length);
    }
    expect(deterministicIndex("x", 0)).toBe(0);
  });
});

describe("recognizeFromFileName", () => {
  it("uses a keyword match when the file name contains one", () => {
    expect(recognizeFromFileName("vintage-bicycle.jpg", dictionaryEntries)?.id).toBe("bicycle");
  });

  it("always returns an entry for an unrecognised file name (deterministic fallback)", () => {
    const first = recognizeFromFileName("DSC_0001.jpg", dictionaryEntries);
    const second = recognizeFromFileName("DSC_0001.jpg", dictionaryEntries);
    expect(first).not.toBeNull();
    expect(first?.id).toBe(second?.id);
  });

  it("returns null only when there are no entries at all", () => {
    expect(recognizeFromFileName("anything.jpg", [])).toBeNull();
  });
});
