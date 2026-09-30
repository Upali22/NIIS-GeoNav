/**
 * NIIS GEONAV - REAL GPX CAMPUS NAVIGATION DATA
 * Source of truth for recorded walking tracks, distances, times, and GPS geometries.
 * All coordinates are in [longitude, latitude] format.
 */

import { NavNode, NavEdge } from '../types/index';

export type CanonicalNodeId = 
  | 'MAIN_GATE'
  | 'BLOCK_A'
  | 'BLOCK_B'
  | 'BLOCK_C'
  | 'BLOCK_D'
  | 'BLOCK_E'
  | 'SAI_TEMPLE'
  | 'HOSTEL_1_ARNAPURNA'
  | 'HOSTEL_2_SUBHADRA'
  | 'HOSTEL_3_JAGANNATH'
  | 'CAFETERIA'
  | 'NIIS_CANTEEN';

export interface CampusRoute {
  id: string;
  name?: string;
  from: CanonicalNodeId;
  to: CanonicalNodeId;
  distanceMeters: number;
  distanceM?: number;
  recordedTimeSeconds: number;
  timeS?: number;
  bidirectional: boolean;
  geometry: [number, number][]; // [longitude, latitude]
  gpx?: [number, number][];
  accessible?: boolean;
  stairs?: boolean;
  ramp?: boolean;
  surface?: string;
  widthMeters?: number;
  slopePercent?: number;
  blocked?: boolean;
}

export interface CanonicalLocationNode {
  id: CanonicalNodeId;
  name: string;
  shortName: string;
  category: 'gate' | 'academic' | 'religious' | 'hostel' | 'dining';
  buildingId: string;
  gps: [number, number]; // [longitude, latitude]
  campus3D: [number, number, number]; // [x, y, z] in Three.js coordinates
  accessible: boolean;
  description: string;
}

/**
 * 12 Canonical Navigation Nodes
 * Exact campus 3D anchors mapped to the recorded GPX terminal positions.
 */
