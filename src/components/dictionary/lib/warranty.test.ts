import { describe, expect, it } from "vitest";
import { warrantyStatus } from "./warranty";

const JAN_2025 = Date.UTC(2025, 0, 1);

describe("warrantyStatus", () => {
  it("is unknown without a purchase date or length", () => {
    expect(warrantyStatus(undefined, JAN_2025).state).toBe("unknown");
    expect(warrantyStatus({ retailer: "Shop" }, JAN_2025).state).toBe("unknown");
    expect(warrantyStatus({ purchaseDate: "2024-01-01" }, JAN_2025).state).toBe("unknown");
    expect(
      warrantyStatus({ purchaseDate: "2024-01-01", warrantyMonths: 0 }, JAN_2025).state,
    ).toBe("unknown");
  });

  it("is unknown for a malformed date", () => {
    expect(
      warrantyStatus({ purchaseDate: "not-a-date", warrantyMonths: 12 }, JAN_2025).state,
    ).toBe("unknown");
  });

  it("is active before expiry and reports days remaining", () => {
    // Bought 2024-07-01, 24 months → expires 2026-07-01.
    const status = warrantyStatus(
      { purchaseDate: "2024-07-01", warrantyMonths: 24 },
      JAN_2025,
    );
    expect(status.state).toBe("active");
    expect(status.expiresAt).toBe(Date.UTC(2026, 6, 1));
    expect(status.daysRemaining).toBeGreaterThan(0);
  });

  it("is expired after the coverage window", () => {
    // Bought 2023-01-01, 12 months → expired 2024-01-01, before now (2025).
    const status = warrantyStatus(
      { purchaseDate: "2023-01-01", warrantyMonths: 12 },
      JAN_2025,
    );
    expect(status.state).toBe("expired");
    expect(status.daysRemaining).toBeLessThan(0);
  });
});
