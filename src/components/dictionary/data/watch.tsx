import type { SVGProps } from "react";
import type { DictionaryEntry } from "../types";

function WatchIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 300 300" fill="none" {...props}>
      <g
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Lugs + strap */}
        <path d="M120 52 L120 22 Q150 8 180 22 L180 52" strokeWidth={4} />
        <path d="M120 248 L120 278 Q150 292 180 278 L180 248" strokeWidth={4} />
        {/* Case */}
        <circle cx={150} cy={150} r={98} strokeWidth={5} />
        {/* Bezel */}
        <circle cx={150} cy={150} r={84} />
        {/* Dial ring */}
        <circle cx={150} cy={150} r={72} strokeWidth={1.4} opacity={0.6} />
        {/* Hour markers */}
        <g strokeWidth={4}>
          <line x1={150} y1={84} x2={150} y2={98} />
          <line x1={150} y1={202} x2={150} y2={216} />
          <line x1={84} y1={150} x2={98} y2={150} />
          <line x1={202} y1={150} x2={216} y2={150} />
        </g>
        <g strokeWidth={2} opacity={0.7}>
          <line x1={196} y1={104} x2={188} y2={112} />
          <line x1={104} y1={104} x2={112} y2={112} />
          <line x1={196} y1={196} x2={188} y2={188} />
          <line x1={104} y1={196} x2={112} y2={188} />
        </g>
        {/* Hands */}
        <line x1={150} y1={150} x2={150} y2={104} strokeWidth={4} />
        <line x1={150} y1={150} x2={190} y2={150} strokeWidth={3} />
        <circle cx={150} cy={150} r={5} fill="currentColor" />
        {/* Crown */}
        <path d="M248 150 L268 142 L268 158 Z" strokeWidth={4} />
        <line x1={268} y1={144} x2={268} y2={156} strokeWidth={6} />
      </g>
    </svg>
  );
}

export const watch: DictionaryEntry = {
  id: "watch",
  name: "Mechanical wristwatch",
  category: "Horology",
  summary:
    "A wristwatch is a timepiece worn on the wrist. A mechanical movement stores energy in a wound mainspring and releases it in precise steps through an escapement and balance wheel, driving a train of gears that advance the hands. Unlike a quartz watch, it needs no battery.",
  aliases: ["watch", "wristwatch", "wrist watch", "timepiece", "clock", "chronograph"],
  Illustration: WatchIllustration,
  viewBox: "0 0 300 300",
  parts: [
    {
      id: "case",
      name: "Case",
      function:
        "The housing that protects the delicate movement from dust, moisture and impact, and to which the strap lugs are attached.",
      material: "Stainless steel, titanium, or gold",
      hotspot: { x: 62, y: 150 },
    },
    {
      id: "bezel",
      name: "Bezel",
      function:
        "The ring surrounding the crystal that holds it in place. On tool watches it can rotate to track elapsed time.",
      material: "Steel or ceramic",
      hotspot: { x: 150, y: 66 },
    },
    {
      id: "dial",
      name: "Dial",
      function:
        "The face of the watch, carrying the hour markers and printing against which the hands are read.",
      material: "Brass with lacquered finish",
      hotspot: { x: 112, y: 196 },
    },
    {
      id: "hands",
      name: "Hands",
      function:
        "Pointers driven by the gear train that indicate hours, minutes and seconds as they sweep across the dial.",
      material: "Lacquered or lumed metal",
      hotspot: { x: 178, y: 138 },
    },
    {
      id: "crown",
      name: "Crown",
      function:
        "The knurled knob used to wind the mainspring and to set the time; on many watches it also seals the case against water.",
      material: "Machined steel",
      hotspot: { x: 268, y: 150 },
    },
    {
      id: "strap",
      name: "Strap & lugs",
      function:
        "The band that secures the watch to the wrist, pinned between the lugs projecting from the case.",
      material: "Leather, rubber, or steel bracelet",
      hotspot: { x: 150, y: 28 },
    },
  ],
  citations: [
    {
      id: "wiki-watch",
      title: "Watch",
      source: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Watch",
    },
    {
      id: "wiki-movement",
      title: "Movement (clockwork)",
      source: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Movement_(clockwork)",
    },
    {
      id: "wiki-escapement",
      title: "Escapement",
      source: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Escapement",
    },
    {
      id: "hodinkee-anatomy",
      title: "Understanding The Anatomy Of A Watch",
      source: "Hodinkee",
      url: "https://www.hodinkee.com/",
    },
  ],
};
