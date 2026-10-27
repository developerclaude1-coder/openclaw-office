// capture.js — shared capture pipeline: pick image file(s), then run a photo
// through the crop + filter editors to produce a finished page canvas.

import { openCropEditor } from "./crop-editor.js";
import { openFilterEditor } from "./filter-editor.js";
import { toast } from "./ui.js";

/** Load a File into an HTMLImageElement. */
export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("load failed"));
    };
    img.src = url;
  });
}

/**
 * Open a transient file input and resolve the chosen files.
 * @param {{camera?: boolean, multiple?: boolean}} opts
 * @returns {Promise<File[]>}
 */
export function pickFiles({ camera = false, multiple = false } = {}) {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    if (camera) input.capture = "environment";
    if (multiple) input.multiple = true;
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    let settled = false;
    const done = (files) => {
      if (settled) return;
      settled = true;
      input.remove();
      resolve(files);
    };
    input.addEventListener("change", () => done(Array.from(input.files || [])));
    // If the picker is dismissed, focus returns without a change event.
    window.addEventListener(
      "focus",
      () => setTimeout(() => done(Array.from(input.files || [])), 400),
      { once: true },
    );
    input.click();
  });
}

/**
 * Run one image file through crop + filter. Returns the finished canvas or null
 * if the user cancelled at any step.
 * @param {File} file
 * @returns {Promise<HTMLCanvasElement|null>}
 */
export async function processImageFile(file) {
  let img;
  try {
    img = await loadImage(file);
  } catch {
    toast("Could not read image");
    return null;
  }
  const flat = await openCropEditor(img);
  URL.revokeObjectURL(img.src);
  if (!flat) return null;
  return openFilterEditor(flat);
}
