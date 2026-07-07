// annotate.js — sign & annotate a scanned page.
// Tools: freehand pen, text stamp, and a saved signature stamp. The result is
// composited onto the page image and returned as a new canvas.

import { toast } from "./ui.js";

const SIG_KEY = "scanly.signature";
const COLORS = ["#ef4444", "#2563eb", "#111827", "#16a34a"];

/**
 * Open the annotation editor over a page image.
 * @param {Blob} pageBlob full-resolution JPEG of the page
 * @returns {Promise<HTMLCanvasElement|null>} annotated canvas or null if cancelled
 */
export function openAnnotator(pageBlob) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => start(img, resolve);
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(pageBlob);
  });
}

function start(img, resolve) {
  let tool = "pen"; // pen | text | signature
  let color = COLORS[0];
  const strokes = []; // {type, ...} committed items for undo

  const root = document.createElement("div");
  root.className = "editor";
  root.innerHTML = `
    <div class="editor-top">
      <button class="btn ghost" id="anCancel">Cancel</button>
      <div class="title">Sign & annotate</div>
      <button class="btn primary" id="anDone">Save</button>
    </div>
    <div class="editor-stage">
      <div class="editor-canvas-wrap"><canvas id="anCanvas"></canvas></div>
    </div>
    <div class="filter-row" id="anTools" style="justify-content:center; gap:14px;">
      <button class="btn icon" data-tool="pen" title="Draw">${penIcon()}</button>
      <button class="btn icon" data-tool="text" title="Text">${textIcon()}</button>
      <button class="btn icon" data-tool="signature" title="Signature">${sigIcon()}</button>
      <button class="btn icon" id="anUndo" title="Undo">${undoIcon()}</button>
      <span id="anColors" style="display:flex; gap:8px; align-items:center;"></span>
    </div>
  `;
  document.body.appendChild(root);

  const canvas = root.querySelector("#anCanvas");
  const wrap = root.querySelector(".editor-canvas-wrap");
  const ctx = canvas.getContext("2d");
  let scale = 1;

  function layout() {
    const stage = root.querySelector(".editor-stage");
    scale = Math.min((stage.clientWidth - 24) / img.naturalWidth, (stage.clientHeight - 24) / img.naturalHeight);
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.style.width = Math.round(img.naturalWidth * scale) + "px";
    canvas.style.height = Math.round(img.naturalHeight * scale) + "px";
    wrap.style.width = canvas.style.width;
    wrap.style.height = canvas.style.height;
    redraw();
  }

  function redraw() {
    ctx.drawImage(img, 0, 0);
    for (const s of strokes) drawItem(s);
  }

  function drawItem(s) {
    if (s.type === "path") {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.lineJoin = ctx.lineCap = "round";
      ctx.beginPath();
      s.points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
    } else if (s.type === "text") {
      ctx.fillStyle = s.color;
      ctx.font = `${s.size}px -apple-system, Arial, sans-serif`;
      ctx.textBaseline = "top";
      ctx.fillText(s.text, s.x, s.y);
    } else if (s.type === "image") {
      ctx.drawImage(s.img, s.x, s.y, s.w, s.h);
    }
  }

  // Coordinate mapping display -> image space.
  const toImg = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
  };

  let drawing = null;
  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const p = toImg(e);
    if (tool === "pen") {
      drawing = { type: "path", color, width: Math.max(3, img.naturalWidth / 320), points: [p] };
      canvas.setPointerCapture(e.pointerId);
    } else if (tool === "text") {
      addText(p);
    } else if (tool === "signature") {
      placeSignature(p);
    }
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    drawing.points.push(toImg(e));
    redraw();
    drawItem(drawing);
  });
  const endDraw = () => {
    if (drawing && drawing.points.length > 1) strokes.push(drawing);
    drawing = null;
    redraw();
  };
  canvas.addEventListener("pointerup", endDraw);
  canvas.addEventListener("pointercancel", endDraw);

  async function addText(p) {
    const { promptSheet } = await import("./ui.js");
    const text = await promptSheet({ title: "Add text", placeholder: "Type text…", confirmLabel: "Add" });
    if (!text) return;
    strokes.push({ type: "text", text, x: p.x, y: p.y, color, size: Math.max(24, img.naturalWidth / 22) });
    redraw();
  }

  async function placeSignature(p) {
    let dataUrl = localStorage.getItem(SIG_KEY);
    if (!dataUrl) {
      dataUrl = await captureSignature();
      if (!dataUrl) return;
      try {
        localStorage.setItem(SIG_KEY, dataUrl);
      } catch {
        /* storage may be full; still usable this session */
      }
    }
    const sig = new Image();
    sig.onload = () => {
      const w = img.naturalWidth * 0.32;
      const h = (sig.naturalHeight / sig.naturalWidth) * w;
      strokes.push({ type: "image", img: sig, x: p.x - w / 2, y: p.y - h / 2, w, h });
      redraw();
    };
    sig.src = dataUrl;
  }

  // Tool + color UI.
  const colorsEl = root.querySelector("#anColors");
  COLORS.forEach((c) => {
    const dot = document.createElement("button");
    dot.className = "btn icon";
    dot.style.cssText = `width:28px;height:28px;border-radius:50%;background:${c};border:2px solid ${c === color ? "#fff" : "transparent"}`;
    dot.onclick = () => {
      color = c;
      colorsEl.querySelectorAll("button").forEach((b, i) => (b.style.borderColor = COLORS[i] === c ? "#fff" : "transparent"));
    };
    colorsEl.appendChild(dot);
  });
  function setTool(t) {
    tool = t;
    root.querySelectorAll("#anTools [data-tool]").forEach((b) => b.classList.toggle("primary", b.dataset.tool === t));
  }
  root.querySelectorAll("#anTools [data-tool]").forEach((b) => (b.onclick = () => setTool(b.dataset.tool)));
  setTool("pen");
  root.querySelector("#anUndo").onclick = () => {
    strokes.pop();
    redraw();
  };

  root.querySelector("#anCancel").onclick = () => close(null);
  root.querySelector("#anDone").onclick = () => {
    const out = document.createElement("canvas");
    out.width = canvas.width;
    out.height = canvas.height;
    out.getContext("2d").drawImage(canvas, 0, 0);
    close(out);
  };

  function close(result) {
    URL.revokeObjectURL(img.src);
    root.remove();
    resolve(result);
  }

  requestAnimationFrame(layout);
  window.addEventListener("resize", layout);
}

