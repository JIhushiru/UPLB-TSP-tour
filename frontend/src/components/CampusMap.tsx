import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { locations, coordinates } from "../tsp/data";
import type { TSPResult } from "../tsp/types";
import type { RouteGeometry } from "../hooks/useRouteGeometries";
import { getLocationImagePath, FALLBACK_IMAGE } from "../utils/locationImages";

const CENTER: [number, number] = [14.1590, 121.2410];
const ZOOM = 15;

function createDotIcon(color: string, size: number) {
  return L.divIcon({
    className: "map-marker",
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2px solid white;
      border-radius:50%;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createNumberedIcon(color: string, size: number, label: string) {
  return L.divIcon({
    className: "map-marker",
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2.5px solid white;
      border-radius:50%;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
      color:white;font-size:${Math.max(size * 0.42, 9)}px;font-weight:800;
      line-height:1;font-family:Inter,system-ui,sans-serif;
    ">${label}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const unselectedIcon = createDotIcon("#9ca3af", 10);
const selectedIcon = createDotIcon("#6b7280", 14);

function AnimationPanner({ path, animationStep }: { path: number[]; animationStep: number }) {
  const map = useMap();
  useEffect(() => {
    if (animationStep !== null && animationStep !== undefined && path) {
      const nodeIdx = path[animationStep + 1] ?? path[animationStep];
      const pos = coordinates[nodeIdx];
      if (pos) map.panTo(pos, { animate: true, duration: 0.5 });
    }
  }, [animationStep, path, map]);
  return null;
}

function FitBounds({ indices }: { indices: number[] }) {
  const map = useMap();
  useEffect(() => {
    if (indices && indices.length > 1) {
      const latlngs = indices.map((i) => coordinates[i]);
      map.fitBounds(latlngs, { padding: [40, 40] });
    }
  }, [indices, map]);
  return null;
}

const TILE_LIGHT = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const ATTR_LIGHT = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const ATTR_DARK = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

interface CampusMapProps {
  result: TSPResult | null;
  startPoint: number;
  selectedLocations: Set<number>;
  animationStep: number | null;
  routeGeometries: RouteGeometry[] | null;
  isLoadingRoutes: boolean;
  theme: "light" | "dark";
}

export default function CampusMap({ result, startPoint, selectedLocations, animationStep, routeGeometries, theme }: CampusMapProps) {
  const path = result?.path;
  const mapRef = useRef(null);
  const isAnimating = animationStep !== null && animationStep !== undefined;

  const visibleSegments = isAnimating ? animationStep + 1 : (path ? path.length - 1 : 0);

  const routeLatLngs = path
    ? path.slice(0, visibleSegments + 1).map((i) => coordinates[i])
    : [];

  const lineOptions = {
    color: "#3b82f6",
    weight: 4,
    opacity: 0.85,
  };

  const visibleIndices = selectedLocations && selectedLocations.size > 0
    ? [...selectedLocations]
    : coordinates.map((_, i) => i);

  const reachedNodes = new Set<number>();
  if (path && isAnimating) {
    for (let i = 0; i <= visibleSegments && i < path.length; i++) {
      reachedNodes.add(path[i]);
    }
  }

  const routeOrder = new Map<number, number>();
  if (path) {
    for (let i = 0; i < path.length - 1; i++) {
      if (!routeOrder.has(path[i])) {
        routeOrder.set(path[i], i + 1);
      }
    }
  }

  const currentLocationIndex = isAnimating && path
    ? (path[animationStep + 1] ?? path[animationStep])
    : null;
  const currentLocationName = currentLocationIndex !== null
    ? locations[currentLocationIndex]
    : null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <line x1="9" y1="3" x2="9" y2="18" />
            <line x1="15" y1="6" x2="15" y2="21" />
          </svg>
        </div>
        <h2 className="text-sm font-bold text-heading m-0">Campus Map</h2>
      </div>

      <div className="relative rounded-2xl overflow-hidden shadow-card-lg border">
        <MapContainer
          center={CENTER}
          zoom={ZOOM}
          className="w-full h-[600px] z-0 max-[500px]:h-[400px]"
          ref={mapRef}
          scrollWheelZoom={true}
        >
          <TileLayer
            key={theme}
            attribution={theme === "dark" ? ATTR_DARK : ATTR_LIGHT}
            url={theme === "dark" ? TILE_DARK : TILE_LIGHT}
          />

          <FitBounds indices={visibleIndices} />
          {isAnimating && <AnimationPanner path={path!} animationStep={animationStep} />}

          {routeGeometries && path ? (
            <>
              {routeGeometries.map((segmentCoords, i) => {
                if (i >= visibleSegments) return null;
                return (
                  <Polyline key={`route-seg-${i}`} positions={segmentCoords} pathOptions={lineOptions} />
                );
              })}
            </>
          ) : (
            routeLatLngs.length > 1 && (
              <Polyline positions={routeLatLngs} pathOptions={lineOptions} />
            )
          )}

          {coordinates.map((pos, i) => {
            const isSelected = selectedLocations?.has(i);
            const isStart = i === startPoint && isSelected;
            const isInPath = path?.includes(i);
            const order = routeOrder.get(i);

            let icon;
            if (isStart && order !== undefined) {
              icon = createNumberedIcon("#2563eb", 26, String(order));
            } else if (isAnimating && isInPath && order !== undefined) {
              icon = reachedNodes.has(i)
                ? createNumberedIcon("#3b82f6", 24, String(order))
                : createNumberedIcon("#6b7280", 24, String(order));
            } else if (isInPath && order !== undefined) {
              icon = createNumberedIcon("#3b82f6", 24, String(order));
            } else if (isSelected) {
              icon = selectedIcon;
            } else {
              icon = unselectedIcon;
            }

            return (
              <Marker key={i} position={pos} icon={icon} opacity={isSelected ? 1 : 0.5}>
                <Tooltip direction="top" offset={[0, -10]} permanent={false}>
                  {locations[i]}
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Animation overlay card */}
        {isAnimating && currentLocationName && (
          <div
            className="absolute top-4 right-4 z-[1000] bg-surface/90 backdrop-blur-md text-foreground rounded-2xl overflow-hidden pointer-events-none animate-fadeIn shadow-card-xl border max-w-[180px] max-[500px]:max-w-[140px] max-[500px]:top-3 max-[500px]:right-3"
            key={currentLocationIndex}
          >
            <img
              src={getLocationImagePath(currentLocationIndex!)}
              alt={currentLocationName}
              className="block w-full h-[110px] object-cover max-[500px]:h-[80px]"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
            />
            <div className="py-2 px-3">
              <span className="block text-xs font-bold text-heading truncate">
                {currentLocationName}
              </span>
              <span className="block text-[10px] text-muted mt-0.5">
                Stop {(animationStep ?? 0) + 2} of {path?.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
