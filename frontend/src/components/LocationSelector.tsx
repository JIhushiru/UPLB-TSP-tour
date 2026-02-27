import type { Dispatch, SetStateAction } from "react";
import { locations } from "../tsp/data";

const MAX_SELECTION = 22;

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
  const selectedArray = [...selectedLocations].sort((a, b) => a - b);
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

  const validStart = selectedLocations.has(startPoint);

  return (
    <div className="flex flex-col gap-3 bg-surface border rounded-[10px] p-6 mb-6">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-[0.9rem] text-muted">
          Select Locations ({selectedLocations.size}/{MAX_SELECTION})
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            className="bg-transparent border-none text-accent-foreground text-[0.8rem] font-medium py-1 px-1.5 cursor-pointer underline hover:opacity-80 disabled:opacity-50"
            onClick={selectAll}
            disabled={isComputing}
          >
            Select All
          </button>
          <button
            type="button"
            className="bg-transparent border-none text-accent-foreground text-[0.8rem] font-medium py-1 px-1.5 cursor-pointer underline hover:opacity-80 disabled:opacity-50"
            onClick={deselectAll}
            disabled={isComputing}
          >
            Clear
          </button>
        </div>
      </div>

      {atLimit && (
        <p className="m-0 text-[0.8rem] text-amber-500">
          Maximum of {MAX_SELECTION} locations reached. The TSP algorithm uses dynamic programming
          with bitmask states (2<sup>n</sup>), so computation time grows exponentially with more locations.
        </p>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-1.5">
        {locations.map((name, index) => {
          const checked = selectedLocations.has(index);
          const disabled = !checked && atLimit;
          return (
            <label
              key={index}
              className={`flex items-center gap-1.5 py-[0.35rem] px-2 rounded-md text-[0.85rem] text-foreground cursor-pointer transition-colors duration-150 border border-transparent hover:bg-background min-w-0 ${
                checked ? "bg-accent-surface border-accent font-medium" : "font-normal"
              } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled || isComputing}
                onChange={() => toggleLocation(index)}
                className="accent-accent w-[15px] h-[15px] shrink-0 cursor-[inherit]"
              />
              <span className="truncate">{name}</span>
            </label>
          );
        })}
      </div>

      {selectedArray.length >= 2 && (
        <>
          <label htmlFor="start-point" className="font-semibold text-[0.9rem] text-muted">
            Starting Location
          </label>
          <select
            id="start-point"
            value={validStart ? startPoint : selectedArray[0]}
            onChange={(e) => setStartPoint(Number(e.target.value))}
            disabled={isComputing}
            className="py-2.5 px-3 border border-input rounded-md text-[0.95rem] bg-background text-foreground cursor-pointer"
          >
            {selectedArray.map((index) => (
              <option key={index} value={index}>
                {locations[index]}
              </option>
            ))}
          </select>
        </>
      )}

      <button
        className="py-[0.7rem] px-5 bg-accent text-white border-none rounded-md text-base font-semibold cursor-pointer transition-colors duration-200 hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed"
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
