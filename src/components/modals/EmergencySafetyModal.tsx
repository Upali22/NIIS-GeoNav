import React from 'react';
import { 
  ShieldAlert, 
  PhoneCall, 
  MapPin, 
  Navigation, 
  X, 
  HeartPulse, 
  DoorOpen, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { CampusSettings, BuildingData } from '../../types';

interface EmergencySafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CampusSettings;
  buildings: BuildingData[];
  onNavigateToLocation: (buildingId: string) => void;
}

export const EmergencySafetyModal: React.FC<EmergencySafetyModalProps> = ({
  isOpen,
  onClose,
  settings,
  buildings,
  onNavigateToLocation
}) => {
  if (!isOpen) return null;

  // Clean verified phone checks (only display phone dial button if real configured number exists)
  const hasEmergencyPhone = Boolean(settings.emergencyPhone && settings.emergencyPhone.trim().length > 3);
  const hasSecurityPhone = Boolean(settings.securityPhone && settings.securityPhone.trim().length > 3);

  const emergencyPoints = [
    {
      title: 'Main Gate & Campus Security Control',
      buildingId: 'main-gate',
      description: '24/7 Security Desk, Vehicle Gate Control, Immediate Guard Assistance',
      icon: ShieldAlert,
      badge: 'Security Desk',
      color: 'text-[#00f0ff]'
    },
    {
      title: 'First Aid & Campus Medical Station',
      buildingId: 'block-a',
      description: 'Room A-101 Ground Floor · Doctor, Stretcher, First Aid Kit, Emergency Oxygen',
      icon: HeartPulse,
      badge: 'Medical Care',
      color: 'text-rose-400'
    },
    {
      title: 'Eastern Campus Emergency Exit (Back Gate)',
      buildingId: 'back-gate',
      description: 'Wide vehicle clearance gate connecting to highway and hospital corridor',
      icon: DoorOpen,
      badge: 'Emergency Exit',
      color: 'text-amber-400'
    },
    {
      title: 'Common Restroom & Sanitation Facility',
      buildingId: 'common-washroom',
      description: 'Accessible ramp, sanitizers, and emergency water supply',
      icon: MapPin,
      badge: 'Accessible Restroom',
      color: 'text-emerald-400'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-lg glass-panel rounded-3xl p-4 sm:p-7 shadow-2xl border border-red-500/40 max-h-[90vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl glass-panel text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display">
              Campus Emergency & Safety
            </h2>
            <p className="text-xs text-white/60">
              Verified campus emergency contacts and instant 1-tap navigation to help
            </p>
          </div>
        </div>

        {/* Verified Phone Hotlines - ONLY shown if configured by Admin */}
        {(hasEmergencyPhone || hasSecurityPhone) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
            {hasEmergencyPhone && (
              <a
                href={`tel:${settings.emergencyPhone}`}
                className="p-3 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 flex items-center gap-3 transition-colors cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-red-500/30 flex items-center justify-center text-red-300 group-hover:scale-105 transition-transform">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase text-red-300 font-bold">EMERGENCY SOS</div>
                  <div className="text-xs font-bold text-white truncate">{settings.emergencyPhone}</div>
                </div>
              </a>
            )}

            {hasSecurityPhone && (
              <a
                href={`tel:${settings.securityPhone}`}
                className="p-3 rounded-2xl bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/30 flex items-center gap-3 transition-colors cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#00f0ff]/20 flex items-center justify-center text-[#00f0ff] group-hover:scale-105 transition-transform">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase text-[#00f0ff] font-bold">CAMPUS SECURITY</div>
                  <div className="text-xs font-bold text-white truncate">{settings.securityPhone}</div>
                </div>
              </a>
            )}
          </div>
        )}

        {/* Quick Navigation to Safety Locations */}
        <div className="space-y-2 mb-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
            Instant Route to Safety & Medical Points
          </span>

          {emergencyPoints.map(point => {
            const Icon = point.icon;
            return (
              <div
                key={point.buildingId}
                className="p-3 rounded-2xl glass-panel-subtle border border-white/5 hover:border-white/20 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-xl bg-white/5 ${point.color} shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{point.title}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-mono shrink-0">
                        {point.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/50 truncate mt-0.5">
                      {point.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onNavigateToLocation(point.buildingId);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#FF3FA4] hover:bg-[#FF3FA4]/90 text-white font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer transition-all"
                >
                  <Navigation className="w-3.5 h-3.5 fill-current" />
                  <span>Route</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-3 border-t border-white/10 text-center text-[10px] text-white/40">
          In severe life-threatening emergencies, call national emergency services 112 immediately.
        </div>
      </div>
    </div>
  );
};
