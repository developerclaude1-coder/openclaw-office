import { BookOpen, ExternalLink, FileText, PlayCircle, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CommonFault, RepairInfo } from "./types";

interface RepairPanelProps {
  repair: RepairInfo;
}

/** Repair hub: manufacturer manual, curated tutorials, and common faults. */
export function RepairPanel({ repair }: RepairPanelProps) {
  const { t } = useTranslation("dictionary");

  return (
    <section aria-labelledby="dictionary-repair-title">
      <div className="mb-2 flex items-center gap-2">
        <Wrench className="h-4 w-4 text-gray-400" />
        <h3
          id="dictionary-repair-title"
          className="text-sm font-semibold text-gray-800 dark:text-gray-100"
        >
          {t("repair.title")}
        </h3>
      </div>
      <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">{t("repair.hint")}</p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Manual + tutorials */}
        <div className="space-y-2">
          {repair.manualUrl && (
            <a
              href={repair.manualUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 transition-colors hover:border-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
            >
              <BookOpen className="h-5 w-5 shrink-0 text-blue-500" />
              <span className="min-w-0 flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">
                {t("repair.manual")}
              </span>
              <ExternalLink className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-blue-500" />
            </a>
          )}
          {repair.tutorials.map((tut) => (
            <a
              key={tut.id}
              href={tut.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 transition-colors hover:border-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
            >
              {tut.kind === "video" ? (
                <PlayCircle className="h-5 w-5 shrink-0 text-red-500" />
              ) : (
                <FileText className="h-5 w-5 shrink-0 text-gray-400" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                  {tut.title}
                </span>
                <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                  {tut.source}
                </span>
              </span>
              <ExternalLink className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-blue-500" />
            </a>
          ))}
        </div>

        {/* Common faults */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {t("repair.commonFaults")}
          </h4>
          <ul className="space-y-2">
            {repair.commonFaults.map((fault) => (
              <FaultRow key={fault.id} fault={fault} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const DIFFICULTY_STYLE: Record<CommonFault["difficulty"], string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  hard: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

function FaultRow({ fault }: { fault: CommonFault }) {
  const { t } = useTranslation("dictionary");
  return (
    <li className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{fault.symptom}</p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${DIFFICULTY_STYLE[fault.difficulty]}`}
        >
          {t(`repair.difficulty.${fault.difficulty}`)}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        <span className="font-semibold">{t("repair.cause")}:</span> {fault.cause}
      </p>
      <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
        <span className="font-semibold">{t("repair.fix")}:</span> {fault.fix}
      </p>
    </li>
  );
}
