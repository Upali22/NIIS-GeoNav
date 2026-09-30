import React, { useState } from 'react';
import { BuildingData } from '../../types';
import { Building2, Navigation, Layers, Accessibility, Sparkles, MapPin, Eye } from 'lucide-react';

interface BuildingsDirectoryProps {
  buildings: BuildingData[];
  onSelectBuilding: (b: BuildingData) => void;
  onNavigateToBuilding: (b: BuildingData) => void;
}

export const BuildingsDirectory: React.FC<BuildingsDirectoryProps> = ({
  buildings,
  onSelectBuilding,
  onNavigateToBuilding
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Locations' },
    { id: 'academic', label: 'Academic Blocks' },
    { id: 'hostel', label: 'Hostels' },
    { id: 'dining', label: 'Dining & Cafe' },
    { id: 'religious', label: 'Sai Temple' },
    { id: 'sports', label: 'Sports & Parks' },
    { id: 'gate', label: 'Gates & Parking' },
  ];

  const filtered = buildings.filter(b => {
    const matchesCategory = filterCategory === 'all' || b.category === filterCategory;
    const matchesSearch = searchTerm === '' || 
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.departments && b.departments.some(d => d.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="desktop-container py-6 sm:py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF3FA4]/10 border border-[#FF3FA4]/30 text-[#FF72BD] text-xs font-semibold mb-3">
          <Building2 className="w-3.5 h-3.5" />
          <span>Spatial Campus Registry</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
          Campus Buildings & Facilities
        </h1>
        <p className="text-sm text-white/60 mt-2">
          Explore all 19 official buildings, academic departments, residential hostels, and student amenities.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-[#FF3FA4] text-white shadow-lg shadow-[#FF3FA4]/30'
                  : 'glass-panel text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by name, department, code..."
          className="w-full sm:w-64 px-4 py-2 rounded-xl glass-input text-xs focus:outline-none focus:border-[#FF3FA4]"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(b => (
          <div
            key={b.id}
            className="glass-panel rounded-3xl overflow-hidden border border-white/15 shadow-xl hover:border-white/30 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Image */}
              <div className="relative h-44 w-full overflow-hidden">
                <img
                  src={b.image}
                  alt={b.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#FF3FA4] text-white text-[10px] font-mono font-bold uppercase">
                    {b.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] capitalize">
                    {b.category}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="text-base font-black text-white font-display tracking-tight mb-1 truncate">
                  {b.name}
                </h3>
                <p className="text-xs text-white/70 line-clamp-2 leading-relaxed mb-3">
                  {b.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-white/50 font-mono mb-3">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#00f0ff]" />
                    <span>{b.floors} Floors</span>
                  </span>
                  {b.rooms && (
                    <span>· {b.rooms.length} Rooms</span>
                  )}
                  {b.accessibility && (
                    <span className="flex items-center gap-1 text-[#00f0ff]">
                      <Accessibility className="w-3.5 h-3.5" />
                      <span>Accessible</span>
                    </span>
                  )}
                </div>

                {b.departments && b.departments.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {b.departments.map(d => (
                      <span key={d} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-white/70">
                        {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 pt-0 flex items-center gap-2">
              <button
                onClick={() => onSelectBuilding(b)}
                className="flex-1 py-2 px-3 rounded-xl glass-panel hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#E9B95F]" />
                <span>View in 3D</span>
              </button>

              <button
                onClick={() => onNavigateToBuilding(b)}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#FF3FA4] to-[#c73570] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 transition-all cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Navigate</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
