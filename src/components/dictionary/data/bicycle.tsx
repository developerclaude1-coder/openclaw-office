import type { SVGProps } from "react";
import type { DictionaryEntry } from "../types";

function BicycleIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 400 260" fill="none" {...props}>
      <g
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Wheels */}
        <circle cx={92} cy={180} r={56} />
        <circle cx={308} cy={180} r={56} />
        <circle cx={92} cy={180} r={4} fill="currentColor" />
        <circle cx={308} cy={180} r={4} fill="currentColor" />
        {/* Spokes (suggestive) */}
        <g strokeWidth={1.2} opacity={0.5}>
          <line x1={92} y1={124} x2={92} y2={236} />
          <line x1={36} y1={180} x2={148} y2={180} />
          <line x1={52} y1={140} x2={132} y2={220} />
          <line x1={132} y1={140} x2={52} y2={220} />
          <line x1={308} y1={124} x2={308} y2={236} />
          <line x1={252} y1={180} x2={364} y2={180} />
          <line x1={268} y1={140} x2={348} y2={220} />
          <line x1={348} y1={140} x2={268} y2={220} />
        </g>
        {/* Frame — main triangle */}
        <path d="M92 180 L196 180 L150 108 Z" />
        <line x1={196} y1={180} x2={150} y2={108} />
        {/* Seat tube + saddle */}
        <line x1={196} y1={180} x2={214} y2={92} />
        <path d="M196 90 q18 -8 34 0" strokeWidth={5} />
        {/* Down/top tube to head + fork */}
        <line x1={150} y1={108} x2={286} y2={96} />
        <line x1={196} y1={180} x2={286} y2={96} />
        <line x1={286} y1={96} x2={308} y2={180} />
        {/* Handlebar */}
        <path d="M286 96 q34 -6 40 18" strokeWidth={4} />
        {/* Crank + pedal */}
        <circle cx={196} cy={180} r={12} />
        <line x1={196} y1={180} x2={196} y2={206} strokeWidth={4} />
        <line x1={186} y1={206} x2={206} y2={206} strokeWidth={5} />
        {/* Chain hint */}
        <path d="M92 180 q52 22 104 0" strokeWidth={1.6} opacity={0.7} />
      </g>
    </svg>
  );
}

export const bicycle: DictionaryEntry = {
  id: "bicycle",
  name: "Bicycle",
  category: "Transport",
  summary:
    "A human-powered, pedal-driven vehicle with two wheels attached to a frame, one behind the other. First introduced in the 19th century, the bicycle converts the rider's pedalling into rotational drive through a chain-and-sprocket transmission, and is steered by turning the front wheel.",
  aliases: ["bicycle", "bike", "cycle", "pushbike", "roadbike", "road bike", "mountain bike"],
  Illustration: BicycleIllustration,
  viewBox: "0 0 400 260",
  parts: [
    {
      id: "frame",
      name: "Frame",
      function:
        "The load-bearing skeleton that holds every other component in alignment and transmits the rider's weight and pedalling forces. The classic diamond frame is built from two triangles for rigidity.",
      material: "Steel, aluminium alloy, or carbon fibre",
      hotspot: { x: 173, y: 150 },
    },
    {
      id: "wheel",
      name: "Wheel & tyre",
      function:
        "A tensioned wire-spoke wheel carries a pneumatic tyre that rolls on the road, absorbs shock, and provides grip. The rear wheel delivers drive; the front wheel steers.",
      material: "Alloy rim, steel spokes, rubber tyre",
      hotspot: { x: 308, y: 232 },
    },
    {
      id: "drivetrain",
      name: "Crank & pedals",
      function:
        "The pedals and crank arms turn the rider's leg power into rotation at the chainring, which pulls the chain to drive the rear wheel.",
      material: "Forged aluminium / steel",
      hotspot: { x: 196, y: 206 },
    },
    {
      id: "chain",
      name: "Chain drive",
      function:
        "A roller chain links the front chainring to the rear sprocket, transmitting pedalling torque to the rear wheel with high efficiency.",
      material: "Hardened steel links",
      hotspot: { x: 144, y: 194 },
    },
    {
      id: "handlebar",
      name: "Handlebar",
      function:
        "Connected to the fork through the stem, the handlebar lets the rider steer the front wheel and provides mounting points for brake levers and controls.",
      material: "Aluminium or carbon tube",
      hotspot: { x: 326, y: 108 },
    },
    {
      id: "saddle",
      name: "Saddle",
      function:
        "The seat that supports the rider's weight, mounted on an adjustable seat post so height can be tuned to leg length.",
      material: "Padded shell on rails",
      hotspot: { x: 214, y: 88 },
    },
  ],
  citations: [
    {
      id: "wiki-bicycle",
      title: "Bicycle",
      source: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Bicycle",
    },
    {
      id: "wiki-frame",
      title: "Bicycle frame",
      source: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Bicycle_frame",
    },
    {
      id: "sheldon-brown",
      title: "Bicycle Glossary",
      source: "Sheldon Brown",
      url: "https://www.sheldonbrown.com/gloss_a.html",
    },
    {
      id: "britannica-bicycle",
      title: "Bicycle | History, Types & Facts",
      source: "Encyclopaedia Britannica",
      url: "https://www.britannica.com/technology/bicycle",
    },
  ],
};
