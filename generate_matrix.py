"""
Distance Matrix Generator for UPLB Campus Tour

Computes road distances (in meters) between all campus landmarks
using the OSRM (Open Source Routing Machine) API, which routes
along actual OpenStreetMap road networks.

Usage:
    python generate_matrix.py

Output:
    Prints the distance matrix and TypeScript-ready code to paste
    into frontend/src/tsp/data.ts
"""

import json
import urllib.request

# Campus landmark coordinates [latitude, longitude]
LANDMARKS = [
    ("UP Gate",                      14.16740, 121.24130),
    ("Carabao Park",                 14.16650, 121.24220),
    ("Raymundo Gate",                14.16380, 121.24530),
    ("University Library",           14.16100, 121.24400),
    ("Oblation Park",                14.16370, 121.24300),
    ("Mariang Banga",                14.15880, 121.24180),
    ("DL Umali Hall",                14.15650, 121.24000),
    ("Freedom Park",                 14.15350, 121.23800),
    ("Baker Hall",                   14.15100, 121.23650),
    ("Carillon Tower",               14.15780, 121.24400),
    ("Copeland",                     14.15550, 121.24900),
    ("SEARCA",                       14.15050, 121.23300),
    ("Botanical Garden",             14.16050, 121.24250),
    ("IRRI",                         14.15950, 121.24350),
    ("SU Building",                  14.16450, 121.24350),
    ("College of Forestry",          14.15200, 121.24550),
    ("Physical Sciences Bldg",       14.16550, 121.24450),
    ("CEAT Building",                14.15450, 121.23950),
    ("CVM",                          14.15300, 121.24200),
    ("Athletics Oval",               14.16200, 121.24100),
    ("Graduate School",              14.16300, 121.24550),
    ("Humanities Building",          14.16200, 121.24450),
    ("NCAS",                         14.15750, 121.24700),
    ("Institute of Animal Science",  14.15480, 121.24580),
    ("CEM Building",                 14.16080, 121.24320),
    ("College of Human Ecology",     14.15900, 121.24500),
    ("Math Building",                14.16488, 121.24369),
]


def fetch_distance_matrix(landmarks):
    """
    Use the OSRM Table API to compute road distances between all landmarks.
    OSRM routes along actual OpenStreetMap road networks.
    """
    # Build coordinate string (OSRM uses lon,lat order)
    coords = ";".join(f"{lon},{lat}" for _, lat, lon in landmarks)
    url = f"http://router.project-osrm.org/table/v1/driving/{coords}?annotations=distance"

    print(f"Fetching distance matrix for {len(landmarks)} landmarks from OSRM...")
    print(f"API URL: {url}\n")

    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode())

    if data.get("code") != "Ok":
        raise RuntimeError(f"OSRM API error: {data.get('code')} - {data.get('message', 'Unknown error')}")

    return data["distances"]


def format_matrix_typescript(matrix):
    """Format the distance matrix as TypeScript code."""
    lines = ["export const graph: number[][] = ["]
    for row in matrix:
        values = ", ".join(f"{v:.1f}" if v != 0 else "0" for v in row)
        lines.append(f"  [{values}],")
    lines.append("];")
    return "\n".join(lines)


def print_summary(matrix, landmarks):
    """Print a summary of the distance matrix."""
    n = len(landmarks)
    all_dists = [matrix[i][j] for i in range(n) for j in range(n) if i != j]
    print(f"Landmarks: {n}")
    print(f"Matrix size: {n}x{n}")
    print(f"Min distance: {min(all_dists):.1f} m")
    print(f"Max distance: {max(all_dists):.1f} m")
    print(f"Avg distance: {sum(all_dists) / len(all_dists):.1f} m")


def main():
    matrix = fetch_distance_matrix(LANDMARKS)

    print("Distance matrix computed successfully!\n")
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print_summary(matrix, LANDMARKS)

    print("\n" + "=" * 60)
    print("TYPESCRIPT OUTPUT (paste into frontend/src/tsp/data.ts)")
    print("=" * 60 + "\n")
    print(format_matrix_typescript(matrix))

    # Also save to a file for convenience
    with open("distance_matrix.json", "w") as f:
        json.dump({
            "landmarks": [{"name": name, "lat": lat, "lon": lon} for name, lat, lon in LANDMARKS],
            "distances": matrix,
        }, f, indent=2)
    print("\nFull data saved to distance_matrix.json")


if __name__ == "__main__":
    main()
