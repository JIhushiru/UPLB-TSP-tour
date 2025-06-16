# UPLB-TSP-tour

## Project Overview
```This project solves the Travelling Salesman Problem (TSP) using dynamic programming and bitmasking, applied to a custom graph of UPLB campus landmarks.```

## Features
* Allows the user to select a starting point (0–13).
* Computes the shortest route that visits all 14 locations exactly once and returns to the start.
* Displays:
  - The minimum total travel cost.
  - The route taken in both node form and location names.
* Calculates computation time.

## Data Collection & Preparation

1. Data Source
   - All distance data was gathered using OpenStreetMap (OSM) as the base map.
2. Steps to Generate the Distance Matrix:
   - Download or access the OSM layer in QGIS using the QuickOSM plugin or a similar network-enabled layer.
3. Use network analysis tools in QGIS (ORS Tools) to compute shortest paths (distances) between each pair of campus landmarks.
4. Export the results to Excel in a 2D matrix form (CSV).
5. Clean the matrix in Excel (ensuring the matrix is symmetric).
6. Manually copy-paste the matrix from Excel into the Python code as a nested list (i.e., graph = [[...], [...], ...]).

## Algorithm

- Dynamic Programming with Bitmasking for optimal TSP path computation
- Memoization for improved performance
- Path reconstruction from the DP parent table

## How to Run
1. Run the Python script.
```bash
python tsp_solver.py
```
2. Input a starting point between 0 and 13 when prompted.
3. View the output:
   - Minimum cost
   - Ordered path (by index and name)
   - Time taken to compute the solution
  
## Campus Landmarks

The nodes correspond to the following places on UPLB campus:
| Index  | Landmark |
| ------------- | ------------- |
| 0  | Up Gate  |
| 1  | Carabao Park  |
| 2 | Raymundo Gate  |
| 3 | University Library  |
| 4  | Oblation Park  |
| 5 | Mariang Banga  |
| 6  | DL Umali Hall  |
| 7 | Freedom Park  |
| 8  | Baker Hall  |
| 9  | Carillon Tower  |
| 10  | Copeland  |
| 11  | Searca  |
| 12  | Botanical Garden  |
| 13  | IRRI  |


## Author
Created by <b>Jer Heseoh R. Arsolon</b> <br/>
University of the Philippines Los Baños <br/>
Bachelor of Science in Applied Mathematics <br/>