export const CANONICAL_CAMPUS_NODES: CanonicalLocationNode[] = [
  {
    id: 'MAIN_GATE',
    name: 'Main Gate',
    shortName: 'Gate',
    category: 'gate',
    buildingId: 'main-gate',
    gps: [85.72423, 20.24058],
    campus3D: [-42, 0.45, 18],
    accessible: true,
    description: 'Main campus gateway on Badaraghunathpur Road with security desk.'
  },
  {
    id: 'BLOCK_A',
    name: 'Block A (Main Admin & Computer Labs)',
    shortName: 'Block A',
    category: 'academic',
    buildingId: 'block-a',
    gps: [85.7250923, 20.2404084],
    campus3D: [-6, 0.45, 8],
    accessible: true,
    description: 'Flagship academic headquarters, Director Office, MCA & Labs.'
  },
  {
    id: 'BLOCK_B',
    name: 'Block B (Academic Wing & Classrooms)',
    shortName: 'Block B',
    category: 'academic',
    buildingId: 'block-b',
    gps: [85.7252571, 20.2401036],
    campus3D: [-1, 0.45, 24],
    accessible: true,
    description: 'Undergraduate computing, BCA lecture rooms and IT departments.'
  },
  {
    id: 'SAI_TEMPLE',
    name: 'Sai Temple of NIIS',
    shortName: 'Sai Temple',
    category: 'religious',
    buildingId: 'sai-temple',
    gps: [85.7247857, 20.2407054],
    campus3D: [-20, 0.45, -14],
    accessible: true,
    description: 'Peaceful campus Shirdi Sai Baba mandir and meditation courtyard.'
  },
  {
    id: 'HOSTEL_1_ARNAPURNA',
    name: 'Hostel 1 — Arnapurna',
    shortName: 'Hostel 1',
    category: 'hostel',
    buildingId: 'hostel-1',
    gps: [85.7255448, 20.2400899],
    campus3D: [21, 0.45, 26],
    accessible: true,
    description: 'Arnapurna residential hall for female students.'
  },
  {
    id: 'HOSTEL_2_SUBHADRA',
    name: 'Hostel 2 — Subhadra',
    shortName: 'Hostel 2',
    category: 'hostel',
    buildingId: 'hostel-2',
    gps: [85.72568, 20.24010],
    campus3D: [37, 0.45, 25],
    accessible: true,
    description: 'Subhadra residential hall and central junction point to upper campus.'
  },
  {
    id: 'BLOCK_C',
    name: 'Block C (Computer Science & Library)',
    shortName: 'Block C',
    category: 'academic',
    buildingId: 'block-c',
    gps: [85.7261727, 20.2403214],
    campus3D: [46, 0.45, 4],
    accessible: true,
    description: 'Central Digital Library, AI Research Lab, and CSE department.'
  },
  {
    id: 'BLOCK_D',
    name: 'Block D (Management & Science)',
    shortName: 'Block D',
    category: 'academic',
    buildingId: 'block-d',
    gps: [85.7263841, 20.240549],
    campus3D: [68, 0.45, -5],
    accessible: true,
    description: 'Management Studies, Commerce, Biotechnology, and Conference halls.'
  },
  {
    id: 'BLOCK_E',
    name: 'Block E (Seminar & Auditorium Complex)',
    shortName: 'Block E',
    category: 'academic',
    buildingId: 'block-e',
    gps: [85.7263547, 20.2402602],
    campus3D: [76, 0.45, 16],
    accessible: true,
    description: 'Grand cultural auditorium, placement cell, and VIP conference hall.'
  },
  {
    id: 'HOSTEL_3_JAGANNATH',
    name: 'Hostel 3 — Jagannath',
    shortName: 'Hostel 3',
    category: 'hostel',
    buildingId: 'hostel-3',
    gps: [85.7262411, 20.2407431],
    campus3D: [26, 0.45, -20],
    accessible: true,
    description: 'Jagannath residential hall for senior students.'
  },
  {
    id: 'CAFETERIA',
    name: 'Cafeteria',
    shortName: 'Cafeteria',
    category: 'dining',
    buildingId: 'cafeteria',
    gps: [85.7267582, 20.2403643],
    campus3D: [78, 0.45, 4],
    accessible: true,
    description: 'Campus cafeteria serving refreshments, tea, coffee, and meals.'
  },
  {
    id: 'NIIS_CANTEEN',
    name: 'NIIS Canteen',
    shortName: 'Canteen',
    category: 'dining',
    buildingId: 'niis-canteen',
    gps: [85.7263125, 20.2401359],
    campus3D: [61, 0.45, 20],
    accessible: true,
    description: 'Primary institutional student and faculty dining mess.'
  }
];

/**
 * THE 13 REAL GPX RECORDED CAMPUS ROUTES
 * Preserving exact recorded GPS points, distances, and walking times.
 */
