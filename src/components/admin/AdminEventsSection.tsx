import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye, 
  EyeOff, 
  MapPin, 
  Clock, 
  Sparkles, 
  X, 
  ExternalLink,
  AlertTriangle 
} from 'lucide-react';
import { CampusEvent } from '../../types';

interface AdminEventsSectionProps {
  events: CampusEvent[];
  onRefreshData: () => void;
  showStatus: (msg: string) => void;
}

export const AdminEventsSection: React.FC<AdminEventsSectionProps> = ({
  events,
  onRefreshData,
  showStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingEvent, setEditingEvent] = useState<Partial<CampusEvent> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddEvent = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditingEvent({
      title: '',
      description: '',
      category: 'Academic',
      status: 'upcoming',
      startDate: today,
      endDate: today,
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      venue: 'Block E Main Auditorium',
      organizer: 'NIIS Innovation Council',
      bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80',
      registrationLink: 'https://forms.gle/niis-event',
      featured: true,
      published: true
    });
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editingEvent.title) return;
    setIsSubmitting(true);

    try {
      const isExisting = Boolean(editingEvent.id);
      const url = isExisting ? `/api/campus/events/${editingEvent.id}` : '/api/campus/events';
      const method = isExisting ? 'PUT' : 'POST';

      const payload = {
        ...editingEvent,
        published: editingEvent.published !== false
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showStatus(isExisting ? 'Event updated successfully.' : 'Event added successfully.');
        setEditingEvent(null);
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

  const handleTogglePublish = async (ev: CampusEvent) => {
    try {
      const nextPublished = ev.published === false;
      const res = await fetch(`/api/campus/events/${ev.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ev, published: nextPublished })
      });
      if (res.ok) {
        showStatus(nextPublished ? `Event "${ev.title}" is now published.` : `Event "${ev.title}" moved to draft.`);
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/campus/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showStatus('Event deleted successfully.');
        setDeleteConfirm(null);
        onRefreshData();
      } else {
        showStatus('Unable to delete event.');
      }
    } catch (err) {
      console.error(err);
      showStatus('Unable to delete event.');
    }
  };

  const filteredEvents = events.filter(ev => {
    const matchesSearch = 
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || ev.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || ev.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Reference Header Pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight font-display">Events & Programs</h2>
          <p className="text-xs text-white/50">Manage ongoing tech fests, cultural symposiums, workshops, and dates</p>
        </div>
        <button
          onClick={openAddEvent}
          className="px-3.5 py-2 rounded-xl bg-[#E9B95F] text-[#08070B] text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Event</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search events by title, venue or topic..."
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
          <option value="Academic">Academic</option>
          <option value="Cultural">Cultural</option>
          <option value="Technical">Technical</option>
          <option value="Workshop">Workshop</option>
          <option value="Hackathon">Hackathon</option>
          <option value="Sports">Sports</option>
          <option value="Festival">Festival</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl glass-input text-xs bg-[#171019] text-white w-full sm:w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="ongoing">Ongoing</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Event Cards Grid */}
      {filteredEvents.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
          <Calendar className="w-12 h-12 text-white/30 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white font-display">No Events Found</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto mt-1 mb-4">
            {searchTerm ? 'No campus events match your filter.' : 'Add your first event to showcase on the public website.'}
          </p>
          <button
            onClick={openAddEvent}
            className="px-4 py-2 rounded-xl bg-[#E9B95F] text-[#08070B] text-xs font-bold inline-flex items-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Event</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map(ev => (
            <div 
              key={ev.id} 
              className={`glass-panel p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                ev.published === false ? 'opacity-60 border-white/5' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex gap-4 items-start mb-3">
                  <img
                    src={ev.bannerImage}
                    alt={ev.title}
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 rounded-xl object-cover shrink-0 border border-white/20 bg-black/40"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        ev.status === 'ongoing' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {ev.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/10 text-white/70">
                        {ev.category}
                      </span>
                      {ev.published === false && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300">
                          Draft
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white mt-1.5 truncate">{ev.title}</h4>
                    <p className="text-[10px] text-white/60 line-clamp-2 mt-1">{ev.description}</p>
                    <div className="text-[9px] text-[#E9B95F] mt-2 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span>{ev.startDate} · {ev.venue}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Reference Pattern */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <button
                  onClick={() => handleTogglePublish(ev)}
                  className={`p-1.5 rounded-lg glass-panel text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                    ev.published === false ? 'text-amber-300 hover:text-white' : 'text-white/60 hover:text-white'
                  }`}
                  title={ev.published === false ? 'Publish Event' : 'Unpublish Event'}
                >
                  {ev.published === false ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="text-[10px]">{ev.published === false ? 'Draft' : 'Published'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingEvent({ ...ev })}
                    className="p-1.5 rounded-lg glass-panel hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
                    title="Edit Event"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ id: ev.id, title: ev.title })}
                    className="p-1.5 rounded-lg glass-panel hover:bg-red-500/20 text-white/70 hover:text-red-400 cursor-pointer transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel p-5 sm:p-6 rounded-3xl max-w-xl w-full border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  {editingEvent.id ? 'Edit Campus Event' : 'Publish New Campus Event'}
                </h3>
                <p className="text-[11px] text-white/50">Details will be published to the public Events page and live calendar</p>
              </div>
              <button 
                onClick={() => setEditingEvent(null)} 
                className="p-1.5 rounded-xl glass-panel text-white/40 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3.5">
              {/* Banner Preview */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">BANNER IMAGE & PREVIEW</label>
                <div className="flex gap-3 items-center">
                  <img
                    src={editingEvent.bannerImage || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80'}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-24 h-16 rounded-xl object-cover border border-white/20 shrink-0 bg-black/50"
                  />
                  <input
                    type="text"
                    required
                    value={editingEvent.bannerImage || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, bannerImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">EVENT TITLE *</label>
                <input
                  type="text"
                  required
                  value={editingEvent.title || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  placeholder="e.g. TechnoSparks Hackathon 2026"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">CATEGORY *</label>
                  <select
                    value={editingEvent.category || 'Academic'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-[#171019] text-white"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Technical">Technical</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Sports">Sports</option>
                    <option value="Festival">Festival</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">STATUS</label>
                  <select
                    value={editingEvent.status || 'upcoming'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-[#171019] text-white"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">START DATE *</label>
                  <input
                    type="date"
                    required
                    value={editingEvent.startDate || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">END DATE</label>
                  <input
                    type="date"
                    value={editingEvent.endDate || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">VENUE *</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.venue || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                    placeholder="e.g. Block E Auditorium"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">ORGANIZER</label>
                  <input
                    type="text"
                    value={editingEvent.organizer || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, organizer: e.target.value })}
                    placeholder="e.g. NIIS Student Council"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">REGISTRATION LINK</label>
                <input
                  type="text"
                  value={editingEvent.registrationLink || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, registrationLink: e.target.value })}
                  placeholder="https://forms.gle/..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  placeholder="Brief synopsis of event objectives and schedule..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex items-center gap-4 text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-white/80">
                  <input
                    type="checkbox"
                    checked={editingEvent.published !== false}
                    onChange={(e) => setEditingEvent({ ...editingEvent, published: e.target.checked })}
                    className="rounded text-[#E9B95F]"
                  />
                  <span>Published Live</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white/80">
                  <input
                    type="checkbox"
                    checked={editingEvent.featured || false}
                    onChange={(e) => setEditingEvent({ ...editingEvent, featured: e.target.checked })}
                    className="rounded text-[#FF3FA4]"
                  />
                  <span>Featured Event</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
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
            <h3 className="text-base font-black text-white font-display">Delete Event?</h3>
            <p className="text-xs text-white/60 mt-1.5 mb-5">
              Are you sure you want to delete <span className="text-white font-bold">&quot;{deleteConfirm.title}&quot;</span>? This will remove it from the public Events page.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-xl glass-panel text-xs text-white/70 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEvent(deleteConfirm.id)}
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
