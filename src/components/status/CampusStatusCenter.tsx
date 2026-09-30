import React, { useState } from 'react';
import { 
  Sun, 
  CloudRain, 
  Wifi, 
  WifiOff, 
  Compass, 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Calendar, 
  Bell, 
  Building2, 
  Activity,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { CampusEvent, Announcement, CampusSettings } from '../../types';

interface CampusStatusCenterProps {
  events: CampusEvent[];
  announcements: Announcement[];
  settings: CampusSettings;
  networkStatus: 'online' | 'low' | 'offline';
  gpsStatus: 'accurate' | 'searching' | 'weak' | 'denied';
  gpsAccuracy?: number;
  onOpenAnnouncements?: () => void;
  onOpenEmergency?: () => void;
}

export const CampusStatusCenter: React.FC<CampusStatusCenterProps> = ({
  events,
  announcements,
  settings,
  networkStatus,
  gpsStatus,
  gpsAccuracy = 4,
  onOpenAnnouncements,
  onOpenEmergency
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const activeEvents = events.filter(e => e.status === 'ongoing' || e.status === 'upcoming');
  const urgentAnnouncements = announcements.filter(a => a.active && a.urgent);

  // Busy buildings status
  const buildingTraffic = [
    { name: 'Block B (Academic)', status: 'Moderate', color: 'text-amber-400' },
    { name: 'NIIS Canteen', status: 'Busy', color: 'text-[#FF3FA4]' },
    { name: 'Central Digital Library', status: 'Quiet', color: 'text-[#00f0ff]' },
  ];

  return (
    <div className="w-full glass-panel rounded-2xl border border-white/15 backdrop-blur-2xl transition-all shadow-xl overflow-hidden pointer-events-auto">
      {/* Collapsed / Summary Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Campus Open Status */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-white font-mono">CAMPUS OPEN</span>
          </div>

          <span className="text-white/20 hidden sm:inline">|</span>

          {/* Weather preview */}
          <div className="flex items-center gap-1.5 text-[11px] text-white/80 shrink-0">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>28°C · Clear</span>
          </div>

          <span className="text-white/20 hidden md:inline">|</span>

          {/* Network and GPS */}
          <div className="hidden md:flex items-center gap-2 text-[10px] font-mono">
            {networkStatus === 'online' ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Wifi className="w-3 h-3" />
                <span>ONLINE</span>
              </span>
            ) : networkStatus === 'low' ? (
              <span className="flex items-center gap-1 text-amber-400">
                <Wifi className="w-3 h-3" />
                <span>LOW NETWORK</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400">
                <WifiOff className="w-3 h-3" />
                <span>OFFLINE (CACHED)</span>
              </span>
            )}

            <span className="text-white/20">·</span>

            {gpsStatus === 'accurate' ? (
              <span className="flex items-center gap-1 text-[#00f0ff]">
                <Compass className="w-3 h-3" />
                <span>GPS ACCURATE (±{gpsAccuracy}m)</span>
              </span>
            ) : gpsStatus === 'searching' ? (
              <span className="flex items-center gap-1 text-amber-400">
                <Compass className="w-3 h-3 animate-spin" />
                <span>GPS SEARCHING...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-white/50">
                <Compass className="w-3 h-3" />
                <span>GPS WEAK</span>
              </span>
            )}
          </div>
        </div>

        {/* Toggle chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-white/50 font-mono hidden sm:inline">
            {isExpanded ? 'Hide Status' : 'Campus Status Center'}
          </span>
          <div className="p-1 rounded-lg bg-white/5 text-white/70">
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>

      {/* Expanded Status Tray */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-white/10 space-y-3 animate-fade-in text-xs">
          {/* Status Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Campus Operational Hours */}
            <div className="p-2.5 rounded-xl glass-panel-subtle border border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50 mb-1">
                <Clock className="w-3 h-3 text-[#00f0ff]" />
                <span>HOURS</span>
              </div>
              <div className="text-xs font-bold text-white">8:30 AM - 6:00 PM</div>
              <div className="text-[9px] text-emerald-400 mt-0.5">● Operating Normally</div>
            </div>

            {/* Weather & Environment */}
            <div className="p-2.5 rounded-xl glass-panel-subtle border border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50 mb-1">
                <Sun className="w-3 h-3 text-amber-400" />
                <span>WEATHER</span>
              </div>
              <div className="text-xs font-bold text-white">28°C · Light Breeze</div>
              <div className="text-[9px] text-white/50 mt-0.5">Humidity: 65% · Sarada Vihar</div>
            </div>

            {/* Temporary Obstacles */}
            <div className="p-2.5 rounded-xl glass-panel-subtle border border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50 mb-1">
                <AlertTriangle className="w-3 h-3 text-emerald-400" />
                <span>OBSTACLES</span>
              </div>
              <div className="text-xs font-bold text-white">None Reported</div>
              <div className="text-[9px] text-emerald-400 mt-0.5">All Pathways Clear</div>
            </div>

            {/* Active Programs */}
            <div className="p-2.5 rounded-xl glass-panel-subtle border border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50 mb-1">
                <Calendar className="w-3 h-3 text-[#FF3FA4]" />
                <span>PROGRAMS</span>
              </div>
              <div className="text-xs font-bold text-white">{activeEvents.length} Active Events</div>
              <div className="text-[9px] text-[#FF3FA4] mt-0.5 truncate">
                {activeEvents[0]?.title || 'Campus Live'}
              </div>
            </div>
          </div>

          {/* Busy Buildings Status */}
          <div className="p-2.5 rounded-xl glass-panel-subtle border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50">
                <Building2 className="w-3 h-3 text-[#E9B95F]" />
                <span>CAMPUS BUILDING TRAFFIC</span>
              </div>
              <span className="text-[9px] text-white/40">Live Sensor Density</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {buildingTraffic.map((bt, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-[11px]">
                  <span className="text-white/80 truncate font-medium">{bt.name}</span>
                  <span className={`font-mono font-bold text-[10px] ${bt.color}`}>{bt.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements Ticker & Emergency Dial Action */}
          <div className="flex items-center justify-between gap-3 pt-1 text-[11px]">
            <div className="flex items-center gap-2 text-white/70 min-w-0">
              <Bell className="w-3.5 h-3.5 text-[#E9B95F] shrink-0" />
              <span className="truncate">
                {urgentAnnouncements[0]?.title || 'Notice: All semester exams will be held as per schedule in Block B & C.'}
              </span>
            </div>

            {onOpenEmergency && (
              <button
                onClick={onOpenEmergency}
                className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-[10px] border border-red-500/40 shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Emergency Help</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
