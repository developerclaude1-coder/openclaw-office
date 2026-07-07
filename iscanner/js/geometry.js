// geometry.js — perspective correction via homography.
// Given four source corners of a document in an image, warp it to a flat
// rectangle. Pure JS, no dependencies.

/**
 * Solve the 8x8 linear system for a projective transform mapping the unit
 * quad's four corners (src) to destination corners (dst).
 * Returns the 8 homography coefficients [a,b,c,d,e,f,g,h] for:
 *   x' = (a*x + b*y + c) / (g*x + h*y + 1)
 *   y' = (d*x + e*y + f) / (g*x + h*y + 1)
 * @param {Array<{x:number,y:number}>} src four source points
 * @param {Array<{x:number,y:number}>} dst four destination points
 */
function solveHomography(src, dst) {
  const a = [];
  const b = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i];
    const { x: X, y: Y } = dst[i];
    a.push([x, y, 1, 0, 0, 0, -X * x, -X * y]);
    b.push(X);
    a.push([0, 0, 0, x, y, 1, -Y * x, -Y * y]);
    b.push(Y);
  }
  return gaussianSolve(a, b);
}

/** Solve a linear system A·h = b via Gaussian elimination with partial pivoting. */
function gaussianSolve(A, b) {
  const n = b.length;
  const m = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r;
    }
    [m[col], m[pivot]] = [m[pivot], m[col]];
    const pv = m[col][col] || 1e-9;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = m[r][col] / pv;
      for (let c = col; c <= n; c++) m[r][c] -= factor * m[col][c];
    }
  }
  return m.map((row, i) => row[n] / (m[i][i] || 1e-9));
}

/**
 * Estimate the output size of the flattened document from the source quad.
 * Uses the average of opposite edge lengths, capped to a max dimension.
 * @param {Array<{x:number,y:number}>} corners ordered TL,TR,BR,BL
 * @param {number} maxDim maximum width/height of the output
 */
export function estimateOutputSize(corners, maxDim = 1600) {
  const [tl, tr, br, bl] = corners;
  const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
  let w = (dist(tl, tr) + dist(bl, br)) / 2;
  let h = (dist(tl, bl) + dist(tr, br)) / 2;
  w = Math.max(1, Math.round(w));
  h = Math.max(1, Math.round(h));
  const scale = Math.min(1, maxDim / Math.max(w, h));
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

/**
 * Warp the region bounded by `corners` in `source` into a flat rectangle.
 * Uses inverse mapping (dst -> src) with bilinear sampling.
 * @param {HTMLCanvasElement|HTMLImageElement} source
 * @param {Array<{x:number,y:number}>} corners ordered TL,TR,BR,BL in source px
 * @param {number} maxDim maximum output dimension
 * @returns {HTMLCanvasElement}
 */
export function warpPerspective(source, corners, maxDim = 1600) {
  const sw = source.naturalWidth || source.width;
  const sh = source.naturalHeight || source.height;

  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = sw;
  srcCanvas.height = sh;
  const sctx = srcCanvas.getContext("2d", { willReadFrequently: true });
  sctx.drawImage(source, 0, 0, sw, sh);
  const srcData = sctx.getImageData(0, 0, sw, sh).data;

  const { width: ow, height: oh } = estimateOutputSize(corners, maxDim);

  // Map output (dst) unit rectangle corners back to source corners.
  const dstUnit = [
    { x: 0, y: 0 },
    { x: ow, y: 0 },
    { x: ow, y: oh },
    { x: 0, y: oh },
  ];
  const h = solveHomography(dstUnit, corners); // dst -> src

  const out = document.createElement("canvas");
  out.width = ow;
  out.height = oh;
  const octx = out.getContext("2d");
  const outImg = octx.createImageData(ow, oh);
  const od = outImg.data;
  const [a, b, c, d, e, f, g, hh] = h;

  for (let y = 0; y < oh; y++) {
    for (let x = 0; x < ow; x++) {
      const denom = g * x + hh * y + 1;
      const sx = (a * x + b * y + c) / denom;
      const sy = (d * x + e * y + f) / denom;
      const oi = (y * ow + x) * 4;
      if (sx < 0 || sy < 0 || sx >= sw - 1 || sy >= sh - 1) {
        od[oi] = od[oi + 1] = od[oi + 2] = 255;
        od[oi + 3] = 255;
        continue;
      }
      // Bilinear sample.
      const x0 = sx | 0;
      const y0 = sy | 0;
      const fx = sx - x0;
      const fy = sy - y0;
      const i00 = (y0 * sw + x0) * 4;
      const i10 = i00 + 4;
      const i01 = i00 + sw * 4;
      const i11 = i01 + 4;
      for (let ch = 0; ch < 3; ch++) {
        const top = srcData[i00 + ch] * (1 - fx) + srcData[i10 + ch] * fx;
        const bot = srcData[i01 + ch] * (1 - fx) + srcData[i11 + ch] * fx;
        od[oi + ch] = top * (1 - fy) + bot * fy;
      }
      od[oi + 3] = 255;
    }
  }
  octx.putImageData(outImg, 0, 0);
  return out;
}

/**
 * Order four unordered points as TL, TR, BR, BL.
 * @param {Array<{x:number,y:number}>} pts
 */
export function orderCorners(pts) {
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  const tl = {},
    tr = {},
    br = {},
    bl = {};
  for (const p of pts) {
    if (p.x < cx && p.y < cy) Object.assign(tl, p);
    else if (p.x >= cx && p.y < cy) Object.assign(tr, p);
    else if (p.x >= cx && p.y >= cy) Object.assign(br, p);
    else Object.assign(bl, p);
  }
  // Fallback if any quadrant was empty (degenerate); sort by angle.
  if ([tl, tr, br, bl].some((c) => c.x === undefined)) {
    const sorted = [...pts].sort((p, q) => Math.atan2(p.y - cy, p.x - cx) - Math.atan2(q.y - cy, q.x - cx));
    return sorted;
  }
  return [tl, tr, br, bl];
}
