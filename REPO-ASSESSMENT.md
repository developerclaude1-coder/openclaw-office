# GitHub Repos — Safety Check & Fit Assessment

**Date:** 2026-07-07
**Reviewer:** Claude (automated assessment)
**Scope:** 9 externally-shared repositories/files, reviewed for (a) malicious intent / malware and (b) fit with our plan for **ETTZ** and for improving the coding agent's own workflow.

> **Note on "ETTZ":** There is no `ETTZ` specification checked into this repository, so this assessment treats ETTZ as the broader **OpenClaw multi‑agent initiative** that OpenClaw Office is the frontend for (real-time agent monitoring + console management over the OpenClaw Gateway). If ETTZ refers to something more specific, the per-repo recommendations still hold — only the "fit" framing would tighten. Please correct the scope if needed.

> **Note on metrics:** Star counts and other popularity figures surfaced during automated fetching were unreliable (a summarizer artifact) and have been deliberately **omitted**. Verify popularity/maintenance directly before adopting anything.

---

## 1. Security verdict at a glance

All nine targets were inspected via their public README/docs. **No malware, obfuscated payloads, credential harvesting, or data-exfiltration mechanisms were observed** in any of them. Two carry minor operational-hygiene caveats (not malware).

| # | Repo / File | Type | Malicious indicators | Verdict |
|---|-------------|------|----------------------|---------|
| 1 | `msitarzewski/agency-agents` | Agent persona library (MD + shell/py installers) | None | ✅ Clean |
| 2 | `multica-ai/andrej-karpathy-skills` | CLAUDE.md coding-guideline plugin | None | ✅ Clean |
| 3 | `thedotmack/claude-mem` | Persistent agent memory (TS/Node) | None | ✅ Clean |
| 4 | `simonw/shot-scraper` | Screenshot/scrape CLI (Python/Playwright) | None | ✅ Clean |
| 5 | `deepseek-ai/DeepSpec` | Speculative-decoding draft-model framework (Python) | None | ✅ Clean |
| 6 | `Graphify-Labs/graphify` | Codebase → knowledge-graph skill (Python) | None | ✅ Clean |
| 7 | `colbymchenry/codegraph` | Pre-indexed code graph + MCP server (TS/Node) | None | ✅ Clean |
| 8 | `olicarl/onetime_backend` → `casaos.md` | CasaOS deployment notes | Default `admin/admin` creds documented | ✅ Clean (hygiene caveat) |
| 9 | `jliebich/RaspberryPiNotes` → `ntfy.md` | ntfy boot-notification note (German) | Sends boot event to external ntfy endpoint | ✅ Clean (privacy caveat) |

**General adoption caveats that apply to all of them:**
- All ship **installer scripts** (`npx …`, `curl | sh`-style, shell/PowerShell). "No malicious code in the README" ≠ "safe to pipe an installer into a shell." Pin to a reviewed commit/tag and read the actual install script before running.
- Several are **MCP servers or Claude Code hooks/skills** that run with our agent's privileges. Treat them as trusted code paths — install into a sandbox first.
- Verify license compatibility (all are MIT/Apache-2.0 as read, which is fine for us).

---

## 2. Per-repo assessment

### 1. `msitarzewski/agency-agents` — ✅ Adopt (content), selectively
- **What it is:** 230+ specialized agent persona definitions (engineering, design, marketing, security, etc.) as Markdown, with converters to Cursor/Copilot/etc. formats. MIT.
- **Security:** Documentation + agent prompts + install/convert scripts only. No red flags. The install app (`agencyagents.app`) is third-party — prefer copying the `.md` definitions directly over one-click install.
- **Fit for ETTZ / OpenClaw:** **Strong conceptual fit.** OpenClaw is a multi-agent system and Office visualizes agent roles. This is a ready-made catalog of role definitions we can mine when seeding demo/mock agents or documenting agent archetypes. It is *content*, not infrastructure — we would not depend on it at runtime.
- **Helps Claude work better:** Useful reference for role/prompt patterns; low direct impact on our coding workflow.
- **Recommendation:** Cherry-pick a handful of relevant persona definitions as reference/mock data. Do **not** bulk-install all 230.

