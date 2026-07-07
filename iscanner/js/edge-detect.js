// edge-detect.js — lightweight automatic document-corner detection.
// Not as robust as OpenCV, but gives a good starting quad the user can nudge.
// Strategy: downscale -> grayscale -> Sobel gradient -> find the tightest
// quad around the strong-edge mass using directional extreme scanning.

import { orderCorners } from "./geometry.js";

/**
 * Detect four document corners in an image element.
 * @param {HTMLImageElement|HTMLCanvasElement} img
 * @returns {Array<{x:number,y:number}>} corners TL,TR,BR,BL in image pixels,
 *   or a sensible default inset quad if detection is weak.
 */
export function detectCorners(img) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const maxW = 320;
  const scale = Math.min(1, maxW / iw);
  const w = Math.max(1, Math.round(iw * scale));
  const h = Math.max(1, Math.round(ih * scale));

  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  // Grayscale.
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }

  // Sobel magnitude.
  const mag = new Float32Array(w * h);
  let maxMag = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx =
        -gray[i - w - 1] - 2 * gray[i - 1] - gray[i + w - 1] + gray[i - w + 1] + 2 * gray[i + 1] + gray[i + w + 1];
      const gy =
        -gray[i - w - 1] - 2 * gray[i - w] - gray[i - w + 1] + gray[i + w - 1] + 2 * gray[i + w] + gray[i + w + 1];
      const m = Math.hypot(gx, gy);
      mag[i] = m;
      if (m > maxMag) maxMag = m;
    }
  }

  const thresh = maxMag * 0.28;
  // Collect strong edge points, ignoring a thin outer border (camera vignette).
  const margin = Math.round(Math.min(w, h) * 0.02);
  const pts = [];
  for (let y = margin; y < h - margin; y++) {
    for (let x = margin; x < w - margin; x++) {
      if (mag[y * w + x] > thresh) pts.push({ x, y });
    }
  }

  const fallback = () =>
    [
      { x: iw * 0.08, y: ih * 0.08 },
      { x: iw * 0.92, y: ih * 0.08 },
      { x: iw * 0.92, y: ih * 0.92 },
      { x: iw * 0.08, y: ih * 0.92 },
    ];

  if (pts.length < 40) return fallback();

  // Find extreme points by four diagonal scoring functions — these tend to
  // land on the actual document corners for a roughly rectangular sheet.
  const corner = (score) => pts.reduce((best, p) => (score(p) > score(best) ? p : best), pts[0]);
  const tl = corner((p) => -(p.x + p.y));
  const tr = corner((p) => p.x - p.y);
  const br = corner((p) => p.x + p.y);
  const bl = corner((p) => -(p.x - p.y));

  const quad = [tl, tr, br, bl].map((p) => ({ x: p.x / scale, y: p.y / scale }));

  // Reject degenerate / tiny detections.
  const area = polygonArea(quad);
  if (area < iw * ih * 0.12) return fallback();

  return orderCorners(quad);
}

function polygonArea(p) {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const j = (i + 1) % p.length;
    a += p[i].x * p[j].y - p[j].x * p[i].y;
  }
  return Math.abs(a) / 2;
}
