import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Bookmark, 
  History, 
  Settings, 
  LogOut, 
  LogIn, 
  UserPlus, 
  ChevronDown, 
  GraduationCap, 
  Sun, 
  Moon, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { UserProfile } from '../../types';

interface AccountDropdownProps {
  currentUser: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
  onOpenAdmin: () => void;
}

export const AccountDropdown: React.FC<AccountDropdownProps> = ({
  currentUser,
  onOpenAuth,
  onSelectTab,
  onLogout,
  onToggleTheme,
  isDarkMode,
  onOpenAdmin
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Account / Profile Header Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF3FA4] to-[#c73570] text-white text-xs font-semibold hover:brightness-110 transition-all shadow-md cursor-pointer shrink-0"
        title="Student Account / Profile"
      >
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <User className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="hidden md:inline font-bold">
          {currentUser ? currentUser.fullName.split(' ')[0] : 'Account'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 top-12 z-50 w-72 glass-panel rounded-2xl p-3 shadow-2xl border border-white/20 backdrop-blur-2xl animate-fade-in text-xs text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {currentUser ? (
            /* Logged-In Student View */
            <div className="space-y-1">
              {/* User Bio Header */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF3FA4] to-[#E9B95F] p-0.5 shrink-0">
                    <div className="w-full h-full rounded-full bg-[#171019] flex items-center justify-center font-bold text-xs text-white">
                      {currentUser.fullName.charAt(0)}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white truncate text-xs">{currentUser.fullName}</div>
                    <div className="text-[10px] text-white/50 truncate font-mono">{currentUser.email}</div>
                    <div className="text-[9px] text-[#00f0ff] font-mono mt-0.5 truncate">
                      {currentUser.department}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <button
                onClick={() => { onSelectTab('account'); setIsOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer text-left"
              >
                <User className="w-4 h-4 text-[#FF3FA4]" />
                <span className="font-medium">My Account & Profile</span>
              </button>

              <button
                onClick={() => { onSelectTab('account'); setIsOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer text-left"
              >
                <Bookmark className="w-4 h-4 text-[#E9B95F]" />
                <span className="font-medium">Saved Places</span>
              </button>

              <button
                onClick={() => { onSelectTab('account'); setIsOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer text-left"
              >
                <History className="w-4 h-4 text-[#00f0ff]" />
                <span className="font-medium">Recent Routes & History</span>
              </button>

              <button
                onClick={() => { onToggleTheme(); setIsOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#FF3FA4]" />}
                  <span className="font-medium">Theme: {isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
                <span className="text-[10px] text-white/40 font-mono">Toggle</span>
              </button>

              <div className="pt-1 border-t border-white/10 mt-1">
                <button
                  onClick={() => { onLogout(); setIsOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/20 text-red-300 transition-colors cursor-pointer text-left font-bold"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            /* Guest / Visitor View */
            <div className="space-y-1">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 mb-2">
                <span className="text-[10px] font-mono uppercase text-[#E9B95F] font-bold block mb-1">
                  NIIS STUDENT / VISITOR
                </span>
                <p className="text-[11px] text-white/60 leading-tight">
                  Sign in to save your classroom, hostel, and view your route history.
                </p>
              </div>

              <button
                onClick={() => { onOpenAuth('login'); setIsOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#FF3FA4] to-[#c73570] text-white font-bold transition-all shadow-md cursor-pointer text-left"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Student Portal</span>
              </button>

              <button
                onClick={() => { onOpenAuth('register'); setIsOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer text-left"
              >
                <UserPlus className="w-4 h-4 text-[#00f0ff]" />
                <span className="font-medium">Create New Account</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer text-left"
              >
                <User className="w-4 h-4 text-white/40" />
                <span className="font-medium">Continue as Visitor</span>
              </button>

              <div className="pt-1 border-t border-white/10 mt-1">
                <button
                  onClick={() => { onOpenAdmin(); setIsOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/10 text-[#E9B95F] transition-colors cursor-pointer text-left text-[11px] font-semibold"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Console Login</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
