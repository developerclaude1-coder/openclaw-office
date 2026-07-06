import { beforeEach, describe, expect, it } from "vitest";
import { bicycle } from "../data/bicycle";
import { watch } from "../data/watch";
import { useLibraryStore } from "./library-store";

function reset() {
  useLibraryStore.setState({ items: [] });
  localStorage.clear();
}

describe("library-store", () => {
  beforeEach(reset);

  it("saves an entry and reports it as present", () => {
    useLibraryStore.getState().save(bicycle);
    expect(useLibraryStore.getState().items).toHaveLength(1);
    expect(useLibraryStore.getState().has("bicycle")).toBe(true);
    expect(useLibraryStore.getState().items[0]).toMatchObject({
      id: "bicycle",
      name: bicycle.name,
      category: bicycle.category,
    });
  });

  it("does not save the same entry twice", () => {
    const { save } = useLibraryStore.getState();
    save(bicycle);
    save(bicycle);
    expect(useLibraryStore.getState().items).toHaveLength(1);
  });

  it("keeps most-recently-saved items first", () => {
    useLibraryStore.getState().save(bicycle);
    useLibraryStore.getState().save(watch);
    expect(useLibraryStore.getState().items.map((i) => i.id)).toEqual(["watch", "bicycle"]);
  });

  it("removes an entry", () => {
    const { save, remove } = useLibraryStore.getState();
    save(bicycle);
    save(watch);
    remove("bicycle");
    expect(useLibraryStore.getState().has("bicycle")).toBe(false);
    expect(useLibraryStore.getState().items).toHaveLength(1);
  });

  it("setWarranty saves the entry if it is not yet in the library", () => {
    useLibraryStore.getState().setWarranty(bicycle, { purchaseDate: "2025-01-01", warrantyMonths: 24 });
    expect(useLibraryStore.getState().has("bicycle")).toBe(true);
    expect(useLibraryStore.getState().getWarranty("bicycle")).toMatchObject({
      purchaseDate: "2025-01-01",
      warrantyMonths: 24,
    });
  });

  it("setWarranty merges into an existing saved item without duplicating it", () => {
    const { save, setWarranty } = useLibraryStore.getState();
    save(bicycle);
    setWarranty(bicycle, { retailer: "Local Shop" });
    setWarranty(bicycle, { warrantyMonths: 12 });
    expect(useLibraryStore.getState().items).toHaveLength(1);
    expect(useLibraryStore.getState().getWarranty("bicycle")).toMatchObject({
      retailer: "Local Shop",
      warrantyMonths: 12,
    });
  });
});
