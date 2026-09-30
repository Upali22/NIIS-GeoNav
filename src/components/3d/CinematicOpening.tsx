import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Volume2, VolumeX, FastForward, Play, Compass, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { calculateDistanceKm } from '../../services/navigationEngine';

interface CinematicOpeningProps {
  onComplete: () => void;
  onSkip: () => void;
}

// Real geographic coordinates for distance calculation
const COORDS = {
  delhiIndia: { lat: 28.6139, lng: 77.2090 },
  odishaCentroid: { lat: 20.9517, lng: 85.0985 },
  bhubaneswarCenter: { lat: 20.2961, lng: 85.8245 },
  niisCampus: { lat: 20.2197, lng: 85.7385 }
};

// Precise calculated distances in km using Haversine formula
const DIST_INDIA_TO_ODISHA = calculateDistanceKm(
  COORDS.delhiIndia.lat, COORDS.delhiIndia.lng,
  COORDS.odishaCentroid.lat, COORDS.odishaCentroid.lng
); // ~1,270 km

const DIST_ODISHA_TO_BBSR = calculateDistanceKm(
  COORDS.odishaCentroid.lat, COORDS.odishaCentroid.lng,
  COORDS.bhubaneswarCenter.lat, COORDS.bhubaneswarCenter.lng
); // ~78 km

const DIST_BBSR_TO_NIIS = calculateDistanceKm(
  COORDS.bhubaneswarCenter.lat, COORDS.bhubaneswarCenter.lng,
  COORDS.niisCampus.lat, COORDS.niisCampus.lng
); // ~16 km

const STAGES = [
  { 
    id: 'earth', 
    name: 'Earth', 
    title: 'FROM THE WORLD...',
    subtitle: 'Every journey begins somewhere.', 
    distanceText: '',
    duration: 3800 
  },
  { 
    id: 'india', 
    name: 'India', 
    title: 'INDIA',
    subtitle: 'Journeying to Eastern India', 
    distanceText: `India → Odisha · ≈ ${DIST_INDIA_TO_ODISHA} km`,
    duration: 3400 
  },
  { 
    id: 'odisha', 
    name: 'Odisha', 
    title: 'ODISHA',
    subtitle: 'Where tradition meets innovation', 
    distanceText: `Odisha → Bhubaneswar · ≈ ${DIST_ODISHA_TO_BBSR} km`,
    duration: 3400 
  },
  { 
    id: 'bhubaneswar', 
    name: 'Bhubaneswar', 
    title: 'BHUBANESWAR',
    subtitle: 'The Temple City', 
    distanceText: `Bhubaneswar → NIIS Campus · ≈ ${DIST_BBSR_TO_NIIS} km`,
    duration: 3400 
  },
  { 
    id: 'campus', 
    name: 'NIIS Campus', 
    title: 'NIIS CAMPUS',
    subtitle: 'Your Campus. Your Route. Your Way.', 
    distanceText: 'Sarada Vihar, Madanpur · Arrived at Destination',
    duration: 3800 
  },
];

