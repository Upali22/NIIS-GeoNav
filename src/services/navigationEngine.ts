import { NavNode, NavEdge, CalculatedRoute, RouteStep, TemporaryObstacle, RoomInfo } from '../types/index';
import { 
  NIIS_CAMPUS_ROUTES, 
  CANONICAL_CAMPUS_NODES, 
  CanonicalNodeId, 
  CampusRoute, 
  getRoute3DCoordinates, 
  gpsToCampus 
} from '../data/niisNavigationData';

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Resolves any buildingId, nodeId, or code to a canonical node ID
 */
export function resolveToCanonicalId(id: string): CanonicalNodeId | null {
  if (!id) return null;
  const norm = id.trim().toUpperCase().replace(/-/g, '_');
  
  if (norm === 'MAIN_GATE' || norm === 'GATE' || norm === 'GATE_01' || id === 'main-gate' || id === 'node-main-gate' || id === 'node-junc-main-road') return 'MAIN_GATE';
  if (norm === 'BLOCK_A' || norm === 'BLK_A' || id === 'block-a' || id.startsWith('node-block-a') || id === 'open-park') return 'BLOCK_A';
  if (norm === 'BLOCK_B' || norm === 'BLK_B' || id === 'block-b' || id.startsWith('node-block-b') || id === 'node-junc-south-wing') return 'BLOCK_B';
  if (norm === 'BLOCK_C' || norm === 'BLK_C' || id === 'block-c' || id.startsWith('node-block-c') || id === 'node-junc-central') return 'BLOCK_C';
  if (norm === 'BLOCK_D' || norm === 'BLK_D' || id === 'block-d' || id.startsWith('node-block-d') || id === 'node-junc-east') return 'BLOCK_D';
  if (norm === 'BLOCK_E' || norm === 'BLK_E' || id === 'block-e' || id.startsWith('node-block-e') || id === 'node-court-entry' || id === 'playground') return 'BLOCK_E';
  if (norm === 'SAI_TEMPLE' || norm === 'TEMPLE' || norm === 'TEMPLE_01' || id === 'sai-temple' || id.startsWith('node-temple') || id === 'parking') return 'SAI_TEMPLE';
  if (norm === 'HOSTEL_1' || norm === 'HOSTEL_1_ARNAPURNA' || norm === 'ARNAPURNA' || id === 'hostel-1' || id.startsWith('node-hostel-1') || id === 'common-washroom') return 'HOSTEL_1_ARNAPURNA';
  if (norm === 'HOSTEL_2' || norm === 'HOSTEL_2_SUBHADRA' || norm === 'SUBHADRA' || id === 'hostel-2' || id.startsWith('node-hostel-2') || id === 'nescafe') return 'HOSTEL_2_SUBHADRA';
  if (norm === 'HOSTEL_3' || norm === 'HOSTEL_3_JAGANNATH' || norm === 'JAGANNATH' || id === 'hostel-3' || id.startsWith('node-hostel-3') || id === 'hostel-4' || id === 'node-hostel-4-entry' || id === 'node-junc-north-hostels') return 'HOSTEL_3_JAGANNATH';
  if (norm === 'CAFETERIA' || norm === 'CAFE' || norm === 'CAFE_01' || id === 'cafeteria') return 'CAFETERIA';
  if (norm === 'NIIS_CANTEEN' || norm === 'CANTEEN' || norm === 'CANTEEN_01' || id === 'niis-canteen' || id === 'node-canteen-entry') return 'NIIS_CANTEEN';

  // Check matching by building name
  const foundNode = CANONICAL_CAMPUS_NODES.find(cn => 
    cn.id.toLowerCase() === id.toLowerCase() || 
    cn.buildingId.toLowerCase() === id.toLowerCase() ||
    cn.name.toLowerCase().includes(id.toLowerCase())
  );

  return foundNode ? foundNode.id : null;
}

/**
 * A* ROUTING ENGINE FOR NIIS CAMPUS
 * Runs A* heuristic pathfinding across the 13 verified GPX campus routes.
 * Combines multi-segment route geometries, sums accurate distances and walking times.
 */