export const NIIS_CAMPUS_ROUTES: CampusRoute[] = [
  {
    id: 'ROUTE_001',
    name: 'Main Gate to Block A',
    from: 'MAIN_GATE',
    to: 'BLOCK_A',
    distanceMeters: 96.27,
    recordedTimeSeconds: 78,
    bidirectional: true,
    geometry: [
      [85.7242392, 20.2405842],
      [85.724237, 20.2405812],
      [85.7242843, 20.2405731],
      [85.7243494, 20.2405604],
      [85.7244109, 20.2405479],
      [85.7244649, 20.2405381],
      [85.724529, 20.2405313],
      [85.7245898, 20.2405186],
      [85.7246565, 20.2405087],
      [85.7247275, 20.2405069],
      [85.7248033, 20.2405079],
      [85.7248793, 20.2405038],
      [85.7249509, 20.2405001],
      [85.7250289, 20.2404951],
      [85.7250724, 20.240469],
      [85.7250923, 20.2404084]
    ]
  },
  {
    id: 'ROUTE_002',
    name: 'Main Gate to Block B',
    from: 'MAIN_GATE',
    to: 'BLOCK_B',
    distanceMeters: 146.37,
    recordedTimeSeconds: 124,
    bidirectional: true,
    geometry: [
      [85.7242235, 20.2405686],
      [85.7242381, 20.240574],
      [85.7242832, 20.2405624],
      [85.7243442, 20.240551],
      [85.7244093, 20.2405441],
      [85.7244816, 20.2405385],
      [85.7245486, 20.2405415],
      [85.7246055, 20.2405343],
      [85.7246604, 20.2405251],
      [85.7247176, 20.2405213],
      [85.7247876, 20.2405168],
      [85.7248578, 20.2405077],
      [85.7249355, 20.2404944],
      [85.7250041, 20.2404859],
      [85.7250681, 20.240486],
      [85.7250796, 20.2404476],
      [85.7250881, 20.2403963],
      [85.7250975, 20.2403202],
      [85.7250991, 20.240258],
      [85.7250734, 20.2402004],
      [85.7250898, 20.2401684],
      [85.7251372, 20.2401478],
      [85.7251971, 20.2401351],
      [85.7252561, 20.2401281],
      [85.7252571, 20.2401036]
    ]
  },
  {
    id: 'ROUTE_003',
    name: 'Main Gate to Sai Temple',
    from: 'MAIN_GATE',
    to: 'SAI_TEMPLE',
    distanceMeters: 84.4,
    recordedTimeSeconds: 79,
    bidirectional: true,
    geometry: [
      [85.7242303, 20.2406188],
      [85.724231, 20.2406191],
      [85.7242266, 20.2405862],
      [85.7242664, 20.2405534],
      [85.7243314, 20.2405309],
      [85.7244069, 20.2405076],
      [85.7244685, 20.2404952],
      [85.7245356, 20.240515],
      [85.7246035, 20.2405099],
      [85.7246614, 20.2405042],
      [85.7247218, 20.2405059],
      [85.7247622, 20.2405236],
      [85.7247618, 20.2405734],
      [85.7247708, 20.2406489],
      [85.7247832, 20.2407103],
      [85.7247857, 20.2407054]
    ]
  },
  {
    id: 'ROUTE_004',
    name: 'Block A to Block B',
    from: 'BLOCK_A',
    to: 'BLOCK_B',
    distanceMeters: 39.99,
    recordedTimeSeconds: 43,
    bidirectional: true,
    geometry: [
      [85.7251575, 20.2403926],
      [85.7251516, 20.2403561],
      [85.725169, 20.2403255],
      [85.7251852, 20.2402697],
      [85.7251496, 20.240212],
      [85.7251555, 20.2401711],
      [85.7251848, 20.2401431],
      [85.7252294, 20.2401507],
      [85.7252722, 20.2401453]
    ]
  },
  {
    id: 'ROUTE_005',
    name: 'Block B to Hostel 1 Arnapurna',
    from: 'BLOCK_B',
    to: 'HOSTEL_1_ARNAPURNA',
    distanceMeters: 36.41,
    recordedTimeSeconds: 31,
    bidirectional: true,
    geometry: [
      [85.7252259, 20.2400945],
      [85.7252231, 20.2400939],
      [85.7252364, 20.2400916],
      [85.7253066, 20.2400767],
      [85.7254077, 20.2400356],
      [85.7254824, 20.240054],
      [85.7255448, 20.2400899]
    ]
  },
  {
    id: 'ROUTE_006',
    name: 'Block B to Block D',
    from: 'BLOCK_B',
    to: 'BLOCK_D',
    distanceMeters: 168.7,
    recordedTimeSeconds: 120,
    bidirectional: true,
    geometry: [
      [85.7252688, 20.2400708],
      [85.7252572, 20.2400669],
      [85.7252983, 20.2400554],
      [85.7254155, 20.2400576],
      [85.7254878, 20.2400592],
      [85.7255421, 20.2401026],
      [85.725611, 20.2401125],
      [85.7256879, 20.2401037],
      [85.7257714, 20.2401282],
      [85.7258525, 20.240155],
      [85.725923, 20.2401571],
      [85.7260056, 20.2401755],
      [85.7260637, 20.2401763],
      [85.7261226, 20.2401687],
      [85.7261933, 20.2401721],
      [85.7262639, 20.240151],
      [85.7263129, 20.2401704],
      [85.7263238, 20.2402549],
      [85.7263519, 20.2403028],
      [85.7263253, 20.2403829],
      [85.7262841, 20.2404466],
      [85.7262854, 20.2404907],
      [85.7262886, 20.2405354],
      [85.7263841, 20.240549]
    ]
  },
  {
    id: 'ROUTE_007',
    name: 'Block B to Hostel 2 Subhadra',
    from: 'BLOCK_B',
    to: 'HOSTEL_2_SUBHADRA',
    distanceMeters: 42.62,
    recordedTimeSeconds: 36,
    bidirectional: true,
    geometry: [
      [85.7252256, 20.2400996],
      [85.7252462, 20.2400804],
      [85.7252913, 20.2400438],
      [85.7253535, 20.2400262],
      [85.7254234, 20.2400513],
      [85.7254877, 20.2400672],
      [85.7255424, 20.2400735],
      [85.7256006, 20.2400779]
    ]
  },
  {
    id: 'ROUTE_008',
    name: 'Hostel 2 Subhadra to Cafeteria',
    from: 'HOSTEL_2_SUBHADRA',
    to: 'CAFETERIA',
    distanceMeters: 128.46,
    recordedTimeSeconds: 95,
    bidirectional: true,
    geometry: [
      [85.7257095, 20.2400938],
      [85.7257347, 20.2401088],
      [85.7257782, 20.240121],
      [85.7258447, 20.2401307],
      [85.7259073, 20.2401402],
      [85.7259949, 20.2401332],
      [85.7260957, 20.2401533],
      [85.7261719, 20.2401685],
      [85.7262422, 20.2401732],
      [85.7263179, 20.2401645],
      [85.7263298, 20.240223],
      [85.7263482, 20.2403038],
      [85.7263836, 20.2403144],
      [85.7264137, 20.2402995],
      [85.7264682, 20.2402736],
      [85.7265283, 20.2402577],
      [85.7266145, 20.2402799],
      [85.7267203, 20.2403214],
      [85.7267582, 20.2403643]
    ]
  },
  {
    id: 'ROUTE_009',
    name: 'Hostel 2 Subhadra to NIIS Canteen',
    from: 'HOSTEL_2_SUBHADRA',
    to: 'NIIS_CANTEEN',
    distanceMeters: 68.05,
    recordedTimeSeconds: 53,
    bidirectional: true,
    geometry: [
      [85.7256848, 20.2401303],
      [85.7256804, 20.2401303],
      [85.7257603, 20.2401202],
      [85.7258373, 20.2401126],
      [85.7259073, 20.240122],
      [85.725977, 20.2401291],
      [85.7260641, 20.2401419],
      [85.7261218, 20.2401608],
      [85.7261859, 20.2401739],
      [85.7262462, 20.2401644],
      [85.7263125, 20.2401359]
    ]
  },
  {
    id: 'ROUTE_010',
    name: 'Hostel 2 Subhadra to Block C',
    from: 'HOSTEL_2_SUBHADRA',
    to: 'BLOCK_C',
    distanceMeters: 66.97,
    recordedTimeSeconds: 52,
    bidirectional: true,
    geometry: [
      [85.7256537, 20.2400692],
      [85.7256546, 20.2400714],
      [85.7257207, 20.2401001],
      [85.7257993, 20.2401221],
      [85.7258758, 20.2401413],
      [85.7259403, 20.2401566],
      [85.7260165, 20.2401626],
      [85.7260883, 20.2401659],
      [85.7261233, 20.2402102],
      [85.7261406, 20.240284],
      [85.7261727, 20.2403214]
    ]
  },
  {
    id: 'ROUTE_011',
    name: 'Hostel 2 Subhadra to Block D',
    from: 'HOSTEL_2_SUBHADRA',
    to: 'BLOCK_D',
    distanceMeters: 119.24,
    recordedTimeSeconds: 96,
    bidirectional: true,
    geometry: [
      [85.7256772, 20.2401055],
      [85.7256805, 20.2401084],
      [85.7257399, 20.240118],
      [85.7258185, 20.240136],
      [85.7258941, 20.2401499],
      [85.7259931, 20.2401493],
      [85.7260631, 20.2401485],
      [85.7261146, 20.2401564],
      [85.7261762, 20.2401673],
      [85.7262493, 20.2401544],
      [85.7263081, 20.2401354],
      [85.7263149, 20.2401888],
      [85.7263154, 20.2402843],
      [85.7263228, 20.2403445],
      [85.7263017, 20.2403975],
      [85.7262876, 20.2404463],
      [85.7262781, 20.240516],
      [85.7262953, 20.240523],
      [85.7263625, 20.2405341]
    ]
  },
  {
    id: 'ROUTE_012',
    name: 'Hostel 2 Subhadra to Block E',
    from: 'HOSTEL_2_SUBHADRA',
    to: 'BLOCK_E',
    distanceMeters: 78.95,
    recordedTimeSeconds: 72,
    bidirectional: true,
    geometry: [
      [85.7256961, 20.2401009],
      [85.7257029, 20.240097],
      [85.7257645, 20.240087],
      [85.7258407, 20.2401201],
      [85.7259159, 20.2401488],
      [85.7259842, 20.2401706],
      [85.7260494, 20.2401766],
      [85.7261157, 20.2401718],
      [85.7261872, 20.2401666],
      [85.7262615, 20.2401519],
      [85.7262932, 20.2401835],
      [85.726308, 20.2402186],
      [85.7263344, 20.2402533],
      [85.7263422, 20.240271],
      [85.7263547, 20.2402602]
    ]
  },
  {
    id: 'ROUTE_013',
    name: 'Hostel 2 Subhadra to Hostel 3 Jagannath',
    from: 'HOSTEL_2_SUBHADRA',
    to: 'HOSTEL_3_JAGANNATH',
    distanceMeters: 110.6,
    recordedTimeSeconds: 85,
    bidirectional: true,
    geometry: [
      [85.7256917, 20.2401074],
      [85.7256994, 20.2401149],
      [85.7257801, 20.2401457],
      [85.7258611, 20.2401636],
      [85.7259322, 20.2401584],
      [85.7259981, 20.2401599],
      [85.7260639, 20.2401649],
      [85.7261202, 20.2401932],
      [85.7261289, 20.2402637],
      [85.7261423, 20.2403338],
      [85.7261848, 20.2403838],
      [85.7262201, 20.2404531],
      [85.7262259, 20.2405123],
      [85.7262305, 20.2405845],
      [85.7262374, 20.2406436],
      [85.7262408, 20.2406941],
      [85.7262411, 20.2407431]
    ]
  }
];

