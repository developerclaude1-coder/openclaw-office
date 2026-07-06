import { useTranslation } from "react-i18next";
import type { DictionaryEntry, DictionaryPart } from "./types";

export type DiagramMode = "labeled" | "exploded";
export type RenderStyle = "technical" | "blueprint" | "sketch";

interface PartsDiagramProps {
  entry: DictionaryEntry;
  mode: DiagramMode;
  renderStyle: RenderStyle;
  selectedPartId: string | null;
  onSelectPart: (partId: string) => void;
}

/**
 * Renders the schematic illustration inside a themeable drawing frame. `mode`
 * switches between numbered markers and an exploded callout layout; `renderStyle`
 * re-skins the whole frame (clean technical, blue CAD blueprint, or pencil
 * sketch) via the `.dict-frame` token block in globals.css.
 */
export function PartsDiagram({
  entry,
  mode,
  renderStyle,
  selectedPartId,
  onSelectPart,
}: PartsDiagramProps) {
  const { t } = useTranslation("dictionary");
  const { Illustration } = entry;
  const exploded = mode === "exploded";
  const overlayViewBox = exploded ? explodedViewBox(entry.viewBox) : entry.viewBox;

  return (
    <div
      className="dict-frame relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700"
      data-style={renderStyle}
    >
      {/* Blueprint grid (shown only in blueprint style) */}
      <div className="dict-grid pointer-events-none absolute inset-0" />

      {/* Roughen filter used by the sketch style */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <filter id="dict-rough">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={7} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={2.2} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Stage: illustration + annotation overlay */}
      <div className="relative p-5">
        <div
          className="transition-transform duration-500"
          style={{ transform: exploded ? "scale(0.72)" : "scale(1)" }}
        >
          <Illustration className="dict-illo h-auto w-full" aria-hidden />
        </div>
        <svg
          viewBox={overlayViewBox}
          className="absolute inset-5 h-[calc(100%-2.5rem)] w-[calc(100%-2.5rem)]"
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

      {/* Drafting chrome: corner ticks + title block */}
      <div className="pointer-events-none absolute inset-2.5 opacity-60">
        <span className="dict-tick absolute left-0 top-0 h-2.5 w-2.5 border-l border-t" />
        <span className="dict-tick absolute right-0 top-0 h-2.5 w-2.5 border-r border-t" />
        <span className="dict-tick absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l" />
        <span className="dict-tick absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r" />
      </div>
      <div
        className="pointer-events-none absolute bottom-2.5 right-2.5 text-right font-mono text-[9px] uppercase leading-tight tracking-[0.1em] opacity-60"
        style={{ color: "var(--dict-ink)" }}
      >
        {entry.name}
        <br />
        {t("entry.figLabel")}
      </div>
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
      className={`dict-marker cursor-pointer ${selected ? "is-selected" : ""}`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={part.name}
      onClick={onSelect}
      onKeyDown={(e) => handleActivate(e, onSelect)}
    >
      {selected && (
        <circle r={16} className="dict-marker-halo">
          <animate attributeName="r" values="13;18;13" dur="1.6s" repeatCount="indefinite" />
        </circle>
      )}
      <circle r={12} className="dict-marker-c" />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        className="dict-marker-t select-none text-[13px] font-bold"
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

  return (
    <g
      className={`dict-callout cursor-pointer animate-[fadeIn_0.4s_ease] ${selected ? "is-selected" : ""}`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={part.name}
      onClick={onSelect}
      onKeyDown={(e) => handleActivate(e, onSelect)}
    >
      <polyline
        points={`${hx},${hy} ${badgeX + (anchor === "start" ? -12 : 12)},${labelY}`}
        className="dict-lead"
      />
      <circle cx={hx} cy={hy} r={3} className="dict-dot" />
      <circle cx={badgeX} cy={labelY} r={9} className="dict-badge-c" />
      <text
        x={badgeX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        className="dict-badge-t select-none text-[11px] font-bold"
      >
        {index}
      </text>
      <text
        x={textX}
        y={labelY}
        textAnchor={anchor}
        dominantBaseline="central"
        className="dict-lbl select-none text-[12px]"
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
