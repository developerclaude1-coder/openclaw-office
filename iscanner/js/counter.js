// counter.js — photo object counter (beta). Detects separated objects in a
// photo via thresholding + connected-component labelling, overlays a marker on
// each, and lets the user tap to add or remove markers to correct the count.
// This is an image-processing approximation, not AR/ML object detection.

import { toast } from "./ui.js";

/** Open the counter over a chosen photo file. */
export function openCounter(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => start(img, resolve);
    img.onerror = () => {
      toast("Could not read image");
      resolve();
    };
    img.src = URL.createObjectURL(file);
  });
}

function start(img, resolve) {
  const root = document.createElement("div");
  root.className = "editor";
  root.innerHTML = `
    <div class="editor-top">
      <button class="btn ghost" id="coClose">Close</button>
      <div class="title">Count objects <span class="badge">beta</span></div>
      <span style="width:44px"></span>
    </div>
    <div class="editor-stage">
      <div class="editor-canvas-wrap"><canvas id="coCanvas" style="touch-action:none"></canvas></div>
    </div>
    <div class="slider-group">
      <label><span>Sensitivity</span><span id="coSensVal">50</span></label>
      <input type="range" id="coSens" min="5" max="95" value="50" />
    </div>
    <div class="editor-bar">
      <div style="font-size:20px; font-weight:700;">Count: <span id="coCount">0</span></div>
      <div class="spacer"></div>
      <button class="btn" id="coDetect">Re-detect</button>
    </div>
    <div style="text-align:center; color:var(--muted); font-size:12px; padding:0 16px calc(var(--safe-bottom) + 10px);">
      Tap an object to remove it · tap empty space to add one
    </div>
  `;
  document.body.appendChild(root);

  const canvas = root.querySelector("#coCanvas");
  const wrap = root.querySelector(".editor-canvas-wrap");
  const ctx = canvas.getContext("2d");
  let scale = 1;
  let markers = [];
  let sensitivity = 50;

  // Downscale the working image for speed.
  const maxW = 700;
  const wScale = Math.min(1, maxW / img.naturalWidth);
  const iw = Math.round(img.naturalWidth * wScale);
  const ih = Math.round(img.naturalHeight * wScale);

  function layout() {
    const stage = root.querySelector(".editor-stage");
    scale = Math.min((stage.clientWidth - 24) / iw, (stage.clientHeight - 24) / ih);
    canvas.width = iw;
    canvas.height = ih;
    canvas.style.width = Math.round(iw * scale) + "px";
    canvas.style.height = Math.round(ih * scale) + "px";
    wrap.style.width = canvas.style.width;
    wrap.style.height = canvas.style.height;
    redraw();
  }

  function redraw() {
    ctx.drawImage(img, 0, 0, iw, ih);
    ctx.lineWidth = 2;
    markers.forEach((m, i) => {
      ctx.beginPath();
      ctx.arc(m.x, m.y, 11, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(37,99,235,0.55)";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(i + 1), m.x, m.y);
    });
    root.querySelector("#coCount").textContent = markers.length;
  }

  function detect() {
    markers = detectBlobs(img, iw, ih, sensitivity);
    redraw();
    if (markers.length === 0) toast("No objects found — adjust sensitivity");
  }

  canvas.addEventListener("pointerdown", (e) => {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / scale;
    const y = (e.clientY - r.top) / scale;
    // Remove nearest marker within radius, else add one.
    let hitIdx = -1;
    let best = 22 * 22;
    markers.forEach((m, i) => {
      const d = (m.x - x) ** 2 + (m.y - y) ** 2;
      if (d < best) {
        best = d;
        hitIdx = i;
      }
    });
    if (hitIdx >= 0) markers.splice(hitIdx, 1);
    else markers.push({ x, y });
    redraw();
  });

  const sens = root.querySelector("#coSens");
  sens.oninput = () => {
    sensitivity = Number(sens.value);
    root.querySelector("#coSensVal").textContent = sensitivity;
  };
  sens.onchange = detect;
  root.querySelector("#coDetect").onclick = detect;
  root.querySelector("#coClose").onclick = () => {
    URL.revokeObjectURL(img.src);
    root.remove();
    resolve();
  };

  requestAnimationFrame(() => {
    layout();
    detect();
  });
  window.addEventListener("resize", layout);
}

/**
 * Connected-component blob detection. Separates foreground from background via
 * Otsu-style thresholding (biased by sensitivity), labels components, and
 * returns a centroid per component of plausible size.
 */
function detectBlobs(img, w, h, sensitivity) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const cx = c.getContext("2d", { willReadFrequently: true });
  cx.drawImage(img, 0, 0, w, h);
  const { data } = cx.getImageData(0, 0, w, h);

  const gray = new Uint8Array(w * h);
  let sum = 0;
  for (let i = 0; i < w * h; i++) {
    const g = (data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114) | 0;
    gray[i] = g;
    sum += g;
  }
  const mean = sum / (w * h);
  // Sensitivity shifts the threshold; higher = pick up fainter objects.
  const bias = (sensitivity - 50) * 0.9;
  const thresh = mean - bias;

  // Foreground = pixels that differ from the (assumed lighter) background.
  // Decide polarity: if most pixels are bright, objects are the dark minority.
  let bright = 0;
  for (let i = 0; i < w * h; i++) if (gray[i] > mean) bright++;
  const objectsAreDark = bright > w * h * 0.5;
  const fg = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    fg[i] = objectsAreDark ? (gray[i] < thresh ? 1 : 0) : gray[i] > thresh ? 1 : 0;
  }

  // Connected components (4-neighbour) via iterative flood fill.
  const labels = new Int32Array(w * h).fill(0);
  const comps = [];
  const stack = [];
  for (let start = 0; start < w * h; start++) {
    if (!fg[start] || labels[start]) continue;
    const id = comps.length + 1;
    let count = 0;
    let sx = 0;
    let sy = 0;
    stack.push(start);
    labels[start] = id;
    while (stack.length) {
      const p = stack.pop();
      const px = p % w;
      const py = (p / w) | 0;
      count++;
      sx += px;
      sy += py;
      const nb = [p - 1, p + 1, p - w, p + w];
      if (px === 0) nb[0] = -1;
      if (px === w - 1) nb[1] = -1;
      for (const n of nb) {
        if (n >= 0 && n < w * h && fg[n] && !labels[n]) {
          labels[n] = id;
          stack.push(n);
        }
      }
    }
    comps.push({ count, x: sx / count, y: sy / count });
  }

  // Filter by area to drop noise and huge background blobs.
  const areas = comps.map((c) => c.count).sort((a, b) => a - b);
  const median = areas.length ? areas[areas.length >> 1] : 0;
  const minArea = Math.max(12, median * 0.15);
  const maxArea = w * h * 0.35;
  return comps.filter((c) => c.count >= minArea && c.count <= maxArea).map((c) => ({ x: c.x, y: c.y }));
}
