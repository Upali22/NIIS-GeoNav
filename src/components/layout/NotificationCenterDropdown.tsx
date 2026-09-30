import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Navigation, 
  CheckCircle2, 
  Sparkles,
  X
} from 'lucide-react';
import { CampusNotification } from '../../types';

interface NotificationCenterDropdownProps {
  notifications: CampusNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onNavigateToBuilding?: (buildingId: string) => void;
}

export const NotificationCenterDropdown: React.FC<NotificationCenterDropdownProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll,
  onNavigateToBuilding
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: CampusNotification['type']) => {
    switch (type) {
      case 'arrival':
        return <Sparkles className="w-4 h-4 text-[#E9B95F]" />;
      case 'class':
        return <Clock className="w-4 h-4 text-[#00f0ff]" />;
      case 'obstacle':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-[#FF3FA4]" />;
      case 'route':
        return <Navigation className="w-4 h-4 text-blue-400" />;
      case 'destination':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-white/70" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 xl:p-2 rounded-xl glass-panel text-white/70 hover:text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
        title="Notification Center"
      >
        <Bell className="w-4 h-4 shrink-0" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF3FA4] text-white text-[9px] font-mono font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 glass-panel rounded-2xl p-4 shadow-2xl border border-white/20 backdrop-blur-2xl animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-display">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#FF3FA4]/20 text-[#FF72BD] text-[10px] font-mono font-semibold">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-[10px] text-white/50 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-white/40 text-xs">
                  <Bell className="w-6 h-6 mx-auto mb-1 opacity-30" />
                  <span>No notifications right now</span>
                </div>
              ) : (
                notifications.map(item => (
                  <div
                    key={item.id}
                    onClick={() => onMarkAsRead(item.id)}
                    className={`p-2.5 rounded-xl border transition-all text-xs cursor-pointer ${
                      item.read
                        ? 'bg-white/5 border-white/5 opacity-70 hover:opacity-100'
                        : 'glass-panel-subtle border-[#00f0ff]/30 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-white/5 shrink-0 mt-0.5">
                        {getIcon(item.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className={`font-bold truncate ${item.read ? 'text-white/80' : 'text-white'}`}>
                            {item.title}
                          </span>
                          <span className="text-[9px] font-mono text-white/40 shrink-0">
                            {item.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/60 leading-tight">
                          {item.message}
                        </p>

                        {/* Action link if available */}
                        {item.targetBuildingId && onNavigateToBuilding && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToBuilding(item.targetBuildingId!);
                              setIsOpen(false);
                            }}
                            className="mt-1.5 px-2 py-0.5 rounded-md bg-[#FF3FA4]/20 hover:bg-[#FF3FA4]/40 text-[#FF72BD] text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Navigation className="w-2.5 h-2.5" />
                            <span>{item.actionLabel || 'Navigate'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
