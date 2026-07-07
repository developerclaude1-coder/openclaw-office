# Scanly — a document-scanner PWA

Scanly is a self-contained document scanner you run in your **phone's browser**
and install to your home screen. Point your camera at a document, adjust the
edges, pick a scan filter, and export a multi-page **PDF** — all on-device.
It works **offline** once installed and needs no accounts or servers.

This is an original, open implementation of the core features of a mobile
document scanner (capture → crop → enhance → PDF). It is not affiliated with,
and contains no code or assets from, any commercial scanner app.

## Features

- 📷 **Capture** from the rear camera, or import photos from your gallery
- ✂️ **Auto edge detection** with draggable corners for precise cropping
- 🔲 **Perspective correction** — flattens an angled photo into a straight page
- ✨ **Scan filters** — Enhance (magic color), Original, Grayscale, adaptive B & W
- 🎚️ **Brightness / contrast** fine-tuning
- 📄 **Multi-page documents** — add, remove and reorder pages
- ✍️ **Sign & annotate** — draw a saved signature, freehand pen, and text stamps
- 🔤 **OCR** — extract & copy text from a scan (recognition engine loads on first use)
- 🔳 **QR & barcode reader** — live camera scan (via the browser's BarcodeDetector)
- 🔢 **Object counter (beta)** — count separated objects in a photo, with tap-to-correct
- 🪪 **ID-card mode** — place a card's front & back on a single page
- 🔗 **Merge** documents together
- 🧾 **Export to PDF** / share, or export a page as **JPG**
- 💾 **Local storage** (IndexedDB) — your scans stay on your device
- 📴 **Offline** — installable PWA with a service worker

> **Not included:** AR room/area measurement and real-time on-screen object
> identification. Those depend on ARKit/ARCore and on-device ML models that a
> cross-platform web app can't provide reliably (iOS Safari has no AR API); a
> native app is the right tool for those. The photo **object counter** above is
> an image-processing approximation of "counting", not AR.

## Host it on your own server / VM

Scanly is static files, so it runs on any always-on box — your server VM — with
no build step and no external services. Camera access requires **HTTPS** (or
`localhost`), so for phone use terminate TLS with the bundled Caddy option.

### Option A — Docker + automatic HTTPS (recommended for phone use)

On the VM, with a DNS name pointing at it:

```bash
git clone <this-repo> && cd <repo>/iscanner
export SCANLY_DOMAIN=scan.example.com   # A record must point at this VM
docker compose --profile tls up -d
```

Caddy fetches a real certificate automatically. Open `https://scan.example.com/`
on your phone → **Add to Home Screen** (iOS Safari: Share → *Add to Home
Screen*; Android Chrome: ⋮ → *Install app*).

HTTP only (behind an existing proxy, or for LAN testing):

```bash
docker compose up -d scanly     # -> http://<vm-host>:8080/
```

### Option B — no Docker, just Node

```bash
node iscanner/serve.mjs          # binds 0.0.0.0:8080 by default
# PORT=9000 HOST=0.0.0.0 node iscanner/serve.mjs
```

Run it under a process manager (systemd / pm2) so it stays up. Put it behind a
TLS-terminating reverse proxy (Caddy/nginx/Traefik) for phone camera access.

### Option C — GitHub Pages

A manual workflow at `.github/workflows/deploy-scanner.yml` can publish
`iscanner/` to GitHub Pages (Settings → Pages → Source: *GitHub Actions*, then
run the **Deploy Scanly** workflow). Kept as a fallback; self-hosting on your VM
is the primary path.

## How it works

Everything runs in the browser with **zero dependencies**:

| File | Responsibility |
| --- | --- |
| `js/app.js` | App shell, routing, library & document views, `+` menu |
| `js/capture.js` | Shared capture pipeline (pick → crop → filter) |
| `js/crop-editor.js` | Full-screen corner-adjust UI |
| `js/edge-detect.js` | Automatic document-corner detection (Sobel-based) |
| `js/geometry.js` | Homography solve + perspective warp (bilinear) |
| `js/filter-editor.js` / `js/filters.js` | Filter picker + Enhance / grayscale / adaptive B & W |
| `js/annotate.js` | Sign & annotate (signature pad, pen, text) |
| `js/qr-scanner.js` | Live QR / barcode reader (BarcodeDetector) |
| `js/counter.js` | Photo object counter (connected-component blobs) |
| `js/ocr.js` | Text extraction (Tesseract.js, lazy-loaded) |
| `js/page-tools.js` / `js/doc-actions.js` | ID-card compose, JPG export, reorder, merge |
| `js/pdf.js` | Minimal PDF writer that embeds JPEG pages |
| `js/db.js` / `js/export.js` | IndexedDB persistence, PDF build + share |
| `sw.js` | Offline service worker |
| `serve.mjs` / `Dockerfile` / `docker-compose.yml` / `Caddyfile` | Self-hosting on your VM |

## Privacy

Scans never leave your device — there is no backend. Documents live in your
browser's IndexedDB and PDFs are generated locally.
