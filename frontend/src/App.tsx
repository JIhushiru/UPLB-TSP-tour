import { useState, useEffect, useRef, useCallback } from "react";
import LocationSelector from "./components/LocationSelector";
import RouteResult from "./components/RouteResult";
import CampusMap from "./components/CampusMap";
import { graph, locations } from "./tsp/data";
import type { TSPResult } from "./tsp/types";
import SolverWorker from "./tsp/solver.worker.js?worker";

function getInitialTheme(): "light" | "dark" | null {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return null;
}

const DEFAULT_SELECTION = new Set(Array.from({ length: 14 }, (_, i) => i));

function App() {
  const [selectedLocations, setSelectedLocations] = useState<Set<number>>(DEFAULT_SELECTION);
  const [startPoint, setStartPoint] = useState(0);
  const [result, setResult] = useState<TSPResult | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | null>(getInitialTheme);
  const [animationStep, setAnimationStep] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimer = useRef<number | undefined>(undefined);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.removeItem("theme");
    }
  }, [theme]);

  useEffect(() => {
    return () => {
      clearInterval(animationTimer.current);
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

  useEffect(() => {
    setResult(null);
    setAnimationStep(null);
    setIsAnimating(false);
    setIsComputing(false);
    clearInterval(animationTimer.current);
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, [selectedLocations]);

  useEffect(() => {
    if (!selectedLocations.has(startPoint)) {
      const first = [...selectedLocations].sort((a, b) => a - b)[0];
      if (first !== undefined) setStartPoint(first);
    }
  }, [selectedLocations, startPoint]);

  function toggleTheme() {
    const isDark =
      theme === "dark" ||
      (theme === null && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setTheme(isDark ? "light" : "dark");
  }

  function handleSolve() {
    const selectedArray = [...selectedLocations].sort((a, b) => a - b);
    if (selectedArray.length < 2) return;

    if (workerRef.current) workerRef.current.terminate();

    setIsComputing(true);
    setResult(null);

    const worker = new SolverWorker();
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<TSPResult>) => {
      setResult(e.data);
      setIsComputing(false);
      worker.terminate();
      workerRef.current = null;
    };

    worker.postMessage({ graph, locations, selectedIndices: selectedArray, startNode: startPoint });
  }

  const handleAnimate = useCallback(() => {
    if (!result) return;
    const totalSegments = result.segments.length;
    setAnimationStep(0);
    setIsAnimating(true);
    clearInterval(animationTimer.current);

    let step = 0;
    animationTimer.current = window.setInterval(() => {
      step += 1;
      if (step >= totalSegments) {
        clearInterval(animationTimer.current);
        setIsAnimating(false);
        setAnimationStep(null);
      } else {
        setAnimationStep(step);
      }
    }, 800);
  }, [result]);

  const effectiveTheme =
    theme ||
    (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  return (
    <div className="max-w-[900px] mx-auto py-8 px-6 font-sans text-foreground max-[500px]:p-4">
      <header className="flex items-center justify-center mb-10 relative">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-heading mb-1.5">
            UPLB Campus Tour
          </h1>
          <p className="m-0 text-muted text-sm tracking-wide">
            Travelling Salesman Problem &mdash; Optimal Route Finder
          </p>
        </div>
        <button
          className="absolute right-0 top-0 bg-transparent border-none cursor-pointer p-1.5 text-muted opacity-60 transition-opacity duration-200 hover:opacity-100"
          onClick={toggleTheme}
          aria-label={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} mode`}
        >
          {effectiveTheme === "dark" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </header>

      <main>
        <LocationSelector
          selectedLocations={selectedLocations}
          setSelectedLocations={setSelectedLocations}
          startPoint={startPoint}
          setStartPoint={setStartPoint}
          onSolve={handleSolve}
          isComputing={isComputing}
        />

        <CampusMap
          result={result}
          startPoint={startPoint}
          selectedLocations={selectedLocations}
          animationStep={animationStep}
        />

        {isComputing && (
          <div className="text-center py-8 text-muted">
            <div className="w-8 h-8 border-[3px] border-[var(--border)] border-t-accent rounded-full mx-auto mb-3 animate-spin" />
            <p className="text-sm">Finding the optimal route across {selectedLocations.size} landmarks...</p>
          </div>
        )}

        <RouteResult
          result={result}
          animationStep={animationStep}
          onAnimate={handleAnimate}
          isAnimating={isAnimating}
        />
      </main>
    </div>
  );
}

export default App;
