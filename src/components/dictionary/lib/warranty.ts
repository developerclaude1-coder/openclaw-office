import type { WarrantyRecord } from "../types";

export type WarrantyState = "unknown" | "active" | "expired";

export interface WarrantyStatus {
  state: WarrantyState;
  /** Expiry timestamp (ms) when it can be computed. */
  expiresAt?: number;
  /** Whole days remaining until expiry (negative if expired). */
  daysRemaining?: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Add `months` calendar months to an ISO `YYYY-MM-DD` date, returning ms. */
function addMonths(purchaseDate: string, months: number): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(purchaseDate.trim());
  if (!match) {
    return null;
  }
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.getTime();
}

/**
 * Derive warranty status from a record. Returns `unknown` unless both a valid
 * purchase date and a positive warranty length are present. `now` is injected
 * so the result is deterministic and testable.
 */
export function warrantyStatus(
  record: WarrantyRecord | undefined,
  now: number,
): WarrantyStatus {
  if (!record?.purchaseDate || !record.warrantyMonths || record.warrantyMonths <= 0) {
    return { state: "unknown" };
  }
  const expiresAt = addMonths(record.purchaseDate, record.warrantyMonths);
  if (expiresAt === null) {
    return { state: "unknown" };
  }
  const daysRemaining = Math.ceil((expiresAt - now) / MS_PER_DAY);
  return {
    state: now <= expiresAt ? "active" : "expired",
    expiresAt,
    daysRemaining,
  };
}
