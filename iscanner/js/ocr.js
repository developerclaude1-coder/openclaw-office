// ocr.js — extract text from a scanned page.
// The recognition engine (Tesseract.js) is loaded lazily from a CDN the first
// time OCR is used, so it doesn't bloat the offline app shell. Requires a
// network connection for that first load; the result then works fully offline.

import { toast, escapeHtml, busy } from "./ui.js";

const TESSERACT_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
let loaderPromise = null;

function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = TESSERACT_URL;
    s.onload = () => resolve(window.Tesseract);
    s.onerror = () => reject(new Error("load failed"));
    document.head.appendChild(s);
  });
  return loaderPromise;
}

/**
 * Recognize text in a page and show it in a sheet with copy/share.
 * @param {Blob} pageBlob
 */
export async function extractText(pageBlob) {
  let Tesseract;
  const overlay = busy("Loading text engine…");
  try {
    Tesseract = await loadTesseract();
  } catch {
    overlay.remove();
    toast("Text engine needs a connection the first time");
    return;
  }

  overlay.querySelector("div:last-child").textContent = "Recognizing text…";
  let text = "";
  try {
    const url = URL.createObjectURL(pageBlob);
    const { data } = await Tesseract.recognize(url, "eng");
    URL.revokeObjectURL(url);
    text = (data.text || "").trim();
  } catch {
    overlay.remove();
    toast("Could not recognize text");
    return;
  }
  overlay.remove();

  if (!text) {
    toast("No text found on this page");
    return;
  }
  showTextSheet(text);
}

function showTextSheet(text) {
  const backdrop = document.createElement("div");
  backdrop.className = "sheet-backdrop";
  backdrop.innerHTML = `
    <div class="sheet">
      <h3>Extracted text</h3>
      <div style="max-height:44vh; overflow:auto; background:var(--surface-2); border:1px solid var(--border);
                  border-radius:12px; padding:12px; font-size:14px; line-height:1.5; white-space:pre-wrap;
                  word-break:break-word; margin-bottom:12px;">${escapeHtml(text)}</div>
      <div style="display:flex; gap:10px;">
        <button class="btn ghost" id="txtClose" style="flex:1">Close</button>
        <button class="btn" id="txtShare" style="flex:1">Share</button>
        <button class="btn primary" id="txtCopy" style="flex:1">Copy</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);
  const close = () => backdrop.remove();
  backdrop.querySelector("#txtClose").onclick = close;
  backdrop.onclick = (e) => {
    if (e.target === backdrop) close();
  };
  backdrop.querySelector("#txtCopy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied");
    } catch {
      toast("Copy not available");
    }
  };
  backdrop.querySelector("#txtShare").onclick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        /* cancelled */
      }
    } else {
      toast("Share not available");
    }
  };
}
