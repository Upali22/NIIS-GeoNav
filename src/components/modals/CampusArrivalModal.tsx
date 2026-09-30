import React from 'react';
import { 
  Sparkles, 
  Compass, 
  MapPin, 
  ArrowRight, 
  X, 
  Navigation, 
  Building2, 
  GraduationCap, 
  Coffee, 
  Car, 
  DoorOpen, 
  Search, 
  Accessibility, 
  Bot, 
  Home, 
  Layers
} from 'lucide-react';
import { BuildingData } from '../../types';

interface CampusArrivalModalProps {
  isOpen: boolean;
  buildings: BuildingData[];
  onGuideMe: () => void;
  onExplore: () => void;
  onSelectDestination: (buildingId: string) => void;
  onOpenSearch: () => void;
  onOpenAI: () => void;
  onToggleAccessible: () => void;
  onClose: () => void;
}

export const CampusArrivalModal: React.FC<CampusArrivalModalProps> = ({
  isOpen,
  buildings,
  onGuideMe,
  onExplore,
  onSelectDestination,
  onOpenSearch,
  onOpenAI,
  onToggleAccessible,
  onClose
}) => {
  if (!isOpen) return null;

  // Key primary destinations for arrival cards
  const arrivalDestinations = [
    { id: 'main-gate', name: 'Main Gate', code: 'GATE-01', category: 'gate', icon: MapPin },
    { id: 'block-a', name: 'Block A (Main Admin)', code: 'BLK-A', category: 'academic', icon: Building2 },
    { id: 'block-b', name: 'Block B (Academic Wing)', code: 'BLK-B', category: 'academic', icon: GraduationCap },
    { id: 'block-c', name: 'Block C (CS & Library)', code: 'BLK-C', category: 'academic', icon: Layers },
    { id: 'block-d', name: 'Block D (Management)', code: 'BLK-D', category: 'academic', icon: Building2 },
    { id: 'block-e', name: 'Block E (Auditorium)', code: 'BLK-E', category: 'academic', icon: Building2 },
    { id: 'parking', name: 'Campus Parking', code: 'PKG-01', category: 'parking', icon: Car },
    { id: 'sai-temple', name: 'Sai Temple', code: 'TEMPLE', category: 'religious', icon: Sparkles },
    { id: 'nescafe', name: 'Nescafe Cafe', code: 'CAFE', category: 'dining', icon: Coffee },
    { id: 'niis-canteen', name: 'NIIS Canteen', code: 'CANTEEN', category: 'dining', icon: Coffee },
    { id: 'common-washroom', name: 'Washrooms', code: 'AMN-WR', category: 'amenity', icon: DoorOpen },
    { id: 'hostel-1', name: 'Hostels', code: 'HOSTELS', category: 'hostel', icon: Home }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl p-5 sm:p-8 shadow-2xl border border-white/20 text-center overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Decorative background aura */}
        <div className="absolute -top-24 -left-24 w-52 h-52 rounded-full bg-[#FF3FA4]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 rounded-full bg-[#00f0ff]/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl glass-panel text-white/50 hover:text-white transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Section */}
        <div className="shrink-0 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E9B95F] text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5 text-[#E9B95F]" />
            <span>NIIS Campus · Sarada Vihar, Madanpur</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display mb-1">
            Welcome to NIIS Campus
          </h1>

          <p className="text-sm sm:text-base text-[#FF72BD] font-semibold max-w-md mx-auto">
            May I help you reach somewhere?
          </p>
        </div>

        {/* Scrollable Middle Area: Quick Actions & Quick Destination Cards */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-left">
          {/* Quick Action Badges */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-2 font-bold">
              QUICK CAMPUS DIRECTORY ACTIONS
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => { onClose(); onOpenSearch(); }}
                className="p-2.5 rounded-2xl glass-panel-subtle hover:bg-white/10 border border-white/5 hover:border-[#FF3FA4]/40 flex items-center gap-2.5 text-xs text-white cursor-pointer transition-all"
              >
                <Search className="w-4 h-4 text-[#FF3FA4] shrink-0" />
                <span className="truncate font-semibold">Find Building</span>
              </button>

              <button
                onClick={() => { onClose(); onOpenSearch(); }}
                className="p-2.5 rounded-2xl glass-panel-subtle hover:bg-white/10 border border-white/5 hover:border-[#00f0ff]/40 flex items-center gap-2.5 text-xs text-white cursor-pointer transition-all"
              >
                <GraduationCap className="w-4 h-4 text-[#00f0ff] shrink-0" />
                <span className="truncate font-semibold">Find Classroom</span>
              </button>

              <button
                onClick={() => { onClose(); onOpenSearch(); }}
                className="p-2.5 rounded-2xl glass-panel-subtle hover:bg-white/10 border border-white/5 hover:border-[#E9B95F]/40 flex items-center gap-2.5 text-xs text-white cursor-pointer transition-all"
              >
                <Building2 className="w-4 h-4 text-[#E9B95F] shrink-0" />
                <span className="truncate font-semibold">Find Faculty</span>
              </button>

              <button
                onClick={() => { onClose(); onOpenAI(); }}
                className="p-2.5 rounded-2xl glass-panel-subtle hover:bg-white/10 border border-white/5 hover:border-[#FF3FA4]/40 flex items-center gap-2.5 text-xs text-white cursor-pointer transition-all"
              >
                <Bot className="w-4 h-4 text-[#FF3FA4] shrink-0" />
                <span className="truncate font-semibold">Ask GeoNav AI</span>
              </button>
            </div>
          </div>

          {/* Quick Destination Cards Grid (Part 15) */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block mb-2 font-bold">
              POPULAR ARRIVAL DESTINATIONS (SELECT TO ROUTE)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {arrivalDestinations.map(item => {
                const Icon = item.icon;
                const bld = buildings.find(b => b.id === item.id) || buildings[0];
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectDestination(item.id);
                      onClose();
                    }}
                    className="p-2.5 rounded-2xl glass-panel-subtle hover:bg-white/10 border border-white/5 hover:border-[#00f0ff]/40 text-left flex items-start gap-2.5 cursor-pointer transition-all group"
                  >
                    <div className="p-1.5 rounded-xl bg-white/5 text-[#00f0ff] group-hover:scale-110 transition-transform shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-[#00f0ff]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] font-mono text-[#E9B95F] font-bold">{item.code}</div>
                      <div className="text-xs font-bold text-white truncate">{item.name}</div>
                      <div className="text-[10px] text-white/50 capitalize truncate mt-0.5">
                        {bld?.category || item.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer CTAs (Part 16: Explore Campus / Start Navigation / Replay) */}
        <div className="shrink-0 mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onGuideMe}
            className="text-xs text-white/50 hover:text-white flex items-center gap-1 font-mono transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-[#E9B95F]" />
            <span>Replay Cinematic Flight</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onToggleAccessible();
              }}
              className="py-2.5 px-4 rounded-xl glass-panel text-[#00f0ff] hover:bg-white/10 text-xs font-semibold flex items-center gap-1.5 border border-[#00f0ff]/30 cursor-pointer transition-all"
            >
              <Accessibility className="w-3.5 h-3.5" />
              <span>Accessible Route</span>
            </button>

            <button
              onClick={onExplore}
              className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#FF3FA4] to-[#c73570] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FF3FA4]/20 cursor-pointer transition-all active:scale-98"
            >
              <span>EXPLORE 3D CAMPUS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
