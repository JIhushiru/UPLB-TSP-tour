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
      <header className="flex items-center justify-center mb-8 relative">
        <div className="text-center">
          <h1 className="text-[1.8rem] font-bold mb-1 text-heading">
            UPLB Campus Tour
          </h1>
          <p className="m-0 text-muted text-[0.95rem]">
            Travelling Salesman Problem &mdash; Optimal Route Finder
          </p>
        </div>
        <button
          className="absolute right-0 top-0 bg-surface border rounded-lg py-[0.45rem] px-2.5 cursor-pointer text-xl leading-none transition-colors duration-200 hover:bg-[var(--border)]"
          onClick={toggleTheme}
          aria-label={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} mode`}
        >
          {effectiveTheme === "dark" ? "\u2600\uFE0F" : "\uD83C\uDF19"}
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
            <p>Finding the optimal route across {selectedLocations.size} landmarks...</p>
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
