// filter-editor.js — choose a scan filter and brightness/contrast for a page.
// Receives the flattened (perspective-corrected) canvas and returns the final
// processed canvas ready to store.

import { FILTERS, applyFilter } from "./filters.js";

/**
 * @param {HTMLCanvasElement} flat perspective-corrected page
 * @returns {Promise<HTMLCanvasElement|null>}
 */
export function openFilterEditor(flat) {
  return new Promise((resolve) => {
    let current = "magic";
    let brightness = 0;
    let contrast = 0;

    // A downscaled preview keeps filter re-renders snappy on phones.
    const preview = downscale(flat, 900);

    const root = document.createElement("div");
    root.className = "editor";
    root.innerHTML = `
      <div class="editor-top">
        <button class="btn ghost" id="fCancel">Back</button>
        <div class="title">Enhance</div>
        <button class="btn primary" id="fDone">Done</button>
      </div>
      <div class="editor-stage">
        <canvas id="fPreview"></canvas>
      </div>
      <div class="slider-group">
        <label><span>Brightness</span><span id="bVal">0</span></label>
        <input type="range" id="bRange" min="-60" max="60" value="0" />
        <label style="margin-top:8px"><span>Contrast</span><span id="cVal">0</span></label>
        <input type="range" id="cRange" min="-60" max="60" value="0" />
      </div>
      <div class="filter-row" id="fRow"></div>
    `;
    document.body.appendChild(root);

    const previewCanvas = root.querySelector("#fPreview");
    const row = root.querySelector("#fRow");

    // Build filter chips with thumbnail swatches.
    const swatchSrc = downscale(flat, 120);
    FILTERS.forEach((f) => {
      const chip = document.createElement("div");
      chip.className = "filter-chip" + (f.id === current ? " active" : "");
      chip.dataset.id = f.id;
      const sw = document.createElement("div");
      sw.className = "swatch";
      const thumb = applyFilter(f.id, swatchSrc, {});
      sw.appendChild(thumb);
      const label = document.createElement("span");
      label.textContent = f.label;
      chip.appendChild(sw);
      chip.appendChild(label);
      chip.onclick = () => {
        current = f.id;
        row.querySelectorAll(".filter-chip").forEach((c) => c.classList.toggle("active", c.dataset.id === f.id));
        renderPreview();
      };
      row.appendChild(chip);
    });

    function renderPreview() {
      const out = applyFilter(current, preview, { brightness, contrast });
      previewCanvas.width = out.width;
      previewCanvas.height = out.height;
      const stage = root.querySelector(".editor-stage");
      const scale = Math.min((stage.clientWidth - 24) / out.width, (stage.clientHeight - 24) / out.height);
      previewCanvas.style.width = Math.round(out.width * scale) + "px";
      previewCanvas.style.height = Math.round(out.height * scale) + "px";
      previewCanvas.getContext("2d").drawImage(out, 0, 0);
    }

    const bRange = root.querySelector("#bRange");
    const cRange = root.querySelector("#cRange");
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        renderPreview();
      });
    };
    bRange.oninput = () => {
      brightness = Number(bRange.value);
      root.querySelector("#bVal").textContent = brightness;
      schedule();
    };
    cRange.oninput = () => {
      contrast = Number(cRange.value);
      root.querySelector("#cVal").textContent = contrast;
      schedule();
    };

    root.querySelector("#fCancel").onclick = () => close(null);
    root.querySelector("#fDone").onclick = () => {
      // Apply the chosen filter at FULL resolution for the stored page.
      const finalCanvas = applyFilter(current, flat, { brightness, contrast });
      close(finalCanvas);
    };

    function close(result) {
      root.remove();
      resolve(result);
    }

    requestAnimationFrame(renderPreview);
  });
}

function downscale(canvas, maxDim) {
  const src = canvas;
  const scale = Math.min(1, maxDim / Math.max(src.width, src.height));
  if (scale >= 1) {
    const c = document.createElement("canvas");
    c.width = src.width;
    c.height = src.height;
    c.getContext("2d").drawImage(src, 0, 0);
    return c;
  }
  const c = document.createElement("canvas");
  c.width = Math.round(src.width * scale);
  c.height = Math.round(src.height * scale);
  c.getContext("2d").drawImage(src, 0, 0, c.width, c.height);
  return c;
}
