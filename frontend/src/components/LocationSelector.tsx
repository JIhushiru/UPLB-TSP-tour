import type { Dispatch, SetStateAction } from "react";
import { locations } from "../tsp/data";

const MAX_SELECTION = 22;

function PinIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-all duration-150 ${
        active ? "text-blue-500 scale-110" : "text-muted opacity-60 sm:opacity-0 sm:group-hover:opacity-60"
      }`}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" fill={active ? "white" : "none"} stroke={active ? "white" : "currentColor"} strokeWidth="2" />
    </svg>
  );
}

interface LocationSelectorProps {
  selectedLocations: Set<number>;
  setSelectedLocations: Dispatch<SetStateAction<Set<number>>>;
  startPoint: number;
  setStartPoint: Dispatch<SetStateAction<number>>;
  onSolve: () => void;
  isComputing: boolean;
}

export default function LocationSelector({
  selectedLocations,
  setSelectedLocations,
  startPoint,
  setStartPoint,
  onSolve,
  isComputing,
}: LocationSelectorProps) {
  const atLimit = selectedLocations.size >= MAX_SELECTION;

  function toggleLocation(index: number) {
    setSelectedLocations((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else if (next.size < MAX_SELECTION) {
        next.add(index);
      }
      return next;
    });
  }

  function selectAll() {
    const all = new Set(locations.map((_, i) => i).slice(0, MAX_SELECTION));
    setSelectedLocations(all);
  }

  function deselectAll() {
    setSelectedLocations(new Set());
  }

  return (
    <section className="flex flex-col gap-4 bg-surface border rounded-2xl p-6 max-[500px]:p-4 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-heading m-0 leading-tight">Select Locations</h2>
            <p className="text-xs text-muted m-0">
              {selectedLocations.size} of {MAX_SELECTION} selected
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            className="bg-transparent border border-transparent text-accent-foreground text-xs font-semibold py-1.5 px-2.5 cursor-pointer rounded-lg hover:bg-accent/5 hover:border-accent/20 transition-all duration-150 disabled:opacity-50"
            onClick={selectAll}
            disabled={isComputing}
          >
            Select All
          </button>
          <button
            type="button"
            className="bg-transparent border border-transparent text-muted text-xs font-medium py-1.5 px-2.5 cursor-pointer rounded-lg hover:bg-background hover:border transition-all duration-150 disabled:opacity-50"
            onClick={deselectAll}
            disabled={isComputing}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${(selectedLocations.size / MAX_SELECTION) * 100}%`,
            background: 'var(--stat-gradient)',
          }}
        />
      </div>

      {/* Helpers */}
      {selectedLocations.size >= 1 && (
        <p className="m-0 text-xs text-muted flex items-center gap-1.5 bg-blue-500/5 border border-blue-500/10 rounded-lg px-3 py-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" className="text-blue-500 shrink-0">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" fill="white" stroke="white" strokeWidth="2" />
          </svg>
          <span>Click the pin icon on a selected location to set it as the starting point</span>
        </p>
      )}

      {atLimit && (
        <p className="m-0 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2">
          Maximum of {MAX_SELECTION} locations reached. The TSP algorithm uses dynamic programming
          with bitmask states (2<sup>n</sup>), so computation time grows exponentially.
        </p>
      )}

      {/* Location Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-1.5">
        {locations.map((name, index) => {
          const checked = selectedLocations.has(index);
          const disabled = !checked && atLimit;
          const isStart = checked && index === startPoint;
          return (
            <div
              key={index}
              className={`group flex items-center gap-2 py-2 px-2.5 rounded-xl text-sm text-foreground transition-all duration-150 border min-w-0 ${
                isStart
                  ? "bg-blue-500/10 border-blue-500/40 font-semibold shadow-card"
                  : checked
                    ? "bg-accent-surface border-accent-border font-medium shadow-card"
                    : "border-transparent hover:bg-background hover:border hover:shadow-card"
              } ${disabled ? "opacity-35" : ""}`}
            >
              <label className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled || isComputing}
                  onChange={() => toggleLocation(index)}
                  className={`accent-accent w-[15px] h-[15px] shrink-0 rounded ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                />
                <span className="truncate text-[13px]">{name}</span>
              </label>
              {checked && (
                <button
                  type="button"
                  onClick={() => setStartPoint(index)}
                  disabled={isComputing}
                  className="ml-auto shrink-0 p-1 bg-transparent border-none cursor-pointer rounded-lg hover:bg-blue-500/10 transition-all duration-150 disabled:cursor-not-allowed"
                  title="Set as starting point"
                >
                  <PinIcon active={isStart} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Solve Button */}
      <button
        className="py-3 px-6 text-white border-none rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 hover:shadow-card-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:brightness-100 active:scale-[0.98]"
        style={{ background: 'var(--stat-gradient)' }}
        onClick={onSolve}
        disabled={isComputing || selectedLocations.size < 2}
      >
        {isComputing
          ? "Computing..."
          : selectedLocations.size < 2
            ? "Select at least 2 locations"
            : `Find Optimal Route for ${selectedLocations.size} Locations`}
      </button>
    </section>
  );
}