/**
 * Consistent GPS to 3D Campus transformation
 * Maps longitude/latitude into [x, y, z] Three.js world space.
 */
export function gpsToCampus(lon: number, lat: number): [number, number, number] {
  // Convert spherical offset to local east/north meters from Main Gate reference
  const eastMeters = (lon - 85.72423) * 104440;
  const northMeters = (lat - 20.24058) * 110700;

  // Calibrated transformation matrix aligned with campus digital twin orientation
  const x = 0.460 * eastMeters - 0.200 * northMeters - 42.0;
  const z = -0.064 * eastMeters - 0.554 * northMeters + 18.0;
  const y = 0.45;

  return [x, y, z];
}

/**
 * Inverse transformation: 3D Campus coordinates [x, z] back to GPS [longitude, latitude]
 */
export function campusToGps(x: number, z: number): [number, number] {
  const xRel = x + 42.0;
  const zRel = z - 18.0;

  const det = (0.460 * -0.554) - (-0.200 * -0.064); // -0.25484 - 0.0128 = -0.26764
  const eastMeters = (-0.554 * xRel - (-0.200) * zRel) / det;
  const northMeters = (-(-0.064) * xRel + 0.460 * zRel) / det;

  const lon = 85.72423 + eastMeters / 104440;
  const lat = 20.24058 + northMeters / 110700;

  return [lon, lat];
}