export function calculateAStarRoute(
  fromCanonicalId: CanonicalNodeId,
  toCanonicalId: CanonicalNodeId,
  activeRoutes: CampusRoute[] = NIIS_CAMPUS_ROUTES,
  accessibleOnly: boolean = false,
  obstacles: TemporaryObstacle[] = [],
  routeType: 'fastest' | 'accessible' | 'quiet' = 'fastest'
): {
  pathNodes: CanonicalNodeId[];
  pathEdges: { route: CampusRoute; reversed: boolean }[];
  totalDistanceMeters: number;
  totalTimeSeconds: number;
  coordinates: [number, number, number][];
} | null {
  if (fromCanonicalId === toCanonicalId) {
    const node = CANONICAL_CAMPUS_NODES.find(n => n.id === fromCanonicalId);
    const coords = node ? [node.campus3D] : [[0, 0.45, 0]];
    return {
      pathNodes: [fromCanonicalId],
      pathEdges: [],
      totalDistanceMeters: 0,
      totalTimeSeconds: 0,
      coordinates: coords as [number, number, number][]
    };
  }

  // Obstacle identification
  const blockedIds = new Set<string>();
  obstacles.filter(o => o.active).forEach(o => {
    o.affectedEdgeIds?.forEach(id => blockedIds.add(id));
    o.affectedNodeIds?.forEach(id => blockedIds.add(id));
  });

  // Nodes map for heuristics
  const nodeMap = new Map<CanonicalNodeId, [number, number, number]>();
  CANONICAL_CAMPUS_NODES.forEach(n => nodeMap.set(n.id, n.campus3D));

  // Adjacency graph
  interface EdgeNeighbor {
    neighbor: CanonicalNodeId;
    route: CampusRoute;
    reversed: boolean;
    cost: number;
  }
  const adj = new Map<CanonicalNodeId, EdgeNeighbor[]>();
  CANONICAL_CAMPUS_NODES.forEach(n => adj.set(n.id, []));

  activeRoutes.forEach(r => {
    // Check if route is blocked
    if (r.blocked || blockedIds.has(r.id)) return;

    // Accessibility constraint (per Section 10: DO NOT assume unknown as accessible)
    if (accessibleOnly && (r.accessible === false || r.stairs)) return;

    let cost = r.distanceMeters;
    if (routeType === 'fastest') {
      // Prioritize walking time
      cost = r.recordedTimeSeconds;
    } else if (routeType === 'accessible') {
      if (r.stairs) cost += 1000;
      if (r.ramp) cost *= 0.85;
    }

    // Forward edge
    if (adj.has(r.from)) {
      adj.get(r.from)!.push({ neighbor: r.to, route: r, reversed: false, cost });
    }
    // Backward edge (bidirectional)
    if (r.bidirectional && adj.has(r.to)) {
      adj.get(r.to)!.push({ neighbor: r.from, route: r, reversed: true, cost });
    }
  });

  // Admissible heuristic: Euclidean distance in 3D / walking speed
  const heuristic = (current: CanonicalNodeId, target: CanonicalNodeId): number => {
    const cPos = nodeMap.get(current);
    const tPos = nodeMap.get(target);
    if (!cPos || !tPos) return 0;
    const dx = tPos[0] - cPos[0];
    const dz = tPos[2] - cPos[2];
    const dist = Math.sqrt(dx * dx + dz * dz) * 1.8;
    return routeType === 'fastest' ? dist / 1.3 : dist;
  };

  // A* search structures
  const openSet = new Set<CanonicalNodeId>([fromCanonicalId]);
  const cameFrom = new Map<CanonicalNodeId, { prev: CanonicalNodeId; route: CampusRoute; reversed: boolean }>();

  const gScore = new Map<CanonicalNodeId, number>();
  const fScore = new Map<CanonicalNodeId, number>();

  CANONICAL_CAMPUS_NODES.forEach(n => {
    gScore.set(n.id, Infinity);
    fScore.set(n.id, Infinity);
  });

  gScore.set(fromCanonicalId, 0);
  fScore.set(fromCanonicalId, heuristic(fromCanonicalId, toCanonicalId));

  while (openSet.size > 0) {
    // Find node in openSet with lowest fScore
    let current: CanonicalNodeId | null = null;
    let lowestF = Infinity;
    openSet.forEach(nodeId => {
      const f = fScore.get(nodeId)!;
      if (f < lowestF) {
        lowestF = f;
        current = nodeId;
      }
    });

    if (current === null) break;
    if (current === toCanonicalId) {
      // Goal reached! Reconstruct path
      const pathNodes: CanonicalNodeId[] = [toCanonicalId];
      const pathEdges: { route: CampusRoute; reversed: boolean }[] = [];

      let curr = toCanonicalId;
      while (cameFrom.has(curr)) {
        const step = cameFrom.get(curr)!;
        pathEdges.unshift({ route: step.route, reversed: step.reversed });
        pathNodes.unshift(step.prev);
        curr = step.prev;
      }

      // Sum exact recorded distance and walking times
      let totalDistanceMeters = 0;
      let totalTimeSeconds = 0;
      pathEdges.forEach(e => {
        totalDistanceMeters += e.route.distanceMeters;
        totalTimeSeconds += e.route.recordedTimeSeconds;
      });

      // Stitch 3D GPX coordinates smoothly
      const all3DCoords: [number, number, number][] = [];
      pathEdges.forEach((e, idx) => {
        const segCoords = getRoute3DCoordinates(e.route, e.reversed);
        if (idx === 0) {
          all3DCoords.push(...segCoords);
        } else {
          // Avoid duplicate connection point
          all3DCoords.push(...segCoords.slice(1));
        }
      });

      return {
        pathNodes,
        pathEdges,
        totalDistanceMeters: Math.round(totalDistanceMeters * 100) / 100,
        totalTimeSeconds,
        coordinates: all3DCoords
      };
    }

    openSet.delete(current);

    const neighbors = adj.get(current) || [];
    for (const edge of neighbors) {
      const tentativeG = gScore.get(current)! + edge.cost;
      if (tentativeG < gScore.get(edge.neighbor)!) {
        cameFrom.set(edge.neighbor, { prev: current, route: edge.route, reversed: edge.reversed });
        gScore.set(edge.neighbor, tentativeG);
        fScore.set(edge.neighbor, tentativeG + heuristic(edge.neighbor, toCanonicalId));
        openSet.add(edge.neighbor);
      }
    }
  }

  return null; // No path found
}

