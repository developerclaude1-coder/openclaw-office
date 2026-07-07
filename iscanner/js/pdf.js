// pdf.js — minimal PDF writer that embeds JPEG images, one per page.
// No external dependencies. Produces a valid PDF 1.3 file as a Blob.
// Each image is embedded directly using the DCTDecode (JPEG) filter, so no
// re-encoding is needed and file size stays small.

/**
 * @param {Array<{jpeg: Uint8Array, width: number, height: number}>} pages
 * @returns {Blob} application/pdf
 */
export function buildPdf(pages) {
  const enc = new TextEncoder();
  /** @type {Array<Uint8Array>} */
  const chunks = [];
  let offset = 0;
  const offsets = [];

  const push = (bytes) => {
    chunks.push(bytes);
    offset += bytes.length;
  };
  const pushStr = (s) => push(enc.encode(s));

  // Object numbering:
  // 1: Catalog, 2: Pages tree, then per page: pageObj, imageObj, contentObj.
  const pageCount = pages.length;
  const objCount = 2 + pageCount * 3;

  const startObj = (num) => {
    offsets[num] = offset;
    pushStr(`${num} 0 obj\n`);
  };
  const endObj = () => pushStr("endobj\n");

  pushStr("%PDF-1.3\n%\xE2\xE3\xCF\xD3\n");

  // 1: Catalog
  startObj(1);
  pushStr("<< /Type /Catalog /Pages 2 0 R >>\n");
  endObj();

  // 2: Pages tree
  const kids = [];
  for (let i = 0; i < pageCount; i++) kids.push(`${3 + i * 3} 0 R`);
  startObj(2);
  pushStr(`<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${pageCount} >>\n`);
  endObj();

  // A4-proportioned page sized to the image aspect ratio, at 72 dpi points.
  pages.forEach((pg, i) => {
    const pageNum = 3 + i * 3;
    const imgNum = pageNum + 1;
    const contentNum = pageNum + 2;

    // Fit the image onto a page with a max dimension of 842pt (A4 long edge).
    const maxPt = 842;
    const ar = pg.width / pg.height;
    let pw, ph;
    if (ar >= 1) {
      pw = maxPt;
      ph = maxPt / ar;
    } else {
      ph = maxPt;
      pw = maxPt * ar;
    }
    pw = Math.round(pw);
    ph = Math.round(ph);

    // Page object
    startObj(pageNum);
    pushStr(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] ` +
        `/Resources << /XObject << /Im0 ${imgNum} 0 R >> >> ` +
        `/Contents ${contentNum} 0 R >>\n`,
    );
    endObj();

    // Image XObject
    startObj(imgNum);
    pushStr(
      `<< /Type /XObject /Subtype /Image /Width ${pg.width} /Height ${pg.height} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode ` +
        `/Length ${pg.jpeg.length} >>\nstream\n`,
    );
    push(pg.jpeg);
    pushStr("\nendstream\n");
    endObj();

    // Content stream: draw the image scaled to the page.
    const content = `q\n${pw} 0 0 ${ph} 0 0 cm\n/Im0 Do\nQ\n`;
    const contentBytes = enc.encode(content);
    startObj(contentNum);
    pushStr(`<< /Length ${contentBytes.length} >>\nstream\n`);
    push(contentBytes);
    pushStr("endstream\n");
    endObj();
  });

  // xref table
  const xrefStart = offset;
  const total = objCount + 1;
  pushStr(`xref\n0 ${total}\n`);
  pushStr("0000000000 65535 f \n");
  for (let n = 1; n <= objCount; n++) {
    const off = offsets[n] || 0;
    pushStr(`${String(off).padStart(10, "0")} 00000 n \n`);
  }
  pushStr(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`);

  return new Blob(chunks, { type: "application/pdf" });
}

/** Convert a canvas to a JPEG Uint8Array at the given quality. */
export function canvasToJpeg(canvas, quality = 0.82) {
  return new Promise((resolve) => {
    canvas.toBlob(
      async (blob) => {
        const buf = new Uint8Array(await blob.arrayBuffer());
        resolve({ jpeg: buf, width: canvas.width, height: canvas.height });
      },
      "image/jpeg",
      quality,
    );
  });
}
