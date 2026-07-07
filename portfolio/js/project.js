/* Renders a single project page from ?id=... including its progression map. */

function blockHtml(b) {
  switch (b.type) {
    case "heading":
      return `<h2>${esc(b.body)}</h2>`;
    case "list":
      return `<ul>${(b.items || []).map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
    case "quote":
      return `<blockquote>${esc(b.body)}</blockquote>`;
    case "image":
      if (b.src) {
        return `<figure><img src="${esc(b.src)}" alt="${esc(b.caption || "")}">` +
          (b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : "") + `</figure>`;
      }
      return `<figure><div class="placeholder">🖼️ ${esc(b.caption || "Add an image path in js/data.js")}</div></figure>`;
    case "text":
    default:
      return `<p>${esc(b.body)}</p>`;
  }
}

function roadmapHtml(p) {
  const steps = p.progress || [];
  if (!steps.length) return "";
  const pct = progressPct(p);
  // "current" = first not-done step
  const firstOpen = steps.findIndex((s) => !s.done);
  const items = steps.map((s, i) => {
    const cls = s.done ? "done" : i === firstOpen ? "current" : "";
    return `<li class="step ${cls}"><span class="node"></span><span class="label">${esc(s.label)}</span></li>`;
  }).join("");
  return `
    <section class="roadmap">
      <div class="rhead">
        <h2>Progression map</h2>
        <span class="pct">${pct}%</span>
      </div>
      <ul class="steps">${items}</ul>
    </section>`;
}

function neighbor(idx, dir) {
  const p = PROJECTS[idx + dir];
  if (!p) return "";
  const cls = dir < 0 ? "prev" : "next";
  const lbl = dir < 0 ? "← Previous" : "Next →";
  return `<a class="${cls}" href="project.html?id=${encodeURIComponent(p.id)}">
      <div class="lbl">${lbl}</div><div class="ttl">${esc(p.title)}</div></a>`;
}

function renderProject() {
  initTheme();
  const id = new URLSearchParams(location.search).get("id");
  const idx = PROJECTS.findIndex((p) => p.id === id);
  const p = PROJECTS[idx];
  const root = document.getElementById("project");

  document.getElementById("brand").innerHTML = `${esc(PROFILE.name)}<span class="dot">.</span>`;

  if (!p) {
    root.innerHTML = `<p class="empty">That page isn't in the sketchbook. <a href="index.html">Back to the cover →</a></p>`;
    return;
  }

  document.title = `${p.title} — ${PROFILE.name}`;

  const isImg = p.cover && /[\/.]/.test(p.cover);
  const head = isImg ? "" : `<div class="emoji">${esc(p.cover || "📄")}</div>`;
  const badge = p.status
    ? `<span class="badge ${esc(p.status)}">${esc(STATUS_LABEL[p.status] || p.status)}</span>`
    : "";
  const tags = (p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("");
  const links = (p.links || [])
    .map((l) => `<a href="${esc(l.href)}"${/^https?:/.test(l.href) ? ' target="_blank" rel="noopener"' : ""}>${esc(l.label)}</a>`)
    .join("");
  const body = (p.sections || []).map(blockHtml).join("");

  root.innerHTML = `
    <a class="back" href="index.html">← Back to the sketchbook</a>
    <header class="project-head">
      ${head}
      <h1>${esc(p.title)}</h1>
      <div class="meta">${esc(p.year || "")} &nbsp;${badge}</div>
      ${tags ? `<div class="tags" style="margin-top:12px">${tags}</div>` : ""}
      ${links ? `<div class="links">${links}</div>` : ""}
    </header>
    ${roadmapHtml(p)}
    <div class="article">${body}</div>
    <nav class="pager">${neighbor(idx, -1)}${neighbor(idx, 1)}</nav>`;
}

document.addEventListener("DOMContentLoaded", renderProject);