/**
 * Convert canonical route geometries to continuous 3D coordinate arrays
 */
export function getRoute3DCoordinates(route: CampusRoute, reversed: boolean = false): [number, number, number][] {
  const geom = reversed ? [...route.geometry].reverse() : route.geometry;
  const fromNode = CANONICAL_CAMPUS_NODES.find(n => n.id === (reversed ? route.to : route.from));
  const toNode = CANONICAL_CAMPUS_NODES.find(n => n.id === (reversed ? route.from : route.to));

  if (!fromNode || !toNode || geom.length === 0) {
    return geom.map(pt => gpsToCampus(pt[0], pt[1]));
  }

  // Anchor start and end precisely to node points while preserving true GPX curvature
  const rawPoints = geom.map(pt => gpsToCampus(pt[0], pt[1]));
  const startRaw = rawPoints[0];
  const endRaw = rawPoints[rawPoints.length - 1];

  const dxStart = fromNode.campus3D[0] - startRaw[0];
  const dzStart = fromNode.campus3D[2] - startRaw[2];

  const dxEnd = toNode.campus3D[0] - endRaw[0];
  const dzEnd = toNode.campus3D[2] - endRaw[2];

  return rawPoints.map((pt, idx) => {
    const t = rawPoints.length > 1 ? idx / (rawPoints.length - 1) : 0;
    const dx = dxStart * (1 - t) + dxEnd * t;
    const dz = dzStart * (1 - t) + dzEnd * t;
    return [pt[0] + dx, 0.45, pt[2] + dz];
  });
}

