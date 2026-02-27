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
