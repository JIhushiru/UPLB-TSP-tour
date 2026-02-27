"""
Route Geometry Generator for UPLB Campus Tour

Pre-computes OSRM road route geometries for all landmark pairs,
so the frontend can display road-following routes without any
runtime API calls.

Usage:
    python generate_routes.py

Output:
    Generates frontend/src/tsp/routes.ts with pre-computed route
    geometries for every pair of landmarks.
"""

import json
import time
import urllib.request

# Import landmarks from generate_matrix.py (keep in sync)
LANDMARKS = [
    ("UP Gate",                     14.16759, 121.24301),
    ("Carabao Park",                14.16685, 121.24297),
    ("Raymundo Gate",               14.16777, 121.24152),
    ("University Library",          14.16557, 121.23900),
    ("Oblation Park",               14.16510, 121.24170),
    ("Mariang Banga",               14.16376, 121.24087),
    ("DL Umali Hall",               14.16398, 121.24013),
    ("Freedom Park",                14.16128, 121.24173),
    ("Baker Hall",                  14.16139, 121.24227),
    ("Carillon Tower",              14.15926, 121.24238),
    ("Copeland",                    14.15694, 121.24253),
    ("SEARCA",                      14.16509, 121.24018),
    ("Botanical Garden",            14.15669, 121.23399),
    ("IRRI",                        14.16772, 121.25421),
    ("SU Building",                 14.16328, 121.24133),
    ("College of Forestry",         14.15443, 121.23454),
    ("Physical Sciences Bldg",      14.16460, 121.24195),
    ("CEAT Building",               14.16227, 121.24795),
    ("CVM",                         14.15785, 121.24302),
    ("Athletics Oval",              14.16052, 121.24287),
    ("Graduate School",             14.16369, 121.23932),
    ("Humanities Building",         14.16524, 121.24227),
    ("NCAS",                        14.16545, 121.24119),
    ("Institute of Animal Science", 14.15883, 121.24448),
    ("CEM Building",                14.16719, 121.24160),
    ("College of Human Ecology",    14.16467, 121.24283),
    ("Math Building",               14.16488, 121.24369),
]


def fetch_route_geometry(from_lat, from_lon, to_lat, to_lon):
    """
    Fetch road route geometry from OSRM for a single pair.
    Returns list of [lat, lon] coordinates along the road.
    """
    # OSRM uses lon,lat order
    url = (
        f"http://router.project-osrm.org/route/v1/driving/"
        f"{from_lon},{from_lat};{to_lon},{to_lat}"
        f"?overview=full&geometries=geojson"
    )

    req = urllib.request.Request(url, headers={
        "User-Agent": "UPLB-Campus-Tour-Generator/1.0"
    })

    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode())

    if data.get("code") != "Ok" or not data.get("routes"):
        return [[from_lat, from_lon], [to_lat, to_lon]]

    # GeoJSON coordinates are [lon, lat], convert to [lat, lon]
    coords = data["routes"][0]["geometry"]["coordinates"]
    return [[lat, lon] for lon, lat in coords]


def main():
    n = len(LANDMARKS)
    total_pairs = n * (n - 1)
    print(f"Fetching route geometries for {n} landmarks ({total_pairs} pairs)...\n")

    # routes[i][j] = route geometry from landmark i to landmark j
    routes = [[None] * n for _ in range(n)]

    done = 0
    failed = 0
    BATCH_SIZE = 10
    BATCH_DELAY = 0.5  # seconds between batches

    pairs = [(i, j) for i in range(n) for j in range(n) if i != j]

    for batch_start in range(0, len(pairs), BATCH_SIZE):
        batch = pairs[batch_start:batch_start + BATCH_SIZE]

        for i, j in batch:
            name_from = LANDMARKS[i][0]
            name_to = LANDMARKS[j][0]
            try:
                geo = fetch_route_geometry(
                    LANDMARKS[i][1], LANDMARKS[i][2],
                    LANDMARKS[j][1], LANDMARKS[j][2],
                )
                routes[i][j] = geo
                done += 1
            except Exception as e:
                # Fallback to straight line
                routes[i][j] = [
                    [LANDMARKS[i][1], LANDMARKS[i][2]],
                    [LANDMARKS[j][1], LANDMARKS[j][2]],
                ]
                failed += 1
                print(f"  FAILED {name_from} -> {name_to}: {e}")

            progress = done + failed
            if progress % 50 == 0 or progress == total_pairs:
                print(f"  Progress: {progress}/{total_pairs} ({done} ok, {failed} failed)")

        # Small delay between batches to be polite to the public server
        if batch_start + BATCH_SIZE < len(pairs):
            time.sleep(BATCH_DELAY)

    # Fill diagonal with empty arrays
    for i in range(n):
        routes[i][i] = []

    # Count total coordinate points
    total_points = sum(
        len(routes[i][j])
        for i in range(n) for j in range(n)
        if routes[i][j]
    )
    print(f"\nDone! {total_points} total coordinate points across {total_pairs} routes")
    if failed > 0:
        print(f"  ({failed} routes fell back to straight lines)")

    # Write TypeScript output
    output_path = "frontend/src/tsp/routes.ts"
    with open(output_path, "w") as f:
        f.write("// Pre-computed OSRM road route geometries for all landmark pairs.\n")
        f.write("// Generated by: python generate_routes.py\n")
        f.write("// routes[i][j] = array of [lat, lon] points along the road from landmark i to j.\n")
        f.write("export const routes: [number, number][][][] = [\n")

        for i in range(n):
            f.write("  [\n")
            for j in range(n):
                geo = routes[i][j]
                if not geo:
                    f.write("    [],\n")
                else:
                    # Round coordinates to 5 decimal places to save space
                    points = ", ".join(
                        f"[{lat:.5f}, {lon:.5f}]" for lat, lon in geo
                    )
                    f.write(f"    [{points}],\n")
            f.write("  ],\n")

        f.write("];\n")

    print(f"\nTypeScript output written to {output_path}")

    # Save JSON for reference
    with open("route_geometries.json", "w") as f:
        json.dump(routes, f)
    print("JSON data saved to route_geometries.json")


if __name__ == "__main__":
    main()
