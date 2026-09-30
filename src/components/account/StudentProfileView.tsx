import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bookmark, 
  History, 
  Settings, 
  LogOut, 
  MapPin, 
  Navigation, 
  Trash2, 
  Camera, 
  GraduationCap, 
  Check, 
  Clock 
} from 'lucide-react';
import { UserProfile, SavedPlace, NavigationHistoryItem, BuildingData } from '../../types';

interface StudentProfileViewProps {
  user: UserProfile;
  buildings: BuildingData[];
  onLogout: () => void;
  onNavigateToBuilding: (buildingId: string) => void;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  user,
  buildings,
  onLogout,
  onNavigateToBuilding,
  onUpdateProfile
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'history' | 'settings'>('saved');
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [historyItems, setHistoryItems] = useState<NavigationHistoryItem[]>([]);
  const [fullName, setFullName] = useState(user.fullName);
  const [department, setDepartment] = useState(user.department);
  const [profilePic, setProfilePic] = useState(user.profilePic || '');
  const [newPassword, setNewPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedPlaces();
    fetchHistory();
  }, [user.id]);

  const fetchSavedPlaces = async () => {
    try {
      const res = await fetch(`/api/student/saved-places/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setSavedPlaces(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/student/history/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setHistoryItems(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSavedPlace = async (id: string) => {
    try {
      await fetch(`/api/student/saved-places/${id}`, { method: 'DELETE' });
      setSavedPlaces(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearHistory = async () => {
    try {
      await fetch(`/api/student/history/${user.id}`, { method: 'DELETE' });
      setHistoryItems([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/student/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          department,
          profilePic,
          newPassword: newPassword || undefined
        })
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdateProfile(updated);
        setStatusMsg('Profile updated successfully!');
        setNewPassword('');
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Initials Avatar Fallback
  const initials = user.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 pb-28 md:pb-8 animate-fade-in">
      {/* Profile Header Card */}
      <div className="glass-panel rounded-3xl p-6 mb-6 shadow-2xl border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative group">
            {profilePic ? (
              <img
                src={profilePic}
                alt={user.fullName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#FF3FA4] shadow-xl"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#FF3FA4] to-[#E9B95F] flex items-center justify-center text-2xl font-black text-white shadow-xl">
                {initials}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-[#08070B] border border-white/20 text-white/80 hover:text-white cursor-pointer shadow-md">
              <Camera className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
                {user.fullName}
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                user.role === 'teacher' 
                  ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/40' 
                  : 'bg-[#FF3FA4]/20 text-[#FF72BD] border-[#FF3FA4]/40'
              }`}>
                {user.role === 'teacher' ? 'Faculty Mentor' : 'Verified Student'}
              </span>
            </div>
            <p className="text-xs text-white/60 flex items-center gap-1.5 mt-1 font-mono">
              <GraduationCap className="w-3.5 h-3.5 text-[#E9B95F]" />
              <span>{user.department}</span>
              {user.studentId && <span>· ID: {user.studentId}</span>}
            </p>
            <p className="text-[11px] text-white/40 mt-0.5">{user.email}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-300 border border-white/10 hover:border-red-500/30 transition-all text-xs font-semibold cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Teacher Schedule Section (Requirement 29) */}
      {user.role === 'teacher' && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 mb-6 border border-[#00f0ff]/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00f0ff]" />
              <h3 className="text-sm sm:text-base font-black text-white font-display">
                Today&apos;s Lecture & Teaching Schedule
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded-md">
              Faculty Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              {
                subject: 'Advanced Database Systems',
                batch: 'MCA 3rd Semester · Sec A',
                time: '10:00 AM - 11:00 AM',
                buildingId: 'block-a',
                buildingName: 'Block A (Main Admin)',
                room: 'Room A-201',
                floor: 2
              },
              {
                subject: 'Distributed Cloud Architecture',
                batch: 'MCA 3rd Semester · Lab',
                time: '02:00 PM - 03:00 PM',
                buildingId: 'block-c',
                buildingName: 'Block C (Computer Science)',
                room: 'Cloud Computing Lab C-302',
                floor: 3
              },
              {
                subject: 'Graph Theory & Navigation AI',
                batch: 'BCA 2nd Semester',
                time: '03:30 PM - 04:30 PM',
                buildingId: 'block-b',
                buildingName: 'Block B (Academic Wing)',
                room: 'Room B-104',
                floor: 1
              }
            ].map((cls, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#E9B95F] mb-1">
                    <span>{cls.time}</span>
                    <span>Floor {cls.floor}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-tight">{cls.subject}</h4>
                  <p className="text-[11px] text-white/50 mt-0.5">{cls.batch}</p>
                  <p className="text-[11px] text-[#00f0ff] mt-1 font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{cls.buildingName} · {cls.room}</span>
                  </p>
                </div>

                <button
                  onClick={() => onNavigateToBuilding(cls.buildingId)}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#00f0ff]/20 to-[#0099ff]/20 hover:from-[#00f0ff]/30 hover:to-[#0099ff]/30 border border-[#00f0ff]/40 text-[#00f0ff] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[38px]"
                >
                  <Navigation className="w-3.5 h-3.5 fill-current" />
                  <span>Get Directions to Class</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-panel border border-white/10 mb-6">
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'saved' ? 'bg-[#FF3FA4] text-white shadow-lg' : 'text-white/60 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Places ({savedPlaces.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'history' ? 'bg-[#FF3FA4] text-white shadow-lg' : 'text-white/60 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Route History ({historyItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'settings' ? 'bg-[#FF3FA4] text-white shadow-lg' : 'text-white/60 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'saved' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/15">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white font-display">Favorite Campus Places</h3>
            <span className="text-xs text-white/40">Quick-tap to navigate in 3D</span>
          </div>

          {savedPlaces.length === 0 ? (
            <div className="text-center py-10 text-white/40 text-xs">
              No saved places yet. Click the bookmark icon on any building in the 3D map to save it.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedPlaces.map(place => (
                <div
                  key={place.id}
                  className="p-3.5 rounded-2xl glass-panel-subtle border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#FF3FA4]/20 flex items-center justify-center text-[#FF3FA4] shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{place.buildingName}</div>
                      <div className="text-[10px] text-white/50 capitalize">{place.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onNavigateToBuilding(place.buildingId)}
                      className="p-2 rounded-xl bg-gradient-to-r from-[#FF3FA4] to-[#c73570] text-white hover:brightness-110 transition-all cursor-pointer shadow-md"
                      title="Navigate Here"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSavedPlace(place.id)}
                      className="p-2 rounded-xl glass-panel text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/15">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white font-display">Recent Navigation Sessions</h3>
            {historyItems.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
              >
                Clear History
              </button>
            )}
          </div>

          {historyItems.length === 0 ? (
            <div className="text-center py-10 text-white/40 text-xs">
              No recent navigation history recorded.
            </div>
          ) : (
            <div className="space-y-2.5">
              {historyItems.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl glass-panel-subtle border border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-white flex items-center gap-1.5 truncate">
                      <span>{item.fromName}</span>
                      <span className="text-[#00f0ff]">→</span>
                      <span>{item.toName}</span>
                    </div>
                    <div className="text-[10px] text-white/50 flex items-center gap-2 mt-0.5 font-mono">
                      <span>{item.distance} m</span>
                      <span>·</span>
                      <span>{item.estimatedMinutes} min walk</span>
                      <span>·</span>
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/15 max-w-xl mx-auto">
          <h3 className="text-base font-bold text-white font-display mb-4">Account Preferences</h3>

          {statusMsg && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-medium">
              {statusMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
                FULL NAME
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:border-[#FF3FA4]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
                DEPARTMENT
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:border-[#FF3FA4]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
                NEW PASSWORD (LEAVE BLANK TO KEEP UNCHANGED)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:border-[#FF3FA4]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF3FA4] to-[#c73570] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#FF3FA4]/20 transition-all cursor-pointer"
            >
              SAVE CHANGES
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