export const CinematicOpening: React.FC<CinematicOpeningProps> = ({ onComplete, onSkip }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [progress, setProgress] = useState(0);
  const [liveDistanceKm, setLiveDistanceKm] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08070b, 0.002);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 75);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    containerRef.current.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0x221c2c, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffeedd, 2.8);
    sunLight.position.set(80, 40, 60);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xff3fa4, 2.0);
    rimLight.position.set(-60, -20, -50);
    scene.add(rimLight);

    // 4. Starfield
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 250 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = radius * Math.cos(phi);

      const isRose = Math.random() > 0.8;
      starColors[i * 3] = isRose ? 1.0 : 0.9 + Math.random() * 0.1;
      starColors[i * 3 + 1] = isRose ? 0.35 : 0.9 + Math.random() * 0.1;
      starColors[i * 3 + 2] = isRose ? 0.75 : 1.0;
    }

    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starsGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starsMat = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // 5. Earth Model Group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Earth Sphere
    const earthRadius = 14;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    
    // Canvas texture for Earth
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Deep ocean gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
    oceanGrad.addColorStop(0, '#09182d');
    oceanGrad.addColorStop(0.5, '#0c2236');
    oceanGrad.addColorStop(1, '#061120');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Landmasses
    ctx.fillStyle = '#1e4030';
    ctx.beginPath();
    ctx.ellipse(600, 220, 180, 120, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // India Subcontinent
    ctx.fillStyle = '#2d6a44';
    ctx.beginPath();
    ctx.moveTo(630, 235);
    ctx.lineTo(665, 235);
    ctx.lineTo(646, 292);
    ctx.closePath();
    ctx.fill();

    // Odisha Golden/Rose coastal highlight
    ctx.fillStyle = '#ff72bd';
    ctx.beginPath();
    ctx.arc(650, 262, 5, 0, Math.PI * 2);
    ctx.fill();

    // Americas
    ctx.fillStyle = '#1e4030';
    ctx.beginPath();
    ctx.ellipse(250, 240, 100, 160, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // City lights
    ctx.fillStyle = 'rgba(233, 185, 95, 0.75)';
    for (let i = 0; i < 300; i++) {
      const rx = 510 + Math.random() * 240;
      const ry = 170 + Math.random() * 130;
      ctx.fillRect(rx, ry, 2, 2);
    }

    const earthTexture = new THREE.CanvasTexture(canvas);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.6,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Atmosphere Glow
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.04, 48, 48);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmosphere);

    // Glowing Markers
    // 1. India Marker Group
    const indiaMarkerGroup = new THREE.Group();
    const indiaBeamGeo = new THREE.CylinderGeometry(0.1, 0.1, 8, 16);
    const indiaBeamMat = new THREE.MeshBasicMaterial({ color: 0xe9b95f, transparent: true, opacity: 0.85 });
    const indiaBeam = new THREE.Mesh(indiaBeamGeo, indiaBeamMat);
    indiaBeam.position.set(0, 4, 0);
    indiaMarkerGroup.add(indiaBeam);

    const indiaOrbGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const indiaOrbMat = new THREE.MeshBasicMaterial({ color: 0xff3fa4 });
    const indiaOrb = new THREE.Mesh(indiaOrbGeo, indiaOrbMat);
    indiaOrb.position.set(0, 8, 0);
    indiaMarkerGroup.add(indiaOrb);

    indiaMarkerGroup.position.set(4.2, 5.8, 11.5);
    indiaMarkerGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), indiaMarkerGroup.position.clone().normalize());
    earthGroup.add(indiaMarkerGroup);

    // Odisha Marker (rose glow ring)
    const odishaRingGeo = new THREE.RingGeometry(0.8, 1.25, 32);
    const odishaRingMat = new THREE.MeshBasicMaterial({ color: 0xff72bd, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
    const odishaRing = new THREE.Mesh(odishaRingGeo, odishaRingMat);
    odishaRing.position.set(0, 8.2, 0);
    odishaRing.rotation.x = Math.PI / 2;
    indiaMarkerGroup.add(odishaRing);

    // Camera targets with smooth choreographed journey
    const cameraTargets = [
      { pos: new THREE.Vector3(0, 10, 68), lookAt: new THREE.Vector3(0, 0, 0), rotSpeed: 0.0028 }, // Earth
      { pos: new THREE.Vector3(6, 12, 34), lookAt: new THREE.Vector3(4.2, 5.8, 11.5), rotSpeed: 0.001 },  // India
      { pos: new THREE.Vector3(5.2, 8.5, 21), lookAt: new THREE.Vector3(4.2, 5.8, 11.5), rotSpeed: 0.0005 }, // Odisha
      { pos: new THREE.Vector3(4.8, 7.2, 16), lookAt: new THREE.Vector3(4.2, 5.8, 11.5), rotSpeed: 0.0002 }, // Bhubaneswar
      { pos: new THREE.Vector3(4.35, 6.25, 12.8), lookAt: new THREE.Vector3(4.2, 5.8, 11.5), rotSpeed: 0.0000 }, // NIIS Campus
    ];

    let currentTargetIdx = 0;
    let stageStartTime = Date.now();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = Date.now();
      const elapsed = now - stageStartTime;
      const targetStage = STAGES[currentTargetIdx];

      if (elapsed > targetStage.duration) {
        if (currentTargetIdx < STAGES.length - 1) {
          currentTargetIdx++;
          setCurrentStageIdx(currentTargetIdx);
          stageStartTime = Date.now();
        } else {
          // Finished opening sequence -> Handover to Campus Arrival
          onComplete();
          return;
        }
      }

      const stageProgress = Math.min(1, elapsed / targetStage.duration);
      setProgress(stageProgress);

      // Interpolate live distance counter
      if (currentTargetIdx === 1) {
        setLiveDistanceKm(Math.round(DIST_INDIA_TO_ODISHA * (1 - stageProgress)));
      } else if (currentTargetIdx === 2) {
        setLiveDistanceKm(Math.round(DIST_ODISHA_TO_BBSR * (1 - stageProgress)));
      } else if (currentTargetIdx === 3) {
        setLiveDistanceKm(Math.round(DIST_BBSR_TO_NIIS * (1 - stageProgress)));
      } else {
        setLiveDistanceKm(null);
      }

      const targetCam = cameraTargets[currentTargetIdx];
      camera.position.lerp(targetCam.pos, 0.04);
      camera.lookAt(targetCam.lookAt);

      earthGroup.rotation.y += targetCam.rotSpeed;
      odishaRing.rotation.z += 0.035;
      indiaOrb.scale.setScalar(1 + Math.sin(now * 0.006) * 0.22);
      starField.rotation.y += 0.00025;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [onComplete]);

  const currentStage = STAGES[currentStageIdx];

  return (
    <div className="relative w-full h-full min-h-screen bg-[#08070B] overflow-hidden flex flex-col justify-between select-none">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-0 cursor-grab" />

      {/* Top Breadcrumb & Progress Tracker */}
      <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col items-center pointer-events-none">
        <div className="glass-panel px-5 py-3 rounded-2xl flex items-center gap-3 sm:gap-6 max-w-4xl w-full justify-between pointer-events-auto shadow-2xl">
          {STAGES.map((s, idx) => {
            const isDone = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  isCurrent 
                    ? 'bg-[#FF3FA4] text-white ring-4 ring-[#FF3FA4]/30 shadow-lg scale-110' 
                    : isDone 
                    ? 'bg-[#E9B95F] text-[#08070B]' 
                    : 'bg-white/10 text-white/40'
                }`}>
                  {idx + 1}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${isCurrent ? 'text-[#FF3FA4]' : isDone ? 'text-[#E9B95F]' : 'text-white/40'}`}>
                    {s.name}
                  </span>
                </div>
                {idx < STAGES.length - 1 && (
                  <div className={`hidden lg:block w-8 h-[2px] transition-colors duration-500 ${isDone ? 'bg-[#E9B95F]' : 'bg-white/10'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Cinematic Geographic Information Card */}
      <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none px-4 text-center my-auto">
        <div className="glass-panel px-8 py-6 rounded-3xl max-w-xl mx-auto backdrop-blur-2xl border border-white/20 shadow-2xl animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-[#FF72BD] text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>NIIS GeoNav Geographic Descent</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-2 font-display">
            {currentStage.title}
          </h2>

          <p className="text-sm sm:text-base text-white/85 font-light max-w-md mx-auto leading-relaxed">
            {currentStage.subtitle}
          </p>

          {/* Animated Distance Display (Calculated from Real Geodesic Coordinates) */}
          {liveDistanceKm !== null && (
            <div className="mt-4 p-2.5 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] font-mono text-xs inline-flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 animate-spin" />
              <span>Distance to Target: <strong className="text-white font-bold">{liveDistanceKm} km</strong></span>
            </div>
          )}

          {currentStage.distanceText && liveDistanceKm === null && (
            <div className="mt-3 text-xs font-mono text-[#E9B95F]">
              {currentStage.distanceText}
            </div>
          )}

          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-mono text-white/50">
            <MapPin className="w-3.5 h-3.5 text-[#FF3FA4]" />
            <span>20.2197° N, 85.7385° E · Bhubaneswar, Odisha</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Ambient Audio, Progress & Skip Controls */}
      <div className="relative z-10 p-6 md:p-8 flex items-center justify-between pointer-events-auto max-w-5xl mx-auto w-full">
        {/* Audio Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-panel text-white/80 hover:text-white hover:border-[#FF3FA4]/40 transition-all text-xs font-medium cursor-pointer"
          title="Toggle Ambient Audio"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#FF3FA4]" /> : <VolumeX className="w-4 h-4 text-white/40" />}
          <span className="hidden sm:inline">{soundEnabled ? 'Ambient Audio On' : 'Muted'}</span>
        </button>

        {/* Progress Bar */}
        <div className="flex-1 mx-6 max-w-md hidden sm:block">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#FF3FA4] to-[#E9B95F] transition-all duration-300"
              style={{ width: `${((currentStageIdx + progress) / STAGES.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-white/40 mt-1 font-mono">
            <span>GEOGRAPHIC APPROACH</span>
            <span>{Math.round(((currentStageIdx + progress) / STAGES.length) * 100)}%</span>
          </div>
        </div>

        {/* Skip to Campus Button */}
        <button
          onClick={onSkip}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF3FA4] to-[#c73570] hover:brightness-110 text-white font-bold text-xs transition-all shadow-lg hover:shadow-[#FF3FA4]/30 cursor-pointer"
        >
          <span>ENTER CAMPUS</span>
          <FastForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
