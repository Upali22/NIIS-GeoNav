import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  Navigation, 
  GraduationCap, 
  Building2, 
  Coffee, 
  Sparkles, 
  Calendar, 
  Image as ImageIcon, 
  ShieldAlert, 
  DoorOpen, 
  Users, 
  Clock, 
  ArrowRight,
  Compass
} from 'lucide-react';
import { 
  BuildingData, 
  FacultyMember, 
  CampusEvent, 
  GalleryItem, 
  SearchResultItem, 
  SearchCategory 
} from '../../types';

interface SmartGlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: BuildingData[];
  faculty: FacultyMember[];
  events: CampusEvent[];
  gallery: GalleryItem[];
  userLocationNodeId?: string;
  onSelectBuilding: (b: BuildingData) => void;
  onNavigateToBuilding: (buildingId: string, roomInfo?: any) => void;
}

export const SmartGlobalSearchModal: React.FC<SmartGlobalSearchModalProps> = ({
  isOpen,
  onClose,
  buildings,
  faculty,
  events,
  gallery,
  onSelectBuilding,
  onNavigateToBuilding
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Build searchable index from all data sources
  const allSearchItems = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = [];

    // 1. Buildings & Blocks
    buildings.forEach(b => {
      const isBlock = b.code.startsWith('BLK');
      items.push({
        id: `bld-${b.id}`,
        name: b.name,
        category: isBlock ? 'block' : 'building',
        categoryLabel: isBlock ? 'Academic Block' : 'Campus Building',
        buildingId: b.id,
        buildingName: b.name,
        locationDetails: `${b.floors} Floors · ${b.facilities.slice(0, 2).join(', ')}`,
        image: b.image,
        tags: [b.code, b.category, ...(b.departments || []), ...(b.facilities || [])],
        rawItem: b
      });

      // 2. Classrooms & Rooms inside buildings
      if (b.rooms && b.rooms.length > 0) {
        b.rooms.forEach(r => {
          items.push({
            id: `room-${r.id}`,
            name: `${r.name} (${r.roomNumber})`,
            category: 'classroom',
            categoryLabel: 'Classroom / Lab',
            buildingId: b.id,
            buildingName: b.name,
            floor: r.floor,
            roomNumber: r.roomNumber,
            locationDetails: `${b.name} · Floor ${r.floor} · ${r.department}`,
            image: b.image,
            tags: [r.roomNumber, r.department, r.name, ...(r.facilities || []), b.name, b.code],
            rawItem: { building: b, room: r }
          });
        });
      }
    });

    // 3. Faculty & Teachers
    faculty.forEach(f => {
      const office = String(f.office ?? '');
      const bld = buildings.find(b => office.toLowerCase().includes(String(b.name ?? '').toLowerCase()) || office.toLowerCase().includes(String(b.code ?? '').toLowerCase())) || buildings[0];
      items.push({
        id: `fac-${f.id}`,
        name: f.name,
        category: 'faculty',
        categoryLabel: f.category === 'leadership' ? 'Campus Leadership' : 'Faculty Member',
        buildingId: bld?.id || '',
        buildingName: office || bld?.name || 'NIIS Campus',
        locationDetails: `${f.designation ?? ''} · ${f.department ?? ''} · Office: ${office}`, 
        image: f.photo,
        tags: [f.designation, f.department, office, f.qualification, 'teacher', 'professor', 'faculty'].filter(Boolean),
        rawItem: f
      });
    });

    // 4. Facilities (Canteen, Washroom, Nescafe, Parking, Temple, Playground)
    buildings.forEach(b => {
      if (['dining', 'amenity', 'sports', 'religious', 'parking'].includes(b.category)) {
        items.push({
          id: `facil-${b.id}`,
          name: b.name,
          category: 'facility',
          categoryLabel: 'Campus Facility',
          buildingId: b.id,
          buildingName: b.name,
          locationDetails: b.description.slice(0, 75) + '...',
          image: b.image,
          tags: [b.category, ...b.facilities, 'near me'],
          rawItem: b
        });
      }
    });

    // 5. Events & Programs
    events.forEach(ev => {
      const venue = String(ev.venue ?? '');
      const bld = buildings.find(b => venue.toLowerCase().includes(String(b.name ?? '').toLowerCase()) || venue.toLowerCase().includes(String(b.code ?? '').toLowerCase())) || buildings.find(b => b.id === 'block-e') || buildings[0];
      items.push({
        id: `ev-${ev.id}`,
        name: ev.title,
        category: 'event',
        categoryLabel: `Event (${ev.category})`,
        buildingId: bld?.id || '',
        buildingName: venue || bld?.name || 'NIIS Campus',
        locationDetails: `${ev.startDate ?? ''} · ${venue} · ${ev.organizer ?? ''}`, 
        image: ev.bannerImage,
        tags: [ev.category, venue, ev.organizer, 'event', 'program', 'hackathon'].filter(Boolean),
        rawItem: ev
      });
    });

    // 6. Gallery Items
    gallery.forEach(g => {
      items.push({
        id: `gal-${g.id}`,
        name: g.title,
        category: 'gallery',
        categoryLabel: 'Campus Gallery',
        buildingId: 'block-a',
        buildingName: 'NIIS Campus',
        locationDetails: `${g.category} · ${g.date}`,
        image: g.imageUrl,
        tags: [g.category, 'photo', 'gallery', 'memories'],
        rawItem: g
      });
    });

    // 7. Campus Services (Emergency, Security, Admissions, Helpdesk)
    const services = [
      { name: 'Campus Security Control & Main Gate', buildingId: 'main-gate', details: '24/7 Security Guard & Vehicle Pass Office', tags: ['security', 'guard', 'gate', 'emergency', 'help'] },
      { name: 'First Aid & Emergency Medical Station', buildingId: 'block-a', details: 'Block A Ground Floor Medical Room (A-101)', tags: ['first aid', 'doctor', 'medicine', 'hospital', 'emergency'] },
      { name: 'Admissions & Student Welfare Cell', buildingId: 'block-a', details: 'Block A Central Foyer Room A-101', tags: ['admissions', 'enquiry', 'fees', 'scholarship'] },
      { name: 'Training, Placement & Career Cell', buildingId: 'block-e', details: 'Block E Floor 2 Placement Studio', tags: ['placement', 'jobs', 'internship', 'training'] },
      { name: 'Central Digital Library & E-Resource Hub', buildingId: 'block-c', details: 'Block C Floor 1 (50,000+ volumes & journals)', tags: ['library', 'books', 'study', 'reading room', 'quiet'] },
      { name: 'Common Restrooms & Accessible Washroom', buildingId: 'common-washroom', details: 'Adjacent to Open Park & Block B', tags: ['washroom', 'toilet', 'restroom', 'accessible'] },
      { name: 'Nescafe Coffee & Student Lounge', buildingId: 'nescafe', details: 'Open patio seating opposite Hostels', tags: ['coffee', 'tea', 'cafe', 'snacks'] },
      { name: 'NIIS Dining Canteen & Food Court', buildingId: 'niis-canteen', details: 'Spacious food court with Odia thalis & snacks', tags: ['canteen', 'food', 'lunch', 'dinner', 'mess'] }
    ];

    services.forEach((s, idx) => {
      const bld = buildings.find(b => b.id === s.buildingId) || buildings[0];
      items.push({
        id: `srv-${idx}`,
        name: s.name,
        category: 'service',
        categoryLabel: 'Campus Service',
        buildingId: s.buildingId,
        buildingName: bld.name,
        locationDetails: s.details,
        image: bld.image,
        tags: s.tags,
        rawItem: bld
      });
    });

    return items;
  }, [buildings, faculty, events, gallery]);

  // Clean Natural Language Search
  const searchResults = useMemo(() => {
    let cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    // Strip common filler words like "where is", "show me", "nearest", "how to reach", "find"
    const stripped = cleanQuery
      .replace(/^(where is|where's|where are|find|show me|navigate to|how to reach|take me to|locate|search for)\s+/i, '')
      .replace(/\s+(near me|nearby|around here)$/i, '')
      .trim();

    const targetQuery = stripped.length > 0 ? stripped : cleanQuery;

    // Filter and score
    const matches = allSearchItems.filter(item => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }

      const nameMatch = item.name.toLowerCase().includes(targetQuery);
      const locMatch = item.locationDetails.toLowerCase().includes(targetQuery);
      const bldMatch = item.buildingName.toLowerCase().includes(targetQuery);
      const tagMatch = item.tags?.some(t => t.toLowerCase().includes(targetQuery));
      const roomMatch = item.roomNumber?.toLowerCase().includes(targetQuery.replace('-', ''));

      return nameMatch || locMatch || bldMatch || tagMatch || roomMatch;
    });

    // Special prioritize exact block / building code matches
    return matches.sort((a, b) => {
      const aExact = a.name.toLowerCase().startsWith(targetQuery);
      const bExact = b.name.toLowerCase().startsWith(targetQuery);
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });
  }, [query, activeCategory, allSearchItems]);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Results' },
    { id: 'block', label: 'Blocks' },
    { id: 'building', label: 'Buildings' },
    { id: 'classroom', label: 'Classrooms' },
    { id: 'faculty', label: 'Faculty' },
    { id: 'facility', label: 'Facilities' },
    { id: 'service', label: 'Services' },
    { id: 'event', label: 'Events' },
  ];

  const handleSelectResult = (item: SearchResultItem) => {
    const bld = buildings.find(b => b.id === item.buildingId);
    if (bld) {
      onSelectBuilding(bld);
    }
    onClose();
  };

  const handleNavigateDirect = (e: React.MouseEvent, item: SearchResultItem) => {
    e.stopPropagation();
    if (item.category === 'classroom' && item.rawItem?.room) {
      onNavigateToBuilding(item.buildingId, item.rawItem.room);
    } else {
      onNavigateToBuilding(item.buildingId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2.5 sm:p-6 pt-6 sm:pt-16 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl glass-panel rounded-3xl p-3.5 sm:p-6 shadow-2xl border border-white/20 flex flex-col max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="relative flex items-center mb-3 pb-3 border-b border-white/10">
          <Search className="absolute left-3 w-5 h-5 text-[#FF3FA4]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blocks, rooms, faculty, canteen, washroom, events..."
            className="w-full pl-11 pr-10 py-2.5 text-sm sm:text-base font-medium rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF3FA4] transition-all"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="absolute right-3 p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 scrollbar-none mb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-[#FF3FA4] to-[#c73570] text-white shadow-md'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quick Natural Language Prompts when empty */}
        {!query && (
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 block mb-2">
                Popular Campus Searches
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Block C',
                  'Where is Block C',
                  'Computer Lab',
                  'Washroom near me',
                  'Canteen',
                  'Where is the playground',
                  'Central Library',
                  'Main Gate',
                  'Faculty Leadership',
                  'First Aid',
                  'Room B-204'
                ].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => setQuery(prompt)}
                    className="px-3 py-1.5 rounded-xl glass-panel-subtle hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium border border-white/5 hover:border-[#FF3FA4]/40 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Search className="w-3 h-3 text-[#FF3FA4]" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 block mb-2">
                Featured Highlights
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {buildings.slice(0, 4).map(b => (
                  <div
                    key={b.id}
                    onClick={() => {
                      onSelectBuilding(b);
                      onClose();
                    }}
                    className="p-2.5 rounded-2xl glass-panel-subtle border border-white/5 hover:border-white/20 flex items-center gap-3 cursor-pointer group transition-all"
                  >
                    <img 
                      src={b.image} 
                      alt={b.name} 
                      className="w-11 h-11 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{b.name}</div>
                      <div className="text-[10px] text-white/50">{b.code} · {b.floors} Floors</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        {query && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {searchResults.length === 0 ? (
              <div className="text-center py-12">
                <Compass className="w-10 h-10 text-white/20 mx-auto mb-2 animate-bounce" />
                <p className="text-sm font-semibold text-white/70">No matching campus locations found</p>
                <p className="text-xs text-white/40 mt-1 max-w-xs mx-auto">
                  Try searching with keywords like &quot;Block C&quot;, &quot;Lab&quot;, &quot;Canteen&quot;, or &quot;Faculty&quot;.
                </p>
              </div>
            ) : (
              searchResults.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleSelectResult(item)}
                  className="p-3 rounded-2xl glass-panel-subtle border border-white/5 hover:border-[#FF3FA4]/40 hover:bg-white/10 flex items-center justify-between gap-3 cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Thumbnail / Icon */}
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform border border-white/10"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#FF3FA4] shrink-0 border border-white/10">
                        {item.category === 'classroom' ? <DoorOpen className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                      </div>
                    )}

                    {/* Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#FF72BD] transition-colors truncate">
                          {item.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-mono text-white/70 shrink-0">
                          {item.categoryLabel}
                        </span>
                      </div>
                      <div className="text-[11px] text-white/60 truncate">
                        {item.locationDetails}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-white/40 mt-0.5 font-mono">
                        <MapPin className="w-3 h-3 text-[#E9B95F]" />
                        <span>{item.buildingName}</span>
                        {item.floor && <span>· Floor {item.floor}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleNavigateDirect(e, item)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#3b82f6] hover:brightness-110 text-black font-bold text-xs flex items-center gap-1 shadow-md transition-all cursor-pointer"
                      title="Direct Route Navigation"
                    >
                      <Navigation className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline">Navigate</span>
                    </button>
                    <button
                      onClick={() => handleSelectResult(item)}
                      className="p-1.5 rounded-xl glass-panel text-white/70 hover:text-white"
                      title="View Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
