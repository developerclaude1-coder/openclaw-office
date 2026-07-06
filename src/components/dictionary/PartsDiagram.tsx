import { useTranslation } from "react-i18next";
import type { DictionaryEntry, DictionaryPart } from "./types";

interface PartsDiagramProps {
  entry: DictionaryEntry;
  selectedPartId: string | null;
  onSelectPart: (partId: string) => void;
}

/**
 * Renders the schematic illustration with a numbered, clickable marker over
 * each part hotspot. Markers share the entry's viewBox so they line up with the
 * drawing at any size.
 */
export function PartsDiagram({ entry, selectedPartId, onSelectPart }: PartsDiagramProps) {
  const { t } = useTranslation("dictionary");
  const { Illustration, parts, viewBox } = entry;

  return (
    <div className="relative w-full">
      <Illustration
        className="h-auto w-full text-gray-700 dark:text-gray-200"
        aria-hidden
      />
      <svg
        viewBox={viewBox}
        className="absolute inset-0 h-full w-full"
        role="group"
        aria-label={t("entry.partsTitle")}
      >
        {parts.map((part, index) => (
          <PartMarker
            key={part.id}
            part={part}
            index={index + 1}
            selected={selectedPartId === part.id}
            onSelect={() => onSelectPart(part.id)}
          />
        ))}
      </svg>
    </div>
  );
}

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
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {selected && (
        <circle r={16} className="fill-blue-500/20 stroke-none">
          <animate
            attributeName="r"
            values="13;18;13"
            dur="1.6s"
            repeatCount="indefinite"
          />
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
