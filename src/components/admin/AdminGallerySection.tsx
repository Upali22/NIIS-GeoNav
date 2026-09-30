import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Calendar, 
  Sparkles, 
  X, 
  Eye, 
  EyeOff, 
  AlertTriangle 
} from 'lucide-react';
import { GalleryItem } from '../../types';

interface AdminGallerySectionProps {
  gallery: GalleryItem[];
  onRefreshData: () => void;
  showStatus: (msg: string) => void;
}

export const AdminGallerySection: React.FC<AdminGallerySectionProps> = ({
  gallery,
  onRefreshData,
  showStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingItem, setEditingItem] = useState<Partial<GalleryItem> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddImage = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditingItem({
      title: '',
      category: 'Campus Architecture',
      date: today,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
      featured: true,
      published: true
    });
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.title || !editingItem.imageUrl) return;
    setIsSubmitting(true);

    try {
      const isExisting = Boolean(editingItem.id);
      const url = isExisting ? `/api/campus/gallery/${editingItem.id}` : '/api/campus/gallery';
      const method = isExisting ? 'PUT' : 'POST';

      const payload = {
        ...editingItem,
        published: editingItem.published !== false
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showStatus(isExisting ? 'Gallery image updated successfully.' : 'Gallery image added successfully.');
        setEditingItem(null);
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

  const handleTogglePublish = async (item: GalleryItem) => {
    try {
      const nextPublished = item.published === false;
      const res = await fetch(`/api/campus/gallery/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, published: nextPublished })
      });
      if (res.ok) {
        showStatus(nextPublished ? `Image "${item.title}" is now published.` : `Image "${item.title}" moved to draft.`);
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/campus/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showStatus('Gallery image deleted successfully.');
        setDeleteConfirm(null);
        onRefreshData();
      } else {
        showStatus('Unable to delete gallery image.');
      }
    } catch (err) {
      console.error(err);
      showStatus('Unable to delete gallery image.');
    }
  };

  const categories = ['all', ...Array.from(new Set(gallery.map(g => g.category)))];

  const filteredGallery = gallery.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Reference Header Pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight font-display">Event Gallery</h2>
          <p className="text-xs text-white/50">Manage photographic moments, architectural archives, sports meets, and student life</p>
        </div>
        <button
          onClick={openAddImage}
          className="px-3.5 py-2 rounded-xl bg-[#E9B95F] text-[#08070B] text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Gallery Image</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search moments by title or event..."
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
          {categories.map(c => (
            <option key={c} value={c}>
              {c === 'all' ? 'All Categories' : c}
            </option>
          ))}
        </select>
      </div>

      {/* Gallery Cards Grid (with Empty State) */}
      {filteredGallery.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
          <ImageIcon className="w-12 h-12 text-white/30 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white font-display">No Gallery Images Yet</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto mt-1 mb-4">
            {searchTerm ? 'No images match your search filter.' : 'Add your first gallery image to display it on the public website.'}
          </p>
          <button
            onClick={openAddImage}
            className="px-4 py-2 rounded-xl bg-[#E9B95F] text-[#08070B] text-xs font-bold inline-flex items-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Gallery Image</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGallery.map(item => (
            <div 
              key={item.id} 
              className={`glass-panel p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                item.published === false ? 'opacity-60 border-white/5' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="relative h-40 w-full rounded-xl overflow-hidden mb-3 border border-white/15 bg-black/40">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FF3FA4]/80 text-white backdrop-blur-md">
                      {item.category}
                    </span>
                    {item.published === false && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-amber-500/80 text-white backdrop-blur-md">
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs font-bold text-white truncate">{item.title}</div>
                <div className="text-[10px] text-white/50 line-clamp-2 mt-1">{item.description}</div>
                <div className="text-[9px] text-[#E9B95F] font-mono mt-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{item.date}</span>
                </div>
              </div>

              {/* Action Buttons: Reference Pattern */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-3">
                <button
                  onClick={() => handleTogglePublish(item)}
                  className={`p-1.5 rounded-lg glass-panel text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                    item.published === false ? 'text-amber-300 hover:text-white' : 'text-white/60 hover:text-white'
                  }`}
                  title={item.published === false ? 'Publish Live' : 'Move to Draft'}
                >
                  {item.published === false ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="text-[10px]">{item.published === false ? 'Draft' : 'Published'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingItem({ ...item })}
                    className="p-1.5 rounded-lg glass-panel hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
                    title="Edit Image"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ id: item.id, title: item.title })}
                    className="p-1.5 rounded-lg glass-panel hover:bg-red-500/20 text-white/70 hover:text-red-400 cursor-pointer transition-colors"
                    title="Delete Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Gallery Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel p-5 sm:p-6 rounded-3xl max-w-lg w-full border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  {editingItem.id ? 'Edit Gallery Image' : 'Add New Gallery Image'}
                </h3>
                <p className="text-[11px] text-white/50">Curate photographic highlights for the public Campus Gallery</p>
              </div>
              <button 
                onClick={() => setEditingItem(null)} 
                className="p-1.5 rounded-xl glass-panel text-white/40 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3.5">
              {/* Image Preview & URL */}
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">IMAGE URL & PREVIEW</label>
                <div className="h-44 w-full rounded-2xl overflow-hidden border border-white/20 mb-2 bg-black/50">
                  <img
                    src={editingItem.imageUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80'}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  type="text"
                  required
                  value={editingItem.imageUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">IMAGE TITLE *</label>
                <input
                  type="text"
                  required
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. Main Academic Block A Golden Hour"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">CATEGORY *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.category || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    placeholder="e.g. Campus Architecture, Sports"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">DATE</label>
                  <input
                    type="date"
                    required
                    value={editingItem.date || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Short caption describing the moment..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex items-center gap-4 text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-white/80">
                  <input
                    type="checkbox"
                    checked={editingItem.published !== false}
                    onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
                    className="rounded text-[#E9B95F]"
                  />
                  <span>Published Live</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white/80">
                  <input
                    type="checkbox"
                    checked={editingItem.featured || false}
                    onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked })}
                    className="rounded text-[#FF3FA4]"
                  />
                  <span>Featured Image</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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
            <h3 className="text-base font-black text-white font-display">Delete Gallery Image?</h3>
            <p className="text-xs text-white/60 mt-1.5 mb-5">
              Are you sure you want to delete <span className="text-white font-bold">&quot;{deleteConfirm.title}&quot;</span>? This will remove it from the public Gallery.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-xl glass-panel text-xs text-white/70 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteItem(deleteConfirm.id)}
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
