"""
Coordinate Generator for UPLB Campus Tour

Geocodes campus landmark names to latitude/longitude coordinates by:
  1. Fetching all named locations in the UPLB area from OpenStreetMap (Overpass API)
  2. Fuzzy-matching each landmark name against OSM feature names using similarity scoring
  3. Manual overrides for landmarks where OSM data is inaccurate

Usage:
    python generate_coordinates.py

Output:
    Prints coordinates for each landmark and generates Python-ready
    code to paste into generate_matrix.py
"""

import json
import urllib.request
import urllib.parse
from difflib import SequenceMatcher

# UPLB bounding box (covers the campus area)
UPLB_BOUNDS = {
    "south": 14.148,
    "north": 14.170,
    "west": 121.228,
    "east": 121.255,
}

# Landmark names to find in OSM
# Each entry can have alternate names to improve fuzzy matching
LANDMARKS = [
    "UP Gate",
    "Carabao Park",
    "Raymundo Gate",
    "University Library",
    "Oblation Park",
    "Mariang Banga",
    "DL Umali Hall",
    "Freedom Park",
    "Baker Hall",
    "Carillon Tower",
    "Copeland",
    "SEARCA",
    "Botanical Garden",
    "IRRI",
    "SU Building",
    "College of Forestry",
    "Physical Sciences Bldg",
    "CEAT Building",
    "CVM",
    "Athletics Oval",
    "Graduate School",
    "Humanities Building",
    "NCAS",
    "Institute of Animal Science",
    "CEM Building",
    "College of Human Ecology",
    "Math Building",
]

# Alternate names to try when fuzzy matching (checked alongside the main name)
ALTERNATE_NAMES = {
    "Mariang Banga":          ["Ang Babaing May Dalang Banga"],
    "DL Umali Hall":          ["D.L. Umali Hall", "Umali Hall", "Dioscoro L. Umali Hall"],
    "Copeland":               ["Edwin B. Copeland Gym"],
    "Botanical Garden":       ["Makiling Botanic Garden"],
    "IRRI":                   ["IRRI Maahas Road"],
    "SU Building":            ["Student Union Building"],
    "College of Forestry":    ["CFNR", "College of Forestry and Natural Resources"],
    "Physical Sciences Bldg": ["Institute of Computer Science"],
    "CEAT Building":          ["College of Engineering and Agro-Industrial Technology"],
    "CVM":                    ["College of Veterinary Medicine"],
    "Athletics Oval":         ["UPLB Grandstand"],
    "Humanities Building":    ["Department of Community and Environmental Resource Planning"],
    "NCAS":                   ["Department of Social Sciences"],
    "Institute of Animal Science": ["Bienvenido Maria Gonzales Animal Science Complex"],
    "CEM Building":           ["College of Economics and Management"],
    "College of Human Ecology": ["CHE Building"],
    "Math Building":          ["Institute of Mathematical Sciences and Physics"],
}

# Manual coordinate overrides (from Google Maps)
# Use these when OSM data is inaccurate for a landmark.
# Format: "Landmark Name": (latitude, longitude)
MANUAL_OVERRIDES = {
    "Math Building": (14.16488, 121.24369),
}

# Minimum similarity score to accept a match (0.0 to 1.0)
MIN_SIMILARITY = 0.45


def fetch_osm_features():
    """
    Fetch all named features (nodes, ways, relations) within the UPLB campus
    area using the Overpass API.
    """
    bbox = f"{UPLB_BOUNDS['south']},{UPLB_BOUNDS['west']},{UPLB_BOUNDS['north']},{UPLB_BOUNDS['east']}"

    query = f"""
    [out:json][timeout:30];
    (
      node["name"]({bbox});
      way["name"]({bbox});
      relation["name"]({bbox});
    );
    out center;
    """

    servers = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
    ]
    data = urllib.parse.urlencode({"data": query}).encode()

    print("Fetching all named locations in UPLB area from OpenStreetMap...")
    result = None
    for server in servers:
        try:
            print(f"  Trying {server}...")
            req = urllib.request.Request(server, data=data, headers={
                "User-Agent": "UPLB-Campus-Tour-Generator/1.0"
            })
            with urllib.request.urlopen(req, timeout=60) as resp:
                result = json.loads(resp.read().decode())
            break
        except Exception as e:
            print(f"  Failed: {e}")

    if result is None:
        raise RuntimeError("All Overpass API servers failed. Try again later.")

    features = []
    for element in result.get("elements", []):
        name = element.get("tags", {}).get("name", "")
        if not name:
            continue

        if element["type"] == "node":
            lat, lon = element["lat"], element["lon"]
        elif "center" in element:
            lat, lon = element["center"]["lat"], element["center"]["lon"]
        else:
            continue

        features.append({
            "name": name,
            "lat": lat,
            "lon": lon,
            "type": element["type"],
            "tags": element.get("tags", {}),
        })

    print(f"Found {len(features)} named features in UPLB area\n")
    return features


