import { ImagePlus, Loader2, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { dictionaryEntries } from "./data";
import { recognitionProvider } from "./recognition/provider";
import type { DictionaryEntry } from "./types";

/** Show the "analysing" state for at least this long so it doesn't flash. */
const MIN_ANALYSE_MS = 1100;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface PhotoUploadProps {
  /** Called once the mock recognition resolves an object, with a preview URL. */
  onRecognized: (entry: DictionaryEntry, previewUrl: string | null) => void;
}

/**
 * Entry point of the Visual Dictionary: a photo dropzone plus a name lookup.
 * Recognition is simulated (see lib/match) with a short "analysing" delay so
 * the flow mirrors a real vision pipeline.
 */
export function PhotoUpload({ onRecognized }: PhotoUploadProps) {
  const { t } = useTranslation("dictionary");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [query, setQuery] = useState("");
  const [notFound, setNotFound] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function handleFile(file: File) {
    setNotFound(false);
    setAnalyzing(true);
    const previewUrl = URL.createObjectURL(file);
    // Recognise via the active provider (offline mock or live proxy), holding
    // the "analysing" state for a minimum so the transition reads cleanly.
    const [entry] = await Promise.all([
      recognitionProvider.recognizeImage(file),
      delay(MIN_ANALYSE_MS),
    ]);
    if (!mountedRef.current) {
      URL.revokeObjectURL(previewUrl);
      return;
    }
    setAnalyzing(false);
    if (entry) {
      onRecognized(entry, previewUrl);
    } else {
      URL.revokeObjectURL(previewUrl);
      setNotFound(true);
    }
  }

  async function handleLookup() {
    const entry = await recognitionProvider.lookup(query);
    if (!mountedRef.current) {
      return;
    }
    if (entry) {
      setNotFound(false);
      onRecognized(entry, null);
    } else {
      setNotFound(true);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Dropzone */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) {
            void handleFile(file);
          }
        }}
        disabled={analyzing}
        className={`flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
            : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/40 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-blue-500"
        } ${analyzing ? "cursor-wait opacity-70" : "cursor-pointer"}`}
      >
        {analyzing ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {t("upload.analyzing")}
            </span>
          </>
        ) : (
          <>
            <ImagePlus className="h-10 w-10 text-blue-500" />
            <span className="text-base font-semibold text-gray-800 dark:text-gray-100">
              {t("upload.dropTitle")}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t("upload.dropHint")}
            </span>
          </>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            void handleFile(file);
          }
          e.target.value = "";
        }}
      />

      {/* Name lookup */}
      <div>
        <label
          htmlFor="dictionary-lookup"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {t("upload.searchLabel")}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="dictionary-lookup"
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setNotFound(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleLookup();
                }
              }}
              placeholder={t("upload.searchPlaceholder")}
              className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleLookup()}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            {t("upload.searchButton")}
          </button>
        </div>
        {notFound && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            {t("upload.noMatch")}
          </p>
        )}
      </div>

      {/* Samples */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          {t("upload.samplesTitle")}
        </p>
        <div className="flex flex-wrap gap-2">
          {dictionaryEntries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => onRecognized(entry, null)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-blue-500"
            >
              <entry.Illustration className="h-6 w-6 text-gray-500 dark:text-gray-300" />
              {entry.name}
            </button>
          ))}
        </div>
      </div>

      <p className="rounded-xl bg-gray-50 px-3 py-2 text-center text-[11px] leading-relaxed text-gray-400 dark:bg-gray-800/60 dark:text-gray-500">
        {t("upload.mockNotice")}
      </p>
    </div>
  );
}