### 2. `multica-ai/andrej-karpathy-skills` — ✅ Adopt (guidelines)
- **What it is:** A compact CLAUDE.md/Cursor-rules plugin encoding four coding principles (think before coding, simplicity first, surgical changes, goal-driven execution). MIT.
- **Security:** Pure guideline text + plugin manifest. No executable risk.
- **Fit for ETTZ / OpenClaw:** Neutral to the product; it's a workflow aid.
- **Helps Claude work better:** **Directly.** These principles align with our existing `CLAUDE.md` coding standards (strict TS, no `any`, ≤500-line files, surgical diffs). Worth folding the useful bits into our own guide rather than adding another plugin.
- **Recommendation:** Merge the relevant principles into our `CLAUDE.md` "Coding Standards" section instead of installing a separate plugin (avoids guideline sprawl).

### 3. `thedotmack/claude-mem` — 🟡 Trial (high potential, sandbox first)
- **What it is:** Persistent cross-session memory for coding agents — captures tool observations, compresses them, and re-injects relevant context. Local-first: SQLite + FTS5, optional Chroma vector store, Node/Bun. Apache-2.0. Installs 5 Claude Code lifecycle hooks.
- **Security:** Local-first storage, optional private-tag exclusion, no mandatory exfiltration. **But** it installs hooks that run on every session and can auto-install Bun/`uv` — meaningful supply-chain surface. Review pinned.
- **Fit for ETTZ / OpenClaw:** Indirect for the product, but the reported OpenClaw integration hook is a plus if we standardize agent memory.
- **Helps Claude work better:** **Highest-leverage item here** for agent continuity across sessions — directly relevant to our remote/ephemeral session model where context is lost when the container is reclaimed.
- **Recommendation:** Trial in an isolated environment. Validate the hooks, storage location, and token cost before any shared adoption.

### 4. `simonw/shot-scraper` — ✅ Adopt (tooling)
- **What it is:** Mature Python/Playwright CLI for automated screenshots, scraping, and video. Apache-2.0, well-established (Simon Willison).
- **Security:** Reputable, transparent, widely used. No concerns.
- **Fit for ETTZ / OpenClaw:** **Practical, concrete fit.** OpenClaw Office is a visual SVG/isometric UI — shot-scraper is ideal for **visual-regression screenshots of the Office view**, dashboard captures for docs, and CI visual checks. Note: this environment already ships Chromium + Playwright, so it slots in cleanly.
- **Helps Claude work better:** Gives the agent a reliable "see the rendered UI" capability for verifying frontend changes.
- **Recommendation:** Adopt as a dev/CI tool for visual verification of Office views.

### 5. `deepseek-ai/DeepSpec` — ⚪ Not a fit (out of scope)
- **What it is:** Research framework for training/evaluating speculative-decoding **draft models** (DSpark/DFlash/Eagle3). Python, MIT.
- **Security:** Legitimate academic ML infra. No concerns.
- **Fit for ETTZ / OpenClaw:** **Low.** This is LLM-inference-acceleration research. It's only relevant if ETTZ involves self-hosting/optimizing our own inference stack — which OpenClaw Office (a frontend) does not. Not a replacement for anything in our plan.
- **Helps Claude work better:** No direct effect on this codebase.
- **Recommendation:** Archive as reference only. Revisit only if we own model-serving.

### 6. `Graphify-Labs/graphify` — 🟡 Trial (vs. #7)
- **What it is:** Skill that turns a codebase + docs/PDF/media into a queryable knowledge graph (tree-sitter local parsing, Leiden communities, `graph.html` viz). Python, MIT. Privacy-conscious (local parsing; only semantic doc enrichment hits an LLM).
- **Security:** Transparent data-flow docs, local query log, no telemetry. Clean.
- **Fit for ETTZ / OpenClaw:** Codebase-comprehension aid; the graph visualization angle is thematically adjacent to Office's own graph views.
- **Helps Claude work better:** Improves architectural navigation of the codebase. **Overlaps heavily with #7 (codegraph)** — pick one.
- **Recommendation:** Trial head-to-head with codegraph. Graphify's edge is multi-modal (docs/media) enrichment.

