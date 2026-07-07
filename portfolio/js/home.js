/* Renders the cover page: profile, project gallery grouped by status, about. */

function cardHtml(p) {
  const pct = progressPct(p);
  const isImg = p.cover && /[\/.]/.test(p.cover);
  const thumb = isImg
    ? `<img src="${esc(p.cover)}" alt="${esc(p.title)}">`
    : esc(p.cover || "📄");
  const tags = (p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("");
  const badge = p.status
    ? `<span class="badge ${esc(p.status)}">${esc(STATUS_LABEL[p.status] || p.status)}</span>`
    : "";
  const progress = pct !== null && p.status !== "shipped"
    ? `<div class="progress-row"><div class="bar"><span style="width:${pct}%"></span></div><span class="pct">${pct}%</span></div>`
    : "";
  return `
    <a class="card" href="project.html?id=${encodeURIComponent(p.id)}">
      <div class="thumb">${thumb}</div>
      <div class="body">
        <div class="meta">${esc(p.year || "")} ${badge}</div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.blurb || "")}</p>
        ${tags ? `<div class="tags">${tags}</div>` : ""}
        ${progress}
      </div>
    </a>`;
}

function sectionHtml(title, list) {
  if (!list.length) return "";
  return `
    <div class="section-head">
      <h2>${esc(title)}</h2>
      <span class="rule"></span>
      <span class="count">${list.length}</span>
    </div>
    <div class="grid">${list.map(cardHtml).join("")}</div>`;
}

function renderHome() {
  // profile
  document.getElementById("brand").innerHTML =
    `${esc(PROFILE.name)}<span class="dot">.</span>`;
  document.getElementById("cover-name").textContent = PROFILE.name;
  document.getElementById("cover-tagline").textContent = PROFILE.tagline || "";
  document.getElementById("about-text").textContent = PROFILE.about || "";
  document.getElementById("footer-name").textContent = PROFILE.name;

  const linksHtml = (PROFILE.links || [])
    .map((l) => `<a href="${esc(l.href)}"${/^https?:/.test(l.href) ? ' target="_blank" rel="noopener"' : ""}>${esc(l.label)}</a>`)
    .join("");
  document.getElementById("cover-links").innerHTML = linksHtml;

  // group projects by status
  const inProgress = PROJECTS.filter((p) => p.status === "in-progress");
  const planned = PROJECTS.filter((p) => p.status === "planned");
  const shipped = PROJECTS.filter((p) => p.status === "shipped");
  const other = PROJECTS.filter((p) => !["in-progress", "planned", "shipped"].includes(p.status));

  const html =
    sectionHtml("On the workbench", inProgress) +
    sectionHtml("Next up", planned) +
    sectionHtml("Shipped", shipped) +
    sectionHtml("More pages", other);

  document.getElementById("gallery").innerHTML =
    html || `<p class="empty">No projects yet — add some in <code>js/data.js</code>.</p>`;
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderHome();
});
