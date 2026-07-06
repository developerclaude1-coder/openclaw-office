import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { warrantyStatus } from "./lib/warranty";
import { useLibraryStore } from "./store/library-store";
import type { DictionaryEntry, WarrantyRecord } from "./types";

interface WarrantyCardProps {
  entry: DictionaryEntry;
}

/**
 * Per-unit warranty tracker. Editing the form saves the entry to the personal
 * library (if needed) and attaches the warranty record, so "buy a fridge, take
 * a photo" leaves you with the coverage details on your device.
 */
export function WarrantyCard({ entry }: WarrantyCardProps) {
  const { t, i18n } = useTranslation("dictionary");
  const stored = useLibraryStore((s) => s.items.find((i) => i.id === entry.id)?.warranty);
  const setWarranty = useLibraryStore((s) => s.setWarranty);

  const [form, setForm] = useState<WarrantyRecord>(stored ?? {});
  const [saved, setSaved] = useState(false);

  const status = warrantyStatus(stored, Date.now());

  function update<K extends keyof WarrantyRecord>(key: K, value: WarrantyRecord[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    setWarranty(entry, form);
    setSaved(true);
  }

  return (
    <section aria-labelledby="dictionary-warranty-title">
      <div className="mb-2 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-gray-400" />
        <h3
          id="dictionary-warranty-title"
          className="text-sm font-semibold text-gray-800 dark:text-gray-100"
        >
          {t("warranty.title")}
        </h3>
      </div>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{t("warranty.hint")}</p>

      <StatusBanner status={status} record={stored} lang={i18n.language} />

      <div className="mt-3 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-2">
        <Field label={t("warranty.purchaseDate")}>
          <input
            type="date"
            value={form.purchaseDate ?? ""}
            onChange={(e) => update("purchaseDate", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label={t("warranty.warrantyMonths")}>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={form.warrantyMonths ?? ""}
            onChange={(e) =>
              update("warrantyMonths", e.target.value ? Number(e.target.value) : undefined)
            }
            className={inputClass}
          />
        </Field>
        <Field label={t("warranty.retailer")}>
          <input
            type="text"
            value={form.retailer ?? ""}
            onChange={(e) => update("retailer", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label={t("warranty.serial")}>
          <input
            type="text"
            value={form.serial ?? ""}
            onChange={(e) => update("serial", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label={t("warranty.notes")} full>
          <textarea
            rows={2}
            value={form.notes ?? ""}
            onChange={(e) => update("notes", e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </Field>
        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            {saved ? t("warranty.savedDetails") : t("warranty.saveDetails")}
          </button>
        </div>
      </div>
    </section>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100";

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function StatusBanner({
  status,
  record,
  lang,
}: {
  status: ReturnType<typeof warrantyStatus>;
  record: WarrantyRecord | undefined;
  lang: string;
}) {
  const { t } = useTranslation("dictionary");

  if (status.state === "unknown") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        <ShieldQuestion className="h-4 w-4 shrink-0" />
        {record ? t("warranty.statusIncomplete") : t("warranty.statusNone")}
      </div>
    );
  }

  const expires =
    status.expiresAt !== undefined
      ? new Date(status.expiresAt).toLocaleDateString(lang, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";

  if (status.state === "active") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-green-100 px-3 py-2 text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        {t("warranty.statusActive", { date: expires, days: status.daysRemaining })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl bg-red-100 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
      <ShieldAlert className="h-4 w-4 shrink-0" />
      {t("warranty.statusExpired", { date: expires })}
    </div>
  );
}