### 7. `colbymchenry/codegraph` — 🟡 Trial (vs. #6) — likely preferred
- **What it is:** Pre-indexed code knowledge graph exposed via an **MCP server**; SQLite+FTS5, tree-sitter, auto-sync on file change, bundled Node runtime. 30+ languages incl. TS. MIT.
- **Security:** Local processing, optional documented telemetry, auditable. Clean.
- **Fit for ETTZ / OpenClaw:** MCP-native, so it plugs straight into our agent tooling. Strong TS support fits this React/TS codebase.
- **Helps Claude work better:** **Directly and measurably** — "surgical context in one call," fewer search/read round-trips, lower token use. This maps well to our large frontend tree.
- **Recommendation:** **Preferred of the two graph tools** for *this* codebase because it's TS-first and MCP-native. Trial against Graphify; adopt one, not both.

### 8. `olicarl/onetime_backend` → `casaos.md` — ⚪ Reference only
- **What it is:** Deployment notes for a 3-container app ("OneTime": web/API/Postgres) on **CasaOS** (home-server OS), via Docker Compose.
- **Security:** No malware. **Hygiene caveat:** documents default `admin/admin` credentials and manual image-name substitution — deployment footguns, not attacks.
- **Fit for ETTZ / OpenClaw:** **Low / tangential.** Relevant only as a template if we ever want a self-hosted CasaOS deployment recipe for the OpenClaw stack. Not a component we'd import.
- **Recommendation:** Keep as a deployment-pattern reference. If ever used, change default credentials.

### 9. `jliebich/RaspberryPiNotes` → `ntfy.md` — ⚪ Reference only
- **What it is:** Personal note (German) — a systemd service that sends a **ntfy** push notification on Raspberry Pi boot.
- **Security:** No malware. **Privacy caveat:** sends a boot event to an external ntfy endpoint; contains a placeholder token to replace.
- **Fit for ETTZ / OpenClaw:** **Low directly**, but surfaces a genuinely useful primitive: **ntfy as a lightweight notification channel.** OpenClaw already models "Channels," so ntfy could be a candidate channel type for agent/system alerts. The specific boot-notification recipe is not relevant to us.
- **Recommendation:** Reference only. Consider ntfy as a notification-channel option in the OpenClaw channel model (separate design decision), self-hosting the ntfy server for privacy.

---

## 3. Prioritized recommendations

**Adopt / integrate soon**
1. **shot-scraper (#4)** — visual verification of Office UI in dev/CI. Lowest risk, immediate value; Chromium/Playwright already present here.
2. **andrej-karpathy-skills (#2)** — fold the coding principles into our existing `CLAUDE.md`.
3. **agency-agents (#1)** — cherry-pick persona definitions as reference/mock agent data.

**Trial in a sandbox (pick winners)**
4. **codegraph (#7)** vs **graphify (#6)** — run both against this repo; adopt one code-graph tool (codegraph is the likely fit: TS-first + MCP-native).
5. **claude-mem (#3)** — highest-upside for cross-session continuity in our ephemeral remote sessions; validate hooks/token cost first.

**Reference only (not part of the plan now)**
6. **onetime_backend/casaos.md (#8)** — self-hosting deployment template.
7. **RaspberryPiNotes/ntfy.md (#9)** — ntfy as a possible OpenClaw notification channel.

**Out of scope**
8. **DeepSpec (#5)** — inference-acceleration research; only relevant if we self-host model serving.

---

## 4. Safe-adoption checklist (before running any installer)
- [ ] Pin to a specific reviewed commit/tag — never track `main` for executable tooling.
- [ ] Read the actual install script (`npx … install`, shell installers) before executing.
- [ ] Install MCP servers / Claude Code hooks into an isolated environment first; confirm what network calls and file writes they make.
- [ ] Confirm license (all read as MIT/Apache-2.0).
- [ ] For code-graph/memory tools: verify where the index/DB is written and that nothing leaves the machine unless intended.
- [ ] Change any default credentials in deployment recipes (#8).

> None of these repositories were installed, executed, or added to this project as part of this review — this document is an assessment only.
