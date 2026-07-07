// ui.js — small UI helpers: icons, toast, confirm/prompt sheets.

export const icons = {
  scan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>`,
  pdf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>`,
  doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
};

let toastTimer = 0;
export function toast(message) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  requestAnimationFrame(() => el.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove("show"), 2200);
}

/** A modal busy overlay; returns a handle with .remove(). */
export function busy(text = "Working…") {
  const el = document.createElement("div");
  el.className = "overlay-busy";
  el.innerHTML = `<div class="spin"></div><div>${escapeHtml(text)}</div>`;
  document.body.appendChild(el);
  return el;
}

/** Prompt for a text value in a bottom sheet. Resolves null on cancel. */
export function promptSheet({ title, value = "", placeholder = "", confirmLabel = "Save" }) {
  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "sheet-backdrop";
    backdrop.innerHTML = `
      <div class="sheet">
        <h3>${escapeHtml(title)}</h3>
        <div class="row">
          <input type="text" id="sheetInput" placeholder="${escapeHtml(placeholder)}" />
          <div style="display:flex; gap:10px;">
            <button class="btn ghost" id="sheetCancel" style="flex:1">Cancel</button>
            <button class="btn primary" id="sheetOk" style="flex:1">${escapeHtml(confirmLabel)}</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    const input = backdrop.querySelector("#sheetInput");
    input.value = value;
    setTimeout(() => input.focus(), 50);
    const done = (v) => {
      backdrop.remove();
      resolve(v);
    };
    backdrop.querySelector("#sheetCancel").onclick = () => done(null);
    backdrop.querySelector("#sheetOk").onclick = () => done(input.value.trim() || null);
    backdrop.onclick = (e) => {
      if (e.target === backdrop) done(null);
    };
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") done(input.value.trim() || null);
    });
  });
}

/** Confirm dialog. Resolves boolean. */
export function confirmSheet({ title, message, confirmLabel = "Delete", danger = true }) {
  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "sheet-backdrop";
    backdrop.innerHTML = `
      <div class="sheet">
        <h3>${escapeHtml(title)}</h3>
        <p style="color:var(--muted); font-size:14px; margin:0 0 16px;">${escapeHtml(message)}</p>
        <div style="display:flex; gap:10px;">
          <button class="btn ghost" id="cCancel" style="flex:1">Cancel</button>
          <button class="btn ${danger ? "danger" : "primary"}" id="cOk" style="flex:1">${escapeHtml(confirmLabel)}</button>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    const done = (v) => {
      backdrop.remove();
      resolve(v);
    };
    backdrop.querySelector("#cCancel").onclick = () => done(false);
    backdrop.querySelector("#cOk").onclick = () => done(true);
    backdrop.onclick = (e) => {
      if (e.target === backdrop) done(false);
    };
  });
}

export function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

export function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
