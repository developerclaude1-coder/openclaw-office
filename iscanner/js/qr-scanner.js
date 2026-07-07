// qr-scanner.js — live QR / barcode reader using the built-in BarcodeDetector
// (available in Chromium-based mobile browsers). Falls back to a clear message
// when the API isn't supported.

import { toast, escapeHtml } from "./ui.js";

/** Open the live scanner. Resolves when the user closes it. */
export function openQrScanner() {
  return new Promise(async (resolve) => {
    const root = document.createElement("div");
    root.className = "editor";
    root.innerHTML = `
      <div class="editor-top">
        <button class="btn ghost" id="qrClose">Close</button>
        <div class="title">Scan QR / barcode</div>
        <span style="width:44px"></span>
      </div>
      <div class="editor-stage" style="flex-direction:column; gap:14px;">
        <video id="qrVideo" playsinline muted style="max-width:100vw; max-height:60vh; border-radius:12px;"></video>
        <div id="qrHint" style="color:var(--muted); font-size:14px; text-align:center; padding:0 20px;">
          Point the camera at a QR code or barcode…
        </div>
      </div>
      <div id="qrResult"></div>
    `;
    document.body.appendChild(root);

    const video = root.querySelector("#qrVideo");
    const resultEl = root.querySelector("#qrResult");
    let stream = null;
    let stop = false;

    const close = () => {
      stop = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      root.remove();
      resolve();
    };
    root.querySelector("#qrClose").onclick = close;

    if (!("BarcodeDetector" in window)) {
      root.querySelector("#qrHint").innerHTML =
        "Your browser doesn't support live barcode scanning.<br/>On iPhone, the built-in Camera app reads QR codes; on Android, use Chrome.";
      return;
    }

    let detector;
    try {
      const formats = await window.BarcodeDetector.getSupportedFormats();
      detector = new window.BarcodeDetector({ formats });
    } catch {
      detector = new window.BarcodeDetector();
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      video.srcObject = stream;
      await video.play();
    } catch {
      root.querySelector("#qrHint").textContent = "Camera permission is needed to scan.";
      return;
    }

    const seen = new Set();
    const tick = async () => {
      if (stop) return;
      try {
        const codes = await detector.detect(video);
        for (const c of codes) {
          if (c.rawValue && !seen.has(c.rawValue)) {
            seen.add(c.rawValue);
            showResult(c.rawValue, c.format, resultEl);
            if (navigator.vibrate) navigator.vibrate(60);
          }
        }
      } catch {
        /* transient detect errors are fine; keep polling */
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function showResult(value, format, container) {
  const isUrl = /^https?:\/\//i.test(value);
  const card = document.createElement("div");
  card.style.cssText =
    "background:var(--surface); border-top:1px solid var(--border); padding:14px 16px calc(var(--safe-bottom) + 14px);";
  card.innerHTML = `
    <div class="badge" style="margin-bottom:8px">${escapeHtml(format || "code")}</div>
    <div style="word-break:break-all; font-size:15px; margin-bottom:12px;">${escapeHtml(value)}</div>
    <div style="display:flex; gap:10px;">
      ${isUrl ? `<a class="btn primary" style="flex:1" href="${escapeHtml(value)}" target="_blank" rel="noopener">Open link</a>` : ""}
      <button class="btn" id="qrCopy" style="flex:1">Copy</button>
    </div>`;
  container.innerHTML = "";
  container.appendChild(card);
  card.querySelector("#qrCopy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast("Copied");
    } catch {
      toast("Copy not available");
    }
  };
}
