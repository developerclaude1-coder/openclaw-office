import type { ComponentType, SVGProps } from "react";

/**
 * A single labelled component of a man-made object. `hotspot` is expressed in
 * the same coordinate space as the entry's `viewBox`, so it can be overlaid as
 * an annotation marker on top of the schematic illustration.
 */
export interface DictionaryPart {
  /** Stable identifier, unique within an entry. */
  id: string;
  /** Human-readable part name (e.g. "Derailleur"). */
  name: string;
  /** What the part does — its function within the whole. */
  function: string;
  /** Typical material(s) the part is made from. */
  material?: string;
  /** Annotation anchor, in the entry viewBox coordinate space. */
  hotspot: { x: number; y: number };
}

/**
 * A Wikipedia-style reference: where a piece of information was sourced from.
 */
export interface DictionaryCitation {
  id: string;
  /** Title of the referenced work/page. */
  title: string;
  /** Publisher or source name (e.g. "Wikipedia", "Sheldon Brown"). */
  source: string;
  /** Canonical URL of the reference. */
  url: string;
}

/** A repair tutorial — a curated video or article that helps fix the object. */
export interface RepairTutorial {
  id: string;
  title: string;
  source: string;
  kind: "video" | "article";
  url: string;
}

/** A common failure of the object and how to address it. */
export interface CommonFault {
  id: string;
  /** Observable symptom (e.g. "Chain slips under load"). */
  symptom: string;
  /** Likely underlying cause. */
  cause: string;
  /** Suggested fix. */
  fix: string;
  difficulty: "easy" | "medium" | "hard";
}

/** Everything needed to maintain and repair an object. */
export interface RepairInfo {
  /** Link to an official/manufacturer manual, if known. */
  manualUrl?: string;
  tutorials: RepairTutorial[];
  commonFaults: CommonFault[];
}

/**
 * A full dictionary entry describing one man-made object: its schematic
 * illustration, its constituent parts, and the sources behind the information.
 */
export interface DictionaryEntry {
  /** Stable slug identifier (e.g. "bicycle"). */
  id: string;
  /** Display name. */
  name: string;
  /** Broad category (e.g. "Transport", "Horology"). */
  category: string;
  /** One-paragraph overview. */
  summary: string;
  /**
   * Alternate names / keywords used by the mock recognition to match a query
   * or an uploaded file name to this entry.
   */
  aliases: string[];
  /** Schematic line illustration; drawn with `currentColor` for theming. */
  Illustration: ComponentType<SVGProps<SVGSVGElement>>;
  /** SVG viewBox shared by the illustration and every part hotspot. */
  viewBox: string;
  parts: DictionaryPart[];
  citations: DictionaryCitation[];
  /** Maintenance/repair information — manual, tutorials, and common faults. */
  repair?: RepairInfo;
}

/**
 * A user-specific warranty record for an object saved to the personal library.
 * Warranty is personal (it depends on when *you* bought the item), so it lives
 * on the saved item rather than on the shared entry.
 */
export interface WarrantyRecord {
  /** Purchase date as an ISO `YYYY-MM-DD` string. */
  purchaseDate?: string;
  /** Where it was bought. */
  retailer?: string;
  /** Model / serial number. */
  serial?: string;
  /** Warranty length in months from the purchase date. */
  warrantyMonths?: number;
  notes?: string;
}
