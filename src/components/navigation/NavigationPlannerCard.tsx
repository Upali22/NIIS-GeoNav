import React, { useState } from 'react';
import { 
  MapPin, 
  ArrowRight, 
  ArrowUpDown, 
  Accessibility, 
  Clock, 
  Navigation, 
  Play, 
  Layers, 
  CheckCircle2,
  BookOpen,
  Coffee, 
  Home, 
  GraduationCap, 
  Sparkles, 
  Car,
  Footprints,
  Compass,
  HelpCircle,
  Bookmark,
  History,
  X,
  DoorOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BuildingData, CalculatedRoute, RoomInfo, SavedPlace, NavNode, NavEdge } from '../../types';
import { NearMeWidget } from './NearMeWidget';
import { getRouteExplanation } from '../../services/navigationEngine';

interface NavigationPlannerCardProps {
  buildings: BuildingData[];
  selectedBuilding: BuildingData | null;
  fromBuildingId: string;
  toBuildingId: string;
  onChangeFrom: (id: string) => void;
  onChangeTo: (id: string) => void;
  onSwap: () => void;
  isAccessibleOnly: boolean;
  onToggleAccessible: () => void;
  onCalculateRoute: (routeType?: 'fastest' | 'accessible' | 'quiet', targetRoom?: RoomInfo) => void;
  activeRoute: CalculatedRoute | null;
  routeOptions?: CalculatedRoute[];
  selectedRouteType?: 'fastest' | 'accessible' | 'quiet';
  onSelectRouteOption?: (route: CalculatedRoute) => void;
  isNavigating: boolean;
  onStartNavigation: () => void;
  onStartDemoNavigation: () => void;
  onCancelRoute: () => void;
  onQuickSelectCategory: (category: string) => void;
  savedPlaces?: SavedPlace[];
  onSelectSavedPlace?: (place: SavedPlace) => void;
  recentDestinations?: { id: string; name: string; buildingId: string }[];
  onSelectRecentDestination?: (buildingId: string) => void;
  onRemoveRecentDestination?: (id: string) => void;
  onTriggerLostMode?: () => void;
  navNodes: NavNode[];
  navEdges: NavEdge[];
  selectedRoom?: RoomInfo | null;
  onSelectRoom?: (room: RoomInfo | null) => void;
  onClose?: () => void;
  isMobileBottomSheet?: boolean;
}

