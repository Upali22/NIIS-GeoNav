import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Mail, 
  Phone, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { CoreMember } from '../../types';

interface AdminCoreMembersSectionProps {
  coreMembers: CoreMember[];
  onRefreshData: () => void;
  showStatus: (msg: string) => void;
}

export const AdminCoreMembersSection: React.FC<AdminCoreMembersSectionProps> = ({
  coreMembers,
  onRefreshData,
  showStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [editingMember, setEditingMember] = useState<Partial<CoreMember> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddMember = () => {
    setEditingMember({
      name: '',
      designation: '',
      role: 'Core Committee Member',
      department: 'Computer Science & Information Technology',
      bio: '',
      qualification: 'B.Tech / MCA',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
      socialEmail: '',
      phone: '',
      active: true,
      displayOrder: coreMembers.length + 1
    });
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !editingMember.name) return;
    setIsSubmitting(true);

    try {
      const isExisting = Boolean(editingMember.id);
      const url = isExisting ? `/api/campus/core-members/${editingMember.id}` : '/api/campus/core-members';
      const method = isExisting ? 'PUT' : 'POST';

      const payload = {
        ...editingMember,
        active: editingMember.active !== false
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showStatus(isExisting ? 'Core member updated successfully.' : 'Core member added successfully.');
        setEditingMember(null);
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

  const handleToggleActive = async (member: CoreMember) => {
    try {
      const nextActive = member.active === false;
      const res = await fetch(`/api/campus/core-members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...member, active: nextActive })
      });
      if (res.ok) {
        showStatus(nextActive ? `${member.name} is now marked active.` : `${member.name} marked inactive.`);
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      const res = await fetch(`/api/campus/core-members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showStatus('Core member removed successfully.');
        setDeleteConfirm(null);
        onRefreshData();
      } else {
        showStatus('Unable to delete core member.');
      }
    } catch (err) {
      console.error(err);
      showStatus('Unable to delete core member.');
    }
  };

  const departments = ['all', ...Array.from(new Set(coreMembers.map(c => c.department).filter(Boolean)))];

  const filteredMembers = coreMembers.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.role && m.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.designation && m.designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.department && m.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = departmentFilter === 'all' || m.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-4">
      {/* Reference Header Pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight font-display">Core Members & Leadership</h2>
          <p className="text-xs text-white/50">Manage student leaders, spatial technology architects, and department heads</p>
        </div>
        <button
          onClick={openAddMember}
          className="px-3.5 py-2 rounded-xl bg-[#E9B95F] text-[#08070B] text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Core Member</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search core members by name, role or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs placeholder-white/30"
          />
        </div>
        {departments.length > 1 && (
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-xs bg-[#171019] text-white w-full sm:w-auto"
          >
            {departments.map(d => (
              <option key={d} value={d}>
                {d === 'all' ? 'All Departments' : d}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Core Member Cards Grid */}
      {filteredMembers.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
          <Users className="w-12 h-12 text-white/30 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white font-display">No Core Members Yet</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto mt-1 mb-4">
            {searchTerm ? 'No members match your search query.' : 'Add core management members and architects to feature on About NIIS.'}
          </p>
          <button
            onClick={openAddMember}
            className="px-4 py-2 rounded-xl bg-[#E9B95F] text-[#08070B] text-xs font-bold inline-flex items-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Core Member</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map(member => (
            <div 
              key={member.id} 
              className={`glass-panel p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                member.active === false ? 'opacity-60 border-white/5' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-start gap-4 mb-2">
                  <img
                    src={member.photo}
                    alt={member.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/20 bg-black/40"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-xs font-bold text-white truncate">{member.name}</div>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                        member.active !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/50'
                      }`}>
                        {member.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#E9B95F] font-semibold truncate">{member.role}</div>
                    <div className="text-[10px] text-white/50 truncate">{member.department}</div>
                    {member.socialEmail && (
                      <div className="text-[9px] text-[#00f0ff] font-mono truncate mt-0.5">{member.socialEmail}</div>
                    )}
                  </div>
                </div>

                <p className="text-[10px] text-white/60 line-clamp-2 mt-1">{member.bio}</p>
              </div>

              {/* Action Buttons: Reference Pattern */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-3">
                <button
                  onClick={() => handleToggleActive(member)}
                  className={`p-1.5 rounded-lg glass-panel text-xs cursor-pointer transition-colors ${
                    member.active === false ? 'text-amber-300 hover:text-white' : 'text-white/60 hover:text-white'
                  }`}
                  title={member.active === false ? 'Mark Active' : 'Mark Inactive'}
                >
                  <span className="text-[10px]">{member.active === false ? 'Set Active' : 'Deactivate'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingMember({ ...member })}
                    className="p-1.5 rounded-lg glass-panel hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
                    title="Edit Member"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ id: member.id, name: member.name })}
                    className="p-1.5 rounded-lg glass-panel hover:bg-red-500/20 text-white/70 hover:text-red-400 cursor-pointer transition-colors"
                    title="Delete Member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Core Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel p-5 sm:p-6 rounded-3xl max-w-lg w-full border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  {editingMember.id ? 'Edit Core Member' : 'Add New Core Member'}
                </h3>
                <p className="text-[11px] text-white/50">Details will be displayed on the About NIIS institutional page</p>
              </div>
              <button 
                onClick={() => setEditingMember(null)} 
                className="p-1.5 rounded-xl glass-panel text-white/40 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-3.5">
              {/* Photo Preview & URL */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">PROFILE PHOTO & PREVIEW</label>
                <div className="flex gap-3 items-center">
                  <img
                    src={editingMember.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover border border-white/20 shrink-0 bg-black/50"
                  />
                  <input
                    type="text"
                    required
                    value={editingMember.photo || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, photo: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">FULL NAME *</label>
                <input
                  type="text"
                  required
                  value={editingMember.name || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  placeholder="e.g. Swati Sucharita Mohanty"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">ROLE / TITLE *</label>
                  <input
                    type="text"
                    required
                    value={editingMember.role || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                    placeholder="e.g. Lead 3D GIS Architect"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">DEPARTMENT</label>
                  <input
                    type="text"
                    required
                    value={editingMember.department || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, department: e.target.value })}
                    placeholder="e.g. Computer Science & IT"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">OFFICIAL EMAIL</label>
                  <input
                    type="email"
                    value={editingMember.socialEmail || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, socialEmail: e.target.value })}
                    placeholder="name@niis.ac.in"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">PHONE NUMBER</label>
                  <input
                    type="text"
                    value={editingMember.phone || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    placeholder="+91 94370 12345"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">SHORT BIOGRAPHY</label>
                <textarea
                  rows={2}
                  value={editingMember.bio || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                  placeholder="Specialization, technical domain, or committee responsibilities..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex items-center gap-4 text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-white/80">
                  <input
                    type="checkbox"
                    checked={editingMember.active !== false}
                    onChange={(e) => setEditingMember({ ...editingMember, active: e.target.checked })}
                    className="rounded text-[#E9B95F]"
                  />
                  <span>Active Member</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
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
          <div className="glass-panel p-6 rounded-3xl max-w-sm w-full border border-red-500/30 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white font-display">Delete Core Member?</h3>
            <p className="text-xs text-white/60 mt-1.5 mb-5">
              Are you sure you want to remove <span className="text-white font-bold">&quot;{deleteConfirm.name}&quot;</span> from the core directory?
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-xl glass-panel text-xs text-white/70 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMember(deleteConfirm.id)}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
