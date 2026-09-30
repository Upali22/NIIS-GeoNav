import React, { useState } from 'react';
import { GalleryItem } from '../../types';
import { Image as ImageIcon, X, Calendar, Sparkles } from 'lucide-react';

interface GalleryPageProps {
  items: GalleryItem[];
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ items }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);

  const categories = ['all', ...Array.from(new Set(items.map(i => i.category)))];

  const filtered = selectedCategory === 'all'
    ? items
    : items.filter(i => i.category === selectedCategory);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF3FA4]/10 border border-[#FF3FA4]/30 text-[#FF72BD] text-xs font-semibold mb-3">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Visual Archive</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
          Campus Moments & Gallery
        </h1>
        <p className="text-sm text-white/60 mt-2">
          Glimpses of architectural life, sports meets, cultural fests, and student memories at NIIS Bhubaneswar.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none px-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#FF3FA4] text-white shadow-lg shadow-[#FF3FA4]/30'
                : 'glass-panel text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat === 'all' ? 'All Moments' : cat}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(item => (
          <div
            key={item.id}
            onClick={() => setActivePhoto(item)}
            className="group glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-[#FF3FA4]/50 shadow-xl cursor-pointer transition-all duration-300 flex flex-col"
          >
            <div className="relative h-56 w-full overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-[#E9B95F]">
                {item.category}
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-display line-clamp-1">{item.title}</h3>
                <p className="text-xs text-white/60 line-clamp-2 mt-1">{item.description}</p>
              </div>
              <div className="text-[10px] text-white/40 mt-3 pt-2 border-t border-white/10 font-mono">
                Captured on {item.date}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div 
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full glass-panel rounded-3xl overflow-hidden border border-white/20 p-2 shadow-2xl"
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-black/60 text-white/80 hover:text-white backdrop-blur-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={activePhoto.imageUrl}
              alt={activePhoto.title}
              referrerPolicy="no-referrer"
              className="w-full max-h-[75vh] object-contain rounded-2xl"
            />

            <div className="p-4 text-white">
              <span className="text-xs font-mono text-[#E9B95F]">{activePhoto.category} · {activePhoto.date}</span>
              <h2 className="text-lg font-bold font-display mt-0.5">{activePhoto.title}</h2>
              <p className="text-xs text-white/70 mt-1">{activePhoto.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
