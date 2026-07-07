// crop-editor.js — full-screen corner-adjust UI over a captured image.
// The user drags four handles to bound the document; on confirm we run the
// perspective warp and hand the flattened canvas to the caller.

import { detectCorners } from "./edge-detect.js";
import { warpPerspective, orderCorners } from "./geometry.js";

const svgNS = "http://www.w3.org/2000/svg";

/**
 * Open the crop editor.
 * @param {HTMLImageElement} img loaded source image
 * @returns {Promise<HTMLCanvasElement|null>} flattened canvas, or null if cancelled
 */
export function openCropEditor(img) {
  return new Promise((resolve) => {
    let rotation = 0; // degrees, multiples of 90
    let corners = detectCorners(img);

    const root = document.createElement("div");
    root.className = "editor";
    root.innerHTML = `
      <div class="editor-top">
        <button class="btn ghost" id="cropCancel">Cancel</button>
        <div class="title">Adjust edges</div>
        <button class="btn icon" id="cropRotate" title="Rotate">
          ${rotateIcon()}
        </button>
      </div>
      <div class="editor-stage">
        <div class="editor-canvas-wrap">
          <canvas id="cropCanvas"></canvas>
          <svg id="cropSvg"></svg>
        </div>
      </div>
      <div class="editor-bar">
        <button class="btn" id="cropReset">Auto</button>
        <button class="btn ghost" id="cropFull">Full</button>
        <div class="spacer"></div>
        <button class="btn primary" id="cropConfirm">Next</button>
      </div>
    `;
    document.body.appendChild(root);

    const canvas = root.querySelector("#cropCanvas");
    const svg = root.querySelector("#cropSvg");
    const ctx = canvas.getContext("2d");
    const wrap = root.querySelector(".editor-canvas-wrap");

    let dispW = 0;
    let dispH = 0;
    let scale = 1;
    let baseW = img.naturalWidth;
    let baseH = img.naturalHeight;

    function rotatedSource() {
      if (rotation % 180 === 0) return { w: img.naturalWidth, h: img.naturalHeight };
      return { w: img.naturalHeight, h: img.naturalWidth };
    }

    function drawBase() {
      const { w, h } = rotatedSource();
      baseW = w;
      baseH = h;
      const stage = root.querySelector(".editor-stage");
      const availW = stage.clientWidth - 24;
      const availH = stage.clientHeight - 24;
      scale = Math.min(availW / w, availH / h);
      dispW = Math.round(w * scale);
      dispH = Math.round(h * scale);
      canvas.width = dispW;
      canvas.height = dispH;
      canvas.style.width = dispW + "px";
      canvas.style.height = dispH + "px";
      wrap.style.width = dispW + "px";
      wrap.style.height = dispH + "px";

      ctx.save();
      ctx.clearRect(0, 0, dispW, dispH);
      ctx.translate(dispW / 2, dispH / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      const dw = rotation % 180 === 0 ? dispW : dispH;
      const dh = rotation % 180 === 0 ? dispH : dispW;
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    }

    function rotatePointForDisplay(p) {
      // Corners are stored in ORIGINAL image coordinates; map to the rotated,
      // scaled display space.
      const ow = img.naturalWidth;
      const oh = img.naturalHeight;
      let x = p.x;
      let y = p.y;
      let rx;
      let ry;
      if (rotation % 360 === 0) {
        rx = x;
        ry = y;
      } else if (rotation % 360 === 90) {
        rx = oh - y;
        ry = x;
      } else if (rotation % 360 === 180) {
        rx = ow - x;
        ry = oh - y;
      } else {
        rx = y;
        ry = ow - x;
      }
      return { x: rx * scale, y: ry * scale };
    }

    function displayToOriginal(dx, dy) {
      const ow = img.naturalWidth;
      const oh = img.naturalHeight;
      const rx = dx / scale;
      const ry = dy / scale;
      let x;
      let y;
      if (rotation % 360 === 0) {
        x = rx;
        y = ry;
      } else if (rotation % 360 === 90) {
        x = ry;
        y = oh - rx;
      } else if (rotation % 360 === 180) {
        x = ow - rx;
        y = oh - ry;
      } else {
        x = ow - ry;
        y = rx;
      }
      return { x: clamp(x, 0, ow), y: clamp(y, 0, oh) };
    }

    function renderHandles() {
      const disp = corners.map(rotatePointForDisplay);
      svg.setAttribute("viewBox", `0 0 ${dispW} ${dispH}`);
      const poly = disp.map((p) => `${p.x},${p.y}`).join(" ");
      svg.innerHTML = `
        <polygon class="crop-edge" points="${poly}" />
        ${disp.map((p, i) => `<circle class="crop-handle" data-i="${i}" cx="${p.x}" cy="${p.y}" r="13" />`).join("")}
      `;
      bindHandles();
    }

    let dragIndex = -1;
    function bindHandles() {
      svg.querySelectorAll(".crop-handle").forEach((h) => {
        h.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          dragIndex = Number(h.dataset.i);
          h.setPointerCapture(e.pointerId);
        });
      });
    }

    function onMove(e) {
      if (dragIndex < 0) return;
      const rect = canvas.getBoundingClientRect();
      const dx = clamp(e.clientX - rect.left, 0, dispW);
      const dy = clamp(e.clientY - rect.top, 0, dispH);
      corners[dragIndex] = displayToOriginal(dx, dy);
      renderHandles();
    }
    function onUp() {
      dragIndex = -1;
    }
    svg.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    function redraw() {
      drawBase();
      renderHandles();
    }

    // Buttons
    root.querySelector("#cropCancel").onclick = () => close(null);
    root.querySelector("#cropReset").onclick = () => {
      corners = detectCorners(img);
      redraw();
    };
    root.querySelector("#cropFull").onclick = () => {
      corners = [
        { x: 0, y: 0 },
        { x: img.naturalWidth, y: 0 },
        { x: img.naturalWidth, y: img.naturalHeight },
        { x: 0, y: img.naturalHeight },
      ];
      redraw();
    };
    root.querySelector("#cropRotate").onclick = () => {
      rotation = (rotation + 90) % 360;
      redraw();
    };
    root.querySelector("#cropConfirm").onclick = () => {
      const busy = showBusy(root, "Processing…");
      // Defer to next frame so the spinner paints before the heavy warp.
      requestAnimationFrame(() => {
        setTimeout(() => {
          try {
            const src = rotatedCanvas(img, rotation);
            const mapped = orderCorners(corners.map((p) => mapCornerToRotated(p, img, rotation)));
            const flat = warpPerspective(src, mapped, 1800);
            busy.remove();
            close(flat);
          } catch (err) {
            busy.remove();
            console.error(err);
            close(null);
          }
        }, 16);
      });
    };

    function close(result) {
      window.removeEventListener("pointerup", onUp);
      root.remove();
      resolve(result);
    }

    // Initial paint (wait a frame for layout to settle).
    requestAnimationFrame(() => redraw());
    window.addEventListener("resize", redraw);
  });
}

function mapCornerToRotated(p, img, rotation) {
  const ow = img.naturalWidth;
  const oh = img.naturalHeight;
  if (rotation % 360 === 0) return { x: p.x, y: p.y };
  if (rotation % 360 === 90) return { x: oh - p.y, y: p.x };
  if (rotation % 360 === 180) return { x: ow - p.x, y: oh - p.y };
  return { x: p.y, y: ow - p.x };
}

function rotatedCanvas(img, rotation) {
  const swap = rotation % 180 !== 0;
  const w = swap ? img.naturalHeight : img.naturalWidth;
  const h = swap ? img.naturalWidth : img.naturalHeight;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  ctx.translate(w / 2, h / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  return c;
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function showBusy(parent, text) {
  const el = document.createElement("div");
  el.className = "overlay-busy";
  el.innerHTML = `<div class="spin"></div><div>${text}</div>`;
  parent.appendChild(el);
  return el;
}

function rotateIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`;
}
