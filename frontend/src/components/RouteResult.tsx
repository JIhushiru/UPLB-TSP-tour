import { useState } from "react";
import type { TSPResult } from "../tsp/types";
import { getLocationImagePath, FALLBACK_IMAGE } from "../utils/locationImages";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

interface RouteResultProps {
  result: TSPResult | null;
  animationStep: number | null;
  onAnimate: () => void;
  isAnimating: boolean;
}

export default function RouteResult({ result, animationStep, onAnimate, isAnimating }: RouteResultProps) {
  const [segmentsOpen, setSegmentsOpen] = useState(false);

  if (!result) return null;

  const { pathLocations, totalDistance, segments, path } = result;

  return (
    <div className="animate-fadeIn">
      <div className="flex gap-4 mb-6 max-[500px]:flex-col">
        <div className="flex-1 bg-accent-surface border border-accent rounded-[10px] p-4 text-center">
          <span className="block text-xs text-muted mb-1 uppercase tracking-wider font-medium">
            Total Distance
          </span>
          <span className="block text-2xl font-bold text-accent-foreground">
            {totalDistance.toFixed(2)} m
          </span>
        </div>
        <div className="flex-1 bg-accent-surface border border-accent rounded-[10px] p-4 flex items-center justify-center">
          <button
            className="py-2.5 px-5 bg-accent text-white border-none rounded-md text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-accent-hover disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={onAnimate}
            disabled={isAnimating}
          >
            {isAnimating
              ? `Step ${animationStep! + 1} of ${segments.length}`
              : "Animate Journey"}
          </button>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-3 text-heading">Optimal Route</h2>
      <div className="flex flex-wrap items-center gap-y-2 gap-x-[0.15rem] bg-surface border rounded-[10px] py-4 px-5">
        {pathLocations.map((loc, i) => {
          const isReached = animationStep === null || animationStep === undefined || i <= animationStep + 1;
          const locationIndex = path[i];

          const stopContent = (
            <span className={`group relative inline-block bg-tag text-tag-foreground py-[0.2rem] px-2.5 rounded text-sm font-medium cursor-default ${!isReached ? "opacity-35" : ""}`}>
              {loc}
              <span className="hidden group-hover:block absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-black/[0.88] rounded-lg overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.3)] z-[100] w-[130px] max-[500px]:w-[100px] pointer-events-none after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[6px] after:border-transparent after:border-t-black/[0.88]">
                <img
                  src={getLocationImagePath(locationIndex)}
                  alt={loc}
                  className="block w-full h-[85px] max-[500px]:h-[65px] object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                />
                <span className="block py-1 px-2 text-xs font-medium text-white text-center truncate">
                  {loc}
                </span>
              </span>
            </span>
          );

          if (i === 0) {
            return <span key={i}>{stopContent}</span>;
          }
          return (
            <span key={i} className="inline-flex items-center whitespace-nowrap">
              <span className="mx-1.5 text-muted text-sm">&rarr;</span>
              {stopContent}
            </span>
          );
        })}
      </div>

      <div className="mt-6 bg-surface border rounded-[10px] overflow-hidden">
        <button
          type="button"
          onClick={() => setSegmentsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between py-3 px-5 bg-transparent border-none cursor-pointer text-heading hover:bg-background transition-colors duration-150"
        >
          <span className="text-lg font-semibold">
            Route Segments
            <span className="ml-2 text-xs font-normal text-muted">
              {segments.length} stops
            </span>
          </span>
          <ChevronIcon open={segmentsOpen} />
        </button>

        {segmentsOpen && (
          <ol className="list-none p-0 m-0 border-t">
            {segments.map((seg, i) => {
              const isReached = animationStep === null || animationStep === undefined || i <= animationStep;
              return (
                <li
                  key={i}
                  className={`flex items-center gap-2.5 py-3 px-5 border-b border-light text-sm last:border-b-0 max-[500px]:flex-wrap transition-opacity duration-200 ${!isReached ? "opacity-35" : ""}`}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent-foreground text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-medium">{seg.from}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted shrink-0">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  <span className="font-medium">{seg.to}</span>
                  <span className="ml-auto text-accent-foreground font-semibold text-sm whitespace-nowrap max-[500px]:ml-0 max-[500px]:w-full max-[500px]:text-right">
                    {seg.distance.toFixed(2)} m
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
