import type { SVGProps } from "react";

/**
 * A category-agnostic schematic used for entries produced by the recognition
 * backend, which return structured parts + hotspots but no bespoke illustration.
 * The parts overlay (numbered markers / exploded callouts) is drawn on top by
 * `PartsDiagram`; this provides a neutral body for those annotations to point at.
 * Shares the 0 0 400 260 coordinate space used for a generic wire entry.
 */
export function GenericIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 400 260" fill="none" {...props}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* Isometric-ish object body */}
        <path d="M120 90 L280 90 L320 120 L320 210 L160 210 L120 180 Z" strokeWidth={3} />
        <path d="M120 90 L160 120 L320 120" strokeWidth={2.4} />
        <path d="M160 120 L160 210" strokeWidth={2.4} />
        {/* Suggestive internal division lines */}
        <g strokeWidth={1.4} opacity={0.5}>
          <path d="M200 120 L200 210" />
          <path d="M240 120 L240 210" />
          <path d="M280 120 L280 210" />
          <path d="M160 165 L320 165" />
        </g>
        {/* A couple of generic fasteners / features */}
        <circle cx={190} cy={150} r={10} strokeWidth={2} />
        <circle cx={190} cy={150} r={3} fill="currentColor" />
        <rect x={260} y={185} width={40} height={14} rx={3} strokeWidth={2} />
      </g>
    </svg>
  );
}
