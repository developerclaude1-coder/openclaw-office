import { BookMarked, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DictionaryCitation } from "./types";

interface CitationsListProps {
  citations: DictionaryCitation[];
}

/** Wikipedia-style reference list: numbered sources with outbound links. */
export function CitationsList({ citations }: CitationsListProps) {
  const { t } = useTranslation("dictionary");

  return (
    <section aria-labelledby="dictionary-citations-title">
      <div className="mb-2 flex items-center gap-2">
        <BookMarked className="h-4 w-4 text-gray-400" />
        <h3
          id="dictionary-citations-title"
          className="text-sm font-semibold text-gray-800 dark:text-gray-100"
        >
          {t("entry.citationsTitle")}
        </h3>
      </div>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        {t("entry.citationsHint")}
      </p>
      <ol className="space-y-2">
        {citations.map((citation, index) => (
          <li key={citation.id}>
            <a
              href={citation.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 transition-colors hover:border-blue-400 hover:bg-blue-50/50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                  {citation.title}
                </span>
                <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                  {t("entry.citationsSource")}: {citation.source}
                </span>
              </span>
              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-blue-500" />
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
