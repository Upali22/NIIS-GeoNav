import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  GraduationCap, 
  Calendar, 
  Image as ImageIcon, 
  Users, 
  Bell, 
  Map, 
  Settings as SettingsIcon, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Check, 
  Upload, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Search,
  Navigation
} from 'lucide-react';
import { 
  BuildingData, 
  FacultyMember, 
  CampusEvent, 
  GalleryItem, 
  CoreMember, 
  Announcement, 
  CampusSettings, 
  NavNode, 
  NavEdge 
} from '../../types';
import { AdminBuildingSection } from './AdminBuildingSection';
import { AdminEventsSection } from './AdminEventsSection';
import { AdminGallerySection } from './AdminGallerySection';
import { AdminCoreMembersSection } from './AdminCoreMembersSection';
import { AdminAnnouncementsSection } from './AdminAnnouncementsSection';
import { AdminRoutesSection } from './AdminRoutesSection';

interface AdminPortalProps {
  buildings: BuildingData[];
  faculty: FacultyMember[];
  events: CampusEvent[];
  gallery: GalleryItem[];
  coreMembers: CoreMember[];
  announcements: Announcement[];
  settings: CampusSettings;
  navNodes: NavNode[];
  navEdges: NavEdge[];
  onRefreshData: () => void;
  onClose: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  buildings,
  faculty,
  events,
  gallery,
  coreMembers,
  announcements,
  settings,
  navNodes,
  navEdges,
  onRefreshData,
  onClose
}) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@gmail.com');
  const [adminPassword, setAdminPassword] = useState('email123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'buildings' | 'routes' | 'faculty' | 'events' | 'gallery' | 'core' | 'announcements' | 'settings'>('dashboard');

  // Modals for CRUD
  const [editingFaculty, setEditingFaculty] = useState<Partial<FacultyMember> | null>(null);
  const [facultySearch, setFacultySearch] = useState('');
  const [deleteFacultyConfirm, setDeleteFacultyConfirm] = useState<{ id: string; name: string } | null>(null);
  const [tempSettings, setTempSettings] = useState<CampusSettings>(settings);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Admin login failed');
      }
      setIsAdminLoggedIn(true);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid admin credentials');
    }
  };

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // CRUD Handlers
  const handleSaveFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;
    try {
      const isNew = !editingFaculty.id;
      const url = isNew ? '/api/campus/faculty' : `/api/campus/faculty/${editingFaculty.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFaculty)
      });
      if (res.ok) {
        setEditingFaculty(null);
        onRefreshData();
        showStatus('Faculty record saved successfully!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    try {
      await fetch(`/api/campus/faculty/${id}`, { method: 'DELETE' });
      setDeleteFacultyConfirm(null);
      onRefreshData();
      showStatus('Faculty removed successfully.');
    } catch (e) {
      console.error(e);
      showStatus('Unable to delete faculty member.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/campus/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempSettings)
      });
      if (res.ok) {
        onRefreshData();
        showStatus('Campus settings updated successfully!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // If not logged in, show Admin Login Card
  if (!isAdminLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-xl glass-panel text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#E9B95F] to-[#FF3FA4] p-0.5 mx-auto mb-3 shadow-xl shadow-amber-500/20">
              <div className="w-full h-full bg-[#08070B] rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-[#E9B95F]" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight font-display">
              NIIS Admin CMS
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Secure management portal for 3D campus twins, faculty, events & navigation
            </p>
          </div>

          {loginError && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs text-center font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
                ADMIN EMAIL
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:border-[#E9B95F]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
                SECURE PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:border-[#E9B95F]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#E9B95F] to-[#d5a94f] hover:brightness-110 text-[#08070B] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>AUTHENTICATE & ENTER</span>
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <span className="text-[11px] text-white/40 font-mono">
              Demo Credentials: admin@gmail.com / email123
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Logged-in Admin Dashboard & CMS
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#08070B] text-[#F8EDE2] overflow-hidden animate-fade-in">
      {/* Top Header */}
      <header className="glass-panel border-b border-white/10 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E9B95F] to-[#FF3FA4] p-0.5">
            <div className="w-full h-full bg-[#08070B] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#E9B95F]" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight font-display">
              NIIS GeoNav <span className="text-[#E9B95F]">Admin Console</span>
            </h1>
            <span className="text-[10px] text-white/50 font-mono">Logged in as admin@gmail.com</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {statusMessage && (
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
              {statusMessage}
            </span>
          )}
          <button
            onClick={() => setIsAdminLoggedIn(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/70 hover:text-white border border-white/10 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl glass-panel text-white/60 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Layout: Sidebar + Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 glass-panel border-r border-white/10 p-3 space-y-1 overflow-y-auto shrink-0 hidden md:block">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'buildings', label: 'Buildings & 3D', icon: Building2 },
            { id: 'routes', label: 'GPX Routes (13)', icon: Navigation },
            { id: 'faculty', label: 'Faculty & Pillars', icon: GraduationCap },
            { id: 'events', label: 'Events & Programs', icon: Calendar },
            { id: 'gallery', label: 'Event Gallery', icon: ImageIcon },
            { id: 'core', label: 'Core Members', icon: Users },
            { id: 'announcements', label: 'Announcements', icon: Bell },
            { id: 'settings', label: 'Campus Settings', icon: SettingsIcon },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#E9B95F] text-[#08070B] shadow-md font-bold'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Panel */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight font-display">Campus Analytics</h2>
                <p className="text-xs text-white/50">Overview of active digital twin entities and campus records</p>
              </div>

              {/* Stats Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-2xl border border-white/10">
                  <div className="text-[10px] uppercase font-mono text-white/40 mb-1">TOTAL BUILDINGS</div>
                  <div className="text-3xl font-black text-white font-mono">{buildings.length}</div>
                  <div className="text-[10px] text-[#00f0ff] mt-1">19 3D Models in Scene</div>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-white/10">
                  <div className="text-[10px] uppercase font-mono text-white/40 mb-1">FACULTY & LEADERSHIP</div>
                  <div className="text-3xl font-black text-white font-mono">{faculty.length}</div>
                  <div className="text-[10px] text-[#FF3FA4] mt-1">Guiding Pillars Active</div>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-white/10">
                  <div className="text-[10px] uppercase font-mono text-white/40 mb-1">CAMPUS EVENTS</div>
                  <div className="text-3xl font-black text-white font-mono">{events.length}</div>
                  <div className="text-[10px] text-[#E9B95F] mt-1">{events.filter(e => e.status === 'ongoing').length} Ongoing Today</div>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-white/10">
                  <div className="text-[10px] uppercase font-mono text-white/40 mb-1">NAVIGATION NODES</div>
                  <div className="text-3xl font-black text-white font-mono">{navNodes.length}</div>
                  <div className="text-[10px] text-[#00f0ff] mt-1">{navEdges.length} Walkway Edges</div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="glass-panel rounded-3xl p-6 border border-white/10">
                <h3 className="text-base font-bold text-white font-display mb-3">Quick CMS Operations</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setEditingFaculty({ category: 'faculty', status: 'active', displayOrder: faculty.length + 1 });
                      setActiveTab('faculty');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF3FA4] to-[#c73570] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Teacher / Faculty</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('events')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E9B95F] to-[#d5a94f] text-[#08070B] text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish Campus Event</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-4 py-2.5 rounded-xl glass-panel text-white hover:bg-white/10 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span>Configure Official Address</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Faculty Tab (REFERENCE UI PATTERN) */}
          {activeTab === 'faculty' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight font-display">Faculty & Guiding Pillars</h2>
                  <p className="text-xs text-white/50">Manage leadership, teachers, photos, and department designations</p>
                </div>
                <button
                  onClick={() => setEditingFaculty({ category: 'faculty', status: 'active', displayOrder: faculty.length + 1 })}
                  className="px-3.5 py-2 rounded-xl bg-[#E9B95F] text-[#08070B] text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 transition-all cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Faculty</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search faculty by name, department or designation..."
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs placeholder-white/30"
                />
              </div>

              {/* Faculty Table / Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {faculty
                  .filter(f => 
                    !facultySearch || 
                    f.name.toLowerCase().includes(facultySearch.toLowerCase()) ||
                    f.department.toLowerCase().includes(facultySearch.toLowerCase()) ||
                    f.designation.toLowerCase().includes(facultySearch.toLowerCase())
                  )
                  .map(f => (
                  <div key={f.id} className="glass-panel p-4 rounded-2xl border border-white/10 flex items-start gap-4 hover:border-white/20 transition-all">
                    <img
                      src={f.photo}
                      alt={f.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/20 bg-black/40"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{f.name}</div>
                      <div className="text-[11px] text-[#E9B95F] truncate">{f.designation}</div>
                      <div className="text-[10px] text-white/50 truncate">{f.department}</div>
                      <div className="text-[9px] text-white/40 mt-1 truncate">Office: {f.office}</div>

                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => setEditingFaculty(f)}
                          className="p-1.5 rounded-lg glass-panel hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteFacultyConfirm({ id: f.id, name: f.name })}
                          className="p-1.5 rounded-lg glass-panel hover:bg-red-500/20 text-white/70 hover:text-red-400 cursor-pointer transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <AdminEventsSection 
              events={events} 
              onRefreshData={onRefreshData} 
              showStatus={showStatus} 
            />
          )}

          {/* Buildings & 3D Tab */}
          {activeTab === 'buildings' && (
            <AdminBuildingSection 
              buildings={buildings} 
              onRefreshData={onRefreshData} 
              showStatus={showStatus} 
            />
          )}

          {/* GPX Routes Tab */}
          {activeTab === 'routes' && (
            <AdminRoutesSection 
              onRefreshData={onRefreshData} 
              showStatus={showStatus} 
            />
          )}

          {/* Event Gallery Tab */}
          {activeTab === 'gallery' && (
            <AdminGallerySection 
              gallery={gallery} 
              onRefreshData={onRefreshData} 
              showStatus={showStatus} 
            />
          )}

          {/* Core Members Tab */}
          {activeTab === 'core' && (
            <AdminCoreMembersSection 
              coreMembers={coreMembers} 
              onRefreshData={onRefreshData} 
              showStatus={showStatus} 
            />
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <AdminAnnouncementsSection 
              announcements={announcements} 
              onRefreshData={onRefreshData} 
              showStatus={showStatus} 
            />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="glass-panel rounded-3xl p-6 border border-white/10 max-w-2xl space-y-4">
              <h2 className="text-xl font-black text-white tracking-tight font-display">Official Institutional Settings</h2>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
                    CAMPUS ADDRESS
                  </label>
                  <input
                    type="text"
                    value={tempSettings.address}
                    onChange={(e) => setTempSettings({ ...tempSettings, address: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">CITY</label>
                    <input
                      type="text"
                      value={tempSettings.city}
                      onChange={(e) => setTempSettings({ ...tempSettings, city: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">STATE</label>
                    <input
                      type="text"
                      value={tempSettings.state}
                      onChange={(e) => setTempSettings({ ...tempSettings, state: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">PINCODE</label>
                    <input
                      type="text"
                      value={tempSettings.pincode}
                      onChange={(e) => setTempSettings({ ...tempSettings, pincode: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">PHONE</label>
                    <input
                      type="text"
                      value={tempSettings.phone}
                      onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">EMERGENCY SOS</label>
                    <input
                      type="text"
                      value={tempSettings.emergencyPhone}
                      onChange={(e) => setTempSettings({ ...tempSettings, emergencyPhone: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
                    OFFICIAL WEBSITE
                  </label>
                  <input
                    type="text"
                    value={tempSettings.officialWebsite}
                    onChange={(e) => setTempSettings({ ...tempSettings, officialWebsite: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-[#E9B95F] text-[#08070B] font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Institutional Settings</span>
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Faculty Edit Modal */}
      {editingFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel p-6 rounded-3xl max-w-lg w-full border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white font-display">
                {editingFaculty.id ? 'Edit Faculty Member' : 'Add New Teacher / Guiding Pillar'}
              </h3>
              <button onClick={() => setEditingFaculty(null)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFaculty} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">FULL NAME</label>
                <input
                  type="text"
                  required
                  value={editingFaculty.name || ''}
                  onChange={(e) => setEditingFaculty({ ...editingFaculty, name: e.target.value })}
                  placeholder="e.g. Prof. Rajesh Kumar Mishra"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">DESIGNATION</label>
                  <input
                    type="text"
                    required
                    value={editingFaculty.designation || ''}
                    onChange={(e) => setEditingFaculty({ ...editingFaculty, designation: e.target.value })}
                    placeholder="e.g. Principal & Professor"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">DEPARTMENT</label>
                  <input
                    type="text"
                    required
                    value={editingFaculty.department || ''}
                    onChange={(e) => setEditingFaculty({ ...editingFaculty, department: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">PHOTO URL</label>
                <input
                  type="text"
                  value={editingFaculty.photo || ''}
                  onChange={(e) => setEditingFaculty({ ...editingFaculty, photo: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">OFFICE LOCATION</label>
                  <input
                    type="text"
                    value={editingFaculty.office || ''}
                    onChange={(e) => setEditingFaculty({ ...editingFaculty, office: e.target.value })}
                    placeholder="e.g. Block A, Room 102"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">EMAIL</label>
                  <input
                    type="email"
                    value={editingFaculty.email || ''}
                    onChange={(e) => setEditingFaculty({ ...editingFaculty, email: e.target.value })}
                    placeholder="teacher@niisgroup.org"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">SHORT BIO</label>
                <textarea
                  rows={2}
                  value={editingFaculty.bio || ''}
                  onChange={(e) => setEditingFaculty({ ...editingFaculty, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFaculty(null)}
                  className="px-4 py-2 rounded-xl glass-panel text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E9B95F] text-[#08070B] text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Faculty Delete Confirmation Modal */}
      {deleteFacultyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl max-w-sm w-full border border-red-500/30 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white font-display">Delete Faculty Record?</h3>
            <p className="text-xs text-white/60 mt-1.5 mb-5">
              Are you sure you want to delete <span className="text-white font-bold">&quot;{deleteFacultyConfirm.name}&quot;</span> from the guiding pillars registry?
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteFacultyConfirm(null)}
                className="flex-1 py-2 rounded-xl glass-panel text-xs text-white/70 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFaculty(deleteFacultyConfirm.id)}
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
