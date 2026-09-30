import React, { useState } from 'react';
import { CampusEvent, BuildingData } from '../../types';
import { Calendar, Clock, MapPin, Users, Navigation, Sparkles, Tag } from 'lucide-react';

interface EventsPageProps {
  events: CampusEvent[];
  buildings: BuildingData[];
  onNavigateToVenue?: (venue: string) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({
  events,
  buildings,
  onNavigateToVenue
}) => {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'upcoming' | 'completed'>('ongoing');

  const filtered = events.filter(e => e.status === activeTab);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9B95F]/15 border border-[#E9B95F]/30 text-[#E9B95F] text-xs font-semibold mb-3">
          <Calendar className="w-3.5 h-3.5" />
          <span>Campus Happenings & Programs</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
          Events & Programs
        </h1>
        <p className="text-sm text-white/60 mt-2">
          Hackathons, technological symposiums, cultural celebrations, and workshops hosted across NIIS Campus.
        </p>
      </div>

      {/* Status Segmented Tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none px-1">
        {(['ongoing', 'upcoming', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-[#FF3FA4] to-[#c73570] text-white shadow-lg shadow-[#FF3FA4]/30'
                : 'glass-panel text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab} Programs ({events.filter(e => e.status === tab).length})
          </button>
        ))}
      </div>

      {/* Events List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-white/10 text-white/40 text-xs">
          No {activeTab} programs currently scheduled.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(event => (
            <div 
              key={event.id}
              className="glass-panel rounded-3xl overflow-hidden border border-white/15 shadow-2xl flex flex-col justify-between group hover:border-[#FF3FA4]/40 transition-all duration-300"
            >
              <div>
                {/* Banner Image */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={event.bannerImage}
                    alt={event.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[#FF3FA4]/80 text-white text-[10px] font-bold uppercase font-mono tracking-wider backdrop-blur-md">
                      {event.category}
                    </span>
                    {event.status === 'ongoing' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/80 text-white text-[10px] font-bold uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        <span>Live Today</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <h3 className="text-base font-black text-white font-display tracking-tight line-clamp-2 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed line-clamp-3 mb-4">
                    {event.description}
                  </p>

                  <div className="space-y-1.5 text-[11px] text-white/60 font-mono">
                    <div className="flex items-center gap-2 text-[#E9B95F]">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{event.startDate} {event.endDate && event.endDate !== event.startDate ? `to ${event.endDate}` : ''}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 shrink-0 text-[#00f0ff]" />
                      <span>{event.startTime} - {event.endTime}</span>
                    </div>

                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-[#FF3FA4]" />
                      <span className="truncate">{event.venue}</span>
                    </div>

                    <div className="flex items-center gap-2 truncate text-white/40">
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Org: {event.organizer}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {onNavigateToVenue && (
                <div className="p-5 pt-0">
                  <button
                    onClick={() => onNavigateToVenue(event.venue)}
                    className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-[#FF3FA4]/20 border border-white/15 hover:border-[#FF3FA4]/40 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#FF3FA4]" />
                    <span>Navigate to Venue</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
