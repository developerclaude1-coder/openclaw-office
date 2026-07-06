import { ArrowLeft, BookOpen, Check, Plus, ScanSearch } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { EntryView } from "@/components/dictionary/EntryView";
import { LibraryShelf } from "@/components/dictionary/LibraryShelf";
import { PhotoUpload } from "@/components/dictionary/PhotoUpload";
import { useLibraryStore } from "@/components/dictionary/store/library-store";
import type { DictionaryEntry } from "@/components/dictionary/types";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

interface Recognition {
  entry: DictionaryEntry;
  previewUrl: string | null;
}

/**
 * Standalone Visual Dictionary route (`/dictionary`). Photograph or look up a
 * man-made object and explore its labelled parts diagram and references.
 */
export function DictionaryPage() {
  const { t } = useTranslation("dictionary");
  const [recognition, setRecognition] = useState<Recognition | null>(null);
  const saveToLibrary = useLibraryStore((s) => s.save);
  const removeFromLibrary = useLibraryStore((s) => s.remove);
  const savedIds = useLibraryStore((s) => s.items);
  const isSaved = recognition ? savedIds.some((i) => i.id === recognition.entry.id) : false;

  function handleRecognized(entry: DictionaryEntry, previewUrl: string | null) {
    setRecognition((prev) => {
      if (prev?.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return { entry, previewUrl };
    });
  }

  function handleReset() {
    setRecognition((prev) => {
      if (prev?.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return null;
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span className="text-base font-bold">{t("title")}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link
              to="/"
              className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            >
              OpenClaw Office
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {recognition ? (
          <div className="space-y-6">
            {/* Recognised banner */}
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {recognition.previewUrl ? (
                  <img
                    src={recognition.previewUrl}
                    alt={recognition.entry.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                    <recognition.entry.Illustration className="h-10 w-10 text-gray-500 dark:text-gray-300" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                    <ScanSearch className="h-3.5 w-3.5" />
                    {t("upload.recognizedAs")}
                  </div>
                  <div className="text-lg font-bold">{recognition.entry.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() =>
                    isSaved
                      ? removeFromLibrary(recognition.entry.id)
                      : saveToLibrary(recognition.entry)
                  }
                  aria-pressed={isSaved}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    isSaved
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500"
                  }`}
                >
                  {isSaved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {isSaved ? t("library.saved") : t("library.save")}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("backToScan")}
                </button>
              </div>
            </div>

            <EntryView entry={recognition.entry} />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold">{t("title")}</h1>
              <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500 dark:text-gray-400">
                {t("tagline")}
              </p>
            </div>
            <PhotoUpload onRecognized={handleRecognized} />
            <LibraryShelf onOpen={(entry) => handleRecognized(entry, null)} />
          </div>
        )}
      </main>
    </div>
  );
}
