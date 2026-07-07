// app.js — Scanly document scanner. Orchestrates capture flow, library and
// document views. Dependency-free PWA.

import * as db from "./db.js";
import { openCropEditor } from "./crop-editor.js";
import { openFilterEditor } from "./filter-editor.js";
import { sharePdf, downloadPdf } from "./export.js";
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
      ? `<div class="empty">${icons.doc}<h2>No documents yet</h2><p>Tap the button below to scan your first document with your camera or import a photo.</p></div>`
      : `<div class="grid">${docs.map(libraryCard).join("")}</div>`;

  appEl.innerHTML = `
    <div class="topbar">
      <div style="width:34px;height:34px;color:var(--accent)">${icons.scan}</div>
      <h1>Scanly</h1>
      <span class="sub">${docs.length} doc${docs.length === 1 ? "" : "s"}</span>
    </div>
    <div class="content" id="libContent">${body}</div>
    <button class="fab" id="fab" title="New scan">${icons.plus}</button>
  `;

  docs.forEach((d) => {
    if (d.pages[0]) {
      const img = appEl.querySelector(`[data-thumb="${d.id}"]`);
      if (img) img.src = objUrl(d.pages[0].thumb);
    }
    const card = appEl.querySelector(`[data-doc="${d.id}"]`);
    if (card) card.onclick = () => (location.hash = `#/doc/${d.id}`);
  });

  appEl.querySelector("#fab").onclick = startNewScan;
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
        <button class="btn" id="addPage" style="flex:1; min-width:130px;">${icons.camera} Add page</button>
        <button class="btn primary" id="share" style="flex:1; min-width:130px;">${icons.share} Share PDF</button>
        <button class="btn" id="download" style="flex:1; min-width:130px;">${icons.pdf} Save PDF</button>
        <button class="btn danger" id="deleteDoc" style="flex:1; min-width:130px;">${icons.trash} Delete</button>
      </div>
    </div>
  `;

  doc.pages.forEach((p) => {
    const img = appEl.querySelector(`[data-page="${p.id}"]`);
    if (img) img.src = objUrl(p.thumb);
    const del = appEl.querySelector(`[data-del="${p.id}"]`);
    if (del) del.onclick = (e) => { e.stopPropagation(); removePage(doc, p.id); };
  });

  appEl.querySelector("#back").onclick = () => (location.hash = "#/");
  appEl.querySelector("#rename").onclick = () => renameDoc(doc);
  appEl.querySelector("#addPage").onclick = () => addPageToDoc(doc);
  appEl.querySelector("#share").onclick = () => sharePdf(doc);
  appEl.querySelector("#download").onclick = () => downloadPdf(doc);
  appEl.querySelector("#deleteDoc").onclick = () => deleteDoc(doc);
}

function pageItem(p, i) {
  return `
    <div class="page-item">
      <span class="num">${i + 1}</span>
      <button class="del" data-del="${p.id}" title="Remove">✕</button>
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

async function removePage(doc, pageId) {
  const ok = await confirmSheet({
    title: "Remove page?",
    message: "This page will be removed from the document.",
    confirmLabel: "Remove",
  });
  if (!ok) return;
  doc.pages = doc.pages.filter((p) => p.id !== pageId);
  doc.updatedAt = Date.now();
  if (doc.pages.length === 0) {
    await db.deleteDocument(doc.id);
    location.hash = "#/";
    return;
  }
  await db.saveDocument(doc);
  render();
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
  backdrop.querySelector("#srcCamera").onclick = () => { close(); cameraInput.click(); };
  backdrop.querySelector("#srcGallery").onclick = () => { close(); galleryInput.click(); };
  backdrop.querySelector("#srcCancel").onclick = close;
  backdrop.onclick = (e) => { if (e.target === backdrop) close(); };
}

cameraInput.addEventListener("change", () => handleFiles(cameraInput.files, cameraInput));
galleryInput.addEventListener("change", () => handleFiles(galleryInput.files, galleryInput));

async function handleFiles(fileList, inputEl) {
  const files = Array.from(fileList || []);
  inputEl.value = ""; // reset so re-picking same file fires change
  if (files.length === 0) return;

  // For multiple gallery images, process each in sequence into one document.
  let processedAny = false;
  for (const file of files) {
    const page = await processOneImage(file);
    if (page) {
      await commitPage(page);
      processedAny = true;
    }
  }
  if (processedAny) render();
}

async function processOneImage(file) {
  let img;
  try {
    img = await loadImage(file);
  } catch {
    toast("Could not read image");
    return null;
  }
  const flat = await openCropEditor(img);
  URL.revokeObjectURL(img.src);
  if (!flat) return null;
  const finalCanvas = await openFilterEditor(flat);
  if (!finalCanvas) return null;
  const overlay = busy("Saving…");
  const page = await db.canvasToPage(finalCanvas);
  overlay.remove();
  return page;
}

async function commitPage(page) {
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
    name: defaultDocName(),
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

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("load failed")); };
    img.src = url;
  });
}

// ---------------------------------------------------------------------------
window.addEventListener("hashchange", render);
render();
