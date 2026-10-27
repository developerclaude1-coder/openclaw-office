// doc-actions.js — page-level and document-level tools wired to the UI:
// annotate, OCR, reorder, export JPG, delete page, ID-card compose, and merge.

import * as db from "./db.js";
import { toast, busy, confirmSheet, escapeHtml, icons } from "./ui.js";
import { openAnnotator } from "./annotate.js";
import { extractText } from "./ocr.js";
import { exportPageJpg, composeIdCard } from "./page-tools.js";
import { pickFiles, processImageFile } from "./capture.js";

/**
 * Open the per-page action sheet.
 * @param {object} doc
 * @param {object} page
 * @param {number} index
 * @param {() => void} refresh re-render the document view
 */
export function openPageActions(doc, page, index, refresh) {
  const backdrop = document.createElement("div");
  backdrop.className = "sheet-backdrop";
  const canUp = index > 0;
  const canDown = index < doc.pages.length - 1;
  backdrop.innerHTML = `
    <div class="sheet">
      <h3>Page ${index + 1}</h3>
      <div class="row">
        <button class="btn" id="paAnnotate">${icons.edit} Sign & annotate</button>
        <button class="btn" id="paOcr">${icons.doc} Extract text (OCR)</button>
        <button class="btn" id="paJpg">${icons.image} Export as JPG</button>
        <div style="display:flex; gap:10px;">
          <button class="btn" id="paUp" style="flex:1" ${canUp ? "" : "disabled"}>↑ Move up</button>
          <button class="btn" id="paDown" style="flex:1" ${canDown ? "" : "disabled"}>↓ Move down</button>
        </div>
        <button class="btn danger" id="paDelete">${icons.trash} Delete page</button>
        <button class="btn ghost" id="paClose">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);
  const close = () => backdrop.remove();
  backdrop.onclick = (e) => {
    if (e.target === backdrop) close();
  };
  backdrop.querySelector("#paClose").onclick = close;

  backdrop.querySelector("#paAnnotate").onclick = async () => {
    close();
    const annotated = await openAnnotator(page.blob);
    if (!annotated) return;
    const overlay = busy("Saving…");
    const newPage = await db.canvasToPage(annotated);
    doc.pages[index] = newPage;
    doc.updatedAt = Date.now();
    await db.saveDocument(doc);
    overlay.remove();
    refresh();
  };

  backdrop.querySelector("#paOcr").onclick = () => {
    close();
    extractText(page.blob);
  };

  backdrop.querySelector("#paJpg").onclick = () => {
    close();
    exportPageJpg(page, `${doc.name}-p${index + 1}`);
    toast("Image downloaded");
  };

  backdrop.querySelector("#paUp").onclick = () => close() || move(-1);
  backdrop.querySelector("#paDown").onclick = () => close() || move(1);
  async function move(dir) {
    const j = index + dir;
    if (j < 0 || j >= doc.pages.length) return;
    const [p] = doc.pages.splice(index, 1);
    doc.pages.splice(j, 0, p);
    doc.updatedAt = Date.now();
    await db.saveDocument(doc);
    refresh();
  }

  backdrop.querySelector("#paDelete").onclick = async () => {
    close();
    const ok = await confirmSheet({
      title: "Delete page?",
      message: "This page will be removed from the document.",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    doc.pages.splice(index, 1);
    doc.updatedAt = Date.now();
    if (doc.pages.length === 0) {
      await db.deleteDocument(doc.id);
      location.hash = "#/";
      return;
    }
    await db.saveDocument(doc);
    refresh();
  };
}

/**
 * ID-card flow: capture front and back, compose onto one page.
 * @returns {Promise<object|null>} a page record, or null if cancelled
 */
export async function idCardCapture() {
  toast("Capture the FRONT of the card");
  const frontFiles = await pickFiles({ camera: true });
  if (!frontFiles.length) return null;
  const front = await processImageFile(frontFiles[0]);
  if (!front) return null;

  const wantBack = await confirmSheet({
    title: "Add the back?",
    message: "Capture the back of the card to place it on the same page, or skip.",
    confirmLabel: "Capture back",
    danger: false,
  });
  let back = null;
  if (wantBack) {
    const backFiles = await pickFiles({ camera: true });
    if (backFiles.length) back = await processImageFile(backFiles[0]);
  }

  const overlay = busy("Building page…");
  const composed = composeIdCard(front, back);
  const page = await db.canvasToPage(composed);
  overlay.remove();
  return page;
}

/**
 * Merge another document's pages into this one.
 * @param {object} doc target document
 * @param {() => void} refresh
 */
export async function mergeDocument(doc, refresh) {
  const all = (await db.listDocuments()).filter((d) => d.id !== doc.id);
  if (all.length === 0) {
    toast("No other documents to merge");
    return;
  }
  const backdrop = document.createElement("div");
  backdrop.className = "sheet-backdrop";
  backdrop.innerHTML = `
    <div class="sheet">
      <h3>Merge a document into “${escapeHtml(doc.name)}”</h3>
      <div class="row" id="mergeList"></div>
      <button class="btn ghost" id="mergeCancel" style="margin-top:10px">Cancel</button>
    </div>`;
  document.body.appendChild(backdrop);
  const list = backdrop.querySelector("#mergeList");
  all.forEach((d) => {
    const b = document.createElement("button");
    b.className = "btn";
    b.style.justifyContent = "space-between";
    b.innerHTML = `<span>${escapeHtml(d.name)}</span><span class="badge">${d.pages.length}p</span>`;
    b.onclick = async () => {
      backdrop.remove();
      const overlay = busy("Merging…");
      doc.pages.push(...d.pages);
      doc.updatedAt = Date.now();
      await db.saveDocument(doc);
      overlay.remove();
      toast(`Merged ${d.pages.length} page(s)`);
      refresh();
    };
    list.appendChild(b);
  });
  const close = () => backdrop.remove();
  backdrop.querySelector("#mergeCancel").onclick = close;
  backdrop.onclick = (e) => {
    if (e.target === backdrop) close();
  };
}
