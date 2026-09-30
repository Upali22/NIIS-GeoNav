import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye, 
  EyeOff, 
  Layers, 
  MapPin, 
  Sparkles, 
  X, 
  Upload,
  AlertTriangle,
  CheckCircle2,
  Users
} from 'lucide-react';
import { BuildingData, BuildingCategory } from '../../types';

interface AdminBuildingSectionProps {
  buildings: BuildingData[];
  onRefreshData: () => void;
  showStatus: (msg: string) => void;
}

export const AdminBuildingSection: React.FC<AdminBuildingSectionProps> = ({
  buildings,
  onRefreshData,
  showStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingBuilding, setEditingBuilding] = useState<Partial<BuildingData> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields state helper
  const [facilitiesStr, setFacilitiesStr] = useState('');
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [posZ, setPosZ] = useState(0);

  const openAddBuilding = () => {
    const newId = `block-${String.fromCharCode(97 + Math.floor(Math.random() * 26))}-${Date.now().toString().slice(-4)}`;
    setEditingBuilding({
      id: newId,
      name: '',
      code: 'BLK',
      category: 'academic',
      description: '',
      floors: 3,
      height: 14,
      position: [0, 0, 0],
      size: [18, 14, 16],
      status: 'active',
      visible: true,
      accessibility: true,
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
      maxCapacity: 400,
      currentOccupancy: 120,
      occupancyStatus: 'Moderate',
      openingHours: '08:00 AM - 08:00 PM',
      mainEntrance: 'Central Plaza Entrance',
      accessibleEntrance: 'Ground Floor Ramp'
    });
    setFacilitiesStr('WiFi, Smart Classrooms, AC, Water Dispenser');
    setPosX(0);
    setPosY(0);
    setPosZ(0);
  };

  const openEditBuilding = (b: BuildingData) => {
    setEditingBuilding({ ...b });
    setFacilitiesStr((b.facilities || []).join(', '));
    setPosX(b.position[0] || 0);
    setPosY(b.position[1] || 0);
    setPosZ(b.position[2] || 0);
  };

  const handleSaveBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBuilding || !editingBuilding.name) return;
    setIsSubmitting(true);

    try {
      const facArray = facilitiesStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload: BuildingData = {
        id: editingBuilding.id || `bld-${Date.now()}`,
        name: editingBuilding.name,
        code: editingBuilding.code || editingBuilding.name.slice(0, 4).toUpperCase(),
        shortName: editingBuilding.shortName || editingBuilding.name,
        label: editingBuilding.label || editingBuilding.name,
        category: (editingBuilding.category as BuildingCategory) || 'academic',
        description: editingBuilding.description || '',
        position: [Number(posX) || 0, Number(posY) || 0, Number(posZ) || 0],
        size: editingBuilding.size || [18, Number(editingBuilding.height) || 14, 16],
        height: Number(editingBuilding.height) || 14,
        floors: Number(editingBuilding.floors) || 2,
        image: editingBuilding.image || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
        facilities: facArray,
        accessibility: editingBuilding.accessibility !== false,
        openingHours: editingBuilding.openingHours || '08:00 AM - 08:00 PM',
        status: editingBuilding.status || 'active',
        visible: editingBuilding.visible !== false,
        featured: editingBuilding.featured || false,
        latitude: editingBuilding.latitude ? Number(editingBuilding.latitude) : 20.2961,
        longitude: editingBuilding.longitude ? Number(editingBuilding.longitude) : 85.8245,
        mainEntrance: editingBuilding.mainEntrance || 'Main Gate Entrance',
        accessibleEntrance: editingBuilding.accessibleEntrance || 'Ramp Entrance',
        maxCapacity: Number(editingBuilding.maxCapacity) || 300,
        currentOccupancy: Number(editingBuilding.currentOccupancy) || 80,
        occupancyStatus: editingBuilding.occupancyStatus || 'Moderate',
        color: editingBuilding.color || '#3b82f6',
        accentColor: editingBuilding.accentColor || '#FF3FA4'
      };

      const isExisting = buildings.some(b => b.id === payload.id);
      const url = isExisting ? `/api/campus/buildings/${payload.id}` : '/api/campus/buildings';
      const method = isExisting ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showStatus(isExisting ? 'Building updated successfully.' : 'Building added successfully.');
        setEditingBuilding(null);
        onRefreshData();
      } else {
        showStatus('Unable to save changes. Please try again.');
      }
    } catch (err) {
      console.error(err);
      showStatus('Unable to save changes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleVisibility = async (b: BuildingData) => {
    try {
      const nextVisible = b.visible === false;
      const res = await fetch(`/api/campus/buildings/${b.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...b, visible: nextVisible })
      });
      if (res.ok) {
        showStatus(nextVisible ? `Building "${b.name}" is now visible on 3D campus.` : `Building "${b.name}" hidden from 3D campus.`);
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveBuilding = async (bId: string) => {
    try {
      const target = buildings.find(b => b.id === bId);
      if (!target) return;
      const res = await fetch(`/api/campus/buildings/${bId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...target, visible: false, status: 'closed' })
      });
      if (res.ok) {
        showStatus('Building archived and hidden safely.');
        setDeleteConfirm(null);
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePermanent = async (bId: string) => {
    try {
      const res = await fetch(`/api/campus/buildings/${bId}`, { method: 'DELETE' });
      if (res.ok) {
        showStatus('Building deleted successfully.');
        setDeleteConfirm(null);
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
      showStatus('Unable to delete building.');
    }
  };

  const filteredBuildings = buildings.filter(b => {
    const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter;
    const matchesSearch = 
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Reference UI Header Pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight font-display">Campus Buildings & 3D</h2>
          <p className="text-xs text-white/50">Manage 3D digital twin structures, floors, capacities, entrances, and live visibility</p>
        </div>
        <button
          onClick={openAddBuilding}
          className="px-3.5 py-2 rounded-xl bg-[#E9B95F] text-[#08070B] text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Building</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search buildings by name, code or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs placeholder-white/30"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-xl glass-input text-xs bg-[#171019] text-white w-full sm:w-auto"
        >
          <option value="all">All Categories</option>
          <option value="academic">Academic Blocks</option>
          <option value="hostel">Hostels</option>
          <option value="dining">Dining & Canteen</option>
          <option value="religious">Temple & Spiritual</option>
          <option value="sports">Sports & Grounds</option>
          <option value="amenity">Amenities</option>
          <option value="gate">Gates & Checkpoints</option>
          <option value="parking">Parking</option>
        </select>
      </div>

      {/* Buildings Card Grid (Reference Card Pattern) */}
      {filteredBuildings.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
          <Building2 className="w-12 h-12 text-white/30 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white font-display">No Buildings Found</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto mt-1 mb-4">
            {searchTerm ? 'No campus structures match your current query.' : 'Add your first building to show on the interactive 3D digital twin.'}
          </p>
          <button
            onClick={openAddBuilding}
            className="px-4 py-2 rounded-xl bg-[#E9B95F] text-[#08070B] text-xs font-bold inline-flex items-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Building</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBuildings.map(b => (
            <div 
              key={b.id} 
              className={`glass-panel p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                b.visible === false ? 'opacity-60 border-white/5' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-start gap-3.5 mb-2.5">
                  <img
                    src={b.image}
                    alt={b.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/20 bg-black/40"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FF3FA4]/20 text-[#FF72BD] uppercase">
                        {b.code}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono capitalize bg-white/10 text-white/70">
                        {b.category}
                      </span>
                      {b.visible === false && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-red-500/20 text-red-300">
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-white truncate mt-1">{b.name}</div>
                    <div className="text-[10px] text-white/50">{b.floors} Floors · {b.height}m Height</div>
                    <div className="text-[9px] text-[#00f0ff] font-mono truncate mt-0.5">
                      Pos: [{b.position.join(', ')}]
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-white/60 line-clamp-2 mb-2">
                  {b.description || 'Institutional facility on NIIS Bhubaneswar campus.'}
                </div>

                {/* Capacity & Occupancy indicator */}
                <div className="flex items-center justify-between text-[10px] font-mono bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5 text-white/70 mb-3">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#E9B95F]" />
                    <span>{b.currentOccupancy || 0}/{b.maxCapacity || 400}</span>
                  </span>
                  <span className={b.status === 'active' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {b.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Reference Pattern */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <button
                  onClick={() => handleToggleVisibility(b)}
                  className={`p-1.5 rounded-lg glass-panel text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                    b.visible === false ? 'text-amber-300 hover:text-white' : 'text-white/60 hover:text-white'
                  }`}
                  title={b.visible === false ? 'Unhide building' : 'Hide from 3D view'}
                >
                  {b.visible === false ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">{b.visible === false ? 'Hidden' : 'Visible'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditBuilding(b)}
                    className="p-1.5 rounded-lg glass-panel hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
                    title="Edit Building"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ id: b.id, name: b.name })}
                    className="p-1.5 rounded-lg glass-panel hover:bg-red-500/20 text-white/70 hover:text-red-400 cursor-pointer transition-colors"
                    title="Delete Building"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Building Modal */}
      {editingBuilding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel p-5 sm:p-6 rounded-3xl max-w-2xl w-full border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  {buildings.some(b => b.id === editingBuilding.id) ? 'Edit Campus Building' : 'Add New Campus Building'}
                </h3>
                <p className="text-[11px] text-white/50">Configure 3D digital twin geometry, entrance paths and metadata</p>
              </div>
              <button 
                onClick={() => setEditingBuilding(null)} 
                className="p-1.5 rounded-xl glass-panel text-white/40 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBuilding} className="space-y-4">
              {/* Image Preview & URL */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">BUILDING IMAGE & PREVIEW</label>
                <div className="flex gap-3 items-center">
                  <img
                    src={editingBuilding.image || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80'}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-20 h-16 rounded-xl object-cover border border-white/20 shrink-0 bg-black/50"
                  />
                  <input
                    type="text"
                    required
                    value={editingBuilding.image || ''}
                    onChange={(e) => setEditingBuilding({ ...editingBuilding, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">BUILDING NAME *</label>
                  <input
                    type="text"
                    required
                    value={editingBuilding.name || ''}
                    onChange={(e) => setEditingBuilding({ ...editingBuilding, name: e.target.value })}
                    placeholder="e.g. Block C (Computer Science & Central Library)"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">CODE / SHORT *</label>
                  <input
                    type="text"
                    required
                    value={editingBuilding.code || ''}
                    onChange={(e) => setEditingBuilding({ ...editingBuilding, code: e.target.value })}
                    placeholder="e.g. BLK-C"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">CATEGORY *</label>
                  <select
                    value={editingBuilding.category || 'academic'}
                    onChange={(e) => setEditingBuilding({ ...editingBuilding, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-[#171019] text-white"
                  >
                    <option value="academic">Academic Block</option>
                    <option value="hostel">Hostel</option>
                    <option value="dining">Dining & Canteen</option>
                    <option value="religious">Temple / Spiritual</option>
                    <option value="sports">Sports & Playground</option>
                    <option value="amenity">Amenity</option>
                    <option value="gate">Gate</option>
                    <option value="parking">Parking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">STATUS</label>
                  <select
                    value={editingBuilding.status || 'active'}
                    onChange={(e) => setEditingBuilding({ ...editingBuilding, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-[#171019] text-white"
                  >
                    <option value="active">Active & Open</option>
                    <option value="under_maintenance">Under Maintenance</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* 3D Structure Geometry */}
              <div className="p-3.5 rounded-2xl glass-panel-subtle border border-white/10 space-y-2.5">
                <div className="text-[11px] font-mono text-[#E9B95F] font-bold uppercase flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>3D Structure & Positioning</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[9px] font-mono uppercase text-white/50 mb-0.5">Floors</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={editingBuilding.floors || 2}
                      onChange={(e) => setEditingBuilding({ ...editingBuilding, floors: parseInt(e.target.value) || 1 })}
                      className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono uppercase text-white/50 mb-0.5">Height (m)</label>
                    <input
                      type="number"
                      step={0.5}
                      value={editingBuilding.height || 14}
                      onChange={(e) => setEditingBuilding({ ...editingBuilding, height: parseFloat(e.target.value) || 10 })}
                      className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono uppercase text-white/50 mb-0.5">Pos X</label>
                    <input
                      type="number"
                      step={0.5}
                      value={posX}
                      onChange={(e) => setPosX(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono uppercase text-white/50 mb-0.5">Pos Z</label>
                    <input
                      type="number"
                      step={0.5}
                      value={posZ}
                      onChange={(e) => setPosZ(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-xl glass-input text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Entrance & Accessibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">MAIN ENTRANCE</label>
                  <input
                    type="text"
                    value={editingBuilding.mainEntrance || ''}
                    onChange={(e) => setEditingBuilding({ ...editingBuilding, mainEntrance: e.target.value })}
                    placeholder="e.g. East Plaza Grand Steps"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">ACCESSIBLE ENTRANCE</label>
                  <input
                    type="text"
                    value={editingBuilding.accessibleEntrance || ''}
                    onChange={(e) => setEditingBuilding({ ...editingBuilding, accessibleEntrance: e.target.value })}
                    placeholder="e.g. Ground Floor North Ramp"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              {/* Facilities & Description */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">FACILITIES (COMMA SEPARATED)</label>
                <input
                  type="text"
                  value={facilitiesStr}
                  onChange={(e) => setFacilitiesStr(e.target.value)}
                  placeholder="WiFi, AC, Lift, Smart Classrooms, Water Cooler"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={editingBuilding.description || ''}
                  onChange={(e) => setEditingBuilding({ ...editingBuilding, description: e.target.value })}
                  placeholder="Overview of departments, laboratories, and services..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-white/80">
                  <input
                    type="checkbox"
                    checked={editingBuilding.visible !== false}
                    onChange={(e) => setEditingBuilding({ ...editingBuilding, visible: e.target.checked })}
                    className="rounded text-[#E9B95F]"
                  />
                  <span>Show in 3D Campus Scene</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-white/80">
                  <input
                    type="checkbox"
                    checked={editingBuilding.accessibility !== false}
                    onChange={(e) => setEditingBuilding({ ...editingBuilding, accessibility: e.target.checked })}
                    className="rounded text-[#00f0ff]"
                  />
                  <span>Wheelchair Accessible</span>
                </label>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingBuilding(null)}
                  className="px-4 py-2 rounded-xl glass-panel text-xs text-white/60 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#E9B95F] text-[#08070B] text-xs font-bold shadow-md hover:brightness-110 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-red-500/30 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white font-display">Delete Building?</h3>
            <p className="text-xs text-white/60 mt-1.5 mb-2">
              Are you sure you want to delete <span className="text-white font-bold">&quot;{deleteConfirm.name}&quot;</span>?
            </p>
            <p className="text-[11px] text-amber-300/80 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 mb-5">
              Warning: This building may be referenced by navigation routes, classrooms, facilities, or schedules.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleArchiveBuilding(deleteConfirm.id)}
                className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 text-xs font-bold cursor-pointer"
              >
                Hide / Archive Building (Safer)
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2 rounded-xl glass-panel text-xs text-white/70 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeletePermanent(deleteConfirm.id)}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer shadow-md"
                >
                  Permanently Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
