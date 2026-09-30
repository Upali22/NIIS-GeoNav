import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Clock, 
  Calendar, 
  Bell, 
  ShieldAlert, 
  PhoneCall, 
  MapPin,
  ExternalLink 
} from 'lucide-react';
import { CampusEvent, Announcement, CampusSettings } from '../../types';

interface LiveCampusInfoProps {
  events: CampusEvent[];
  announcements: Announcement[];
  settings: CampusSettings;
  onSelectEvent?: (e: CampusEvent) => void;
  onOpenAnnouncements?: () => void;
}

export const LiveCampusInfo: React.FC<LiveCampusInfoProps> = ({
  events,
  announcements,
  settings,
  onSelectEvent,
  onOpenAnnouncements
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeEventsCount = events.filter(e => e.status === 'ongoing' || e.status === 'upcoming').length;
  const activeNoticesCount = announcements.filter(a => a.active).length;

  return (
    <div className="w-full glass-panel rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/15 backdrop-blur-2xl transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight font-display">
          Live Campus Info
        </h3>
        <span className="flex items-center gap-1.5 text-[10px] text-[#00f0ff] font-mono">
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
          <span>CONNECTED</span>
        </span>
      </div>

      {/* Weather & Time Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-3.5">
        {/* Weather Card */}
        <div className="p-3 rounded-2xl glass-panel-subtle border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
            <Sun className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-base font-extrabold text-white font-mono leading-none">28°C</div>
            <div className="text-[10px] text-white/50 mt-1">Clear Sky · 11 km/h</div>
          </div>
        </div>

        {/* Campus Clock */}
        <div className="p-3 rounded-2xl glass-panel-subtle border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00f0ff]/20 text-[#00f0ff] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-extrabold text-white font-mono leading-none truncate">
              {timeStr}
            </div>
            <div className="text-[10px] text-white/50 mt-1 truncate">{dateStr}</div>
          </div>
        </div>
      </div>

      {/* Metric Action Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-3.5">
        <div className="p-2 rounded-xl glass-panel-subtle border border-white/5 text-center">
          <Calendar className="w-4 h-4 text-[#FF3FA4] mx-auto mb-1" />
          <div className="text-xs font-bold text-white font-mono">{activeEventsCount}</div>
          <div className="text-[9px] text-white/40">Events</div>
        </div>

        <div className="p-2 rounded-xl glass-panel-subtle border border-white/5 text-center">
          <Bell className="w-4 h-4 text-[#E9B95F] mx-auto mb-1" />
          <div className="text-xs font-bold text-white font-mono">{activeNoticesCount}</div>
          <div className="text-[9px] text-white/40">Notices</div>
        </div>

        {/* Emergency Call Quick Button */}
        <a 
          href={`tel:${settings.emergencyPhone}`}
          className="p-2 rounded-xl glass-panel-subtle border border-red-500/20 hover:bg-red-500/10 text-center transition-colors cursor-pointer group"
          title={`Call Emergency: ${settings.emergencyPhone}`}
        >
          <ShieldAlert className="w-4 h-4 text-red-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
          <div className="text-[10px] font-bold text-red-300">SOS</div>
          <div className="text-[9px] text-white/40">Emergency</div>
        </a>

        {/* Security Desk */}
        <a 
          href={`tel:${settings.securityPhone}`}
          className="p-2 rounded-xl glass-panel-subtle border border-white/5 hover:bg-white/10 text-center transition-colors cursor-pointer group"
          title={`Call Security: ${settings.securityPhone}`}
        >
          <PhoneCall className="w-4 h-4 text-[#00f0ff] mx-auto mb-1 group-hover:scale-110 transition-transform" />
          <div className="text-[10px] font-bold text-white/80">Security</div>
          <div className="text-[9px] text-white/40">Desk</div>
        </a>
      </div>

      {/* Address Line */}
      <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-[#E9B95F] shrink-0" />
          <span className="truncate">{settings.address}, {settings.city} - {settings.pincode}</span>
        </div>
      </div>
    </div>
  );
};
