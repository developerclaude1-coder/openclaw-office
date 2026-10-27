// filters.js — scan enhancement filters applied to a canvas.
// Each filter takes a source canvas and returns a NEW canvas.

function cloneCanvas(src) {
  const c = document.createElement("canvas");
  c.width = src.width;
  c.height = src.height;
  c.getContext("2d").drawImage(src, 0, 0);
  return c;
}

function withPixels(src, fn) {
  const c = cloneCanvas(src);
  const ctx = c.getContext("2d", { willReadFrequently: true });
  const img = ctx.getImageData(0, 0, c.width, c.height);
  fn(img.data, c.width, c.height);
  ctx.putImageData(img, 0, 0);
  return c;
}

/** Original — passthrough, but honours brightness/contrast. */
export function original(src, opts = {}) {
  return adjust(src, opts);
}

/** Brightness/contrast adjustment. brightness/contrast in [-100,100]. */
export function adjust(src, { brightness = 0, contrast = 0 } = {}) {
  if (!brightness && !contrast) return cloneCanvas(src);
  const b = brightness * 1.28;
  const c = (259 * (contrast + 255)) / (255 * (259 - contrast));
  return withPixels(src, (d) => {
    for (let i = 0; i < d.length; i += 4) {
      for (let ch = 0; ch < 3; ch++) {
        let v = d[i + ch] + b;
        v = c * (v - 128) + 128;
        d[i + ch] = v < 0 ? 0 : v > 255 ? 255 : v;
      }
    }
  });
}

/** Grayscale. */
export function grayscale(src, opts = {}) {
  const base = adjust(src, opts);
  return withPixels(base, (d) => {
    for (let i = 0; i < d.length; i += 4) {
      const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      d[i] = d[i + 1] = d[i + 2] = g;
    }
  });
}

/**
 * Black & white "scan" look via adaptive thresholding (local mean).
 * Produces clean text on a white background even with uneven lighting.
 */
export function blackwhite(src, opts = {}) {
  const base = grayscale(src, opts);
  const w = base.width;
  const h = base.height;
  const ctx = base.getContext("2d", { willReadFrequently: true });
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;

  // Integral image of luminance for fast local mean.
  const integral = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let rowSum = 0;
    for (let x = 0; x < w; x++) {
      rowSum += d[(y * w + x) * 4];
      integral[(y + 1) * (w + 1) + (x + 1)] = integral[y * (w + 1) + (x + 1)] + rowSum;
    }
  }

  const radius = Math.max(8, Math.round(Math.min(w, h) / 22));
  const tune = 0.86; // pixel is black if below tune * local mean
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - radius);
    const y1 = Math.min(h - 1, y + radius);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(w - 1, x + radius);
      const count = (x1 - x0 + 1) * (y1 - y0 + 1);
      const sum =
        integral[(y1 + 1) * (w + 1) + (x1 + 1)] -
        integral[y0 * (w + 1) + (x1 + 1)] -
        integral[(y1 + 1) * (w + 1) + x0] +
        integral[y0 * (w + 1) + x0];
      const mean = sum / count;
      const i = (y * w + x) * 4;
      const v = d[i] < mean * tune ? 0 : 255;
      d[i] = d[i + 1] = d[i + 2] = v;
    }
  }
  ctx.putImageData(img, 0, 0);
  return base;
}

/**
 * "Magic color" enhancement — whitens the background, boosts saturation and
 * contrast for a crisp colour scan. Good default for documents & receipts.
 */
export function magic(src, opts = {}) {
  const base = adjust(src, { brightness: 6 + (opts.brightness || 0), contrast: 22 + (opts.contrast || 0) });
  return withPixels(base, (d) => {
    // White-balance: stretch so near-white paper becomes true white.
    // Estimate the bright reference from a high percentile per channel.
    const hist = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)];
    for (let i = 0; i < d.length; i += 4) {
      hist[0][d[i]]++;
      hist[1][d[i + 1]]++;
      hist[2][d[i + 2]]++;
    }
    const total = d.length / 4;
    const hi = hist.map((hst) => {
      let acc = 0;
      for (let v = 255; v >= 0; v--) {
        acc += hst[v];
        if (acc > total * 0.06) return Math.max(160, v);
      }
      return 255;
    });
    const gain = hi.map((v) => 255 / v);
    for (let i = 0; i < d.length; i += 4) {
      for (let ch = 0; ch < 3; ch++) {
        let v = d[i + ch] * gain[ch];
        d[i + ch] = v > 255 ? 255 : v;
      }
      // Mild saturation boost.
      const r = d[i],
        g = d[i + 1],
        b = d[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const sat = 1.18;
      d[i] = clamp(lum + (r - lum) * sat);
      d[i + 1] = clamp(lum + (g - lum) * sat);
      d[i + 2] = clamp(lum + (b - lum) * sat);
    }
  });
}

function clamp(v) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

export const FILTERS = [
  { id: "magic", label: "Enhance", fn: magic },
  { id: "original", label: "Original", fn: original },
  { id: "grayscale", label: "Grayscale", fn: grayscale },
  { id: "bw", label: "B & W", fn: blackwhite },
];

export function applyFilter(id, src, opts) {
  const found = FILTERS.find((f) => f.id === id) || FILTERS[1];
  return found.fn(src, opts);
}
