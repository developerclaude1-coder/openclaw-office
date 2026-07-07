// export.js — build a PDF from a document's pages and share/download it.

import { buildPdf } from "./pdf.js";
import { toast, busy } from "./ui.js";

async function blobToImageBitmap(blob) {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(blob);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

async function pageToJpeg(page) {
  // Pages are already stored as JPEG; read dimensions and reuse bytes.
  const buf = new Uint8Array(await page.blob.arrayBuffer());
  return { jpeg: buf, width: page.width, height: page.height };
}

/**
 * Build a PDF Blob for a document.
 * @param {{name:string, pages:Array}} doc
 * @returns {Promise<Blob>}
 */
export async function documentToPdf(doc) {
  const pages = [];
  for (const page of doc.pages) {
    pages.push(await pageToJpeg(page));
  }
  return buildPdf(pages);
}

function safeName(name) {
  return (name || "Scan").replace(/[^\w\-]+/g, "_").slice(0, 60) + ".pdf";
}

/** Share the document as a PDF via Web Share, or download as a fallback. */
export async function sharePdf(doc) {
  const overlay = busy("Building PDF…");
  try {
    const blob = await documentToPdf(doc);
    const filename = safeName(doc.name);
    const file = new File([blob], filename, { type: "application/pdf" });
    overlay.remove();

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: doc.name });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
        // fall through to download
      }
    }
    downloadBlob(blob, filename);
    toast("PDF downloaded");
  } catch (err) {
    overlay.remove();
    console.error(err);
    toast("Could not build PDF");
  }
}

/** Download the PDF directly. */
export async function downloadPdf(doc) {
  const overlay = busy("Building PDF…");
  try {
    const blob = await documentToPdf(doc);
    overlay.remove();
    downloadBlob(blob, safeName(doc.name));
    toast("PDF downloaded");
  } catch (err) {
    overlay.remove();
    console.error(err);
    toast("Could not build PDF");
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
