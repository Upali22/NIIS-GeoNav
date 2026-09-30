import React from 'react';
import { 
  ArrowUp, 
  ArrowUpRight, 
  ArrowUpLeft, 
  CornerUpRight, 
  CornerUpLeft, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  X, 
  Compass, 
  Navigation,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { CalculatedRoute, RouteStep } from '../../types';

interface TurnByTurnActiveCardProps {
  route: CalculatedRoute;
  currentStepIndex: number;
  remainingDistance: number;
  remainingMinutes: number;
  isOffRoute: boolean;
  isVoiceEnabled: boolean;
  onToggleVoice: () => void;
  onEndNavigation: () => void;
  onRecenter: () => void;
  isDemoMode: boolean;
}

export const TurnByTurnActiveCard: React.FC<TurnByTurnActiveCardProps> = ({
  route,
  currentStepIndex,
  remainingDistance,
  remainingMinutes,
  isOffRoute,
  isVoiceEnabled,
  onToggleVoice,
  onEndNavigation,
  onRecenter,
  isDemoMode
}) => {
  const currentStep = route.steps[currentStepIndex] || route.steps[0];
  const isLast = currentStepIndex >= route.steps.length - 1;

  // Choose appropriate arrow icon
  const getActionIcon = (action: RouteStep['action']) => {
    switch (action) {
      case 'turn-left':
        return <CornerUpLeft className="w-6 h-6 sm:w-8 sm:h-8 text-[#00f0ff]" />;
      case 'turn-right':
        return <CornerUpRight className="w-6 h-6 sm:w-8 sm:h-8 text-[#00f0ff]" />;
      case 'slight-left':
        return <ArrowUpLeft className="w-6 h-6 sm:w-8 sm:h-8 text-[#00f0ff]" />;
      case 'slight-right':
        return <ArrowUpRight className="w-6 h-6 sm:w-8 sm:h-8 text-[#00f0ff]" />;
      case 'arrive':
        return <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-[#E9B95F]" />;
      default:
        return <ArrowUp className="w-6 h-6 sm:w-8 sm:h-8 text-[#00f0ff]" />;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto glass-panel rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl border-2 border-[#00f0ff]/40 backdrop-blur-2xl transition-all">
      {/* Off-Route Alert */}
      {isOffRoute && (
        <div className="mb-2 sm:mb-3 px-2.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-between text-xs text-amber-300 animate-pulse">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs">OFF ROUTE: Recalculating path...</span>
          </div>
          <RotateCw className="w-3.5 h-3.5 animate-spin shrink-0" />
        </div>
      )}

      {/* Main Guidance Banner */}
      <div className="flex items-start gap-2.5 sm:gap-4">
        {/* Dynamic Big Direction Icon */}
        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#00f0ff]/20 to-[#FF3FA4]/20 border border-[#00f0ff]/40 flex items-center justify-center shrink-0 shadow-lg">
          {getActionIcon(currentStep.action)}
        </div>

        {/* Text Instructions */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-white/50 truncate">
            {isDemoMode && <span className="text-[#E9B95F] font-bold">DEMO · </span>}
            <span>Step {currentStepIndex + 1} of {route.steps.length}</span>
          </div>

          <h3 className="text-sm sm:text-base xl:text-lg font-black text-white leading-tight font-display my-0.5 sm:my-1 line-clamp-2">
            {currentStep.instruction}
          </h3>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[11px] sm:text-xs font-mono">
            <span className="text-[#00f0ff] font-bold whitespace-nowrap">
              {currentStep.distance > 0 ? `In ${currentStep.distance} m` : 'At destination'}
            </span>
            <span className="text-white/40 hidden sm:inline">·</span>
            <span className="text-white/70 whitespace-nowrap text-[10px] sm:text-xs">
              Remaining: {remainingDistance} m ({remainingMinutes} min)
            </span>
          </div>
        </div>

        {/* Voice Toggle */}
        <button
          onClick={onToggleVoice}
          className={`p-2 sm:p-2.5 min-w-[38px] min-h-[38px] rounded-xl sm:rounded-2xl glass-panel text-white/80 hover:text-white transition-all cursor-pointer shrink-0 flex items-center justify-center ${
            isVoiceEnabled ? 'border-[#00f0ff]/50 text-[#00f0ff]' : 'opacity-50'
          }`}
          title={isVoiceEnabled ? 'Mute Voice Guidance' : 'Enable Voice Guidance'}
          aria-label="Toggle Voice Guidance"
        >
          {isVoiceEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#00f0ff]" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" />}
        </button>
      </div>

      {/* Progress Bar along route */}
      <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-white/10 flex items-center justify-between gap-2.5">
        <div className="flex-1 min-w-0">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#00f0ff] to-[#FF3FA4] transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(5, ((route.totalDistance - remainingDistance) / route.totalDistance) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-white/40 mt-1 font-mono">
            <span className="truncate max-w-[45%]">{route.fromNode.name}</span>
            <span className="truncate max-w-[45%] text-right">{route.toNode.name}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onRecenter}
            className="px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-xl glass-panel text-xs text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-1 transition-all cursor-pointer"
            title="Recenter camera on navigation marker"
          >
            <Navigation className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span className="text-[11px] sm:text-xs">Center</span>
          </button>

          <button
            onClick={onEndNavigation}
            className="px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">End</span>
          </button>
        </div>
      </div>
    </div>
  );
};
