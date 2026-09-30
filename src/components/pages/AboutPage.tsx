import React from 'react';
import { CampusSettings, CoreMember, Announcement } from '../../types';
import { 
  Building2, 
  Compass, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldAlert, 
  Globe, 
  Target, 
  Eye, 
  HeartHandshake, 
  Users, 
  ExternalLink,
  Bell,
  Flame
} from 'lucide-react';

interface AboutPageProps {
  settings: CampusSettings;
  coreMembers: CoreMember[];
  announcements?: Announcement[];
  onNavigateHome: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  settings,
  coreMembers,
  announcements = [],
  onNavigateHome
}) => {
  const activeAnnouncements = announcements.filter(a => a.active !== false);
  return (
    <div className="desktop-container py-6 sm:py-8 animate-fade-in">
      {/* Hero Brand Section */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/15 shadow-2xl mb-12 text-center relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[#FF3FA4]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-[#E9B95F]/15 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF3FA4]/15 border border-[#FF3FA4]/30 text-[#FF72BD] text-xs font-semibold mb-4">
          <Compass className="w-3.5 h-3.5" />
          <span>NIIS GeoNav 3D Spatial Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display mb-3">
          About NIIS Bhubaneswar
        </h1>

        <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto leading-relaxed mb-6 font-light">
          {settings.aboutText}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-white/60">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#FF3FA4]" />
            <span>{settings.address}, {settings.city}, {settings.state} - {settings.pincode}</span>
          </span>
          <span>·</span>
          <a 
            href="https://maps.app.goo.gl/WHGQ9qHsF8RjufRm9" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#00f0ff] hover:underline"
          >
            <span>View on Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Mission & Vision & Values Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-[#FF3FA4]/20 text-[#FF3FA4] flex items-center justify-center mb-4">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white font-display mb-2">Our Mission</h3>
          <p className="text-xs text-white/70 leading-relaxed">
            {settings.mission}
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-[#E9B95F]/20 text-[#E9B95F] flex items-center justify-center mb-4">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white font-display mb-2">Our Vision</h3>
          <p className="text-xs text-white/70 leading-relaxed">
            {settings.vision}
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-[#00f0ff]/20 text-[#00f0ff] flex items-center justify-center mb-4">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white font-display mb-2">Core Values</h3>
          <p className="text-xs text-white/70 leading-relaxed">
            Academic rigor, inclusive accessibility, cultural heritage rooted in Odisha's proud traditions, and cutting-edge technological inquiry.
          </p>
        </div>
      </div>

      {/* Active Campus Bulletins & Announcements */}
      {activeAnnouncements.length > 0 && (
        <div className="mb-12">
          <div className="text-center max-w-xl mx-auto mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9B95F]/15 border border-[#E9B95F]/30 text-[#E9B95F] text-xs font-semibold mb-2">
              <Bell className="w-3.5 h-3.5" />
              <span>Official Bulletins</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight font-display">
              Campus Announcements & Notices
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAnnouncements.map(ann => (
              <div 
                key={ann.id}
                className="glass-panel rounded-2xl p-4 border border-white/10 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-white/10 text-white/80">
                      {ann.category}
                    </span>
                    {(ann.urgent || ann.priority === 'Urgent') && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        <span>URGENT</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">{ann.title}</h4>
                  <p className="text-[11px] text-white/60 line-clamp-3 mb-3">{ann.description}</p>
                </div>
                <div className="text-[9px] text-[#E9B95F] font-mono border-t border-white/5 pt-2 flex justify-between">
                  <span>Issued: {ann.date}</span>
                  {ann.expiryDate && <span>Valid till: {ann.expiryDate}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Members Section */}
      {coreMembers.length > 0 && (
        <div className="mb-12">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight font-display">
              Our Core Project Members
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Developers, spatial architects, and student innovators behind NIIS GeoNav
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreMembers.map(member => (
              <div 
                key={member.id}
                className="glass-panel rounded-3xl p-5 border border-white/10 shadow-xl flex items-center gap-4"
              >
                <img
                  src={member.photo}
                  alt={member.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover border border-white/20 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=80';
                  }}
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-white font-display truncate">{member.name}</h4>
                  <div className="text-[11px] text-[#E9B95F] font-semibold truncate">{member.role}</div>
                  <div className="text-[10px] text-white/50 truncate">{member.department}</div>
                  <p className="text-[11px] text-white/70 line-clamp-2 mt-1">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Institutional Contact Section */}
      <div className="glass-panel rounded-3xl p-8 border border-white/15 shadow-2xl mb-12">
        <h3 className="text-xl font-black text-white font-display mb-6">
          Official Institutional Contact Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-2xl glass-panel-subtle border border-white/10">
            <MapPin className="w-5 h-5 text-[#FF3FA4] mb-2" />
            <div className="text-xs font-bold text-white font-display">Campus Location</div>
            <div className="text-[11px] text-white/60 mt-1">{settings.address}</div>
            <div className="text-[11px] text-white/60">{settings.city}, {settings.state} - {settings.pincode}</div>
          </div>

          <div className="p-4 rounded-2xl glass-panel-subtle border border-white/10">
            <Phone className="w-5 h-5 text-[#E9B95F] mb-2" />
            <div className="text-xs font-bold text-white font-display">Phone & Reception</div>
            <div className="text-[11px] text-white/80 font-mono mt-1">{settings.phone}</div>
            <div className="text-[10px] text-white/40 mt-1">Mon-Sat, 9:00 AM - 5:00 PM</div>
          </div>

          <div className="p-4 rounded-2xl glass-panel-subtle border border-white/10">
            <Mail className="w-5 h-5 text-[#00f0ff] mb-2" />
            <div className="text-xs font-bold text-white font-display">Official Email</div>
            <div className="text-[11px] text-white/80 font-mono mt-1 truncate">{settings.email}</div>
            <div className="text-[10px] text-white/40 mt-1">General Inquiries & Admissions</div>
          </div>

          <div className="p-4 rounded-2xl glass-panel-subtle border border-red-500/20 bg-red-500/5">
            <ShieldAlert className="w-5 h-5 text-red-400 mb-2" />
            <div className="text-xs font-bold text-red-300 font-display">Emergency & SOS</div>
            <div className="text-[11px] text-white/80 font-mono mt-1">{settings.emergencyPhone}</div>
            <div className="text-[10px] text-red-300/60 mt-1">24/7 Security Desk</div>
          </div>
        </div>
      </div>

      {/* Premium Footer */}
      <footer className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#FF3FA4]" />
          <span className="font-bold text-white font-display">NIIS GeoNav</span>
          <span>·</span>
          <span>{settings.tagline}</span>
        </div>

        <div className="flex items-center gap-6">
          <a href={settings.officialWebsite} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Official Website
          </a>
          <a href="https://maps.app.goo.gl/WHGQ9qHsF8RjufRm9" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Campus Coordinates
          </a>
          <span>© {new Date().getFullYear()} NIIS Group of Institutions</span>
        </div>
      </footer>
    </div>
  );
};
