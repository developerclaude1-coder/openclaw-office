import { Grid3x3, Layers, Maximize2, PencilLine, Ruler, Tag } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { CitationsList } from "./CitationsList";
import { PartsDiagram, type DiagramMode, type RenderStyle } from "./PartsDiagram";
import { RepairPanel } from "./RepairPanel";
import { WarrantyCard } from "./WarrantyCard";
import type { DictionaryEntry } from "./types";

interface EntryViewProps {
  entry: DictionaryEntry;
}

/**
 * The full detail view for a recognised object: overview, an interactive parts
 * diagram wired to a selectable parts list, and a references section.
 */
export function EntryView({ entry }: EntryViewProps) {
  const { t } = useTranslation("dictionary");
  const [selectedPartId, setSelectedPartId] = useState<string | null>(
    entry.parts[0]?.id ?? null,
  );
  const [mode, setMode] = useState<DiagramMode>("labeled");
  const [renderStyle, setRenderStyle] = useState<RenderStyle>("technical");

  const selectedPart = entry.parts.find((p) => p.id === selectedPartId) ?? null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {entry.category}
        </span>
        <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          {entry.name}
        </h2>
      </header>

      {/* Overview */}
      <section aria-labelledby="dictionary-overview-title">
        <h3
          id="dictionary-overview-title"
          className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100"
        >
          {t("entry.summaryTitle")}
        </h3>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {entry.summary}
        </p>
      </section>

      {/* Parts diagram + list */}
      <section aria-labelledby="dictionary-parts-title">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-gray-400" />
            <h3
              id="dictionary-parts-title"
              className="text-sm font-semibold text-gray-800 dark:text-gray-100"
            >
              {t("entry.partsTitle")}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label={t("entry.viewModeLabel")}
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-700 dark:bg-gray-800"
            >
              <ModeButton
                active={mode === "labeled"}
                onClick={() => setMode("labeled")}
                icon={<Tag className="h-3.5 w-3.5" />}
                label={t("entry.modeLabeled")}
              />
              <ModeButton
                active={mode === "exploded"}
                onClick={() => setMode("exploded")}
                icon={<Maximize2 className="h-3.5 w-3.5" />}
                label={t("entry.modeExploded")}
              />
            </div>
            <div
              role="group"
              aria-label={t("entry.renderStyleLabel")}
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-700 dark:bg-gray-800"
            >
              <ModeButton
                active={renderStyle === "technical"}
                onClick={() => setRenderStyle("technical")}
                icon={<Ruler className="h-3.5 w-3.5" />}
                label={t("entry.styleTechnical")}
              />
              <ModeButton
                active={renderStyle === "blueprint"}
                onClick={() => setRenderStyle("blueprint")}
                icon={<Grid3x3 className="h-3.5 w-3.5" />}
                label={t("entry.styleBlueprint")}
              />
              <ModeButton
                active={renderStyle === "sketch"}
                onClick={() => setRenderStyle("sketch")}
                icon={<PencilLine className="h-3.5 w-3.5" />}
                label={t("entry.styleSketch")}
              />
            </div>
          </div>
        </div>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          {mode === "exploded" ? t("entry.explodedHint") : t("entry.partsHint")}
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Diagram (self-framing — style-aware) */}
          <PartsDiagram
            entry={entry}
            mode={mode}
            renderStyle={renderStyle}
            selectedPartId={selectedPartId}
            onSelectPart={setSelectedPartId}
          />

          {/* Parts list + detail */}
          <div className="flex flex-col gap-4">
            <ul className="flex flex-wrap gap-2">
              {entry.parts.map((part, index) => {
                const active = part.id === selectedPartId;
                return (
                  <li key={part.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedPartId(part.id)}
                      aria-pressed={active}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                          active
                            ? "bg-white/25 text-white"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {index + 1}
                      </span>
                      {part.name}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="min-h-[9rem] rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              {selectedPart ? (
                <div className="space-y-3">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                    {selectedPart.name}
                  </h4>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      {t("entry.functionLabel")}
                    </dt>
                    <dd className="mt-0.5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {selectedPart.function}
                    </dd>
                  </div>
                  {selectedPart.material && (
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        {t("entry.materialLabel")}
                      </dt>
                      <dd className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
                        {selectedPart.material}
                      </dd>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">{t("entry.selectPrompt")}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Repair & fixes */}
      {entry.repair && <RepairPanel repair={entry.repair} />}

      {/* Warranty tracker (personal) */}
      <WarrantyCard key={entry.id} entry={entry} />

      {/* Citations */}
      <CitationsList citations={entry.citations} />
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-300"
          : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
