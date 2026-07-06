import { describe, expect, it } from "vitest";
import { parseDictionaryEntryData } from "./schema";

const valid = {
  id: "kettle",
  name: "Electric kettle",
  category: "Kitchen appliance",
  summary: "Boils water via an immersed heating element.",
  aliases: ["kettle", "electric kettle"],
  parts: [
    { id: "element", name: "Heating element", function: "Heats the water.", hotspot: { x: 200, y: 180 } },
  ],
  citations: [{ id: "w", title: "Kettle", source: "Wikipedia", url: "https://en.wikipedia.org/wiki/Kettle" }],
  repair: {
    manualUrl: "https://example.com/manual",
    tutorials: [{ id: "t", title: "Descale a kettle", source: "YouTube", kind: "video", url: "https://y.tld" }],
    commonFaults: [
      { id: "scale", symptom: "Slow to boil", cause: "Limescale", fix: "Descale it.", difficulty: "easy" },
    ],
  },
};

describe("parseDictionaryEntryData", () => {
  it("accepts a well-formed wire entry", () => {
    const out = parseDictionaryEntryData(valid);
    expect(out).not.toBeNull();
    expect(out?.id).toBe("kettle");
    expect(out?.parts).toHaveLength(1);
    expect(out?.repair?.tutorials[0].kind).toBe("video");
    expect(out?.repair?.commonFaults[0].difficulty).toBe("easy");
  });

  it("rejects non-objects and missing required fields", () => {
    expect(parseDictionaryEntryData(null)).toBeNull();
    expect(parseDictionaryEntryData("nope")).toBeNull();
    expect(parseDictionaryEntryData({ ...valid, name: "" })).toBeNull();
    expect(parseDictionaryEntryData({ ...valid, summary: undefined })).toBeNull();
  });

  it("requires at least one valid part", () => {
    expect(parseDictionaryEntryData({ ...valid, parts: [] })).toBeNull();
    // A part missing its hotspot is dropped, leaving zero → null.
    expect(
      parseDictionaryEntryData({ ...valid, parts: [{ id: "x", name: "X", function: "…" }] }),
    ).toBeNull();
  });

  it("coerces unknown enum values to safe defaults", () => {
    const out = parseDictionaryEntryData({
      ...valid,
      repair: {
        tutorials: [{ id: "t", title: "T", source: "S", url: "https://u.tld", kind: "podcast" }],
        commonFaults: [{ id: "f", symptom: "s", cause: "c", fix: "x", difficulty: "extreme" }],
      },
    });
    expect(out?.repair?.tutorials[0].kind).toBe("article");
    expect(out?.repair?.commonFaults[0].difficulty).toBe("medium");
  });

  it("drops invalid citations but keeps the entry", () => {
    const out = parseDictionaryEntryData({ ...valid, citations: [{ id: "bad" }, valid.citations[0]] });
    expect(out?.citations).toHaveLength(1);
  });
});
