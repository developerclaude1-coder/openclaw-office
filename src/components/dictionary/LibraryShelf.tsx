import { Library, Trash2, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { dictionaryEntries, getEntryById } from "./data";
import { useLibraryStore } from "./store/library-store";
import type { DictionaryEntry } from "./types";

interface LibraryShelfProps {
  onOpen: (entry: DictionaryEntry) => void;
}

/**
 * The two-sided library on the landing screen: the user's personal on-device
 * collection ("My Library") and the shared collective library that every
 * reconstructed object contributes to.
 */
export function LibraryShelf({ onOpen }: LibraryShelfProps) {
  const { t } = useTranslation("dictionary");
  const items = useLibraryStore((s) => s.items);
  const remove = useLibraryStore((s) => s.remove);
  const savedIds = new Set(items.map((i) => i.id));

  const myEntries = items
    .map((item) => getEntryById(item.id))
    .filter((entry): entry is DictionaryEntry => Boolean(entry));

  return (
    <div className="space-y-8">
      {myEntries.length > 0 && (
        <Shelf
          icon={<Library className="h-4 w-4 text-blue-500" />}
          title={t("library.myTitle")}
          subtitle={t("library.mySubtitle")}
        >
          {myEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              saved
              onOpen={() => onOpen(entry)}
              onRemove={() => remove(entry.id)}
              removeLabel={t("library.remove")}
            />
          ))}
        </Shelf>
      )}

      <Shelf
        icon={<Users className="h-4 w-4 text-gray-400" />}
        title={t("library.sharedTitle")}
        subtitle={t("library.sharedSubtitle")}
      >
        {dictionaryEntries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            saved={savedIds.has(entry.id)}
            onOpen={() => onOpen(entry)}
            savedLabel={t("library.saved")}
          />
        ))}
      </Shelf>
    </div>
  );
}

function Shelf({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-1 flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
      </div>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
    </section>
  );
}

function EntryCard({
  entry,
  saved,
  onOpen,
  onRemove,
  removeLabel,
  savedLabel,
}: {
  entry: DictionaryEntry;
  saved: boolean;
  onOpen: () => void;
  onRemove?: () => void;
  removeLabel?: string;
  savedLabel?: string;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-4 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/40 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
      >
        <entry.Illustration className="h-14 w-14 text-gray-600 dark:text-gray-300" />
        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{entry.name}</span>
        <span className="text-[11px] text-gray-400">{entry.category}</span>
      </button>
      {saved && savedLabel && (
        <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {savedLabel}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          title={removeLabel}
          className="absolute right-2 top-2 rounded-full bg-white/80 p-1 text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100 dark:bg-gray-900/80"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
