// app.js — Scanly document scanner. Orchestrates capture flow, library and
// document views, plus the extra tools (QR, counter, ID card, merge). PWA.

import * as db from "./db.js";
import { processImageFile } from "./capture.js";
import { sharePdf, downloadPdf } from "./export.js";
import { openQrScanner } from "./qr-scanner.js";
import { openCounter } from "./counter.js";
import { openPageActions, idCardCapture, mergeDocument } from "./doc-actions.js";
import { icons, toast, busy, promptSheet, confirmSheet, escapeHtml, formatDate } from "./ui.js";

const appEl = document.getElementById("app");
const cameraInput = document.getElementById("cameraInput");
const galleryInput = document.getElementById("galleryInput");

// Track object URLs so we can revoke them when a view is torn down.
let liveUrls = [];
function objUrl(blob) {
  const u = URL.createObjectURL(blob);
  liveUrls.push(u);
  return u;
}
function revokeUrls() {
  liveUrls.forEach((u) => URL.revokeObjectURL(u));
  liveUrls = [];
}

// ---------------------------------------------------------------------------
// Routing (hash based: #/  and  #/doc/<id>)
// ---------------------------------------------------------------------------
async function render() {
  revokeUrls();
  const hash = location.hash || "#/";
  const docMatch = hash.match(/^#\/doc\/(.+)$/);
  if (docMatch) {
    const doc = await db.getDocument(docMatch[1]);
    if (!doc) {
      location.hash = "#/";
      return;
    }
    renderDocument(doc);
  } else {
    await renderLibrary();
  }
}

// ---------------------------------------------------------------------------
// Library view
// ---------------------------------------------------------------------------
async function renderLibrary() {
  const docs = await db.listDocuments();
  const body =
    docs.length === 0
      ? `<div class="empty">${icons.doc}<h2>No documents yet</h2><p>Tap the + button to scan a document, read a QR code, or count objects.</p></div>`
      : `<div class="grid">${docs.map(libraryCard).join("")}</div>`;

  appEl.innerHTML = `
    <div class="topbar">
      <div style="width:34px;height:34px;color:var(--accent)">${icons.scan}</div>
      <h1>Scanly</h1>
      <button class="btn icon" id="qrTop" title="Scan QR / barcode">${icons.qr}</button>
    </div>
    <div class="content" id="libContent">${body}</div>
    <button class="fab" id="fab" title="New">${icons.plus}</button>
  `;

  docs.forEach((d) => {
    if (d.pages[0]) {
      const img = appEl.querySelector(`[data-thumb="${d.id}"]`);
      if (img) img.src = objUrl(d.pages[0].thumb);
    }
    const card = appEl.querySelector(`[data-doc="${d.id}"]`);
    if (card) card.onclick = () => (location.hash = `#/doc/${d.id}`);
  });

  appEl.querySelector("#fab").onclick = openMainMenu;
  appEl.querySelector("#qrTop").onclick = () => openQrScanner();
}

function libraryCard(d) {
  return `
    <div class="doc-card" data-doc="${d.id}">
      <div class="doc-thumb"><img data-thumb="${d.id}" alt="" /></div>
      <div class="doc-meta">
        <div class="name">${escapeHtml(d.name)}</div>
        <div class="info">${d.pages.length} page${d.pages.length === 1 ? "" : "s"} · ${formatDate(d.updatedAt)}</div>
      </div>
    </div>`;
}

// Main "+" menu on the library screen.
function openMainMenu() {
  const backdrop = document.createElement("div");
  backdrop.className = "sheet-backdrop";
  backdrop.innerHTML = `
    <div class="sheet">
      <h3>Create</h3>
      <div class="row">
        <button class="btn primary" id="mScan">${icons.camera} Scan document</button>
        <button class="btn" id="mId">${icons.doc} Scan ID card (front & back)</button>
        <button class="btn" id="mQr">${icons.qr} Scan QR / barcode</button>
        <button class="btn" id="mCount">${icons.count} Count objects <span class="badge">beta</span></button>
        <button class="btn ghost" id="mCancel">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);
  const close = () => backdrop.remove();
  backdrop.onclick = (e) => {
    if (e.target === backdrop) close();
  };
  backdrop.querySelector("#mCancel").onclick = close;
  backdrop.querySelector("#mScan").onclick = () => {
    close();
    startNewScan();
  };
  backdrop.querySelector("#mId").onclick = async () => {
    close();
    const page = await idCardCapture();
    if (page) {
      pendingTarget = null;
      await commitPage(page, "ID card");
      render();
    }
  };
  backdrop.querySelector("#mQr").onclick = () => {
    close();
    openQrScanner();
  };
  backdrop.querySelector("#mCount").onclick = async () => {
    close();
    const { pickFiles } = await import("./capture.js");
    const files = await pickFiles({ camera: true });
    if (files.length) openCounter(files[0]);
  };
}

// ---------------------------------------------------------------------------
// Document detail view
// ---------------------------------------------------------------------------
function renderDocument(doc) {
  appEl.innerHTML = `
    <div class="topbar">
      <button class="btn icon" id="back">${icons.back}</button>
      <h1 id="docTitle" style="font-size:16px">${escapeHtml(doc.name)}</h1>
      <button class="btn icon" id="rename" title="Rename">${icons.edit}</button>
    </div>
    <div class="content">
      <div class="page-list" id="pageList">
        ${doc.pages.map((p, i) => pageItem(p, i)).join("")}
      </div>
      <div style="display:flex; gap:10px; margin-top:18px; flex-wrap:wrap;">
        <button class="btn" id="addPage" style="flex:1; min-width:120px;">${icons.camera} Add page</button>
        <button class="btn" id="idCard" style="flex:1; min-width:120px;">${icons.doc} ID card</button>
        <button class="btn" id="merge" style="flex:1; min-width:120px;">${icons.merge} Merge</button>
        <button class="btn primary" id="share" style="flex:1; min-width:120px;">${icons.share} Share PDF</button>
        <button class="btn" id="download" style="flex:1; min-width:120px;">${icons.pdf} Save PDF</button>
        <button class="btn danger" id="deleteDoc" style="flex:1; min-width:120px;">${icons.trash} Delete</button>
      </div>
      <p style="text-align:center; color:var(--muted); font-size:12px; margin-top:14px;">
        Tap a page to sign, annotate, extract text, reorder or export it.
      </p>
    </div>
  `;

  const refresh = () => render();
  doc.pages.forEach((p, i) => {
    const img = appEl.querySelector(`[data-page="${p.id}"]`);
    if (img) img.src = objUrl(p.thumb);
    const item = appEl.querySelector(`[data-item="${p.id}"]`);
    if (item) item.onclick = () => openPageActions(doc, p, i, refresh);
  });

  appEl.querySelector("#back").onclick = () => (location.hash = "#/");
  appEl.querySelector("#rename").onclick = () => renameDoc(doc);
  appEl.querySelector("#addPage").onclick = () => addPageToDoc(doc);
  appEl.querySelector("#idCard").onclick = async () => {
    const page = await idCardCapture();
    if (page) {
      doc.pages.push(page);
      doc.updatedAt = Date.now();
      await db.saveDocument(doc);
      render();
    }
  };
  appEl.querySelector("#merge").onclick = () => mergeDocument(doc, refresh);
  appEl.querySelector("#share").onclick = () => sharePdf(doc);
  appEl.querySelector("#download").onclick = () => downloadPdf(doc);
  appEl.querySelector("#deleteDoc").onclick = () => deleteDoc(doc);
}

function pageItem(p, i) {
  return `
    <div class="page-item" data-item="${p.id}">
      <span class="num">${i + 1}</span>
      <img data-page="${p.id}" alt="Page ${i + 1}" />
    </div>`;
}

async function renameDoc(doc) {
  const name = await promptSheet({ title: "Rename document", value: doc.name, confirmLabel: "Save" });
  if (!name) return;
  doc.name = name;
  doc.updatedAt = Date.now();
  await db.saveDocument(doc);
  render();
}

async function deleteDoc(doc) {
  const ok = await confirmSheet({
    title: "Delete document?",
    message: `“${doc.name}” and its ${doc.pages.length} page(s) will be permanently removed.`,
  });
  if (!ok) return;
  await db.deleteDocument(doc.id);
  toast("Document deleted");
  location.hash = "#/";
}

// ---------------------------------------------------------------------------
// Capture / scan flow
// ---------------------------------------------------------------------------
let pendingTarget = null; // { docId } when adding to an existing doc, else null

function startNewScan() {
  pendingTarget = null;
  openSourcePicker();
}

function addPageToDoc(doc) {
  pendingTarget = { docId: doc.id };
  openSourcePicker();
}

function openSourcePicker() {
  const backdrop = document.createElement("div");
  backdrop.className = "sheet-backdrop";
  backdrop.innerHTML = `
    <div class="sheet">
      <h3>Add a page</h3>
      <div class="row">
        <button class="btn primary" id="srcCamera">${icons.camera} Take photo</button>
        <button class="btn" id="srcGallery">${icons.image} Choose from gallery</button>
        <button class="btn ghost" id="srcCancel">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);
  const close = () => backdrop.remove();
  backdrop.querySelector("#srcCamera").onclick = () => {
    close();
    cameraInput.click();
  };
  backdrop.querySelector("#srcGallery").onclick = () => {
    close();
    galleryInput.click();
  };
  backdrop.querySelector("#srcCancel").onclick = close;
  backdrop.onclick = (e) => {
    if (e.target === backdrop) close();
  };
}

