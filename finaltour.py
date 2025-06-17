from sys import maxsize
from datetime import datetime

def travelling_salesman_function(graph, s):
    n = len(graph) #Number of nodes
    dp = [[-1] * (1 << n) for _ in range(n)]  # DP table to store minimum cost for memoization
    parent = [[-1] * (1 << n) for _ in range(n)]  # Table to store parent information on how to reconstruct the optimal path
    mask = (1 << n) - 1 #Bitmask representing all nodes as unvisited
    def tsp(curr, mask):
        # Base case: If all nodes have been visited
        if mask == 0:
            return graph[curr][s]  # Base case: return cost to return back to start

        # If the minimum cost for the current node and mask has already been computed, return it
        if dp[curr][mask] != -1:
            return dp[curr][mask]

        min_cost = maxsize # Initialize minimum cost
        next_node = -1 # Initialize next node to visit

        # Explore all possible next nodes from the current node
        for i in range(n):
            if mask & (1 << i): # Check if node i has not been visited yet
                # Calculate the cost of visiting node i and continuing the path recursively
                cost = graph[curr][i] + tsp(i, mask ^ (1 << i))
                # Update minimum cost and next node if this path is better
                if cost < min_cost:
                    min_cost = cost
                    next_node = i
        # Memoize the minimum cost and the next node for this subproblem
        dp[curr][mask] = min_cost
        parent[curr][mask] = next_node
        return min_cost
    
    # Call the tsp function with the starting node and the initial bitmask representing all nodes as unvisited    
    min_path_cost = tsp(s, mask)

    # Reconstruct the optimal path starting from the starting node
    path = [s] # Initialize path with the starting node
    curr = s # Current node
    mask = mask ^ (1 << s) # Mark the starting node as visited in the bitmask
    while mask != 0:
        next_node = parent[curr][mask] # Get the next node from the parent table
        path.append(next_node)  # Add next node to the path
        mask = mask ^ (1 << next_node) # Mark the next node as visited in the bitmask
        curr = next_node # Move to the next node

    path.append(s)  # Add start node to complete the cycle

    return min_path_cost, path

graph = [
    [0, 78.3064282, 220.74274, 561.7905161, 335.919463, 642.766949, 820.6515631, 1186.548342, 1405.918252, 863.6468833, 1617.572491, 1871.348556, 494.586495, 538.0439039],
    [78.3064282, 0, 232.7142705, 492.3496508, 266.4785977, 573.3260837, 751.2106978, 1117.107476, 1336.477387, 794.2060181, 1548.131625, 1893.466893, 425.1456297, 468.6030387],
    [220.74274, 232.7142705, 0, 412.0395193, 319.9499586, 646.7432525, 824.6278666, 1190.524645, 1409.894555, 867.6231868, 1619.921116, 2077.446184, 498.5627985, 540.3925295], 
    [561.7905161, 492.3496508, 412.0395193, 0, 290.3817052, 510.1033978, 687.9880119, 1053.88479, 1273.254701, 730.9833321, 1311.381724, 2205.034932, 361.9229438, 403.7526748], 
    [335.919463, 266.4785977, 319.9499586, 290.3817052, 0, 338.2950312, 516.1796453, 882.0764238, 1101.446334, 559.1749655, 1313.100573, 1950.596429, 190.1145772, 233.5719861], 
    [642.766949, 573.3260837, 646.7432525, 510.1033978, 338.2950312, 0, 339.2610519, 546.2558978, 765.6258079, 223.3544395, 1180.470214, 2041.695103, 148.1805154, 185.8806753], 
    [820.6515631, 751.2106978, 824.6278666, 687.9880119, 516.1796453, 339.2610519, 0, 368.8848156, 669.5527116, 415.1539143, 1365.716385, 1716.119906, 326.0651295, 366.4008991], 
    [1186.548342, 1117.107476, 1190.524645, 1053.88479, 882.0764238, 546.2558978, 368.8848156, 0, 358.2951462, 603.5894466, 1554.151917, 1629.432239, 691.961908, 713.0721578], 
    [1405.918252, 1336.477387, 1409.894555, 1273.254701, 1101.446334, 765.6258079, 669.5527116, 358.2951462, 0, 820.3427739, 1770.905245, 1920.272036, 911.3318182, 932.442068], 
    [863.6468833, 794.2060181, 867.6231868, 730.9833321, 559.1749655, 223.3544395, 415.1539143, 603.5894466, 820.3427739, 0, 958.5636832, 2117.587965, 369.0604497, 385.3902744], 
    [1617.572491, 1548.131625, 1619.921116, 1311.381724, 1313.100573, 1180.470214, 1365.716385, 1554.151917, 1770.905245, 958.5636832, 0, 3068.150436, 1158.234646, 1089.718387], 
    [1871.348556, 1893.466893, 2077.446184, 2205.034932, 1950.596429, 2041.695103, 1716.119906, 1629.432239, 1920.272036, 2117.587965, 3068.150436, 0, 1963.553071, 2016.795084], 
    [494.586495, 425.1456297, 498.5627985, 361.9229438, 190.1145772, 148.1805154, 326.0651295, 691.961908, 911.3318182, 369.0604497, 1158.234646, 1963.553071, 0, 106.7137443], 
    [538.0439039, 468.6030387, 540.3925295, 403.7526748, 233.5719861, 185.8806753, 366.4008991, 713.0721578, 932.442068, 385.3902744, 1089.718387, 2016.795084, 106.7137443, 0]]

locations = {
    '0': 'Up gate', '1': 'Carabao Park', '2': 'Raymundo Gate', '3': 'University Library', '4': 'Oblation Park',
    '5': 'Mariang Banga', '6': 'DL Umali Hall', '7': 'Freedom Park', '8': 'Baker Hall', '9': 'Carillon Tower',
    '10': 'Copeland', '11': 'Searca', '12': 'Botanical Garden', '13': 'IRRI'
}

while True:
    try:
        start_point = int(input("Enter the starting point (from 0 to 13): "))
        if 0 <= start_point <= 13:
            break
        else:
            print("Invalid starting point. Please enter a number between 0 and 13.")
    except ValueError:
        print("Invalid input. Please enter a valid integer.")

start_time = datetime.now()
res, path = travelling_salesman_function(graph, start_point)

# Adding 1 to each vertex in the final path

print(f"Minimum cost: {res}")
print(f"Path taken: {path}")

path_locations = [locations[str(node)] for node in path]
print(f"Optimal Path taken: {' -> '.join(path_locations)}")


def compute_distance(path, graph):
    distance = 0
    for i in range(len(path) - 1):
        from_node = path[i]
        to_node = path[i + 1]
        distance += graph[from_node][to_node]
    return distance

distance = compute_distance(path, graph)
print(f"Total distance of the path: {distance} meters")
print(f"Total time taken: {datetime.now()-start_time}")