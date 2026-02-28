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
      strokeWidth="2.5"
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

  const distanceKm = totalDistance >= 1000
    ? `${(totalDistance / 1000).toFixed(2)} km`
    : `${totalDistance.toFixed(0)} m`;

  return (
    <div className="animate-slideUp flex flex-col gap-6 max-[500px]:gap-5">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 max-[500px]:grid-cols-1 max-[500px]:gap-3">
        {/* Total Distance */}
        <div className="bg-surface border rounded-2xl p-5 max-[500px]:p-4 shadow-card text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3" style={{ background: 'var(--stat-gradient)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" /><path d="M8 6h10v10" />
            </svg>
          </div>
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">
            Total Distance
          </span>
          <span className="block text-2xl max-[500px]:text-xl font-extrabold text-heading">
            {distanceKm}
          </span>
        </div>

        {/* Stops */}
        <div className="bg-surface border rounded-2xl p-5 max-[500px]:p-4 shadow-card text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">
            Stops
          </span>
          <span className="block text-2xl max-[500px]:text-xl font-extrabold text-heading">
            {path.length - 1}
          </span>
        </div>

        {/* Animate */}
        <div className="bg-surface border rounded-2xl p-5 max-[500px]:p-4 shadow-card flex flex-col items-center justify-center">
          <button
            className="w-full py-2.5 px-5 text-white border-none rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 hover:shadow-card-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:brightness-100 active:scale-[0.98]"
            style={{ background: 'var(--stat-gradient)' }}
            onClick={onAnimate}
            disabled={isAnimating}
          >
            {isAnimating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Step {animationStep! + 1} / {segments.length}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Animate Journey
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Optimal Route */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-heading m-0">Optimal Route</h2>
        </div>

        <div className="flex flex-wrap items-center gap-y-2 gap-x-[0.15rem] bg-surface border rounded-2xl py-4 px-5 shadow-card">
          {pathLocations.map((loc, i) => {
            const isReached = animationStep === null || animationStep === undefined || i <= animationStep + 1;
            const locationIndex = path[i];

            const stopContent = (
              <span className={`group relative inline-flex items-center gap-1 bg-tag text-tag-foreground py-[0.25rem] px-2.5 rounded-lg text-xs font-semibold cursor-default transition-opacity duration-200 ${!isReached ? "opacity-30" : ""}`}>
                <span className="text-tag-foreground/60 text-[10px] font-bold">{i + 1}</span>
                {loc}
                <span className="hidden group-hover:block absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-surface rounded-xl overflow-hidden shadow-card-xl z-[100] w-[140px] max-[500px]:w-[110px] pointer-events-none border after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[6px] after:border-transparent after:border-t-[var(--surface)]">
                  <img
                    src={getLocationImagePath(locationIndex)}
                    alt={loc}
                    className="block w-full h-[90px] max-[500px]:h-[65px] object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  />
                  <span className="block py-1.5 px-2 text-[11px] font-bold text-heading text-center truncate">
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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-1 text-muted opacity-40">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                {stopContent}
              </span>
            );
          })}
        </div>
      </section>

      {/* Segments */}
      <section className="bg-surface border rounded-2xl overflow-hidden shadow-card">
        <button
          type="button"
          onClick={() => setSegmentsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between py-3.5 px-5 bg-transparent border-none cursor-pointer text-heading hover:bg-background transition-colors duration-150"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold">Route Segments</span>
              <span className="block text-[11px] text-muted">{segments.length} segments</span>
            </div>
          </div>
          <ChevronIcon open={segmentsOpen} />
        </button>

        {segmentsOpen && (
          <ol className="list-none p-0 m-0 border-t">
            {segments.map((seg, i) => {
              const isReached = animationStep === null || animationStep === undefined || i <= animationStep;
              return (
                <li
                  key={i}
                  className={`flex items-center gap-3 py-3 px-5 border-b border-light text-sm last:border-b-0 max-[500px]:flex-wrap transition-all duration-200 ${!isReached ? "opacity-30" : ""}`}
                >
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-extrabold shrink-0 text-white" style={{ background: 'var(--stat-gradient)' }}>
                    {i + 1}
                  </span>
                  <span className="font-semibold text-heading text-[13px]">{seg.from}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted shrink-0 opacity-50">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <span className="font-semibold text-heading text-[13px]">{seg.to}</span>
                  <span className="ml-auto text-accent-foreground font-bold text-sm whitespace-nowrap tabular-nums max-[500px]:ml-0 max-[500px]:w-full max-[500px]:text-right">
                    {seg.distance >= 1000
                      ? `${(seg.distance / 1000).toFixed(2)} km`
                      : `${seg.distance.toFixed(0)} m`}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
