import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Bookmark, 
  Check, 
  Clock, 
  Accessibility, 
  Building2, 
  Layers, 
  Users, 
  Sparkles, 
  DoorOpen,
  ArrowUp,
  ChevronRight,
  Footprints
} from 'lucide-react';
import { BuildingData, RoomInfo } from '../../types';

interface BuildingDetailModalProps {
  building: BuildingData | null;
  onClose: () => void;
  onNavigateHere: (b: BuildingData, targetRoom?: RoomInfo) => void;
  isSaved?: boolean;
  onToggleSave?: (b: BuildingData) => void;
}

export const BuildingDetailModal: React.FC<BuildingDetailModalProps> = ({
  building,
  onClose,
  onNavigateHere,
  isSaved = false,
  onToggleSave
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'floors' | 'facilities'>('overview');
  const [selectedFloor, setSelectedFloor] = useState<number>(1);

  if (!building) return null;

  const totalFloors = building.floors || 1;
  const floorsList = Array.from({ length: totalFloors }, (_, i) => i + 1);

  const roomsOnFloor = (building.rooms || []).filter(r => r.floor === selectedFloor);

  const getTransitionBadge = (trans?: 'stairs' | 'elevator' | 'ramp') => {
    switch (trans) {
      case 'elevator':
        return (
          <span className="flex items-center gap-1 text-[9px] font-mono text-[#00f0ff] bg-[#00f0ff]/15 px-2 py-0.5 rounded-md">
            <span>Elevator</span>
          </span>
        );
      case 'ramp':
        return (
          <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-400/15 px-2 py-0.5 rounded-md">
            <span>Accessible Ramp</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[9px] font-mono text-amber-400 bg-amber-400/15 px-2 py-0.5 rounded-md">
            <span>Staircase</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-5 shadow-2xl border border-white/15 backdrop-blur-2xl transition-all">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-[#FF3FA4]/20 border border-[#FF3FA4]/40 text-[#FF72BD] text-[10px] font-mono font-bold uppercase">
              {building.code}
            </span>
            <span className="text-[11px] text-white/50 capitalize">{building.category}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight font-display truncate">
            {building.name}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onToggleSave && (
            <button
              onClick={() => onToggleSave(building)}
              className={`p-2 rounded-xl glass-panel transition-colors cursor-pointer ${
                isSaved ? 'text-[#E9B95F] border-[#E9B95F]/50 bg-[#E9B95F]/10' : 'text-white/60 hover:text-white'
              }`}
              title={isSaved ? 'Remove from Saved Places' : 'Save Place'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl glass-panel text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-36 w-full rounded-2xl overflow-hidden mb-3 border border-white/10 group">
        <img
          src={building.image}
          alt={building.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <Layers className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>{building.floors} Floors</span>
            {building.rooms && <span>· {building.rooms.length} Rooms</span>}
          </div>
          {building.accessibility && (
            <span className="flex items-center gap-1 text-[10px] text-[#00f0ff] bg-[#00f0ff]/20 px-2 py-0.5 rounded-full border border-[#00f0ff]/30">
              <Accessibility className="w-3 h-3" />
              <span>Accessible</span>
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 mb-3">
        {(['overview', 'floors', 'facilities'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {tab === 'floors' ? 'Floors & Rooms' : tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="text-xs text-white/70 max-h-52 overflow-y-auto pr-1 space-y-2 mb-4">
        {activeTab === 'overview' && (
          <>
            <p className="leading-relaxed text-white/80">{building.description}</p>
            {building.openingHours && (
              <div className="flex items-center gap-2 text-white/60 text-[11px] pt-1">
                <Clock className="w-3.5 h-3.5 text-[#E9B95F]" />
                <span>Hours: {building.openingHours}</span>
              </div>
            )}
            {building.departments && building.departments.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">Departments</span>
                <div className="flex flex-wrap gap-1.5">
                  {building.departments.map(d => (
                    <span key={d} className="px-2 py-0.5 rounded-md bg-white/10 text-white/80 text-[11px]">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {building.details?.architecturalStyle && (
              <div className="text-[11px] text-white/50 pt-1 font-mono">
                Style: {building.details.architecturalStyle}
              </div>
            )}
          </>
        )}

        {/* Feature 3: Multi-Floor & Room Architecture */}
        {activeTab === 'floors' && (
          <div className="space-y-2.5">
            {/* Floor Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {floorsList.map(floorNum => (
                <button
                  key={floorNum}
                  onClick={() => setSelectedFloor(floorNum)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                    selectedFloor === floorNum
                      ? 'bg-gradient-to-r from-[#00f0ff] to-[#3b82f6] text-black font-bold shadow-md'
                      : 'bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  Floor {floorNum}
                </button>
              ))}
            </div>

            {/* Rooms on selected floor */}
            <div className="space-y-1.5">
              {roomsOnFloor.length === 0 ? (
                <div className="text-center py-6 text-white/40 text-xs">
                  No rooms cataloged on Floor {selectedFloor}.
                </div>
              ) : (
                roomsOnFloor.map(room => (
                  <div
                    key={room.id}
                    className="p-2.5 rounded-xl glass-panel-subtle border border-white/5 hover:border-[#00f0ff]/30 flex items-center justify-between gap-2 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono font-bold text-[#00f0ff]">{room.roomNumber}</span>
                        <span className="font-semibold text-white truncate">{room.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-white/50">
                        <span>{room.department}</span>
                        <span>·</span>
                        {getTransitionBadge(room.transitionType)}
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateHere(building, room)}
                      className="px-2.5 py-1 rounded-lg bg-[#00f0ff]/20 hover:bg-[#00f0ff]/30 text-[#00f0ff] font-bold text-[10px] flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                      title="Calculate multi-floor route directly to this room"
                    >
                      <Navigation className="w-2.5 h-2.5" />
                      <span>Route Here</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'facilities' && (
          <div className="grid grid-cols-2 gap-2">
            {building.facilities.map((fac, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-xl glass-panel-subtle border border-white/5 text-[11px] text-white/80">
                <Sparkles className="w-3.5 h-3.5 text-[#FF3FA4] shrink-0" />
                <span className="truncate">{fac}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action CTA */}
      <button
        onClick={() => onNavigateHere(building)}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FF3FA4] to-[#c73570] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FF3FA4]/20 transition-all cursor-pointer"
      >
        <Navigation className="w-4 h-4" />
        <span>NAVIGATE TO BUILDING</span>
      </button>
    </div>
  );
};