/**
 * Main Routing Entry Point
 * Seamlessly integrates the 13 GPX routes via A* pathfinding.
 */
export function calculateRoute(
  fromNodeId: string,
  toNodeId: string,
  nodes: NavNode[],
  edges: NavEdge[],
  accessibleOnly: boolean = false,
  obstacles: TemporaryObstacle[] = [],
  routeType: 'fastest' | 'accessible' | 'quiet' = 'fastest',
  targetRoom?: RoomInfo
): CalculatedRoute | null {
  // 1. Try resolving to canonical node network for verified GPX routing
  const canonicalFrom = resolveToCanonicalId(fromNodeId);
  const canonicalTo = resolveToCanonicalId(toNodeId);

  if (canonicalFrom && canonicalTo) {
    const aStarResult = calculateAStarRoute(canonicalFrom, canonicalTo, NIIS_CAMPUS_ROUTES, accessibleOnly, obstacles, routeType);

    if (aStarResult) {
      const fromNodeObj = CANONICAL_CAMPUS_NODES.find(n => n.id === canonicalFrom)!;
      const toNodeObj = CANONICAL_CAMPUS_NODES.find(n => n.id === canonicalTo)!;

      const pathNavNodes: NavNode[] = aStarResult.pathNodes.map(id => {
        const cn = CANONICAL_CAMPUS_NODES.find(c => c.id === id)!;
        return {
          id: cn.id,
          name: cn.name,
          x: cn.campus3D[0],
          z: cn.campus3D[2],
          y: cn.campus3D[1],
          buildingId: cn.buildingId,
          type: cn.category === 'gate' ? 'gate' : 'building_entrance',
          accessible: cn.accessible
        };
      });

      // Build turn-by-turn guidance steps
      const steps: RouteStep[] = [];
      const coords = aStarResult.coordinates;

      if (aStarResult.pathNodes.length === 1) {
        steps.push({
          instruction: `You are already at ${toNodeObj.name}.`,
          distance: 0,
          action: 'arrive',
          nodeId: toNodeObj.id,
          coordinates: toNodeObj.campus3D
        });
      } else {
        steps.push({
          instruction: `Start from ${fromNodeObj.name} and follow the verified GPX campus pathway.`,
          distance: Math.round(aStarResult.pathEdges[0]?.route.distanceMeters || 30),
          action: 'straight',
          nodeId: fromNodeObj.id,
          coordinates: coords[0] || fromNodeObj.campus3D
        });

        for (let i = 0; i < aStarResult.pathEdges.length; i++) {
          const edgeInfo = aStarResult.pathEdges[i];
          const nextNodeId = aStarResult.pathNodes[i + 1];
          const nextNode = CANONICAL_CAMPUS_NODES.find(n => n.id === nextNodeId);
          const isFinal = i === aStarResult.pathEdges.length - 1;

          if (!isFinal && nextNode) {
            steps.push({
              instruction: `Continue past ${nextNode.shortName} (${edgeInfo.route.distanceMeters} m, ~${edgeInfo.route.recordedTimeSeconds}s).`,
              distance: Math.round(edgeInfo.route.distanceMeters),
              action: 'straight',
              nodeId: nextNode.id,
              coordinates: nextNode.campus3D
            });
          }
        }

        let finalInstruction = `Arrive at ${toNodeObj.name}.`;
        let floorNotice: string | undefined = undefined;

        if (targetRoom && targetRoom.floor > 1) {
          const trans = targetRoom.transitionType === 'elevator' ? 'elevator' : targetRoom.transitionType === 'ramp' ? 'accessible ramp' : 'stairs';
          floorNotice = `Proceed to Floor ${targetRoom.floor} via ${trans}.`;
          finalInstruction = `Arrived at ${toNodeObj.name}. Proceed to Floor ${targetRoom.floor} via ${trans}. ${targetRoom.name} (${targetRoom.roomNumber}) is on your right.`;
        }

        steps.push({
          instruction: finalInstruction,
          distance: 0,
          action: 'arrive',
          nodeId: toNodeObj.id,
          coordinates: coords[coords.length - 1] || toNodeObj.campus3D,
          floorNotice
        });
      }

      const totalDist = aStarResult.totalDistanceMeters;
      const totalSeconds = aStarResult.totalTimeSeconds;
      const estimatedMinutes = Math.max(1, Math.round(totalSeconds / 60));

      return {
        id: `route-gpx-${routeType}-${Date.now()}`,
        type: routeType,
        title: routeType === 'fastest' ? 'Fastest GPX Route' : routeType === 'accessible' ? 'Step-Free Route' : 'Quiet Scenic Path',
        path: pathNavNodes,
        coordinates: aStarResult.coordinates,
        totalDistance: totalDist,
        estimatedMinutes,
        steps,
        fromNode: pathNavNodes[0],
        toNode: pathNavNodes[pathNavNodes.length - 1],
        hasObstaclesBypassed: obstacles.some(o => o.active)
      };
    }
  }

  // 2. Fallback to existing Dijkstra engine for non-canonical or internal room nodes
  const nodeMap = new Map<string, NavNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const startNode = nodeMap.get(fromNodeId) || nodes[0];
  const targetNode = nodeMap.get(toNodeId) || nodes[nodes.length - 1];

  if (!startNode || !targetNode) return null;

  if (fromNodeId === toNodeId) {
    return {
      type: routeType,
      title: 'Direct Arrival',
      path: [startNode],
      coordinates: [[startNode.x, startNode.y || 0.45, startNode.z]],
      totalDistance: 0,
      estimatedMinutes: 0,
      steps: [{
        instruction: `You are already at ${targetNode.name}.`,
        distance: 0,
        action: 'arrive',
        nodeId: targetNode.id,
        coordinates: [targetNode.x, targetNode.y || 0.45, targetNode.z]
      }],
      fromNode: startNode,
      toNode: targetNode
    };
  }

  // Build adjacency list
  const adj = new Map<string, { to: string; distance: number; accessible: boolean; edgeId: string; weight: number }[]>();
  nodes.forEach(n => adj.set(n.id, []));

  edges.forEach(e => {
    let weight = e.distance;
    if (routeType === 'accessible') {
      if (e.stairs) weight += 500;
      if (e.ramp) weight *= 0.9;
    }
    if (adj.has(e.from) && adj.has(e.to)) {
      adj.get(e.from)!.push({ to: e.to, distance: e.distance, accessible: e.accessible, edgeId: e.id, weight });
      adj.get(e.to)!.push({ to: e.from, distance: e.distance, accessible: e.accessible, edgeId: e.id, weight });
    }
  });

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();

  nodes.forEach(n => {
    distances.set(n.id, Infinity);
    previous.set(n.id, null);
    unvisited.add(n.id);
  });
  distances.set(fromNodeId, 0);

  while (unvisited.size > 0) {
    let closestNodeId: string | null = null;
    let minDistance = Infinity;

    unvisited.forEach(nodeId => {
      const dist = distances.get(nodeId)!;
      if (dist < minDistance) {
        minDistance = dist;
        closestNodeId = nodeId;
      }
    });

    if (closestNodeId === null || minDistance === Infinity) break;
    if (closestNodeId === toNodeId) break;

    unvisited.delete(closestNodeId);

    const neighbors = adj.get(closestNodeId) || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.to)) continue;
      const alt = minDistance + neighbor.weight;
      if (alt < distances.get(neighbor.to)!) {
        distances.set(neighbor.to, alt);
        previous.set(neighbor.to, closestNodeId);
      }
    }
  }

  const path: NavNode[] = [];
  let curr: string | null = toNodeId;
  while (curr !== null) {
    const node = nodeMap.get(curr);
    if (!node) break;
    path.unshift(node);
    curr = previous.get(curr) || null;
  }

  if (path.length === 0 || path[0].id !== fromNodeId) {
    return null;
  }

  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += getDistanceBetween(path[i], path[i + 1]);
  }
  totalDistance = Math.max(20, Math.round(totalDistance));
  const estimatedMinutes = Math.max(1, Math.round(totalDistance / 68));

  const coordinates: [number, number, number][] = path.map(n => [n.x, (n.y || 0) + 0.45, n.z]);

  const steps: RouteStep[] = [
    {
      instruction: `Start from ${path[0].name} and head along the path.`,
      distance: Math.round(totalDistance / Math.max(1, path.length - 1)),
      action: 'straight',
      nodeId: path[0].id,
      coordinates: coordinates[0]
    },
    {
      instruction: `Arrive at ${targetNode.name}.`,
      distance: 0,
      action: 'arrive',
      nodeId: targetNode.id,
      coordinates: coordinates[coordinates.length - 1]
    }
  ];

  return {
    id: `route-fallback-${routeType}-${Date.now()}`,
    type: routeType,
    title: routeType === 'fastest' ? 'Fastest Route' : 'Campus Route',
    path,
    coordinates,
    totalDistance,
    estimatedMinutes,
    steps,
    fromNode: startNode,
    toNode: targetNode
  };
}

