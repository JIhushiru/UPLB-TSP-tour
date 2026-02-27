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
      className={`shrink-0 transition-colors duration-150 ${
        active ? "text-blue-500" : "text-muted opacity-0 group-hover:opacity-60"
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
    <div className="flex flex-col gap-3 bg-surface border rounded-[10px] p-6 mb-6">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted">
          Select Locations ({selectedLocations.size}/{MAX_SELECTION})
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            className="bg-transparent border-none text-accent-foreground text-xs font-medium py-1 px-1.5 cursor-pointer underline hover:opacity-80 disabled:opacity-50"
            onClick={selectAll}
            disabled={isComputing}
          >
            Select All
          </button>
          <button
            type="button"
            className="bg-transparent border-none text-accent-foreground text-xs font-medium py-1 px-1.5 cursor-pointer underline hover:opacity-80 disabled:opacity-50"
            onClick={deselectAll}
            disabled={isComputing}
          >
            Clear
          </button>
        </div>
      </div>

      {selectedLocations.size >= 1 && (
        <p className="m-0 text-xs text-muted flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" className="text-blue-500 shrink-0">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" fill="white" stroke="white" strokeWidth="2" />
          </svg>
          <span>Click the pin icon to set a starting point</span>
        </p>
      )}

      {atLimit && (
        <p className="m-0 text-xs text-amber-500">
          Maximum of {MAX_SELECTION} locations reached. The TSP algorithm uses dynamic programming
          with bitmask states (2<sup>n</sup>), so computation time grows exponentially with more locations.
        </p>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-1.5">
        {locations.map((name, index) => {
          const checked = selectedLocations.has(index);
          const disabled = !checked && atLimit;
          const isStart = checked && index === startPoint;
          return (
            <div
              key={index}
              className={`group flex items-center gap-1.5 py-[0.35rem] px-2 rounded-md text-sm text-foreground transition-colors duration-150 border min-w-0 ${
                isStart
                  ? "bg-blue-600/15 border-blue-500 font-semibold"
                  : checked
                    ? "bg-accent-surface border-accent font-medium"
                    : "border-transparent font-normal"
              } ${disabled ? "opacity-40" : ""} hover:bg-background`}
            >
              <label className="flex items-center gap-1.5 min-w-0 flex-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled || isComputing}
                  onChange={() => toggleLocation(index)}
                  className={`accent-accent w-[15px] h-[15px] shrink-0 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                />
                <span className="truncate">{name}</span>
              </label>
              {checked && (
                <button
                  type="button"
                  onClick={() => setStartPoint(index)}
                  disabled={isComputing}
                  className="ml-auto shrink-0 p-0.5 bg-transparent border-none cursor-pointer rounded hover:bg-blue-500/10 transition-colors duration-150 disabled:cursor-not-allowed"
                  title="Set as starting point"
                >
                  <PinIcon active={isStart} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button
        className="py-[0.7rem] px-5 bg-accent text-white border-none rounded-md text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={onSolve}
        disabled={isComputing || selectedLocations.size < 2}
      >
        {isComputing
          ? "Computing..."
          : selectedLocations.size < 2
            ? "Select at least 2 locations"
            : "Find Optimal Route"}
      </button>
    </div>
  );
}
