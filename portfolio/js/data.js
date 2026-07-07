/* ============================================================================
   YOUR CONTENT LIVES HERE.
   This is the ONLY file you need to edit to update the site.
   Everything on the pages is generated from the objects below.
   ============================================================================ */

/* --- 1. WHO YOU ARE ------------------------------------------------------- */
const PROFILE = {
  name: "Your Name",
  // A short tagline shown under your name on the cover.
  tagline: "Designer · Maker · Perpetual work-in-progress",
  // A few sentences for the "About" page of the sketchbook.
  about: [
    "This is my open sketchbook — a living collection of the things I've made, ",
    "half-made, and am still figuring out. Every project here is a page: some ",
    "polished, some rough, all honest.",
    "Poke around, follow the threads, and see where they lead.",
  ].join(""),
  // Contact + social links. Delete any you don't want; add your own.
  links: [
    { label: "Email", href: "mailto:you@example.com" },
    { label: "GitHub", href: "https://github.com/yourusername" },
    { label: "LinkedIn", href: "https://linkedin.com/in/yourusername" },
    { label: "Instagram", href: "https://instagram.com/yourusername" },
  ],
};

/* --- 2. YOUR PROJECTS ----------------------------------------------------- */
/*
   Each object is one "page" in the sketchbook and gets its own URL:
   project.html?id=THE-ID-BELOW

   To add a project: copy one block, change the fields, done.
   Fields:
     id        unique slug, used in the URL (no spaces)
     title     project name
     year      when you made it (any string: "2024", "2023–24", "ongoing")
     status    "shipped" | "in-progress" | "planned"  (drives grouping + badge)
     tags      short labels, e.g. ["Web", "Illustration"]
     cover     an emoji OR a path to an image in assets/ (e.g. "assets/foo.jpg")
     blurb     one-line summary shown on the cover gallery card
     progress  THE PROGRESSION MAP — an ordered list of milestones toward
               shipping. Each: { label: "step name", done: true|false }.
               The card shows a % bar; the page shows the full map.
     sections  the actual page content — an array of blocks (see types below)
     links     optional external links for this project

   Section block types (mix and match, any order):
     { type: "text",  body: "A paragraph of writing." }
     { type: "heading", body: "A sub-heading" }
     { type: "image", src: "assets/pic.jpg", caption: "Optional caption" }
     { type: "list",  items: ["point one", "point two"] }
     { type: "quote", body: "A pulled-out line or reflection." }
*/
const PROJECTS = [
  {
    id: "wandering-atlas",
    title: "Wandering Atlas",
    year: "2024",
    status: "shipped",
    tags: ["Illustration", "Maps"],
    cover: "🗺️",
    blurb: "Hand-drawn maps of places that don't exist (yet).",
    progress: [
      { label: "Concept", done: true },
      { label: "First 10 maps", done: true },
      { label: "Print zine", done: true },
      { label: "Ship online gallery", done: true },
    ],
    links: [{ label: "View gallery", href: "#" }],
    sections: [
      {
        type: "text",
        body: "Wandering Atlas started as a doodle in the margin of a notebook and grew into a series of imaginary maps. Each one begins with a single coastline and I let it sprawl from there.",
      },
      { type: "heading", body: "The process" },
      {
        type: "list",
        items: [
          "Rough the landmass in pencil, no plan.",
          "Ink the coast, then invent towns to justify the rivers.",
          "Name everything last — the names come from the shapes.",
        ],
      },
      {
        type: "image",
        src: "",
        caption: "Drop a scan of a map into assets/ and point src here.",
      },
      {
        type: "quote",
        body: "A map is just a promise that a place could exist.",
      },
    ],
  },
  {
    id: "coffee-ledger",
    title: "The Coffee Ledger",
    year: "2023",
    status: "in-progress",
    tags: ["Web", "Data"],
    cover: "☕",
    blurb: "A tiny app that tracks every cup and judges me gently.",
    progress: [
      { label: "Wireframe", done: true },
      { label: "Build core logging", done: true },
      { label: "Charts + insights", done: false },
      { label: "Polish + accessibility pass", done: false },
      { label: "Ship v1", done: false },
    ],
    links: [{ label: "Live demo", href: "#" }, { label: "Source", href: "#" }],
    sections: [
      {
        type: "text",
        body: "A one-page web app I built to log coffee and, eventually, to notice patterns I'd rather ignore. It's small on purpose — one screen, no accounts, data stays on your device.",
      },
      { type: "heading", body: "What I learned" },
      {
        type: "text",
        body: "Constraints are a gift. Refusing to add a backend forced cleaner state and a faster, calmer interface.",
      },
    ],
  },
  {
    id: "paper-radio",
    title: "Paper Radio",
    year: "ongoing",
    status: "in-progress",
    tags: ["Sound", "Experiment"],
    cover: "📻",
    blurb: "Field recordings stitched into imaginary radio stations.",
    progress: [
      { label: "Collect field recordings", done: true },
      { label: "Build the mixer", done: false },
      { label: "First 3 stations", done: false },
      { label: "Ship listening page", done: false },
    ],
    links: [],
    sections: [
      {
        type: "text",
        body: "An ongoing experiment: record the world, then rearrange it into stations that never broadcast. Rain from one city, a market from another, all tuned to the same dial.",
      },
      {
        type: "quote",
        body: "Still figuring this one out. That's the point of a sketchbook.",
      },
    ],
  },
];