export function calculateRouteOptions(
  fromNodeId: string,
  toNodeId: string,
  nodes: NavNode[],
  edges: NavEdge[],
  obstacles: TemporaryObstacle[] = [],
  targetRoom?: RoomInfo
): CalculatedRoute[] {
  const routes: CalculatedRoute[] = [];

  const fastest = calculateRoute(fromNodeId, toNodeId, nodes, edges, false, obstacles, 'fastest', targetRoom);
  if (fastest) {
    fastest.title = 'Fastest';
    routes.push(fastest);
  }

  const accessible = calculateRoute(fromNodeId, toNodeId, nodes, edges, true, obstacles, 'accessible', targetRoom);
  if (accessible) {
    accessible.title = 'Accessible (Step-Free)';
    if (accessible.totalDistance !== fastest?.totalDistance || accessible.path.length !== fastest?.path.length) {
      routes.push(accessible);
    }
  }

  const quiet = calculateRoute(fromNodeId, toNodeId, nodes, edges, false, obstacles, 'quiet', targetRoom);
  if (quiet && routes.every(r => r.type !== 'quiet')) {
    quiet.title = 'Quiet & Scenic';
    routes.push(quiet);
  }

  return routes.length > 0 ? routes : (fastest ? [fastest] : []);
}

export function getRouteExplanation(route: CalculatedRoute): string[] {
  if (!route || !route.path || route.path.length === 0) return [];
  const parts: string[] = [];

  parts.push(route.fromNode.name);

  for (let i = 1; i < route.path.length - 1; i++) {
    const node = route.path[i];
    parts.push(`Pass ${node.name}`);
  }

  parts.push(route.toNode.name);
  return parts;
}

