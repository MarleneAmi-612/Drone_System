/**
 * A* Pathfinding Algorithm
 * Finds the shortest path between two points on a grid
 */

export type Point = { x: number; y: number };

interface GridNode {
  point: Point;
  g: number; // cost from start
  h: number; // heuristic (estimated cost to goal)
  f: number; // g + h
  parent: Point | null;
}

/**
 * Euclidean heuristic for grid pathfinding
 */
function heuristic(from: Point, to: Point): number {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  return Math.hypot(dx, dy);
}

/**
 * Get neighbors of a point on the grid (4-directional: up, down, left, right)
 */
function getNeighbors(point: Point, grid: number[][], diagonals: boolean = false): Point[] {
  const neighbors: Point[] = [];
  const height = grid.length;
  const width = grid[0]?.length || 0;

  // 4-directional neighbors
  const directions = diagonals
    ? [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]
    : [[0, 1], [1, 0], [0, -1], [-1, 0]];

  for (const [dx, dy] of directions) {
    const nx = point.x + dx;
    const ny = point.y + dy;

    // Check bounds
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      // Check if walkable (0 = walkable, 1 = obstacle)
      if (grid[ny][nx] === 0) {
        neighbors.push({ x: nx, y: ny });
      }
    }
  }

  return neighbors;
}

/**
 * A* Pathfinding Algorithm
 * @param start - Starting point
 * @param goal - Goal point
 * @param grid - 2D grid where 0=walkable, 1=obstacle
 * @param diagonals - Allow diagonal movement
 * @returns Array of points representing the path, or empty array if no path found
 */
export function findPathAStar(start: Point, goal: Point, grid: number[][], diagonals: boolean = false): Point[] {
  const openSet = new Map<string, GridNode>();
  const closedSet = new Set<string>();
  const nodeMap = new Map<string, GridNode>();

  const key = (p: Point) => `${p.x},${p.y}`;
  const startKey = key(start);
  const goalKey = key(goal);

  // Initialize start node
  const startNode: GridNode = {
    point: start,
    g: 0,
    h: heuristic(start, goal),
    f: heuristic(start, goal),
    parent: null,
  };

  openSet.set(startKey, startNode);
  nodeMap.set(startKey, startNode);

  while (openSet.size > 0) {
    // Find node with lowest f score in openSet
    let currentKey: string | null = null;
    let currentNode: GridNode | null = null;
    let lowestF = Infinity;

    for (const [k, node] of openSet) {
      if (node.f < lowestF) {
        lowestF = node.f;
        currentKey = k;
        currentNode = node;
      }
    }

    if (!currentKey || !currentNode) break;

    // Check if goal reached
    if (currentKey === goalKey) {
      // Reconstruct path
      const path: Point[] = [];
      let current: Point | null = currentNode.point;
      while (current) {
        path.push(current);
        const currentNodeData = nodeMap.get(key(current));
        current = currentNodeData?.parent ?? null;
      }
      return path.reverse();
    }

    openSet.delete(currentKey);
    closedSet.add(currentKey);

    // Check neighbors
    const neighbors = getNeighbors(currentNode.point, grid, diagonals);
    for (const neighbor of neighbors) {
      const neighborKey = key(neighbor);

      if (closedSet.has(neighborKey)) continue;

      const tentativeG = currentNode.g + heuristic(currentNode.point, neighbor);

      let neighborNode = nodeMap.get(neighborKey);
      if (!neighborNode) {
        neighborNode = {
          point: neighbor,
          g: Infinity,
          h: heuristic(neighbor, goal),
          f: Infinity,
          parent: null,
        };
        nodeMap.set(neighborKey, neighborNode);
      }

      if (tentativeG < neighborNode.g) {
        neighborNode.g = tentativeG;
        neighborNode.h = heuristic(neighbor, goal);
        neighborNode.f = neighborNode.g + neighborNode.h;
        neighborNode.parent = currentNode.point;

        if (!openSet.has(neighborKey)) {
          openSet.set(neighborKey, neighborNode);
        }
      }
    }
  }

  // No path found
  return [];
}

/**
 * Create a grid from simulation coordinates with obstacles
 * @param width - Grid width
 * @param height - Grid height
 * @param obstacles - Array of obstacle points
 * @returns 2D grid where 0=walkable, 1=obstacle
 */
export function createGrid(width: number, height: number, obstacles: Point[] = []): number[][] {
  const grid: number[][] = Array.from({ length: height }, () => Array(width).fill(0));

  // Mark obstacles
  for (const obs of obstacles) {
    if (obs.x >= 0 && obs.x < width && obs.y >= 0 && obs.y < height) {
      grid[Math.floor(obs.y)][Math.floor(obs.x)] = 1;
    }
  }

  return grid;
}

/**
 * Simplify a path by removing unnecessary waypoints (line-of-sight optimization)
 * @param path - Original path from A*
 * @param grid - Grid for obstacle checking
 * @returns Simplified path
 */
export function simplifyPath(path: Point[], grid: number[][]): Point[] {
  if (path.length <= 2) return path;

  const simplified: Point[] = [path[0]];
  let current = 0;

  while (current < path.length - 1) {
    let furthest = current + 1;

    // Find furthest point we can reach without hitting obstacles
    for (let i = current + 2; i < path.length; i++) {
      if (canStraightLine(path[current], path[i], grid)) {
        furthest = i;
      }
    }

    simplified.push(path[furthest]);
    current = furthest;
  }

  return simplified;
}

/**
 * Check if there's a straight line of sight between two points
 */
function canStraightLine(from: Point, to: Point, grid: number[][]): boolean {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  const sx = from.x < to.x ? 1 : -1;
  const sy = from.y < to.y ? 1 : -1;

  let err = dx - dy;
  let x = from.x;
  let y = from.y;

  while (true) {
    if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) {
      return false;
    }
    if (grid[Math.floor(y)][Math.floor(x)] === 1) {
      return false;
    }

    if (x === to.x && y === to.y) return true;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}
