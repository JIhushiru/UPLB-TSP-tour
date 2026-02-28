import { useState, useEffect, useRef, useCallback } from "react";
import LocationSelector from "./components/LocationSelector";
import RouteResult from "./components/RouteResult";
import CampusMap from "./components/CampusMap";
import { graph, locations } from "./tsp/data";
import type { TSPResult } from "./tsp/types";
import { useRouteGeometries } from "./hooks/useRouteGeometries";
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
  const { routeGeometries, isLoadingRoutes } = useRouteGeometries(result);

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
    if (!result || isLoadingRoutes) return;
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
  }, [result, isLoadingRoutes]);

  const effectiveTheme =
    theme ||
    (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  return (
    <div className="max-w-[960px] mx-auto py-10 px-6 font-sans text-foreground max-[500px]:py-6 max-[500px]:px-4">
      {/* Hero Header */}
      <header className="relative mb-10 max-[500px]:mb-8">
        <div
          className="rounded-2xl border p-8 max-[500px]:p-5 text-center"
          style={{ background: 'var(--hero-gradient)', borderColor: 'var(--hero-border)' }}
        >
          <div className="inline-flex items-center gap-1.5 bg-accent/10 text-accent-foreground text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full mb-4">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Campus Navigation
          </div>
          <h1 className="text-4xl max-[500px]:text-2xl font-extrabold tracking-tight text-heading mb-2 leading-tight">
            UPLB Campus Tour
          </h1>
          <p className="m-0 text-muted text-sm max-w-md mx-auto leading-relaxed">
            Find the shortest walking route between campus landmarks using the{" "}
            <span className="text-accent-foreground font-semibold">Travelling Salesman Problem</span>{" "}
            algorithm
          </p>
        </div>

        <button
          className="absolute right-3 top-3 max-[500px]:right-2 max-[500px]:top-2 w-9 h-9 flex items-center justify-center rounded-xl bg-surface/80 backdrop-blur border text-muted transition-all duration-200 hover:text-heading hover:shadow-card-lg hover:scale-105 cursor-pointer"
          onClick={toggleTheme}
          aria-label={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} mode`}
        >
          {effectiveTheme === "dark" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </header>

      <main className="flex flex-col gap-8 max-[500px]:gap-6">
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
          routeGeometries={routeGeometries}
          isLoadingRoutes={isLoadingRoutes}
          theme={effectiveTheme}
        />

        {isComputing && (
          <div className="text-center py-10">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-[3px] border-accent/20" />
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-accent animate-spin" />
              </div>
              <div>
                <p className="text-sm font-medium text-heading m-0 mb-1">Computing optimal route</p>
                <p className="text-xs text-muted m-0">Analyzing {selectedLocations.size} landmarks...</p>
              </div>
            </div>
          </div>
        )}

        <RouteResult
          result={result}
          animationStep={animationStep}
          onAnimate={handleAnimate}
          isAnimating={isAnimating}
        />
      </main>

      <footer className="mt-12 pt-6 border-t text-center">
        <p className="text-xs text-muted m-0">
          Built by{" "}
          <a
            href="https://jhraportfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-foreground font-semibold hover:underline transition-colors duration-200"
          >
            JHRA
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