export function findNearestFacilitiesByGraph(
  fromNodeId: string,
  targetBuildingIds: string[],
  nodes: NavNode[],
  edges: NavEdge[],
  obstacles: TemporaryObstacle[] = []
): { buildingId: string; distance: number; estimatedMinutes: number; route: CalculatedRoute }[] {
  const results: { buildingId: string; distance: number; estimatedMinutes: number; route: CalculatedRoute }[] = [];

  for (const bId of targetBuildingIds) {
    const canonicalTarget = resolveToCanonicalId(bId);
    const targetNodeId = canonicalTarget || bId;

    const route = calculateRoute(fromNodeId, targetNodeId, nodes, edges, false, obstacles, 'fastest');
    if (route) {
      results.push({
        buildingId: bId,
        distance: route.totalDistance,
        estimatedMinutes: route.estimatedMinutes,
        route
      });
    }
  }

  results.sort((a, b) => a.distance - b.distance);
  return results;
}

/**
 * Checks if a live GPS / user position is off the active route geometry
 * Threshold default: 25 meters
 */
export function checkIsOffRoute(
  userPos: [number, number, number],
  routeCoords: [number, number, number][],
  thresholdCampusUnits: number = 12 // ~25 meters in campus world units
): boolean {
  if (!routeCoords || routeCoords.length < 2) return false;

  let minDistanceSq = Infinity;
  const [ux, , uz] = userPos;

  for (let i = 0; i < routeCoords.length - 1; i++) {
    const p1 = routeCoords[i];
    const p2 = routeCoords[i + 1];

    const distSq = distanceSqToSegment(ux, uz, p1[0], p1[2], p2[0], p2[2]);
    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
    }
  }

  return Math.sqrt(minDistanceSq) > thresholdCampusUnits;
}

function distanceSqToSegment(px: number, pz: number, x1: number, z1: number, x2: number, z2: number): number {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const l2 = dx * dx + dz * dz;
  if (l2 === 0) {
    const rx = px - x1;
    const rz = pz - z1;
    return rx * rx + rz * rz;
  }
  let t = ((px - x1) * dx + (pz - z1) * dz) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projZ = z1 + t * dz;
  const distx = px - projX;
  const distz = pz - projZ;
  return distx * distx + distz * distz;
}

function getDistanceBetween(a: NavNode, b: NavNode): number {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  return Math.round(Math.sqrt(dx * dx + dz * dz) * 2.2);
}

export function findNearestNode(x: number, z: number, nodes: NavNode[]): NavNode | null {
  if (nodes.length === 0) return null;
  let nearest = nodes[0];
  let minD = Infinity;

  nodes.forEach(n => {
    const d = (n.x - x) * (n.x - x) + (n.z - z) * (n.z - z);
    if (d < minD) {
      minD = d;
      nearest = n;
    }
  });

  return nearest;
}
