/* Shared helpers: theme toggle, escaping, progress math. */

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

/* Percentage of milestones completed (0–100). */
function progressPct(project) {
  const steps = project.progress || [];
  if (!steps.length) return null;
  const done = steps.filter((s) => s.done).length;
  return Math.round((done / steps.length) * 100);
}

const STATUS_LABEL = {
  shipped: "Shipped",
  "in-progress": "In progress",
  planned: "Planned",
};

/* Light/dark toggle. Remembers choice in localStorage. */
function initTheme() {
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem("sketchbook-theme"); } catch (e) {}
  if (saved) root.setAttribute("data-theme", saved);

  const btn = document.querySelector(".theme-toggle");
  if (!btn) return;
  const paint = () => {
    const dark = (root.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark";
    btn.textContent = dark ? "☀" : "☾";
    btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  };
  paint();
  btn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("sketchbook-theme", next); } catch (e) {}
    paint();
  });
}
