import React, { useState } from 'react';
import { 
  MapPin, 
  Bell, 
  Mic, 
  ShieldCheck, 
  ArrowRight, 
  Compass, 
  CheckCircle2,
  X
} from 'lucide-react';

interface PermissionOnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const PermissionOnboardingModal: React.FC<PermissionOnboardingModalProps> = ({
  isOpen,
  onComplete
}) => {
  const [requesting, setRequesting] = useState(false);

  if (!isOpen) return null;

  const handleGrantPermissions = async () => {
    setRequesting(true);

    // 1. Geolocation
    if ('geolocation' in navigator) {
      try {
        await new Promise((res) => {
          navigator.geolocation.getCurrentPosition(res, res, { timeout: 4000 });
        });
      } catch (e) {}
    }

    // 2. Notifications
    if ('Notification' in window) {
      try {
        await Notification.requestPermission();
      } catch (e) {}
    }

    // 3. Microphone (optional check)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      } catch (e) {}
    }

    localStorage.setItem('niis_permissions_onboarded', 'true');
    setRequesting(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('niis_permissions_onboarded', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/20 text-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-[#FF3FA4]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-[#00f0ff]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF3FA4] to-[#00f0ff] p-0.5 mx-auto mb-4 shadow-xl shadow-[#FF3FA4]/20">
          <div className="w-full h-full bg-[#08070B] rounded-[14px] flex items-center justify-center text-[#FF3FA4]">
            <Compass className="w-7 h-7" />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white font-display mb-1.5">
          Welcome to NIIS GeoNav
        </h2>
        <p className="text-xs text-white/60 mb-5 max-w-xs mx-auto">
          To provide seamless campus guidance and turn-by-turn routing, we request the following permissions:
        </p>

        {/* Permission List */}
        <div className="space-y-2.5 text-left mb-6">
          <div className="p-3 rounded-2xl glass-panel-subtle border border-white/5 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#00f0ff]/15 text-[#00f0ff] shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Campus Location</div>
              <div className="text-[11px] text-white/60">
                For accurate campus positioning, turn-by-turn navigation, and nearest facility finder.
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl glass-panel-subtle border border-white/5 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#E9B95F]/15 text-[#E9B95F] shrink-0 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Navigation Notifications</div>
              <div className="text-[11px] text-white/60">
                For campus arrival alerts, upcoming class reminders, and destination reached updates.
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl glass-panel-subtle border border-white/5 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#FF3FA4]/15 text-[#FF3FA4] shrink-0 mt-0.5">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Voice & Assistant</div>
              <div className="text-[11px] text-white/60">
                For hands-free speech input with GeoNav AI and spoken turn-by-turn instructions.
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleGrantPermissions}
            disabled={requesting}
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#FF3FA4] via-[#c73570] to-[#E9B95F] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#FF3FA4]/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {requesting ? (
              <span>REQUESTING PERMISSIONS...</span>
            ) : (
              <>
                <span>GRANT PERMISSIONS & CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            onClick={handleSkip}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            Continue as Guest without Permissions
          </button>
        </div>
      </div>
    </div>
  );
};
