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
      box-shadow:0 1px 4px rgba(0,0,0,0.4);
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
      border:2px solid white;
      border-radius:50%;
      box-shadow:0 1px 4px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
      color:white;font-size:${Math.max(size * 0.45, 9)}px;font-weight:700;
      line-height:1;
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

  // Build a map from location index to its route order (1-based), excluding the return-to-start duplicate
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
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3 text-heading">Campus Map</h2>
      <div className="relative">
        <MapContainer
          center={CENTER}
          zoom={ZOOM}
          className="w-full h-[600px] rounded-[10px] border z-0 max-[500px]:h-[400px]"
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
              icon = createNumberedIcon("#2563eb", 24, String(order));
            } else if (isAnimating && isInPath && order !== undefined) {
              icon = reachedNodes.has(i)
                ? createNumberedIcon("#3b82f6", 22, String(order))
                : createNumberedIcon("#6b7280", 22, String(order));
            } else if (isInPath && order !== undefined) {
              icon = createNumberedIcon("#3b82f6", 22, String(order));
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

        {isAnimating && currentLocationName && (
          <div
            className="absolute top-3 right-3 z-[1000] bg-black/75 text-white rounded-[10px] overflow-hidden pointer-events-none animate-fadeIn shadow-[0_4px_12px_rgba(0,0,0,0.3)] max-w-[170px] max-[500px]:max-w-[130px]"
            key={currentLocationIndex}
          >
            <img
              src={getLocationImagePath(currentLocationIndex!)}
              alt={currentLocationName}
              className="block w-full h-[100px] object-cover max-[500px]:h-[75px]"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
            />
            <span className="block py-1.5 px-[0.7rem] text-sm font-semibold text-center truncate">
              {currentLocationName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
