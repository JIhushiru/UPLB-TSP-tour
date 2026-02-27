export interface Segment {
  from: string;
  to: string;
  distance: number;
}

export interface TSPResult {
  minCost: number;
  path: number[];
  pathLocations: string[];
  totalDistance: number;
  elapsedMs?: number;
  segments: Segment[];
}