cameraInput.addEventListener("change", () => handleFiles(cameraInput.files, cameraInput));
galleryInput.addEventListener("change", () => handleFiles(galleryInput.files, galleryInput));

async function handleFiles(fileList, inputEl) {
  const files = Array.from(fileList || []);
  inputEl.value = ""; // reset so re-picking same file fires change
  if (files.length === 0) return;

  let processedAny = false;
  for (const file of files) {
    const canvas = await processImageFile(file);
    if (!canvas) continue;
    const overlay = busy("Saving…");
    const page = await db.canvasToPage(canvas);
    overlay.remove();
    await commitPage(page);
    processedAny = true;
  }
  if (processedAny) render();
}

async function commitPage(page, nameHint) {
  if (pendingTarget && pendingTarget.docId) {
    const doc = await db.getDocument(pendingTarget.docId);
    if (doc) {
      doc.pages.push(page);
      doc.updatedAt = Date.now();
      await db.saveDocument(doc);
      return;
    }
  }
  // New document.
  const now = Date.now();
  const doc = {
    id: db.newId(),
    name: nameHint ? `${nameHint} ${shortStamp()}` : defaultDocName(),
    createdAt: now,
    updatedAt: now,
    pages: [page],
  };
  await db.saveDocument(doc);
  pendingTarget = { docId: doc.id }; // subsequent gallery images join this doc
  location.hash = `#/doc/${doc.id}`;
}

function defaultDocName() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `Scan ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function shortStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}${pad(d.getMinutes())}`;
}

// ---------------------------------------------------------------------------
window.addEventListener("hashchange", render);
render();
