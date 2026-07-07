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
- 🧾 **Export to PDF** and share via the native share sheet, or download
- 💾 **Local storage** (IndexedDB) — your scans stay on your device
- 📴 **Offline** — installable PWA with a service worker

## Use it on your phone

Camera access requires **HTTPS**, so the app must be served over https (or
`localhost`). Two easy options:

### Option A — GitHub Pages (recommended)

This repo includes a workflow at `.github/workflows/deploy-scanner.yml` that
publishes the `iscanner/` folder to GitHub Pages.

1. In your repository, go to **Settings → Pages** and set
   **Build and deployment → Source** to **GitHub Actions**.
2. Push this branch (or merge to `main`). The **Deploy Scanly** workflow runs
   and prints the published URL (something like
   `https://<user>.github.io/<repo>/`).
3. Open that URL on your phone → the app loads at
   `.../iscanner/` (open `.../index.html` if needed).
4. **Add to Home Screen**:
   - iOS Safari: Share → *Add to Home Screen*
   - Android Chrome: ⋮ menu → *Install app* / *Add to Home screen*

### Option B — run it locally

From the repo root:

```bash
# any static server works; must be reachable over https for camera on a phone
npx serve iscanner
# or
python3 -m http.server -d iscanner 8080
```

Open `http://localhost:8080` on the same machine, or expose it over https
(e.g. with a tunneling tool) to reach it from your phone's camera.

## How it works

Everything runs in the browser with **zero dependencies**:

| File | Responsibility |
| --- | --- |
| `js/app.js` | App shell, routing, capture flow, library & document views |
| `js/crop-editor.js` | Full-screen corner-adjust UI |
| `js/edge-detect.js` | Automatic document-corner detection (Sobel-based) |
| `js/geometry.js` | Homography solve + perspective warp (bilinear) |
| `js/filter-editor.js` | Filter picker with live preview |
| `js/filters.js` | Enhance / grayscale / adaptive B & W / adjustments |
| `js/pdf.js` | Minimal PDF writer that embeds JPEG pages |
| `js/db.js` | IndexedDB persistence |
| `js/export.js` | PDF build + Web Share / download |
| `sw.js` | Offline service worker |

## Privacy

Scans never leave your device — there is no backend. Documents live in your
browser's IndexedDB and PDFs are generated locally.
