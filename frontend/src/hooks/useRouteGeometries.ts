import { useMemo } from "react";
import { routes } from "../tsp/routes";
import type { TSPResult } from "../tsp/types";

export type RouteGeometry = [number, number][];

export function useRouteGeometries(result: TSPResult | null) {
  const routeGeometries = useMemo<RouteGeometry[] | null>(() => {
    if (!result) return null;
    const { path } = result;

    return path.slice(0, -1).map((fromIdx, i) => {
      const toIdx = path[i + 1];
      const geo = routes[fromIdx]?.[toIdx];
      return geo && geo.length > 0 ? geo : [routes[fromIdx]?.[toIdx]?.[0] ?? [0, 0], routes[fromIdx]?.[toIdx]?.[1] ?? [0, 0]];
    });
  }, [result]);

  return { routeGeometries, isLoadingRoutes: false };
}
