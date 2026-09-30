import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  Sun, 
  Moon, 
  User, 
  ShieldCheck, 
  Sparkles, 
  Download,
  ShieldAlert,
  Menu,
  X,
  Building2,
  Coffee,
  GraduationCap,
  Calendar,
  Image as ImageIcon,
  Info,
  Navigation, 
  ChevronRight,
  Play
} from 'lucide-react';
import { UserProfile, CampusNotification } from '../../types';
import { NotificationCenterDropdown } from './NotificationCenterDropdown';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSearchModal: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onSimulateArrival: () => void;
  onOpenEmergency: () => void;
  notifications: CampusNotification[];
  onMarkNotificationRead: (id: string) => void;
  onClearAllNotifications: () => void;
  onNavigateToBuilding?: (buildingId: string) => void;
  networkStatus: 'online' | 'low' | 'offline';
  canInstallPwa?: boolean;
  onInstallPwa?: () => void;
  onToggleAI?: () => void;
  isAIOpen?: boolean;
  onReplayIntro?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearchModal,
  isDarkMode,
  onToggleTheme,
  currentUser,
  onOpenAuth,
  onOpenAdmin,
  onSimulateArrival,
  onOpenEmergency,
  notifications,
  onMarkNotificationRead,
  onClearAllNotifications,
  onNavigateToBuilding,
  networkStatus,
  canInstallPwa = false,
  onInstallPwa,
  onToggleAI: _onToggleAI,
  isAIOpen: _isAIOpen = false,
  onReplayIntro
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: '3D Campus', icon: Compass },
    { id: 'explore', label: 'Explore', icon: Navigation },
    { id: 'buildings', label: 'Buildings', icon: Building2 },
    { id: 'facilities', label: 'Facilities', icon: Coffee },
    { id: 'faculty', label: 'Faculty', icon: GraduationCap },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'about', label: 'About NIIS', icon: Info },
  ];

  const handleSelectTabFromMenu = (tabId: string) => {
    onSelectTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-2 sm:px-4 xl:px-5 2xl:px-8 py-2 transition-colors">
        <div className="w-full max-w-[2560px] mx-auto flex items-center justify-between gap-1.5 sm:gap-2 lg:gap-3 xl:gap-2.5 2xl:gap-4 flex-nowrap">
          {/* Left Zone: Mobile Hamburger (mobile only) + Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Mobile Hamburger Menu Button (Touch-friendly 44px min target) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="xl:hidden p-2 min-w-[40px] min-h-[40px] rounded-xl glass-panel text-white/80 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Open Navigation Menu"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo & Name */}
            <div 
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#FF3FA4] to-[#E9B95F] p-0.5 shadow-lg group-hover:shadow-[#FF3FA4]/40 transition-all duration-300 shrink-0">
                <div className="w-full h-full bg-[#08070B] rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
                  <Compass className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#FF3FA4] group-hover:rotate-45 transition-transform duration-300" />
                </div>
              </div>
              <div className="shrink-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-base xl:text-lg font-black tracking-tight text-white font-display whitespace-nowrap">
                    NIIS <span className="text-[#FF3FA4]">GeoNav</span>
                  </h1>
                  {/* Network Status Dot */}
                  <span 
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      networkStatus === 'online' ? 'bg-emerald-400' : networkStatus === 'low' ? 'bg-amber-400' : 'bg-rose-500'
                    }`} 
                    title={`Connection: ${networkStatus.toUpperCase()}`} 
                  />
                </div>
                <p className="text-[9px] text-white/50 tracking-wider hidden 2xl:block whitespace-nowrap">
                  Your Campus. Your Route. Your Way.
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links (Visible on desktop screens, hidden on mobile) */}
          <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1 text-xs font-semibold text-white/70 shrink-0">
            {navItems.map(tab => (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-2 xl:px-2 2xl:px-2.5 py-1.5 rounded-xl transition-all duration-150 cursor-pointer whitespace-nowrap text-[11px] xl:text-[11px] 2xl:text-xs ${
                  currentTab === tab.id
                    ? 'bg-white/10 text-white font-bold border border-white/15 shadow-sm'
                    : 'hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Desktop Smart Global Search Trigger Input (Hidden on mobile) */}
          <div 
            onClick={onOpenSearchModal}
            className="relative flex-1 min-w-[110px] max-w-[160px] xl:max-w-[180px] 2xl:max-w-xs cursor-pointer group hidden md:block"
          >
            <Search className="absolute left-2.5 xl:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 group-hover:text-[#FF3FA4] transition-colors shrink-0" />
            <div className="w-full pl-8 xl:pl-9 pr-2 xl:pr-3 py-1.5 text-xs rounded-xl glass-input text-white/50 flex items-center justify-between group-hover:border-[#FF3FA4]/70 transition-all">
              <span className="truncate">Search campus...</span>
              <kbd className="hidden 2xl:inline px-1.5 py-0.5 text-[9px] font-mono bg-white/10 rounded text-white/40 border border-white/10 shrink-0">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right Actions Zone: Touch-friendly Controls for Mobile & Desktop */}
          <div className="flex items-center gap-1 sm:gap-1.5 2xl:gap-2 shrink-0 flex-nowrap">
            {/* Mobile Search Icon Button (Compact touch target) */}
            <button
              onClick={onOpenSearchModal}
              className="md:hidden p-2 min-w-[38px] min-h-[38px] rounded-xl glass-panel text-white/70 hover:text-white flex items-center justify-center shrink-0 cursor-pointer"
              title="Search Campus"
              aria-label="Search Campus"
            >
              <Search className="w-4 h-4 text-[#FF3FA4]" />
            </button>

            {/* Feature 8: SOS / Emergency Button */}
            <button
              onClick={onOpenEmergency}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 min-h-[38px] rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap"
              title="Emergency & Safety Points"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="text-[11px] sm:text-xs">SOS</span>
            </button>

            {/* Feature 13: PWA Install App Button */}
            {canInstallPwa && onInstallPwa && (
              <button
                onClick={onInstallPwa}
                className="hidden sm:flex items-center gap-1.5 px-2 xl:px-2.5 py-1.5 min-h-[38px] rounded-xl bg-[#00f0ff]/15 hover:bg-[#00f0ff]/25 border border-[#00f0ff]/30 text-[#00f0ff] text-xs font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap"
                title="Install NIIS GeoNav as App"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xl:inline">Install</span>
              </button>
            )}

            {/* Feature 12: Notification Center */}
            <div className="shrink-0">
              <NotificationCenterDropdown
                notifications={notifications}
                onMarkAsRead={onMarkNotificationRead}
                onClearAll={onClearAllNotifications}
                onNavigateToBuilding={onNavigateToBuilding}
              />
            </div>

            {/* Replay Intro Animation & Loading Music */}
            {onReplayIntro && (
              <button
                onClick={onReplayIntro}
                className="hidden xl:inline-flex items-center gap-1.5 px-2 xl:px-2.5 py-1.5 min-h-[38px] rounded-xl glass-panel text-[11px] font-semibold text-[#FF3FA4] hover:bg-white/10 border border-[#FF3FA4]/30 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
                title="Play Intro Animation & Loading Music"
              >
                <Play className="w-3 h-3 text-[#FF3FA4] fill-current shrink-0" />
                <span>Intro</span>
              </button>
            )}

            {/* Campus Arrival Trigger (Desktop/Tablet) */}
            <button
              onClick={onSimulateArrival}
              className="hidden lg:inline-flex items-center gap-1.5 px-2 xl:px-2.5 py-1.5 min-h-[38px] rounded-xl glass-panel text-[11px] xl:text-[11px] 2xl:text-xs font-semibold text-[#E9B95F] hover:bg-white/10 border border-[#E9B95F]/30 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
              title="Simulate Campus Geofence Arrival"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E9B95F] shrink-0" />
              <span>Campus Arrival</span>
            </button>

            {/* Theme Toggle (Day / Night) */}
            <button
              onClick={onToggleTheme}
              className="p-2 min-w-[38px] min-h-[38px] rounded-xl glass-panel text-white/70 hover:text-white transition-all cursor-pointer shrink-0 flex items-center justify-center"
              title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-[#E9B95F]" /> : <Moon className="w-4 h-4 text-[#FF3FA4]" />}
            </button>

            {/* Admin CMS Portal Trigger (Desktop) */}
            <button
              onClick={onOpenAdmin}
              className="hidden md:flex p-2 min-w-[38px] min-h-[38px] rounded-xl glass-panel text-white/70 hover:text-[#E9B95F] transition-all cursor-pointer shrink-0 items-center justify-center"
              title="Admin CMS Portal"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* User Account / Profile */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-xl bg-gradient-to-r from-[#FF3FA4] to-[#c73570] text-white text-xs font-semibold hover:brightness-110 transition-all shadow-md cursor-pointer shrink-0 whitespace-nowrap"
              title="Student / Faculty Account"
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">
                {currentUser ? currentUser.fullName.split(' ')[0] : 'Sign In'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer / Menu (Requirement 2) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <aside className="fixed inset-y-0 left-0 w-80 max-w-[85vw] glass-panel border-r border-white/20 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-right z-50">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF3FA4] to-[#E9B95F] p-0.5 shadow-md">
                    <div className="w-full h-full bg-[#08070B] rounded-[14px] flex items-center justify-center">
                      <Compass className="w-5 h-5 text-[#FF3FA4]" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white font-display">
                      NIIS <span className="text-[#FF3FA4]">GeoNav</span>
                    </h2>
                    <p className="text-[10px] text-white/50">Campus Navigation Platform</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl glass-panel text-white/60 hover:text-white cursor-pointer"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search Quick Trigger */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSearchModal();
                }}
                className="w-full p-2.5 rounded-2xl glass-input mb-4 text-xs text-white/60 flex items-center gap-2.5 hover:border-[#FF3FA4]/60 transition-all cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#FF3FA4]" />
                <span className="truncate">Search blocks, classrooms, faculty...</span>
              </button>

              {/* Navigation Links (Touch Targets >= 44px) */}
              <div className="space-y-1 mb-6">
                <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 font-bold block px-2 mb-1.5">
                  CAMPUS DIRECTORY
                </span>
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTabFromMenu(item.id)}
                      className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FF3FA4] text-white shadow-md shadow-[#FF3FA4]/30'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#00f0ff]'}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white/80' : 'text-white/30'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Quick Campus Services */}
              <div className="space-y-1 pt-3 border-t border-white/10">
                <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 font-bold block px-2 mb-1.5">
                  SERVICES & CONTROLS
                </span>

                {onReplayIntro && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onReplayIntro();
                    }}
                    className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-2xl text-xs text-[#FF3FA4] hover:bg-[#FF3FA4]/10 transition-colors cursor-pointer font-bold"
                  >
                    <Play className="w-4 h-4 text-[#FF3FA4] fill-current" />
                    <span>Watch Intro Animation</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onSimulateArrival();
                  }}
                  className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-2xl text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#E9B95F]" />
                  <span>Campus Arrival Welcome</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenEmergency();
                  }}
                  className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-2xl text-xs text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Emergency Safety & SOS</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-2xl text-xs text-white/80 hover:text-[#E9B95F] hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#E9B95F]" />
                  <span>Admin Console</span>
                </button>

                <button
                  onClick={() => {
                    onToggleTheme();
                  }}
                  className="w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-2xl text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#FF3FA4]" />}
                    <span>Theme: {isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                  </div>
                  <span className="text-[10px] text-white/40 font-mono">Toggle</span>
                </button>

                {canInstallPwa && onInstallPwa && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onInstallPwa();
                    }}
                    className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-2xl text-xs text-[#00f0ff] hover:bg-[#00f0ff]/10 transition-colors cursor-pointer font-bold"
                  >
                    <Download className="w-4 h-4 text-[#00f0ff]" />
                    <span>Install App on Device</span>
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-white/10 mt-4 text-[11px] text-white/50">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${
                  networkStatus === 'online' ? 'bg-emerald-400' : networkStatus === 'low' ? 'bg-amber-400' : 'bg-rose-500'
                }`} />
                <span className="font-mono uppercase text-[10px] text-white/70">
                  {networkStatus === 'online' ? 'Campus Network Online' : 'Offline Mode Active'}
                </span>
              </div>
              <p className="text-[10px]">Sarada Vihar, Madanpur, Bhubaneswar</p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