/** A modal signature pad; resolves a trimmed transparent-PNG data URL or null. */
function captureSignature() {
  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "sheet-backdrop";
    backdrop.innerHTML = `
      <div class="sheet">
        <h3>Draw your signature</h3>
        <canvas id="sigPad" style="width:100%; height:200px; background:#fff; border-radius:12px; touch-action:none;"></canvas>
        <div style="display:flex; gap:10px; margin-top:12px;">
          <button class="btn ghost" id="sigClear" style="flex:1">Clear</button>
          <button class="btn" id="sigCancel" style="flex:1">Cancel</button>
          <button class="btn primary" id="sigOk" style="flex:1">Use</button>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    const pad = backdrop.querySelector("#sigPad");
    const dpr = window.devicePixelRatio || 1;
    const rect = pad.getBoundingClientRect();
    pad.width = rect.width * dpr;
    pad.height = rect.height * dpr;
    const c = pad.getContext("2d");
    c.scale(dpr, dpr);
    c.strokeStyle = "#111827";
    c.lineWidth = 2.5;
    c.lineJoin = c.lineCap = "round";
    let drawing = false;
    let has = false;
    let bounds = { minX: 1e9, minY: 1e9, maxX: 0, maxY: 0 };
    const pos = (e) => {
      const r = pad.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    pad.addEventListener("pointerdown", (e) => {
      drawing = true;
      const p = pos(e);
      c.beginPath();
      c.moveTo(p.x, p.y);
      pad.setPointerCapture(e.pointerId);
    });
    pad.addEventListener("pointermove", (e) => {
      if (!drawing) return;
      const p = pos(e);
      c.lineTo(p.x, p.y);
      c.stroke();
      has = true;
      bounds.minX = Math.min(bounds.minX, p.x);
      bounds.minY = Math.min(bounds.minY, p.y);
      bounds.maxX = Math.max(bounds.maxX, p.x);
      bounds.maxY = Math.max(bounds.maxY, p.y);
    });
    pad.addEventListener("pointerup", () => (drawing = false));
    const done = (v) => {
      backdrop.remove();
      resolve(v);
    };
    backdrop.querySelector("#sigClear").onclick = () => {
      c.clearRect(0, 0, pad.width, pad.height);
      has = false;
      bounds = { minX: 1e9, minY: 1e9, maxX: 0, maxY: 0 };
    };
    backdrop.querySelector("#sigCancel").onclick = () => done(null);
    backdrop.querySelector("#sigOk").onclick = () => {
      if (!has) {
        toast("Draw a signature first");
        return;
      }
      // Trim to the drawn bounds and re-render onto a transparent canvas.
      const pad2 = document.createElement("canvas");
      const bw = (bounds.maxX - bounds.minX + 20) * dpr;
      const bh = (bounds.maxY - bounds.minY + 20) * dpr;
      pad2.width = bw;
      pad2.height = bh;
      pad2
        .getContext("2d")
        .drawImage(pad, (bounds.minX - 10) * dpr, (bounds.minY - 10) * dpr, bw, bh, 0, 0, bw, bh);
      done(pad2.toDataURL("image/png"));
    };
  });
}

const penIcon = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`;
const textIcon = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`;
const sigIcon = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17c3 0 3-10 6-10s2 8 5 8 3-4 6-4"/><path d="M3 21h18"/></svg>`;
const undoIcon = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>`;
