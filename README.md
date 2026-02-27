# UPLB Campus Tour

> An interactive web app that finds the optimal route between UPLB campus landmarks, built with the Travelling Salesman Problem.

## Features

- Select up to 22 campus landmarks to include in the route
- Choose any location as the starting point
- Computes the shortest route visiting all selected locations and returning to the start
- Interactive map with numbered route markers, road-following routes, and animated journey playback
- Displays total distance and detailed route segments
- Light/dark mode support

## Data Collection & Preparation

### Old Method (Manual)

1. Gather distance data using OpenStreetMap (OSM) as the base map
2. Use QGIS with QuickOSM plugin to download or access the OSM network layer
3. Use network analysis tools in QGIS (ORS Tools) to compute shortest path distances between each pair of landmarks
4. Export results to Excel in a 2D matrix form (CSV)
5. Clean the matrix in Excel (ensuring symmetry)
6. **Manually copy-paste** the matrix from Excel into the Python code as a nested list (`graph = [[...], [...], ...]`)

This approach only supported **14 fixed locations** and required re-doing the entire process to add new landmarks.

### Current Method (Automated)

1. **Generate coordinates** — `generate_coordinates.py` fetches all named locations in the UPLB campus area from OpenStreetMap via the [Overpass API](https://overpass-api.de/), then fuzzy-matches each landmark name against OSM features using similarity scoring
   ```bash
   python generate_coordinates.py
   ```
   - Uses `difflib.SequenceMatcher` for fuzzy string matching
   - Supports alternate names (e.g., "Athletics Oval" matches "UPLB Grandstand")
   - Manual coordinate overrides via `MANUAL_OVERRIDES` for landmarks where OSM data is inaccurate
2. **Generate distance matrix** — `generate_matrix.py` computes road distances between all landmarks via the [OSRM API](http://project-osrm.org/) (routes along actual OpenStreetMap road networks)
   ```bash
   python generate_matrix.py
   ```
3. **Generate route geometries** — `generate_routes.py` pre-computes the actual road paths (coordinate-by-coordinate) for every pair of landmarks via OSRM, so the map can display road-following routes instead of straight lines
   ```bash
   python generate_routes.py
   ```
4. Paste the outputs into `frontend/src/tsp/data.ts` and `frontend/src/tsp/routes.ts`
4. Users can **dynamically select** which locations to include — the solver extracts the relevant sub-graph at runtime

This supports **27 locations**. To add more, add the landmark name to `generate_coordinates.py`, run all three scripts, and update `data.ts` and `routes.ts`.

## Algorithm

- **Dynamic Programming with Bitmasking** for optimal TSP path computation
- **Memoization** via DP table for improved performance
- **Path reconstruction** from the parent table
- Runs in a **Web Worker** to keep the UI responsive during computation
- Computation limit of 22 locations (2^22 bitmask states) to keep solve times reasonable

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Map:** Leaflet + OpenStreetMap tiles + OSRM road-following routes
- **Algorithm:** Pure TypeScript (runs client-side in a Web Worker)
- **Original Prototype:** Python (CLI-based, `finaltour.py`)

## How to Run

### Web App (Frontend)

```bash
cd frontend
npm install
npm run dev
```

### Original Python Script

```bash
python finaltour.py
```

Enter a starting point between 0 and 13 when prompted.

## Campus Landmarks

| Index | Landmark |
| ----- | -------- |
| 0 | UP Gate |
| 1 | Carabao Park |
| 2 | Raymundo Gate |
| 3 | University Library |
| 4 | Oblation Park |
| 5 | Mariang Banga |
| 6 | DL Umali Hall |
| 7 | Freedom Park |
| 8 | Baker Hall |
| 9 | Carillon Tower |
| 10 | Copeland |
| 11 | SEARCA |
| 12 | Botanical Garden |
| 13 | IRRI |
| 14 | SU Building |
| 15 | College of Forestry |
| 16 | Physical Sciences Bldg |
| 17 | CEAT Building |
| 18 | CVM |
| 19 | Athletics Oval |
| 20 | Graduate School |
| 21 | Humanities Building |
| 22 | NCAS |
| 23 | Institute of Animal Science |
| 24 | CEM Building |
| 25 | College of Human Ecology |
| 26 | Math Building |

## Author

Created by **Jer Heseoh R. Arsolon**
University of the Philippines Los Banos
Bachelor of Science in Applied Mathematics
