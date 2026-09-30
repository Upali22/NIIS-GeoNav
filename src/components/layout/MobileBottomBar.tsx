import React from 'react';
import { Compass, Navigation, Building2, Sparkles, User } from 'lucide-react';

interface MobileBottomBarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAI: () => void;
  onOpenAccount: () => void;
  onOpenDirections: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAI,
  onOpenAccount,
  onOpenDirections
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/20 px-2 pt-1.5 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] backdrop-blur-2xl">
      <div className="flex items-center justify-around">
        {/* 3D Campus / Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] transition-colors cursor-pointer ${
            activeTab === 'home' ? 'text-[#FF3FA4] font-bold' : 'text-white/60 hover:text-white'
          }`}
          aria-label="3D Campus"
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] uppercase tracking-wider font-semibold">Campus</span>
        </button>

        {/* Route / Directions Planner */}
        <button
          onClick={onOpenDirections}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] transition-colors cursor-pointer ${
            activeTab === 'directions' ? 'text-[#00f0ff] font-bold' : 'text-white/60 hover:text-[#00f0ff]'
          }`}
          aria-label="Campus Route Planner"
        >
          <Navigation className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] uppercase tracking-wider font-semibold">Route</span>
        </button>

        {/* Places / Buildings */}
        <button
          onClick={() => onSelectTab('buildings')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] transition-colors cursor-pointer ${
            activeTab === 'buildings' ? 'text-[#FF3FA4] font-bold' : 'text-white/60 hover:text-white'
          }`}
          aria-label="Campus Places"
        >
          <Building2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] uppercase tracking-wider font-semibold">Places</span>
        </button>

        {/* AI Assistant */}
        <button
          onClick={onOpenAI}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] text-white/60 hover:text-[#E9B95F] active:text-[#E9B95F] transition-colors cursor-pointer"
          aria-label="AI Assistant"
        >
          <Sparkles className="w-5 h-5 mb-0.5 text-[#E9B95F]" />
          <span className="text-[10px] uppercase tracking-wider font-semibold">AI</span>
        </button>

        {/* Account / Profile */}
        <button
          onClick={onOpenAccount}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] transition-colors cursor-pointer ${
            activeTab === 'account' ? 'text-[#FF3FA4] font-bold' : 'text-white/60 hover:text-white'
          }`}
          aria-label="Student / Teacher Account"
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] uppercase tracking-wider font-semibold">Account</span>
        </button>
      </div>
    </div>
  );
};
