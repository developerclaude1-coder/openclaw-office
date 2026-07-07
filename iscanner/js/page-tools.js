// page-tools.js — helpers for page-level operations: export a page as a JPG,
// and compose two captures (e.g. an ID card front & back) onto one A4 page.

/** Download a single page's JPEG. */
export function exportPageJpg(page, name) {
  const url = URL.createObjectURL(page.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (name || "page").replace(/[^\w\-]+/g, "_") + ".jpg";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

/**
 * Compose two card images onto a single portrait A4 page, stacked with a gap,
 * each centred and scaled to fit. Returns a canvas.
 * @param {HTMLCanvasElement} front
 * @param {HTMLCanvasElement} back
 * @returns {HTMLCanvasElement}
 */
export function composeIdCard(front, back) {
  const W = 1240; // ~150dpi A4 width
  const H = 1754;
  const page = document.createElement("canvas");
  page.width = W;
  page.height = H;
  const ctx = page.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  const margin = 90;
  const gap = 80;
  const slotW = W - margin * 2;
  const slotH = (H - margin * 2 - gap) / 2;

  drawFit(ctx, front, margin, margin, slotW, slotH);
  if (back) drawFit(ctx, back, margin, margin + slotH + gap, slotW, slotH);
  return page;
}

function drawFit(ctx, src, x, y, boxW, boxH) {
  const s = Math.min(boxW / src.width, boxH / src.height);
  const w = src.width * s;
  const h = src.height * s;
  ctx.drawImage(src, x + (boxW - w) / 2, y + (boxH - h) / 2, w, h);
}
