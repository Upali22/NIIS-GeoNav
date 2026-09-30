import React, { useState } from 'react';
import { 
  Navigation, 
  Search, 
  Edit, 
  Check, 
  X, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Accessibility, 
  Ban,
  Footprints
} from 'lucide-react';
import { CampusRoute, NIIS_CAMPUS_ROUTES, CANONICAL_CAMPUS_NODES } from '../../data/niisNavigationData';

interface AdminRoutesSectionProps {
  onRefreshData?: () => void;
  showStatus: (msg: string) => void;
}

export const AdminRoutesSection: React.FC<AdminRoutesSectionProps> = ({
  onRefreshData,
  showStatus
}) => {
  const [routes, setRoutes] = useState<CampusRoute[]>(() => {
    const saved = localStorage.getItem('niis_admin_routes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return NIIS_CAMPUS_ROUTES;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlocked, setFilterBlocked] = useState<'all' | 'active' | 'blocked'>('all');
  const [editingRoute, setEditingRoute] = useState<CampusRoute | null>(null);

  const saveRoutesToStorage = (updatedRoutes: CampusRoute[]) => {
    setRoutes(updatedRoutes);
    localStorage.setItem('niis_admin_routes', JSON.stringify(updatedRoutes));
    // Also update in-memory NIIS_CAMPUS_ROUTES
    updatedRoutes.forEach(ur => {
      const idx = NIIS_CAMPUS_ROUTES.findIndex(r => r.id === ur.id);
      if (idx !== -1) {
        NIIS_CAMPUS_ROUTES[idx] = { ...NIIS_CAMPUS_ROUTES[idx], ...ur };
      }
    });
    if (onRefreshData) onRefreshData();
  };

  const handleToggleBlock = (r: CampusRoute) => {
    const nextBlocked = !r.blocked;
    const updated = routes.map(item => item.id === r.id ? { ...item, blocked: nextBlocked } : item);
    saveRoutesToStorage(updated);
    showStatus(nextBlocked ? `Route ${r.id} marked as BLOCKED for pathfinding.` : `Route ${r.id} is now ACTIVE.`);
  };

  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoute) return;

    const updated = routes.map(r => r.id === editingRoute.id ? {
      ...r,
      name: editingRoute.name,
      recordedTimeSeconds: Number(editingRoute.recordedTimeSeconds) || r.recordedTimeSeconds,
      accessible: editingRoute.accessible,
      stairs: editingRoute.stairs,
      ramp: editingRoute.ramp,
      surface: editingRoute.surface,
      widthMeters: editingRoute.widthMeters ? Number(editingRoute.widthMeters) : undefined,
      slopePercent: editingRoute.slopePercent ? Number(editingRoute.slopePercent) : undefined,
      blocked: editingRoute.blocked
    } : r);

    saveRoutesToStorage(updated);
    setEditingRoute(null);
    showStatus(`Route ${editingRoute.id} metadata updated successfully.`);
  };

  const filteredRoutes = routes.filter(r => {
    const matchesSearch = 
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.name && r.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBlocked = 
      filterBlocked === 'all' ||
      (filterBlocked === 'blocked' && r.blocked) ||
      (filterBlocked === 'active' && !r.blocked);

    return matchesSearch && matchesBlocked;
  });

  return (
    <div className="space-y-4">
      {/* Reference UI Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight font-display flex items-center gap-2">
            <span>Recorded GPX Campus Routes</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30">
              13 REAL TRACKS
            </span>
          </h2>
          <p className="text-xs text-white/50">
            Manage the 13 verified GPS walking paths, recorded walking times, accessibility verifications, and route blocks
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search routes by ID (ROUTE_001), origin or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs placeholder-white/30"
          />
        </div>
        <select
          value={filterBlocked}
          onChange={(e) => setFilterBlocked(e.target.value as any)}
          className="px-3 py-2 rounded-xl glass-input text-xs bg-[#171019] text-white w-full sm:w-auto"
        >
          <option value="all">All Routes (13)</option>
          <option value="active">Active Only</option>
          <option value="blocked">Blocked Paths Only</option>
        </select>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoutes.map(route => {
          const fromNode = CANONICAL_CAMPUS_NODES.find(n => n.id === route.from);
          const toNode = CANONICAL_CAMPUS_NODES.find(n => n.id === route.to);

          return (
            <div 
              key={route.id}
              className={`glass-panel p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                route.blocked ? 'border-red-500/40 bg-red-950/10' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E9B95F]/20 text-[#E9B95F]">
                      {route.id}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/10 text-white/60">
                      {route.geometry.length} GPX PTS
                    </span>
                  </div>
                  {route.blocked ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-red-500/20 text-red-300 font-bold border border-red-500/30 flex items-center gap-1">
                      <Ban className="w-2.5 h-2.5" />
                      <span>BLOCKED</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>

                {/* Route Terminals */}
                <h4 className="text-xs font-bold text-white mb-1">
                  {route.name || `${fromNode?.shortName || route.from} → ${toNode?.shortName || route.to}`}
                </h4>

                <div className="text-[11px] text-white/70 font-mono flex items-center gap-1.5 mb-2">
                  <span className="text-[#00f0ff]">{fromNode?.shortName || route.from}</span>
                  <span className="text-white/40">⇄</span>
                  <span className="text-[#FF3FA4]">{toNode?.shortName || route.to}</span>
                </div>

                {/* Recorded Metrics */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-white/5 p-2 rounded-xl border border-white/5 mb-3">
                  <div>
                    <span className="text-white/40 block text-[9px]">DISTANCE</span>
                    <span className="text-white font-bold">{route.distanceMeters} m</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[9px]">WALK TIME</span>
                    <span className="text-[#E9B95F] font-bold">{route.recordedTimeSeconds}s (~{Math.round(route.recordedTimeSeconds / 60 * 10) / 10} min)</span>
                  </div>
                </div>

                {/* Metadata Tags */}
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/5 text-white/60">
                    Surface: {route.surface || 'Paved Path'}
                  </span>
                  {route.accessible === true && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#00f0ff]/20 text-[#00f0ff]">
                      Accessible
                    </span>
                  )}
                  {route.stairs && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300">
                      Has Steps
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons: Reference Pattern */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
                <button
                  onClick={() => handleToggleBlock(route)}
                  className={`p-1.5 rounded-lg glass-panel text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                    route.blocked ? 'text-emerald-400 hover:text-white' : 'text-red-400 hover:text-red-300'
                  }`}
                  title={route.blocked ? 'Unblock route' : 'Temporarily block route'}
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span className="text-[10px]">{route.blocked ? 'Unblock' : 'Block Path'}</span>
                </button>

                <button
                  onClick={() => setEditingRoute({ ...route })}
                  className="p-1.5 rounded-lg glass-panel hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors flex items-center gap-1"
                  title="Edit Route Metadata"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Edit Metadata</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Route Metadata Modal */}
      {editingRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl max-w-lg w-full border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <span>Edit Route Metadata: {editingRoute.id}</span>
                </h3>
                <p className="text-[11px] text-white/50">{editingRoute.from} ⇄ {editingRoute.to}</p>
              </div>
              <button onClick={() => setEditingRoute(null)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMetadata} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">ROUTE DISPLAY NAME</label>
                <input
                  type="text"
                  value={editingRoute.name || ''}
                  onChange={(e) => setEditingRoute({ ...editingRoute, name: e.target.value })}
                  placeholder="e.g. Main Gate to Block A Walkway"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">RECORDED DISTANCE</label>
                  <div className="px-3 py-2 rounded-xl glass-input text-xs text-white/70 bg-white/5">
                    {editingRoute.distanceMeters} meters (Read-Only)
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">WALK TIME (SECONDS)</label>
                  <input
                    type="number"
                    value={editingRoute.recordedTimeSeconds}
                    onChange={(e) => setEditingRoute({ ...editingRoute, recordedTimeSeconds: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">PATHWAY SURFACE</label>
                  <input
                    type="text"
                    value={editingRoute.surface || ''}
                    onChange={(e) => setEditingRoute({ ...editingRoute, surface: e.target.value })}
                    placeholder="e.g. Paver Blocks / Asphalt"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">WIDTH (METERS)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingRoute.widthMeters || ''}
                    onChange={(e) => setEditingRoute({ ...editingRoute, widthMeters: Number(e.target.value) })}
                    placeholder="e.g. 3.5"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-2.5 rounded-xl glass-panel-subtle cursor-pointer text-xs text-white">
                  <input
                    type="checkbox"
                    checked={editingRoute.stairs || false}
                    onChange={(e) => setEditingRoute({ ...editingRoute, stairs: e.target.checked })}
                    className="rounded accent-[#FF3FA4]"
                  />
                  <span>Has Stairs / Steps</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl glass-panel-subtle cursor-pointer text-xs text-white">
                  <input
                    type="checkbox"
                    checked={editingRoute.ramp || false}
                    onChange={(e) => setEditingRoute({ ...editingRoute, ramp: e.target.checked })}
                    className="rounded accent-[#00f0ff]"
                  />
                  <span>Has Ramp Entrance</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-2.5 rounded-xl glass-panel-subtle cursor-pointer text-xs text-white">
                  <input
                    type="checkbox"
                    checked={editingRoute.accessible === true}
                    onChange={(e) => setEditingRoute({ ...editingRoute, accessible: e.target.checked })}
                    className="rounded accent-[#00f0ff]"
                  />
                  <span>Verified Accessible</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl glass-panel-subtle cursor-pointer text-xs text-white">
                  <input
                    type="checkbox"
                    checked={editingRoute.blocked || false}
                    onChange={(e) => setEditingRoute({ ...editingRoute, blocked: e.target.checked })}
                    className="rounded accent-red-500"
                  />
                  <span className="text-red-300">Temporarily Blocked</span>
                </label>
              </div>

              {/* Safety notification regarding GPS geometry */}
              <div className="p-3 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[11px] text-[#00f0ff]">
                <ShieldCheck className="w-4 h-4 inline mr-1 text-[#00f0ff]" />
                <span>Original GPX route geometry ({editingRoute.geometry.length} trackpoints) is securely protected against accidental edits.</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingRoute(null)}
                  className="px-4 py-2 rounded-xl glass-panel text-xs text-white/60 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E9B95F] text-[#08070B] text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
