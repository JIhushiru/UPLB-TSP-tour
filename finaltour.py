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