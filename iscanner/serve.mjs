// serve.mjs — tiny dependency-free static server for the Scanly PWA.
// Run on your server VM:  node iscanner/serve.mjs   (listens on 0.0.0.0:PORT)
//
// Env:
//   PORT   port to listen on (default 8080)
//   HOST   interface to bind (default 0.0.0.0 — reachable from your phone)
//
// NOTE: browsers require HTTPS (or localhost) for camera access. For phone use,
// put this behind a reverse proxy that terminates TLS (see README — Caddy gives
// you automatic HTTPS with a domain), or use the Docker/Caddy compose file.

import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

// Assets that must never be stale, so app updates propagate to installed PWAs.
const NO_CACHE = new Set(["/sw.js", "/index.html", "/", "/manifest.webmanifest"]);

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    let rel = urlPath === "/" ? "/index.html" : urlPath;
    // Prevent path traversal.
    const filePath = path.join(ROOT, path.normalize(rel));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    let info;
    try {
      info = await stat(filePath);
    } catch {
      // SPA-style fallback to index.html for unknown non-file routes.
      return sendFile(res, path.join(ROOT, "index.html"), "/index.html", 200);
    }
    if (info.isDirectory()) {
      return sendFile(res, path.join(filePath, "index.html"), rel, 200);
    }
    return sendFile(res, filePath, rel, 200);
  } catch (err) {
    res.writeHead(500).end("Server error");
  }
});

function sendFile(res, filePath, rel, status) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  const cache = NO_CACHE.has(rel) || ext === ".html"
    ? "no-cache"
    : "public, max-age=3600";
  res.writeHead(status, {
    "content-type": type,
    "cache-control": cache,
    "x-content-type-options": "nosniff",
  });
  const stream = createReadStream(filePath);
  stream.on("error", () => res.end());
  stream.pipe(res);
}

server.listen(PORT, HOST, () => {
  console.log(`Scanly serving ${ROOT}`);
  console.log(`  local:   http://localhost:${PORT}/`);
  console.log(`  network: http://${HOST}:${PORT}/  (open this on your phone; HTTPS needed for camera)`);
});
