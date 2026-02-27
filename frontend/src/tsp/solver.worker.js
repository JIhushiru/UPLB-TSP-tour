// Web Worker for TSP computation — keeps the main thread responsive.
// Receives { graph, locations, selectedIndices, startNode } and posts back the result.

self.onmessage = function (e) {
  const { graph, locations, selectedIndices, startNode } = e.data;

  const n = selectedIndices.length;
  const subGraph = [];
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      row.push(graph[selectedIndices[i]][selectedIndices[j]]);
    }
    subGraph.push(row);
  }

  const subStart = selectedIndices.indexOf(startNode);
  const fullMask = (1 << n) - 1;

  const dp = Array.from({ length: n }, () => new Float64Array(1 << n).fill(-1));
  const parent = Array.from({ length: n }, () => new Int8Array(1 << n).fill(-1));

  function tsp(curr, mask) {
    if (mask === 0) return subGraph[curr][subStart];
    if (dp[curr][mask] !== -1) return dp[curr][mask];

    let minCost = Number.MAX_SAFE_INTEGER;
    let nextNode = -1;

    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        const cost = subGraph[curr][i] + tsp(i, mask ^ (1 << i));
        if (cost < minCost) {
          minCost = cost;
          nextNode = i;
        }
      }
    }

    dp[curr][mask] = minCost;
    parent[curr][mask] = nextNode;
    return minCost;
  }

  const minCost = tsp(subStart, fullMask ^ (1 << subStart));

  // Reconstruct path
  const subPath = [subStart];
  let curr = subStart;
  let mask = fullMask ^ (1 << subStart);

  while (mask !== 0) {
    const next = parent[curr][mask];
    subPath.push(next);
    mask = mask ^ (1 << next);
    curr = next;
  }
  subPath.push(subStart);

  const path = subPath.map((i) => selectedIndices[i]);

  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += graph[path[i]][path[i + 1]];
  }

  const segments = [];
  for (let i = 0; i < path.length - 1; i++) {
    segments.push({
      from: locations[path[i]],
      to: locations[path[i + 1]],
      distance: graph[path[i]][path[i + 1]],
    });
  }

  self.postMessage({
    minCost,
    path,
    pathLocations: path.map((i) => locations[i]),
    totalDistance,
    segments,
  });
};
