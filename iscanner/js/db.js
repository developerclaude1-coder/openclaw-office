// db.js — IndexedDB persistence for scanned documents.
// A document has an id, name, timestamps and an ordered list of pages.
// Each page stores a full-resolution JPEG blob plus a small thumbnail blob.

const DB_NAME = "scanly";
const DB_VERSION = 1;
const STORE = "documents";

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(mode) {
  return openDb().then((db) => db.transaction(STORE, mode).objectStore(STORE));
}

export function newId() {
  return "d" + Date.now().toString(36) + Math.floor(performance.now() * 1000).toString(36);
}

/** @returns {Promise<Array>} all documents, newest first. */
export async function listDocuments() {
  const store = await tx("readonly");
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => {
      const docs = req.result.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(docs);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getDocument(id) {
  const store = await tx("readonly");
  return new Promise((resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveDocument(doc) {
  doc.updatedAt = doc.updatedAt || 0;
  const store = await tx("readwrite");
  return new Promise((resolve, reject) => {
    const req = store.put(doc);
    req.onsuccess = () => resolve(doc);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteDocument(id) {
  const store = await tx("readwrite");
  return new Promise((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Create a page record from a processed canvas.
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<{id:string, blob:Blob, thumb:Blob, width:number, height:number}>}
 */
export function canvasToPage(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        // Build a small thumbnail.
        const tw = 300;
        const th = Math.round((canvas.height / canvas.width) * tw);
        const tc = document.createElement("canvas");
        tc.width = tw;
        tc.height = th;
        tc.getContext("2d").drawImage(canvas, 0, 0, tw, th);
        tc.toBlob(
          (thumb) => {
            resolve({
              id: "p" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36),
              blob,
              thumb,
              width: canvas.width,
              height: canvas.height,
            });
          },
          "image/jpeg",
          0.6,
        );
      },
      "image/jpeg",
      0.85,
    );
  });
}
