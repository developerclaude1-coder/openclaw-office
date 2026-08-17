# My Sketchbook — a personal portfolio

An open-sketchbook style portfolio: a cover page that gathers everything, and a
dedicated page for each project — including a **progression map** showing how far
each in-progress project is from shipping.

No build step. It's plain HTML, CSS, and JavaScript. Open `index.html` in a
browser and it works.

## Editing — you only touch one file

All your content lives in **`js/data.js`**:

- `PROFILE` — your name, tagline, about text, and social links.
- `PROJECTS` — one entry per project. Each becomes its own page at
  `project.html?id=<the id>`.

### Adding a project

Copy an existing block in `PROJECTS` and change the fields. Key ones:

| Field      | What it does                                                       |
| ---------- | ------------------------------------------------------------------ |
| `id`       | Unique slug used in the URL (no spaces).                           |
| `status`   | `"shipped"`, `"in-progress"`, or `"planned"` — groups it + badge.  |
| `cover`    | An emoji, or an image path like `assets/thing.jpg`.                |
| `progress` | The **progression map**: ordered milestones `{ label, done }`.     |
| `sections` | The page body — blocks of `text` / `heading` / `image` / `list` / `quote`. |

The progression map drives the % bar on the card and the checklist timeline on
the project page. Flip a milestone's `done` from `false` to `true` as you ship.

### Adding images

Drop image files into `assets/` and reference them by path (e.g.
`cover: "assets/my-shot.jpg"` or an `image` section with
`src: "assets/detail.png"`).

## Viewing locally

Either open `index.html` directly, or serve the folder (nicer URLs):

```bash
cd portfolio
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deploying (free options)

The whole `portfolio/` folder is static — upload it anywhere:

- **GitHub Pages** — push the repo, enable Pages, point it at `/portfolio`.
- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the folder or connect the repo.

## Structure

```
portfolio/
├── index.html        # cover / gallery / about
├── project.html      # single project template (reads ?id=...)
├── css/style.css     # all styling (theme colors at the top)
├── js/
│   ├── data.js       # ← YOUR CONTENT (the only file you edit)
│   ├── ui.js         # theme toggle + helpers
│   ├── home.js       # renders the cover page
│   └── project.js    # renders a project page
└── assets/           # your images
```
