import React from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  Navigation, 
  Clock, 
  ArrowLeft, 
  Sparkles, 
  Coffee, 
  DoorOpen, 
  X, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { BuildingData, CalculatedRoute } from '../../types';

interface DestinationArrivalModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationBuilding: BuildingData | null;
  targetRoomName?: string;
  targetFloor?: number;
  onNavigateNext: (buildingId: string) => void;
  onReturnNavigation: () => void;
  onExploreBuilding: () => void;
}

export const DestinationArrivalModal: React.FC<DestinationArrivalModalProps> = ({
  isOpen,
  onClose,
  destinationBuilding,
  targetRoomName,
  targetFloor,
  onNavigateNext,
  onReturnNavigation,
  onExploreBuilding
}) => {
  if (!isOpen || !destinationBuilding) return null;

  // Next scheduled class / event recommendation simulation
  const nextClassSchedule = {
    subject: 'MCA / BCA Advanced Programming',
    buildingName: 'Block B (Academic Wing)',
    buildingId: 'block-b',
    room: 'Room B-204',
    time: '2:00 PM - 3:30 PM',
    faculty: 'Prof. Upali Patra'
  };

  // Nearby amenities relative to this building
  const nearbyAmenities = [
    { name: 'Common Washrooms', id: 'common-washroom', distance: '45 m', icon: DoorOpen },
    { name: 'Nescafe Campus Cafe', id: 'nescafe', distance: '85 m', icon: Coffee },
    { name: 'Central Digital Library', id: 'block-c', distance: '120 m', icon: BookOpen }
  ].filter(a => a.id !== destinationBuilding.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-lg glass-panel rounded-3xl p-4 sm:p-7 shadow-2xl border border-[#00f0ff]/40 max-h-[90vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#00f0ff]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-[#FF3FA4]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl glass-panel text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Destination Reached Header Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00f0ff] to-[#3b82f6] p-0.5 shadow-lg shadow-[#00f0ff]/30">
            <div className="w-full h-full bg-[#08070B] rounded-[14px] flex items-center justify-center text-[#00f0ff]">
              <CheckCircle2 className="w-7 h-7 animate-pulse" />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00f0ff] font-bold block">
              DESTINATION REACHED
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display">
              Welcome to {destinationBuilding.name}
            </h2>
          </div>
        </div>

        {/* Room / Floor Arrival Banner if specific room was targeted */}
        {targetRoomName && (
          <div className="p-3 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <DoorOpen className="w-5 h-5 text-[#00f0ff]" />
              <div>
                <div className="text-xs font-bold text-white">{targetRoomName}</div>
                <div className="text-[10px] text-white/60">Floor {targetFloor || 1} · Proceed along corridor</div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#00f0ff]/20 text-[#00f0ff]">
              Here
            </span>
          </div>
        )}

        {/* Building Hero Snapshot */}
        <div className="relative h-32 w-full rounded-2xl overflow-hidden mb-4 border border-white/10">
          <img
            src={destinationBuilding.image}
            alt={destinationBuilding.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white">
            <span className="font-mono text-[11px] text-white/90">
              {destinationBuilding.code} · {destinationBuilding.floors} Floors
            </span>
            <span className="text-[10px] text-[#E9B95F] bg-[#E9B95F]/20 px-2 py-0.5 rounded-full border border-[#E9B95F]/30 font-semibold">
              {destinationBuilding.occupancyStatus || 'Open'}
            </span>
          </div>
        </div>

        {/* Next Scheduled Class Recommendation */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#E9B95F] font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>UPCOMING SCHEDULE</span>
            </div>
            <span className="text-[10px] text-white/40">{nextClassSchedule.time}</span>
          </div>
          <p className="text-xs font-semibold text-white">
            {nextClassSchedule.subject} in <span className="text-[#FF3FA4]">{nextClassSchedule.buildingName}</span>
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
            <span className="text-[10px] text-white/50">{nextClassSchedule.room} · {nextClassSchedule.faculty}</span>
            <button
              onClick={() => onNavigateNext(nextClassSchedule.buildingId)}
              className="px-2.5 py-1 rounded-lg bg-[#FF3FA4] hover:bg-[#FF3FA4]/90 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <span>Route to Next Class</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Nearby Facilities */}
        <div className="mb-5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-2">
            Nearby Around This Building
          </span>
          <div className="grid grid-cols-2 gap-2">
            {nearbyAmenities.map(am => {
              const Icon = am.icon;
              return (
                <button
                  key={am.id}
                  onClick={() => onNavigateNext(am.id)}
                  className="p-2 rounded-xl glass-panel-subtle hover:bg-white/10 border border-white/5 text-left flex items-center gap-2 cursor-pointer transition-all group"
                >
                  <Icon className="w-4 h-4 text-[#00f0ff] shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-white truncate">{am.name}</div>
                    <div className="text-[9px] text-white/40">{am.distance} away</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReturnNavigation}
            className="flex-1 py-3 px-4 rounded-2xl glass-panel hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/15 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return Navigation</span>
          </button>

          <button
            onClick={onExploreBuilding}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00f0ff] to-[#3b82f6] hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore Building</span>
          </button>
        </div>
      </div>
    </div>
  );
};
