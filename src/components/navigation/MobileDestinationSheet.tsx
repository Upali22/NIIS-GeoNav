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
  ChevronDown,
  ChevronUp,
  X,
  DoorOpen,
  RotateCcw
} from 'lucide-react';
import { BuildingData, CalculatedRoute, RoomInfo, SavedPlace } from '../../types';
import { getRouteExplanation } from '../../services/navigationEngine';

interface MobileDestinationSheetProps {
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
  onStartNavigation: () => void;
  onStartDemoNavigation: () => void;
  onCancelRoute: () => void;
  savedPlaces?: SavedPlace[];
  onSelectSavedPlace?: (place: SavedPlace) => void;
  recentDestinations?: { id: string; name: string; buildingId: string }[];
  onSelectRecentDestination?: (buildingId: string) => void;
  selectedRoom?: RoomInfo | null;
  onSelectRoom?: (room: RoomInfo | null) => void;
  isSheetOpen: boolean;
  onToggleSheet: () => void;
  onCloseSheet: () => void;
}

export const MobileDestinationSheet: React.FC<MobileDestinationSheetProps> = ({
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
  onStartNavigation,
  onStartDemoNavigation,
  onCancelRoute,
  savedPlaces = [],
  onSelectSavedPlace,
  recentDestinations = [],
  onSelectRecentDestination,
  selectedRoom,
  onSelectRoom,
  isSheetOpen,
  onToggleSheet,
  onCloseSheet
}) => {
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const targetBuilding = buildings.find(b => b.id === toBuildingId);
  const fromBuilding = buildings.find(b => b.id === fromBuildingId);
  const availableRooms = targetBuilding?.rooms || [];

  const quickAccessButtons = [
    { id: 'classrooms', label: 'Classrooms', icon: GraduationCap, targetId: 'block-b' },
    { id: 'hostels', label: 'Hostels', icon: Home, targetId: 'hostel-1' },
    { id: 'canteen', label: 'Canteen', icon: Coffee, targetId: 'niis-canteen' },
    { id: 'library', label: 'Library', icon: BookOpen, targetId: 'block-c' },
    { id: 'temple', label: 'Sai Temple', icon: Sparkles, targetId: 'sai-temple' },
    { id: 'parking', label: 'Parking', icon: Car, targetId: 'parking' },
  ];

  const routeExplanationSteps = activeRoute ? getRouteExplanation(activeRoute) : [];

  return (
    <>
      {/* 1. COLLAPSED COMPACT CARD (Floats above mobile bottom bar) */}
      {!isSheetOpen && (
        <div className="md:hidden fixed bottom-[70px] inset-x-3 z-30 pointer-events-auto animate-slide-up">
          {activeRoute ? (
            /* Active Route Calculated: Compact Mobile Route Card (Requirement 11 & 12) */
            <div className="glass-panel p-3.5 rounded-2xl shadow-2xl border-2 border-[#00f0ff]/50 backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-2 py-0.5 rounded-md bg-[#00f0ff]/20 text-[#00f0ff] font-mono text-[10px] font-bold uppercase shrink-0">
                    {activeRoute.type || 'FASTEST'}
                  </span>
                  <span className="text-xs font-mono font-bold text-white shrink-0">
                    {activeRoute.estimatedMinutes} min
                  </span>
                  <span className="text-white/40 text-xs">·</span>
                  <span className="text-xs font-mono text-white/70 truncate">
                    {activeRoute.totalDistance} m
                  </span>
                </div>

                <button
                  onClick={onToggleSheet}
                  className="p-1 rounded-lg text-white/60 hover:text-white flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                  title="View Route Details"
                >
                  <span>Details</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Destination label */}
              <div className="text-xs font-bold text-white truncate mb-2.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF3FA4] shrink-0" />
                <span className="truncate">To: {activeRoute.toNode.name}</span>
                {selectedRoom && (
                  <span className="text-[#00f0ff] text-[10px] font-mono shrink-0">({selectedRoom.name})</span>
                )}
              </div>

              {/* Action Buttons: Large Touch-friendly START NAVIGATION */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onStartNavigation}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF3FA4] to-[#c73570] hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FF3FA4]/30 cursor-pointer min-h-[44px]"
                >
                  <Navigation className="w-4 h-4 fill-current" />
                  <span>START NAVIGATION</span>
                </button>

                <button
                  onClick={onStartDemoNavigation}
                  className="py-3 px-3.5 rounded-xl glass-panel hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                  title="Demo RPG Simulation Walk"
                >
                  <Play className="w-4 h-4 text-[#E9B95F]" />
                  <span className="hidden sm:inline">Demo</span>
                </button>

                <button
                  onClick={onCancelRoute}
                  className="p-3 rounded-xl glass-panel hover:bg-white/10 text-white/60 hover:text-white cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Clear Route"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Default State: "Find Your Destination" Compact Card (Requirement 8) */
            <div 
              onClick={onToggleSheet}
              className="glass-panel p-3 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-2xl flex items-center justify-between gap-3 cursor-pointer hover:border-[#FF3FA4]/50 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF3FA4] to-[#00f0ff] p-0.5 shrink-0 shadow-md">
                  <div className="w-full h-full bg-[#171019] rounded-[10px] flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-[#FF3FA4]" />
                  </div>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-white block truncate font-display">
                    Find Your Destination
                  </span>
                  <span className="text-[10px] text-white/60 block truncate">
                    Tap to route to classrooms, hostels, canteen & labs
                  </span>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-[#FF3FA4] text-white text-xs font-bold shrink-0 flex items-center gap-1 shadow-md shadow-[#FF3FA4]/20">
                <span>Route</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. EXPANDED MOBILE BOTTOM SHEET (Requirement 8) */}
      {isSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop Blur Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in transition-opacity"
            onClick={onCloseSheet}
          />

          {/* Slide-Up Bottom Sheet Card */}
          <div 
            className="relative w-full max-h-[84vh] glass-panel rounded-t-3xl border-t border-white/25 p-4 pb-12 shadow-2xl backdrop-blur-2xl flex flex-col overflow-y-auto animate-slide-up z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle Bar */}
            <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-3 shrink-0" />

            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF3FA4] to-[#00f0ff] p-0.5 flex items-center justify-center">
                  <div className="w-full h-full bg-[#171019] rounded-[6px] flex items-center justify-center">
                    <Navigation className="w-3.5 h-3.5 text-[#FF3FA4]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white font-display">Find Your Destination</h3>
                  <p className="text-[10px] text-white/50">Point-to-point campus navigation</p>
                </div>
              </div>

              <button
                onClick={onCloseSheet}
                className="p-1.5 rounded-xl glass-panel text-white/60 hover:text-white cursor-pointer"
                aria-label="Close Planner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form: FROM & TO */}
            <div className="space-y-2 mb-3">
              {/* FROM */}
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
                  FROM START POINT
                </label>
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={fromBuildingId}
                    onChange={(e) => onChangeFrom(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl glass-input text-xs font-semibold appearance-none cursor-pointer focus:outline-none focus:border-[#FF3FA4]"
                  >
                    {buildings.map(b => (
                      <option key={b.id} value={b.id} className="bg-[#171019] text-white">
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SWAP BUTTON */}
              <div className="flex justify-center -my-1">
                <button
                  onClick={onSwap}
                  className="p-1.5 rounded-full glass-panel text-white/60 hover:text-white border border-white/10 hover:border-[#FF3FA4] transition-all cursor-pointer shadow-md"
                  title="Swap Start & Destination"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* TO DESTINATION */}
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
                  TO DESTINATION
                </label>
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF3FA4] absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={toBuildingId}
                    onChange={(e) => {
                      onChangeTo(e.target.value);
                      if (onSelectRoom) onSelectRoom(null);
                    }}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl glass-input text-xs font-semibold appearance-none cursor-pointer focus:outline-none focus:border-[#FF3FA4]"
                  >
                    {buildings.map(b => (
                      <option key={b.id} value={b.id} className="bg-[#171019] text-white">
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Room / Floor Selector if available */}
            {availableRooms.length > 0 && (
              <div className="mb-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#00f0ff] font-bold flex items-center gap-1">
                    <DoorOpen className="w-3 h-3" />
                    <span>SPECIFIC ROOM / FLOOR</span>
                  </span>
                  {selectedRoom && (
                    <button
                      onClick={() => onSelectRoom && onSelectRoom(null)}
                      className="text-[10px] text-white/40 hover:text-white underline cursor-pointer"
                    >
                      Clear Room
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
                  {availableRooms.map(r => (
                    <button
                      key={r.id}
                      onClick={() => onSelectRoom && onSelectRoom(r)}
                      className={`p-1.5 rounded-lg text-left text-[11px] transition-all cursor-pointer ${
                        selectedRoom?.id === r.id
                          ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 font-bold'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="truncate">{r.name}</div>
                      <div className="text-[9px] text-white/40">Floor {r.floor}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Accessible Route Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl glass-panel-subtle mb-3">
              <div className="flex items-center gap-2">
                <Accessibility className={`w-4 h-4 ${isAccessibleOnly ? 'text-[#00f0ff]' : 'text-white/40'}`} />
                <div>
                  <span className="text-xs font-bold text-white block">Accessible Route</span>
                  <span className="text-[9px] text-white/50 block">Avoids stairs, prioritizes ramps</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleAccessible}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isAccessibleOnly ? 'bg-[#00f0ff]' : 'bg-white/20'
                }`}
                aria-label="Toggle Accessible Route"
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  isAccessibleOnly ? 'left-5' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Route Choices Tabs (if calculated) */}
            {routeOptions.length > 0 && (
              <div className="mb-3">
                <span className="text-[10px] uppercase font-mono tracking-wider text-white/50 block mb-1 font-bold">
                  ROUTE CHOICES
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {routeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onSelectRouteOption && onSelectRouteOption(opt)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedRouteType === opt.type
                          ? 'bg-gradient-to-tr from-[#FF3FA4]/20 to-[#00f0ff]/20 border-[#FF3FA4] text-white'
                          : 'glass-panel-subtle border-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      <div className="text-[9px] uppercase font-mono font-bold capitalize truncate">
                        {opt.type}
                      </div>
                      <div className="text-xs font-bold">{opt.estimatedMinutes}m</div>
                      <div className="text-[9px] text-white/40 font-mono">{opt.totalDistance}m</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Calculate / Recalculate Route Button */}
            <button
              onClick={() => onCalculateRoute(selectedRouteType, selectedRoom || undefined)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#0099ff] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00f0ff]/20 cursor-pointer min-h-[44px] mb-2.5"
            >
              <Navigation className="w-4 h-4" />
              <span>{activeRoute ? 'UPDATE ROUTE' : 'CALCULATE ROUTE'}</span>
            </button>

            {/* Active Route Overview & Navigation Action */}
            {activeRoute && (
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 mb-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Route Ready:</span>
                  <span className="font-mono text-[#00f0ff] font-bold">
                    {activeRoute.totalDistance} m · ~{activeRoute.estimatedMinutes} min
                  </span>
                </div>

                {/* Primary Start Navigation Button */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      onCloseSheet();
                      onStartNavigation();
                    }}
                    className="py-3 px-3 rounded-xl bg-gradient-to-r from-[#FF3FA4] to-[#c73570] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-[#FF3FA4]/30 cursor-pointer min-h-[44px]"
                  >
                    <Navigation className="w-4 h-4 fill-current" />
                    <span>START LIVE</span>
                  </button>

                  <button
                    onClick={() => {
                      onCloseSheet();
                      onStartDemoNavigation();
                    }}
                    className="py-3 px-3 rounded-xl glass-panel hover:bg-white/10 text-[#E9B95F] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-[#E9B95F]/30 cursor-pointer min-h-[44px]"
                  >
                    <Play className="w-4 h-4" />
                    <span>DEMO WALK</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Destination Pills */}
            <div className="mb-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block mb-1.5 font-bold">
                QUICK CAMPUS DESTINATIONS
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {quickAccessButtons.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onChangeTo(item.targetId);
                        onCalculateRoute(selectedRouteType);
                      }}
                      className="p-2 rounded-xl glass-panel-subtle hover:bg-white/10 text-white/80 hover:text-white flex items-center gap-1.5 text-[11px] cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5 text-[#FF3FA4] shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