def similarity(a, b):
    """Compute similarity ratio between two strings (case-insensitive)."""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def find_best_match(landmark, features):
    """
    Find the OSM feature with the highest similarity to the landmark name.
    Also checks alternate names if defined.
    Returns (osm_name, lat, lon, score) or None.
    """
    names_to_check = [landmark]
    if landmark in ALTERNATE_NAMES:
        names_to_check.extend(ALTERNATE_NAMES[landmark])

    best_score = 0
    best_match = None

    for check_name in names_to_check:
        for feature in features:
            osm_name = feature["name"]

            # Compute similarity
            score = similarity(check_name, osm_name)

            # Boost score if one string contains the other
            if check_name.lower() in osm_name.lower() or osm_name.lower() in check_name.lower():
                score = max(score, 0.8)

            if score > best_score:
                best_score = score
                best_match = (osm_name, feature["lat"], feature["lon"], score)

    if best_match and best_score >= MIN_SIMILARITY:
        return best_match

    return None


def main():
    # Step 1: Fetch all OSM features in the UPLB area
    osm_features = fetch_osm_features()

    # Step 2: Fuzzy match each landmark against OSM features
    print(f"Matching {len(LANDMARKS)} landmarks (similarity threshold: {MIN_SIMILARITY})...\n")

    results = []
    not_found = []

    for i, name in enumerate(LANDMARKS):
        print(f"  [{i + 1:2d}/{len(LANDMARKS)}] {name}", end="", flush=True)

        # Check manual overrides first
        if name in MANUAL_OVERRIDES:
            lat, lon = MANUAL_OVERRIDES[name]
            print(f"\n    -> ({lat:.5f}, {lon:.5f})  [Manual override]")
            results.append((name, lat, lon, "manual", 1.0, name))
            continue

        # Fuzzy match against OSM features
        match = find_best_match(name, osm_features)

        if match:
            osm_name, lat, lon, score = match
            print(f"\n    -> \"{osm_name}\" ({lat:.5f}, {lon:.5f})  [score: {score:.0%}]")
            results.append((name, lat, lon, "osm", score, osm_name))
        else:
            print("\n    -> NOT FOUND")
            not_found.append(name)

    # Summary
    print(f"\n{'=' * 60}")
    print("RESULTS")
    print(f"{'=' * 60}")
    print(f"Found: {len(results)}/{len(LANDMARKS)}")

    manual_count = sum(1 for *_, src, _, _ in results if src == "manual")
    osm_count = sum(1 for *_, src, _, _ in results if src == "osm")
    print(f"  via Manual:  {manual_count}")
    print(f"  via OSM:     {osm_count}")

    if not_found:
        print(f"\nNot found ({len(not_found)}):")
        for name in not_found:
            print(f"  - {name}")
        print("\nAdd these to MANUAL_OVERRIDES with coordinates from Google Maps.")

    # Show low-confidence matches for review
    low_confidence = [(name, osm, score) for name, _, _, src, score, osm in results
                      if src == "osm" and score < 0.7]
    if low_confidence:
        print(f"\nLow confidence matches (verify these on Google Maps):")
        for name, osm, score in low_confidence:
            print(f"  - {name} -> \"{osm}\" ({score:.0%})")

    # Output
    print(f"\n{'=' * 60}")
    print("PYTHON OUTPUT (paste into generate_matrix.py)")
    print(f"{'=' * 60}\n")

    print("LANDMARKS = [")
    max_name_len = max(len(f'"{name}"') for name, *_ in results) if results else 0
    for name, lat, lon, *_ in results:
        quoted = f'"{name}"'
        padding = " " * (max_name_len - len(quoted) + 1)
        print(f"    ({quoted},{padding}{lat:.5f}, {lon:.5f}),")
    print("]")

    # Save results to JSON
    with open("coordinates.json", "w") as f:
        json.dump({
            "landmarks": [{"name": n, "lat": la, "lon": lo, "source": s,
                           "score": sc, "osm_match": osm}
                          for n, la, lo, s, sc, osm in results],
            "not_found": not_found,
        }, f, indent=2)
    print("\nResults saved to coordinates.json")


if __name__ == "__main__":
    main()
