import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Calendar, 
  Clock, 
  Sparkles, 
  X, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  Flame,
  AlertCircle
} from 'lucide-react';
import { Announcement } from '../../types';

interface AdminAnnouncementsSectionProps {
  announcements: Announcement[];
  onRefreshData: () => void;
  showStatus: (msg: string) => void;
}

export const AdminAnnouncementsSection: React.FC<AdminAnnouncementsSectionProps> = ({
  announcements,
  onRefreshData,
  showStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<Announcement> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddAnnouncement = () => {
    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    setEditingAnnouncement({
      title: '',
      description: '',
      category: 'General Notice',
      priority: 'Normal',
      date: today,
      expiryDate: expiry,
      active: true,
      urgent: false,
      featured: false,
      published: true
    });
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement || !editingAnnouncement.title) return;
    setIsSubmitting(true);

    try {
      const isExisting = Boolean(editingAnnouncement.id);
      const url = isExisting ? `/api/campus/announcements/${editingAnnouncement.id}` : '/api/campus/announcements';
      const method = isExisting ? 'PUT' : 'POST';

      const payload = {
        ...editingAnnouncement,
        active: editingAnnouncement.active !== false,
        urgent: editingAnnouncement.priority === 'Urgent' || Boolean(editingAnnouncement.urgent),
        published: editingAnnouncement.active !== false
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showStatus(isExisting ? 'Announcement updated successfully.' : 'Announcement added successfully.');
        setEditingAnnouncement(null);
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

  const handleToggleActive = async (ann: Announcement) => {
    try {
      const nextActive = !ann.active;
      const res = await fetch(`/api/campus/announcements/${ann.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ann, active: nextActive, published: nextActive })
      });
      if (res.ok) {
        showStatus(nextActive ? `Announcement "${ann.title}" published.` : `Announcement "${ann.title}" hidden.`);
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`/api/campus/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showStatus('Announcement deleted successfully.');
        setDeleteConfirm(null);
        onRefreshData();
      } else {
        showStatus('Unable to delete announcement.');
      }
    } catch (err) {
      console.error(err);
      showStatus('Unable to delete announcement.');
    }
  };

  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch = 
      ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ann.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || ann.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || 
      (priorityFilter === 'Urgent' && (ann.urgent || ann.priority === 'Urgent')) ||
      (priorityFilter === 'Normal' && !ann.urgent && ann.priority !== 'Urgent');
    return matchesSearch && matchesCategory && matchesPriority;
  });

  return (
    <div className="space-y-4">
      {/* Reference Header Pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight font-display">Campus Announcements</h2>
          <p className="text-xs text-white/50">Publish exam notices, holiday alerts, event broadcasts, and emergency notifications</p>
        </div>
        <button
          onClick={openAddAnnouncement}
          className="px-3.5 py-2 rounded-xl bg-[#E9B95F] text-[#08070B] text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Announcement</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search announcements by title or content..."
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
          <option value="all">All Notice Types</option>
          <option value="General Notice">General Notice</option>
          <option value="Exam Notice">Exam Notice</option>
          <option value="Holiday">Holiday</option>
          <option value="Campus Event">Campus Event</option>
          <option value="Workshop">Workshop</option>
          <option value="Emergency">Emergency</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 rounded-xl glass-input text-xs bg-[#171019] text-white w-full sm:w-auto"
        >
          <option value="all">All Priorities</option>
          <option value="Urgent">Urgent / Important</option>
          <option value="Normal">Normal</option>
        </select>
      </div>

      {/* Announcement Cards Grid */}
      {filteredAnnouncements.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
          <Bell className="w-12 h-12 text-white/30 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white font-display">No Announcements Yet</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto mt-1 mb-4">
            {searchTerm ? 'No notices match your current search.' : 'Create your first campus bulletin or broadcast notice.'}
          </p>
          <button
            onClick={openAddAnnouncement}
            className="px-4 py-2 rounded-xl bg-[#E9B95F] text-[#08070B] text-xs font-bold inline-flex items-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Announcement</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnnouncements.map(ann => (
            <div 
              key={ann.id} 
              className={`glass-panel p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                !ann.active ? 'opacity-60 border-white/5' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-white/10 text-white/80">
                    {ann.category}
                  </span>
                  <div className="flex items-center gap-1">
                    {(ann.urgent || ann.priority === 'Urgent') && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        <span>URGENT</span>
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                      ann.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/40'
                    }`}>
                      {ann.active ? 'Published' : 'Hidden'}
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-white mb-1.5">{ann.title}</h4>
                <p className="text-[10px] text-white/60 line-clamp-3 mb-3">{ann.description}</p>

                <div className="flex items-center justify-between text-[9px] text-white/40 font-mono pt-1">
                  <span>Issued: {ann.date}</span>
                  {ann.expiryDate && <span>Expires: {ann.expiryDate}</span>}
                </div>
              </div>

              {/* Action Buttons: Reference Pattern */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-3">
                <button
                  onClick={() => handleToggleActive(ann)}
                  className={`p-1.5 rounded-lg glass-panel text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                    !ann.active ? 'text-amber-300 hover:text-white' : 'text-white/60 hover:text-white'
                  }`}
                  title={ann.active ? 'Unpublish / Hide' : 'Publish Live'}
                >
                  {!ann.active ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="text-[10px]">{ann.active ? 'Live' : 'Hidden'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingAnnouncement({ ...ann })}
                    className="p-1.5 rounded-lg glass-panel hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
                    title="Edit Announcement"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ id: ann.id, title: ann.title })}
                    className="p-1.5 rounded-lg glass-panel hover:bg-red-500/20 text-white/70 hover:text-red-400 cursor-pointer transition-colors"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Announcement Modal */}
      {editingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel p-5 sm:p-6 rounded-3xl max-w-lg w-full border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  {editingAnnouncement.id ? 'Edit Announcement' : 'Create New Announcement'}
                </h3>
                <p className="text-[11px] text-white/50">Notice will appear in Campus Status Center and Notification Center</p>
              </div>
              <button 
                onClick={() => setEditingAnnouncement(null)} 
                className="p-1.5 rounded-xl glass-panel text-white/40 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">NOTICE TITLE *</label>
                <input
                  type="text"
                  required
                  value={editingAnnouncement.title || ''}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                  placeholder="e.g. Schedule for Mid-Term Examination 2026"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">TYPE / CATEGORY *</label>
                  <select
                    value={editingAnnouncement.category || 'General Notice'}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-[#171019] text-white"
                  >
                    <option value="General Notice">General Notice</option>
                    <option value="Exam Notice">Exam Notice</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Campus Event">Campus Event</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Emergency">Emergency Notice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">PRIORITY</label>
                  <select
                    value={editingAnnouncement.priority || (editingAnnouncement.urgent ? 'Urgent' : 'Normal')}
                    onChange={(e) => setEditingAnnouncement({ 
                      ...editingAnnouncement, 
                      priority: e.target.value as any,
                      urgent: e.target.value === 'Urgent'
                    })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-[#171019] text-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent / Emergency</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">PUBLICATION DATE</label>
                  <input
                    type="date"
                    required
                    value={editingAnnouncement.date || ''}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">EXPIRY DATE</label>
                  <input
                    type="date"
                    value={editingAnnouncement.expiryDate || ''}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">ANNOUNCEMENT TEXT</label>
                <textarea
                  rows={3}
                  required
                  value={editingAnnouncement.description || ''}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, description: e.target.value })}
                  placeholder="Full text of notification, guidelines, or instructions..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex items-center gap-4 text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-white/80">
                  <input
                    type="checkbox"
                    checked={editingAnnouncement.active !== false}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, active: e.target.checked })}
                    className="rounded text-[#E9B95F]"
                  />
                  <span>Active & Published</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white/80">
                  <input
                    type="checkbox"
                    checked={editingAnnouncement.urgent || false}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, urgent: e.target.checked })}
                    className="rounded text-red-500"
                  />
                  <span>Highlight as Urgent</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingAnnouncement(null)}
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
            <h3 className="text-base font-black text-white font-display">Delete Announcement?</h3>
            <p className="text-xs text-white/60 mt-1.5 mb-5">
              Are you sure you want to delete <span className="text-white font-bold">&quot;{deleteConfirm.title}&quot;</span>? This will remove it from all public bulletin boards.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-xl glass-panel text-xs text-white/70 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAnnouncement(deleteConfirm.id)}
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