/**
 * Builds NavNode[] representations of canonical nodes for navigation engine compatibility
 */
export function getCanonicalNavNodes(): NavNode[] {
  return CANONICAL_CAMPUS_NODES.map(cn => ({
    id: cn.id,
    name: cn.name,
    x: cn.campus3D[0],
    z: cn.campus3D[2],
    y: cn.campus3D[1],
    buildingId: cn.buildingId,
    type: cn.category === 'gate' ? 'gate' : cn.category === 'hostel' ? 'building_entrance' : 'building_entrance',
    accessible: cn.accessible
  }));
}

/**
 * Builds NavEdge[] representations of canonical routes for navigation engine compatibility
 */
export function getCanonicalNavEdges(activeRoutes: CampusRoute[] = NIIS_CAMPUS_ROUTES): NavEdge[] {
  return activeRoutes.map(r => ({
    id: r.id,
    from: r.from,
    to: r.to,
    distance: r.distanceMeters,
    accessible: r.accessible !== false,
    stairs: r.stairs,
    ramp: r.ramp,
    blocked: r.blocked,
    name: r.name || `${r.from} to ${r.to}`
  }));
}

export const niisCampusRoutes: CampusRoute[] = NIIS_CAMPUS_ROUTES.map(r => ({
  ...r,
  distanceM: r.distanceMeters,
  timeS: r.recordedTimeSeconds,
  gpx: r.geometry
}));
