import { useTranslation } from "react-i18next";
import type { DictionaryEntry, DictionaryPart } from "./types";

export type DiagramMode = "labeled" | "exploded";

interface PartsDiagramProps {
  entry: DictionaryEntry;
  mode: DiagramMode;
  selectedPartId: string | null;
  onSelectPart: (partId: string) => void;
}

/**
 * Renders the schematic illustration with part annotations in one of two modes:
 *
 * - `labeled`  — a numbered marker sits directly on each part hotspot.
 * - `exploded` — part names are moved out to the side gutters with leader lines
 *   drawn back to their hotspots, echoing an exploded parts diagram.
 */
export function PartsDiagram({ entry, mode, selectedPartId, onSelectPart }: PartsDiagramProps) {
  const { t } = useTranslation("dictionary");
  const { Illustration } = entry;
  const overlayViewBox = mode === "exploded" ? explodedViewBox(entry.viewBox) : entry.viewBox;

  return (
    <div className="relative w-full">
      <div
        className="transition-transform duration-500"
        style={{ transform: mode === "exploded" ? "scale(0.72)" : "scale(1)" }}
      >
        <Illustration
          className="h-auto w-full text-gray-700 dark:text-gray-200"
          aria-hidden
        />
      </div>
      <svg
        viewBox={overlayViewBox}
        className="absolute inset-0 h-full w-full"
        role="group"
        aria-label={t("entry.partsTitle")}
      >
        {mode === "labeled"
          ? entry.parts.map((part, index) => (
              <PartMarker
                key={part.id}
                part={part}
                index={index + 1}
                selected={selectedPartId === part.id}
                onSelect={() => onSelectPart(part.id)}
              />
            ))
          : buildCallouts(entry).map((callout) => (
              <PartCallout
                key={callout.part.id}
                callout={callout}
                selected={selectedPartId === callout.part.id}
                onSelect={() => onSelectPart(callout.part.id)}
              />
            ))}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ markers */

interface PartMarkerProps {
  part: DictionaryPart;
  index: number;
  selected: boolean;
  onSelect: () => void;
}

function PartMarker({ part, index, selected, onSelect }: PartMarkerProps) {
  const { x, y } = part.hotspot;
  return (
    <g
      transform={`translate(${x} ${y})`}
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={part.name}
      onClick={onSelect}
      onKeyDown={(e) => handleActivate(e, onSelect)}
    >
      {selected && (
        <circle r={16} className="fill-blue-500/20 stroke-none">
          <animate attributeName="r" values="13;18;13" dur="1.6s" repeatCount="indefinite" />
        </circle>
      )}
      <circle
        r={12}
        className={
          selected
            ? "fill-blue-600 stroke-white"
            : "fill-white stroke-blue-600 hover:fill-blue-50 dark:fill-gray-800 dark:hover:fill-gray-700"
        }
        strokeWidth={2}
      />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        className={`select-none text-[13px] font-bold ${
          selected ? "fill-white" : "fill-blue-600 dark:fill-blue-300"
        }`}
      >
        {index}
      </text>
    </g>
  );
}

/* ----------------------------------------------------------------- callouts */

interface Callout {
  part: DictionaryPart;
  index: number;
  side: "left" | "right";
  labelY: number;
  badgeX: number;
  textX: number;
  anchor: "start" | "end";
}

function PartCallout({
  callout,
  selected,
  onSelect,
}: {
  callout: Callout;
  selected: boolean;
  onSelect: () => void;
}) {
  const { part, index, labelY, badgeX, textX, anchor } = callout;
  const { x: hx, y: hy } = part.hotspot;
  const leaderColor = selected ? "stroke-blue-500" : "stroke-gray-300 dark:stroke-gray-600";

  return (
    <g
      className="cursor-pointer animate-[fadeIn_0.4s_ease]"
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={part.name}
      onClick={onSelect}
      onKeyDown={(e) => handleActivate(e, onSelect)}
    >
      <polyline
        points={`${hx},${hy} ${badgeX + (anchor === "start" ? -12 : 12)},${labelY}`}
        className={`fill-none ${leaderColor}`}
        strokeWidth={1.4}
      />
      <circle cx={hx} cy={hy} r={3} className={selected ? "fill-blue-500" : "fill-gray-400"} />
      <circle
        cx={badgeX}
        cy={labelY}
        r={9}
        className={
          selected
            ? "fill-blue-600 stroke-white"
            : "fill-white stroke-blue-500 dark:fill-gray-800"
        }
        strokeWidth={1.6}
      />
      <text
        x={badgeX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        className={`select-none text-[11px] font-bold ${
          selected ? "fill-white" : "fill-blue-600 dark:fill-blue-300"
        }`}
      >
        {index}
      </text>
      <text
        x={textX}
        y={labelY}
        textAnchor={anchor}
        dominantBaseline="central"
        className={`select-none text-[12px] ${
          selected
            ? "fill-gray-900 font-semibold dark:fill-white"
            : "fill-gray-600 dark:fill-gray-300"
        }`}
      >
        {part.name}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ helpers */

const H_PAD = 170;
const V_PAD = 12;

function parseViewBox(viewBox: string): [number, number, number, number] {
  const [x, y, w, h] = viewBox.split(/\s+/).map(Number);
  return [x, y, w, h];
}

function explodedViewBox(viewBox: string): string {
  const [x, y, w, h] = parseViewBox(viewBox);
  return `${x - H_PAD} ${y - V_PAD} ${w + 2 * H_PAD} ${h + 2 * V_PAD}`;
}

/**
 * Lay part names out into left/right gutters, sorted vertically and spread
 * evenly, with a leader line back to each hotspot.
 */
function buildCallouts(entry: DictionaryEntry): Callout[] {
  const [x0, y0, w, h] = parseViewBox(entry.viewBox);
  const centerX = x0 + w / 2;

  const indexed = entry.parts.map((part, index) => ({ part, index: index + 1 }));
  const left = indexed.filter((p) => p.part.hotspot.x < centerX);
  const right = indexed.filter((p) => p.part.hotspot.x >= centerX);

  const place = (group: typeof indexed, side: "left" | "right"): Callout[] => {
    const top = y0 + 14;
    const usable = h - 28;
    return group
      .slice()
      .sort((a, b) => a.part.hotspot.y - b.part.hotspot.y)
      .map((item, i) => {
        const labelY = group.length === 1 ? y0 + h / 2 : top + (usable * i) / (group.length - 1);
        const badgeX = side === "left" ? x0 - 22 : x0 + w + 22;
        const textX = side === "left" ? badgeX - 16 : badgeX + 16;
        return {
          part: item.part,
          index: item.index,
          side,
          labelY,
          badgeX,
          textX,
          anchor: side === "left" ? "end" : "start",
        };
      });
  };

  return [...place(left, "left"), ...place(right, "right")];
}

function handleActivate(e: { key: string; preventDefault: () => void }, onSelect: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    onSelect();
  }
}