export const NavigationPlannerCard: React.FC<NavigationPlannerCardProps> = ({
  buildings,
  selectedBuilding,
  fromBuildingId,
  toBuildingId,
  onChangeFrom,
  onChangeTo,
  onSwap,
  isAccessibleOnly,
  onToggleAccessible,
  onCalculateRoute,
  activeRoute,
  routeOptions = [],
  selectedRouteType = 'fastest',
  onSelectRouteOption,
  isNavigating,
  onStartNavigation,
  onStartDemoNavigation,
  onCancelRoute,
  onQuickSelectCategory,
  savedPlaces = [],
  onSelectSavedPlace,
  recentDestinations = [],
  onSelectRecentDestination,
  onRemoveRecentDestination,
  onTriggerLostMode,
  navNodes,
  navEdges,
  selectedRoom,
  onSelectRoom,
  onClose,
  isMobileBottomSheet = false
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);

  const targetBuilding = buildings.find(b => b.id === toBuildingId);
  const availableRooms = targetBuilding?.rooms || [];

  const quickAccessButtons = [
    { id: 'classrooms', label: 'Classrooms', icon: GraduationCap, category: 'academic' },
    { id: 'hostels', label: 'Hostels', icon: Home, category: 'hostel' },
    { id: 'canteen', label: 'Canteen', icon: Coffee, category: 'dining' },
    { id: 'library', label: 'Library', icon: BookOpen, targetId: 'block-c' },
    { id: 'temple', label: 'Temple', icon: Sparkles, targetId: 'sai-temple' },
    { id: 'parking', label: 'Parking', icon: Car, targetId: 'parking' },
  ];

  const routeExplanationSteps = activeRoute ? getRouteExplanation(activeRoute) : [];

  if (isMinimized) {
    return (
      <div className="glass-panel p-3 rounded-2xl flex items-center justify-between gap-3 shadow-2xl border border-white/20 backdrop-blur-xl animate-fade-in w-72">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-[#00f0ff]/20 text-[#00f0ff] flex items-center justify-center shrink-0">
            <Navigation className="w-3.5 h-3.5 fill-current" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white block truncate">Find Destination</span>
            {activeRoute ? (
              <span className="text-[10px] text-[#E9B95F] font-mono block truncate">
                {activeRoute.toNode.name} ({activeRoute.estimatedMinutes} min)
              </span>
            ) : (
              <span className="text-[10px] text-white/40 block truncate">Route Planner</span>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsMinimized(false)}
          className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold shrink-0 cursor-pointer transition-colors"
        >
          Expand
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full transition-all space-y-3.5 ${
      isMobileBottomSheet 
        ? 'p-2 sm:p-4' 
        : 'glass-panel rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/15 backdrop-blur-2xl max-h-[calc(100vh-140px)] overflow-y-auto'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight font-display flex items-center gap-2">
            <span>Find Destination</span>
          </h2>
          <p className="text-[11px] text-white/50">Point-to-point campus navigation</p>
        </div>

        {/* I'm Lost, Accessible, Close & Minimize Controls */}
        <div className="flex items-center gap-1.5">
          {onTriggerLostMode && (
            <button
              onClick={onTriggerLostMode}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
              title="I'm Lost - Auto-locate and guide me"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>I&apos;m Lost</span>
            </button>
          )}

          <button
            onClick={onToggleAccessible}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
              isAccessibleOnly 
                ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 shadow-sm' 
                : 'bg-white/5 text-white/50 hover:text-white'
            }`}
            title="Accessible ramps & barrier-free route"
          >
            <Accessibility className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Accessible</span>
          </button>

          {/* Minimize button (only when not in mobile bottom sheet) */}
          {!isMobileBottomSheet && (
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded-lg glass-panel text-white/40 hover:text-white transition-colors cursor-pointer"
              title="Minimize Panel"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Close button (when provided) */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl glass-panel text-white/50 hover:text-white transition-colors cursor-pointer"
              title="Close"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* From / To Selectors */}
      <div className="relative space-y-2">
        {/* From Input */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl glass-panel-subtle border border-white/10 hover:border-white/20 transition-all">
          <div className="w-7 h-7 rounded-xl bg-[#00f0ff]/20 flex items-center justify-center text-[#00f0ff] shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[9px] uppercase tracking-wider text-white/40 font-mono">FROM</label>
            <select
              value={fromBuildingId}
              onChange={(e) => onChangeFrom(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer truncate"
            >
              {buildings.map(b => (
                <option key={b.id} value={b.id} className="bg-[#171019] text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={onSwap}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full glass-panel border border-white/20 text-white/70 hover:text-white hover:border-[#FF3FA4] hover:scale-110 flex items-center justify-center transition-all cursor-pointer shadow-md"
          title="Swap Start & Destination"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
        </button>

        {/* To Input */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl glass-panel-subtle border border-white/10 hover:border-white/20 transition-all">
          <div className="w-7 h-7 rounded-xl bg-[#FF3FA4]/20 flex items-center justify-center text-[#FF3FA4] shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[9px] uppercase tracking-wider text-white/40 font-mono">TO DESTINATION</label>
            <select
              value={toBuildingId}
              onChange={(e) => {
                onChangeTo(e.target.value);
                if (onSelectRoom) onSelectRoom(null);
              }}
              className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer truncate"
            >
              {buildings.map(b => (
                <option key={b.id} value={b.id} className="bg-[#171019] text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Optional Room Selector for Multi-Floor Buildings (Feature 3) */}
      {availableRooms.length > 0 && (
        <div className="p-2 rounded-xl glass-panel-subtle border border-white/10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase text-white/50 flex items-center gap-1">
              <DoorOpen className="w-3 h-3 text-[#00f0ff]" />
              <span>Specific Room / Floor (Multi-Floor)</span>
            </span>
            {selectedRoom && onSelectRoom && (
              <button
                onClick={() => onSelectRoom(null)}
                className="text-[9px] text-white/40 hover:text-white"
              >
                Clear Room
              </button>
            )}
          </div>
          <select
            value={selectedRoom?.id || ''}
            onChange={(e) => {
              const r = availableRooms.find(rm => rm.id === e.target.value);
              if (onSelectRoom) onSelectRoom(r || null);
            }}
            className="w-full p-1.5 rounded-lg bg-white/5 text-xs text-white focus:outline-none border border-white/10"
          >
            <option value="" className="bg-[#171019] text-white/60">
              Entire Building ({targetBuilding?.name})
            </option>
            {availableRooms.map(rm => (
              <option key={rm.id} value={rm.id} className="bg-[#171019] text-white">
                Floor {rm.floor}: {rm.name} ({rm.roomNumber})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Get Route CTA */}
      <button
        onClick={() => onCalculateRoute(selectedRouteType, selectedRoom || undefined)}
        className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00f0ff] via-[#3b82f6] to-[#FF3FA4] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-[0.98]"
      >
        <span>CALCULATE ROUTE</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Feature 5: Smart Route Options (Fastest, Accessible, Quiet) */}
      {routeOptions.length > 1 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
            ROUTE CHOICES
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {routeOptions.map((opt) => {
              const isSelected = activeRoute?.type === opt.type || (activeRoute && activeRoute.totalDistance === opt.totalDistance);
              return (
                <button
                  key={opt.id || opt.type}
                  onClick={() => onSelectRouteOption && onSelectRouteOption(opt)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#00f0ff]/20 to-[#FF3FA4]/20 border-[#00f0ff] text-white shadow-md'
                      : 'glass-panel-subtle border-white/5 text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase truncate">{opt.title || opt.type}</div>
                  <div className="text-xs font-black font-mono mt-0.5 text-white">{opt.estimatedMinutes}m</div>
                  <div className="text-[9px] text-white/40 font-mono">{opt.totalDistance}m</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Feature 6: Route Summary Explanation */}
      {activeRoute && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#171019] to-[#0d0a11] border border-[#00f0ff]/30 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white font-mono">{activeRoute.estimatedMinutes} min</span>
              <span className="text-xs text-white/50 font-mono">({activeRoute.totalDistance} m)</span>
              <span className="text-[10px] font-semibold text-[#00f0ff] uppercase px-1.5 py-0.5 rounded bg-[#00f0ff]/20 font-mono">
                {activeRoute.title || 'Optimal'}
              </span>
            </div>

            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-[10px] text-white/50 hover:text-white flex items-center gap-1 font-mono"
            >
              <span>Route Plan</span>
              {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Textual Sequential Route Explanation */}
          {showExplanation && routeExplanationSteps.length > 0 && (
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs text-white/80">
              <span className="text-[9px] font-mono text-[#E9B95F] uppercase block font-bold">
                ROUTE PATHWAY
              </span>
              <div className="space-y-1 pl-1">
                {routeExplanationSteps.map((stepText, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px]">
                    <span className="text-[#FF3FA4] font-bold">
                      {idx === routeExplanationSteps.length - 1 ? '●' : '↓'}
                    </span>
                    <span className={idx === routeExplanationSteps.length - 1 ? 'font-bold text-white' : 'text-white/75'}>
                      {stepText}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons: Real Navigation & Demo Walk */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onStartNavigation}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#FF3FA4] to-[#c73570] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>START NAVIGATION</span>
            </button>
            <button
              onClick={onStartDemoNavigation}
              className="py-2 px-3 rounded-xl glass-panel text-[#E9B95F] hover:bg-white/10 text-xs font-semibold flex items-center justify-center gap-1 border border-[#E9B95F]/30 transition-all cursor-pointer"
              title="Demonstrate automated user walk along route"
            >
              <Play className="w-3 h-3 text-[#E9B95F]" />
              <span>DEMO WALK</span>
            </button>
          </div>
        </div>
      )}

      {/* Feature 2: Smart Near Me System */}
      <div className="pt-2 border-t border-white/10">
        <NearMeWidget
          currentFromBuildingId={fromBuildingId}
          buildings={buildings}
          nodes={navNodes}
          edges={navEdges}
          onNavigateToBuilding={(bId) => {
            onChangeTo(bId);
            onCalculateRoute(selectedRouteType);
          }}
        />
      </div>

      {/* Feature 10: Saved Places */}
      {savedPlaces.length > 0 && (
        <div className="pt-2 border-t border-white/10">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#E9B95F] font-bold flex items-center gap-1 mb-1.5">
            <Bookmark className="w-3 h-3" />
            <span>SAVED PLACES</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {savedPlaces.map(sp => (
              <button
                key={sp.id}
                onClick={() => onSelectSavedPlace && onSelectSavedPlace(sp)}
                className="px-2.5 py-1 rounded-xl glass-panel-subtle hover:bg-white/10 text-white/80 hover:text-white text-[11px] font-medium border border-white/5 hover:border-[#E9B95F]/40 flex items-center gap-1 cursor-pointer transition-all"
              >
                <span>{sp.customLabel || sp.buildingName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feature 11: Recent Destinations */}
      {recentDestinations.length > 0 && (
        <div className="pt-2 border-t border-white/10">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1.5">
            RECENT DESTINATIONS
          </span>
          <div className="space-y-1">
            {recentDestinations.slice(0, 4).map(rec => (
              <div
                key={rec.id}
                className="flex items-center justify-between p-1.5 px-2 rounded-xl glass-panel-subtle hover:bg-white/10 text-xs text-white/80 transition-all"
              >
                <button
                  onClick={() => onSelectRecentDestination && onSelectRecentDestination(rec.buildingId)}
                  className="flex items-center gap-2 truncate text-left cursor-pointer flex-1"
                >
                  <History className="w-3 h-3 text-white/40 shrink-0" />
                  <span className="truncate">{rec.name}</span>
                </button>
                {onRemoveRecentDestination && (
                  <button
                    onClick={() => onRemoveRecentDestination(rec.id)}
                    className="p-1 text-white/30 hover:text-white/80"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access Badges Grid */}
      <div className="pt-2 border-t border-white/10">
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2 font-mono">
          QUICK DIRECTORY
        </span>
        <div className="grid grid-cols-3 gap-2">
          {quickAccessButtons.map(btn => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={() => {
                  if (btn.targetId) {
                    onChangeTo(btn.targetId);
                  } else if (btn.category) {
                    onQuickSelectCategory(btn.category);
                  }
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl glass-panel-subtle hover:bg-white/10 hover:border-[#FF3FA4]/40 text-white/70 hover:text-white transition-all text-center cursor-pointer group"
              >
                <Icon className="w-4 h-4 mb-1 text-[#E9B95F] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-medium leading-tight">{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
