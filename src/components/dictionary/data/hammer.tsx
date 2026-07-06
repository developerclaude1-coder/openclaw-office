import type { SVGProps } from "react";
import type { DictionaryEntry } from "../types";

function HammerIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 300 300" fill="none" {...props}>
      <g
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Head */}
        <path
          d="M96 44
             Q150 30 150 30
             Q150 30 204 44
             L204 62
             Q182 70 168 70
             L168 92
             Q168 108 150 108
             Q132 108 132 92
             L132 70
             Q118 70 96 62
             Z"
          strokeWidth={4}
        />
        {/* Claw split */}
        <path d="M108 46 Q120 66 116 68" strokeWidth={3} />
        <path d="M192 46 Q180 66 184 68" strokeWidth={3} />
        <path d="M96 44 Q100 30 112 34" strokeWidth={3} />
        <path d="M204 44 Q200 30 188 34" strokeWidth={3} />
        {/* Eye / neck */}
        <ellipse cx={150} cy={90} rx={12} ry={7} strokeWidth={2} opacity={0.7} />
        {/* Handle */}
        <path d="M140 106 L134 244 Q150 262 166 244 L160 106" strokeWidth={4} />
        {/* Grip texture */}
        <g strokeWidth={1.6} opacity={0.6}>
          <line x1={137} y1={196} x2={163} y2={196} />
          <line x1={136} y1={212} x2={164} y2={212} />
          <line x1={135} y1={228} x2={165} y2={228} />
        </g>
      </g>
    </svg>
  );
}

export const hammer: DictionaryEntry = {
  id: "hammer",
  name: "Claw hammer",
  category: "Hand tool",
  summary:
    "A claw hammer is a hand tool for driving and pulling nails. One side of the steel head is a flat striking face; the other is a curved, forked claw used as a lever to extract nails. The weighted head is mounted on a handle that amplifies the force of the swing.",
  aliases: ["hammer", "claw hammer", "nail hammer", "mallet", "framing hammer"],
  Illustration: HammerIllustration,
  viewBox: "0 0 300 300",
  parts: [
    {
      id: "face",
      name: "Face",
      function:
        "The flat, hardened striking surface that contacts the nail head. A slight crown helps drive nails flush without denting the workpiece.",
      material: "Heat-treated steel",
      hotspot: { x: 150, y: 100 },
    },
    {
      id: "claw",
      name: "Claw",
      function:
        "The curved, V-shaped fork opposite the face. Slid under a nail head, it uses the head as a fulcrum to lever the nail out.",
      material: "Forged steel",
      hotspot: { x: 150, y: 40 },
    },
    {
      id: "cheek",
      name: "Cheek & eye",
      function:
        "The body of the head and the eye through which the handle passes. The cheeks carry the head's mass and are where a wedge locks the handle in place.",
      material: "Forged steel",
      hotspot: { x: 178, y: 78 },
    },
    {
      id: "handle",
      name: "Handle",
      function:
        "The shaft, gripped by the user, that lengthens the swing arc to multiply striking force. It also flexes slightly to absorb shock.",
      material: "Hickory, fibreglass, or steel",
      hotspot: { x: 150, y: 170 },
    },
    {
      id: "grip",
      name: "Grip",
      function:
        "The textured or moulded lower end of the handle that gives a secure, non-slip hold and cushions vibration from each blow.",
      material: "Rubber or moulded polymer",
      hotspot: { x: 150, y: 232 },
    },
  ],
  citations: [
    {
      id: "wiki-hammer",
      title: "Hammer",
      source: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Hammer",
    },
    {
      id: "wiki-claw-hammer",
      title: "Claw hammer",
      source: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Claw_hammer",
    },
    {
      id: "wiki-lever",
      title: "Lever",
      source: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Lever",
    },
    {
      id: "toolguide",
      title: "Anatomy of a Hammer",
      source: "The Family Handyman",
      url: "https://www.familyhandyman.com/",
    },
  ],
};
