import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BuildingData, CalculatedRoute, TemporaryObstacle, WeatherData } from '../../types';
import { 
  Compass, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Sun, 
  Moon, 
  CloudRain, 
  ZoomIn, 
  ZoomOut,
  MapPin,
  Play,
  Pause,
  FastForward,
  UserCheck,
  Eye,
  AlertTriangle,
  CloudFog
} from 'lucide-react';

interface CampusDigitalTwinProps {
  buildings: BuildingData[];
  selectedBuilding: BuildingData | null;
  onSelectBuilding: (b: BuildingData | null) => void;
  activeRoute: CalculatedRoute | null;
  userPosition: [number, number, number] | null;
  userHeading?: number;
  isNavigating: boolean;
  isDemoMode: boolean;
  demoSpeedMultiplier?: number;
  isDarkMode: boolean;
  weatherCondition?: WeatherData['condition'];
  weatherEffectsEnabled?: boolean;
  onToggleTheme: () => void;
  onToggleWeather?: () => void;
  obstacles?: TemporaryObstacle[];
}

export const CampusDigitalTwin: React.FC<CampusDigitalTwinProps> = ({
  buildings,
  selectedBuilding,
  onSelectBuilding,
  activeRoute,
  userPosition,
  userHeading = 0,
  isNavigating,
  isDemoMode,
  demoSpeedMultiplier = 1,
  isDarkMode,
  weatherCondition = 'Sunny',
  weatherEffectsEnabled = true,
  onToggleTheme,
  onToggleWeather,
  obstacles = []
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [is2DMode, setIs2DMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [hoveredBuilding, setHoveredBuilding] = useState<BuildingData | null>(null);
  const [hoverScreenPos, setHoverScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [cameraAzimuth, setCameraAzimuth] = useState<number>(0);
  const [followPlayer, setFollowPlayer] = useState<boolean>(true);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const buildingMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const routeLineRef = useRef<THREE.Line | null>(null);
  const routeArrowsRef = useRef<THREE.Group | null>(null);
  const beaconGroupRef = useRef<THREE.Group | null>(null);
  const rpgCharacterRef = useRef<THREE.Group | null>(null);
  const rainParticlesRef = useRef<THREE.Points | null>(null);
  const obstacleMeshesRef = useRef<THREE.Group | null>(null);

  // Orbit controls state
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const pointerDownPosRef = useRef({ x: 0, y: 0 });
  const touchStartDistRef = useRef(0);
  const cameraTargetRef = useRef(new THREE.Vector3(12, 0, 8));
  const cameraSphericalRef = useRef({ radius: 95, theta: Math.PI / 4, phi: Math.PI / 3.2 });
  const destCameraPosRef = useRef<THREE.Vector3 | null>(null);
  const destCameraTargetRef = useRef<THREE.Vector3 | null>(null);

  // 1. Initialize Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDarkMode ? 1.05 : 1.25;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Build Campus Environment
    buildCampusEnvironment(scene, isDarkMode, weatherCondition);

    // Build 3D Buildings
    buildBuildings(scene, buildings, isDarkMode);

    // Setup Destination Beacon Group
    const beaconGroup = new THREE.Group();
    scene.add(beaconGroup);
    beaconGroupRef.current = beaconGroup;

    // Setup RPG Character Avatar
    const rpgCharacter = createRPGCharacter();
    scene.add(rpgCharacter);
    rpgCharacterRef.current = rpgCharacter;

    // Setup Rain Particles
    const rainPoints = createRainSystem();
    scene.add(rainPoints);
    rainParticlesRef.current = rainPoints;

    // Setup Obstacle Visuals Group
    const obstacleGroup = new THREE.Group();
    scene.add(obstacleGroup);
    obstacleMeshesRef.current = obstacleGroup;

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Camera lerping to target if selecting building or reset
      if (destCameraPosRef.current && cameraRef.current) {
        cameraRef.current.position.lerp(destCameraPosRef.current, 0.05);
        if (destCameraTargetRef.current) {
          cameraTargetRef.current.lerp(destCameraTargetRef.current, 0.05);
          cameraRef.current.lookAt(cameraTargetRef.current);
        }
        if (cameraRef.current.position.distanceTo(destCameraPosRef.current) < 0.5) {
          destCameraPosRef.current = null;
          destCameraTargetRef.current = null;
          syncSphericalFromCurrentCamera();
        }
      } else {
        updateCameraPosition();
      }

      // Camera follow RPG player during active navigation
      if (isNavigating && followPlayer && userPosition && cameraRef.current) {
        cameraTargetRef.current.lerp(new THREE.Vector3(userPosition[0], 1, userPosition[2]), 0.05);
      }

      // Update Compass angle
      if (cameraRef.current) {
        const camDir = new THREE.Vector3();
        cameraRef.current.getWorldDirection(camDir);
        const heading = Math.atan2(camDir.x, camDir.z) * (180 / Math.PI);
        setCameraAzimuth(heading);
      }

      // Animate Rain Particles if rain active
      if (rainParticlesRef.current && weatherEffectsEnabled) {
        const isRaining = weatherCondition === 'Rain' || weatherCondition === 'Heavy Rain' || weatherCondition === 'Thunderstorm';
        rainParticlesRef.current.visible = isRaining;
        if (isRaining) {
          const positions = rainParticlesRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 1; i < positions.length; i += 3) {
            positions[i] -= 1.8 * (weatherCondition === 'Heavy Rain' ? 1.6 : 1);
            if (positions[i] < 0) positions[i] = 80;
          }
          rainParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
      } else if (rainParticlesRef.current) {
        rainParticlesRef.current.visible = false;
      }

      // Animate Route directional arrows
      if (routeArrowsRef.current) {
        routeArrowsRef.current.children.forEach((child, i) => {
          child.position.y = 0.5 + Math.sin(time * 4 + i) * 0.15;
        });
      }

      // Animate Destination Beacon
      if (beaconGroupRef.current && beaconGroupRef.current.visible) {
        beaconGroupRef.current.rotation.y += 0.02;
        const ring = beaconGroupRef.current.getObjectByName('beaconRing');
        if (ring) {
          ring.scale.setScalar(1 + Math.sin(time * 3) * 0.25);
        }
      }

      // Animate RPG Character Walking Limbs
      if (rpgCharacterRef.current && rpgCharacterRef.current.visible && isNavigating) {
        const leftLeg = rpgCharacterRef.current.getObjectByName('leftLeg');
        const rightLeg = rpgCharacterRef.current.getObjectByName('rightLeg');
        const leftArm = rpgCharacterRef.current.getObjectByName('leftArm');
        const rightArm = rpgCharacterRef.current.getObjectByName('rightArm');
        const torso = rpgCharacterRef.current.getObjectByName('torso');

        const walkSpeed = 12 * demoSpeedMultiplier;
        const legSwing = Math.sin(time * walkSpeed) * 0.5;

        if (leftLeg) leftLeg.rotation.x = legSwing;
        if (rightLeg) rightLeg.rotation.x = -legSwing;
        if (leftArm) leftArm.rotation.x = -legSwing * 0.8;
        if (rightArm) rightArm.rotation.x = legSwing * 0.8;
        if (torso) torso.position.y = 1.1 + Math.abs(Math.sin(time * walkSpeed)) * 0.1;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update theme & weather lighting
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    
    const oldEnv = scene.getObjectByName('campusEnvGroup');
    if (oldEnv) scene.remove(oldEnv);
    buildCampusEnvironment(scene, isDarkMode, weatherCondition);
    buildBuildings(scene, buildings, isDarkMode);

    // Weather Fog Update
    if (weatherCondition === 'Fog') {
      scene.fog = new THREE.FogExp2(isDarkMode ? 0x221828 : 0xd8d0c5, 0.015);
    } else if (weatherCondition === 'Rain' || weatherCondition === 'Thunderstorm') {
      scene.fog = new THREE.FogExp2(isDarkMode ? 0x110c18 : 0xb8b0a5, 0.008);
    } else {
      scene.fog = new THREE.FogExp2(isDarkMode ? 0x08070b : 0xe8e1d5, 0.003);
    }

    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = isDarkMode ? 1.05 : 1.25;
    }
  }, [isDarkMode, buildings, weatherCondition]);

  // Update Obstacle Meshes
  useEffect(() => {
    if (!obstacleMeshesRef.current || !sceneRef.current) return;
    const group = obstacleMeshesRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const activeObs = obstacles.filter(o => o.active);
    activeObs.forEach((obs, idx) => {
      // Place obstacle barrier at rear passage or courtyard
      const barrierGeo = new THREE.BoxGeometry(4, 1.2, 0.4);
      const barrierMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b, // caution yellow
        roughness: 0.5
      });
      const barrier = new THREE.Mesh(barrierGeo, barrierMat);
      barrier.position.set(-6, 0.6, -9 + idx * 3);
      group.add(barrier);
    });
  }, [obstacles]);

  // Update 3D buildings
  const buildBuildings = (scene: THREE.Scene, buildingList: BuildingData[], dark: boolean) => {
    buildingMeshesRef.current.forEach(group => scene.remove(group));
    buildingMeshesRef.current.clear();

    buildingList.forEach(b => {
      const bGroup = createBuildingModel(b, dark);
      bGroup.position.set(b.position[0], b.position[1], b.position[2]);
      if (b.rotationY) bGroup.rotation.y = b.rotationY;
      bGroup.userData = { buildingId: b.id, buildingData: b };
      scene.add(bGroup);
      buildingMeshesRef.current.set(b.id, bGroup);
    });
  };

  // Update Route visualization
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (routeLineRef.current) {
      scene.remove(routeLineRef.current);
      routeLineRef.current.geometry.dispose();
      routeLineRef.current = null;
    }
    if (routeArrowsRef.current) {
      scene.remove(routeArrowsRef.current);
      routeArrowsRef.current = null;
    }

    if (!activeRoute || activeRoute.coordinates.length < 2) {
      if (beaconGroupRef.current) beaconGroupRef.current.visible = false;
      return;
    }

    // Route curve
    const points = activeRoute.coordinates.map(c => new THREE.Vector3(c[0], c[1], c[2]));
    const curve = new THREE.CatmullRomCurve3(points);
    const curvePoints = curve.getPoints(Math.max(30, points.length * 8));

    const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const lineColor = activeRoute.type === 'accessible' ? 0x00f0ff : activeRoute.type === 'quiet' ? 0xe9b95f : 0xff3fa4;

    const lineMat = new THREE.LineBasicMaterial({
      color: lineColor,
      linewidth: 4,
      transparent: true,
      opacity: 0.95
    });
    const routeLine = new THREE.Line(lineGeo, lineMat);
    scene.add(routeLine);
    routeLineRef.current = routeLine;

    // Glowing directional arrows along route
    const arrowsGroup = new THREE.Group();
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const dir = new THREE.Vector3().subVectors(p2, p1).normalize();

      const arrowConeGeo = new THREE.ConeGeometry(0.7, 1.8, 16);
      arrowConeGeo.rotateX(Math.PI / 2);
      const arrowMat = new THREE.MeshBasicMaterial({ color: lineColor });
      const arrowMesh = new THREE.Mesh(arrowConeGeo, arrowMat);
      arrowMesh.position.copy(mid);
      arrowMesh.position.y += 0.4;
      arrowMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
      arrowsGroup.add(arrowMesh);
    }
    scene.add(arrowsGroup);
    routeArrowsRef.current = arrowsGroup;

    // Position Destination Beacon
    if (beaconGroupRef.current && activeRoute.toNode) {
      beaconGroupRef.current.position.set(activeRoute.toNode.x, (activeRoute.toNode.y || 0) + 1, activeRoute.toNode.z);
      beaconGroupRef.current.visible = true;
    }
  }, [activeRoute]);

  // Update RPG User Avatar Position & Heading
  useEffect(() => {
    if (!rpgCharacterRef.current) return;
    if (userPosition) {
      rpgCharacterRef.current.visible = true;
      rpgCharacterRef.current.position.set(userPosition[0], userPosition[1], userPosition[2]);
      rpgCharacterRef.current.rotation.y = (userHeading * Math.PI) / 180;
    } else {
      rpgCharacterRef.current.visible = false;
    }
  }, [userPosition, userHeading]);

  // Handle selected building focus & highlight
  useEffect(() => {
    buildingMeshesRef.current.forEach((mesh, id) => {
      const isSelected = selectedBuilding?.id === id;
      const highlightBox = mesh.getObjectByName('highlightBox') as THREE.Mesh;
      if (highlightBox) {
        highlightBox.visible = isSelected;
      }
    });

    if (selectedBuilding) {
      const [bx, by, bz] = selectedBuilding.position;
      destCameraTargetRef.current = new THREE.Vector3(bx, by + 2, bz);
      destCameraPosRef.current = new THREE.Vector3(bx - 24, by + 22, bz + 28);
    }
  }, [selectedBuilding]);

  // Camera Orbit Math
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSphericalRef.current;
    const target = cameraTargetRef.current;

    cameraRef.current.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = target.y + radius * Math.cos(phi);
    cameraRef.current.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(target);
  };

  const syncSphericalFromCurrentCamera = () => {
    if (!cameraRef.current) return;
    const offset = new THREE.Vector3().subVectors(cameraRef.current.position, cameraTargetRef.current);
    const radius = offset.length();
    const phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius)));
    const theta = Math.atan2(offset.x, offset.z);
    cameraSphericalRef.current = { radius, theta, phi };
  };

  // Mouse / Touch Controls Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    if (e.button === 2 || e.shiftKey) {
      isPanningRef.current = true;
    } else {
      isDraggingRef.current = true;
    }
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;

    if (!isDraggingRef.current && !isPanningRef.current) {
      const rect = mountRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const meshes: THREE.Object3D[] = [];
      buildingMeshesRef.current.forEach(group => meshes.push(group));

      const intersects = raycaster.intersectObjects(meshes, true);
      if (intersects.length > 0) {
        let rootGroup: THREE.Object3D | null = intersects[0].object;
        while (rootGroup && !rootGroup.userData.buildingData && rootGroup.parent) {
          rootGroup = rootGroup.parent;
        }
        if (rootGroup && rootGroup.userData.buildingData) {
          setHoveredBuilding(rootGroup.userData.buildingData);
          setHoverScreenPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          mountRef.current.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredBuilding(null);
      setHoverScreenPos(null);
      mountRef.current.style.cursor = 'grab';
      return;
    }

    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    if (isDraggingRef.current) {
      cameraSphericalRef.current.theta -= dx * 0.006;
      cameraSphericalRef.current.phi = Math.max(0.15, Math.min(Math.PI / 2.05, cameraSphericalRef.current.phi - dy * 0.006));
    } else if (isPanningRef.current) {
      const right = new THREE.Vector3();
      cameraRef.current.getWorldDirection(right);
      right.cross(cameraRef.current.up).normalize();

      const up = new THREE.Vector3(0, 1, 0);
      cameraTargetRef.current.addScaledVector(right, -dx * 0.12);
      cameraTargetRef.current.addScaledVector(up, dy * 0.12);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      const dragDist = Math.hypot(
        e.clientX - pointerDownPosRef.current.x,
        e.clientY - pointerDownPosRef.current.y
      );

      // If released without significant drag, treat as tap / select
      if (dragDist < 10) {
        if (hoveredBuilding) {
          onSelectBuilding(hoveredBuilding);
        } else if (mountRef.current && cameraRef.current) {
          const rect = mountRef.current.getBoundingClientRect();
          const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
          );
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, cameraRef.current);
          const meshes: THREE.Object3D[] = [];
          buildingMeshesRef.current.forEach(group => meshes.push(group));
          const intersects = raycaster.intersectObjects(meshes, true);
          if (intersects.length > 0) {
            let rootGroup: THREE.Object3D | null = intersects[0].object;
            while (rootGroup && !rootGroup.userData.buildingData && rootGroup.parent) {
              rootGroup = rootGroup.parent;
            }
            if (rootGroup && rootGroup.userData.buildingData) {
              onSelectBuilding(rootGroup.userData.buildingData);
            }
          }
        }
      }
    }
    isPanningRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY * 0.08;
    cameraSphericalRef.current.radius = Math.max(20, Math.min(220, cameraSphericalRef.current.radius + zoomFactor));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDistRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const diff = touchStartDistRef.current - dist;
      cameraSphericalRef.current.radius = Math.max(20, Math.min(220, cameraSphericalRef.current.radius + diff * 0.2));
      touchStartDistRef.current = dist;
    }
  };

  const handleResetView = () => {
    destCameraTargetRef.current = new THREE.Vector3(12, 0, 8);
    destCameraPosRef.current = new THREE.Vector3(12 - 50, 65, 8 + 65);
    setIs2DMode(false);
  };

  const handleToggle2D = () => {
    if (!is2DMode) {
      destCameraTargetRef.current = new THREE.Vector3(14, 0, 6);
      destCameraPosRef.current = new THREE.Vector3(14, 130, 6.1);
      setIs2DMode(true);
    } else {
      handleResetView();
    }
  };

  const handleZoom = (inOut: 'in' | 'out') => {
    const delta = inOut === 'in' ? -15 : 15;
    cameraSphericalRef.current.radius = Math.max(20, Math.min(220, cameraSphericalRef.current.radius + delta));
  };

  const handleFullscreen = () => {
    if (!mountRef.current) return;
    if (!document.fullscreenElement) {
      mountRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleLocateMe = () => {
    if (userPosition && cameraTargetRef.current && cameraSphericalRef.current) {
      cameraTargetRef.current.set(userPosition[0], userPosition[1] + 1, userPosition[2]);
      cameraSphericalRef.current.radius = 45;
      cameraSphericalRef.current.phi = Math.PI / 3;
    } else {
      handleResetView();
    }
  };

  // Filter visibility by category and Admin visibility setting
  useEffect(() => {
    buildingMeshesRef.current.forEach((mesh, id) => {
      const b = buildings.find(item => item.id === id);
      if (!b) return;
      const isVisibleByAdmin = b.visible !== false && b.status !== 'closed';
      const isVisibleByCategory = activeCategoryFilter === 'all' || b.category === activeCategoryFilter;
      mesh.visible = isVisibleByAdmin && isVisibleByCategory;
    });
  }, [activeCategoryFilter, buildings]);

  return (
    <div 
      ref={mountRef} 
      className="relative w-full h-full min-h-0 bg-[#08070B] overflow-hidden select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Top Floating Category Tabs (Responsive horizontally scrollable chips - Requirement 7) */}
      <div className="absolute top-2 sm:top-3.5 left-2 sm:left-4 md:left-[390px] right-24 sm:right-28 md:right-24 z-10 flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none pointer-events-auto touch-pan-x">
        {[
          { id: 'all', label: 'All Campus' },
          { id: 'academic', label: 'Academic Blocks' },
          { id: 'hostel', label: 'Hostels' },
          { id: 'amenity', label: 'Facilities' },
          { id: 'dining', label: 'Canteen & Cafe' },
          { id: 'gate', label: 'Gates & Entrances' },
          { id: 'religious', label: 'Sai Temple' },
          { id: 'sports', label: 'Sports Ground' },
          { id: 'parking', label: 'Parking' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryFilter(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 min-h-[36px] flex items-center ${
              activeCategoryFilter === cat.id
                ? 'bg-[#FF3FA4] text-white shadow-lg shadow-[#FF3FA4]/30 font-bold'
                : 'glass-panel text-white/75 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Floating 3D Hover Tooltip with Capacity and Floor details */}
      {hoveredBuilding && hoverScreenPos && (
        <div 
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 max-w-[85vw]"
          style={{ left: hoverScreenPos.x, top: hoverScreenPos.y }}
        >
          <div className="glass-panel px-4 py-2.5 rounded-2xl border border-[#FF3FA4]/50 shadow-2xl flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#E9B95F] uppercase tracking-wider">{hoveredBuilding.code}</span>
              {hoveredBuilding.occupancyStatus && (
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono ${
                  hoveredBuilding.occupancyStatus === 'Busy' || hoveredBuilding.occupancyStatus === 'Very Busy'
                    ? 'bg-red-500/20 text-red-300'
                    : hoveredBuilding.occupancyStatus === 'Moderate'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {hoveredBuilding.occupancyStatus}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-white whitespace-nowrap">{hoveredBuilding.name}</span>
            <span className="text-[10px] text-white/60 capitalize">
              {hoveredBuilding.category} · {hoveredBuilding.floors} Floors
              {hoveredBuilding.currentOccupancy && ` · Occupancy: ${hoveredBuilding.currentOccupancy}/${hoveredBuilding.maxCapacity}`}
            </span>
          </div>
          <div className="w-2.5 h-2.5 bg-[#171019] border-r border-b border-[#FF3FA4]/50 rotate-45 mx-auto -mt-1.5" />
        </div>
      )}

      {/* Desktop 3D Map Control HUD (Right edge, vertically centered) */}
      <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-2 pointer-events-auto">
        {/* Rotatable Compass */}
        <button
          onClick={handleResetView}
          className="w-11 h-11 rounded-2xl glass-panel flex items-center justify-center text-white/80 hover:text-white transition-all shadow-xl hover:border-[#FF3FA4]/50 cursor-pointer group"
          title="Compass (Click to Reset North)"
        >
          <div 
            className="w-7 h-7 flex items-center justify-center transition-transform duration-100"
            style={{ transform: `rotate(${-cameraAzimuth}deg)` }}
          >
            <Compass className="w-6 h-6 text-[#FF3FA4] group-hover:scale-110 transition-transform" />
          </div>
        </button>

        {/* 2D / 3D Mode Toggle */}
        <button
          onClick={handleToggle2D}
          className={`w-11 h-11 rounded-2xl glass-panel font-bold text-xs flex items-center justify-center transition-all shadow-xl cursor-pointer ${
            is2DMode ? 'bg-[#FF3FA4] text-white' : 'text-white/80 hover:text-white hover:border-[#FF3FA4]/50'
          }`}
          title={is2DMode ? 'Switch to 3D Perspective' : 'Switch to 2D Top View'}
        >
          {is2DMode ? '3D' : '2D'}
        </button>

        {/* Reset View */}
        <button
          onClick={handleResetView}
          className="w-11 h-11 rounded-2xl glass-panel flex items-center justify-center text-white/80 hover:text-white transition-all shadow-xl hover:border-[#FF3FA4]/50 cursor-pointer"
          title="Reset Camera View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Theme Toggle (Day / Night) */}
        <button
          onClick={onToggleTheme}
          className="w-11 h-11 rounded-2xl glass-panel flex items-center justify-center text-white/80 hover:text-white transition-all shadow-xl hover:border-[#FF3FA4]/50 cursor-pointer"
          title={isDarkMode ? 'Switch to Warm Daylight' : 'Switch to Night Command Theme'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-[#E9B95F]" /> : <Moon className="w-4 h-4 text-[#FF3FA4]" />}
        </button>

        {/* Weather Effects Toggle */}
        {onToggleWeather && (
          <button
            onClick={onToggleWeather}
            className={`w-11 h-11 rounded-2xl glass-panel flex items-center justify-center transition-all shadow-xl cursor-pointer ${
              weatherEffectsEnabled ? 'text-[#00f0ff] border-[#00f0ff]/50' : 'text-white/50'
            }`}
            title={`Weather Effects: ${weatherCondition} (${weatherEffectsEnabled ? 'ON' : 'OFF'})`}
          >
            {weatherCondition === 'Rain' || weatherCondition === 'Heavy Rain' || weatherCondition === 'Thunderstorm' ? (
              <CloudRain className="w-4 h-4 text-[#00f0ff]" />
            ) : weatherCondition === 'Fog' ? (
              <CloudFog className="w-4 h-4 text-[#E9B95F]" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        )}

        {/* Camera Follow Player Toggle (During active navigation) */}
        {isNavigating && (
          <button
            onClick={() => setFollowPlayer(!followPlayer)}
            className={`w-11 h-11 rounded-2xl glass-panel flex items-center justify-center transition-all shadow-xl cursor-pointer ${
              followPlayer ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/40' : 'text-white/50'
            }`}
            title={followPlayer ? 'Following Player Avatar (ON)' : 'Free Camera Orbit'}
          >
            <UserCheck className="w-4 h-4" />
          </button>
        )}

        {/* Zoom Controls */}
        <div className="flex flex-col rounded-2xl glass-panel overflow-hidden shadow-xl">
          <button
            onClick={() => handleZoom('in')}
            className="w-11 h-10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors border-b border-white/10 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom('out')}
            className="w-11 h-10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Fullscreen */}
        <button
          onClick={handleFullscreen}
          className="w-11 h-11 rounded-2xl glass-panel flex items-center justify-center text-white/80 hover:text-white transition-all shadow-xl hover:border-[#FF3FA4]/50 cursor-pointer"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Floating 3D Control Group (Requirement 6: Compact touch-friendly cluster) */}
      <div className="md:hidden absolute right-2.5 top-14 z-20 flex flex-col items-end gap-1.5 pointer-events-auto">
        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl glass-panel shadow-2xl border border-white/20 backdrop-blur-xl">
          {/* Compass / Reset North */}
          <button
            onClick={handleResetView}
            className="w-10 h-10 rounded-xl bg-white/5 active:bg-white/15 flex items-center justify-center text-white/80 cursor-pointer"
            title="Reset North"
            aria-label="Reset North"
          >
            <div 
              className="w-5 h-5 flex items-center justify-center"
              style={{ transform: `rotate(${-cameraAzimuth}deg)` }}
            >
              <Compass className="w-5 h-5 text-[#FF3FA4]" />
            </div>
          </button>

          {/* 2D / 3D Mode */}
          <button
            onClick={handleToggle2D}
            className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center cursor-pointer transition-colors ${
              is2DMode ? 'bg-[#FF3FA4] text-white shadow-md' : 'bg-white/5 active:bg-white/15 text-white/80'
            }`}
            title="Toggle 2D/3D Mode"
            aria-label="Toggle 2D/3D Mode"
          >
            {is2DMode ? '3D' : '2D'}
          </button>

          {/* Zoom In */}
          <button
            onClick={() => handleZoom('in')}
            className="w-10 h-10 rounded-xl bg-white/5 active:bg-white/15 flex items-center justify-center text-white/80 cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => handleZoom('out')}
            className="w-10 h-10 rounded-xl bg-white/5 active:bg-white/15 flex items-center justify-center text-white/80 cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Reset Camera */}
          <button
            onClick={handleResetView}
            className="w-10 h-10 rounded-xl bg-white/5 active:bg-white/15 flex items-center justify-center text-white/80 cursor-pointer"
            title="Reset Camera"
            aria-label="Reset Camera"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Locate Current Location */}
          <button
            onClick={handleLocateMe}
            className="w-10 h-10 rounded-xl bg-white/5 active:bg-white/15 flex items-center justify-center text-[#00f0ff] cursor-pointer"
            title="Locate Current Position"
            aria-label="Locate Current Position"
          >
            <MapPin className="w-4 h-4" />
          </button>

          {/* Day / Night Theme */}
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-xl bg-white/5 active:bg-white/15 flex items-center justify-center text-white/80 cursor-pointer"
            title="Toggle Lighting"
            aria-label="Toggle Lighting"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#E9B95F]" /> : <Moon className="w-4 h-4 text-[#FF3FA4]" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            className="w-10 h-10 rounded-xl bg-white/5 active:bg-white/15 flex items-center justify-center text-white/80 cursor-pointer"
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Follow Player / Camera Tracking (During Navigation) */}
          {isNavigating && (
            <button
              onClick={() => setFollowPlayer(!followPlayer)}
              className={`w-full col-span-2 h-9 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer ${
                followPlayer ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40' : 'bg-white/5 text-white/60'
              }`}
              title="Camera Tracking"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{followPlayer ? 'Tracking' : 'Free View'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Road & Campus Geofence Tag */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 glass-panel px-3.5 py-1.5 rounded-xl border border-white/10 text-xs text-white/70">
        <div className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] animate-ping" />
        <span className="font-mono text-[11px] text-[#E9B95F]">Badaraghunathpur Road</span>
        <span className="text-white/40">· NIIS Campus Entrance</span>
        {weatherCondition && (
          <span className="ml-2 pl-2 border-l border-white/10 text-[10px] text-white/60">
            {weatherCondition}
          </span>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 3D ENVIRONMENT & RPG ASSET BUILDERS
// ==========================================

function buildCampusEnvironment(scene: THREE.Scene, isDark: boolean, weather: string) {
  const envGroup = new THREE.Group();
  envGroup.name = 'campusEnvGroup';

  // Weather-dependent illumination
  const isStorm = weather === 'Thunderstorm' || weather === 'Heavy Rain';
  const ambColor = isDark 
    ? (isStorm ? 0x140e1c : 0x241d2d) 
    : (isStorm ? 0xc8c0b8 : 0xf4eee4);
  const ambLight = new THREE.AmbientLight(ambColor, isDark ? 1.3 : 1.7);
  envGroup.add(ambLight);

  const sunColor = isDark ? 0xffdfba : 0xfffaed;
  const sunLight = new THREE.DirectionalLight(sunColor, isStorm ? 1.2 : isDark ? 2.2 : 2.8);
  sunLight.position.set(90, 80, 70);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 300;
  sunLight.shadow.camera.left = -110;
  sunLight.shadow.camera.right = 110;
  sunLight.shadow.camera.top = 110;
  sunLight.shadow.camera.bottom = -110;
  sunLight.shadow.bias = -0.0005;
  envGroup.add(sunLight);

  // Ground Terrain
  const groundGeo = new THREE.PlaneGeometry(280, 240);
  const groundMat = new THREE.MeshStandardMaterial({
    color: isDark ? 0x110d14 : 0xe8e1d5,
    roughness: weather === 'Rain' ? 0.35 : 0.88, // wet sheen during rain
    metalness: weather === 'Rain' ? 0.25 : 0.05
  });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  envGroup.add(groundMesh);

  // Green Lawns
  const lawnGeo = new THREE.PlaneGeometry(36, 26);
  const lawnMat = new THREE.MeshStandardMaterial({
    color: isDark ? 0x1f3b2b : 0x487346,
    roughness: 0.8
  });
  const lawn = new THREE.Mesh(lawnGeo, lawnMat);
  lawn.rotation.x = -Math.PI / 2;
  lawn.position.set(-7, 0.02, 16);
  lawn.receiveShadow = true;
  envGroup.add(lawn);

  // Secondary green lawn
  const lawn2 = new THREE.Mesh(new THREE.PlaneGeometry(24, 20), lawnMat);
  lawn2.rotation.x = -Math.PI / 2;
  lawn2.position.set(12, 0.02, -10);
  lawn2.receiveShadow = true;
  envGroup.add(lawn2);

  // Main Road
  const roadGeo = new THREE.PlaneGeometry(16, 220);
  const roadMat = new THREE.MeshStandardMaterial({
    color: isDark ? 0x1c1a22 : 0x3d3a44,
    roughness: weather === 'Rain' ? 0.25 : 0.7 // wet asphalt reflections
  });
  const mainRoad = new THREE.Mesh(roadGeo, roadMat);
  mainRoad.rotation.x = -Math.PI / 2;
  mainRoad.position.set(-52, 0.03, 0);
  mainRoad.receiveShadow = true;
  envGroup.add(mainRoad);

  // Road Dash Markings
  for (let z = -90; z < 90; z += 12) {
    const dashGeo = new THREE.PlaneGeometry(0.5, 6);
    const dashMat = new THREE.MeshBasicMaterial({ color: isDark ? 0xe9b95f : 0xf5f0e9 });
    const dash = new THREE.Mesh(dashGeo, dashMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(-52, 0.04, z);
    envGroup.add(dash);
  }

  // Internal Campus Roads
  const campusAvenueGeo = new THREE.PlaneGeometry(8, 130);
  const campusAvenueMat = new THREE.MeshStandardMaterial({
    color: isDark ? 0x221d28 : 0x5a5560,
    roughness: 0.75
  });
  const eastAvenue = new THREE.Mesh(campusAvenueGeo, campusAvenueMat);
  eastAvenue.rotation.x = -Math.PI / 2;
  eastAvenue.rotation.z = Math.PI / 2;
  eastAvenue.position.set(15, 0.03, 10);
  eastAvenue.receiveShadow = true;
  envGroup.add(eastAvenue);

  // North-South connecting avenue
  const nsAvenue = new THREE.Mesh(new THREE.PlaneGeometry(8, 70), campusAvenueMat);
  nsAvenue.rotation.x = -Math.PI / 2;
  nsAvenue.position.set(18, 0.03, -12);
  nsAvenue.receiveShadow = true;
  envGroup.add(nsAvenue);

  // South Hostel Avenue
  const southAvenue = new THREE.Mesh(new THREE.PlaneGeometry(8, 90), campusAvenueMat);
  southAvenue.rotation.x = -Math.PI / 2;
  southAvenue.rotation.z = Math.PI / 2;
  southAvenue.position.set(30, 0.03, 24);
  southAvenue.receiveShadow = true;
  envGroup.add(southAvenue);

  // Sports Court
  const courtGeo = new THREE.PlaneGeometry(16, 14);
  const courtMat = new THREE.MeshStandardMaterial({
    color: isDark ? 0x8a3822 : 0xc05436,
    roughness: 0.6
  });
  const courtMesh = new THREE.Mesh(courtGeo, courtMat);
  courtMesh.rotation.x = -Math.PI / 2;
  courtMesh.position.set(68, 0.04, 7);
  envGroup.add(courtMesh);

  // Night Mode: Streetlamps along primary avenues
  if (isDark) {
    const lampCoords = [
      [-35, 0, 15], [-18, 0, 12], [-6, 0, 9], [18, 0, 8],
      [38, 0, 4], [58, 0, -2], [68, 0, -5], [18, 0, -15],
      [26, 0, -17], [33, 0, -32], [49, 0, 23], [61, 0, 20]
    ];

    lampCoords.forEach(([lx, ly, lz]) => {
      const poleGeo = new THREE.CylinderGeometry(0.12, 0.15, 4.5, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(lx, 2.25, lz);
      envGroup.add(pole);

      const lampLight = new THREE.PointLight(0xffe6a3, 1.2, 22);
      lampLight.position.set(lx, 4.6, lz);
      envGroup.add(lampLight);
    });
  }

  // Trees
  const treePositions = [
    [-18, 0, 8], [-18, 0, 20], [-18, 0, 25],
    [4, 0, 8], [4, 0, 24],
    [-27, 0, -18], [-14, 0, -22], [-22, 0, -25],
    [8, 0, 2], [28, 0, 1], [32, 0, 14],
    [10, 0, -24], [40, 0, -18], [45, 0, -32],
    [65, 0, -22], [80, 0, -12], [86, 0, 10]
  ];

  treePositions.forEach(([x, y, z]) => {
    const isPalm = Math.random() > 0.4;
    const tree = isPalm ? createPalmTree(isDark) : createShadeTree(isDark);
    tree.position.set(x, y, z);
    envGroup.add(tree);
  });

  scene.add(envGroup);
}

// Particle Rain System
function createRainSystem(): THREE.Points {
  const rainCount = 1800;
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(rainCount * 3);

  for (let i = 0; i < rainCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 220;
    positions[i * 3 + 1] = Math.random() * 80;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 220;
  }

  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x88ccff,
    size: 0.6,
    transparent: true,
    opacity: 0.7
  });

  const points = new THREE.Points(geom, mat);
  points.visible = false;
  return points;
}

// RPG-Style Playable Demo Character Avatar
function createRPGCharacter(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'rpgCharacterGroup';
  group.visible = false;

  // Ground pulse ring
  const ringGeo = new THREE.RingGeometry(1.2, 1.8, 32);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
  const pulseRing = new THREE.Mesh(ringGeo, ringMat);
  pulseRing.position.y = 0.02;
  group.add(pulseRing);

  // Stylized Avatar Hierarchy
  // Torso / Jacket (Electric Rose)
  const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.45);
  const torsoMat = new THREE.MeshStandardMaterial({ color: 0xff3fa4, roughness: 0.5 });
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.name = 'torso';
  torso.position.y = 1.1;
  group.add(torso);

  // Head
  const headGeo = new THREE.SphereGeometry(0.32, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xf5d0b5, roughness: 0.7 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 0.75;
  torso.add(head);

  // Stylized Hair / Cap (Obsidian)
  const capGeo = new THREE.ConeGeometry(0.36, 0.3, 16);
  const capMat = new THREE.MeshStandardMaterial({ color: 0x171019, roughness: 0.6 });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 0.25;
  head.add(cap);

  // Limbs
  const legMat = new THREE.MeshStandardMaterial({ color: 0x222233 });
  const armMat = new THREE.MeshStandardMaterial({ color: 0xff72bd });

  // Left Leg
  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 8), legMat);
  leftLeg.name = 'leftLeg';
  leftLeg.position.set(-0.2, 0.45, 0);
  group.add(leftLeg);

  // Right Leg
  const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 8), legMat);
  rightLeg.name = 'rightLeg';
  rightLeg.position.set(0.2, 0.45, 0);
  group.add(rightLeg);

  // Left Arm
  const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.65, 8), armMat);
  leftArm.name = 'leftArm';
  leftArm.position.set(-0.48, 1.1, 0);
  group.add(leftArm);

  // Right Arm
  const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.65, 8), armMat);
  rightArm.name = 'rightArm';
  rightArm.position.set(0.48, 1.1, 0);
  group.add(rightArm);

  // Floating Direction Pointer Arrow
  const pointerGeo = new THREE.ConeGeometry(0.4, 1.2, 16);
  pointerGeo.rotateX(Math.PI / 2);
  const pointerMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  const pointer = new THREE.Mesh(pointerGeo, pointerMat);
  pointer.position.set(0, 2.2, 0.6);
  group.add(pointer);

  return group;
}

// 3D Building Generator
function createBuildingModel(b: BuildingData, isDark: boolean): THREE.Group {
  const group = new THREE.Group();
  const [w, h, d] = b.size;

  const primaryColor = isDark 
    ? (b.category === 'religious' ? 0xe9b95f : b.category === 'academic' ? 0xd1b49a : 0x7c7385)
    : (b.category === 'religious' ? 0xd5a94f : b.category === 'academic' ? 0xe6ccb2 : 0x9d94a6);

  const baseMat = new THREE.MeshStandardMaterial({
    color: primaryColor,
    roughness: 0.6,
    metalness: 0.1
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: isDark ? 0x8a3822 : 0xb05b3b,
    roughness: 0.7
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: isDark ? 0x00f0ff : 0x4a90e2,
    roughness: 0.2,
    metalness: 0.8,
    transparent: true,
    opacity: 0.75
  });

  if (b.id === 'sai-temple') {
    const baseBox = new THREE.Mesh(new THREE.BoxGeometry(w, 4, d), baseMat);
    baseBox.position.y = 2;
    baseBox.castShadow = true;
    baseBox.receiveShadow = true;
    group.add(baseBox);

    const mandapaGeo = new THREE.ConeGeometry(w * 0.5, 4.5, 4);
    mandapaGeo.rotateY(Math.PI / 4);
    const mandapa = new THREE.Mesh(mandapaGeo, trimMat);
    mandapa.position.set(-2, 5.5, 0);
    group.add(mandapa);

    const shikharaGeo = new THREE.ConeGeometry(w * 0.42, 7.5, 8);
    const shikharaMat = new THREE.MeshStandardMaterial({ color: 0xe9b95f, roughness: 0.4, metalness: 0.3 });
    const shikhara = new THREE.Mesh(shikharaGeo, shikharaMat);
    shikhara.position.set(2, 7.5, 0);
    group.add(shikhara);

    const kalashaGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const kalashaMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const kalasha = new THREE.Mesh(kalashaGeo, kalashaMat);
    kalasha.position.set(2, 11.5, 0);
    group.add(kalasha);

  } else if (b.id === 'block-a') {
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), baseMat);
    mainBody.position.y = h / 2;
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    group.add(mainBody);

    const glassAtrium = new THREE.Mesh(new THREE.BoxGeometry(6, h, d + 0.5), glassMat);
    glassAtrium.position.set(0, h / 2, 0);
    group.add(glassAtrium);

    for (let f = 1; f <= 5; f++) {
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.4, d + 0.6), trimMat);
      cornice.position.set(0, (h / 5) * f, 0);
      group.add(cornice);
    }

    const corners = [
      [-w / 2 + 1, h, -d / 2 + 1],
      [w / 2 - 1, h, -d / 2 + 1],
      [-w / 2 + 1, h, d / 2 - 1],
      [w / 2 - 1, h, d / 2 - 1],
    ];

    corners.forEach(([cx, cy, cz]) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.5, 8), baseMat);
      pillar.position.set(cx, cy + 1.25, cz);
      group.add(pillar);

      const dome = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.8, 8), trimMat);
      dome.position.set(cx, cy + 3.2, cz);
      group.add(dome);
    });

    const portico = new THREE.Mesh(new THREE.BoxGeometry(8, 2.5, 4), trimMat);
    portico.position.set(0, 1.25, d / 2 + 2);
    group.add(portico);

  } else if (b.category === 'gate') {
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, h, 1.2), baseMat);
    p1.position.set(-w / 2, h / 2, 0);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, h, 1.2), baseMat);
    p2.position.set(w / 2, h / 2, 0);
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(w + 1.5, 0.9, 1.5), trimMat);
    archTop.position.set(0, h + 0.45, 0);
    group.add(p1, p2, archTop);

  } else {
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), baseMat);
    mainBody.position.y = h / 2;
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    group.add(mainBody);

    for (let f = 1; f <= b.floors; f++) {
      const trim = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.25, d + 0.3), trimMat);
      trim.position.set(0, (h / b.floors) * f, 0);
      group.add(trim);
    }

    const windowStripFront = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, h * 0.6, d + 0.1), glassMat);
    windowStripFront.position.set(0, h / 2, 0);
    group.add(windowStripFront);

    if (b.category === 'hostel') {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2, 16), new THREE.MeshStandardMaterial({ color: 0x222222 }));
      tank.position.set(w * 0.25, h + 1, d * 0.2);
      group.add(tank);
    }
  }

  const highlightGeo = new THREE.BoxGeometry(w + 1.2, h + 1.2, d + 1.2);
  const highlightMat = new THREE.MeshBasicMaterial({
    color: 0xff3fa4,
    wireframe: true,
    transparent: true,
    opacity: 0.85
  });
  const highlightBox = new THREE.Mesh(highlightGeo, highlightMat);
  highlightBox.name = 'highlightBox';
  highlightBox.position.y = h / 2;
  highlightBox.visible = false;
  group.add(highlightBox);

  return group;
}

function createPalmTree(isDark: boolean): THREE.Group {
  const palm = new THREE.Group();
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 6, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6e4a2d, roughness: 0.9 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 3;
  trunk.rotation.z = (Math.random() - 0.5) * 0.1;
  palm.add(trunk);

  const frondMat = new THREE.MeshStandardMaterial({
    color: isDark ? 0x2a5a3a : 0x3d7e48,
    roughness: 0.6
  });

  for (let i = 0; i < 6; i++) {
    const frondGeo = new THREE.ConeGeometry(1.4, 3.5, 4);
    frondGeo.rotateX(Math.PI / 2.6);
    const frond = new THREE.Mesh(frondGeo, frondMat);
    frond.position.set(0, 5.8, 0);
    frond.rotation.y = (i * Math.PI) / 3;
    palm.add(frond);
  }

  return palm;
}

function createShadeTree(isDark: boolean): THREE.Group {
  const tree = new THREE.Group();
  const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, 3.5, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x543d2b, roughness: 0.9 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.75;
  tree.add(trunk);

  const foliageGeo = new THREE.DodecahedronGeometry(2.4, 1);
  const foliageMat = new THREE.MeshStandardMaterial({
    color: isDark ? 0x1f4e2e : 0x2e6b3e,
    roughness: 0.8
  });
  const foliage = new THREE.Mesh(foliageGeo, foliageMat);
  foliage.position.y = 4.2;
  foliage.castShadow = true;
  tree.add(foliage);

  return tree;
}
