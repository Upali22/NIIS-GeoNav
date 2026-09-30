import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Compass, 
  MapPin, 
  Navigation, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ArrowRight, 
  Globe, 
  Radio, 
  ShieldCheck, 
  Sliders,
  Zap,
  Play,
  RotateCcw
} from 'lucide-react';
import { introAudioEngine } from '../../services/introAudioEngine';

interface WebsiteIntroAnimationProps {
  onComplete: () => void;
  onExplore3DSpace?: () => void;
}

export const WebsiteIntroAnimation: React.FC<WebsiteIntroAnimationProps> = ({
  onComplete,
  onExplore3DSpace
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [equalizerBars, setEqualizerBars] = useState<number[]>([15, 30, 65, 80, 50, 35, 20, 10]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const telemetrySteps = [
    {
      id: 'gps',
      icon: Radio,
      label: 'SATELLITE TELEMETRY LOCK',
      detail: 'Connecting to GPS Geofence · 20.2197° N, 85.7385° E',
      badge: 'SONIC LOCK 99.8%',
      color: 'text-[#00f0ff]'
    },
    {
      id: 'mesh',
      icon: Globe,
      label: 'SPATIAL DIGITAL TWIN',
      detail: 'Synthesizing 19 Campus Buildings & 3D Terrain Mesh',
      badge: '19 BLOCKS SYNCED',
      color: 'text-[#FF3FA4]'
    },
    {
      id: 'routing',
      icon: Navigation,
      label: 'A* PATHFINDING MATRIX',
      detail: 'Calibrating Real Corridors & Multi-Floor Indoor Nodes',
      badge: 'GRAPH ARMED',
      color: 'text-[#E9B95F]'
    },
    {
      id: 'ready',
      icon: ShieldCheck,
      label: 'SYSTEM VERIFIED & OPERATIONAL',
      detail: 'Welcome to NIIS Campus · Sarada Vihar, Bhubaneswar',
      badge: 'POWER SURGE 100%',
      color: 'text-emerald-400'
    }
  ];

  // Trigger surprising power-up sound effect on mount
  useEffect(() => {
    introAudioEngine.setVolume(volume);
    introAudioEngine.playPowerUpSoundEffect();

    const checkUnlocked = () => {
      setIsAudioUnlocked(introAudioEngine.isUnlocked());
    };
    checkUnlocked();

    // 3.5 seconds total loading sequence
    const totalDurationMs = 3500;
    const intervalTimeMs = 30;
    const increment = (intervalTimeMs / totalDurationMs) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          if (!completedRef.current) {
            introAudioEngine.playMilestoneLockSfx(3);
          }
          return 100;
        }
        return next;
      });
    }, intervalTimeMs);

    return () => {
      clearInterval(timer);
      introAudioEngine.stop();
    };
  }, []);

  // Update telemetry steps & trigger futuristic milestone lock sound effects
  useEffect(() => {
    const stepIdx = Math.min(
      telemetrySteps.length - 1,
      Math.floor((progress / 100) * telemetrySteps.length)
    );
    if (stepIdx !== currentStepIndex) {
      setCurrentStepIndex(stepIdx);
      introAudioEngine.playMilestoneLockSfx(stepIdx);
    }

    if (progress >= 100 && !isExiting && !completedRef.current) {
      const autoEnterTimeout = setTimeout(() => {
        handleEnter();
      }, 700);
      return () => clearTimeout(autoEnterTimeout);
    }
  }, [progress, currentStepIndex, isExiting]);

  // Immediately unlock audio on user gesture
  const handleUserInteraction = useCallback(() => {
    introAudioEngine.unlock().then((unlocked) => {
      if (unlocked) {
        setIsAudioUnlocked(true);
      }
    });
  }, []);

  // Interactive Particle & Constellation Background Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes for floating cyber constellations
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.6 + 0.7,
      color: Math.random() > 0.5 ? '#00f0ff' : '#FF3FA4'
    }));

    let radarAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Radar scan beam
      const centerX = width / 2;
      const centerY = height / 2;
      radarAngle += 0.018;

      const scanRadius = Math.min(width, height) * 0.42;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(radarAngle);
      const sweepGrad = ctx.createLinearGradient(0, 0, scanRadius, 0);
      sweepGrad.addColorStop(0, 'rgba(0, 240, 255, 0.28)');
      sweepGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, scanRadius, -0.22, 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Particle network
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 85) {
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.14 * (1 - dist / 85)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      // Update live frequency bars from sound effects
      const freqData = introAudioEngine.getFrequencyData();
      if (freqData && freqData.length > 0) {
        const barCount = 8;
        const step = Math.floor(freqData.length / barCount);
        const bars: number[] = [];
        for (let b = 0; b < barCount; b++) {
          const val = freqData[b * step] || 0;
          bars.push(Math.max(12, Math.round((val / 255) * 100)));
        }
        setEqualizerBars(bars);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Enter Campus Launch Handler
  const handleEnter = () => {
    if (isExiting || completedRef.current) return;
    completedRef.current = true;
    setIsExiting(true);
    introAudioEngine.playSystemOnlineWarpSfx();

    setTimeout(() => {
      onComplete();
    }, 600);
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEnter();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleEnter();
      } else if (e.key === 'm' || e.key === 'M') {
        const muted = introAudioEngine.toggleMute();
        setIsAudioMuted(muted);
      } else if (e.key === 'r' || e.key === 'R') {
        introAudioEngine.playPowerUpSoundEffect();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExiting]);

  const toggleSound = () => {
    introAudioEngine.unlock().then(() => setIsAudioUnlocked(true));
    const muted = introAudioEngine.toggleMute();
    setIsAudioMuted(muted);
    if (!muted) {
      introAudioEngine.playClickSfx();
    }
  };

  const replaySoundEffect = () => {
    introAudioEngine.unlock().then(() => setIsAudioUnlocked(true));
    introAudioEngine.playPowerUpSoundEffect();
  };

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    introAudioEngine.setVolume(newVal);
    if (isAudioMuted && newVal > 0) {
      setIsAudioMuted(false);
      introAudioEngine.toggleMute();
    }
  };

  return (
    <div 
      onClick={handleUserInteraction}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#08070B] overflow-hidden select-none transition-all duration-700 ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      role="dialog"
      aria-label="NIIS GeoNav Intro Animation with Loading Sound Effect"
    >
      {/* Background Interactive Particle Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-0" 
      />

      {/* Cyber Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 63, 164, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 240, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Radial Neon Atmospheric Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#FF3FA4]/20 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#00f0ff]/20 blur-[130px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#E9B95F]/10 blur-[120px] pointer-events-none" />

      {/* Top Header Bar: Telemetry Status, Sound Effect Controls, Skip Button */}
      <div className="absolute top-3 sm:top-6 inset-x-3 sm:inset-x-8 flex items-center justify-between z-20 pointer-events-auto">
        {/* Brand System Tag */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl glass-panel border border-white/10">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-mono tracking-widest text-white/70 uppercase font-semibold">
            NIIS GEONAV CORE v2.4
          </span>
        </div>

        {/* Loading Sound Effect Controls & Skip Button */}
        <div className="flex items-center gap-2">
          {/* Sound Effect HUD Pill */}
          <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl glass-panel border border-white/15 backdrop-blur-xl">
            {/* Live Audio Reactive Equalizer Bars */}
            <div className="flex items-end gap-0.5 h-4 w-7 sm:w-8 px-0.5">
              {equalizerBars.map((heightPct, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-full transition-all duration-75"
                  style={{
                    height: isAudioMuted ? '2px' : `${Math.max(12, heightPct)}%`,
                    backgroundColor: idx % 2 === 0 ? '#00f0ff' : '#FF3FA4',
                    opacity: isAudioMuted ? 0.3 : 0.95
                  }}
                />
              ))}
            </div>

            {/* Sound Effect Status Badge */}
            <div className="hidden md:flex flex-col text-left pr-2">
              <span className="text-[9px] font-mono uppercase text-[#00f0ff] tracking-wider flex items-center gap-1 font-bold">
                <Zap className="w-2.5 h-2.5 text-[#00f0ff] fill-current" />
                POWER-UP SFX
              </span>
              <span className="text-[11px] font-mono font-medium text-white/90">
                Quantum Boot FX
              </span>
            </div>

            {/* Replay Sound Effect Trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                replaySoundEffect();
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#00f0ff] hover:text-white transition-colors cursor-pointer"
              title="Replay Power-Up Sound Effect (Press R)"
              aria-label="Replay Sound Effect"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Mute / Unmute Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSound();
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              title={isAudioMuted ? 'Unmute Sound Effects (Press M)' : 'Mute Sound Effects (Press M)'}
              aria-label="Toggle Sound"
            >
              {isAudioMuted ? (
                <VolumeX className="w-4 h-4 text-white/40" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#FF3FA4]" />
              )}
            </button>

            {/* Volume Popover Trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVolumeSlider(!showVolumeSlider);
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer hidden sm:block"
              title="Adjust SFX Volume"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* Inline Volume Slider Popover */}
            {showVolumeSlider && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute top-12 right-24 bg-[#0d0b14] border border-white/20 p-2.5 rounded-xl shadow-2xl flex items-center gap-2 z-30"
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-24 accent-[#FF3FA4] cursor-pointer"
                />
                <span className="text-[10px] font-mono text-white/70 w-7">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Quick Skip Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEnter();
            }}
            className="px-3.5 py-2 rounded-xl glass-panel text-xs font-mono text-white/70 hover:text-white hover:border-[#FF3FA4]/50 transition-all cursor-pointer border border-white/10 flex items-center gap-1.5"
            title="Skip Intro (Press Esc)"
          >
            <span>Skip</span>
            <span className="text-[#FF3FA4]">➔</span>
          </button>
        </div>
      </div>

      {/* Center Cinematic Showcase Card */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-4 sm:px-6 py-4 text-center flex flex-col items-center justify-center">
        
        {/* 3D Holographic Gyroscope Emblem */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-5 flex items-center justify-center">
          {/* Outer Dashed Orbit Ring 1 */}
          <div 
            className="absolute inset-0 rounded-full border border-dashed border-[#FF3FA4]/60 animate-spin"
            style={{ animationDuration: '9s' }}
          />

          {/* Middle Counter-Rotating Glow Ring 2 */}
          <div 
            className="absolute inset-2 sm:inset-3 rounded-full border border-[#00f0ff]/50 animate-spin"
            style={{ animationDuration: '6s', animationDirection: 'reverse' }}
          />

          {/* Inner Golden Reticle Ring 3 */}
          <div className="absolute inset-5 sm:inset-6 rounded-full border border-[#E9B95F]/40 overflow-hidden flex items-center justify-center">
            <div 
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#00f0ff]/20 to-[#FF3FA4]/30 rounded-full animate-spin"
              style={{ animationDuration: '3.2s' }}
            />
          </div>

          {/* Central Glowing Compass Core */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#FF3FA4] to-[#E9B95F] p-0.5 shadow-2xl shadow-[#FF3FA4]/50 animate-pulse">
            <div className="w-full h-full bg-[#08070B] rounded-[14px] flex items-center justify-center">
              <Compass className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF3FA4] animate-spin" style={{ animationDuration: '18s' }} />
            </div>
          </div>

          {/* Coordinate Target Crosshairs */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-[#00f0ff] rounded-full" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-[#00f0ff] rounded-full" />
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-2 bg-[#FF3FA4] rounded-full" />
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-2 bg-[#FF3FA4] rounded-full" />
        </div>

        {/* Institution Brand Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2">
          <Sparkles className="w-3 h-3 text-[#E9B95F]" />
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#E9B95F] font-bold">
            NIIS Group of Institutions · Bhubaneswar
          </span>
        </div>

        {/* Main Title with Cyberpunk Gradient */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display mb-1 drop-shadow-xl">
          NIIS <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF3FA4] via-[#ff72bd] to-[#00f0ff]">GeoNav</span>
        </h1>

        <p className="text-xs sm:text-sm text-white/70 max-w-sm mx-auto leading-relaxed mb-4 font-light">
          Your Campus. Your Route. Your Way.
        </p>

        {/* Autoplay unlock notice if browser requires user gesture */}
        {!isAudioUnlocked && (
          <div className="mb-3 px-3.5 py-2 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff] text-[11px] font-mono flex items-center gap-2 animate-bounce shadow-lg shadow-[#00f0ff]/10">
            <Zap className="w-3.5 h-3.5 fill-current text-[#00f0ff]" />
            <span>Tap anywhere to unleash boot sound effect</span>
          </div>
        )}

        {/* Telemetry Sensor Progress Card */}
        <div className="w-full glass-panel rounded-2xl p-4 mb-5 border border-white/15 backdrop-blur-2xl shadow-2xl text-left">
          {/* Header Status & Percentage */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {React.createElement(telemetrySteps[currentStepIndex].icon, {
                className: `w-4 h-4 ${telemetrySteps[currentStepIndex].color} animate-pulse`
              })}
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider text-white uppercase truncate">
                {telemetrySteps[currentStepIndex].label}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/70 border border-white/10">
                {telemetrySteps[currentStepIndex].badge}
              </span>
              <span className="text-xs font-mono text-[#00f0ff] font-bold">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          <p className="text-xs text-white/80 font-mono truncate mb-3">
            {telemetrySteps[currentStepIndex].detail}
          </p>

          {/* Progress Bar with Glowing Gradient Cursor */}
          <div className="relative h-2.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-[#00f0ff] via-[#FF3FA4] to-[#E9B95F] rounded-full transition-all duration-75 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/90 blur-[2px] animate-ping" />
            </div>
          </div>

          {/* 4 Phase Milestone Dots */}
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5">
            {telemetrySteps.map((step, idx) => {
              const isDone = (progress / 100) * 4 > idx;
              const isCurrent = currentStepIndex === idx;
              return (
                <div key={step.id} className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full transition-all ${
                    isDone ? 'bg-emerald-400' : isCurrent ? 'bg-[#00f0ff] animate-ping' : 'bg-white/20'
                  }`} />
                  <span className={`text-[9px] font-mono uppercase ${
                    isCurrent ? 'text-white font-bold' : isDone ? 'text-white/60' : 'text-white/30'
                  }`}>
                    P{idx + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: Enter Campus & 3D Planetary Zoom */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEnter();
            }}
            className="w-full flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#FF3FA4] to-[#c73570] hover:brightness-110 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#FF3FA4]/30 cursor-pointer transition-all min-h-[48px]"
          >
            <span>ENTER CAMPUS</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onExplore3DSpace && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExiting(true);
                introAudioEngine.playSystemOnlineWarpSfx();
                setTimeout(() => onExplore3DSpace(), 400);
              }}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl glass-panel text-[#00f0ff] hover:text-white hover:border-[#00f0ff]/50 active:bg-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[48px] border border-[#00f0ff]/30 whitespace-nowrap"
              title="Watch full 3D Earth-to-Campus planetary descent"
            >
              <Globe className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>3D Planetary Zoom</span>
            </button>
          )}
        </div>

        {/* Geodesic Coordinate Stamp Footer */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-mono text-white/50">
          <MapPin className="w-3 h-3 text-[#FF3FA4]" />
          <span>Sarada Vihar, Madanpur · Bhubaneswar, Odisha 752054</span>
        </div>
      </div>
    </div>
  );
};
